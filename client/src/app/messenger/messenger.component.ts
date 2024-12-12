import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';

import { ProfileArgs, ProfileComponent } from "@app/profile/profile.component";
import { AuthService } from "@app/services";
import { UserDto } from "@app/models";
import { equal } from "assert";

@Component({
  selector: 'app-messenger',
  imports: [
    RouterOutlet,
    RouterLink,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatDialogModule,
    MatTooltipModule
  ],
  templateUrl: './messenger.component.html',
  styleUrl: './messenger.component.scss'
})
export class MessengerComponent {

  readonly dialog = inject(MatDialog);
  readonly authSvc = inject(AuthService);
  readonly routerSvc = inject(Router);

  user = signal<UserDto>(this.authSvc.getUser());

  openDialog(): void {
    const dialogRef = this.dialog.open(ProfileComponent, {

      data: <ProfileArgs>{
        isAdmin: false,
        user: this.user()
      },
    });

    dialogRef.componentInstance.ngOnInit();

    dialogRef.afterClosed().subscribe((user: UserDto) => {
      if (user !== undefined) {
        this.user.update(u => ({ ...u, fullName: user.fullName, userName: user.userName, email: user.email }));
      }
    });
  }

  logout() {
    this.authSvc.logout();
    this.routerSvc.navigateByUrl("/");
  }

}
