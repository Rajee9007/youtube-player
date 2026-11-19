import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'syl-form-label',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <label class="syl-form-label" [attr.for]="forId() || null">
      <ng-content />
      @if (required()) {
        <span class="syl-label-required" aria-hidden="true">*</span>
      }
    </label>
  `,
  styles: [`
    :host {
      display: inline-block;
    }

    .syl-form-label {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.8125rem;
      font-weight: 500;
      color: var(--syl-text-secondary, #a1a1aa);
      user-select: none;
    }

    .syl-label-required {
      color: var(--syl-danger, #ef4444);
    }
  `],
})
export class SylFormLabelComponent {
  readonly forId = input<string>('');
  readonly required = input<boolean>(false);
}
