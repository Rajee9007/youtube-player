import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SylThemeMeta } from './theme.model';

@Component({
  selector: 'syl-theme-preview',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      type="button"
      class="syl-theme-preview-card"
      [class.syl-theme-active]="isSelected()"
      (click)="selectTheme.emit(theme().id)"
      [attr.aria-label]="'Select ' + theme().name + ' theme'"
      [attr.aria-pressed]="isSelected()"
    >
      <div
        class="syl-preview-box"
        [style.background-color]="theme().bgColor"
        [style.border-color]="isSelected() ? theme().accentColor : 'var(--syl-border)'"
      >
        <div class="syl-preview-surface" [style.background-color]="theme().surfaceColor">
          <div class="syl-preview-accent" [style.background-color]="theme().accentColor"></div>
          <div class="syl-preview-text" [style.background-color]="theme().isDark ? '#fafafa' : '#18181b'"></div>
        </div>
      </div>
      <div class="syl-preview-info">
        <div class="syl-preview-header">
          <span class="syl-preview-name">{{ theme().name }}</span>
          @if (isSelected()) {
            <span class="syl-preview-badge" [style.background-color]="theme().accentColor">Active</span>
          }
        </div>
        <span class="syl-preview-desc">{{ theme().description }}</span>
      </div>
    </button>
  `,
  styles: [`
    .syl-theme-preview-card {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      width: 100%;
      padding: 0.5rem 0.75rem;
      border-radius: var(--syl-radius-md, 0.5rem);
      border: 1px solid transparent;
      background: transparent;
      color: var(--syl-text-primary, #ffffff);
      text-align: left;
      cursor: pointer;
      transition: background-color 150ms ease, border-color 150ms ease;
    }

    .syl-theme-preview-card:hover {
      background-color: var(--syl-surface-secondary, rgba(255, 255, 255, 0.05));
    }

    .syl-theme-preview-card.syl-theme-active {
      background-color: var(--syl-surface-secondary, rgba(255, 255, 255, 0.08));
      border-color: var(--syl-border, rgba(255, 255, 255, 0.15));
    }

    .syl-preview-box {
      width: 2.25rem;
      height: 2.25rem;
      border-radius: var(--syl-radius-sm, 0.25rem);
      border: 1.5px solid;
      display: flex;
      align-items: flex-end;
      justify-content: flex-end;
      padding: 0.25rem;
      flex-shrink: 0;
      position: relative;
      overflow: hidden;
    }

    .syl-preview-surface {
      width: 100%;
      height: 70%;
      border-radius: 2px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.125rem 0.25rem;
    }

    .syl-preview-accent {
      width: 0.4rem;
      height: 0.4rem;
      border-radius: 50%;
    }

    .syl-preview-text {
      width: 0.8rem;
      height: 0.2rem;
      border-radius: 1px;
      opacity: 0.6;
    }

    .syl-preview-info {
      display: flex;
      flex-direction: column;
      flex: 1;
      min-width: 0;
    }

    .syl-preview-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;
    }

    .syl-preview-name {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--syl-text-primary, #ffffff);
    }

    .syl-preview-badge {
      font-size: 0.625rem;
      padding: 0.1rem 0.35rem;
      border-radius: 9999px;
      color: #ffffff;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .syl-preview-desc {
      font-size: 0.75rem;
      color: var(--syl-text-secondary, #a1a1aa);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  `],
})
export class SylThemePreviewComponent {
  readonly theme = input.required<SylThemeMeta>();
  readonly isSelected = input<boolean>(false);
  readonly selectTheme = output<SylThemeMeta['id']>();
}
