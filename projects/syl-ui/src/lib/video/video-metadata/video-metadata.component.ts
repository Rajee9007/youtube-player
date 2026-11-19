import { Component, input, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SylAvatarComponent } from '../../primitives/avatar/avatar.component';
import { SylButtonComponent } from '../../primitives/button/button.component';
import { SylBadgeComponent } from '../../primitives/badge/badge.component';

export interface SylVideoMetadataDetails {
  id: string;
  title: string;
  description: string;
  publishedAt: string;
  channelId: string;
  channelName: string;
  channelLogoUrl?: string;
  subscribeUrl: string;
  tags?: string[];
  isMadeForKids?: boolean;
}

@Component({
  selector: 'syl-video-metadata',
  standalone: true,
  imports: [CommonModule, SylAvatarComponent, SylButtonComponent, SylBadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="syl-video-details">
      <h1 class="syl-details-title">{{ details().title }}</h1>

      <div class="syl-details-channel-row">
        <div class="syl-channel-left">
          <syl-avatar
            [src]="details().channelLogoUrl || null"
            [name]="details().channelName"
            size="md"
          />
          <div class="syl-channel-names">
            <h3 class="syl-channel-title">{{ details().channelName }}</h3>
            <span class="syl-details-date">Published on {{ details().publishedAt }}</span>
          </div>
        </div>

        <div class="syl-channel-actions">
          @if (details().isMadeForKids) {
            <syl-badge variant="success" [pill]="true">Child-Directed Content</syl-badge>
          }
          <a
            [href]="details().subscribeUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="syl-sub-link"
          >
            <syl-button variant="primary" size="md">
              Subscribe
            </syl-button>
          </a>
        </div>
      </div>

      <div class="syl-desc-box" [class.syl-desc-collapsed]="!isExpanded()">
        <p class="syl-desc-text">{{ details().description }}</p>
        @if (details().tags && details().tags!.length > 0) {
          <div class="syl-tags-row">
            @for (tag of details().tags; track tag) {
              <span class="syl-tag">#{{ tag }}</span>
            }
          </div>
        }
        <button
          type="button"
          class="syl-toggle-expand"
          (click)="toggleExpand()"
        >
          {{ isExpanded() ? 'Show less' : 'Show more' }}
        </button>
      </div>
    </section>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }

    .syl-video-details {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
      margin-top: 1rem;
    }

    .syl-details-title {
      font-size: 1.375rem;
      font-weight: 700;
      color: var(--syl-text-primary, #ffffff);
      margin: 0;
      line-height: 1.35;
    }

    .syl-details-channel-row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid var(--syl-border, #27272a);
    }

    .syl-channel-left {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .syl-channel-names {
      display: flex;
      flex-direction: column;
    }

    .syl-channel-title {
      font-size: 1rem;
      font-weight: 600;
      color: var(--syl-text-primary, #ffffff);
      margin: 0;
    }

    .syl-details-date {
      font-size: 0.75rem;
      color: var(--syl-text-secondary, #a1a1aa);
    }

    .syl-channel-actions {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .syl-sub-link {
      text-decoration: none;
    }

    .syl-desc-box {
      background-color: var(--syl-surface, #141417);
      border: 1px solid var(--syl-border, #27272a);
      border-radius: var(--syl-radius-lg, 0.75rem);
      padding: 1.25rem;
      position: relative;
    }

    .syl-desc-collapsed .syl-desc-text {
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .syl-desc-text {
      font-size: 0.875rem;
      color: var(--syl-text-primary, #ffffff);
      white-space: pre-line;
      line-height: 1.6;
      margin: 0 0 0.75rem 0;
    }

    .syl-tags-row {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-bottom: 0.75rem;
    }

    .syl-tag {
      font-size: 0.75rem;
      color: var(--syl-accent, #e50914);
      font-weight: 500;
    }

    .syl-toggle-expand {
      background: transparent;
      border: none;
      color: var(--syl-text-secondary, #a1a1aa);
      font-size: 0.8125rem;
      font-weight: 600;
      cursor: pointer;
      padding: 0;
    }

    .syl-toggle-expand:hover {
      color: var(--syl-text-primary, #ffffff);
    }
  `],
})
export class SylVideoMetadataComponent {
  readonly details = input.required<SylVideoMetadataDetails>();
  readonly isExpanded = signal<boolean>(false);

  toggleExpand(): void {
    this.isExpanded.update((v) => !v);
  }
}
