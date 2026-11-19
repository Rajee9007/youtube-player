import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

@Injectable({
  providedIn: 'root',
})
export class YouTubePlayerService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private isApiLoaded = false;
  private apiReadyPromise: Promise<void> | null = null;

  loadIFrameApi(): Promise<void> {
    if (!this.isBrowser) {
      return Promise.resolve();
    }

    if (this.isApiLoaded && window.YT && window.YT.Player) {
      return Promise.resolve();
    }

    if (this.apiReadyPromise) {
      return this.apiReadyPromise;
    }

    this.apiReadyPromise = new Promise<void>((resolve) => {
      // If already defined on window
      if (window.YT && window.YT.Player) {
        this.isApiLoaded = true;
        resolve();
        return;
      }

      // Chain onto existing callback if another script initiated
      const prevCallback = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (prevCallback) prevCallback();
        this.isApiLoaded = true;
        resolve();
      };

      // Inject script tag
      const existingScript = document.getElementById('youtube-iframe-api');
      if (!existingScript) {
        const tag = document.createElement('script');
        tag.id = 'youtube-iframe-api';
        tag.src = 'https://www.youtube.com/iframe_api';
        document.body.appendChild(tag);
      }
    });

    return this.apiReadyPromise;
  }

  createPlayer(
    elementId: string,
    videoId: string,
    options: {
      isMadeForKids?: boolean;
      onReady?: (event: any) => void;
      onStateChange?: (event: any) => void;
      onError?: (event: any) => void;
    }
  ): any {
    if (!this.isBrowser || !window.YT || !window.YT.Player) {
      return null;
    }

    // Host domain: use youtube-nocookie.com for privacy-enhanced mode (critical for Made for Kids)
    const host = options.isMadeForKids
      ? 'https://www.youtube-nocookie.com'
      : 'https://www.youtube.com';

    return new window.YT.Player(elementId, {
      videoId,
      host,
      playerVars: {
        autoplay: 0,             // Strictly NO autoplay per guidelines
        controls: 1,             // Native YouTube controls preserved
        rel: 0,                  // Do not show unrelated videos
        modestbranding: 1,       // Clean presentation preserving brand
        playsinline: 1,          // Seamless mobile playback
        enablejsapi: 1,
        origin: window.location.origin,
      },
      events: {
        onReady: options.onReady,
        onStateChange: options.onStateChange,
        onError: options.onError,
      },
    });
  }

  extractVideoId(input: string): string | null {
    if (!input) return null;
    const trimmed = input.trim();
    if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
      return trimmed;
    }

    const match = trimmed.match(
      /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/
    );
    return match ? match[1] : null;
  }
}
