import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { toSignal } from "@angular/core/rxjs-interop";

import { MatButtonModule } from "@angular/material/button";
import { MatDialog, MatDialogModule } from "@angular/material/dialog";
import { MatIconModule } from "@angular/material/icon";
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';

import { UserService } from "@app/services/user.service";
import { ProfileArgs, ProfileComponent } from "@app/profile/profile.component";
import { UserDeleteArgs, UserDeleteDialogComponent } from "./user-delete-dialog";
import { catchError, of } from "rxjs";
import { UserDto } from "@app/models";

@Component({
  selector: 'app-users',
  imports: [
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    MatCardModule,
    MatDividerModule
  ],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UsersComponent {
  readonly dialog = inject(MatDialog);
  users$ = signal<UserDto[]>([], { equal: (a, b) => a === b });

  readonly userSvc = inject(UserService);

  constructor() {
    inject(UserService).getAdminUsers().pipe(
      catchError(() => of([]))
    ).subscribe(users => {
      this.users$.set(users);
    });
  }

  addUser(user?: UserDto) {
    const dialogRef = this.dialog.open(ProfileComponent, {
      data: <ProfileArgs>{
        title: "ایجاد کاربر",
        user,
        isAdmin: true
      },
      width: "450px",
      minWidth: "380px",
      disableClose: true
    });

    dialogRef.componentInstance.ngOnInit();

    dialogRef.afterClosed().subscribe((_user: UserDto) => {
      if (user && typeof user === "object") {
        if (user) {
          Object.assign(user, _user);
          this.users$.update(_users => Array.from(_users));
        } else {
          this.users$.update(_users => {
            _users.push(_user);
            return Array.from(_users);
          });
        }
      }
    });
  }

  deleteUser(user: UserDto, index: number) {
    const dialogRef = this.dialog.open(UserDeleteDialogComponent, {
      data: <UserDeleteArgs>{
        user
      },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(isDel => {
      if (isDel) {

        this.users$.update(_users => {
          _users.splice(index, 1);
          return Array.from(_users);
        });
      }
    });

  }
}
