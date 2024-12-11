import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormGroupDirective, FormsModule, NgForm, ReactiveFormsModule, Validators } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";

import { MatCardModule } from "@angular/material/card";
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatDividerModule } from '@angular/material/divider';
import { MatSelectModule } from '@angular/material/select';

import { AuthService, UserService } from "@app/services";
import { UserDto } from "@app/models";
import { ErrorStateMatcher } from "@angular/material/core";
import { ActivatedRoute, Router } from "@angular/router";

export interface ProfileArgs {
  title: string;
  user: UserDto;
  isAdmin: boolean;
}

@Component({
  selector: 'app-profile',
  imports: [
    ReactiveFormsModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDividerModule,
    MatSelectModule,
    MatDialogModule,// MatDialogContent, MatDialogActions, MatDialogClose,
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  readonly dialogRef = inject(MatDialogRef<ProfileComponent>);
  readonly router = inject(Router);

  readonly data = inject<ProfileArgs>(MAT_DIALOG_DATA);

  profileForm: FormGroup;
  defaultAvatar: string = '/img/default-profile.svg'; // Replace with your default avatar path
  previewAvatar?: string | ArrayBuffer | null;

  isAdmin = signal(false);

  matcher = new MyErrorStateMatcher();
  constructor(private readonly fb: FormBuilder,
    private readonly userService: UserService,
    private readonly authSvc: AuthService
  ) {
    this.profileForm = this.fb.group({
      userName: ['', [Validators.required]],
      fullName: ['', []],
      password: ['', [Validators.required]],
      email: ['', [Validators.email]],
      role: ['operator', []],
      uptimeMinutes: [60, [Validators.required, Validators.min(5), Validators.max(60 * 48)]],
    });
  }


  ngOnInit(): void {
    // this.loadProfile();
    if (this.data.user) {
      this.profileForm.patchValue({
        userName: this.data.user.userName || '',
        fullName: this.data.user.fullName || '',
        email: this.data.user.email,
        role: this.data.user.role,
        uptimeMinutes: this.data.user.uptimeMinutes
      });
      this.previewAvatar = this.data.user.avatar;
    }
    this.isAdmin.set(this.data.isAdmin || false);
  }

  save() {
    this.profileForm.markAllAsTouched();
    this.profileForm.updateValueAndValidity({ onlySelf: true, emitEvent: true });

    if (this.data.user?.id) {
      this.userService.update({ id: this.data.user.id, ...this.profileForm.value });
    } else {
      this.userService.create(this.profileForm.value);
    }

    this.dialogRef.close();
  }

  // Load current user profile
  loadProfile() {
    this.userService.getProfile().subscribe((profile: any) => {
      this.profileForm.patchValue({
        username: profile.username,
        displayName: profile.displayName,
      });
      this.previewAvatar = profile.avatar || this.defaultAvatar;
    });
  }

  // Handle avatar change
  onAvatarChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => (this.previewAvatar = reader.result);
      reader.readAsDataURL(file);
    }
  }

  // Update profile
  updateProfile() {
    const profileData = this.profileForm.value;
    this.userService.update(profileData).subscribe(() => {
      alert('Profile updated successfully!');
    });
  }
}

/** Error when invalid control is dirty, touched, or submitted. */
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}