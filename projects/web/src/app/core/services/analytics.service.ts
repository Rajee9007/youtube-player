import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AnalyticsService {
  readonly pageViews = signal<number>(24580);
  readonly videoPlays = signal<number>(14290);

  trackPageView(pageName: string): void {
    this.pageViews.update((v) => v + 1);
  }

  trackVideoPlay(videoId: string): void {
    this.videoPlays.update((v) => v + 1);
  }
}
