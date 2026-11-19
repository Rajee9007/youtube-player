import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SylAvatarComponent } from '../../primitives/avatar/avatar.component';

export interface SylVideoCardData {
  id: string;
  slug: string;
  title: string;
  thumbnailUrl: string;
  durationSeconds: number;
  channelName: string;
  channelLogoUrl?: string;
  publishedAt: string;
  isMadeForKids?: boolean;
}

@Component({
  selector: 'syl-video-card',
  standalone: true,
  imports: [CommonModule, SylAvatarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article
      class="syl-video-card"
      (click)="cardClick.emit(video())"
      tabindex="0"
      (keydown.enter)="cardClick.emit(video())"
      (keydown.space)="cardClick.emit(video())"
      [attr.aria-label]="video().title"
    >
      <div class="syl-thumb-container">
        <img
          [src]="video().thumbnailUrl"
          [alt]="video().title"
          loading="lazy"
          class="syl-thumb-img"
        />
        <span class="syl-duration-badge">{{ formatDuration(video().durationSeconds) }}</span>
        @if (video().isMadeForKids) {
          <span class="syl-kids-badge">Kids</span>
        }
        <div class="syl-play-overlay">
          <div class="syl-play-icon">
            <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
        </div>
      </div>
      <div class="syl-video-meta">
        <syl-avatar
          [src]="video().channelLogoUrl || null"
          [name]="video().channelName"
          size="sm"
        />
        <div class="syl-meta-text">
          <h4 class="syl-video-title" [title]="video().title">{{ video().title }}</h4>
          <span class="syl-channel-name">{{ video().channelName }}</span>
          <span class="syl-published-date">{{ video().publishedAt }}</span>
        </div>
      </div>
    </article>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }

    .syl-video-card {
      display: flex;
      flex-direction: column;
      border-radius: var(--syl-radius-lg, 0.75rem);
      overflow: hidden;
      cursor: pointer;
      outline: none;
      transition: transform 200ms ease;
    }

    .syl-video-card:hover {
      transform: translateY(-4px);
    }

    .syl-video-card:focus-visible {
      box-shadow: 0 0 0 2px var(--syl-bg), 0 0 0 4px var(--syl-accent);
    }

    .syl-thumb-container {
      position: relative;
      width: 100%;
      aspect-ratio: 16 / 9;
      background-color: var(--syl-surface-secondary, #1f1f24);
      border-radius: var(--syl-radius-lg, 0.75rem);
      overflow: hidden;
    }

    .syl-thumb-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 300ms ease;
    }

    .syl-video-card:hover .syl-thumb-img {
      transform: scale(1.04);
    }

    .syl-duration-badge {
      position: absolute;
      bottom: 0.5rem;
      right: 0.5rem;
      padding: 0.15rem 0.4rem;
      border-radius: var(--syl-radius-sm, 0.25rem);
      background-color: rgba(0, 0, 0, 0.85);
      color: #ffffff;
      font-size: 0.6875rem;
      font-weight: 600;
      letter-spacing: 0.02em;
    }

    .syl-kids-badge {
      position: absolute;
      top: 0.5rem;
      left: 0.5rem;
      padding: 0.15rem 0.45rem;
      border-radius: var(--syl-radius-sm, 0.25rem);
      background-color: #10b981;
      color: #02140d;
      font-size: 0.6875rem;
      font-weight: 700;
      text-transform: uppercase;
    }

    .syl-play-overlay {
      position: absolute;
      inset: 0;
      background-color: rgba(0, 0, 0, 0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 200ms ease;
    }

    .syl-video-card:hover .syl-play-overlay {
      opacity: 1;
    }

    .syl-play-icon {
      width: 3rem;
      height: 3rem;
      border-radius: 50%;
      background-color: var(--syl-accent, #e50914);
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      padding-left: 3px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
    }

    .syl-video-meta {
      display: flex;
      gap: 0.75rem;
      padding: 0.75rem 0.25rem;
    }

    .syl-meta-text {
      display: flex;
      flex-direction: column;
      flex: 1;
      min-width: 0;
    }

    .syl-video-title {
      font-size: 0.9375rem;
      font-weight: 600;
      color: var(--syl-text-primary, #ffffff);
      margin: 0 0 0.25rem 0;
      line-height: 1.35;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .syl-channel-name {
      font-size: 0.8125rem;
      color: var(--syl-text-secondary, #a1a1aa);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .syl-published-date {
      font-size: 0.75rem;
      color: var(--syl-text-muted, #71717a);
    }
  `],
})
export class SylVideoCardComponent {
  readonly video = input.required<SylVideoCardData>();
  readonly cardClick = output<SylVideoCardData>();

  formatDuration(seconds: number): string {
    if (!seconds || seconds <= 0) return '0:00';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    const paddedSecs = secs.toString().padStart(2, '0');
    if (hrs > 0) {
      const paddedMins = mins.toString().padStart(2, '0');
      return `${hrs}:${paddedMins}:${paddedSecs}`;
    }
    return `${mins}:${paddedSecs}`;
  }
}
