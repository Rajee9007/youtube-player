import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SylSkeletonComponent } from '../../primitives/skeleton/skeleton.component';
import { SylButtonComponent } from '../../primitives/button/button.component';

@Component({
  selector: 'syl-video-player-container',
  standalone: true,
  imports: [CommonModule, SylSkeletonComponent, SylButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="syl-player-wrapper" [class.syl-player-loading]="loading()">
      <div class="syl-player-ratio">
        @if (loading()) {
          <div class="syl-player-skeleton-overlay">
            <syl-skeleton width="100%" height="100%" shape="rect" radius="0" />
            <div class="syl-player-spinner-center">
              <div class="syl-spinner-pulse"></div>
            </div>
          </div>
        }

        @if (error()) {
          <div class="syl-player-error-overlay">
            <div class="syl-error-content">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="40" height="40" class="syl-error-icon">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <h4 class="syl-error-heading">Unable to load video</h4>
              <p class="syl-error-msg">{{ errorMessage() || 'This video may be private, deleted, or embedding was disabled by the channel owner.' }}</p>
              @if (showRetry()) {
                <syl-button variant="secondary" size="sm" (clicked)="retry.emit()">
                  Retry Playback
                </syl-button>
              }
            </div>
          </div>
        }

        <div class="syl-player-slot">
          <ng-content />
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }

    .syl-player-wrapper {
      width: 100%;
      border-radius: var(--syl-radius-lg, 0.75rem);
      overflow: hidden;
      background-color: #000000;
      box-shadow: var(--syl-shadow-lg, 0 10px 25px -5px rgba(0, 0, 0, 0.5));
      border: 1px solid var(--syl-border, #27272a);
    }

    .syl-player-ratio {
      position: relative;
      width: 100%;
      padding-top: 56.25%; /* 16:9 Aspect Ratio */
    }

    .syl-player-slot {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }

    .syl-player-slot ::ng-deep iframe,
    .syl-player-slot ::ng-deep > div {
      width: 100% !important;
      height: 100% !important;
      border: 0;
    }

    .syl-player-skeleton-overlay {
      position: absolute;
      inset: 0;
      z-index: 2;
      background-color: var(--syl-surface, #141417);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .syl-player-spinner-center {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }

    .syl-spinner-pulse {
      width: 3rem;
      height: 3rem;
      border: 3px solid var(--syl-border, #27272a);
      border-top-color: var(--syl-accent, #e50914);
      border-radius: 50%;
      animation: syl-spin 0.8s linear infinite;
    }

    @keyframes syl-spin {
      to { transform: rotate(360deg); }
    }

    .syl-player-error-overlay {
      position: absolute;
      inset: 0;
      z-index: 3;
      background-color: var(--syl-surface, #141417);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
      text-align: center;
    }

    .syl-error-content {
      max-width: 24rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
    }

    .syl-error-icon {
      color: var(--syl-danger, #ef4444);
    }

    .syl-error-heading {
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--syl-text-primary, #ffffff);
      margin: 0;
    }

    .syl-error-msg {
      font-size: 0.8125rem;
      color: var(--syl-text-secondary, #a1a1aa);
      margin: 0;
      line-height: 1.4;
    }
  `],
})
export class SylVideoPlayerContainerComponent {
  readonly loading = input<boolean>(false);
  readonly error = input<boolean>(false);
  readonly errorMessage = input<string>('');
  readonly showRetry = input<boolean>(true);

  readonly retry = output<void>();
}
