import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';

import { ProfileComponent } from "@app/profile/profile.component";
import { AuthService } from "@app/services";

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

  openDialog(): void {
    const dialogRef = this.dialog.open(ProfileComponent, {

      data: {},
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined) {

      }
    });
  }

  logout() {
    this.authSvc.logout();
    this.routerSvc.navigateByUrl("/");
  }

}
