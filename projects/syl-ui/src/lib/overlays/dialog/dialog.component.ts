import { Component, input, output, ChangeDetectionStrategy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'syl-dialog',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (open()) {
      <div class="syl-dialog-backdrop" (click)="onBackdropClick($event)">
        <div
          class="syl-dialog-panel"
          [style.max-width]="maxWidth()"
          role="dialog"
          aria-modal="true"
          (click)="$event.stopPropagation()"
        >
          <div class="syl-dialog-header">
            @if (title()) {
              <h3 class="syl-dialog-title">{{ title() }}</h3>
            }
            <button
              type="button"
              class="syl-dialog-close"
              (click)="closed.emit()"
              aria-label="Close dialog"
            >
              ×
            </button>
          </div>
          <div class="syl-dialog-body">
            <ng-content />
          </div>
          <div class="syl-dialog-footer">
            <ng-content select="[sylDialogFooter]" />
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .syl-dialog-backdrop {
      position: fixed;
      inset: 0;
      z-index: 1050;
      background-color: rgba(0, 0, 0, 0.75);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
      animation: syl-fade-in 150ms ease;
    }

    @keyframes syl-fade-in {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .syl-dialog-panel {
      width: 100%;
      background-color: var(--syl-surface, #141417);
      border: 1px solid var(--syl-border, #27272a);
      border-radius: var(--syl-radius-lg, 0.75rem);
      box-shadow: var(--syl-shadow-lg, 0 20px 25px -5px rgba(0, 0, 0, 0.5));
      overflow: hidden;
      animation: syl-scale-in 150ms ease;
    }

    @keyframes syl-scale-in {
      from {
        opacity: 0;
        transform: scale(0.95);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }

    .syl-dialog-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem 1.25rem;
      border-bottom: 1px solid var(--syl-border, #27272a);
    }

    .syl-dialog-title {
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--syl-text-primary, #ffffff);
      margin: 0;
    }

    .syl-dialog-close {
      background: transparent;
      border: none;
      color: var(--syl-text-muted, #71717a);
      font-size: 1.5rem;
      line-height: 1;
      cursor: pointer;
      padding: 0 0.25rem;
    }

    .syl-dialog-close:hover {
      color: var(--syl-text-primary, #ffffff);
    }

    .syl-dialog-body {
      padding: 1.25rem;
    }

    .syl-dialog-footer {
      padding: 1rem 1.25rem;
      border-top: 1px solid var(--syl-border, #27272a);
      background-color: var(--syl-surface-secondary, rgba(255, 255, 255, 0.02));
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 0.75rem;
    }

    .syl-dialog-footer:empty {
      display: none;
    }
  `],
})
export class SylDialogComponent {
  readonly open = input<boolean>(false);
  readonly title = input<string>('');
  readonly maxWidth = input<string>('32rem');
  readonly closeOnBackdrop = input<boolean>(true);

  readonly closed = output<void>();

  onBackdropClick(event: MouseEvent): void {
    if (this.closeOnBackdrop()) {
      this.closed.emit();
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.open()) {
      this.closed.emit();
    }
  }
}
