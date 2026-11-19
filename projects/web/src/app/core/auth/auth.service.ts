import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { MockApiAdapter } from '../mock/mock-api.adapter';
import { AuthSession } from '../../shared/models/api-response.model';

const AUTH_KEY = 'syl_admin_session';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly router = inject(Router);
  private readonly mockApi = inject(MockApiAdapter);

  readonly session = signal<AuthSession | null>(this.getStoredSession());
  readonly isAuthenticated = computed<boolean>(() => !!this.session()?.token);
  readonly currentUser = computed(() => this.session()?.user ?? null);

  login(password: string): Observable<any> {
    return this.mockApi.adminLogin(password).pipe(
      tap((res) => {
        if (res.success && res.data) {
          this.setSession(res.data);
        }
      })
    );
  }

  logout(): void {
    try {
      localStorage.removeItem(AUTH_KEY);
    } catch {}
    this.session.set(null);
    this.router.navigate(['/admin/login']);
  }

  private setSession(session: AuthSession): void {
    try {
      localStorage.setItem(AUTH_KEY, JSON.stringify(session));
    } catch {}
    this.session.set(session);
  }

  private getStoredSession(): AuthSession | null {
    try {
      const data = localStorage.getItem(AUTH_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }
}
