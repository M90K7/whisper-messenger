import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from "rxjs";

import { AuthDto, decodeBase64Utf8, UserDto, UserTokenModel } from "@app/models";
import { UrlService } from "./url.service";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  TokenKey = "token";

  constructor(private http: HttpClient, private readonly _urlSvc: UrlService) { }

  login(credentials: any) {
    return this.http.post<AuthDto>(this._urlSvc.auth.login, credentials).pipe(
      tap(token => {
        localStorage.setItem('token', JSON.stringify(token));
      })
    );
  }

  refresh() {
    return this.http.post<AuthDto>(this._urlSvc.auth.refresh, {}).pipe(
      tap(token => {
        localStorage.setItem('token', JSON.stringify(token));
      })
    );
  }

  avatarSrc(url?: string) {
    if (url) {
      return this._urlSvc.cdn.profiles + '/' + url + "?t=" + Date.now();
    }
    return undefined;
  }

  logout() {
    localStorage.removeItem(this.TokenKey);
  }

  isAuthenticated(): boolean {
    if (!this.getToken()) {
      return false;
    }

    // JWT format: <header>.<payload>.<signature>
    const model = this.decodeToken();
    if (model == null) {
      return false;
    }

    if (this.isTokenExpired()) {
      return false;
    }

    return true;
  }

  isAdmin() {
    return this.getUser()?.role === "admin";
  }

  getUser() {
    const model = this.decodeToken();
    if (!model) {
      return undefined;
    }
    return <UserDto>{
      avatar: this.avatarSrc(model.avatar),
      fullName: model.given_name,
      online: true,
      id: +model.sub,
      role: model.role,
      userName: model.name,
      email: model.email
    };
  }

  getToken(): AuthDto | undefined {
    const token = localStorage.getItem(this.TokenKey);
    if (token && token.length > 10) {
      return JSON.parse(token);
    }
    return undefined;
  }

  // Decode the JWT manually
  private decodeToken(): UserTokenModel | null {
    const token = this.getToken();
    if (!token) {
      return null;
    }

    try {
      const payload = token.token.split('.')[1];
      const decodedPayload = decodeBase64Utf8(payload.replace(/-/g, '+').replace(/_/g, '/'));
      const model = JSON.parse(decodedPayload);
      // for (const key of Object.keys(model)) {
      //   if (key.startsWith("http")) {
      //     const _keys = key.split("/");
      //     const _key = _keys[_keys.length - 1];
      //     if (_key)
      //       model[_key] = model[key];
      //   }
      // }
      return model;
    } catch (error) {
      console.error('Error decoding JWT:', error);
      return null;
    }
  }

  private isTokenExpired(): boolean {
    const decodedToken = this.decodeToken();
    if (!decodedToken || !decodedToken.exp) {
      return true;
    }

    const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
    return decodedToken.exp < currentTime;
  }
}
