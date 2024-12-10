import { Routes } from '@angular/router';



import { LoginComponent } from './auth';
import { ChatComponent } from './chat/';
import { MessengerComponent } from "./messenger";
import { AdminComponent } from './admin';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  {
    path: "msg", component: MessengerComponent,
    children: [
      { path: '', redirectTo: 'chat', pathMatch: "prefix" },
      { path: 'chat', component: ChatComponent },
      { path: 'admin', component: AdminComponent },
    ]
  },
];
