import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface SylMenuItem {
  id: string;
  label: string;
  icon?: string;
  danger?: boolean;
  disabled?: boolean;
}

@Component({
  selector: 'syl-menu',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="syl-menu" role="menu">
      @for (item of items(); track item.id) {
        <button
          type="button"
          role="menuitem"
          class="syl-menu-item"
          [class.syl-menu-item-danger]="item.danger"
          [disabled]="item.disabled"
          (click)="itemClick.emit(item)"
        >
          <span>{{ item.label }}</span>
        </button>
      }
    </div>
  `,
  styles: [`
    .syl-menu {
      min-width: 12rem;
      padding: 0.375rem;
      border-radius: var(--syl-radius-md, 0.5rem);
      background-color: var(--syl-surface, #141417);
      border: 1px solid var(--syl-border, #27272a);
      box-shadow: var(--syl-shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, 0.4));
      display: flex;
      flex-direction: column;
      gap: 0.125rem;
    }

    .syl-menu-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      width: 100%;
      padding: 0.5rem 0.75rem;
      border-radius: var(--syl-radius-sm, 0.25rem);
      background: transparent;
      border: none;
      color: var(--syl-text-primary, #ffffff);
      font-size: 0.8125rem;
      font-weight: 500;
      text-align: left;
      cursor: pointer;
      transition: background-color 150ms ease;
    }

    .syl-menu-item:hover:not(:disabled) {
      background-color: var(--syl-surface-secondary, #1f1f24);
    }

    .syl-menu-item-danger {
      color: var(--syl-danger, #ef4444);
    }

    .syl-menu-item-danger:hover:not(:disabled) {
      background-color: rgba(239, 68, 68, 0.12);
    }

    .syl-menu-item:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
  `],
})
export class SylMenuComponent {
  readonly items = input<SylMenuItem[]>([]);
  readonly itemClick = output<SylMenuItem>();
}
