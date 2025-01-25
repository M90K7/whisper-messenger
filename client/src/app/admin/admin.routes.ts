import { Routes } from '@angular/router';

import { UsersComponent } from "./users";
import { UiSettingComponent } from "./ui-setting";
import { MessagesComponent } from "./messages";

export const routes: Routes = [
  { path: '', redirectTo: 'users', pathMatch: 'prefix' },
  { path: 'users', component: UsersComponent },
  { path: 'messages', component: MessagesComponent },
  { path: 'ui-settings', component: UiSettingComponent },
  { path: "**", redirectTo: "" }
];
