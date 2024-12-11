import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from "@angular/core/rxjs-interop";

import { MatButtonModule } from "@angular/material/button";
import { MatDialog, MatDialogModule } from "@angular/material/dialog";
import { MatIconModule } from "@angular/material/icon";

import { UserService } from "@app/services/user.service";
import { ProfileComponent } from "@app/profile/profile.component";
import { catchError, of } from "rxjs";
import { UserDto } from "@app/models";

@Component({
  selector: 'app-users',
  imports: [
    MatIconModule,
    MatButtonModule,
    MatDialogModule
  ],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UsersComponent {
  readonly dialog = inject(MatDialog);
  users$ = toSignal(inject(UserService).getUsers().pipe(
    catchError(() => of([]))
  ));

  addUser(user?: UserDto) {
    const dialogRef = this.dialog.open(ProfileComponent, {
      data: {
        title: "ایجاد کاربر",
        user
      },
      width: "450px",
      minWidth: "380px",
      disableClose: true
    });

    dialogRef.componentInstance.ngOnInit();

    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined) {

      }
    });
  }
}
