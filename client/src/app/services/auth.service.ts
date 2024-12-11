import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from "rxjs";

import { AuthDto, UserTokenModel } from "@app/models";
import { UrlService } from "./url.service";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  TokenKey = "token";

  private model!: UserTokenModel;

  constructor(private http: HttpClient, private readonly _urlSvc: UrlService) { }

  login(credentials: any) {
    return this.http.post<AuthDto>(this._urlSvc.auth.login, credentials).pipe(
      tap(token => {
        localStorage.setItem('token', JSON.stringify(token));
      })
    );
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
    this.model = model;

    if (this.isTokenExpired()) {
      return false;
    }

    return true;
  }

  isAdmin() {
    return this.model?.role === "admin";
  }

  getModel() {
    return this.model;
  }

  private getToken(): string | null {
    return localStorage.getItem(this.TokenKey);
  }

  // Decode the JWT manually
  private decodeToken(): UserTokenModel | null {
    const token = this.getToken();
    if (!token) {
      return null;
    }

    try {
      const payload = token.split('.')[1];
      const decodedPayload = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      const model = JSON.parse(decodedPayload);
      for (const key of Object.keys(model)) {
        if (key.startsWith("http")) {
          const _keys = key.split("/");
          const _key = _keys[_keys.length - 1];
          if (_key)
            model[_key] = model[key];
        }
      }
      return model;
    } catch (error) {
      console.error('Error decoding JWT:', error);
      return null;
    }
  }

  private isTokenExpired(): boolean {
    const decodedToken = this.model;
    if (!decodedToken || !decodedToken.exp) {
      return true;
    }

    const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
    return decodedToken.exp < currentTime;
  }
}
