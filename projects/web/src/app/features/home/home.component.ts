import { Component, OnInit, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { VideoService } from '../../core/services/video.service';
import { Channel } from '../../shared/models/channel.model';
import { VideoDetailViewModel } from '../../shared/models/video.model';
import { Playlist } from '../../shared/models/playlist.model';
import { Category } from '../../shared/models/category.model';
import {
  SylVideoCardComponent,
  SylVideoGridComponent,
  SylChannelCardComponent,
  SylPlaylistCardComponent,
  SylButtonComponent,
  SylBadgeComponent,
  SylSkeletonComponent,
} from '@seyyul/ui';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    SylVideoCardComponent,
    SylVideoGridComponent,
    SylChannelCardComponent,
    SylPlaylistCardComponent,
    SylButtonComponent,
    SylBadgeComponent,
    SylSkeletonComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="syl-home-view">
      @if (loading()) {
        <div class="syl-hero-skeleton">
          <syl-skeleton width="100%" height="400px" shape="rect" radius="1rem" />
        </div>
      } @else if (featuredVideo()) {
        <!-- Hero Featured Video Section -->
        <section class="syl-hero-section">
          <div class="syl-hero-media">
            <img [src]="featuredVideo()!.thumbnailUrl" [alt]="featuredVideo()!.title" class="syl-hero-bg" />
            <div class="syl-hero-gradient"></div>
            <div class="syl-hero-content">
              <div class="syl-hero-badges">
                <syl-badge variant="accent" [pill]="true">Featured Story</syl-badge>
                <span class="syl-hero-channel">{{ featuredVideo()!.channelName }}</span>
              </div>
              <h2 class="syl-hero-title">{{ featuredVideo()!.title }}</h2>
              <p class="syl-hero-desc">{{ featuredVideo()!.description }}</p>
              <div class="syl-hero-actions">
                <syl-button variant="primary" size="lg" (clicked)="onWatch(featuredVideo()!.slug)">
                  <svg sylPrefix viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                  Watch Now
                </syl-button>
                <syl-button variant="secondary" size="lg" (clicked)="onExploreChannel(featuredVideo()!.channelId)">
                  Explore Channel
                </syl-button>
              </div>
            </div>
          </div>
        </section>
      }

      <!-- Five Channels Navigation -->
      <section class="syl-section">
        <div class="syl-section-header">
          <div>
            <h2 class="syl-section-title">Explore Five Seyyul Channels</h2>
            <p class="syl-section-sub">Distinct creative universes brought together under one destination</p>
          </div>
          <a routerLink="/channels">
            <syl-button variant="ghost" size="sm">View All Channels →</syl-button>
          </a>
        </div>
        <div class="syl-channels-grid">
          @for (ch of channels(); track ch.id) {
            <syl-channel-card
              [channel]="ch"
              (explore)="onChannelCardExplore($event)"
            />
          }
        </div>
      </section>

      <!-- Trending Videos -->
      <section class="syl-section">
        <div class="syl-section-header">
          <div>
            <h2 class="syl-section-title">Trending Across Seyyul</h2>
            <p class="syl-section-sub">Most engaged episodes and performances this week</p>
          </div>
        </div>
        <syl-video-grid>
          @for (video of trendingVideos(); track video.id) {
            <syl-video-card
              [video]="video"
              (cardClick)="onWatch($event.slug)"
            />
          }
        </syl-video-grid>
      </section>

      <!-- Curated Playlists -->
      <section class="syl-section">
        <div class="syl-section-header">
          <div>
            <h2 class="syl-section-title">Featured Curated Playlists</h2>
            <p class="syl-section-sub">Bingeable collections ordered by theme and literary period</p>
          </div>
        </div>
        <div class="syl-playlists-grid">
          @for (pl of playlists(); track pl.id) {
            <syl-playlist-card
              [playlist]="{
                id: pl.id,
                slug: pl.slug,
                title: pl.title,
                description: pl.description,
                coverImage: pl.coverImage,
                channelName: 'Seyyul Curated',
                videoCount: pl.videoIds.length
              }"
              (cardClick)="onPlaylistClick($event.slug)"
            />
          }
        </div>
      </section>

      <!-- Latest Uploads -->
      <section class="syl-section">
        <div class="syl-section-header">
          <div>
            <h2 class="syl-section-title">Latest Uploads</h2>
            <p class="syl-section-sub">Freshly released videos from our channels</p>
          </div>
        </div>
        <syl-video-grid>
          @for (video of latestVideos(); track video.id) {
            <syl-video-card
              [video]="video"
              (cardClick)="onWatch($event.slug)"
            />
          }
        </syl-video-grid>
      </section>
    </div>
  `,
  styles: [`
    .syl-home-view {
      display: flex;
      flex-direction: column;
      gap: 3.5rem;
    }

    .syl-hero-section {
      width: 100%;
      border-radius: var(--syl-radius-lg, 1rem);
      overflow: hidden;
      border: 1px solid var(--syl-border, #27272a);
      box-shadow: var(--syl-shadow-lg, 0 10px 25px -5px rgba(0, 0, 0, 0.5));
    }

    .syl-hero-media {
      position: relative;
      width: 100%;
      min-height: 440px;
      display: flex;
      align-items: flex-end;
      background-color: #000000;
    }

    .syl-hero-bg {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      opacity: 0.65;
    }

    .syl-hero-gradient {
      position: absolute;
      inset: 0;
      background: linear-gradient(
        to top,
        rgba(9, 9, 11, 0.95) 0%,
        rgba(9, 9, 11, 0.6) 50%,
        rgba(9, 9, 11, 0.2) 100%
      );
    }

    .syl-hero-content {
      position: relative;
      z-index: 2;
      padding: 2.5rem;
      max-width: 48rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .syl-hero-badges {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .syl-hero-channel {
      font-size: 0.8125rem;
      font-weight: 600;
      color: var(--syl-text-secondary, #a1a1aa);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .syl-hero-title {
      font-size: 2.25rem;
      font-weight: 800;
      color: #ffffff;
      margin: 0;
      line-height: 1.2;
    }

    @media (max-width: 640px) {
      .syl-hero-title {
        font-size: 1.5rem;
      }
      .syl-hero-content {
        padding: 1.5rem;
      }
    }

    .syl-hero-desc {
      font-size: 0.9375rem;
      color: #d4d4d8;
      line-height: 1.5;
      margin: 0;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .syl-hero-actions {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 1rem;
      margin-top: 0.5rem;
    }

    .syl-section {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .syl-section-header {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      gap: 1rem;
    }

    .syl-section-title {
      font-size: 1.375rem;
      font-weight: 700;
      color: var(--syl-text-primary, #ffffff);
      margin: 0 0 0.25rem 0;
      letter-spacing: -0.01em;
    }

    .syl-section-sub {
      font-size: 0.875rem;
      color: var(--syl-text-secondary, #a1a1aa);
      margin: 0;
    }

    .syl-channels-grid {
      display: grid;
      grid-template-columns: repeat(1, minmax(0, 1fr));
      gap: 1rem;
    }

    @media (min-width: 640px) {
      .syl-channels-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }

    @media (min-width: 1024px) {
      .syl-channels-grid {
        grid-template-columns: repeat(5, minmax(0, 1fr));
      }
    }

    .syl-playlists-grid {
      display: grid;
      grid-template-columns: repeat(1, minmax(0, 1fr));
      gap: 1.25rem;
    }

    @media (min-width: 640px) {
      .syl-playlists-grid {
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }
    }
  `],
})
export class HomeComponent implements OnInit {
  private readonly videoService = inject(VideoService);
  private readonly router = inject(Router);

  readonly loading = signal<boolean>(true);
  readonly featuredVideo = signal<VideoDetailViewModel | null>(null);
  readonly channels = signal<Channel[]>([]);
  readonly trendingVideos = signal<VideoDetailViewModel[]>([]);
  readonly latestVideos = signal<VideoDetailViewModel[]>([]);
  readonly playlists = signal<Playlist[]>([]);
  readonly categories = signal<Category[]>([]);

  ngOnInit(): void {
    this.videoService.getHomeData().subscribe({
      next: (data) => {
        this.featuredVideo.set(data.featuredVideo);
        this.channels.set(data.channels);
        this.trendingVideos.set(data.trendingVideos);
        this.latestVideos.set(data.latestVideos);
        this.playlists.set(data.featuredPlaylists);
        this.categories.set(data.categories);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  onWatch(slug: string): void {
    this.router.navigate(['/videos', slug]);
  }

  onPlaylistClick(slug: string): void {
    this.router.navigate(['/playlists', slug]);
  }

  onChannelCardExplore(ch: any): void {
    this.router.navigate(['/channels', ch.slug]);
  }

  onExploreChannel(channelId: string): void {
    const ch = this.channels().find((c) => c.id === channelId);
    if (ch) {
      this.router.navigate(['/channels', ch.slug]);
    }
  }
}
