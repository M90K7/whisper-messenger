import { Routes } from '@angular/router';

import { UsersComponent } from "./users";
import { SettingsComponent } from "./settings";
import { MessagesComponent } from "./messages";

export const routes: Routes = [
  { path: '', redirectTo: 'users', pathMatch: 'prefix' },
  { path: 'users', component: UsersComponent },
  { path: 'messages', component: MessagesComponent },
  { path: 'settings', component: SettingsComponent },];
