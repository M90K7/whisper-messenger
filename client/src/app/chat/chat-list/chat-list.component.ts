import { NgIf } from "@angular/common";
import { Component, EventEmitter, Output } from '@angular/core';

import { MatList, MatListItem } from "@angular/material/list";
import { MatIcon } from "@angular/material/icon";
import { UserService } from "@app/services";
import { UserDto } from "@app/models";

@Component({
  selector: 'app-chat-list',
  imports: [NgIf, MatList, MatListItem, MatIcon],
  standalone: true,
  templateUrl: './chat-list.component.html',
  styleUrl: './chat-list.component.scss'
})
export class ChatListComponent {

  users: UserDto[] = [];
  @Output() userSelected = new EventEmitter<any>();

  constructor(private userService: UserService) {
    this.loadUsers();
  }

  loadUsers() {
    this.userService.getUsers().subscribe(users => {
      this.users = users;
    });
  }

  selectUser(user: any) {
    this.userSelected.emit(user);
  }

}
