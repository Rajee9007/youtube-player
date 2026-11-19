import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'syl-form-helper-text',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="syl-form-helper">
      <ng-content />
    </span>
  `,
  styles: [`
    :host {
      display: block;
    }

    .syl-form-helper {
      font-size: 0.75rem;
      color: var(--syl-text-muted, #71717a);
    }
  `],
})
export class SylFormHelperTextComponent {}
