import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'syl-divider',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="syl-divider"
      [class.syl-divider-horizontal]="orientation() === 'horizontal'"
      [class.syl-divider-vertical]="orientation() === 'vertical'"
      [class.syl-divider-with-text]="hasContent"
      role="separator"
      [attr.aria-orientation]="orientation()"
    >
      <span class="syl-divider-line"></span>
      <span class="syl-divider-content" #contentRef>
        <ng-content />
      </span>
      <span class="syl-divider-line"></span>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    .syl-divider {
      display: flex;
      align-items: center;
      position: relative;
    }

    .syl-divider-horizontal {
      width: 100%;
      margin: 1rem 0;
    }

    .syl-divider-vertical {
      display: inline-flex;
      height: 1.25rem;
      margin: 0 0.5rem;
      vertical-align: middle;
    }

    .syl-divider-line {
      flex: 1;
      height: 1px;
      background-color: var(--syl-border, #27272a);
    }

    .syl-divider-vertical .syl-divider-line {
      width: 1px;
      height: 100%;
    }

    .syl-divider-content {
      padding: 0 0.75rem;
      font-size: 0.75rem;
      font-weight: 500;
      color: var(--syl-text-muted, #71717a);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .syl-divider-content:empty {
      padding: 0;
    }
  `],
})
export class SylDividerComponent {
  readonly orientation = input<'horizontal' | 'vertical'>('horizontal');
  hasContent = false;
}
