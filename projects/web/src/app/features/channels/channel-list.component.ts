import { Component, OnInit, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ChannelService } from '../../core/services/channel.service';
import { Channel } from '../../shared/models/channel.model';
import { SylChannelCardComponent, SylSkeletonComponent } from '@seyyul/ui';

@Component({
  selector: 'app-channel-list',
  standalone: true,
  imports: [CommonModule, SylChannelCardComponent, SylSkeletonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="syl-channels-page">
      <div class="syl-page-header">
        <h1 class="syl-page-title">Seyyul Channels</h1>
        <p class="syl-page-sub">
          Explore all five dedicated channels under the Seyyul Media Network. Each channel curates specialized programming for distinct audiences.
        </p>
      </div>

      @if (loading()) {
        <div class="syl-channels-grid">
          @for (i of [1, 2, 3, 4, 5]; track i) {
            <syl-skeleton height="260px" radius="0.75rem" />
          }
        </div>
      } @else {
        <div class="syl-channels-grid">
          @for (ch of channels(); track ch.id) {
            <syl-channel-card
              [channel]="ch"
              (explore)="onExplore($event.slug)"
            />
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .syl-channels-page {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .syl-page-header {
      max-width: 42rem;
    }

    .syl-page-title {
      font-size: 2rem;
      font-weight: 800;
      color: var(--syl-text-primary, #ffffff);
      margin: 0 0 0.5rem 0;
      letter-spacing: -0.02em;
    }

    .syl-page-sub {
      font-size: 0.9375rem;
      color: var(--syl-text-secondary, #a1a1aa);
      margin: 0;
      line-height: 1.5;
    }

    .syl-channels-grid {
      display: grid;
      grid-template-columns: repeat(1, minmax(0, 1fr));
      gap: 1.5rem;
    }

    @media (min-width: 640px) {
      .syl-channels-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }

    @media (min-width: 1024px) {
      .syl-channels-grid {
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }
    }
  `],
})
export class ChannelListComponent implements OnInit {
  private readonly channelService = inject(ChannelService);
  private readonly router = inject(Router);

  readonly channels = signal<Channel[]>([]);
  readonly loading = signal<boolean>(true);

  ngOnInit(): void {
    this.channelService.getChannels().subscribe({
      next: (data) => {
        this.channels.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  onExplore(slug: string): void {
    this.router.navigate(['/channels', slug]);
  }
}
