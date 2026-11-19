import {
  Component,
  input,
  signal,
  effect,
  inject,
  OnDestroy,
  ElementRef,
  viewChild,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { YouTubePlayerService } from '../../../core/services/youtube-player.service';
import { SylVideoPlayerContainerComponent } from '@seyyul/ui';

@Component({
  selector: 'app-video-player',
  standalone: true,
  imports: [CommonModule, SylVideoPlayerContainerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <syl-video-player-container
      [loading]="isLoading()"
      [error]="hasError()"
      [errorMessage]="errorMessage()"
      (retry)="retryPlayback()"
    >
      <div #playerMount class="syl-player-mount"></div>
    </syl-video-player-container>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }

    .syl-player-mount {
      width: 100%;
      height: 100%;
    }
  `],
})
export class VideoPlayerComponent implements OnDestroy {
  readonly videoId = input.required<string>();
  readonly isMadeForKids = input<boolean>(false);

  private readonly ytService = inject(YouTubePlayerService);
  private playerInstance: any = null;
  private readonly playerMount = viewChild<ElementRef<HTMLDivElement>>('playerMount');

  readonly isLoading = signal<boolean>(true);
  readonly hasError = signal<boolean>(false);
  readonly errorMessage = signal<string>('');

  constructor() {
    effect(() => {
      const vid = this.videoId();
      const mount = this.playerMount();
      if (vid && mount) {
        this.setupPlayer(vid);
      }
    });
  }

  private async setupPlayer(vid: string): Promise<void> {
    this.destroyPlayer();
    this.isLoading.set(true);
    this.hasError.set(false);
    this.errorMessage.set('');

    try {
      await this.ytService.loadIFrameApi();
      const mountEl = this.playerMount()?.nativeElement;
      if (!mountEl) return;

      // Unique container id
      const uniqueId = 'yt-frame-' + Math.random().toString(36).substring(2, 9);
      mountEl.id = uniqueId;

      this.playerInstance = this.ytService.createPlayer(uniqueId, vid, {
        isMadeForKids: this.isMadeForKids(),
        onReady: () => {
          this.isLoading.set(false);
        },
        onError: (e: any) => {
          this.isLoading.set(false);
          this.hasError.set(true);
          const code = e?.data;
          if (code === 100) {
            this.errorMessage.set('The requested video was not found or has been removed.');
          } else if (code === 101 || code === 150) {
            this.errorMessage.set('Playback on external sites has been disabled by the video owner.');
          } else {
            this.errorMessage.set('An error occurred during playback initialization.');
          }
        },
      });
    } catch {
      this.isLoading.set(false);
      this.hasError.set(true);
      this.errorMessage.set('Unable to connect to the YouTube video service.');
    }
  }

  retryPlayback(): void {
    const vid = this.videoId();
    if (vid) {
      this.setupPlayer(vid);
    }
  }

  private destroyPlayer(): void {
    if (this.playerInstance && typeof this.playerInstance.destroy === 'function') {
      try {
        this.playerInstance.destroy();
      } catch {}
      this.playerInstance = null;
    }
  }

  ngOnDestroy(): void {
    this.destroyPlayer();
  }
}
