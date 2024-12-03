import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthDto } from "@app/models";
import { tap } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  TokenKey = "token";

  constructor(private http: HttpClient) { }

  login(credentials: any) {
    return this.http.post<AuthDto>('/api/auth/login', credentials).pipe(
      tap(token => {
        localStorage.setItem('token', JSON.stringify(token));
      })
    );
  }

  logout() {
    localStorage.removeItem(this.TokenKey);
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem(this.TokenKey);
  }
}
