import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SylDialogComponent } from '../dialog/dialog.component';
import { SylButtonComponent } from '../../primitives/button/button.component';

@Component({
  selector: 'syl-confirm-dialog',
  standalone: true,
  imports: [CommonModule, SylDialogComponent, SylButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <syl-dialog
      [open]="open()"
      [title]="title()"
      maxWidth="28rem"
      (closed)="cancel.emit()"
    >
      <p class="syl-confirm-msg">{{ message() }}</p>
      <div sylDialogFooter>
        <syl-button variant="ghost" (clicked)="cancel.emit()">
          {{ cancelText() }}
        </syl-button>
        <syl-button [variant]="danger() ? 'danger' : 'primary'" (clicked)="confirm.emit()">
          {{ confirmText() }}
        </syl-button>
      </div>
    </syl-dialog>
  `,
  styles: [`
    .syl-confirm-msg {
      margin: 0;
      font-size: 0.9375rem;
      color: var(--syl-text-secondary, #a1a1aa);
      line-height: 1.5;
    }
  `],
})
export class SylConfirmDialogComponent {
  readonly open = input<boolean>(false);
  readonly title = input<string>('Confirm Action');
  readonly message = input.required<string>();
  readonly confirmText = input<string>('Confirm');
  readonly cancelText = input<string>('Cancel');
  readonly danger = input<boolean>(false);

  readonly confirm = output<void>();
  readonly cancel = output<void>();
}
