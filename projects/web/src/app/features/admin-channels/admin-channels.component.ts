import { Component, OnInit, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../core/services/admin.service';
import { Channel, CreateChannelDto } from '../../shared/models/channel.model';
import {
  SylButtonComponent,
  SylInputComponent,
  SylBadgeComponent,
  SylDialogComponent,
  SylToastService,
} from '@seyyul/ui';

@Component({
  selector: 'app-admin-channels',
  standalone: true,
  imports: [CommonModule, FormsModule, SylButtonComponent, SylInputComponent, SylBadgeComponent, SylDialogComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="syl-admin-channels-page">
      <div class="syl-view-header">
        <div>
          <h1 class="syl-view-title">Channel Management</h1>
          <p class="syl-view-sub">Configure the 5 official Seyyul brand channels, branding assets, and display order</p>
        </div>
      </div>

      <div class="syl-channels-table-card">
        <table class="syl-admin-table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Channel Name</th>
              <th>YouTube Channel ID</th>
              <th>Status</th>
              <th class="syl-text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (ch of channels(); track ch.id) {
              <tr>
                <td><strong>#{{ ch.displayOrder }}</strong></td>
                <td>
                  <div class="syl-cell-channel">
                    <img [src]="ch.logoUrl" [alt]="ch.name" class="syl-ch-logo-thumb" />
                    <div class="syl-cell-text">
                      <span class="syl-ch-title">{{ ch.name }}</span>
                      <span class="syl-ch-slug">/channels/{{ ch.slug }}</span>
                    </div>
                  </div>
                </td>
                <td><code>{{ ch.youtubeChannelId }}</code></td>
                <td>
                  <syl-badge [variant]="ch.isActive ? 'success' : 'default'" [pill]="true">
                    {{ ch.isActive ? 'Active' : 'Inactive' }}
                  </syl-badge>
                </td>
                <td class="syl-text-right">
                  <syl-button variant="secondary" size="sm" (clicked)="openEditModal(ch)">
                    Configure
                  </syl-button>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <!-- Edit Channel Modal -->
      <syl-dialog
        [open]="isModalOpen()"
        title="Configure Channel Assets"
        maxWidth="32rem"
        (closed)="isModalOpen.set(false)"
      >
        <div class="syl-form-grid">
          <div class="syl-form-group">
            <label class="syl-form-label">Channel Name</label>
            <syl-input [(ngModel)]="formName" />
          </div>

          <div class="syl-form-group">
            <label class="syl-form-label">Description</label>
            <textarea class="syl-textarea-field" rows="3" [(ngModel)]="formDescription"></textarea>
          </div>

          <div class="syl-form-group">
            <label class="syl-form-label">Logo Asset URL</label>
            <syl-input [(ngModel)]="formLogoUrl" />
          </div>

          <div class="syl-form-group">
            <label class="syl-form-label">Banner Asset URL</label>
            <syl-input [(ngModel)]="formBannerUrl" />
          </div>

          <div class="syl-form-group">
            <label class="syl-form-label">YouTube Subscribe URL</label>
            <syl-input [(ngModel)]="formSubscribeUrl" />
          </div>
        </div>

        <div sylDialogFooter>
          <syl-button variant="ghost" (clicked)="isModalOpen.set(false)">Cancel</syl-button>
          <syl-button variant="primary" (clicked)="saveChannel()">Save Changes</syl-button>
        </div>
      </syl-dialog>
    </div>
  `,
  styles: [`
    .syl-admin-channels-page {
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

    .syl-channels-table-card {
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

    .syl-cell-channel {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .syl-ch-logo-thumb {
      width: 2.25rem;
      height: 2.25rem;
      border-radius: 50%;
      object-fit: cover;
    }

    .syl-cell-text {
      display: flex;
      flex-direction: column;
    }

    .syl-ch-title {
      font-weight: 600;
      color: var(--syl-text-primary, #ffffff);
    }

    .syl-ch-slug {
      font-size: 0.75rem;
      color: var(--syl-text-muted, #71717a);
    }

    .syl-text-right {
      text-align: right;
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
  `],
})
export class AdminChannelsComponent implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly toast = inject(SylToastService);

  readonly channels = signal<Channel[]>([]);
  readonly isModalOpen = signal<boolean>(false);
  selectedChannel: Channel | null = null;

  formName = '';
  formDescription = '';
  formLogoUrl = '';
  formBannerUrl = '';
  formSubscribeUrl = '';

  ngOnInit(): void {
    this.loadChannels();
  }

  loadChannels(): void {
    this.adminService.getAllChannels().subscribe((chs) => this.channels.set(chs));
  }

  openEditModal(ch: Channel): void {
    this.selectedChannel = ch;
    this.formName = ch.name;
    this.formDescription = ch.description;
    this.formLogoUrl = ch.logoUrl;
    this.formBannerUrl = ch.bannerUrl;
    this.formSubscribeUrl = ch.subscribeUrl;
    this.isModalOpen.set(true);
  }

  saveChannel(): void {
    if (!this.selectedChannel) return;
    const dto: CreateChannelDto = {
      ...this.selectedChannel,
      name: this.formName,
      description: this.formDescription,
      logoUrl: this.formLogoUrl,
      bannerUrl: this.formBannerUrl,
      subscribeUrl: this.formSubscribeUrl,
    };

    this.adminService.saveChannel(dto, this.selectedChannel.id).subscribe({
      next: () => {
        this.toast.success('Channel profile updated successfully');
        this.isModalOpen.set(false);
        this.loadChannels();
      },
    });
  }
}
