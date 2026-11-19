import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'syl-progress',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="syl-progress-track"
      role="progressbar"
      [attr.aria-valuenow]="value()"
      aria-valuemin="0"
      aria-valuemax="100"
    >
      <div
        class="syl-progress-fill"
        [style.width.%]="value()"
        [class.syl-progress-indeterminate]="indeterminate()"
      ></div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }

    .syl-progress-track {
      width: 100%;
      height: 0.375rem;
      border-radius: var(--syl-radius-full, 9999px);
      background-color: var(--syl-surface-secondary, #27272a);
      overflow: hidden;
      position: relative;
    }

    .syl-progress-fill {
      height: 100%;
      background-color: var(--syl-accent, #e50914);
      border-radius: var(--syl-radius-full, 9999px);
      transition: width 300ms ease;
    }

    .syl-progress-indeterminate {
      width: 40% !important;
      position: absolute;
      animation: syl-indeterminate 1.5s infinite ease-in-out;
    }

    @keyframes syl-indeterminate {
      0% { left: -40%; }
      100% { left: 100%; }
    }
  `],
})
export class SylProgressComponent {
  readonly value = input<number>(0);
  readonly indeterminate = input<boolean>(false);
}
