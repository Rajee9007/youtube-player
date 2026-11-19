import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { SylThemeSwitcherComponent, SylToastContainerComponent } from '@seyyul/ui';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    SylThemeSwitcherComponent,
    SylToastContainerComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="syl-admin-shell">
      <aside class="syl-admin-sidebar">
        <div class="syl-admin-brand">
          <div class="syl-logo-badge">SY</div>
          <div class="syl-admin-brand-text">
            <span class="syl-brand-name">SEYYUL</span>
            <span class="syl-badge-admin">Admin Control</span>
          </div>
        </div>

        <nav class="syl-admin-nav">
          <a routerLink="/admin" routerLinkActive="syl-admin-link-active" [routerLinkActiveOptions]="{ exact: true }" class="syl-admin-nav-item">
            <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
              <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
              <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
            </svg>
            <span>Dashboard</span>
          </a>

          <a routerLink="/admin/channels" routerLinkActive="syl-admin-link-active" class="syl-admin-nav-item">
            <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
              <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
            </svg>
            <span>Channels (5)</span>
          </a>

          <a routerLink="/admin/videos" routerLinkActive="syl-admin-link-active" class="syl-admin-nav-item">
            <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
              <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
            </svg>
            <span>Videos</span>
          </a>

          <a routerLink="/admin/playlists" routerLinkActive="syl-admin-link-active" class="syl-admin-nav-item">
            <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
              <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
            </svg>
            <span>Playlists</span>
          </a>

          <a routerLink="/admin/categories" routerLinkActive="syl-admin-link-active" class="syl-admin-nav-item">
            <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
              <path fill-rule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" />
            </svg>
            <span>Categories</span>
          </a>

          <a routerLink="/admin/settings" routerLinkActive="syl-admin-link-active" class="syl-admin-nav-item">
            <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
              <path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd" />
            </svg>
            <span>Settings</span>
          </a>
        </nav>

        <div class="syl-admin-footer">
          <a routerLink="/" class="syl-back-web">
            ← Back to Public Website
          </a>
          <button type="button" class="syl-btn-logout" (click)="authService.logout()">
            Sign Out
          </button>
        </div>
      </aside>

      <div class="syl-admin-main">
        <header class="syl-admin-topbar">
          <div class="syl-topbar-left">
            <span class="syl-topbar-user">Logged in as {{ authService.currentUser()?.name || 'Administrator' }}</span>
          </div>
          <div class="syl-topbar-right">
            <syl-theme-switcher />
          </div>
        </header>

        <section class="syl-admin-content-area">
          <router-outlet />
        </section>
      </div>

      <syl-toast-container />
    </div>
  `,
  styles: [`
    .syl-admin-shell {
      display: flex;
      min-height: 100vh;
      background-color: var(--syl-bg, #09090b);
    }

    .syl-admin-sidebar {
      width: 16rem;
      background-color: var(--syl-surface, #141417);
      border-right: 1px solid var(--syl-border, #27272a);
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
    }

    .syl-admin-brand {
      padding: 1.25rem;
      border-bottom: 1px solid var(--syl-border, #27272a);
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .syl-logo-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 2.25rem;
      height: 2.25rem;
      border-radius: var(--syl-radius-md, 0.5rem);
      background-color: var(--syl-accent, #e50914);
      color: #ffffff;
      font-weight: 800;
      font-size: 0.9375rem;
    }

    .syl-admin-brand-text {
      display: flex;
      flex-direction: column;
    }

    .syl-brand-name {
      font-size: 1rem;
      font-weight: 800;
      letter-spacing: 0.08em;
      color: var(--syl-text-primary, #ffffff);
    }

    .syl-badge-admin {
      font-size: 0.625rem;
      color: var(--syl-accent, #e50914);
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .syl-admin-nav {
      flex: 1;
      padding: 1rem 0.75rem;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .syl-admin-nav-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.625rem 0.875rem;
      border-radius: var(--syl-radius-md, 0.5rem);
      color: var(--syl-text-secondary, #a1a1aa);
      font-size: 0.875rem;
      font-weight: 500;
      transition: all 150ms ease;
    }

    .syl-admin-nav-item:hover {
      background-color: var(--syl-surface-secondary, #1f1f24);
      color: var(--syl-text-primary, #ffffff);
    }

    .syl-admin-link-active {
      background-color: var(--syl-accent-subtle, rgba(229, 9, 20, 0.15)) !important;
      color: var(--syl-accent, #e50914) !important;
      font-weight: 600;
    }

    .syl-admin-footer {
      padding: 1rem;
      border-top: 1px solid var(--syl-border, #27272a);
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .syl-back-web {
      font-size: 0.8125rem;
      color: var(--syl-text-secondary, #a1a1aa);
      transition: color 150ms ease;
    }

    .syl-back-web:hover {
      color: var(--syl-text-primary, #ffffff);
    }

    .syl-btn-logout {
      width: 100%;
      padding: 0.5rem;
      border-radius: var(--syl-radius-md, 0.5rem);
      background: transparent;
      border: 1px solid var(--syl-border, #27272a);
      color: var(--syl-danger, #ef4444);
      font-size: 0.8125rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 150ms ease;
    }

    .syl-btn-logout:hover {
      background-color: rgba(239, 68, 68, 0.1);
    }

    .syl-admin-main {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    .syl-admin-topbar {
      height: 4rem;
      background-color: var(--syl-surface, #141417);
      border-bottom: 1px solid var(--syl-border, #27272a);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 1.5rem;
    }

    .syl-topbar-user {
      font-size: 0.875rem;
      color: var(--syl-text-secondary, #a1a1aa);
    }

    .syl-admin-content-area {
      flex: 1;
      padding: 2rem;
      overflow-y: auto;
    }
  `],
})
export class AdminLayoutComponent {
  readonly authService = inject(AuthService);
}
