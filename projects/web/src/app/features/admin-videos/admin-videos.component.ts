import { Component, OnInit, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../core/services/admin.service';
import { YouTubePlayerService } from '../../core/services/youtube-player.service';
import { Channel } from '../../shared/models/channel.model';
import { Video, CreateVideoDto } from '../../shared/models/video.model';
import {
  SylButtonComponent,
  SylInputComponent,
  SylSelectComponent,
  SylSwitchComponent,
  SylBadgeComponent,
  SylDialogComponent,
  SylConfirmDialogComponent,
  SylToastService,
} from '@seyyul/ui';

@Component({
  selector: 'app-admin-videos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SylButtonComponent,
    SylInputComponent,
    SylSelectComponent,
    SylSwitchComponent,
    SylBadgeComponent,
    SylDialogComponent,
    SylConfirmDialogComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="syl-admin-videos-page">
      <div class="syl-view-header">
        <div>
          <h1 class="syl-view-title">Video Management</h1>
          <p class="syl-view-sub">Manually ingest YouTube URLs, configure metadata, and manage publication states</p>
        </div>
        <syl-button variant="primary" (clicked)="openAddModal()">
          + Add Video from YouTube URL
        </syl-button>
      </div>

      <!-- Videos Table / List -->
      <div class="syl-videos-table-card">
        <table class="syl-admin-table">
          <thead>
            <tr>
              <th>Video</th>
              <th>Channel</th>
              <th>YouTube ID</th>
              <th>Status</th>
              <th>Made for Kids</th>
              <th class="syl-text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (vid of videos(); track vid.id) {
              <tr>
                <td>
                  <div class="syl-cell-video">
                    <img [src]="vid.thumbnailUrl" [alt]="vid.title" class="syl-table-thumb" />
                    <div class="syl-cell-meta">
                      <span class="syl-cell-title" [title]="vid.title">{{ vid.title }}</span>
                      <span class="syl-cell-duration">{{ vid.durationSeconds }}s • {{ vid.publishedAt }}</span>
                    </div>
                  </div>
                </td>
                <td>{{ getChannelName(vid.channelId) }}</td>
                <td><code>{{ vid.youtubeVideoId }}</code></td>
                <td>
                  <button
                    type="button"
                    class="syl-status-toggle"
                    (click)="togglePublish(vid.id)"
                    [title]="'Click to ' + (vid.publicationStatus === 'published' ? 'unpublish' : 'publish')"
                  >
                    <syl-badge [variant]="vid.publicationStatus === 'published' ? 'success' : 'warning'" [pill]="true">
                      {{ vid.publicationStatus }}
                    </syl-badge>
                  </button>
                </td>
                <td>
                  @if (vid.isMadeForKids) {
                    <syl-badge variant="info" [pill]="true">Yes (Kids)</syl-badge>
                  } @else {
                    <span class="syl-text-muted">Standard</span>
                  }
                </td>
                <td class="syl-text-right">
                  <div class="syl-actions-cell">
                    <syl-button variant="ghost" size="sm" (clicked)="openEditModal(vid)">
                      Edit
                    </syl-button>
                    <syl-button variant="danger" size="sm" (clicked)="confirmDelete(vid)">
                      Delete
                    </syl-button>
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <!-- Add/Edit Modal Dialog -->
      <syl-dialog
        [open]="isModalOpen()"
        [title]="editingVideoId ? 'Edit Video Metadata' : 'Register New YouTube Video'"
        maxWidth="38rem"
        (closed)="closeModal()"
      >
        <div class="syl-form-grid">
          <div class="syl-form-group">
            <label class="syl-form-label">YouTube URL or 11-character Video ID</label>
            <syl-input
              [(ngModel)]="formYoutubeInput"
              placeholder="e.g. https://www.youtube.com/watch?v=M7lc1UVf-VE"
              (ngModelChange)="onUrlInputChange($event)"
            />
            @if (detectedVideoId()) {
              <div class="syl-detected-banner">
                <span class="syl-detected-label">Detected Valid ID:</span>
                <code>{{ detectedVideoId() }}</code>
              </div>
            }
          </div>

          <div class="syl-form-group">
            <label class="syl-form-label">Title</label>
            <syl-input [(ngModel)]="formTitle" placeholder="Video title" />
          </div>

          <div class="syl-form-group">
            <label class="syl-form-label">Channel</label>
            <syl-select
              [options]="channelOptions()"
              placeholder="Select Target Channel"
              [(ngModel)]="formChannelId"
            />
          </div>

          <div class="syl-form-group">
            <label class="syl-form-label">Description</label>
            <textarea
              class="syl-textarea-field"
              rows="4"
              [(ngModel)]="formDescription"
              placeholder="Detailed editorial description..."
            ></textarea>
          </div>

          <div class="syl-form-group">
            <label class="syl-form-label">Thumbnail Image URL</label>
            <syl-input [(ngModel)]="formThumbnailUrl" placeholder="Image URL (auto-generated from YouTube if blank)" />
          </div>

          <div class="syl-form-group">
            <label class="syl-form-label">Tags (comma separated)</label>
            <syl-input [(ngModel)]="formTags" placeholder="e.g. literature, grammar, classical" />
          </div>

          <div class="syl-toggles-row">
            <syl-switch [(ngModel)]="formIsMadeForKids">
              Child-Directed Content (Seyyul Kids / COPPA compliant)
            </syl-switch>
          </div>

          <div class="syl-toggles-row">
            <syl-switch [(ngModel)]="formIsFeatured">
              Promote to Homepage Hero / Featured Video
            </syl-switch>
          </div>
        </div>

        <div sylDialogFooter>
          <syl-button variant="ghost" (clicked)="closeModal()">Cancel</syl-button>
          <syl-button variant="primary" (clicked)="saveVideo()" [disabled]="!canSave()">
            Save &amp; Publish Record
          </syl-button>
        </div>
      </syl-dialog>

      <!-- Delete Confirmation Dialog -->
      <syl-confirm-dialog
        [open]="isDeleteConfirmOpen()"
        title="Delete Video Record"
        [message]="'Are you sure you want to remove this video metadata record: ' + (pendingDeleteVideo?.title || '') + '? This action cannot be undone.'"
        [danger]="true"
        confirmText="Permanently Delete"
        (confirm)="executeDelete()"
        (cancel)="isDeleteConfirmOpen.set(false)"
      />
    </div>
  `,
  styles: [`
    .syl-admin-videos-page {
      display: flex;
      flex-direction: column;
      gap: 1.75rem;
    }

    .syl-view-header {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      gap: 1rem;
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

    .syl-videos-table-card {
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

    .syl-cell-video {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      max-width: 20rem;
    }

    .syl-table-thumb {
      width: 4.5rem;
      height: 2.5rem;
      border-radius: var(--syl-radius-sm, 0.25rem);
      object-fit: cover;
      flex-shrink: 0;
    }

    .syl-cell-meta {
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    .syl-cell-title {
      font-weight: 600;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      color: var(--syl-text-primary, #ffffff);
    }

    .syl-cell-duration {
      font-size: 0.75rem;
      color: var(--syl-text-muted, #71717a);
    }

    .syl-status-toggle {
      background: transparent;
      border: none;
      cursor: pointer;
      padding: 0;
    }

    .syl-text-right {
      text-align: right;
    }

    .syl-actions-cell {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
    }

    .syl-form-grid {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .syl-form-group {
      display: flex;
      flex-direction: column;
      gap: 0.375rem;
    }

    .syl-form-label {
      font-size: 0.8125rem;
      font-weight: 600;
      color: var(--syl-text-secondary, #a1a1aa);
    }

    .syl-textarea-field {
      width: 100%;
      background-color: var(--syl-surface-secondary, #18181b);
      border: 1px solid var(--syl-border, #27272a);
      border-radius: var(--syl-radius-md, 0.5rem);
      color: var(--syl-text-primary, #ffffff);
      padding: 0.75rem;
      font-family: inherit;
      font-size: 0.875rem;
      resize: vertical;
      outline: none;
    }

    .syl-textarea-field:focus {
      border-color: var(--syl-accent, #e50914);
    }

    .syl-detected-banner {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.75rem;
      color: var(--syl-success, #10b981);
    }

    .syl-detected-banner code {
      font-weight: 700;
      background-color: rgba(16, 185, 129, 0.15);
      padding: 0.1rem 0.35rem;
      border-radius: 4px;
    }

    .syl-toggles-row {
      margin-top: 0.5rem;
    }
  `],
})
export class AdminVideosComponent implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly ytService = inject(YouTubePlayerService);
  private readonly toast = inject(SylToastService);

  readonly videos = signal<Video[]>([]);
  readonly channels = signal<Channel[]>([]);
  readonly channelOptions = signal<{ label: string; value: any }[]>([]);

  // Dialog State
  readonly isModalOpen = signal<boolean>(false);
  editingVideoId: string | null = null;

  // Form Fields
  formYoutubeInput = '';
  readonly detectedVideoId = signal<string>('');
  formTitle = '';
  formChannelId: string | null = null;
  formDescription = '';
  formThumbnailUrl = '';
  formTags = '';
  formIsMadeForKids = false;
  formIsFeatured = false;

  // Delete State
  readonly isDeleteConfirmOpen = signal<boolean>(false);
  pendingDeleteVideo: Video | null = null;

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.adminService.getAllChannels().subscribe((chs) => {
      this.channels.set(chs);
      this.channelOptions.set(chs.map((c) => ({ label: c.name, value: c.id })));
      if (chs.length > 0 && !this.formChannelId) {
        this.formChannelId = chs[0].id;
      }
    });
    this.adminService.getAllVideos().subscribe((vids) => this.videos.set(vids));
  }

  getChannelName(id: string): string {
    return this.channels().find((c) => c.id === id)?.name || id;
  }

  onUrlInputChange(val: string): void {
    const id = this.ytService.extractVideoId(val);
    if (id) {
      this.detectedVideoId.set(id);
      if (!this.formThumbnailUrl) {
        this.formThumbnailUrl = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
      }
    } else {
      this.detectedVideoId.set('');
    }
  }

  openAddModal(): void {
    this.editingVideoId = null;
    this.formYoutubeInput = '';
    this.detectedVideoId.set('');
    this.formTitle = '';
    this.formDescription = '';
    this.formThumbnailUrl = '';
    this.formTags = '';
    this.formIsMadeForKids = false;
    this.formIsFeatured = false;
    this.isModalOpen.set(true);
  }

  openEditModal(video: Video): void {
    this.editingVideoId = video.id;
    this.formYoutubeInput = video.youtubeVideoId;
    this.detectedVideoId.set(video.youtubeVideoId);
    this.formTitle = video.title;
    this.formChannelId = video.channelId;
    this.formDescription = video.description;
    this.formThumbnailUrl = video.thumbnailUrl;
    this.formTags = (video.tags || []).join(', ');
    this.formIsMadeForKids = video.isMadeForKids;
    this.formIsFeatured = video.featured;
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
  }

  canSave(): boolean {
    return !!this.detectedVideoId() && !!this.formTitle.trim() && !!this.formChannelId;
  }

  saveVideo(): void {
    if (!this.canSave()) return;

    const dto: CreateVideoDto = {
      youtubeVideoId: this.detectedVideoId(),
      title: this.formTitle.trim(),
      description: this.formDescription.trim(),
      thumbnailUrl: this.formThumbnailUrl || `https://i.ytimg.com/vi/${this.detectedVideoId()}/hqdefault.jpg`,
      channelId: this.formChannelId!,
      categoryIds: [],
      tags: this.formTags.split(',').map((t) => t.trim()).filter(Boolean),
      durationSeconds: 300,
      publicationStatus: 'published',
      isMadeForKids: this.formIsMadeForKids,
      publishedAt: new Date().toISOString().split('T')[0],
      featured: this.formIsFeatured,
    };

    this.adminService.saveVideo(dto, this.editingVideoId || undefined).subscribe({
      next: () => {
        this.toast.success('Video record saved successfully');
        this.closeModal();
        this.refresh();
      },
    });
  }

  togglePublish(id: string): void {
    this.adminService.togglePublish(id).subscribe({
      next: (updated) => {
        this.toast.info(`Video publication status updated to: ${updated.publicationStatus}`);
        this.refresh();
      },
    });
  }

  confirmDelete(v: Video): void {
    this.pendingDeleteVideo = v;
    this.isDeleteConfirmOpen.set(true);
  }

  executeDelete(): void {
    if (!this.pendingDeleteVideo) return;
    this.adminService.deleteVideo(this.pendingDeleteVideo.id).subscribe({
      next: () => {
        this.toast.success('Video removed from registry');
        this.isDeleteConfirmOpen.set(false);
        this.refresh();
      },
    });
  }
}
