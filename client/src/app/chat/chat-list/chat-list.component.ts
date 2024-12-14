import { AsyncPipe, } from "@angular/common";
import { ChangeDetectionStrategy, Component, DestroyRef, inject, output, signal } from '@angular/core';
import { outputToObservable, takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { MatListModule } from "@angular/material/list";
import { MatIconModule } from "@angular/material/icon";
import { MatTooltipModule } from '@angular/material/tooltip';

import { AuthService, UserService, WebSocketService } from "@app/services";
import { UserDto } from "@app/models";

@Component({
  selector: 'app-chat-list',
  imports: [AsyncPipe, MatListModule, MatIconModule, MatTooltipModule],
  standalone: true,
  templateUrl: './chat-list.component.html',
  styleUrl: './chat-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatListComponent {
  users = signal<UserDto[]>([]);

  userSelected = output<UserDto>();

  userSelected$ = outputToObservable(this.userSelected);

  _wsSvc = inject(WebSocketService);

  destroyRef = inject(DestroyRef);

  private readonly _authSvc = inject(AuthService);
  private _userSelected?: UserDto;

  constructor(private userService: UserService) {
    this.loadUsers();

    this._wsSvc.user$.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: user => {
        const findUser = this.users().find(u => u.id == user.id);
        if (findUser) {
          findUser.online = user.online;
          this.users.update(_users => Array.from(_users));
        } else {
          this.users.update(_users => {
            _users.push(user);
            return Array.from(_users);
          });
        }
      }
    });

    this._wsSvc.message$.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: msg => {
        const findUser = this.users().find(u => u.id == msg.senderId);
        if (findUser && this._userSelected?.id != findUser.id) {
          findUser.newMessage = true;
          this.users.update(_users => Array.from(_users));
        }
      }
    });

  }

  loadUsers() {
    this.userService.getUsers().subscribe(users => {
      for (const user of users) {
        user.avatar = this._authSvc.avatarSrc(user.avatar);
      }
      this.users.set(users);
    });
  }



  selectUser(user: UserDto) {
    user.newMessage = false;
    this.userSelected.emit(user);
    this._userSelected = user;

  }

}
