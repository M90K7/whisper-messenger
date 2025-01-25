import { Component, inject, OnInit, signal } from '@angular/core';
import { ValidationErrors, FormBuilder, FormControl, FormGroup, FormGroupDirective, FormsModule, NgForm, ReactiveFormsModule, Validators, AbstractControl } from "@angular/forms";

import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatDividerModule } from '@angular/material/divider';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarConfig, MatSnackBarModule } from '@angular/material/snack-bar';

import { AppService, AuthService, UserService } from "@app/services";
import { snackError, snackSuccess, UserDto } from "@app/models";
import { ErrorStateMatcher } from "@angular/material/core";
import { Router } from "@angular/router";

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
    MatSnackBarModule
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  readonly dialogRef = inject(MatDialogRef<ProfileComponent>);
  readonly router = inject(Router);

  readonly data = inject<ProfileArgs>(MAT_DIALOG_DATA);
  readonly _snackBar = inject(MatSnackBar);

  appSvc = inject(AppService);

  profileForm: FormGroup;

  defaultAvatar: string = '/img/default-profile.svg'; // Replace with your default avatar path

  previewAvatar = signal(this.defaultAvatar);

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
      newPassword: ['', [Validators.required, (control: AbstractControl) => {
        if (this.profileForm && this.profileForm.controls['password'].value.length > 5 && control.value.length > 5)
          return null;
        return {};
      }]],
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
        uptimeMinutes: this.data.user.uptimeMinutes,
        password: ''
      });
      if (this.data.user.avatar)
        this.previewAvatar.set(this.data.user.avatar);
    }
    this.isAdmin.set(this.data.isAdmin || false);

    setTimeout(() => {
      this.profileForm.controls['password'].setValue('');
      this.profileForm.controls['password'].markAsUntouched();
    }, 1000);
  }

  save() {
    this.profileForm.markAllAsTouched();
    this.profileForm.updateValueAndValidity({ onlySelf: true, emitEvent: true });

    if (this.data.user?.id) {
      this.userService.update({ id: this.data.user.id, ...this.profileForm.value }, this.isAdmin()).subscribe(
        {
          next: res => {
            if (res) {
              this._snackBar.open("ویرایش با موفقیت انجام شد.", "", snackSuccess);
            }
            this.dialogRef.close(res);
          },
          error: () => {
            this._snackBar.open("خطا در انجام عملیات، لطفا مجدد سعی نمایید", "", snackError);
          }
        }
      );
    } else {
      this.userService.create(this.profileForm.value).subscribe(
        {
          next: res => {
            if (res) {
              this._snackBar.open("کاربر با موفقیت افزوده شد.", "", snackSuccess);
            }
            this.dialogRef.close(res);
          },
          error: () => {
            this._snackBar.open("خطا در انجام عملیات، لطفا مجدد سعی نمایید", "", snackError);
          }
        }
      );
    }


  }

  // Handle avatar change
  onAvatarChange(event: Event) {
    const files = event.target && (event.target as HTMLInputElement).files;
    if (files && files[0].size < this.appSvc.avatarSize && this.isImage(files[0].name)) {
      var form = new FormData();
      form.append("avatar", files[0], files[0].name);

      this.userService.updateAvatar(form).subscribe({
        next: (user) => {
          this.previewAvatar.update(u => this.authSvc.avatarSrc(user.avatar)!);
          this._snackBar.open("تصویر با موفقیت به‌روزرسانی شد.", "", snackSuccess);
        },
        error: () => {
          this._snackBar.open("خطا در انجام عملیات، لطفا مجدد سعی نمایید", "", snackError);
        }
      });
    } else {
      this._snackBar.open("لطفا تصویر مناسب و با حجم کمتر از 5 MB مناسب انتخاب کنید.", "", snackError);
    }
  }

  private isImage(filePath?: string): boolean {
    return Boolean(filePath && /\.(jpg|jpeg|png|gif)$/i.test(filePath));
  }
}

/** Error when invalid control is dirty, touched, or submitted. */
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}