import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

export type SylAlertVariant = 'info' | 'success' | 'warning' | 'danger';

@Component({
  selector: 'syl-alert',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="syl-alert"
      [class.syl-alert-info]="variant() === 'info'"
      [class.syl-alert-success]="variant() === 'success'"
      [class.syl-alert-warning]="variant() === 'warning'"
      [class.syl-alert-danger]="variant() === 'danger'"
      role="alert"
    >
      <div class="syl-alert-content">
        @if (title()) {
          <h4 class="syl-alert-title">{{ title() }}</h4>
        }
        <div class="syl-alert-message">
          <ng-content />
        </div>
      </div>
      @if (dismissible()) {
        <button
          type="button"
          class="syl-alert-close"
          (click)="dismissed.emit()"
          aria-label="Dismiss alert"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
          </svg>
        </button>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }

    .syl-alert {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 0.75rem;
      padding: 0.875rem 1rem;
      border-radius: var(--syl-radius-md, 0.5rem);
      font-size: 0.875rem;
      line-height: 1.4;
      border: 1px solid transparent;
    }

    .syl-alert-info {
      background-color: rgba(59, 130, 246, 0.1);
      border-color: rgba(59, 130, 246, 0.25);
      color: #93c5fd;
    }

    .syl-alert-success {
      background-color: rgba(16, 185, 129, 0.1);
      border-color: rgba(16, 185, 129, 0.25);
      color: #6ee7b7;
    }

    .syl-alert-warning {
      background-color: rgba(245, 158, 11, 0.1);
      border-color: rgba(245, 158, 11, 0.25);
      color: #fcd34d;
    }

    .syl-alert-danger {
      background-color: rgba(239, 68, 68, 0.1);
      border-color: rgba(239, 68, 68, 0.25);
      color: #fca5a5;
    }

    .syl-alert-content {
      flex: 1;
    }

    .syl-alert-title {
      font-weight: 600;
      margin: 0 0 0.25rem 0;
      color: #ffffff;
    }

    .syl-alert-close {
      background: transparent;
      border: none;
      color: currentColor;
      opacity: 0.7;
      cursor: pointer;
      padding: 0.25rem;
      line-height: 0;
    }

    .syl-alert-close:hover {
      opacity: 1;
    }
  `],
})
export class SylAlertComponent {
  readonly variant = input<SylAlertVariant>('info');
  readonly title = input<string>('');
  readonly dismissible = input<boolean>(false);
  readonly dismissed = output<void>();
}
