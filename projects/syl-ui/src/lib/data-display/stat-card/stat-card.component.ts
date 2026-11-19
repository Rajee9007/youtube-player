import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'syl-stat-card',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="syl-stat-card">
      <div class="syl-stat-top">
        <span class="syl-stat-title">{{ title() }}</span>
        <div class="syl-stat-icon">
          <ng-content select="[sylStatIcon]" />
        </div>
      </div>
      <div class="syl-stat-value">{{ value() }}</div>
      @if (hint()) {
        <div class="syl-stat-hint" [class.syl-stat-positive]="positive()">
          {{ hint() }}
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    .syl-stat-card {
      background-color: var(--syl-surface, #141417);
      border: 1px solid var(--syl-border, #27272a);
      border-radius: var(--syl-radius-lg, 0.75rem);
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .syl-stat-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .syl-stat-title {
      font-size: 0.8125rem;
      color: var(--syl-text-secondary, #a1a1aa);
      font-weight: 500;
    }

    .syl-stat-icon {
      color: var(--syl-accent, #e50914);
      display: flex;
      align-items: center;
    }

    .syl-stat-value {
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--syl-text-primary, #ffffff);
      letter-spacing: -0.02em;
    }

    .syl-stat-hint {
      font-size: 0.75rem;
      color: var(--syl-text-muted, #71717a);
    }

    .syl-stat-positive {
      color: var(--syl-success, #10b981);
    }
  `],
})
export class SylStatCardComponent {
  readonly title = input.required<string>();
  readonly value = input.required<string | number>();
  readonly hint = input<string>('');
  readonly positive = input<boolean>(false);
}
