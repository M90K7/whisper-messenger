import { NgFor, NgIf } from "@angular/common";
import { Component, EventEmitter, Output } from '@angular/core';

import { MatListModule } from "@angular/material/list";
import { MatIconModule } from "@angular/material/icon";
import { UserService } from "@app/services";
import { UserDto } from "@app/models";

@Component({
  selector: 'app-chat-list',
  imports: [NgFor, NgIf, MatListModule, MatIconModule],
  standalone: true,
  templateUrl: './chat-list.component.html',
  styleUrl: './chat-list.component.scss'
})
export class ChatListComponent {

  users: Partial<UserDto>[] = [
    { fullName: "مسلم اکبری" },
    { fullName: "علی اصغری" },
    { fullName: "رضا اکبری" },
    { fullName: "محمد اکبری" },
    { fullName: "جواد اکبری" },
  ];
  @Output() userSelected = new EventEmitter<any>();

  constructor(private userService: UserService) {
    // this.loadUsers();
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
