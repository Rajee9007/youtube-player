import { Component, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  SylNavbarComponent,
  SylThemeSwitcherComponent,
  SylInputComponent,
  SylToastContainerComponent,
} from '@seyyul/ui';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    FormsModule,
    SylNavbarComponent,
    SylThemeSwitcherComponent,
    SylInputComponent,
    SylToastContainerComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="syl-site-container">
      <syl-navbar [sticky]="true">
        <div sylBrand class="syl-brand-box">
          <a routerLink="/" class="syl-brand-link">
            <span class="syl-logo-badge">SY</span>
            <div class="syl-brand-names">
              <span class="syl-brand-title">SEYYUL</span>
              <span class="syl-brand-sub">VIDEO HUB</span>
            </div>
          </a>
        </div>

        <div sylCenter class="syl-nav-center-box">
          <div class="syl-search-bar">
            <syl-input
              [placeholder]="'Search across 5 Seyyul channels...'"
              [clearable]="true"
              [(ngModel)]="searchQuery"
              (keydown.enter)="onSearch()"
            >
              <span sylPrefix class="syl-search-icon">
                <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                  <path fill-rule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clip-rule="evenodd" />
                </svg>
              </span>
            </syl-input>
          </div>
        </div>

        <div sylActions class="syl-nav-links">
          <a routerLink="/channels" class="syl-nav-item">Channels</a>
          <a routerLink="/playlists" class="syl-nav-item">Playlists</a>
          <a routerLink="/design-system" class="syl-nav-item syl-nav-ds">Design System</a>
          <syl-theme-switcher />
          <a routerLink="/admin" class="syl-admin-portal-link" title="Admin Portal">
            <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
              <path fill-rule="evenodd" d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" clip-rule="evenodd" />
            </svg>
          </a>
        </div>
      </syl-navbar>

      <main class="syl-main-content">
        <router-outlet />
      </main>

      <footer class="syl-footer">
        <div class="syl-footer-inner">
          <div class="syl-footer-brand">
            <div class="syl-brand-box">
              <span class="syl-logo-badge">SY</span>
              <div class="syl-brand-names">
                <span class="syl-brand-title">SEYYUL</span>
                <span class="syl-brand-sub">VIDEO HUB</span>
              </div>
            </div>
            <p class="syl-footer-tagline">
              A unified discovery hub presenting curated stories, literature, spiritual journeys, and animations from five Seyyul channels.
            </p>
          </div>

          <div class="syl-footer-col">
            <h5 class="syl-col-heading">Channels</h5>
            <ul class="syl-col-list">
              <li><a routerLink="/channels/seyyul-kids">Seyyul Kids</a></li>
              <li><a routerLink="/channels/seyyul-education">Seyyul Education</a></li>
              <li><a routerLink="/channels/seyyul-aanmeegam">Seyyul Aanmeegam</a></li>
              <li><a routerLink="/channels/seyyul-toonz">Seyyul Toonz</a></li>
              <li><a routerLink="/channels/seyyul-entertainment">Seyyul Entertainment</a></li>
            </ul>
          </div>

          <div class="syl-footer-col">
            <h5 class="syl-col-heading">Platform</h5>
            <ul class="syl-col-list">
              <li><a routerLink="/">Home Discovery</a></li>
              <li><a routerLink="/channels">All Channels</a></li>
              <li><a routerLink="/playlists">Curated Playlists</a></li>
              <li><a routerLink="/design-system">SYL Design System (10 Themes)</a></li>
              <li><a routerLink="/admin">Admin Management</a></li>
            </ul>
          </div>

          <div class="syl-footer-col">
            <h5 class="syl-col-heading">Compliance</h5>
            <ul class="syl-col-list">
              <li>Official YouTube IFrame Integration</li>
              <li>Child-Directed Content Compliance</li>
              <li>WCAG 2.2 AA Accessibility</li>
              <li>Privacy-Enhanced Mode</li>
            </ul>
          </div>
        </div>

        <div class="syl-footer-bottom">
          <span>&copy; 2026 Seyyul Media Network. All rights reserved.</span>
          <span>Powered by SYL Design System &amp; Angular 20</span>
        </div>
      </footer>

      <syl-toast-container />
    </div>
  `,
  styles: [`
    .syl-site-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .syl-brand-box {
      display: flex;
      align-items: center;
      gap: 0.625rem;
    }

    .syl-brand-link {
      display: flex;
      align-items: center;
      gap: 0.625rem;
      text-decoration: none;
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
      letter-spacing: -0.05em;
      box-shadow: 0 2px 8px rgba(229, 9, 20, 0.4);
    }

    .syl-brand-names {
      display: flex;
      flex-direction: column;
    }

    .syl-brand-title {
      font-size: 1.125rem;
      font-weight: 800;
      letter-spacing: 0.08em;
      color: var(--syl-text-primary, #ffffff);
      line-height: 1.1;
    }

    .syl-brand-sub {
      font-size: 0.625rem;
      font-weight: 600;
      letter-spacing: 0.15em;
      color: var(--syl-text-muted, #71717a);
    }

    .syl-nav-center-box {
      width: 100%;
      max-width: 32rem;
    }

    .syl-search-bar {
      width: 100%;
    }

    .syl-search-icon {
      color: var(--syl-text-muted, #71717a);
      display: flex;
      align-items: center;
    }

    .syl-nav-links {
      display: flex;
      align-items: center;
      gap: 1.25rem;
    }

    .syl-nav-item {
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--syl-text-secondary, #a1a1aa);
      transition: color 150ms ease;
    }

    .syl-nav-item:hover {
      color: var(--syl-text-primary, #ffffff);
    }

    .syl-nav-ds {
      padding: 0.25rem 0.625rem;
      border-radius: var(--syl-radius-full, 9999px);
      background-color: var(--syl-surface-secondary, #1f1f24);
      border: 1px solid var(--syl-border, #27272a);
    }

    .syl-admin-portal-link {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0.45rem;
      border-radius: var(--syl-radius-full, 9999px);
      color: var(--syl-text-secondary, #a1a1aa);
      background-color: var(--syl-surface-secondary, #1f1f24);
      border: 1px solid var(--syl-border, #27272a);
      transition: all 150ms ease;
    }

    .syl-admin-portal-link:hover {
      color: var(--syl-text-primary, #ffffff);
      border-color: var(--syl-accent, #e50914);
    }

    .syl-main-content {
      flex: 1;
      width: 100%;
      max-width: 1400px;
      margin: 0 auto;
      padding: 1.5rem 1.25rem 3rem 1.25rem;
    }

    /* Footer */
    .syl-footer {
      background-color: var(--syl-surface, #141417);
      border-top: 1px solid var(--syl-border, #27272a);
      padding: 3rem 1.25rem 1.5rem 1.25rem;
      margin-top: auto;
    }

    .syl-footer-inner {
      max-width: 1400px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: 2fr repeat(3, 1fr);
      gap: 2.5rem;
      padding-bottom: 2.5rem;
      border-bottom: 1px solid var(--syl-border, #27272a);
    }

    @media (max-width: 900px) {
      .syl-footer-inner {
        grid-template-columns: 1fr;
        gap: 2rem;
      }
    }

    .syl-footer-tagline {
      font-size: 0.875rem;
      color: var(--syl-text-secondary, #a1a1aa);
      margin-top: 1rem;
      max-width: 24rem;
      line-height: 1.5;
    }

    .syl-col-heading {
      font-size: 0.8125rem;
      font-weight: 700;
      color: var(--syl-text-primary, #ffffff);
      text-transform: uppercase;
      letter-spacing: 0.08em;
      margin: 0 0 1rem 0;
    }

    .syl-col-list {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      font-size: 0.875rem;
      color: var(--syl-text-secondary, #a1a1aa);
    }

    .syl-col-list a {
      transition: color 150ms ease;
    }

    .syl-col-list a:hover {
      color: var(--syl-accent, #e50914);
    }

    .syl-footer-bottom {
      max-width: 1400px;
      margin: 1.5rem auto 0 auto;
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      gap: 1rem;
      font-size: 0.75rem;
      color: var(--syl-text-muted, #71717a);
    }
  `],
})
export class PublicLayoutComponent {
  private readonly router = inject(Router);
  searchQuery = '';

  onSearch(): void {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/search'], { queryParams: { q: this.searchQuery.trim() } });
    }
  }
}
