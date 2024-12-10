import { Component, input } from '@angular/core';

import { UserDto } from "@app/models";

@Component({
  selector: 'app-chat-room-header',
  imports: [],
  templateUrl: './chat-room-header.component.html',
  styleUrl: './chat-room-header.component.scss'
})
export class ChatRoomHeaderComponent {
  readonly user = input.required<UserDto>(); // Receiver's info
}
