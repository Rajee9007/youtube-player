import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  SylThemeService,
  SylThemeId,
  SYL_THEMES_LIST,
  SylButtonComponent,
  SylInputComponent,
  SylSelectComponent,
  SylCheckboxComponent,
  SylRadioComponent,
  SylSwitchComponent,
  SylBadgeComponent,
  SylAvatarComponent,
  SylCardComponent,
  SylStatCardComponent,
  SylAlertComponent,
  SylSkeletonComponent,
  SylVideoCardComponent,
  SylChannelCardComponent,
  SylPlaylistCardComponent,
  SylToastService,
} from '@seyyul/ui';

@Component({
  selector: 'app-design-system',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SylButtonComponent,
    SylInputComponent,
    SylSelectComponent,
    SylCheckboxComponent,
    SylRadioComponent,
    SylSwitchComponent,
    SylBadgeComponent,
    SylAvatarComponent,
    SylCardComponent,
    SylStatCardComponent,
    SylAlertComponent,
    SylSkeletonComponent,
    SylVideoCardComponent,
    SylChannelCardComponent,
    SylPlaylistCardComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="syl-ds-showcase">
      <!-- Showcase Hero -->
      <header class="syl-ds-hero">
        <syl-badge variant="accent" [pill]="true">@seyyul/ui</syl-badge>
        <h1 class="syl-ds-title">SYL Design System Showcase</h1>
        <p class="syl-ds-sub">
          Independent, multi-theme component library built with Angular Signals, semantic CSS custom properties, and WCAG 2.2 AA accessibility.
        </p>
      </header>

      <!-- 1. Theme Gallery (10 Themes) -->
      <section class="syl-ds-section">
        <h2 class="syl-ds-section-title">1. Multi-Theme Engine (10 Themes)</h2>
        <p class="syl-ds-section-desc">Click any card to immediately switch the entire application's theme tokens.</p>

        <div class="syl-ds-themes-grid">
          @for (th of themes; track th.id) {
            <button
              type="button"
              class="syl-ds-theme-card"
              [class.syl-ds-theme-active]="themeService.currentTheme() === th.id"
              (click)="selectTheme(th.id)"
            >
              <div class="syl-ds-swatch" [style.background-color]="th.bgColor" [style.border-color]="th.accentColor">
                <div class="syl-ds-swatch-surface" [style.background-color]="th.surfaceColor">
                  <div class="syl-ds-swatch-dot" [style.background-color]="th.accentColor"></div>
                </div>
              </div>
              <div class="syl-ds-theme-info">
                <div class="syl-ds-theme-row">
                  <strong class="syl-ds-theme-name">{{ th.name }}</strong>
                  @if (themeService.currentTheme() === th.id) {
                    <syl-badge variant="accent" [pill]="true">Active</syl-badge>
                  }
                </div>
                <span class="syl-ds-theme-desc">{{ th.description }}</span>
              </div>
            </button>
          }
        </div>
      </section>

      <!-- 2. Typography & Color Tokens -->
      <section class="syl-ds-section">
        <h2 class="syl-ds-section-title">2. Semantic Tokens &amp; Avatars</h2>
        <div class="syl-ds-tokens-grid">
          <div class="syl-token-box" style="background-color: var(--syl-bg); border: 1px solid var(--syl-border);">
            <code>--syl-bg</code>
          </div>
          <div class="syl-token-box" style="background-color: var(--syl-surface); border: 1px solid var(--syl-border);">
            <code>--syl-surface</code>
          </div>
          <div class="syl-token-box" style="background-color: var(--syl-surface-secondary); border: 1px solid var(--syl-border);">
            <code>--syl-surface-secondary</code>
          </div>
          <div class="syl-token-box" style="background-color: var(--syl-accent); color: var(--syl-accent-foreground);">
            <code>--syl-accent</code>
          </div>
        </div>
        <div class="syl-ds-component-row" style="margin-top: 1rem;">
          <syl-avatar name="Seyyul Kids" size="sm" />
          <syl-avatar name="Seyyul Education" size="md" />
          <syl-avatar name="Seyyul Aanmeegam" size="lg" />
          <syl-avatar name="Seyyul Toonz" size="xl" />
        </div>
      </section>

      <!-- 3. Primitives: Buttons -->
      <section class="syl-ds-section">
        <h2 class="syl-ds-section-title">3. Primitives: Buttons</h2>
        <div class="syl-ds-component-row">
          <syl-button variant="primary">Primary Accent</syl-button>
          <syl-button variant="secondary">Secondary Surface</syl-button>
          <syl-button variant="outline">Outline Border</syl-button>
          <syl-button variant="ghost">Ghost Subtle</syl-button>
          <syl-button variant="danger">Danger Red</syl-button>
          <syl-button variant="primary" [loading]="true">Loading</syl-button>
          <syl-button variant="primary" [disabled]="true">Disabled</syl-button>
        </div>
      </section>

      <!-- 4. Form Controls -->
      <section class="syl-ds-section">
        <h2 class="syl-ds-section-title">4. Form Controls</h2>
        <div class="syl-ds-forms-grid">
          <syl-input placeholder="Standard text input..." [clearable]="true" />
          <syl-select
            [options]="[
              { label: 'Option Alpha', value: 'a' },
              { label: 'Option Beta', value: 'b' },
              { label: 'Option Gamma', value: 'c' }
            ]"
            placeholder="Select an option"
          />
          <div class="syl-ds-flex-row">
            <syl-checkbox [(ngModel)]="checkboxVal">Accessible Checkbox</syl-checkbox>
            <syl-switch [(ngModel)]="switchVal">Interactive Switch</syl-switch>
          </div>
          <div class="syl-ds-flex-row">
            <syl-radio name="demo-radio" value="opt1" [(ngModel)]="radioVal">Option 1</syl-radio>
            <syl-radio name="demo-radio" value="opt2" [(ngModel)]="radioVal">Option 2</syl-radio>
          </div>
        </div>
      </section>

      <!-- 5. Cards & Data Display -->
      <section class="syl-ds-section">
        <h2 class="syl-ds-section-title">5. Data Display &amp; Skeletons</h2>
        <div class="syl-ds-tokens-grid">
          <syl-stat-card title="Active Videos" value="1,420" hint="+18% this month" [positive]="true" />
          <syl-stat-card title="Registered Channels" value="5" hint="All active" [positive]="true" />
          <syl-card [bordered]="true">
            <h4 style="margin: 0 0 0.5rem 0;">Card Container</h4>
            <syl-skeleton width="100%" height="1rem" shape="text" />
            <syl-skeleton width="70%" height="1rem" shape="text" />
          </syl-card>
        </div>
      </section>

      <!-- 6. Feedback & Alerts -->
      <section class="syl-ds-section">
        <h2 class="syl-ds-section-title">6. Feedback &amp; Alerts</h2>
        <div class="syl-ds-feedback-stack">
          <syl-alert variant="info" title="Informational Notice">
            The SYL Design System is completely decoupled from Seyyul Video Hub business logic.
          </syl-alert>
          <syl-alert variant="success" title="Theme Engine Active">
            Runtime theme state is persisted in localStorage with system appearance fallback.
          </syl-alert>
          <syl-alert variant="warning" title="Adherence Required">
            Official YouTube embedding requirements prohibit background/hidden playback and ad-blocking.
          </syl-alert>
          <syl-alert variant="danger" title="Administrative Access Restricted">
            Private routes require verified credentials to access administrative tools.
          </syl-alert>
        </div>
        <div class="syl-ds-toast-trigger">
          <syl-button variant="secondary" (clicked)="triggerToast()">
            Trigger Toast Notification
          </syl-button>
        </div>
      </section>

      <!-- 7. Video Domain Components -->
      <section class="syl-ds-section">
        <h2 class="syl-ds-section-title">7. Video Domain Components</h2>
        <div class="syl-ds-video-grid">
          <syl-video-card
            [video]="{
              id: 'demo-1',
              slug: 'welcome-to-seyyul-video-hub',
              title: 'Sample Video Domain Component Showcase',
              thumbnailUrl: 'https://images.unsplash.com/photo-1518173946687-a4c8a383392e?w=800&h=450&fit=crop',
              durationSeconds: 245,
              channelName: 'Seyyul Entertainment',
              publishedAt: '2026-03-10',
              isMadeForKids: false
            }"
          />
          <syl-channel-card
            [channel]="{
              id: 'demo-ch',
              name: 'Seyyul Kids',
              slug: 'seyyul-kids',
              description: 'Nursery rhymes, moral stories, and fun songs for children.',
              logoUrl: 'https://images.unsplash.com/photo-1566438480900-0609be27a4be?w=200&h=200&fit=crop',
              bannerUrl: 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=1400&h=400&fit=crop',
              youtubeChannelId: 'UC_seyyul_kids',
              subscribeUrl: 'https://www.youtube.com'
            }"
          />
          <syl-playlist-card
            [playlist]="{
              id: 'demo-pl',
              slug: 'demo-playlist',
              title: 'Curated Heritage Playlist',
              description: 'Sample playlist card showcase',
              channelName: 'Seyyul Education',
              videoCount: 12,
              coverImage: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&h=450&fit=crop'
            }"
          />
        </div>
      </section>
    </div>
  `,
  styles: [`
    .syl-ds-showcase {
      display: flex;
      flex-direction: column;
      gap: 3.5rem;
      padding-bottom: 4rem;
    }

    .syl-ds-hero {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 0.75rem;
      max-width: 48rem;
    }

    .syl-ds-title {
      font-size: 2.25rem;
      font-weight: 800;
      color: var(--syl-text-primary, #ffffff);
      margin: 0;
      letter-spacing: -0.02em;
    }

    .syl-ds-sub {
      font-size: 1rem;
      color: var(--syl-text-secondary, #a1a1aa);
      margin: 0;
      line-height: 1.6;
    }

    .syl-ds-section {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
      padding-top: 1.5rem;
      border-top: 1px solid var(--syl-border, #27272a);
    }

    .syl-ds-section-title {
      font-size: 1.375rem;
      font-weight: 700;
      color: var(--syl-text-primary, #ffffff);
      margin: 0;
    }

    .syl-ds-section-desc {
      font-size: 0.875rem;
      color: var(--syl-text-secondary, #a1a1aa);
      margin: -0.5rem 0 0 0;
    }

    .syl-ds-themes-grid {
      display: grid;
      grid-template-columns: repeat(1, minmax(0, 1fr));
      gap: 1rem;
    }

    @media (min-width: 640px) {
      .syl-ds-themes-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }

    @media (min-width: 1024px) {
      .syl-ds-themes-grid {
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }
    }

    .syl-ds-theme-card {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      border-radius: var(--syl-radius-lg, 0.75rem);
      background-color: var(--syl-surface, #141417);
      border: 1px solid var(--syl-border, #27272a);
      cursor: pointer;
      text-align: left;
      transition: all 150ms ease;
    }

    .syl-ds-theme-card:hover {
      border-color: var(--syl-border-subtle, #3f3f46);
      transform: translateY(-2px);
    }

    .syl-ds-theme-card.syl-ds-theme-active {
      border-color: var(--syl-accent, #e50914);
      background-color: var(--syl-surface-secondary, #1f1f24);
    }

    .syl-ds-swatch {
      width: 3rem;
      height: 3rem;
      border-radius: var(--syl-radius-md, 0.5rem);
      border: 2px solid;
      display: flex;
      align-items: flex-end;
      justify-content: flex-end;
      padding: 0.35rem;
      flex-shrink: 0;
    }

    .syl-ds-swatch-surface {
      width: 100%;
      height: 65%;
      border-radius: 2px;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      padding: 0.25rem;
    }

    .syl-ds-swatch-dot {
      width: 0.5rem;
      height: 0.5rem;
      border-radius: 50%;
    }

    .syl-ds-theme-info {
      flex: 1;
      min-width: 0;
    }

    .syl-ds-theme-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;
    }

    .syl-ds-theme-name {
      font-size: 0.9375rem;
      color: var(--syl-text-primary, #ffffff);
    }

    .syl-ds-theme-desc {
      font-size: 0.75rem;
      color: var(--syl-text-secondary, #a1a1aa);
      display: block;
      margin-top: 0.25rem;
    }

    .syl-ds-tokens-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 1rem;
    }

    @media (min-width: 768px) {
      .syl-ds-tokens-grid {
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }
    }

    .syl-token-box {
      padding: 1.5rem 1rem;
      border-radius: var(--syl-radius-md, 0.5rem);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .syl-ds-component-row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.75rem;
    }

    .syl-ds-forms-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1.25rem;
      max-width: 32rem;
    }

    .syl-ds-flex-row {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }

    .syl-ds-feedback-stack {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      max-width: 48rem;
    }

    .syl-ds-toast-trigger {
      margin-top: 0.5rem;
    }

    .syl-ds-video-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1.5rem;
    }

    @media (min-width: 768px) {
      .syl-ds-video-grid {
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }
    }
  `],
})
export class DesignSystemComponent {
  readonly themeService = inject(SylThemeService);
  private readonly toast = inject(SylToastService);

  readonly themes = SYL_THEMES_LIST;

  checkboxVal = true;
  switchVal = true;
  radioVal = 'opt1';

  selectTheme(id: SylThemeId): void {
    this.themeService.setTheme(id);
    this.toast.info(`Switched to theme: ${this.themeService.themeMeta().name}`);
  }

  triggerToast(): void {
    this.toast.success('Live toast triggered from SYL Design System');
  }
}
