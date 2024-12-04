import { Component } from '@angular/core';
import { MatToolbar } from "@angular/material/toolbar";

import { ChatListComponent } from "./chat-list/chat-list.component";
import { ChatRoomComponent } from "./chat-room/chat-room.component";
import { MenuComponent } from "./menu/menu.component";

@Component({
  selector: 'app-chat',
  imports: [
    MatToolbar,
    ChatListComponent,
    ChatRoomComponent,
    MenuComponent
  ],
  templateUrl: './chat.component.html',
  standalone: true,
  styleUrl: './chat.component.scss'
})
export class ChatComponent {
  selectedUser: any;

  onUserSelected(user: any) {
    this.selectedUser = user;
  }
}
