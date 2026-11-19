import { Component, OnInit, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ChannelService } from '../../core/services/channel.service';
import { Channel } from '../../shared/models/channel.model';
import { VideoDetailViewModel } from '../../shared/models/video.model';
import {
  SylAvatarComponent,
  SylButtonComponent,
  SylVideoCardComponent,
  SylVideoGridComponent,
  SylEmptyStateComponent,
  SylSkeletonComponent,
} from '@seyyul/ui';

@Component({
  selector: 'app-channel-detail',
  standalone: true,
  imports: [
    CommonModule,
    SylAvatarComponent,
    SylButtonComponent,
    SylVideoCardComponent,
    SylVideoGridComponent,
    SylEmptyStateComponent,
    SylSkeletonComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (loading()) {
      <div class="syl-channel-loading">
        <syl-skeleton height="240px" radius="1rem" />
        <syl-skeleton height="120px" radius="0.5rem" />
      </div>
    } @else if (channel()) {
      <div class="syl-channel-detail-view">
        <!-- Banner & Header -->
        <header class="syl-ch-header">
          <div class="syl-ch-banner">
            <img [src]="channel()!.bannerUrl" [alt]="channel()!.name" class="syl-ch-banner-img" />
          </div>
          <div class="syl-ch-info-bar">
            <div class="syl-ch-avatar-box">
              <syl-avatar [src]="channel()!.logoUrl" [name]="channel()!.name" size="xl" />
            </div>
            <div class="syl-ch-info-text">
              <h1 class="syl-ch-name">{{ channel()!.name }}</h1>
              <p class="syl-ch-desc">{{ channel()!.description }}</p>
            </div>
            <div class="syl-ch-action">
              <a [href]="channel()!.subscribeUrl" target="_blank" rel="noopener noreferrer">
                <syl-button variant="primary" size="lg">
                  Subscribe on YouTube
                </syl-button>
              </a>
            </div>
          </div>
        </header>

        <!-- Video Catalog -->
        <section class="syl-ch-videos-section">
          <div class="syl-section-title-row">
            <h2 class="syl-section-heading">Uploaded Videos ({{ videos().length }})</h2>
          </div>

          @if (videos().length === 0) {
            <syl-empty-state
              title="No videos found"
              description="This channel does not have any published videos yet."
            />
          } @else {
            <syl-video-grid>
              @for (v of videos(); track v.id) {
                <syl-video-card
                  [video]="v"
                  (cardClick)="onWatch($event.slug)"
                />
              }
            </syl-video-grid>
          }
        </section>
      </div>
    }
  `,
  styles: [`
    .syl-channel-detail-view {
      display: flex;
      flex-direction: column;
      gap: 3rem;
    }

    .syl-ch-header {
      border-radius: var(--syl-radius-lg, 1rem);
      overflow: hidden;
      border: 1px solid var(--syl-border, #27272a);
      background-color: var(--syl-surface, #141417);
    }

    .syl-ch-banner {
      width: 100%;
      height: 220px;
      background-color: var(--syl-surface-secondary, #1f1f24);
      position: relative;
    }

    .syl-ch-banner-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .syl-ch-info-bar {
      padding: 1.5rem 2rem;
      display: flex;
      align-items: center;
      gap: 1.5rem;
      position: relative;
    }

    @media (max-width: 768px) {
      .syl-ch-info-bar {
        flex-direction: column;
        align-items: flex-start;
        padding: 1.25rem;
      }
    }

    .syl-ch-avatar-box {
      margin-top: -3.5rem;
      border-radius: 50%;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.6);
      flex-shrink: 0;
    }

    .syl-ch-info-text {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .syl-ch-name {
      font-size: 1.75rem;
      font-weight: 800;
      color: var(--syl-text-primary, #ffffff);
      margin: 0;
    }

    .syl-ch-desc {
      font-size: 0.875rem;
      color: var(--syl-text-secondary, #a1a1aa);
      margin: 0;
      max-width: 48rem;
      line-height: 1.5;
    }

    .syl-ch-action {
      flex-shrink: 0;
    }

    .syl-section-heading {
      font-size: 1.375rem;
      font-weight: 700;
      color: var(--syl-text-primary, #ffffff);
      margin: 0 0 1.25rem 0;
    }

    .syl-channel-loading {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
  `],
})
export class ChannelDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly channelService = inject(ChannelService);

  readonly channel = signal<Channel | null>(null);
  readonly videos = signal<VideoDetailViewModel[]>([]);
  readonly loading = signal<boolean>(true);

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const slug = params.get('slug');
      if (slug) {
        this.loadChannel(slug);
      }
    });
  }

  private loadChannel(slug: string): void {
    this.loading.set(true);
    this.channelService.getChannelBySlug(slug).subscribe({
      next: (data) => {
        this.channel.set(data.channel);
        this.videos.set(data.videos);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  onWatch(slug: string): void {
    this.router.navigate(['/videos', slug]);
  }
}
