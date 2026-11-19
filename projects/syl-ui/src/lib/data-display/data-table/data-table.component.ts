import { Component, input, output, ChangeDetectionStrategy, TemplateRef, ContentChild } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface SylTableColumn<T = any> {
  key: keyof T | string;
  header: string;
  width?: string;
  sortable?: boolean;
}

@Component({
  selector: 'syl-data-table',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="syl-table-container">
      <table class="syl-table">
        <thead>
          <tr>
            @for (col of columns(); track col.key) {
              <th [style.width]="col.width || 'auto'">
                {{ col.header }}
              </th>
            }
            @if (hasActions()) {
              <th class="syl-th-actions">Actions</th>
            }
          </tr>
        </thead>
        <tbody>
          @if (loading()) {
            <tr>
              <td [attr.colspan]="columns().length + (hasActions() ? 1 : 0)" class="syl-td-loading">
                <div class="syl-table-spinner"></div>
                <span>Loading records...</span>
              </td>
            </tr>
          } @else if (data().length === 0) {
            <tr>
              <td [attr.colspan]="columns().length + (hasActions() ? 1 : 0)" class="syl-td-empty">
                {{ emptyText() }}
              </td>
            </tr>
          } @else {
            @for (row of data(); track $index) {
              <tr (click)="rowClick.emit(row)">
                @for (col of columns(); track col.key) {
                  <td>
                    {{ getCellValue(row, col.key) }}
                  </td>
                }
                @if (hasActions()) {
                  <td class="syl-td-actions" (click)="$event.stopPropagation()">
                    <ng-container *ngTemplateOutlet="actionsTemplate; context: { $implicit: row }" />
                  </td>
                }
              </tr>
            }
          }
        </tbody>
      </table>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }

    .syl-table-container {
      width: 100%;
      overflow-x: auto;
      border: 1px solid var(--syl-border, #27272a);
      border-radius: var(--syl-radius-lg, 0.75rem);
      background-color: var(--syl-surface, #141417);
    }

    .syl-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-size: 0.875rem;
    }

    th {
      padding: 0.875rem 1rem;
      background-color: var(--syl-surface-secondary, #18181b);
      color: var(--syl-text-secondary, #a1a1aa);
      font-weight: 600;
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border-bottom: 1px solid var(--syl-border, #27272a);
    }

    td {
      padding: 0.875rem 1rem;
      border-bottom: 1px solid var(--syl-border, #27272a);
      color: var(--syl-text-primary, #ffffff);
      vertical-align: middle;
    }

    tbody tr {
      transition: background-color 150ms ease;
    }

    tbody tr:hover {
      background-color: var(--syl-surface-secondary, rgba(255, 255, 255, 0.03));
    }

    tbody tr:last-child td {
      border-bottom: none;
    }

    .syl-td-actions, .syl-th-actions {
      text-align: right;
    }

    .syl-td-empty, .syl-td-loading {
      text-align: center;
      padding: 3rem 1rem;
      color: var(--syl-text-muted, #71717a);
    }

    .syl-table-spinner {
      width: 1.5rem;
      height: 1.5rem;
      margin: 0 auto 0.5rem;
      border: 2px solid var(--syl-border, #27272a);
      border-top-color: var(--syl-accent, #e50914);
      border-radius: 50%;
      animation: syl-spin 0.8s linear infinite;
    }

    @keyframes syl-spin {
      to { transform: rotate(360deg); }
    }
  `],
})
export class SylDataTableComponent<T = any> {
  readonly columns = input<SylTableColumn<T>[]>([]);
  readonly data = input<T[]>([]);
  readonly loading = input<boolean>(false);
  readonly hasActions = input<boolean>(false);
  readonly emptyText = input<string>('No records found.');

  readonly rowClick = output<T>();

  @ContentChild('actions') actionsTemplate!: TemplateRef<any>;

  getCellValue(row: any, key: any): any {
    return row?.[key] ?? '—';
  }
}
