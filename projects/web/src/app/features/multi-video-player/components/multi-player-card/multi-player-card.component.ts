import {
  Component,
  input,
  output,
  inject,
  effect,
  OnDestroy,
  AfterViewInit,
  ElementRef,
  viewChild,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MultiPlayerItem, MultiPlayerStateService } from '../../../../core/services/multi-player-state.service';
import { YouTubePlayerService, YTPlayerInstance } from '../../../../core/services/youtube-player.service';
import {
  SylButtonComponent,
  SylBadgeComponent,
  SylCardComponent,
  SylTooltipDirective,
} from '@seyyul/ui';

@Component({
  selector: 'app-multi-player-card',
  standalone: true,
  imports: [
    CommonModule,
    SylButtonComponent,
    SylBadgeComponent,
    SylCardComponent,
    SylTooltipDirective,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <syl-card [bordered]="true" class="syl-player-card">
      <!-- Card Top Header -->
      <div sylCardHeader class="syl-card-header-bar">
        <div class="syl-card-title-group">
          <span class="syl-card-video-id" [title]="player().youtubeVideoId">
            <code>{{ player().youtubeVideoId }}</code>
          </span>
          <span class="syl-card-video-title" [title]="player().title">{{ player().title }}</span>
        </div>

        <div class="syl-card-header-actions">
          <!-- Playback Status Badge -->
          <syl-badge [variant]="getStatusBadgeVariant()" [pill]="true">
            {{ getStatusLabel() }}
          </syl-badge>

          <!-- Sound Status Badge -->
          @if (isInitialized()) {
            <syl-badge [variant]="player().isMuted ? 'warning' : 'success'" [pill]="true">
              {{ player().isMuted ? 'Muted' : 'Audio On' }}
            </syl-badge>
          }

          <!-- Remove Button -->
          <button
            type="button"
            class="syl-btn-remove-icon"
            (click)="onRemove()"
            sylTooltip="Remove this player"
            aria-label="Remove player"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
              <path
                fill-rule="evenodd"
                d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z"
                clip-rule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>

      <!-- Player 16:9 Viewport -->
      <div class="syl-player-viewport-ratio">
        <!-- 1. Pending Placeholder (Lazy Load State) -->
        @if (player().status === 'pending') {
          <div class="syl-placeholder-view" (click)="initializePlayer(true)">
            <img
              [src]="player().thumbnailUrl"
              [alt]="player().title"
              loading="lazy"
              class="syl-placeholder-thumb"
            />
            <div class="syl-placeholder-overlay">
              <div class="syl-play-cta-box">
                <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
              <span class="syl-cta-text">Click to Initialize Player</span>
            </div>
          </div>
        }

        <!-- 2. Loading Skeleton -->
        @if (player().status === 'loading') {
          <div class="syl-loading-overlay">
            <div class="syl-card-spinner"></div>
            <span class="syl-loading-text">Loading YouTube IFrame...</span>
          </div>
        }

        <!-- 3. Blocked Overlay (Browser Autoplay Policy Restricted) -->
        @if (player().status === 'blocked') {
          <div class="syl-blocked-overlay" (click)="onPlay()">
            <div class="syl-play-cta-box syl-blocked-box">
              <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
            <span class="syl-cta-text">Autoplay Blocked — Click to Play</span>
          </div>
        }

        <!-- 4. Error State -->
        @if (player().status === 'error') {
          <div class="syl-error-overlay">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="32" height="32" class="syl-err-icon">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span class="syl-err-msg">{{ player().errorMessage || 'Playback Error' }}</span>
            <syl-button variant="secondary" size="sm" (clicked)="reloadPlayer()">
              Reload Player
            </syl-button>
          </div>
        }

        <!-- 5. YouTube IFrame Mount Anchor inside dedicated container -->
        <div class="syl-iframe-container" [class.syl-hidden]="player().status === 'pending'">
          <div #iframeMount [id]="'yt-multi-mount-' + player().id"></div>
        </div>
      </div>

      <!-- Card Footer Controls -->
      <div sylCardFooter class="syl-card-controls-footer">
        <div class="syl-controls-left">
          <!-- Play Button -->
          <syl-button
            variant="primary"
            size="sm"
            [disabled]="player().status === 'playing' || player().status === 'loading'"
            (clicked)="onPlay()"
            sylTooltip="Play this video"
          >
            <svg sylPrefix viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
              <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
            </svg>
            Play
          </syl-button>

          <!-- Pause Button -->
          <syl-button
            variant="secondary"
            size="sm"
            [disabled]="player().status !== 'playing'"
            (clicked)="onPause()"
            sylTooltip="Pause video"
          >
            <svg sylPrefix viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
              <path d="M5.75 3a.75.75 0 00-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 00.75-.75V3.75A.75.75 0 007.25 3h-1.5zM12.75 3a.75.75 0 00-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 00.75-.75V3.75a.75.75 0 00-.75-.75h-1.5z" />
            </svg>
            Pause
          </syl-button>
        </div>

        <div class="syl-controls-right">
          <!-- Mute / Unmute Toggle Button -->
          <syl-button
            [variant]="player().isMuted ? 'outline' : 'secondary'"
            size="sm"
            [disabled]="!isInitialized()"
            (clicked)="toggleSound()"
            [sylTooltip]="player().isMuted ? 'Unmute audio' : 'Mute audio'"
          >
            <span sylPrefix>
              @if (player().isMuted) {
                <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
                  <path d="M9.53 2.22a.75.75 0 01.47.697v14.166a.75.75 0 01-1.28.53l-4.72-4.72H2a1 1 0 01-1-1v-4a1 1 0 011-1h2l4.72-4.72a.75.75 0 01.81-.153zM13.28 7.22a.75.75 0 10-1.06 1.06L14.44 10l-2.22 2.22a.75.75 0 101.06 1.06L15.5 11.06l2.22 2.22a.75.75 0 101.06-1.06L16.56 10l2.22-2.22a.75.75 0 00-1.06-1.06L15.5 8.94l-2.22-2.22z" />
                </svg>
              } @else {
                <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
                  <path d="M9.53 2.22a.75.75 0 01.47.697v14.166a.75.75 0 01-1.28.53l-4.72-4.72H2a1 1 0 01-1-1v-4a1 1 0 011-1h2l4.72-4.72a.75.75 0 01.81-.153zM14.78 4.22a.75.75 0 011.06 0 9 9 0 010 12.728.75.75 0 11-1.06-1.06 7.5 7.5 0 000-10.607.75.75 0 010-1.06z" />
                </svg>
              }
            </span>
            {{ player().isMuted ? 'Unmute' : 'Mute' }}
          </syl-button>

          <!-- Duplicate Button -->
          <button
            type="button"
            class="syl-btn-mini-action"
            (click)="onDuplicate()"
            sylTooltip="Duplicate Player"
            aria-label="Duplicate player"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
              <path d="M7 3.5A1.5 1.5 0 018.5 2h7A1.5 1.5 0 0117 3.5v7a1.5 1.5 0 01-1.5 1.5h-7A1.5 1.5 0 017 10.5v-7z" />
              <path d="M4.5 6A1.5 1.5 0 003 7.5v7A1.5 1.5 0 004.5 16h7a1.5 1.5 0 001.5-1.5v-1.5h-1.5v1.5h-7v-7H6V6H4.5z" />
            </svg>
          </button>

          <!-- Reload Button -->
          <button
            type="button"
            class="syl-btn-mini-action"
            (click)="reloadPlayer()"
            sylTooltip="Reload iframe instance"
            aria-label="Reload player"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
              <path
                fill-rule="evenodd"
                d="M15.312 11.424a5.5 5.5 0 01-9.201 2.466l-.312-.311h2.433a.75.75 0 000-1.5H3.75a.75.75 0 00-.75.75v4.482a.75.75 0 001.5 0v-2.148l.422.423a7 7 0 1011.776-3.876.75.75 0 00-1.386.584z"
                clip-rule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
    </syl-card>
  `,
  styles: [`
    :host { display: block; width: 100%; min-width: 0; }
    .syl-player-card {
      width: 100%; min-width: 0;
      height: 100%; display: flex; flex-direction: column;
      border-radius: var(--syl-radius-lg, 0.75rem);
      background: var(--syl-surface, #141417);
      border: 1px solid var(--syl-border, #27272a);
      overflow: hidden;
    }
    .syl-card-header-bar {
      display: flex; align-items: center; justify-content: space-between;
      gap: 0.5rem; padding: 0.75rem 1rem;
      background: var(--syl-surface-secondary, #18181b);
      border-bottom: 1px solid var(--syl-border, #27272a);
      flex-shrink: 0;
    }
    .syl-card-title-group { display: flex; align-items: center; gap: 0.5rem; min-width: 0; }
    .syl-card-video-title {
      font-size: 0.8125rem; font-weight: 600; color: var(--syl-text-primary, #fff);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 140px;
    }
    .syl-card-video-id code {
      font-size: 0.75rem; color: var(--syl-text-secondary, #a1a1aa);
      background: var(--syl-surface-tertiary, #27272a);
      padding: 0.15rem 0.35rem; border-radius: var(--syl-radius-sm, 0.25rem);
    }
    .syl-card-header-actions { display: flex; align-items: center; gap: 0.5rem; flex-shrink: 0; }
    .syl-btn-remove-icon {
      background: transparent; border: none; color: var(--syl-text-muted, #71717a);
      padding: 0.25rem; border-radius: var(--syl-radius-sm, 0.25rem);
      display: inline-flex; align-items: center; justify-content: center;
      cursor: pointer;
    }
    .syl-btn-remove-icon:hover { color: var(--syl-danger, #ef4444); background: rgba(239, 68, 68, 0.12); }

    /* Fixed 16:9 Aspect Ratio Viewport */
    .syl-player-viewport-ratio {
      position: relative;
      width: 100%;
      aspect-ratio: 16 / 9;
      min-height: 0;
      background: #000;
      overflow: hidden;
      flex-shrink: 0;
    }
    .syl-iframe-container {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      min-height: 0;
      max-width: 100%;
      max-height: 100%;
      overflow: hidden;
    }
    .syl-iframe-container ::ng-deep iframe,
    .syl-iframe-container ::ng-deep div {
      position: absolute !important;
      inset: 0 !important;
      display: block !important;
      width: 100% !important;
      height: 100% !important;
      border: 0 !important;
    }
    .syl-hidden { display: none !important; }
    .syl-placeholder-view { position: absolute; inset: 0; cursor: pointer; }
    .syl-placeholder-thumb { width: 100%; height: 100%; object-fit: cover; }
    .syl-placeholder-overlay, .syl-blocked-overlay {
      position: absolute; inset: 0;
      background: linear-gradient(to top, rgba(0,0,0,0.85), rgba(0,0,0,0.3) 60%, rgba(0,0,0,0.5));
      display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.5rem;
    }
    .syl-blocked-overlay { z-index: 2; cursor: pointer; }
    .syl-play-cta-box {
      width: 3.25rem; height: 3.25rem; border-radius: 50%;
      background: var(--syl-accent, #e50914); color: #fff;
      display: flex; align-items: center; justify-content: center; padding-left: 3px;
      box-shadow: 0 4px 14px rgba(0,0,0,0.6);
    }
    .syl-blocked-box { background: var(--syl-warning, #f59e0b); }
    .syl-cta-text { font-size: 0.8125rem; font-weight: 600; color: #fff; text-shadow: 0 1px 4px rgba(0,0,0,0.8); }
    .syl-loading-overlay, .syl-error-overlay {
      position: absolute; inset: 0; background: var(--syl-surface, #141417);
      display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.5rem;
    }
    .syl-loading-overlay { z-index: 2; gap: 0.75rem; }
    .syl-card-spinner {
      width: 2rem; height: 2rem; border: 2.5px solid var(--syl-border, #27272a);
      border-top-color: var(--syl-accent, #e50914); border-radius: 50%;
      animation: syl-spin 0.75s linear infinite;
    }
    @keyframes syl-spin { to { transform: rotate(360deg); } }
    .syl-loading-text, .syl-err-msg { font-size: 0.75rem; color: var(--syl-text-secondary, #a1a1aa); }
    .syl-error-overlay { z-index: 3; padding: 1rem; text-align: center; }
    .syl-err-icon { color: var(--syl-danger, #ef4444); }
    .syl-err-msg { font-size: 0.8125rem; max-width: 16rem; }
    .syl-card-controls-footer {
      display: flex; align-items: center; justify-content: space-between;
      gap: 0.5rem; padding: 0.625rem 0.875rem;
      background: var(--syl-surface-secondary, #18181b);
      border-top: 1px solid var(--syl-border, #27272a);
    }
    .syl-controls-left, .syl-controls-right { display: flex; align-items: center; gap: 0.375rem; }
    .syl-btn-mini-action {
      background: transparent; border: 1px solid var(--syl-border, #27272a);
      color: var(--syl-text-secondary, #a1a1aa); padding: 0.375rem;
      border-radius: var(--syl-radius-md, 0.375rem);
      display: inline-flex; align-items: center; justify-content: center;
      cursor: pointer;
    }
    .syl-btn-mini-action:hover { color: var(--syl-text-primary, #fff); background: var(--syl-surface-tertiary, #27272a); }
  `],
})
export class MultiPlayerCardComponent implements AfterViewInit, OnDestroy {
  readonly player = input.required<MultiPlayerItem>();
  readonly index = input.required<number>();

  readonly remove = output<string>();
  readonly duplicate = output<string>();

  private readonly ytService = inject(YouTubePlayerService);
  private readonly stateService = inject(MultiPlayerStateService);
  private readonly iframeMount = viewChild<ElementRef<HTMLDivElement>>('iframeMount');

  private playerInstance: YTPlayerInstance | null = null;
  private playRequestedOnReady = false;
  private autoplayCheckTimer: any = null;
  private initTimeout: any = null;

  constructor() {
    effect(() => {
      const p = this.player();
      const mount = this.iframeMount();
      if (mount && p.status === 'pending' && p.autoPlayOnInit && !this.playerInstance) {
        this.initializePlayer(true);
      }
    });
  }

  ngAfterViewInit(): void {
    // Newly appended players with autoPlayOnInit automatically attempt muted playback
    if (this.player().autoPlayOnInit) {
      const delay = Math.min((this.player().slotNumber % 10) * 60, 600);
      if (delay > 0) {
        this.initTimeout = setTimeout(() => {
          this.initializePlayer(true);
        }, delay);
      } else {
        this.initializePlayer(true);
      }
    }
  }

  isInitialized(): boolean {
    const s = this.player().status;
    return s !== 'pending' && s !== 'loading';
  }

  getStatusBadgeVariant(): 'default' | 'accent' | 'success' | 'warning' | 'danger' | 'info' {
    switch (this.player().status) {
      case 'playing':
        return 'success';
      case 'paused':
      case 'blocked':
        return 'warning';
      case 'ready':
        return 'info';
      case 'loading':
        return 'accent';
      case 'error':
        return 'danger';
      default:
        return 'default';
    }
  }

  getStatusLabel(): string {
    switch (this.player().status) {
      case 'playing':
        return 'Playing';
      case 'paused':
        return 'Paused';
      case 'blocked':
        return 'Blocked';
      case 'ready':
        return 'Ready';
      case 'loading':
        return 'Loading...';
      case 'ended':
        return 'Ended';
      case 'error':
        return 'Error';
      default:
        return 'Pending';
    }
  }

  async initializePlayer(autoPlay: boolean = true): Promise<void> {
    const p = this.player();
    if (this.playerInstance || p.status === 'loading') {
      return;
    }

    this.stateService.updatePlayerStatus(p.id, 'loading');

    try {
      await this.ytService.loadIFrameApi();
      const mount = this.iframeMount()?.nativeElement;
      if (!mount) return;

      const elementId = `yt-multi-mount-${p.id}`;
      mount.id = elementId;

      this.playerInstance = this.ytService.createPlayer(elementId, p.youtubeVideoId, {
        isMadeForKids: false,
        onReady: (event: { target?: YTPlayerInstance }) => {
          const resolvedInstance = event?.target ?? this.playerInstance;
          if (resolvedInstance) {
            this.playerInstance = resolvedInstance;
            this.ytService.registerPlayerInstance(p.id, resolvedInstance);
          }
          this.stateService.updatePlayerStatus(p.id, 'ready');

          // Always ensure player is muted for autoplay compliance
          this.playerInstance?.mute();
          this.stateService.updatePlayerSound(p.id, true);

          // Read video title from API if available
          try {
            const videoData = this.playerInstance?.getVideoData?.();
            if (videoData?.title) {
              this.stateService.updatePlayerTitle(p.id, videoData.title);
            }
          } catch {}

          // Automatically attempt playback
          if (autoPlay || this.playRequestedOnReady || p.autoPlayOnInit) {
            this.attemptAutoPlay(p.id);
          }
        },
        onStateChange: (event: { data?: number }) => {
          const state = event?.data;
          if (state === undefined) return;

          // YT.PlayerState: -1 unstarted, 0 ended, 1 playing, 2 paused, 3 buffering, 5 cued
          if (state === 1) {
            // PLAYING: Confirm playback and clear block timer
            this.clearAutoplayTimer();
            this.stateService.onPlayerStartedPlaying(p.id);
          } else if (state === 2) {
            this.stateService.updatePlayerStatus(p.id, 'paused');
          } else if (state === 0) {
            // Continuous Loop Playback: automatically restart video on ENDED
            this.clearAutoplayTimer();
            this.ytService.playVideo(p.id);
          } else if (state === 5) {
            this.stateService.updatePlayerStatus(p.id, 'ready');
          }
        },
        onError: (err: { data?: number }) => {
          this.clearAutoplayTimer();
          this.playRequestedOnReady = false;
          const code = err?.data;
          let message = 'Unable to play video';
          if (code === 100) {
            message = 'Video removed or private';
          } else if (code === 101 || code === 150) {
            message = 'Embedding disabled by owner';
          }
          this.stateService.updatePlayerStatus(p.id, 'error', message);
        },
      });
    } catch {
      this.clearAutoplayTimer();
      this.playRequestedOnReady = false;
      this.stateService.updatePlayerStatus(
        p.id,
        'error',
        'Failed to connect to YouTube Player API'
      );
    }
  }

  private attemptAutoPlay(id: string): void {
    try {
      this.ytService.playVideo(id);
      this.scheduleAutoplayBlockCheck(id);
    } catch {
      this.stateService.updatePlayerStatus(id, 'blocked', 'Autoplay blocked by browser policy');
    }
  }

  private scheduleAutoplayBlockCheck(id: string): void {
    this.clearAutoplayTimer();
    this.autoplayCheckTimer = setTimeout(() => {
      const current = this.player();
      if (
        current &&
        current.status !== 'playing' &&
        current.status !== 'ended' &&
        current.status !== 'error'
      ) {
        const state = this.playerInstance?.getPlayerState?.();
        if (state !== 1) {
          this.stateService.updatePlayerStatus(id, 'blocked', 'Autoplay blocked by browser policy');
        }
      }
    }, 3500);
  }

  private clearAutoplayTimer(): void {
    if (this.autoplayCheckTimer) {
      clearTimeout(this.autoplayCheckTimer);
      this.autoplayCheckTimer = null;
    }
  }

  onPlay(): void {
    this.clearAutoplayTimer();
    if (!this.playerInstance) {
      this.playRequestedOnReady = true;
      this.initializePlayer(true);
    } else {
      this.ytService.playVideo(this.player().id);
    }
  }

  onPause(): void {
    this.clearAutoplayTimer();
    this.ytService.pauseVideo(this.player().id);
    this.stateService.updatePlayerStatus(this.player().id, 'paused');
  }

  toggleSound(): void {
    const id = this.player().id;
    const currentMuted = this.player().isMuted;
    if (currentMuted) {
      const ok = this.ytService.unmuteVideo(id);
      if (ok) {
        this.stateService.updatePlayerSound(id, false);
      }
    } else {
      this.ytService.muteVideo(id);
      this.stateService.updatePlayerSound(id, true);
    }
  }

  reloadPlayer(): void {
    this.cleanupInstance();
    this.stateService.updatePlayerStatus(this.player().id, 'pending');
    setTimeout(() => {
      this.initializePlayer(true);
    }, 100);
  }

  onDuplicate(): void {
    this.duplicate.emit(this.player().id);
  }

  onRemove(): void {
    this.cleanupInstance();
    this.remove.emit(this.player().id);
  }

  private cleanupInstance(): void {
    this.clearAutoplayTimer();
    if (this.initTimeout) {
      clearTimeout(this.initTimeout);
      this.initTimeout = null;
    }
    if (this.playerInstance) {
      this.ytService.unregisterPlayerInstance(this.player().id);
      this.playerInstance = null;
    }
  }

  ngOnDestroy(): void {
    this.cleanupInstance();
  }
}
