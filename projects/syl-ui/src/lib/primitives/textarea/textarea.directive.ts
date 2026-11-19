import { Directive, input } from '@angular/core';

@Directive({
  selector: 'textarea[sylTextarea]',
  standalone: true,
  host: {
    '[class.syl-textarea]': 'true',
    '[class.syl-textarea-invalid]': 'invalid()',
    '[disabled]': 'disabled()',
  },
})
export class SylTextareaDirective {
  readonly invalid = input<boolean>(false);
  readonly disabled = input<boolean>(false);
}
