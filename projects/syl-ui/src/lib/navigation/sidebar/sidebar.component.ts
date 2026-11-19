import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface SylSidebarItem {
  id: string;
  label: string;
  icon?: string;
  route?: string;
  badge?: string;
  active?: boolean;
}

@Component({
  selector: 'syl-sidebar',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <aside
      class="syl-sidebar"
      [class.syl-sidebar-collapsed]="collapsed()"
      [attr.aria-label]="ariaLabel()"
    >
      <div class="syl-sidebar-header">
        <ng-content select="[sylSidebarHeader]" />
      </div>
      <nav class="syl-sidebar-nav">
        <ng-content select="[sylSidebarNav]" />
        @for (item of items(); track item.id) {
          <button
            type="button"
            class="syl-sidebar-item"
            [class.syl-sidebar-item-active]="item.active"
            (click)="itemSelect.emit(item)"
          >
            <span class="syl-sidebar-item-label">{{ item.label }}</span>
            @if (item.badge && !collapsed()) {
              <span class="syl-sidebar-item-badge">{{ item.badge }}</span>
            }
          </button>
        }
      </nav>
      <div class="syl-sidebar-footer">
        <ng-content select="[sylSidebarFooter]" />
      </div>
    </aside>
  `,
  styles: [`
    :host {
      display: block;
      height: 100%;
    }

    .syl-sidebar {
      width: 16rem;
      height: 100%;
      background-color: var(--syl-surface, #141417);
      border-right: 1px solid var(--syl-border, #27272a);
      display: flex;
      flex-direction: column;
      transition: width 200ms ease;
    }

    .syl-sidebar-collapsed {
      width: 4.5rem;
    }

    .syl-sidebar-header {
      padding: 1.25rem;
      border-bottom: 1px solid var(--syl-border, #27272a);
    }

    .syl-sidebar-nav {
      flex: 1;
      overflow-y: auto;
      padding: 0.75rem;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .syl-sidebar-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
      padding: 0.625rem 0.875rem;
      border-radius: var(--syl-radius-md, 0.5rem);
      background: transparent;
      border: none;
      color: var(--syl-text-secondary, #a1a1aa);
      font-size: 0.875rem;
      font-weight: 500;
      text-align: left;
      cursor: pointer;
      transition: all 150ms ease;
    }

    .syl-sidebar-item:hover {
      background-color: var(--syl-surface-secondary, #1f1f24);
      color: var(--syl-text-primary, #ffffff);
    }

    .syl-sidebar-item-active {
      background-color: var(--syl-accent-subtle, rgba(229, 9, 20, 0.15));
      color: var(--syl-accent, #e50914);
      font-weight: 600;
    }

    .syl-sidebar-item-badge {
      font-size: 0.6875rem;
      padding: 0.125rem 0.375rem;
      border-radius: 9999px;
      background-color: var(--syl-surface-secondary, #27272a);
      color: var(--syl-text-muted, #71717a);
    }

    .syl-sidebar-footer {
      padding: 1rem;
      border-top: 1px solid var(--syl-border, #27272a);
    }
  `],
})
export class SylSidebarComponent {
  readonly collapsed = input<boolean>(false);
  readonly ariaLabel = input<string>('Sidebar navigation');
  readonly items = input<SylSidebarItem[]>([]);
  readonly itemSelect = output<SylSidebarItem>();
}
