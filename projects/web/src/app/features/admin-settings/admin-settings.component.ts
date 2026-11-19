import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SylThemeService } from '@seyyul/ui';
import {
  SylCardComponent,
  SylButtonComponent,
  SylSelectComponent,
  SylSwitchComponent,
  SylToastService,
} from '@seyyul/ui';

@Component({
  selector: 'app-admin-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, SylCardComponent, SylButtonComponent, SylSelectComponent, SylSwitchComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="syl-admin-settings-page">
      <div class="syl-view-header">
        <div>
          <h1 class="syl-view-title">Platform Settings</h1>
          <p class="syl-view-sub">Configure platform-wide branding, theme defaults, and YouTube policy parameters</p>
        </div>
        <syl-button variant="primary" (clicked)="saveSettings()">
          Save Settings
        </syl-button>
      </div>

      <div class="syl-settings-stack">
        <!-- Multi-Theme Defaults -->
        <syl-card [bordered]="true">
          <div sylCardHeader>
            <h3 class="syl-card-title">Default Appearance Theme</h3>
            <p class="syl-card-subtitle">Set the default theme applied for new visitors prior to their local personalization</p>
          </div>
          <div class="syl-setting-row">
            <div class="syl-setting-control">
              <label class="syl-setting-label">Default Theme</label>
              <syl-select
                [options]="themeOptions"
                [(ngModel)]="defaultTheme"
              />
            </div>
            <span class="syl-setting-hint">10 available themes: Midnight, Pure Light, Ocean Blue, Royal Purple, Emerald, Golden Luxury, Sunset, AMOLED Black, Rose Pink, System Default.</span>
          </div>
        </syl-card>

        <!-- YouTube Embedding & Compliance -->
        <syl-card [bordered]="true">
          <div sylCardHeader>
            <h3 class="syl-card-title">YouTube Player API Compliance</h3>
            <p class="syl-card-subtitle">Enforce strict adherence to YouTube developer terms and privacy policies</p>
          </div>
          <div class="syl-toggles-stack">
            <syl-switch [(ngModel)]="strictNoAutoplay">
              Enforce strict NO autoplay policy (playback must be user-initiated)
            </syl-switch>
            <syl-switch [(ngModel)]="preserveBrandControls">
              Preserve official native YouTube controls, branding, and advertisements
            </syl-switch>
            <syl-switch [(ngModel)]="childDirectedPrivacy">
              Enable Privacy-Enhanced domain (youtube-nocookie.com) for child-directed content
            </syl-switch>
          </div>
        </syl-card>
      </div>
    </div>
  `,
  styles: [`
    .syl-admin-settings-page {
      display: flex;
      flex-direction: column;
      gap: 1.75rem;
      max-width: 56rem;
    }
    .syl-view-header {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
    }
    .syl-view-title {
      font-size: 1.875rem;
      font-weight: 800;
      color: var(--syl-text-primary, #ffffff);
      margin: 0 0 0.25rem 0;
    }
    .syl-view-sub {
      font-size: 0.875rem;
      color: var(--syl-text-secondary, #a1a1aa);
      margin: 0;
    }
    .syl-settings-stack {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    .syl-card-title {
      font-size: 1.0625rem;
      font-weight: 700;
      color: var(--syl-text-primary, #ffffff);
      margin: 0 0 0.25rem 0;
    }
    .syl-card-subtitle {
      font-size: 0.8125rem;
      color: var(--syl-text-secondary, #a1a1aa);
      margin: 0;
    }
    .syl-setting-row {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .syl-setting-control {
      max-width: 22rem;
      display: flex;
      flex-direction: column;
      gap: 0.375rem;
    }
    .syl-setting-label {
      font-size: 0.8125rem;
      font-weight: 600;
      color: var(--syl-text-secondary, #a1a1aa);
    }
    .syl-setting-hint {
      font-size: 0.75rem;
      color: var(--syl-text-muted, #71717a);
    }
    .syl-toggles-stack {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
  `],
})
export class AdminSettingsComponent {
  private readonly toast = inject(SylToastService);
  private readonly themeService = inject(SylThemeService);

  defaultTheme = 'midnight';
  strictNoAutoplay = true;
  preserveBrandControls = true;
  childDirectedPrivacy = true;

  themeOptions = [
    { label: 'Midnight (Dark + Red)', value: 'midnight' },
    { label: 'Pure Light (Light + Red)', value: 'pure-light' },
    { label: 'Ocean Blue (Navy + Cyan)', value: 'ocean-blue' },
    { label: 'Royal Purple (Purple + Violet)', value: 'royal-purple' },
    { label: 'Emerald (Green + Emerald)', value: 'emerald' },
    { label: 'Golden Luxury (Warm + Gold)', value: 'golden-luxury' },
    { label: 'Sunset (Warm + Orange)', value: 'sunset' },
    { label: 'AMOLED Black (True Black + Red)', value: 'amoled-black' },
    { label: 'Rose Pink (Pink Accent)', value: 'rose-pink' },
    { label: 'System Default', value: 'system' },
  ];

  saveSettings(): void {
    this.toast.success('Platform settings successfully saved');
  }
}
