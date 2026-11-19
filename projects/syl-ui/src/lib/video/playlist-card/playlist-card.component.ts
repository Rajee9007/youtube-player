import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface SylPlaylistCardData {
  id: string;
  slug: string;
  title: string;
  description?: string;
  coverImage?: string;
  channelName: string;
  videoCount: number;
}

@Component({
  selector: 'syl-playlist-card',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article
      class="syl-playlist-card"
      (click)="cardClick.emit(playlist())"
      tabindex="0"
      (keydown.enter)="cardClick.emit(playlist())"
      [attr.aria-label]="playlist().title + ' playlist'"
    >
      <div class="syl-playlist-cover-wrapper">
        @if (playlist().coverImage) {
          <img [src]="playlist().coverImage" [alt]="playlist().title" class="syl-playlist-img" loading="lazy" />
        } @else {
          <div class="syl-playlist-fallback"></div>
        }
        <div class="syl-playlist-overlay">
          <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
            <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8 12.5v-9l6 4.5-6 4.5z"/>
          </svg>
          <span class="syl-playlist-count">{{ playlist().videoCount }} videos</span>
        </div>
      </div>
      <div class="syl-playlist-meta">
        <h4 class="syl-playlist-title">{{ playlist().title }}</h4>
        <span class="syl-playlist-channel">{{ playlist().channelName }}</span>
      </div>
    </article>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }

    .syl-playlist-card {
      cursor: pointer;
      display: flex;
      flex-direction: column;
      border-radius: var(--syl-radius-lg, 0.75rem);
      overflow: hidden;
      transition: transform 200ms ease;
      outline: none;
    }

    .syl-playlist-card:hover {
      transform: translateY(-4px);
    }

    .syl-playlist-cover-wrapper {
      position: relative;
      width: 100%;
      aspect-ratio: 16 / 9;
      background-color: var(--syl-surface-secondary, #1f1f24);
      border-radius: var(--syl-radius-lg, 0.75rem);
      overflow: hidden;
    }

    .syl-playlist-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .syl-playlist-fallback {
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, var(--syl-surface-secondary, #1f1f24), var(--syl-surface-tertiary, #2a2a32));
    }

    .syl-playlist-overlay {
      position: absolute;
      bottom: 0;
      right: 0;
      left: 0;
      padding: 0.5rem 0.75rem;
      background: linear-gradient(to top, rgba(0, 0, 0, 0.85), transparent);
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #ffffff;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .syl-playlist-meta {
      padding: 0.625rem 0.25rem;
    }

    .syl-playlist-title {
      font-size: 0.9375rem;
      font-weight: 600;
      color: var(--syl-text-primary, #ffffff);
      margin: 0 0 0.25rem 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .syl-playlist-channel {
      font-size: 0.8125rem;
      color: var(--syl-text-secondary, #a1a1aa);
    }
  `],
})
export class SylPlaylistCardComponent {
  readonly playlist = input.required<SylPlaylistCardData>();
  readonly cardClick = output<SylPlaylistCardData>();
}
