import {
  Component,
  inject,
  signal,
  ElementRef,
  HostListener,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { SylThemeService } from './theme.service';
import { SylThemeId } from './theme.model';
import { SylThemePreviewComponent } from './theme-preview.component';

@Component({
  selector: 'syl-theme-switcher',
  standalone: true,
  imports: [CommonModule, SylThemePreviewComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="syl-theme-switcher-wrapper">
      <button
        type="button"
        class="syl-switcher-trigger"
        (click)="toggleMenu()"
        [attr.aria-expanded]="isOpen()"
        aria-haspopup="true"
        aria-label="Select theme"
      >
        <span class="syl-color-dot" [style.background-color]="themeService.themeMeta().accentColor"></span>
        <span class="syl-theme-current-name">{{ themeService.themeMeta().name }}</span>
        <svg
          class="syl-chevron"
          [class.syl-chevron-rotated]="isOpen()"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          width="16"
          height="16"
        >
          <path
            fill-rule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clip-rule="evenodd"
          />
        </svg>
      </button>

      @if (isOpen()) {
        <div class="syl-theme-dropdown" role="menu" aria-label="Available themes">
          <div class="syl-dropdown-header">
            <span class="syl-header-title">Theme Appearance</span>
            <span class="syl-header-count">10 themes</span>
          </div>
          <div class="syl-theme-list">
            @for (item of themeService.availableThemes(); track item.id) {
              <syl-theme-preview
                [theme]="item"
                [isSelected]="themeService.currentTheme() === item.id"
                (selectTheme)="onSelectTheme($event)"
              />
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .syl-theme-switcher-wrapper {
      position: relative;
      display: inline-block;
    }

    .syl-switcher-trigger {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.4rem 0.75rem;
      border-radius: var(--syl-radius-full, 9999px);
      background-color: var(--syl-surface-secondary, #1f1f24);
      border: 1px solid var(--syl-border, #27272a);
      color: var(--syl-text-primary, #ffffff);
      font-size: 0.8125rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 150ms ease;
    }

    .syl-switcher-trigger:hover {
      background-color: var(--syl-surface-tertiary, #2a2a32);
      border-color: var(--syl-border-subtle, #3f3f46);
    }

    .syl-color-dot {
      width: 0.625rem;
      height: 0.625rem;
      border-radius: 50%;
      flex-shrink: 0;
      box-shadow: 0 0 8px rgba(0, 0, 0, 0.4);
    }

    .syl-theme-current-name {
      line-height: 1;
    }

    .syl-chevron {
      transition: transform 150ms ease;
      color: var(--syl-text-secondary, #a1a1aa);
    }

    .syl-chevron-rotated {
      transform: rotate(180deg);
    }

    .syl-theme-dropdown {
      position: absolute;
      top: calc(100% + 0.5rem);
      right: 0;
      z-index: 1000;
      width: 18.5rem;
      max-height: 28rem;
      background-color: var(--syl-surface, #141417);
      border: 1px solid var(--syl-border, #27272a);
      border-radius: var(--syl-radius-lg, 0.75rem);
      box-shadow: var(--syl-shadow-lg, 0 10px 25px -5px rgba(0, 0, 0, 0.5));
      overflow: hidden;
      display: flex;
      flex-direction: column;
      animation: syl-dropdown-in 150ms cubic-bezier(0, 0, 0.2, 1);
    }

    @keyframes syl-dropdown-in {
      from {
        opacity: 0;
        transform: translateY(-6px) scale(0.98);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    .syl-dropdown-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.75rem 1rem;
      border-bottom: 1px solid var(--syl-border, #27272a);
      background-color: var(--syl-surface-secondary, #18181b);
    }

    .syl-header-title {
      font-size: 0.8125rem;
      font-weight: 600;
      color: var(--syl-text-primary, #ffffff);
    }

    .syl-header-count {
      font-size: 0.6875rem;
      color: var(--syl-text-muted, #71717a);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .syl-theme-list {
      padding: 0.5rem;
      overflow-y: auto;
      max-height: 22rem;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
  `],
})
export class SylThemeSwitcherComponent {
  readonly themeService = inject(SylThemeService);
  private readonly elementRef = inject(ElementRef);

  readonly isOpen = signal<boolean>(false);

  toggleMenu(): void {
    this.isOpen.update((v) => !v);
  }

  closeMenu(): void {
    this.isOpen.set(false);
  }

  onSelectTheme(themeId: SylThemeId): void {
    this.themeService.setTheme(themeId);
    this.closeMenu();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.closeMenu();
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeMenu();
  }
}
