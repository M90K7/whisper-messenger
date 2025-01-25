import { Injectable } from '@angular/core';
import { environment } from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class UrlService {

  baseServer = environment.serverUrl;
  baseUrl = this.baseServer + "/api";
  baseSocket = this.baseServer + "/io/chat";

  baseUserUrl = this.baseUrl + "/user";
  _chatUrl = this.baseUrl + "/chat";

  cdn = {
    profiles: this.baseServer + "/profiles",
    files: this.baseServer + "/files",
    apps: this.baseServer + "/apps",
  };

  auth = {
    login: this.baseUrl + "/auth/login",
    refresh: this.baseUrl + "/auth/refresh"
  };

  chat = {
    ws: {
      message: "SendMessageAsync",
      confirm: "SendConfirmAsync",
    },
    send: this._chatUrl,
    sendFile: this._chatUrl + "/File",
    history: this._chatUrl + "/history",
    delete: this._chatUrl,
    admin: {
      list: this._chatUrl + "/admin",
      delete: this._chatUrl + "/admin",
    }
  };

  user = {
    ws: {
      user: "SendUserAsync"
    },
    list: this.baseUserUrl,
    update: this.baseUserUrl,
    avatar: this.baseUserUrl + "/avatar",
    admin: {
      list: this.baseUserUrl + "/admin",
      create: this.baseUserUrl + "/admin",
      update: this.baseUserUrl + "/admin",
      delete: this.baseUserUrl + "/admin",
    }
  };

  adSetting = {
    update: this.baseUrl + "/Ad",
    test: this.baseUrl + "/Ad/test"
  };

  appSetting = {
    url: this.baseUrl + "/apps",
    icon: this.baseUrl + "/apps/icon",
    background: this.baseUrl + "/apps/bg",
  };
}
