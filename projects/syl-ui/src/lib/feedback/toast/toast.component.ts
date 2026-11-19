import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SylToastService } from './toast.service';

@Component({
  selector: 'syl-toast-container',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="syl-toast-viewport" aria-live="polite" aria-atomic="true">
      @for (toast of toastService.toasts(); track toast.id) {
        <div
          class="syl-toast"
          [class.syl-toast-info]="toast.variant === 'info'"
          [class.syl-toast-success]="toast.variant === 'success'"
          [class.syl-toast-warning]="toast.variant === 'warning'"
          [class.syl-toast-danger]="toast.variant === 'danger'"
        >
          <div class="syl-toast-body">
            @if (toast.title) {
              <strong class="syl-toast-title">{{ toast.title }}</strong>
            }
            <span class="syl-toast-msg">{{ toast.message }}</span>
          </div>
          <button
            type="button"
            class="syl-toast-dismiss"
            (click)="toastService.dismiss(toast.id)"
            aria-label="Dismiss toast"
          >
            ×
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .syl-toast-viewport {
      position: fixed;
      bottom: 1.5rem;
      right: 1.5rem;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      max-width: 24rem;
      width: calc(100% - 3rem);
      pointer-events: none;
    }

    .syl-toast {
      pointer-events: auto;
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 0.75rem;
      padding: 0.875rem 1rem;
      border-radius: var(--syl-radius-md, 0.5rem);
      background-color: var(--syl-surface, #141417);
      border: 1px solid var(--syl-border, #27272a);
      box-shadow: var(--syl-shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, 0.4));
      animation: syl-toast-slide 200ms ease;
    }

    @keyframes syl-toast-slide {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .syl-toast-success {
      border-left: 4px solid var(--syl-success, #10b981);
    }
    .syl-toast-danger {
      border-left: 4px solid var(--syl-danger, #ef4444);
    }
    .syl-toast-warning {
      border-left: 4px solid var(--syl-warning, #f59e0b);
    }
    .syl-toast-info {
      border-left: 4px solid var(--syl-accent, #e50914);
    }

    .syl-toast-body {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.125rem;
    }

    .syl-toast-title {
      font-size: 0.875rem;
      color: var(--syl-text-primary, #ffffff);
    }

    .syl-toast-msg {
      font-size: 0.8125rem;
      color: var(--syl-text-secondary, #a1a1aa);
    }

    .syl-toast-dismiss {
      background: transparent;
      border: none;
      color: var(--syl-text-muted, #71717a);
      font-size: 1.25rem;
      line-height: 1;
      cursor: pointer;
    }

    .syl-toast-dismiss:hover {
      color: var(--syl-text-primary, #ffffff);
    }
  `],
})
export class SylToastContainerComponent {
  readonly toastService = inject(SylToastService);
}
