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

import { AuthService, UrlService, UserService } from "@app/services";
import { snackError, snackSuccess, UserDto } from "@app/models";
import { ErrorStateMatcher } from "@angular/material/core";
import { Router } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { MatIconModule } from "@angular/material/icon";

@Component({
  selector: 'app-active-directory-setting',
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
  templateUrl: './active-directory-setting.component.html',
  styleUrl: './active-directory-setting.component.scss'
})
export class ActiveDirectorySettingComponent {

  readonly dialogRef = inject(MatDialogRef<ActiveDirectorySettingComponent>);
  readonly router = inject(Router);

  readonly data = inject<any>(MAT_DIALOG_DATA);
  readonly _snackBar = inject(MatSnackBar);
  readonly fb = inject(FormBuilder);

  readonly http = inject(HttpClient);
  readonly urlSvc = inject(UrlService);

  formGrp: FormGroup;

  constructor() {
    this.formGrp = this.fb.group({
      url: ['', [Validators.required]],
      name: ['', [Validators.required]],
      username: ['', [Validators.required]],
      adPassword: ['', [Validators.required]],
    });

    this.http.get<ActiveDirectoryDto>(this.urlSvc.adSetting.update).subscribe({
      next: (data: any) => {
        if (data != null && data.id) {
          this.formGrp.patchValue({
            url: data.url,
            name: data.name,
            username: data.username,
            // adPassword: data.password
          });
        }
      }
    });
  }



  save() {
    this.formGrp.markAllAsTouched();
    this.formGrp.updateValueAndValidity({ onlySelf: true, emitEvent: true });

    this.http.post<ActiveDirectoryDto>(
      this.urlSvc.adSetting.update,
      { ...this.formGrp.value, password: this.formGrp.value.adPassword }
    ).subscribe({
      next: () => {
        this._snackBar.open("اطلاعات ذخیره شد.", "", snackSuccess);

        this.dialogRef.close();
      },
      error: () => {
        this._snackBar.open("خطا! لطفا مجدد سعی نمایید.", "", snackError);
      }
    });
  }

  testConnectivity() {
    this.formGrp.markAllAsTouched();
    this.formGrp.updateValueAndValidity({ onlySelf: true, emitEvent: true });

    this.http.post<ActiveDirectoryDto>(
      this.urlSvc.adSetting.test,
      { ...this.formGrp.value, password: this.formGrp.value.adPassword }
    ).subscribe({
      next: data => {
        this._snackBar.open("ارتباط با موفقیت برقرار شد", "", snackSuccess);
      },
      error: () => {
        this._snackBar.open("خطا در برقراری ارتباط! از صحت اطلاعات ورودی اطمینان حاصل فرمایید.", "", snackError);
      }
    });
  }
}

export interface ActiveDirectoryDto {
  id: number;
  url: string;
  username: string;
  adPassword: string;
}