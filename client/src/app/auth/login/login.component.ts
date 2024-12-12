import { CommonModule } from "@angular/common";
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from "@angular/forms";

import { MatCardModule } from "@angular/material/card";
import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatSnackBar, MatSnackBarModule } from "@angular/material/snack-bar";

import { AuthService } from "@app/services";
import { Router } from "@angular/router";
import { snackError } from "@app/models";

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatSnackBarModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  loginForm: FormGroup;

  routerSvc = inject(Router);

  readonly _snackBar = inject(MatSnackBar);

  constructor(private fb: FormBuilder, private authService: AuthService) {
    this.loginForm = this.fb.group({
      username: ['', []],
      password: ['', []]
    });
  }

  onSubmit() {
    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        this.routerSvc.navigateByUrl("/msg");
      },
      error: (err) => {
        console.error(err);
        this._snackBar.open("خطا در انجام عملیات، لطفا مجدد سعی نمایید.", "", snackError);
      }
    });
  }
}
