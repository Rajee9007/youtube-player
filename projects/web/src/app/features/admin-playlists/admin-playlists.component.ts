import { Component, OnInit, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlaylistService } from '../../core/services/playlist.service';
import { Playlist } from '../../shared/models/playlist.model';
import { SylBadgeComponent } from '@seyyul/ui';

@Component({
  selector: 'app-admin-playlists',
  standalone: true,
  imports: [CommonModule, SylBadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="syl-admin-playlists-page">
      <div class="syl-view-header">
        <div>
          <h1 class="syl-view-title">Playlist Management</h1>
          <p class="syl-view-sub">Organize curated playlists and ordered video tracklists</p>
        </div>
      </div>

      <div class="syl-playlists-table-card">
        <table class="syl-admin-table">
          <thead>
            <tr>
              <th>Playlist</th>
              <th>Videos Included</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            @for (pl of playlists(); track pl.id) {
              <tr>
                <td>
                  <div class="syl-cell-pl">
                    <img [src]="pl.coverImage" [alt]="pl.title" class="syl-pl-thumb" />
                    <div>
                      <span class="syl-pl-name">{{ pl.title }}</span>
                      <span class="syl-pl-desc">{{ pl.description }}</span>
                    </div>
                  </div>
                </td>
                <td>{{ pl.videoIds.length }} videos</td>
                <td>
                  <syl-badge [variant]="pl.isPublished ? 'success' : 'default'" [pill]="true">
                    {{ pl.isPublished ? 'Published' : 'Draft' }}
                  </syl-badge>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .syl-admin-playlists-page {
      display: flex;
      flex-direction: column;
      gap: 1.75rem;
    }
    .syl-view-header {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
    }
    .syl-view-title {
      font-size: 1.875rem;
      font-weight: 800;
      color: var(--syl-text-primary, #ffffff);
      margin: 0 0 0.25rem 0;
    }
    .syl-view-sub {
      font-size: 0.875rem;
      color: var(--syl-text-secondary, #a1a1aa);
      margin: 0;
    }
    .syl-playlists-table-card {
      background-color: var(--syl-surface, #141417);
      border: 1px solid var(--syl-border, #27272a);
      border-radius: var(--syl-radius-lg, 0.75rem);
      overflow-x: auto;
    }
    .syl-admin-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-size: 0.875rem;
    }
    th {
      padding: 0.875rem 1rem;
      background-color: var(--syl-surface-secondary, #18181b);
      color: var(--syl-text-secondary, #a1a1aa);
      font-weight: 600;
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border-bottom: 1px solid var(--syl-border, #27272a);
    }
    td {
      padding: 0.875rem 1rem;
      border-bottom: 1px solid var(--syl-border, #27272a);
      color: var(--syl-text-primary, #ffffff);
      vertical-align: middle;
    }
    .syl-cell-pl {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .syl-pl-thumb {
      width: 4rem;
      height: 2.25rem;
      border-radius: var(--syl-radius-sm, 0.25rem);
      object-fit: cover;
    }
    .syl-pl-name {
      font-weight: 600;
      color: var(--syl-text-primary, #ffffff);
      display: block;
    }
    .syl-pl-desc {
      font-size: 0.75rem;
      color: var(--syl-text-muted, #71717a);
      display: block;
      max-width: 24rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  `],
})
export class AdminPlaylistsComponent implements OnInit {
  private readonly playlistService = inject(PlaylistService);
  readonly playlists = signal<Playlist[]>([]);

  ngOnInit(): void {
    this.playlistService.getPlaylists().subscribe((pls) => this.playlists.set(pls));
  }
}
