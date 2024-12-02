import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from "@angular/forms";

import { MatCard } from "@angular/material/card";
import { MatFormField, MatLabel } from "@angular/material/form-field";
import { AuthService } from "@app/services";

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatCard,
    MatFormField,
    MatLabel
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  loginForm: FormGroup;

  constructor(private fb: FormBuilder, private authService: AuthService) {
    this.loginForm = this.fb.group({
      username: [''],
      password: ['']
    });
  }

  onSubmit() {
    this.authService.login(this.loginForm.value).subscribe(() => {
      window.location.href = '/social';
    });
  }
}
