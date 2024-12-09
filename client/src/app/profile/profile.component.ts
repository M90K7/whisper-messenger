import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";

import { MatCardModule } from "@angular/material/card";
import { MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef, MatDialogTitle } from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatDividerModule } from '@angular/material/divider';

import { UserService } from "@app/services";

@Component({
  selector: 'app-profile',
  imports: [
    ReactiveFormsModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose,
    MatDividerModule
  ],
  standalone: true,
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent {
  readonly dialogRef = inject(MatDialogRef<ProfileComponent>);

  profileForm: FormGroup;
  defaultAvatar: string = '/img/default-profile.svg'; // Replace with your default avatar path
  previewAvatar: string | ArrayBuffer | null = null;

  constructor(private fb: FormBuilder, private userService: UserService) {
    this.profileForm = this.fb.group({
      username: [''],
      displayName: [''],
      password: [''],
    });
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  save() {
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
    this.userService.updateProfile(profileData).subscribe(() => {
      alert('Profile updated successfully!');
    });
  }
}
