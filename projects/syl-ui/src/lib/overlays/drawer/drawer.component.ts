import { Component, input, output, ChangeDetectionStrategy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'syl-drawer',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (open()) {
      <div class="syl-drawer-backdrop" (click)="closed.emit()">
        <div
          class="syl-drawer-panel"
          [class.syl-drawer-left]="position() === 'left'"
          [class.syl-drawer-right]="position() === 'right'"
          [style.width]="width()"
          role="dialog"
          aria-modal="true"
          (click)="$event.stopPropagation()"
        >
          <div class="syl-drawer-header">
            @if (title()) {
              <h3 class="syl-drawer-title">{{ title() }}</h3>
            }
            <button
              type="button"
              class="syl-drawer-close"
              (click)="closed.emit()"
              aria-label="Close drawer"
            >
              ×
            </button>
          </div>
          <div class="syl-drawer-body">
            <ng-content />
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .syl-drawer-backdrop {
      position: fixed;
      inset: 0;
      z-index: 1050;
      background-color: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(2px);
      display: flex;
    }

    .syl-drawer-panel {
      height: 100%;
      background-color: var(--syl-surface, #141417);
      border-color: var(--syl-border, #27272a);
      display: flex;
      flex-direction: column;
      box-shadow: var(--syl-shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, 0.5));
      animation: syl-drawer-slide 200ms ease;
    }

    .syl-drawer-left {
      margin-right: auto;
      border-right: 1px solid var(--syl-border, #27272a);
    }

    .syl-drawer-right {
      margin-left: auto;
      border-left: 1px solid var(--syl-border, #27272a);
    }

    @keyframes syl-drawer-slide {
      from { transform: translateX(100%); }
      to { transform: translateX(0); }
    }

    .syl-drawer-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem 1.25rem;
      border-bottom: 1px solid var(--syl-border, #27272a);
    }

    .syl-drawer-title {
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--syl-text-primary, #ffffff);
      margin: 0;
    }

    .syl-drawer-close {
      background: transparent;
      border: none;
      color: var(--syl-text-muted, #71717a);
      font-size: 1.5rem;
      line-height: 1;
      cursor: pointer;
    }

    .syl-drawer-body {
      flex: 1;
      overflow-y: auto;
      padding: 1.25rem;
    }
  `],
})
export class SylDrawerComponent {
  readonly open = input<boolean>(false);
  readonly title = input<string>('');
  readonly width = input<string>('24rem');
  readonly position = input<'left' | 'right'>('right');

  readonly closed = output<void>();

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.open()) {
      this.closed.emit();
    }
  }
}
