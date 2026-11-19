import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

export type SylBadgeVariant = 'default' | 'accent' | 'success' | 'warning' | 'danger' | 'info';
export type SylBadgeSize = 'sm' | 'md';

@Component({
  selector: 'syl-badge',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span
      class="syl-badge"
      [class.syl-badge-default]="variant() === 'default'"
      [class.syl-badge-accent]="variant() === 'accent'"
      [class.syl-badge-success]="variant() === 'success'"
      [class.syl-badge-warning]="variant() === 'warning'"
      [class.syl-badge-danger]="variant() === 'danger'"
      [class.syl-badge-info]="variant() === 'info'"
      [class.syl-badge-sm]="size() === 'sm'"
      [class.syl-badge-md]="size() === 'md'"
      [class.syl-badge-pill]="pill()"
    >
      <ng-content />
    </span>
  `,
  styles: [`
    :host {
      display: inline-flex;
    }

    .syl-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      font-weight: 600;
      line-height: 1;
      border-radius: var(--syl-radius-sm, 0.25rem);
      text-transform: none;
      letter-spacing: 0.02em;
    }

    .syl-badge-sm {
      padding: 0.2rem 0.45rem;
      font-size: 0.6875rem;
    }

    .syl-badge-md {
      padding: 0.3rem 0.65rem;
      font-size: 0.75rem;
    }

    .syl-badge-pill {
      border-radius: var(--syl-radius-full, 9999px);
    }

    .syl-badge-default {
      background-color: var(--syl-surface-secondary, #27272a);
      color: var(--syl-text-secondary, #a1a1aa);
      border: 1px solid var(--syl-border, #3f3f46);
    }

    .syl-badge-accent {
      background-color: var(--syl-accent-subtle, rgba(229, 9, 20, 0.15));
      color: var(--syl-accent, #e50914);
      border: 1px solid var(--syl-accent, #e50914);
    }

    .syl-badge-success {
      background-color: rgba(16, 185, 129, 0.15);
      color: var(--syl-success, #10b981);
      border: 1px solid rgba(16, 185, 129, 0.3);
    }

    .syl-badge-warning {
      background-color: rgba(245, 158, 11, 0.15);
      color: var(--syl-warning, #f59e0b);
      border: 1px solid rgba(245, 158, 11, 0.3);
    }

    .syl-badge-danger {
      background-color: rgba(239, 68, 68, 0.15);
      color: var(--syl-danger, #ef4444);
      border: 1px solid rgba(239, 68, 68, 0.3);
    }

    .syl-badge-info {
      background-color: rgba(59, 130, 246, 0.15);
      color: var(--syl-info, #3b82f6);
      border: 1px solid rgba(59, 130, 246, 0.3);
    }
  `],
})
export class SylBadgeComponent {
  readonly variant = input<SylBadgeVariant>('default');
  readonly size = input<SylBadgeSize>('md');
  readonly pill = input<boolean>(false);
}
