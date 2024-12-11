import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, Routes } from '@angular/router';

import { LoginComponent } from './auth';
import { ChatComponent } from './chat/';
import { MessengerComponent } from "./messenger";
import { AdminComponent } from './admin';
import { AuthService } from "./services";
import { inject } from "@angular/core";

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  {
    path: "msg", component: MessengerComponent,
    canActivate: [
      (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
        const authSvc = inject(AuthService);
        const routerSvc = inject(Router);

        if (!authSvc.isAuthenticated()) {
          routerSvc.navigateByUrl("/login");
        }
        return authSvc.isAuthenticated();
      }
    ],
    children: [
      { path: '', redirectTo: 'chat', pathMatch: "prefix" },
      { path: 'chat', component: ChatComponent },
      {
        path: 'admin', component: AdminComponent,
        loadChildren: () => import("./admin/admin.routes").then(r => r.routes)
      },
    ]
  },
];
