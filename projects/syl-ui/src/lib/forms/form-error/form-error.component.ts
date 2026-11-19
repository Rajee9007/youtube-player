import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'syl-form-error',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="syl-form-error" role="alert">
      <ng-content />
    </span>
  `,
  styles: [`
    :host {
      display: block;
    }

    .syl-form-error {
      font-size: 0.75rem;
      color: var(--syl-danger, #ef4444);
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }
  `],
})
export class SylFormErrorComponent {}
