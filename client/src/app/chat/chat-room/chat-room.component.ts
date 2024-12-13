import { NgClass, NgFor, NgIf } from "@angular/common";
import { Component, OnInit, ViewChild, ElementRef, input, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from "@angular/forms";

import { MatIconModule } from "@angular/material/icon";
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';

import { AuthService, ChatService, FileService } from "@app/services";
import { ConfirmMessageDto, FileConfirmMessageDto, MessageDto, UserDto } from "@app/models";
import { ChatRoomHeaderComponent } from "./chat-room-header";
import { Observable } from "rxjs";
import { toObservable } from "@angular/core/rxjs-interop";

@Component({
  selector: 'app-chat-room',
  standalone: true,
  imports: [
    NgIf,
    FormsModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDividerModule,
    ChatRoomHeaderComponent
  ],
  templateUrl: './chat-room.component.html',
  styleUrls: ['./chat-room.component.scss'],
})
export class ChatRoomComponent implements OnInit {
  readonly selectedUser = input.required<UserDto>(); // Receiver's info

  readonly _authSvc = inject(AuthService);

  @ViewChild('messageList') messageList!: ElementRef;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  messages = signal<MessageDto[]>([]);
  loading = signal(false);

  newMessage: string = '';
  userId = signal(+this._authSvc.getUser()!.id); // Replace with actual logged-in user ID
  page: number = 1;

  constructor(private chatService: ChatService, private fileService: FileService) {
  }
  ngOnInit(): void {
    this.loadChatHistory();
  }

  loadChatHistory(): void {
    if (this.loading()) return;

    this.loading.set(true);
    this.chatService.getChatHistory(this.selectedUser().id, this.page).subscribe((messages) => {
      for (const msg of messages) {
        if (msg.filePath) {
          msg.filePath = this.chatService.toCdnFile(msg.filePath);
        }
      }
      this.messages.set(messages);
      this.loading.set(false);

      this.page++;
      // Scroll to the bottom after loading initial history
      setTimeout(() => this.scrollToBottom(), 100);
    });
  }

  sendMessage(): void {
    if (!this.newMessage.trim()) return;

    let sendObs$: Observable<ConfirmMessageDto | FileConfirmMessageDto> | undefined = undefined;
    const messageData: MessageDto = {
      senderId: this.userId(),
      receiverId: this.selectedUser().id,
      content: this.newMessage,
      status: 0
    };

    const file = this.getFile();
    if (file) {
      const form = new FormData();
      form.append("file", file, file.name);
      form.append("senderId", messageData.senderId!.toString());
      form.append("receiverId", messageData.receiverId!.toString());
      form.append("content", messageData.content!.toString());
      sendObs$ = this.chatService.sendFile(form);
    } else {
      sendObs$ = this.chatService.sendMessage(messageData);
    }

    sendObs$?.subscribe((_newMsg) => {
      messageData.id = _newMsg.messageId;
      messageData.timestamp = _newMsg.timestamp;
      if ((_newMsg as FileConfirmMessageDto).filePath) {
        messageData.filePath = this.chatService.toCdnFile((_newMsg as FileConfirmMessageDto).filePath);
      }
      messageData.status = 1;
      this.messages.update(_msgs => {
        _msgs.push(messageData);
        return Array.from(_msgs);
      });
      this.newMessage = '';
      this.clearFile();
      this.scrollToBottom();
    });
  }

  getFile(): File | undefined {
    const files = this.fileInput.nativeElement.files;
    if (files == null || files.length == 0)
      return undefined;

    return files[0];
  }

  clearFile() {
    this.fileInput.nativeElement.files = null;
  }

  isImage(filePath?: string): boolean {
    return Boolean(filePath && /\.(jpg|jpeg|png|gif)$/i.test(filePath));
  }

  isVideo(filePath?: string): boolean {
    return Boolean(filePath && /\.(mp4|webm|ogg)$/i.test(filePath));
  }

  formatTimestamp(timestamp: string): string {
    const date = new Date(timestamp);
    return `${date.getHours()}:${date.getMinutes()}`;
  }

  scrollToBottom(): void {
    const el = this.messageList?.nativeElement;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }
}
