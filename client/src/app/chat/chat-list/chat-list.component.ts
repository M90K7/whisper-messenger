import { AsyncPipe, } from "@angular/common";
import { ChangeDetectionStrategy, Component, output, signal } from '@angular/core';
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
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatListComponent {

  users = signal<UserDto[]>([], { equal: (a, b) => a === b });

  userSelected = output<UserDto>();

  userSelected$ = outputToObservable(this.userSelected);

  constructor(private userService: UserService) {
    this.loadUsers();
  }

  loadUsers() {
    this.userService.getUsers().subscribe(users => {
      this.users.set(users);
    });
  }

  selectUser(user: any) {
    this.userSelected.emit(user);
  }

}
