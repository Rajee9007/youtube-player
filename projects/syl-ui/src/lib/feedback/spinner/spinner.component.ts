import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'syl-spinner',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="syl-spinner"
      [style.width.px]="size()"
      [style.height.px]="size()"
      [style.border-top-color]="color() || 'var(--syl-accent, #e50914)'"
      role="status"
      aria-label="Loading"
    ></div>
  `,
  styles: [`
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    .syl-spinner {
      border: 2.5px solid var(--syl-border, #27272a);
      border-radius: 50%;
      animation: syl-spin 0.75s linear infinite;
    }

    @keyframes syl-spin {
      to { transform: rotate(360deg); }
    }
  `],
})
export class SylSpinnerComponent {
  readonly size = input<number>(24);
  readonly color = input<string>('');
}
