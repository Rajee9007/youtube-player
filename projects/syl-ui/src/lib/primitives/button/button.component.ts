import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

export type SylButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type SylButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'syl-button',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      [type]="type()"
      [disabled]="disabled() || loading()"
      [attr.aria-disabled]="disabled() || loading()"
      [attr.aria-label]="ariaLabel() || null"
      [class]="buttonClasses()"
      (click)="handleClick($event)"
    >
      @if (loading()) {
        <span class="syl-btn-spinner" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" class="syl-spinner-svg">
            <circle class="syl-spinner-track" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="syl-spinner-head" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
          </svg>
        </span>
      }
      <span class="syl-btn-content" [class.syl-btn-content-loading]="loading()">
        <ng-content select="[sylPrefix]" />
        <ng-content />
        <ng-content select="[sylSuffix]" />
      </span>
    </button>
  `,
  styles: [`
    :host {
      display: inline-block;
    }

    button {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      font-weight: 600;
      line-height: 1.25;
      border-radius: var(--syl-radius-md, 0.5rem);
      border: 1px solid transparent;
      cursor: pointer;
      transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
      user-select: none;
      white-space: nowrap;
      text-decoration: none;
      outline: none;
    }

    button:focus-visible {
      box-shadow: 0 0 0 2px var(--syl-bg), 0 0 0 4px var(--syl-accent);
    }

    /* Sizes */
    .syl-btn-sm {
      padding: 0.375rem 0.75rem;
      font-size: 0.75rem;
      border-radius: var(--syl-radius-sm, 0.25rem);
    }
    .syl-btn-md {
      padding: 0.5rem 1rem;
      font-size: 0.875rem;
    }
    .syl-btn-lg {
      padding: 0.75rem 1.5rem;
      font-size: 1rem;
      border-radius: var(--syl-radius-lg, 0.75rem);
    }

    /* Full Width */
    .syl-btn-full {
      width: 100%;
    }

    /* Variants */
    .syl-btn-primary {
      background-color: var(--syl-accent, #e50914);
      color: var(--syl-accent-foreground, #ffffff);
      border-color: transparent;
    }
    .syl-btn-primary:hover:not(:disabled) {
      background-color: var(--syl-accent-hover, #b80710);
    }

    .syl-btn-secondary {
      background-color: var(--syl-surface-secondary, #1f1f24);
      color: var(--syl-text-primary, #ffffff);
      border-color: var(--syl-border, #27272a);
    }
    .syl-btn-secondary:hover:not(:disabled) {
      background-color: var(--syl-surface-tertiary, #2a2a32);
      border-color: var(--syl-border-subtle, #3f3f46);
    }

    .syl-btn-outline {
      background-color: transparent;
      color: var(--syl-text-primary, #ffffff);
      border-color: var(--syl-border, #27272a);
    }
    .syl-btn-outline:hover:not(:disabled) {
      background-color: var(--syl-surface-secondary, rgba(255, 255, 255, 0.05));
      border-color: var(--syl-text-secondary, #a1a1aa);
    }

    .syl-btn-ghost {
      background-color: transparent;
      color: var(--syl-text-secondary, #a1a1aa);
      border-color: transparent;
    }
    .syl-btn-ghost:hover:not(:disabled) {
      background-color: var(--syl-surface-secondary, rgba(255, 255, 255, 0.08));
      color: var(--syl-text-primary, #ffffff);
    }

    .syl-btn-danger {
      background-color: var(--syl-danger, #ef4444);
      color: #ffffff;
      border-color: transparent;
    }
    .syl-btn-danger:hover:not(:disabled) {
      background-color: #dc2626;
    }

    /* Disabled */
    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      pointer-events: none;
    }

    /* Spinner */
    .syl-btn-spinner {
      position: absolute;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
    .syl-spinner-svg {
      width: 1.125rem;
      height: 1.125rem;
      animation: syl-spin 800ms linear infinite;
    }
    .syl-spinner-track {
      opacity: 0.25;
    }
    .syl-spinner-head {
      opacity: 0.85;
    }
    @keyframes syl-spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    .syl-btn-content {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      transition: opacity 150ms ease;
    }
    .syl-btn-content-loading {
      opacity: 0;
    }
  `],
})
export class SylButtonComponent {
  readonly variant = input<SylButtonVariant>('primary');
  readonly size = input<SylButtonSize>('md');
  readonly disabled = input<boolean>(false);
  readonly loading = input<boolean>(false);
  readonly fullWidth = input<boolean>(false);
  readonly type = input<'button' | 'submit' | 'reset'>('button');
  readonly ariaLabel = input<string>('');

  readonly clicked = output<MouseEvent>();

  buttonClasses(): string {
    const v = this.variant();
    const s = this.size();
    const full = this.fullWidth() ? 'syl-btn-full' : '';
    return `syl-btn-${v} syl-btn-${s} ${full}`.trim();
  }

  handleClick(event: MouseEvent): void {
    if (!this.disabled() && !this.loading()) {
      this.clicked.emit(event);
    }
  }
}
