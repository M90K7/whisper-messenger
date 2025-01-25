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

import { AppService, AuthService, UrlService, UserService } from "@app/services";
import { snackError, snackSuccess, UserDto } from "@app/models";
import { ErrorStateMatcher } from "@angular/material/core";
import { Router } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { MatIconModule } from "@angular/material/icon";

@Component({
  selector: 'app-ui-setting',
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
    MatSnackBarModule,
    MatIconModule
  ],
  templateUrl: './ui-setting.component.html',
  styleUrl: './ui-setting.component.scss'
})
export class UiSettingComponent {

  readonly _snackBar = inject(MatSnackBar);
  readonly fb = inject(FormBuilder);

  readonly http = inject(HttpClient);

  appSvc = inject(AppService);

  formGrp: FormGroup;

  constructor() {
    this.formGrp = this.fb.group({
      shortTitle: [this.appSvc.shortTitle, [Validators.required]],
      title: [this.appSvc.title, [Validators.required]],
      maxAvatarSize: [this.appSvc.maxAvatarSize, [Validators.required, Validators.min(0.1)]],
      maxFileUploadSize: [this.appSvc.maxFileUploadSize, [Validators.required, Validators.min(0.1)]],
    });
  }

  saveApp() {
    this.formGrp.markAllAsTouched();
    this.formGrp.updateValueAndValidity({ onlySelf: true, emitEvent: true });
    if (this.formGrp.valid) {
      this.appSvc.update(this.formGrp.value).subscribe({
        next: res => {
          this.appSvc.loadAppSetting().subscribe();
        },
        error: () => { }
      });
    }
  }

  appIconForm?: FormData;
  // Handle avatar change
  onAppImageChange(event: Event, img: HTMLImageElement) {
    this.appIconForm = undefined;

    const files = event.target && (event.target as HTMLInputElement).files;
    if (files && files[0].size < this.appSvc.appIconSize && this.appSvc.isImage(files[0].name)) {

      var reader = new FileReader();
      reader.onload = function (e) {
        img.src = (e.target as any).result;
      };
      reader.readAsDataURL(files[0]);

      this.appIconForm = new FormData();
      this.appIconForm.append("file", files[0], files[0].name);


    } else {
      this._snackBar.open("لطفا تصویر مناسب و با حجم کمتر از 10 MB مناسب انتخاب کنید.", "", snackError);
    }
  }

  updateAppImage() {
    if (this.appIconForm != null) {
      this.appSvc.updateAppIconImage(this.appIconForm!).subscribe({
        next: (res) => {
          if (res.url) {

            this.appSvc.appIconImg = this.appSvc.toCdn(res.fileName)! + "?t=" + Date.now();

            this._snackBar.open("تصویر با موفقیت به‌روزرسانی شد.", "", snackSuccess);
          }

          this.appIconForm = undefined;
        },
        error: () => {
          this._snackBar.open("خطا در انجام عملیات، لطفا مجدد سعی نمایید", "", snackError);
        }
      });
    }
  }

  appBgForm?: FormData;
  // Handle avatar change
  onAppBgChange(event: Event, img: HTMLImageElement) {
    this.appIconForm = undefined;

    const files = event.target && (event.target as HTMLInputElement).files;
    if (files && files[0].size < this.appSvc.appBgSize && this.appSvc.isImage(files[0].name)) {

      var reader = new FileReader();
      reader.onload = function (e) {
        img.src = (e.target as any).result;
      };
      reader.readAsDataURL(files[0]);

      this.appBgForm = new FormData();
      this.appBgForm.append("file", files[0], files[0].name);


    } else {
      this._snackBar.open("لطفا تصویر مناسب و با حجم کمتر از 20 MB مناسب انتخاب کنید.", "", snackError);
    }
  }

  updateAppBg() {
    if (this.appBgForm != null) {
      this.appSvc.updateAppBackgroundImage(this.appBgForm!).subscribe({
        next: (res) => {
          this.appSvc.appBgImg = this.appSvc.toCdn(res.fileName)! + "?t=" + Date.now();

          this._snackBar.open("تصویر با موفقیت به‌روزرسانی شد.", "", snackSuccess);

          this.appBgForm = undefined;
        },
        error: () => {
          this._snackBar.open("خطا در انجام عملیات، لطفا مجدد سعی نمایید", "", snackError);
        }
      });
    }
  }

}
