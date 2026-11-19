import { Component, OnInit, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PlaylistService } from '../../core/services/playlist.service';
import { Playlist } from '../../shared/models/playlist.model';
import { Channel } from '../../shared/models/channel.model';
import { VideoDetailViewModel } from '../../shared/models/video.model';
import {
  SylSkeletonComponent,
} from '@seyyul/ui';

@Component({
  selector: 'app-playlist-detail',
  standalone: true,
  imports: [CommonModule, SylSkeletonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (loading()) {
      <syl-skeleton height="300px" radius="1rem" />
    } @else if (playlist()) {
      <div class="syl-playlist-view">
        <header class="syl-pl-header">
          <div class="syl-pl-cover-box">
            <img [src]="playlist()!.coverImage" [alt]="playlist()!.title" class="syl-pl-cover-img" />
          </div>
          <div class="syl-pl-info">
            <span class="syl-pl-badge">Curated Playlist</span>
            <h1 class="syl-pl-title">{{ playlist()!.title }}</h1>
            <p class="syl-pl-desc">{{ playlist()!.description }}</p>
            <div class="syl-pl-meta-row">
              @if (channel()) {
                <span class="syl-pl-channel">Curated by {{ channel()!.name }}</span>
              }
              <span class="syl-pl-count">• {{ videos().length }} videos</span>
            </div>
          </div>
        </header>

        <section class="syl-pl-videos">
          <h2 class="syl-pl-heading">Playlist Tracklist</h2>
          <div class="syl-pl-list">
            @for (v of videos(); track v.id; let i = $index) {
              <div class="syl-pl-item" (click)="onWatch(v.slug)">
                <span class="syl-pl-index">{{ i + 1 }}</span>
                <img [src]="v.thumbnailUrl" [alt]="v.title" class="syl-pl-item-thumb" />
                <div class="syl-pl-item-info">
                  <h4 class="syl-pl-item-title">{{ v.title }}</h4>
                  <span class="syl-pl-item-channel">{{ v.channelName }}</span>
                </div>
              </div>
            }
          </div>
        </section>
      </div>
    }
  `,
  styles: [`
    .syl-playlist-view {
      display: flex;
      flex-direction: column;
      gap: 3rem;
    }

    .syl-pl-header {
      display: flex;
      gap: 2rem;
      background-color: var(--syl-surface, #141417);
      border: 1px solid var(--syl-border, #27272a);
      border-radius: var(--syl-radius-lg, 1rem);
      padding: 2rem;
    }

    @media (max-width: 768px) {
      .syl-pl-header {
        flex-direction: column;
        padding: 1.25rem;
      }
    }

    .syl-pl-cover-box {
      width: 18rem;
      aspect-ratio: 16 / 9;
      border-radius: var(--syl-radius-md, 0.5rem);
      overflow: hidden;
      flex-shrink: 0;
    }

    .syl-pl-cover-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .syl-pl-info {
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 0.5rem;
    }

    .syl-pl-badge {
      font-size: 0.6875rem;
      font-weight: 700;
      color: var(--syl-accent, #e50914);
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }

    .syl-pl-title {
      font-size: 1.875rem;
      font-weight: 800;
      color: var(--syl-text-primary, #ffffff);
      margin: 0;
    }

    .syl-pl-desc {
      font-size: 0.875rem;
      color: var(--syl-text-secondary, #a1a1aa);
      margin: 0;
      line-height: 1.5;
    }

    .syl-pl-meta-row {
      font-size: 0.8125rem;
      color: var(--syl-text-muted, #71717a);
      display: flex;
      gap: 0.5rem;
      margin-top: 0.25rem;
    }

    .syl-pl-heading {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--syl-text-primary, #ffffff);
      margin: 0 0 1rem 0;
    }

    .syl-pl-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .syl-pl-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.75rem 1rem;
      border-radius: var(--syl-radius-md, 0.5rem);
      background-color: var(--syl-surface, #141417);
      border: 1px solid var(--syl-border, #27272a);
      cursor: pointer;
      transition: all 150ms ease;
    }

    .syl-pl-item:hover {
      background-color: var(--syl-surface-secondary, #1f1f24);
      border-color: var(--syl-border-subtle, #3f3f46);
    }

    .syl-pl-index {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--syl-text-muted, #71717a);
      width: 1.5rem;
      text-align: center;
    }

    .syl-pl-item-thumb {
      width: 6.5rem;
      height: 3.65rem;
      border-radius: var(--syl-radius-sm, 0.25rem);
      object-fit: cover;
      flex-shrink: 0;
    }

    .syl-pl-item-info {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .syl-pl-item-title {
      font-size: 0.9375rem;
      font-weight: 600;
      color: var(--syl-text-primary, #ffffff);
      margin: 0;
    }

    .syl-pl-item-channel {
      font-size: 0.8125rem;
      color: var(--syl-text-secondary, #a1a1aa);
    }
  `],
})
export class PlaylistDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly playlistService = inject(PlaylistService);

  readonly playlist = signal<Playlist | null>(null);
  readonly channel = signal<Channel | null>(null);
  readonly videos = signal<VideoDetailViewModel[]>([]);
  readonly loading = signal<boolean>(true);

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const slug = params.get('slug');
      if (slug) {
        this.loadPlaylist(slug);
      }
    });
  }

  private loadPlaylist(slug: string): void {
    this.loading.set(true);
    this.playlistService.getPlaylistBySlug(slug).subscribe({
      next: (data) => {
        this.playlist.set(data.playlist);
        this.videos.set(data.videos);
        this.channel.set(data.channel);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  onWatch(slug: string): void {
    this.router.navigate(['/videos', slug]);
  }
}
