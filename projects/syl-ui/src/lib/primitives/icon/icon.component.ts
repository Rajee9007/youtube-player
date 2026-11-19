import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'syl-icon',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span
      class="syl-icon-wrapper"
      [style.width.px]="size()"
      [style.height.px]="size()"
      [style.color]="color() || 'currentColor'"
      aria-hidden="true"
    >
      <ng-content />
    </span>
  `,
  styles: [`
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      line-height: 0;
    }

    .syl-icon-wrapper {
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    .syl-icon-wrapper ::ng-deep svg {
      width: 100%;
      height: 100%;
    }
  `],
})
export class SylIconComponent {
  readonly size = input<number>(20);
  readonly color = input<string>('');
}
