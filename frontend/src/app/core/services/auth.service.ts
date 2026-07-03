import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Simulating an active session using Angular signals
  isAuthenticated = signal<boolean>(false);
  currentUser = signal<{ username: string, role: string } | null>(null);

  constructor(private router: Router) {
    // Check local storage on init
    const token = localStorage.getItem('acopiored_token');
    if (token === 'admin_token_123') {
      this.isAuthenticated.set(true);
      this.currentUser.set({ username: 'Admin', role: 'Administrador' });
    }
  }

  login(username: string, clave: string): boolean {
    if (username === 'admin' && clave === 'admin123') {
      localStorage.setItem('acopiored_token', 'admin_token_123');
      this.isAuthenticated.set(true);
      this.currentUser.set({ username: 'Admin', role: 'Administrador' });
      this.router.navigate(['/dashboard']);
      return true;
    }
    return false;
  }

  logout() {
    localStorage.removeItem('acopiored_token');
    this.isAuthenticated.set(false);
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }
}
