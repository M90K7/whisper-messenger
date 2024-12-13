import { AsyncPipe, } from "@angular/common";
import { ChangeDetectionStrategy, Component, inject, output, signal } from '@angular/core';
import { outputToObservable } from '@angular/core/rxjs-interop';

import { MatListModule } from "@angular/material/list";
import { MatIconModule } from "@angular/material/icon";
import { AuthService, UserService } from "@app/services";
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

  private readonly _authSvc = inject(AuthService);

  constructor(private userService: UserService) {
    this.loadUsers();
  }

  loadUsers() {
    this.userService.getUsers().subscribe(users => {
      for (const user of users) {
        user.avatar = this._authSvc.avatarSrc(user.avatar);
      }
      this.users.set(users);
    });
  }

  selectUser(user: any) {
    this.userSelected.emit(user);
  }

}
