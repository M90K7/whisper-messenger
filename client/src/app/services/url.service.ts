import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UrlService {

  baseUrl = "https://localhost:5000/api";

  baseUserUrl = this.baseUrl + "/user";

  auth = {
    login: this.baseUrl + "/auth/login"
  };

  user = {
    list: this.baseUserUrl,
    update: this.baseUserUrl,
    admin: {
      list: this.baseUserUrl + "/admin",
      create: this.baseUserUrl + "/admin",
      update: this.baseUserUrl + "/admin",
    }
  };
}
