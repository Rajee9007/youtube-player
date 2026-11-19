import { Component, OnInit, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { VideoService } from '../../core/services/video.service';
import { VideoDetailViewModel } from '../../shared/models/video.model';
import { VideoPlayerComponent } from '../../shared/components/video-player/video-player.component';
import {
  SylVideoMetadataComponent,
  SylVideoCardComponent,
  SylSkeletonComponent,
} from '@seyyul/ui';

@Component({
  selector: 'app-video-detail',
  standalone: true,
  imports: [
    CommonModule,
    VideoPlayerComponent,
    SylVideoMetadataComponent,
    SylVideoCardComponent,
    SylSkeletonComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (loading()) {
      <div class="syl-video-detail-loading">
        <syl-skeleton height="480px" radius="1rem" />
        <syl-skeleton height="140px" radius="0.5rem" />
      </div>
    } @else if (video()) {
      <div class="syl-watch-layout">
        <!-- Main Video & Metadata Column -->
        <div class="syl-watch-main">
          <app-video-player
            [videoId]="video()!.youtubeVideoId"
            [isMadeForKids]="video()!.isMadeForKids"
          />

          <syl-video-metadata
            [details]="{
              id: video()!.id,
              title: video()!.title,
              description: video()!.description,
              publishedAt: video()!.publishedAt,
              channelId: video()!.channelId,
              channelName: video()!.channelName,
              channelLogoUrl: video()!.channelLogoUrl,
              subscribeUrl: video()!.channelSubscribeUrl,
              tags: video()!.tags,
              isMadeForKids: video()!.isMadeForKids
            }"
          />
        </div>

        <!-- Sidebar Recommendations -->
        <aside class="syl-watch-sidebar">
          @if (channelVideos().length > 0) {
            <div class="syl-side-group">
              <h3 class="syl-side-heading">More from {{ video()!.channelName }}</h3>
              <div class="syl-side-list">
                @for (v of channelVideos(); track v.id) {
                  <syl-video-card [video]="v" (cardClick)="onSelectVideo($event.slug)" />
                }
              </div>
            </div>
          }

          @if (relatedVideos().length > 0) {
            <div class="syl-side-group">
              <h3 class="syl-side-heading">Related Videos</h3>
              <div class="syl-side-list">
                @for (v of relatedVideos(); track v.id) {
                  <syl-video-card [video]="v" (cardClick)="onSelectVideo($event.slug)" />
                }
              </div>
            </div>
          }
        </aside>
      </div>
    }
  `,
  styles: [`
    .syl-watch-layout {
      display: grid;
      grid-template-columns: 1fr;
      gap: 2.5rem;
    }

    @media (min-width: 1024px) {
      .syl-watch-layout {
        grid-template-columns: minmax(0, 1fr) 22rem;
      }
    }

    @media (min-width: 1280px) {
      .syl-watch-layout {
        grid-template-columns: minmax(0, 1fr) 26rem;
      }
    }

    .syl-watch-main {
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    .syl-watch-sidebar {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .syl-side-heading {
      font-size: 1.0625rem;
      font-weight: 700;
      color: var(--syl-text-primary, #ffffff);
      margin: 0 0 1rem 0;
    }

    .syl-side-list {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .syl-video-detail-loading {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
  `],
})
export class VideoDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly videoService = inject(VideoService);
  private readonly titleService = inject(Title);

  readonly video = signal<VideoDetailViewModel | null>(null);
  readonly relatedVideos = signal<VideoDetailViewModel[]>([]);
  readonly channelVideos = signal<VideoDetailViewModel[]>([]);
  readonly loading = signal<boolean>(true);

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const slug = params.get('slug');
      if (slug) {
        this.loadVideo(slug);
      }
    });
  }

  private loadVideo(slug: string): void {
    this.loading.set(true);
    this.videoService.getVideoBySlug(slug).subscribe({
      next: (data) => {
        this.video.set(data.video);
        this.relatedVideos.set(data.relatedVideos);
        this.channelVideos.set(data.channelVideos);
        this.titleService.setTitle(`${data.video.title} — Seyyul Video Hub`);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  onSelectVideo(slug: string): void {
    this.router.navigate(['/videos', slug]);
  }
}
