import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  SylButtonComponent,
  SylInputComponent,
  SylStatCardComponent,
  SylEmptyStateComponent,
  SylAlertComponent,
  SylConfirmDialogComponent,
  SylBadgeComponent,
  SylSwitchComponent,
} from '@seyyul/ui';
import {
  MultiPlayerStateService,
  MultiPlayerItem,
} from '../../core/services/multi-player-state.service';
import { MultiPlayerCardComponent } from './components/multi-player-card/multi-player-card.component';

interface SampleVideo {
  label: string;
  url: string;
}

@Component({
  selector: 'app-multi-video-player',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SylButtonComponent,
    SylInputComponent,
    SylStatCardComponent,
    SylEmptyStateComponent,
    SylAlertComponent,
    SylConfirmDialogComponent,
    SylBadgeComponent,
    SylSwitchComponent,
    MultiPlayerCardComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="syl-mvp-container">
      <!-- Page Header -->
      <header class="syl-mvp-header">
        <div class="syl-mvp-header-badge">
          <syl-badge variant="accent" [pill]="true">MULTI-PLAYER DASHBOARD</syl-badge>
        </div>
        <h1 class="syl-mvp-title">Seyyul Multi Video Player</h1>
        <p class="syl-mvp-description">
          Add, organize and manage multiple YouTube video players from one dashboard.
        </p>
      </header>

      <!-- Dashboard Summary Stats -->
      <section class="syl-mvp-stats-grid" aria-label="Player Statistics">
        <syl-stat-card
          title="Total Players"
          [value]="state.totalPlayers()"
          hint="Added to dashboard"
        >
          <svg sylStatIcon viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
            <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect>
            <line x1="7" y1="2" x2="7" y2="22"></line>
            <line x1="17" y1="2" x2="17" y2="22"></line>
            <line x1="2" y1="12" x2="22" y2="12"></line>
            <line x1="2" y1="7" x2="7" y2="7"></line>
            <line x1="2" y1="17" x2="7" y2="17"></line>
            <line x1="17" y1="17" x2="22" y2="17"></line>
            <line x1="17" y1="7" x2="22" y2="7"></line>
          </svg>
        </syl-stat-card>

        <syl-stat-card
          title="Initialized"
          [value]="state.initializedPlayers()"
          hint="IFrame players mounted"
        >
          <svg sylStatIcon viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
          </svg>
        </syl-stat-card>

        <syl-stat-card
          title="Playing"
          [value]="state.playingPlayers()"
          [positive]="state.playingPlayers() > 0"
          hint="Active coordinated audio"
        >
          <svg sylStatIcon viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
            <circle cx="12" cy="12" r="10"></circle>
            <polygon points="10 8 16 12 10 16 10 8"></polygon>
          </svg>
        </syl-stat-card>

        <syl-stat-card
          title="Paused"
          [value]="state.pausedPlayers()"
          hint="Standby players"
        >
          <svg sylStatIcon viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
            <rect x="6" y="4" width="4" height="16"></rect>
            <rect x="14" y="4" width="4" height="16"></rect>
          </svg>
        </syl-stat-card>

        <syl-stat-card
          title="Muted"
          [value]="state.mutedPlayers()"
          hint="Audio silenced"
        >
          <svg sylStatIcon viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
            <line x1="23" y1="9" x2="17" y2="15"></line>
            <line x1="17" y1="9" x2="23" y2="15"></line>
          </svg>
        </syl-stat-card>

        <syl-stat-card
          title="Errors"
          [value]="state.errorPlayers()"
          hint="Failed or restricted"
        >
          <svg sylStatIcon viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </syl-stat-card>
      </section>

      <!-- Add Video Section -->
      <section class="syl-mvp-add-section" aria-label="Add Video Player">
        <div class="syl-mvp-add-card">
          <h2 class="syl-add-heading">Add YouTube Video</h2>
          <p class="syl-add-sub">
            Supports standard watch URLs, youtu.be shortlinks, Shorts, and 11-character video IDs.
          </p>

          <div class="syl-add-form">
            <div class="syl-add-input-wrapper">
              <syl-input
                placeholder="https://www.youtube.com/watch?v=... or youtu.be/..."
                [clearable]="true"
                [(ngModel)]="urlInput"
                (keydown.enter)="onAddVideo()"
              >
                <span sylPrefix class="syl-input-prefix-icon">
                  <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                    <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                  </svg>
                </span>
              </syl-input>
            </div>

            <div class="syl-add-mute-option">
              <syl-switch [(ngModel)]="openWithMuted">
                Open with Muted
              </syl-switch>
            </div>

            <syl-button
              variant="primary"
              size="md"
              [loading]="isAdding()"
              (clicked)="onAddVideo()"
            >
              Add Video
            </syl-button>
          </div>

          <!-- Quick Samples -->
          <div class="syl-quick-samples">
            <span class="syl-samples-label">Quick Try:</span>
            @for (sample of sampleVideos; track sample.url) {
              <button
                type="button"
                class="syl-sample-chip"
                (click)="onAddSample(sample.url)"
              >
                {{ sample.label }}
              </button>
            }
          </div>

          <!-- Validation Error Alert -->
          @if (errorMessage()) {
            <div class="syl-alert-wrapper">
              <syl-alert
                variant="danger"
                [dismissible]="true"
                (dismissed)="errorMessage.set(null)"
              >
                {{ errorMessage() }}
              </syl-alert>
            </div>
          }
        </div>
      </section>

      <!-- Global Controls Toolbar -->
      @if (state.totalPlayers() > 0) {
        <section class="syl-mvp-toolbar" aria-label="Global Player Controls">
          <div class="syl-toolbar-info">
            <span class="syl-toolbar-count">
              <strong>{{ state.totalPlayers() }}</strong> {{ state.totalPlayers() === 1 ? 'Player' : 'Players' }} Active
            </span>
            <span class="syl-toolbar-hint">
              (Single-audio mode: starting one pauses others)
            </span>
          </div>

          <div class="syl-toolbar-actions">
            <syl-button
              variant="outline"
              size="sm"
              (clicked)="state.pauseAll()"
              title="Pause all initialized players"
            >
              Pause All
            </syl-button>

            <syl-button
              variant="outline"
              size="sm"
              (clicked)="state.muteAll()"
              title="Mute all initialized players"
            >
              Mute All
            </syl-button>

            <syl-button
              variant="outline"
              size="sm"
              (clicked)="state.unmuteAll()"
              title="Unmute all initialized players"
            >
              Unmute All
            </syl-button>

            <syl-button
              variant="danger"
              size="sm"
              (clicked)="confirmClearOpen.set(true)"
              title="Remove all player cards"
            >
              Clear All
            </syl-button>
          </div>
        </section>
      }

      <!-- Responsive Dynamic Player Grid -->
      <section class="syl-mvp-grid-section" aria-label="Video Player Grid">
        @if (state.players().length === 0) {
          <!-- Empty State -->
          <syl-empty-state
            title="No Video Players Added"
            description="Add YouTube videos above using any valid link or select from our curated samples to monitor and compare videos simultaneously."
          >
            <div sylEmptyIcon class="syl-empty-video-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="48" height="48">
                <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect>
                <line x1="7" y1="2" x2="7" y2="22"></line>
                <line x1="17" y1="2" x2="17" y2="22"></line>
                <line x1="2" y1="12" x2="22" y2="12"></line>
                <line x1="2" y1="7" x2="7" y2="7"></line>
                <line x1="2" y1="17" x2="7" y2="17"></line>
                <line x1="17" y1="17" x2="22" y2="17"></line>
                <line x1="17" y1="7" x2="22" y2="7"></line>
              </svg>
            </div>
            <div sylEmptyActions class="syl-empty-actions-box">
              <syl-button variant="primary" (clicked)="onAddSample(sampleVideos[0].url)">
                Load Sample Video
              </syl-button>
            </div>
          </syl-empty-state>
        } @else {
          <div class="syl-player-grid">
            @for (player of state.players(); track player.id; let idx = $index) {
              <app-multi-player-card
                [player]="player"
                [index]="idx"
                (remove)="onRemovePlayer($event)"
              />
            }
          </div>
        }
      </section>

      <!-- Clear All Confirmation Dialog -->
      <syl-confirm-dialog
        [open]="confirmClearOpen()"
        title="Clear All Players?"
        message="Are you sure you want to remove all players from the dashboard? All active video instances will be closed."
        confirmText="Clear All"
        cancelText="Cancel"
        [danger]="true"
        (confirm)="onConfirmClearAll()"
        (cancel)="confirmClearOpen.set(false)"
      />
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }

    .syl-mvp-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 2rem 1.5rem 4rem 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    /* Page Header */
    .syl-mvp-header {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .syl-mvp-header-badge {
      display: inline-flex;
    }

    .syl-mvp-title {
      font-size: 2.25rem;
      font-weight: 800;
      letter-spacing: -0.025em;
      color: var(--syl-text-primary, #ffffff);
      margin: 0;
    }

    .syl-mvp-description {
      font-size: 1rem;
      color: var(--syl-text-secondary, #a1a1aa);
      margin: 0;
      max-width: 48rem;
    }

    /* Stats Grid */
    .syl-mvp-stats-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
    }

    @media (min-width: 640px) {
      .syl-mvp-stats-grid {
        grid-template-columns: repeat(3, 1fr);
      }
    }

    @media (min-width: 1024px) {
      .syl-mvp-stats-grid {
        grid-template-columns: repeat(6, 1fr);
      }
    }

    /* Add Section */
    .syl-mvp-add-card {
      background-color: var(--syl-surface, #141417);
      border: 1px solid var(--syl-border, #27272a);
      border-radius: var(--syl-radius-lg, 0.75rem);
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .syl-add-heading {
      font-size: 1.125rem;
      font-weight: 700;
      color: var(--syl-text-primary, #ffffff);
      margin: 0;
    }

    .syl-add-sub {
      font-size: 0.875rem;
      color: var(--syl-text-secondary, #a1a1aa);
      margin: 0;
    }

    .syl-add-form {
      display: flex;
      gap: 0.75rem;
      align-items: stretch;
      flex-direction: column;
    }

    @media (min-width: 640px) {
      .syl-add-form {
        flex-direction: row;
        align-items: center;
      }

      .syl-add-input-wrapper {
        flex: 1;
      }
    }

    .syl-add-mute-option {
      display: flex;
      align-items: center;
      white-space: nowrap;
      padding: 0 0.25rem;
    }

    .syl-input-prefix-icon {
      color: #e50914;
      display: flex;
      align-items: center;
    }

    /* Quick Samples */
    .syl-quick-samples {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.8125rem;
    }

    .syl-samples-label {
      color: var(--syl-text-muted, #71717a);
      font-weight: 500;
    }

    .syl-sample-chip {
      background-color: var(--syl-surface-hover, #202024);
      border: 1px solid var(--syl-border, #27272a);
      color: var(--syl-text-secondary, #a1a1aa);
      padding: 0.25rem 0.625rem;
      border-radius: var(--syl-radius-full, 9999px);
      cursor: pointer;
      font-size: 0.75rem;
      font-family: inherit;
      transition: all var(--syl-motion-base, 150ms) ease;
    }

    .syl-sample-chip:hover {
      background-color: var(--syl-surface-active, #2a2a30);
      color: var(--syl-text-primary, #ffffff);
      border-color: var(--syl-accent, #e50914);
    }

    .syl-alert-wrapper {
      margin-top: 0.5rem;
    }

    /* Global Toolbar */
    .syl-mvp-toolbar {
      background-color: var(--syl-surface, #141417);
      border: 1px solid var(--syl-border, #27272a);
      border-radius: var(--syl-radius-lg, 0.75rem);
      padding: 0.875rem 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      align-items: flex-start;
      justify-content: space-between;
    }

    @media (min-width: 768px) {
      .syl-mvp-toolbar {
        flex-direction: row;
        align-items: center;
      }
    }

    .syl-toolbar-info {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .syl-toolbar-count {
      font-size: 0.9375rem;
      color: var(--syl-text-primary, #ffffff);
    }

    .syl-toolbar-hint {
      font-size: 0.8125rem;
      color: var(--syl-text-muted, #71717a);
    }

    .syl-toolbar-actions {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    /* Player Grid: 1 col mobile, 2 tablet, 3 desktop, 4 large desktop */
    .syl-player-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1.25rem;
    }

    @media (min-width: 640px) {
      .syl-player-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (min-width: 1024px) {
      .syl-player-grid {
        grid-template-columns: repeat(3, 1fr);
      }
    }

    @media (min-width: 1440px) {
      .syl-player-grid {
        grid-template-columns: repeat(4, 1fr);
      }
    }

    .syl-empty-video-icon {
      color: var(--syl-text-muted, #71717a);
      margin-bottom: 0.5rem;
    }

    .syl-empty-actions-box {
      margin-top: 1rem;
    }
  `],
})
export class MultiVideoPlayerComponent {
  readonly state = inject(MultiPlayerStateService);

  urlInput = '';
  openWithMuted = true;
  readonly errorMessage = signal<string | null>(null);
  readonly isAdding = signal<boolean>(false);
  readonly confirmClearOpen = signal<boolean>(false);

  readonly sampleVideos: SampleVideo[] = [
    { label: 'Seyyul Kids — Thirukkural Stories', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
    { label: 'Seyyul Education — Tamil Grammar', url: 'https://www.youtube.com/watch?v=L_LUpnjgPso' },
    { label: 'Seyyul Aanmeegam — Devotional', url: 'https://youtu.be/9bZkp7q19f0' },
    { label: 'Seyyul Toonz — Animation Short', url: 'https://www.youtube.com/shorts/kJQP7kiw5Fk' },
  ];

  onAddVideo(): void {
    const trimmed = this.urlInput.trim();
    if (!trimmed) {
      this.errorMessage.set('Please enter a YouTube video URL or ID.');
      return;
    }

    this.isAdding.set(true);
    const result = this.state.addPlayer(trimmed, this.openWithMuted);

    this.isAdding.set(false);
    if (!result.success) {
      this.errorMessage.set(result.error ?? 'Failed to add video player.');
    } else {
      this.urlInput = '';
      this.errorMessage.set(null);
    }
  }

  onAddSample(url: string): void {
    this.urlInput = url;
    this.onAddVideo();
  }

  onRemovePlayer(id: string): void {
    this.state.removePlayer(id);
  }

  onConfirmClearAll(): void {
    this.state.clearAll();
    this.confirmClearOpen.set(false);
  }
}
