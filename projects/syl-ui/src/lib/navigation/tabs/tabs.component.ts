import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface SylTab {
  id: string;
  label: string;
  count?: number;
  disabled?: boolean;
}

@Component({
  selector: 'syl-tabs',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="syl-tabs-bar" role="tablist">
      @for (tab of tabs(); track tab.id) {
        <button
          type="button"
          role="tab"
          class="syl-tab-button"
          [class.syl-tab-active]="activeId() === tab.id"
          [disabled]="tab.disabled"
          [attr.aria-selected]="activeId() === tab.id"
          (click)="selectTab(tab.id)"
        >
          <span>{{ tab.label }}</span>
          @if (tab.count !== undefined) {
            <span class="syl-tab-badge">{{ tab.count }}</span>
          }
          @if (activeId() === tab.id) {
            <span class="syl-tab-indicator"></span>
          }
        </button>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }

    .syl-tabs-bar {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      border-bottom: 1px solid var(--syl-border, #27272a);
      position: relative;
    }

    .syl-tab-button {
      position: relative;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 0.25rem;
      background: transparent;
      border: none;
      color: var(--syl-text-secondary, #a1a1aa);
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: color 150ms ease;
    }

    .syl-tab-button:hover:not(:disabled) {
      color: var(--syl-text-primary, #ffffff);
    }

    .syl-tab-button.syl-tab-active {
      color: var(--syl-text-primary, #ffffff);
      font-weight: 600;
    }

    .syl-tab-button:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    .syl-tab-badge {
      font-size: 0.6875rem;
      padding: 0.125rem 0.375rem;
      border-radius: 9999px;
      background-color: var(--syl-surface-secondary, #27272a);
      color: var(--syl-text-secondary, #a1a1aa);
    }

    .syl-tab-indicator {
      position: absolute;
      bottom: -1px;
      left: 0;
      right: 0;
      height: 2px;
      background-color: var(--syl-accent, #e50914);
      border-radius: 2px 2px 0 0;
    }
  `],
})
export class SylTabsComponent {
  readonly tabs = input<SylTab[]>([]);
  readonly activeId = input<string>('');
  readonly tabChange = output<string>();

  selectTab(id: string): void {
    this.tabChange.emit(id);
  }
}
