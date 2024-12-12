import { NgClass, NgFor, NgIf } from "@angular/common";
import { Component, OnInit, ViewChild, ElementRef, input, inject } from '@angular/core';
import { FormsModule } from "@angular/forms";

import { MatIconModule } from "@angular/material/icon";
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';

import { AuthService, ChatService, FileService } from "@app/services";
import { MessageDto, UserDto } from "@app/models";
import { ChatRoomHeaderComponent } from "./chat-room-header";

@Component({
  selector: 'app-chat-room',
  standalone: true,
  imports: [
    NgFor,
    NgClass,
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

  messages: any[] = [];
  newMessage: string = '';
  currentUserId: string = '123'; // Replace with actual logged-in user ID
  page: number = 1;
  loading: boolean = false;

  constructor(private chatService: ChatService, private fileService: FileService) { }

  ngOnInit(): void {
    // this.loadChatHistory();
  }

  loadChatHistory(): void {
    if (this.loading) return;

    this.loading = true;
    this.chatService.getChatHistory(this.selectedUser().id, this.page).subscribe((history) => {
      this.messages = [...history.reverse(), ...this.messages];
      this.page++;
      this.loading = false;

      // Scroll to the bottom after loading initial history
      setTimeout(() => this.scrollToBottom(), 100);
    });
  }

  sendMessage(): void {
    if (!this.newMessage.trim()) return;

    const messageData: MessageDto = {
      senderId: this._authSvc.getUser().id,
      receiverId: this.selectedUser().id,
      content: this.newMessage,
    };

    // this.chatService.sendMessage(messageData).subscribe((newMessage) => {
    var newMessage = messageData;
    this.messages.unshift({ ...newMessage, isSent: true });
    this.newMessage = '';
    this.scrollToBottom();
    // });
  }

  uploadFile(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    this.fileService.uploadFile(file).subscribe((filePath: string) => {
      const messageData = {
        senderId: this.currentUserId,
        receiverId: this.selectedUser().id,
        content: '',
        filePath,
      };

      this.chatService.sendMessage(messageData).subscribe((newMessage) => {
        this.messages.push({ ...newMessage, isSent: true });
        this.scrollToBottom();
      });
    });
  }

  isImage(filePath: string): boolean {
    return /\.(jpg|jpeg|png|gif)$/i.test(filePath);
  }

  isVideo(filePath: string): boolean {
    return /\.(mp4|webm|ogg)$/i.test(filePath);
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
