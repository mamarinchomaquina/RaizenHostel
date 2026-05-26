import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Usuario, AuthResponse, LoginDTO, RegistroDTO } from '../models/usuario.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'rz_token';
  private readonly REFRESH_KEY = 'rz_refresh';
  private http = inject(HttpClient);
  private router = inject(Router);
  private base = `${environment.apiUrl}/auth`;

  currentUser = signal<Usuario | null>(this.loadUserFromToken());
  isLoggedIn  = computed(() => this.currentUser() !== null);
  isAdmin     = computed(() => this.currentUser()?.rol === 'admin');

  login(dto: LoginDTO): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.base}/login`, dto).pipe(
      tap(res => {
        localStorage.setItem(this.TOKEN_KEY, res.token);
        localStorage.setItem(this.REFRESH_KEY, res.refresh_token);
        this.currentUser.set(res.usuario);
      })
    );
  }

  getCaptcha(): Observable<{ challenge: string; key: string }> {
    return this.http.get<{ challenge: string; key: string }>(`${this.base}/captcha`);
  }


  registro(dto: RegistroDTO): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.base}/registro`, dto).pipe(
      tap(res => {
        localStorage.setItem(this.TOKEN_KEY, res.token);
        localStorage.setItem(this.REFRESH_KEY, res.refresh_token);
        this.currentUser.set(res.usuario);
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_KEY);
    this.currentUser.set(null);
    this.router.navigate(['/']);
  }

  adminLogout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_KEY);
    this.currentUser.set(null);
    this.router.navigate(['/raizen-admin/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private loadUserFromToken(): Usuario | null {
    const token = localStorage.getItem(this.TOKEN_KEY);
    if (!token) return null;
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      const payload = JSON.parse(atob(parts[1]));
      if (payload.exp * 1000 < Date.now()) {
        localStorage.removeItem(this.TOKEN_KEY);
        return null;
      }
      return payload.user as Usuario;
    } catch {
      return null;
    }
  }
}
