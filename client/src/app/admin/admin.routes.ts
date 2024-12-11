import { Routes } from '@angular/router';

import { UsersComponent } from "./users";
import { SettingsComponent } from "./settings";

export const routes: Routes = [
  { path: '', redirectTo: 'users', pathMatch: 'prefix' },
  { path: 'users', component: UsersComponent },
  { path: 'settings', component: SettingsComponent },
];