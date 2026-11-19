import { Component, OnInit, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategoryService } from '../../core/services/category.service';
import { Category } from '../../shared/models/category.model';
@Component({
  selector: 'app-admin-categories',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="syl-admin-categories-page">
      <div class="syl-view-header">
        <div>
          <h1 class="syl-view-title">Category Taxonomy</h1>
          <p class="syl-view-sub">Manage classification categories for content discovery</p>
        </div>
      </div>

      <div class="syl-cats-table-card">
        <table class="syl-admin-table">
          <thead>
            <tr>
              <th>Category Name</th>
              <th>Slug</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            @for (cat of categories(); track cat.id) {
              <tr>
                <td><strong>{{ cat.name }}</strong></td>
                <td><code>{{ cat.slug }}</code></td>
                <td>{{ cat.description }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .syl-admin-categories-page {
      display: flex;
      flex-direction: column;
      gap: 1.75rem;
    }
    .syl-view-header {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
    }
    .syl-view-title {
      font-size: 1.875rem;
      font-weight: 800;
      color: var(--syl-text-primary, #ffffff);
      margin: 0 0 0.25rem 0;
    }
    .syl-view-sub {
      font-size: 0.875rem;
      color: var(--syl-text-secondary, #a1a1aa);
      margin: 0;
    }
    .syl-cats-table-card {
      background-color: var(--syl-surface, #141417);
      border: 1px solid var(--syl-border, #27272a);
      border-radius: var(--syl-radius-lg, 0.75rem);
      overflow-x: auto;
    }
    .syl-admin-table {
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
  `],
})
export class AdminCategoriesComponent implements OnInit {
  private readonly categoryService = inject(CategoryService);
  readonly categories = signal<Category[]>([]);

  ngOnInit(): void {
    this.categoryService.getCategories().subscribe((cats) => this.categories.set(cats));
  }
}
