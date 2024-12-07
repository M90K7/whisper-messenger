import { AsyncPipe, } from "@angular/common";
import { Component, output } from '@angular/core';
import { outputToObservable } from '@angular/core/rxjs-interop';

import { MatListModule } from "@angular/material/list";
import { MatIconModule } from "@angular/material/icon";
import { UserService } from "@app/services";
import { UserDto } from "@app/models";

@Component({
  selector: 'app-chat-list',
  imports: [AsyncPipe, MatListModule, MatIconModule],
  standalone: true,
  templateUrl: './chat-list.component.html',
  styleUrl: './chat-list.component.scss',
})
export class ChatListComponent {

  users: Partial<UserDto>[] = [
    { fullName: "مسلم اکبری" },
    { fullName: "علی اصغری" },
    { fullName: "رضا اکبری" },
    { fullName: "محمد اکبری" },
    { fullName: "جواد اکبری" },
  ];

  userSelected = output<UserDto>();

  userSelected$ = outputToObservable(this.userSelected);

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
