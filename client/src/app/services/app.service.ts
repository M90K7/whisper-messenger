import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from '@angular/core';
import { UrlService } from "./url.service";
import { tap } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class AppService {

  readonly http = inject(HttpClient);
  readonly urlSvc = inject(UrlService);

  updateAppIconImage(form: FormData) {
    return this.http.post<ImageDto>(this.urlSvc.appSetting.icon, form);
  }

  updateAppBackgroundImage(form: FormData) {
    return this.http.post<ImageDto>(this.urlSvc.appSetting.background, form);
  }

  refreshSrcAppImage() {
    this.appIconImg += "&" + Date.now();
  }

  readonly _1M = 256 * 1024 * 1024;
  avatarSize = this._1M * 5;
  maxAvatarSize = 5;
  fileUploadSize = this._1M * 20;
  maxFileUploadSize = 20;

  appIconSize = this._1M * 10;
  appBgSize = this._1M * 20;

  appIconImg = "/img/logo.svg?v=1";
  appBgImg = "";

  shortTitle = "نجـوا";
  title = "شبکه سازمانی نجـوا";

  constructor() {
  }

  loadAppSetting() {
    return this.http.get<AppSetting>(this.urlSvc.appSetting.url).pipe(
      tap((setting) => {
        if (setting.background)
          this.appBgImg = this.toCdn(setting.background) + "?t=" + Date.now();
        if (setting.icon)
          this.appIconImg = this.toCdn(setting.icon) + "?t=" + Date.now();
        if (setting.maxAvatarSize)
          this.maxAvatarSize = setting.maxAvatarSize;
        this.avatarSize = this._1M * this.maxAvatarSize;
        if (setting.maxFileUploadSize)
          this.maxFileUploadSize = setting.maxFileUploadSize;
        this.fileUploadSize = this._1M * this.maxFileUploadSize;
        if (setting.shortTitle)
          this.shortTitle = setting.shortTitle;
        if (setting.title)
          this.title = setting.title;
      }
      ));
  }

  update(setting: AppSetting) {
    return this.http.put<AppSetting>(this.urlSvc.appSetting.url, setting);
  }

  isImage(filePath?: string): boolean {
    return Boolean(filePath && /\.(jpg|jpeg|png|gif)$/i.test(filePath));
  }

  toCdn(url: string) {
    if (url) {
      return this.urlSvc.cdn.apps + '/' + url;
    }
    return undefined;
  }
}


export interface ImageDto {
  url: string;
  fileName: string;
}

export interface AppSetting {
  id: number;
  shortTitle: string;
  title: string;
  icon: string;
  background: string;
  maxAvatarSize: number;
  maxFileUploadSize: number;
}