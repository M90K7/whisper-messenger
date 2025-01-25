import { Component, inject, OnDestroy, signal } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';

import { ProfileArgs, ProfileComponent } from "@app/profile/profile.component";
import { ActiveDirectorySettingComponent } from "@app/active-directory-setting";
import { AppService, AuthService, WebSocketService } from "@app/services";
import { UserDto } from "@app/models";

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
export class MessengerComponent implements OnDestroy {


  readonly dialog = inject(MatDialog);
  readonly authSvc = inject(AuthService);
  readonly appSvc = inject(AppService);
  readonly routerSvc = inject(Router);
  private readonly _wsSvc = inject(WebSocketService);

  user = signal<UserDto>(this.authSvc.getUser()!);

  constructor() {
    this._wsSvc.start();
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(ProfileComponent, {

      data: <ProfileArgs>{
        isAdmin: false,
        user: this.user()
      },
      width: 'min(50%, 350px)'
    });

    dialogRef.componentInstance.ngOnInit();

    dialogRef.afterClosed().subscribe((user: UserDto) => {
      if (user && typeof user === "object") {
        this.user.update(u => ({ ...u, fullName: user.fullName, userName: user.userName, email: user.email, avatar: this.authSvc.avatarSrc(user.avatar) }));
      }
      this.authSvc.refresh().subscribe({
        next: () => {
          this.user.set(this.authSvc.getUser()!);
        }
      });
    });
  }

  openAdSetting() {
    const dialogRef = this.dialog.open(ActiveDirectorySettingComponent, {
      data: {},
      width: 'min(50%, 350px)'
    });

    dialogRef.afterClosed().subscribe({
      next: () => {
      }
    });
  }

  logout() {
    this.authSvc.logout();
    this.routerSvc.navigateByUrl("/login");
  }

  ngOnDestroy(): void {
    this._wsSvc.stop();
  }

}
