import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { API_BASE_URL } from '../api.config';

const TOKEN_KEY = 'acopiored_token';
const USER_KEY = 'acopiored_user';

export interface AuthUser {
  id: string;
  username: string;
  nombre: string;
  role: string;
}

interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  isAuthenticated = signal<boolean>(false);
  currentUser = signal<AuthUser | null>(null);

  constructor(private http: HttpClient, private router: Router) {
    const token = this.getToken();
    const user = localStorage.getItem(USER_KEY);
    if (token && user) {
      this.isAuthenticated.set(true);
      this.currentUser.set(JSON.parse(user));
    }
  }

  login(username: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${API_BASE_URL}/auth/login`, { username, password }).pipe(
      tap((res) => {
        localStorage.setItem(TOKEN_KEY, res.accessToken);
        localStorage.setItem(USER_KEY, JSON.stringify(res.user));
        this.isAuthenticated.set(true);
        this.currentUser.set(res.user);
        this.router.navigate(['/dashboard']);
      }),
    );
  }

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.isAuthenticated.set(false);
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }
}
