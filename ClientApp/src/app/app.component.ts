import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { MatToolbar } from "@angular/material/toolbar";

import { ChatListComponent, ChatRoomComponent } from "./chat";
import { MenuComponent } from "./chat/menu/menu.component";

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    MatToolbar,
    ChatListComponent,
    ChatRoomComponent,
    MenuComponent
  ],
  templateUrl: './app.component.html',
  standalone: true,
  styleUrl: './app.component.scss'
})
export class AppComponent {
  selectedUser: any;

  onUserSelected(user: any) {
    this.selectedUser = user;
  }
}
