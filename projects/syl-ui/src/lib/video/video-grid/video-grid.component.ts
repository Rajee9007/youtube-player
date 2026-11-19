import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'syl-video-grid',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="syl-video-grid">
      <ng-content />
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }

    .syl-video-grid {
      display: grid;
      grid-template-columns: repeat(1, minmax(0, 1fr));
      gap: 1.5rem 1rem;
    }

    @media (min-width: 640px) {
      .syl-video-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }

    @media (min-width: 1024px) {
      .syl-video-grid {
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 1.75rem 1.25rem;
      }
    }

    @media (min-width: 1280px) {
      .syl-video-grid {
        grid-template-columns: repeat(4, minmax(0, 1fr));
      }
    }

    @media (min-width: 1536px) {
      .syl-video-grid {
        grid-template-columns: repeat(5, minmax(0, 1fr));
      }
    }
  `],
})
export class SylVideoGridComponent {}
