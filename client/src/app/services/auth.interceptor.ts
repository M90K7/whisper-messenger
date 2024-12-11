import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { Observable } from 'rxjs';

import { AuthService } from './auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  readonly authSvc = inject(AuthService);

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authSvc.getToken();
    if (token)
      req = req.clone({
        setHeaders: {
          'Authorization': `Bearer ${token.token}`,
        },
      });

    return next.handle(req);
  }
}