import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface SylBreadcrumbItem {
  label: string;
  url?: string;
}

@Component({
  selector: 'syl-breadcrumb',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav class="syl-breadcrumb" aria-label="Breadcrumb">
      <ol class="syl-breadcrumb-list">
        @for (item of items(); track $index; let last = $last) {
          <li class="syl-breadcrumb-item">
            @if (!last) {
              <a
                class="syl-breadcrumb-link"
                [href]="item.url || 'javascript:void(0)'"
                (click)="itemClick.emit(item)"
              >
                {{ item.label }}
              </a>
              <span class="syl-breadcrumb-separator" aria-hidden="true">/</span>
            } @else {
              <span class="syl-breadcrumb-current" aria-current="page">{{ item.label }}</span>
            }
          </li>
        }
      </ol>
    </nav>
  `,
  styles: [`
    .syl-breadcrumb-list {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      list-style: none;
      padding: 0;
      margin: 0;
      gap: 0.375rem;
      font-size: 0.8125rem;
    }

    .syl-breadcrumb-item {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
    }

    .syl-breadcrumb-link {
      color: var(--syl-text-secondary, #a1a1aa);
      text-decoration: none;
      transition: color 150ms ease;
    }

    .syl-breadcrumb-link:hover {
      color: var(--syl-text-primary, #ffffff);
    }

    .syl-breadcrumb-separator {
      color: var(--syl-text-muted, #71717a);
    }

    .syl-breadcrumb-current {
      color: var(--syl-text-primary, #ffffff);
      font-weight: 600;
    }
  `],
})
export class SylBreadcrumbComponent {
  readonly items = input<SylBreadcrumbItem[]>([]);
  readonly itemClick = output<SylBreadcrumbItem>();
}
