import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UrlService {

  baseUrl = "https://localhost:5000/api";

  baseUserUrl = this.baseUrl + "/user";
  _chatUrl = this.baseUrl + "/chat";

  cdn = {
    profiles: "https://localhost:5000/profiles",
    files: "https://localhost:5000/files",
  };

  auth = {
    login: this.baseUrl + "/auth/login",
    refresh: this.baseUrl + "/auth/refresh"
  };

  chat = {
    send: this._chatUrl,
    sendFile: this._chatUrl + "/File",
    history: this._chatUrl + "/history",

  };

  user = {
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
}
