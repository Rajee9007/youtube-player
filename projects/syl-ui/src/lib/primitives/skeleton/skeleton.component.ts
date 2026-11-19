import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

export type SylSkeletonShape = 'text' | 'rect' | 'circle';

@Component({
  selector: 'syl-skeleton',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="syl-skeleton"
      [class.syl-skeleton-text]="shape() === 'text'"
      [class.syl-skeleton-rect]="shape() === 'rect'"
      [class.syl-skeleton-circle]="shape() === 'circle'"
      [class.syl-skeleton-animate]="animate()"
      [style.width]="width()"
      [style.height]="height()"
      [style.border-radius]="radius()"
      aria-hidden="true"
    ></div>
  `,
  styles: [`
    :host {
      display: block;
    }

    .syl-skeleton {
      background-color: var(--syl-surface-secondary, #27272a);
      position: relative;
      overflow: hidden;
    }

    .syl-skeleton-text {
      height: 1rem;
      border-radius: var(--syl-radius-sm, 0.25rem);
      margin-bottom: 0.5rem;
    }

    .syl-skeleton-rect {
      border-radius: var(--syl-radius-md, 0.5rem);
    }

    .syl-skeleton-circle {
      border-radius: 50%;
    }

    .syl-skeleton-animate::after {
      content: '';
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      transform: translateX(-100%);
      background-image: linear-gradient(
        90deg,
        rgba(255, 255, 255, 0) 0,
        rgba(255, 255, 255, 0.05) 20%,
        rgba(255, 255, 255, 0.1) 60%,
        rgba(255, 255, 255, 0)
      );
      animation: syl-shimmer 2s infinite;
    }

    @keyframes syl-shimmer {
      100% {
        transform: translateX(100%);
      }
    }
  `],
})
export class SylSkeletonComponent {
  readonly shape = input<SylSkeletonShape>('rect');
  readonly width = input<string>('100%');
  readonly height = input<string>('1rem');
  readonly radius = input<string>('');
  readonly animate = input<boolean>(true);
}
