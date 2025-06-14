import { NgClass, NgFor, NgIf } from "@angular/common";
import { Component, OnInit, ViewChild, ElementRef, input, inject, signal, viewChild, DestroyRef } from '@angular/core';
import { FormsModule } from "@angular/forms";
import { takeUntilDestroyed, toObservable } from "@angular/core/rxjs-interop";
import { Observable, pipe } from "rxjs";

import { MatIconModule } from "@angular/material/icon";
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatBadgeModule } from '@angular/material/badge';

import { AuthService, ChatService, FileService, WebSocketService } from "@app/services";
import { ConfirmMessageDto, FileConfirmMessageDto, MessageDto, snackSuccess, UserDto } from "@app/models";
import { ChatRoomHeaderComponent } from "./chat-room-header";
import { MatSnackBar, MatSnackBarModule } from "@angular/material/snack-bar";
import { DateTimeFormatPipe } from "@app/pipes";

@Component({
  selector: 'app-chat-room',
  standalone: true,
  imports: [
    FormsModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDividerModule,
    MatBadgeModule,
    MatSnackBarModule,
    ChatRoomHeaderComponent,
    DateTimeFormatPipe
  ],
  templateUrl: './chat-room.component.html',
  styleUrls: ['./chat-room.component.scss'],
})
export class ChatRoomComponent implements OnInit {

  readonly _snackBar = inject(MatSnackBar);

  readonly selectedUser = input.required<UserDto>(); // Receiver's info

  readonly _authSvc = inject(AuthService);

  @ViewChild('messageList') messageList!: ElementRef;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  messages = signal<MessageDto[]>([]);
  loading = signal(false);
  isSending = signal(false);

  newMessage: string = '';
  userId = signal(+this._authSvc.getUser()!.id); // Replace with actual logged-in user ID
  page: number = 1;

  _wsSvc = inject(WebSocketService);
  destroyRef = inject(DestroyRef);

  constructor(private chatService: ChatService, private fileService: FileService) {

    toObservable(this.selectedUser).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => {
      this.page = 1;
      this.loadChatHistory();
    });
  }
  ngOnInit(): void {
    this.loadChatHistory();

    this._wsSvc.message$.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: msg => {
        if (msg.senderId != this.selectedUser().id) {
          return;
        }
        if (msg.filePath) {
          msg.filePath = this.chatService.toCdnFile(msg.filePath);
        }
        this.messages.update(_msgs => {
          _msgs.push(msg);
          return Array.from(_msgs);
        });

        this.scrollToBottom();
      }
    });
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
      this.scrollToBottom();
    });
  }

  sendMessage(): void {

    if (this.isSending())
      return;

    this.isSending.set(true);

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
    } else if (this.newMessage.trim()) {
      sendObs$ = this.chatService.sendMessage(messageData);
    }

    if (sendObs$) {
      sendObs$.subscribe({
        next: (_newMsg) => {
          this.isSending.set(false);

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
        },
        error: () => {
          this.isSending.set(false);
        }
      });
    } else {
      this.isSending.set(false);
    }
  }

  getFile(): File | undefined {
    const files = this.fileInput.nativeElement.files;
    if (files == null || files.length == 0)
      return undefined;

    return files[0];
  }

  deleteMessage(message: MessageDto, index: number) {
    this.chatService.deleteChat(message.id!).subscribe(
      {
        next: () => {
          this.messages().splice(index, 1);
          this.messages.update(v => Array.from(v));

          this._snackBar.open("حذف با موفقیت انجام شد.", "", snackSuccess);
        }
      }
    );
  }

  clearFile() {
    this.fileInput.nativeElement.value = "";
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
    setTimeout(() => {
      const el = this.messageList?.nativeElement;
      if (el) {
        el.scrollTop = el.scrollHeight;
      }
    }, 250);
  }
}
