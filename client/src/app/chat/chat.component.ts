import { Component } from '@angular/core';
import { MatCardModule } from "@angular/material/card";

import { ChatListComponent } from "./chat-list/chat-list.component";
import { ChatRoomComponent } from "./chat-room/chat-room.component";
import { MenuComponent } from "./menu/menu.component";
import { AsyncPipe } from "@angular/common";
import { ChatEmptyComponent } from "./chat-empty/chat-empty.component";

@Component({
  selector: 'app-chat',
  imports: [
    AsyncPipe,
    MatCardModule,
    ChatListComponent,
    ChatRoomComponent,
    ChatEmptyComponent
  ],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss'
})
export class ChatComponent {
  selectedUser: any;

  onUserSelected(user: any) {
    this.selectedUser = user;
  }
}
