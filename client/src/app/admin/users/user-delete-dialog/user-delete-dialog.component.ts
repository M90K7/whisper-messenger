import { Component, inject } from '@angular/core';

import { MatButtonModule } from "@angular/material/button";
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from "@angular/material/dialog";
import { MatDividerModule } from "@angular/material/divider";
import { MatSnackBar, MatSnackBarModule } from "@angular/material/snack-bar";
import { snackSuccess, UserDto } from "@app/models";
import { UserService } from "@app/services";

export interface UserDeleteArgs {
  user: UserDto;
}

@Component({
  selector: 'app-user-delete-dialog',
  imports: [
    MatButtonModule,
    MatDialogModule,
    MatDividerModule,
    MatSnackBarModule
  ],
  templateUrl: './user-delete-dialog.component.html',
  styleUrl: './user-delete-dialog.component.scss'
})
export class UserDeleteDialogComponent {

  readonly dialogRef = inject(MatDialogRef<UserDeleteDialogComponent>);
  readonly data = inject<UserDeleteArgs>(MAT_DIALOG_DATA);
  readonly _snackBar = inject(MatSnackBar);

  readonly userSvc = inject(UserService);

  close() {
    this.userSvc.delete(this.data.user.id).subscribe({
      next: () => {
        this._snackBar.open("حذف با موفقیت انجام شد.", "", snackSuccess);

        this.dialogRef.close(true);
      },
      error: () => {
        this._snackBar.open("خطا در انجام عملیات. ", "", snackSuccess);
      }

    });
  }

}
