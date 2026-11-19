import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'syl-form-field',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="syl-form-field" [class.syl-field-has-error]="hasError()">
      <ng-content select="syl-form-label" />
      <div class="syl-field-control">
        <ng-content />
      </div>
      <ng-content select="syl-form-helper-text, syl-form-error" />
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }

    .syl-form-field {
      display: flex;
      flex-direction: column;
      gap: 0.375rem;
      width: 100%;
    }

    .syl-field-control {
      width: 100%;
    }
  `],
})
export class SylFormFieldComponent {
  readonly hasError = input<boolean>(false);
}
