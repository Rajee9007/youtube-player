import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'syl-navbar',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="syl-navbar" [class.syl-navbar-sticky]="sticky()">
      <div class="syl-navbar-container">
        <div class="syl-navbar-brand">
          <ng-content select="[sylBrand]" />
        </div>
        <div class="syl-navbar-center">
          <ng-content select="[sylCenter]" />
        </div>
        <div class="syl-navbar-actions">
          <ng-content select="[sylActions]" />
        </div>
      </div>
    </header>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }

    .syl-navbar {
      width: 100%;
      height: 4rem;
      background-color: var(--syl-surface, #141417);
      border-bottom: 1px solid var(--syl-border, #27272a);
      transition: background-color 150ms ease, border-color 150ms ease;
      z-index: 50;
    }

    .syl-navbar-sticky {
      position: sticky;
      top: 0;
      backdrop-filter: blur(12px);
      background-color: rgba(var(--syl-surface-rgb, 20, 20, 23), 0.85);
    }

    .syl-navbar-container {
      max-width: 1400px;
      height: 100%;
      margin: 0 auto;
      padding: 0 1.25rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1.5rem;
    }

    .syl-navbar-brand {
      display: flex;
      align-items: center;
      flex-shrink: 0;
    }

    .syl-navbar-center {
      display: flex;
      align-items: center;
      flex: 1;
      max-width: 42rem;
      justify-content: center;
    }

    .syl-navbar-actions {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex-shrink: 0;
    }
  `],
})
export class SylNavbarComponent {
  readonly sticky = input<boolean>(true);
}
