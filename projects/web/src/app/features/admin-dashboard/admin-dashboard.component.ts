import { Component, OnInit, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminService } from '../../core/services/admin.service';
import { AnalyticsService } from '../../core/services/analytics.service';
import { Channel } from '../../shared/models/channel.model';
import { Video } from '../../shared/models/video.model';
import {
  SylStatCardComponent,
  SylButtonComponent,
  SylCardComponent,
  SylBadgeComponent,
} from '@seyyul/ui';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    SylStatCardComponent,
    SylButtonComponent,
    SylCardComponent,
    SylBadgeComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="syl-admin-dashboard">
      <div class="syl-dash-header">
        <div>
          <h1 class="syl-dash-title">Platform Overview</h1>
          <p class="syl-dash-sub">Operational status, video registry, and audience engagement statistics</p>
        </div>
        <div class="syl-dash-actions">
          <a routerLink="/admin/videos">
            <syl-button variant="primary" size="md">
              + Register New Video
            </syl-button>
          </a>
        </div>
      </div>

      <!-- Stat Cards Grid -->
      <div class="syl-stats-grid">
        <syl-stat-card
          title="Registered Channels"
          [value]="channels().length"
          hint="5 active brand channels"
          [positive]="true"
        />

        <syl-stat-card
          title="Total Registered Videos"
          [value]="videos().length"
          hint="Across all 5 channels"
        />

        <syl-stat-card
          title="Published Videos"
          [value]="publishedCount()"
          hint="Publicly accessible on web"
          [positive]="true"
        />

        <syl-stat-card
          title="Website Page Views"
          [value]="analytics.pageViews()"
          hint="+12.4% this month"
          [positive]="true"
        />
      </div>

      <!-- Quick Registry Highlights -->
      <div class="syl-dash-panels">
        <syl-card [bordered]="true">
          <div sylCardHeader class="syl-panel-header">
            <h3 class="syl-panel-title">Recent Video Registrations</h3>
            <a routerLink="/admin/videos">
              <syl-button variant="ghost" size="sm">Manage All →</syl-button>
            </a>
          </div>
          <div class="syl-recent-vids-list">
            @for (v of recentVideos(); track v.id) {
              <div class="syl-recent-item">
                <img [src]="v.thumbnailUrl" [alt]="v.title" class="syl-recent-thumb" />
                <div class="syl-recent-meta">
                  <h4 class="syl-recent-title">{{ v.title }}</h4>
                  <span class="syl-recent-id">ID: {{ v.youtubeVideoId }} • {{ v.publishedAt }}</span>
                </div>
                <syl-badge [variant]="v.publicationStatus === 'published' ? 'success' : 'warning'" [pill]="true">
                  {{ v.publicationStatus }}
                </syl-badge>
              </div>
            }
          </div>
        </syl-card>

        <syl-card [bordered]="true">
          <div sylCardHeader class="syl-panel-header">
            <h3 class="syl-panel-title">Channels Status</h3>
            <a routerLink="/admin/channels">
              <syl-button variant="ghost" size="sm">Configure →</syl-button>
            </a>
          </div>
          <div class="syl-dash-ch-list">
            @for (ch of channels(); track ch.id) {
              <div class="syl-dash-ch-item">
                <img [src]="ch.logoUrl" [alt]="ch.name" class="syl-dash-ch-logo" />
                <div class="syl-dash-ch-info">
                  <span class="syl-dash-ch-name">{{ ch.name }}</span>
                  <span class="syl-dash-ch-sub">YT: {{ ch.youtubeChannelId }}</span>
                </div>
                <syl-badge variant="success" [pill]="true">Active</syl-badge>
              </div>
            }
          </div>
        </syl-card>
      </div>
    </div>
  `,
  styles: [`
    .syl-admin-dashboard {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .syl-dash-header {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      gap: 1rem;
    }

    .syl-dash-title {
      font-size: 1.875rem;
      font-weight: 800;
      color: var(--syl-text-primary, #ffffff);
      margin: 0 0 0.25rem 0;
    }

    .syl-dash-sub {
      font-size: 0.875rem;
      color: var(--syl-text-secondary, #a1a1aa);
      margin: 0;
    }

    .syl-stats-grid {
      display: grid;
      grid-template-columns: repeat(1, minmax(0, 1fr));
      gap: 1.25rem;
    }

    @media (min-width: 640px) {
      .syl-stats-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }

    @media (min-width: 1024px) {
      .syl-stats-grid {
        grid-template-columns: repeat(4, minmax(0, 1fr));
      }
    }

    .syl-dash-panels {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1.5rem;
    }

    @media (min-width: 1024px) {
      .syl-dash-panels {
        grid-template-columns: 3fr 2fr;
      }
    }

    .syl-panel-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .syl-panel-title {
      font-size: 1rem;
      font-weight: 700;
      color: var(--syl-text-primary, #ffffff);
      margin: 0;
    }

    .syl-recent-vids-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .syl-recent-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.5rem 0;
      border-bottom: 1px solid var(--syl-border, #27272a);
    }

    .syl-recent-item:last-child {
      border-bottom: none;
    }

    .syl-recent-thumb {
      width: 4rem;
      height: 2.25rem;
      border-radius: var(--syl-radius-sm, 0.25rem);
      object-fit: cover;
      flex-shrink: 0;
    }

    .syl-recent-meta {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
    }

    .syl-recent-title {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--syl-text-primary, #ffffff);
      margin: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .syl-recent-id {
      font-size: 0.75rem;
      color: var(--syl-text-muted, #71717a);
    }

    .syl-dash-ch-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .syl-dash-ch-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.5rem 0;
      border-bottom: 1px solid var(--syl-border, #27272a);
    }

    .syl-dash-ch-item:last-child {
      border-bottom: none;
    }

    .syl-dash-ch-logo {
      width: 2rem;
      height: 2rem;
      border-radius: 50%;
      object-fit: cover;
    }

    .syl-dash-ch-info {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .syl-dash-ch-name {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--syl-text-primary, #ffffff);
    }

    .syl-dash-ch-sub {
      font-size: 0.75rem;
      color: var(--syl-text-muted, #71717a);
    }
  `],
})
export class AdminDashboardComponent implements OnInit {
  private readonly adminService = inject(AdminService);
  readonly analytics = inject(AnalyticsService);

  readonly channels = signal<Channel[]>([]);
  readonly videos = signal<Video[]>([]);

  readonly publishedCount = signal<number>(0);
  readonly recentVideos = signal<Video[]>([]);

  ngOnInit(): void {
    this.adminService.getAllChannels().subscribe((chs) => this.channels.set(chs));
    this.adminService.getAllVideos().subscribe((vids) => {
      this.videos.set(vids);
      this.publishedCount.set(vids.filter((v) => v.publicationStatus === 'published').length);
      this.recentVideos.set(vids.slice(0, 5));
    });
  }
}
