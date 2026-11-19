import { Component, input, output, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'syl-pagination',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (totalPages() > 1) {
      <nav class="syl-pagination" aria-label="Pagination">
        <button
          type="button"
          class="syl-page-btn"
          [disabled]="currentPage() <= 1"
          (click)="onPageChange(currentPage() - 1)"
          aria-label="Previous page"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
            <path fill-rule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clip-rule="evenodd" />
          </svg>
        </button>

        @for (page of visiblePages(); track $index) {
          @if (page === -1) {
            <span class="syl-page-ellipsis">…</span>
          } @else {
            <button
              type="button"
              class="syl-page-btn"
              [class.syl-page-active]="currentPage() === page"
              [attr.aria-current]="currentPage() === page ? 'page' : null"
              (click)="onPageChange(page)"
            >
              {{ page }}
            </button>
          }
        }

        <button
          type="button"
          class="syl-page-btn"
          [disabled]="currentPage() >= totalPages()"
          (click)="onPageChange(currentPage() + 1)"
          aria-label="Next page"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
            <path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clip-rule="evenodd" />
          </svg>
        </button>
      </nav>
    }
  `,
  styles: [`
    .syl-pagination {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.375rem;
      margin: 1.5rem 0;
    }

    .syl-page-btn {
      min-width: 2.25rem;
      height: 2.25rem;
      padding: 0 0.5rem;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--syl-radius-md, 0.5rem);
      background-color: var(--syl-surface-secondary, #18181b);
      border: 1px solid var(--syl-border, #27272a);
      color: var(--syl-text-secondary, #a1a1aa);
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 150ms ease;
    }

    .syl-page-btn:hover:not(:disabled) {
      background-color: var(--syl-surface-tertiary, #2a2a32);
      color: var(--syl-text-primary, #ffffff);
    }

    .syl-page-btn.syl-page-active {
      background-color: var(--syl-accent, #e50914);
      border-color: var(--syl-accent, #e50914);
      color: var(--syl-accent-foreground, #ffffff);
      font-weight: 600;
    }

    .syl-page-btn:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    .syl-page-ellipsis {
      padding: 0 0.5rem;
      color: var(--syl-text-muted, #71717a);
    }
  `],
})
export class SylPaginationComponent {
  readonly currentPage = input<number>(1);
  readonly totalPages = input<number>(1);
  readonly pageChange = output<number>();

  readonly visiblePages = computed<(number)[]>(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    const pages: number[] = [];
    pages.push(1);
    if (current > 3) pages.push(-1);

    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (current < total - 2) pages.push(-1);
    pages.push(total);

    return pages;
  });

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages() && page !== this.currentPage()) {
      this.pageChange.emit(page);
    }
  }
}
