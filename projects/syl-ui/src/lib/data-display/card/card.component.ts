import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'syl-card',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="syl-card"
      [class.syl-card-hoverable]="hoverable()"
      [class.syl-card-bordered]="bordered()"
    >
      <div class="syl-card-header">
        <ng-content select="[sylCardHeader]" />
      </div>
      <div class="syl-card-body">
        <ng-content />
      </div>
      <div class="syl-card-footer">
        <ng-content select="[sylCardFooter]" />
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    .syl-card {
      background-color: var(--syl-surface, #141417);
      border-radius: var(--syl-radius-lg, 0.75rem);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      transition: transform 150ms ease, box-shadow 150ms ease, border-color 150ms ease;
    }

    .syl-card-bordered {
      border: 1px solid var(--syl-border, #27272a);
    }

    .syl-card-hoverable:hover {
      transform: translateY(-2px);
      box-shadow: var(--syl-shadow-md, 0 4px 6px -1px rgba(0, 0, 0, 0.2));
      border-color: var(--syl-border-subtle, #3f3f46);
    }

    .syl-card-header:empty,
    .syl-card-footer:empty {
      display: none;
    }

    .syl-card-header {
      padding: 1rem 1.25rem;
      border-bottom: 1px solid var(--syl-border, #27272a);
    }

    .syl-card-body {
      padding: 1.25rem;
      flex: 1;
    }

    .syl-card-footer {
      padding: 0.875rem 1.25rem;
      border-top: 1px solid var(--syl-border, #27272a);
      background-color: var(--syl-surface-secondary, rgba(255, 255, 255, 0.02));
    }
  `],
})
export class SylCardComponent {
  readonly hoverable = input<boolean>(false);
  readonly bordered = input<boolean>(true);
}
