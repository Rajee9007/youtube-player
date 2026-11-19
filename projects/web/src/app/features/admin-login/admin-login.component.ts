import { Component, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/auth/auth.service';
import {
  SylInputComponent,
  SylButtonComponent,
  SylAlertComponent,
} from '@seyyul/ui';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule, SylInputComponent, SylButtonComponent, SylAlertComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="syl-login-shell">
      <div class="syl-login-card">
        <div class="syl-login-header">
          <div class="syl-login-badge">SY</div>
          <h1 class="syl-login-title">Seyyul Administration</h1>
          <p class="syl-login-sub">Enter the administrative passphrase to manage videos and channels</p>
        </div>

        @if (errorMessage()) {
          <syl-alert variant="danger" [dismissible]="true" (dismissed)="errorMessage.set('')">
            {{ errorMessage() }}
          </syl-alert>
        }

        <form (ngSubmit)="onSubmit()" class="syl-login-form">
          <div class="syl-field-row">
            <label class="syl-label" for="admin-pass">Passphrase</label>
            <syl-input
              id="admin-pass"
              type="password"
              placeholder="Enter admin password (e.g. admin123)"
              [(ngModel)]="password"
              name="password"
            />
          </div>

          <syl-button
            type="submit"
            variant="primary"
            [fullWidth]="true"
            [loading]="loading()"
            size="lg"
          >
            Authenticate &amp; Access Dashboard
          </syl-button>
        </form>

        <div class="syl-login-footer">
          <p class="syl-hint">Demo credential: <code>admin123</code> or <code>seyyul2026</code></p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .syl-login-shell {
      min-height: 80vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
    }

    .syl-login-card {
      width: 100%;
      max-width: 28rem;
      background-color: var(--syl-surface, #141417);
      border: 1px solid var(--syl-border, #27272a);
      border-radius: var(--syl-radius-lg, 1rem);
      padding: 2.5rem;
      box-shadow: var(--syl-shadow-lg, 0 20px 25px -5px rgba(0, 0, 0, 0.5));
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .syl-login-header {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }

    .syl-login-badge {
      width: 3rem;
      height: 3rem;
      border-radius: var(--syl-radius-md, 0.5rem);
      background-color: var(--syl-accent, #e50914);
      color: #ffffff;
      font-size: 1.25rem;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1rem;
      box-shadow: 0 4px 12px rgba(229, 9, 20, 0.4);
    }

    .syl-login-title {
      font-size: 1.5rem;
      font-weight: 800;
      color: var(--syl-text-primary, #ffffff);
      margin: 0 0 0.375rem 0;
    }

    .syl-login-sub {
      font-size: 0.875rem;
      color: var(--syl-text-secondary, #a1a1aa);
      margin: 0;
      line-height: 1.4;
    }

    .syl-login-form {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .syl-field-row {
      display: flex;
      flex-direction: column;
      gap: 0.375rem;
    }

    .syl-label {
      font-size: 0.8125rem;
      font-weight: 600;
      color: var(--syl-text-secondary, #a1a1aa);
    }

    .syl-login-footer {
      text-align: center;
      padding-top: 1rem;
      border-top: 1px solid var(--syl-border, #27272a);
    }

    .syl-hint {
      font-size: 0.8125rem;
      color: var(--syl-text-muted, #71717a);
      margin: 0;
    }

    .syl-hint code {
      color: var(--syl-accent, #e50914);
      font-weight: 600;
    }
  `],
})
export class AdminLoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  password = '';
  readonly loading = signal<boolean>(false);
  readonly errorMessage = signal<string>('');

  onSubmit(): void {
    if (!this.password) return;
    this.loading.set(true);
    this.errorMessage.set('');

    this.auth.login(this.password).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/admin']);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err?.message || 'Authentication failed');
      },
    });
  }
}
