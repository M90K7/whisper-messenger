import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private currentTheme: 'light' | 'dark' = 'light';

  setTheme(theme: 'light' | 'dark') {
    this.currentTheme = theme;
    document.body.classList.remove('light-theme', 'dark-theme');
    document.body.classList.add(`${theme}-theme`);
    localStorage.setItem('theme', theme);
  }

  getTheme(): 'light' | 'dark' {
    return this.currentTheme;
  }

  loadSavedTheme() {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';
    if (savedTheme) {
      this.setTheme(savedTheme);
    }
  }
}
