import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'syl-empty-state',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="syl-empty-state">
      <div class="syl-empty-icon">
        <ng-content select="[sylEmptyIcon]" />
      </div>
      <h3 class="syl-empty-title">{{ title() }}</h3>
      @if (description()) {
        <p class="syl-empty-desc">{{ description() }}</p>
      }
      <div class="syl-empty-actions">
        <ng-content select="[sylEmptyActions]" />
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }

    .syl-empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 3.5rem 1.5rem;
      background-color: var(--syl-surface, #141417);
      border: 1px dashed var(--syl-border, #27272a);
      border-radius: var(--syl-radius-lg, 0.75rem);
    }

    .syl-empty-icon {
      color: var(--syl-text-muted, #71717a);
      margin-bottom: 1rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .syl-empty-title {
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--syl-text-primary, #ffffff);
      margin: 0 0 0.5rem 0;
    }

    .syl-empty-desc {
      font-size: 0.875rem;
      color: var(--syl-text-secondary, #a1a1aa);
      max-width: 28rem;
      margin: 0 0 1.5rem 0;
      line-height: 1.5;
    }

    .syl-empty-actions {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
  `],
})
export class SylEmptyStateComponent {
  readonly title = input<string>('No items to display');
  readonly description = input<string>('');
}
