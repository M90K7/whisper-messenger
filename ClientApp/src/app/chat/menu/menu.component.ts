import { Component } from '@angular/core';

import { MatToolbar } from "@angular/material/toolbar";
import { AuthService, ThemeService } from "@app/services";

@Component({
  selector: 'app-menu',
  imports: [MatToolbar],
  standalone: true,
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss'
})
export class MenuComponent {
  currentTheme: 'light' | 'dark';

  constructor(private themeService: ThemeService, private authService: AuthService) {
    this.currentTheme = themeService.getTheme();
  }

  ngOnInit() {
    this.themeService.loadSavedTheme();
  }

  toggleTheme() {
    const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    this.themeService.setTheme(newTheme);
    this.currentTheme = newTheme;
  }

  logout() {
    this.authService.logout();
    window.location.href = '/login';
  }
}
