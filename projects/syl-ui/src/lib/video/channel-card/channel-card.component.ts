import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SylAvatarComponent } from '../../primitives/avatar/avatar.component';
import { SylButtonComponent } from '../../primitives/button/button.component';

export interface SylChannelCardData {
  id: string;
  name: string;
  slug: string;
  description: string;
  logoUrl?: string;
  bannerUrl?: string;
  youtubeChannelId: string;
  subscribeUrl: string;
  videoCount?: number;
}

@Component({
  selector: 'syl-channel-card',
  standalone: true,
  imports: [CommonModule, SylAvatarComponent, SylButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="syl-channel-card" (click)="explore.emit(channel())">
      <div class="syl-channel-banner">
        @if (channel().bannerUrl) {
          <img [src]="channel().bannerUrl" [alt]="channel().name + ' banner'" class="syl-banner-img" />
        } @else {
          <div class="syl-banner-fallback"></div>
        }
      </div>
      <div class="syl-channel-content">
        <div class="syl-channel-avatar-wrapper">
          <syl-avatar
            [src]="channel().logoUrl || null"
            [name]="channel().name"
            size="lg"
          />
        </div>
        <h3 class="syl-channel-name">{{ channel().name }}</h3>
        <p class="syl-channel-desc">{{ channel().description }}</p>
        <div class="syl-channel-actions" (click)="$event.stopPropagation()">
          <syl-button variant="secondary" size="sm" (clicked)="explore.emit(channel())">
            Explore
          </syl-button>
          <a
            [href]="channel().subscribeUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="syl-subscribe-link"
          >
            <syl-button variant="primary" size="sm">
              Subscribe
            </syl-button>
          </a>
        </div>
      </div>
    </article>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }

    .syl-channel-card {
      background-color: var(--syl-surface, #141417);
      border: 1px solid var(--syl-border, #27272a);
      border-radius: var(--syl-radius-lg, 0.75rem);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      cursor: pointer;
      transition: transform 200ms ease, border-color 200ms ease;
    }

    .syl-channel-card:hover {
      transform: translateY(-4px);
      border-color: var(--syl-border-subtle, #3f3f46);
    }

    .syl-channel-banner {
      width: 100%;
      height: 6rem;
      background-color: var(--syl-surface-secondary, #1f1f24);
      position: relative;
    }

    .syl-banner-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .syl-banner-fallback {
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, var(--syl-surface-secondary, #1f1f24), var(--syl-surface-tertiary, #2a2a32));
    }

    .syl-channel-content {
      padding: 0 1.25rem 1.25rem 1.25rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      position: relative;
    }

    .syl-channel-avatar-wrapper {
      margin-top: -1.75rem;
      margin-bottom: 0.75rem;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.5);
      border-radius: 50%;
    }

    .syl-channel-name {
      font-size: 1.125rem;
      font-weight: 700;
      color: var(--syl-text-primary, #ffffff);
      margin: 0 0 0.375rem 0;
    }

    .syl-channel-desc {
      font-size: 0.8125rem;
      color: var(--syl-text-secondary, #a1a1aa);
      margin: 0 0 1.25rem 0;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      line-height: 1.4;
    }

    .syl-channel-actions {
      display: flex;
      align-items: center;
      gap: 0.625rem;
      width: 100%;
      justify-content: center;
    }

    .syl-subscribe-link {
      text-decoration: none;
    }
  `],
})
export class SylChannelCardComponent {
  readonly channel = input.required<SylChannelCardData>();
  readonly explore = output<SylChannelCardData>();
}
