import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export interface YTPlayerInstance {
  playVideo(): void;
  pauseVideo(): void;
  mute(): void;
  unMute(): void;
  destroy?(): void;
  getVideoData?(): { title?: string; author?: string; video_id?: string };
  getPlayerState?(): number;
}

export interface YTPlayerOptions {
  isMadeForKids?: boolean;
  onReady?: (event: { target?: YTPlayerInstance }) => void;
  onStateChange?: (event: { data?: number }) => void;
  onError?: (event: { data?: number }) => void;
}

@Injectable({
  providedIn: 'root',
})
export class YouTubePlayerService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private isApiLoaded = false;
  private apiReadyPromise: Promise<void> | null = null;

  // Multi-player instances registry keyed by unique card ID
  private readonly activeInstances = new Map<string, YTPlayerInstance>();

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
    options: YTPlayerOptions
  ): YTPlayerInstance | null {
    if (!this.isBrowser || !window.YT || !window.YT.Player) {
      return null;
    }

    // Host domain: use youtube-nocookie.com for privacy-enhanced mode (critical for Made for Kids)
    const host = options.isMadeForKids
      ? 'https://www.youtube-nocookie.com'
      : 'https://www.youtube.com';

    return new window.YT.Player(elementId, {
      width: '100%',
      height: '100%',
      videoId,
      host,
      playerVars: {
        autoplay: 1,             // Muted autoplay enabled
        mute: 1,                 // Muted by default for autoplay compliance
        loop: 1,                 // Continuous loop playback
        playlist: videoId,       // Required by YouTube API for single-video continuous loop
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

  // --- MULTI-PLAYER INSTANCE REGISTRY ---

  registerPlayerInstance(id: string, player: YTPlayerInstance): void {
    if (!id || !player) return;
    this.activeInstances.set(id, player);
  }

  getPlayerInstance(id: string): YTPlayerInstance | null {
    return this.activeInstances.get(id) ?? null;
  }

  unregisterPlayerInstance(id: string): void {
    const player = this.activeInstances.get(id);
    if (player && typeof player.destroy === 'function') {
      try {
        player.destroy();
      } catch (err) {
        console.warn(`Error destroying player ${id}:`, err);
      }
    }
    this.activeInstances.delete(id);
  }

  playVideo(id: string): void {
    const player = this.activeInstances.get(id);
    if (player && typeof player.playVideo === 'function') {
      try {
        player.playVideo();
      } catch (err) {
        console.warn(`Error playing video ${id}:`, err);
      }
    }
  }

  pauseVideo(id: string): void {
    const player = this.activeInstances.get(id);
    if (player && typeof player.pauseVideo === 'function') {
      try {
        player.pauseVideo();
      } catch (err) {
        console.warn(`Error pausing video ${id}:`, err);
      }
    }
  }

  muteVideo(id: string): void {
    const player = this.activeInstances.get(id);
    if (player && typeof player.mute === 'function') {
      try {
        player.mute();
      } catch (err) {
        console.warn(`Error muting video ${id}:`, err);
      }
    }
  }

  unmuteVideo(id: string): boolean {
    const player = this.activeInstances.get(id);
    if (player && typeof player.unMute === 'function') {
      try {
        player.unMute();
        return true;
      } catch (err) {
        console.warn(`Error unmuting video ${id}:`, err);
        return false;
      }
    }
    return false;
  }

  playAll(): void {
    for (const [id, player] of this.activeInstances.entries()) {
      if (player && typeof player.playVideo === 'function') {
        try {
          player.playVideo();
        } catch (err) {
          console.warn(`Error playing player ${id} in playAll:`, err);
        }
      }
    }
  }

  pauseAll(): void {
    for (const [id, player] of this.activeInstances.entries()) {
      if (player && typeof player.pauseVideo === 'function') {
        try {
          player.pauseVideo();
        } catch (err) {
          console.warn(`Error pausing player ${id} in pauseAll:`, err);
        }
      }
    }
  }

  muteAll(): void {
    for (const [id, player] of this.activeInstances.entries()) {
      if (player && typeof player.mute === 'function') {
        try {
          player.mute();
        } catch (err) {
          console.warn(`Error muting player ${id} in muteAll:`, err);
        }
      }
    }
  }

  unmuteAll(): { successCount: number; failedCount: number } {
    let successCount = 0;
    let failedCount = 0;
    for (const [id, player] of this.activeInstances.entries()) {
      if (player && typeof player.unMute === 'function') {
        try {
          player.unMute();
          successCount++;
        } catch (err) {
          console.warn(`Error unmuting player ${id}:`, err);
          failedCount++;
        }
      }
    }
    return { successCount, failedCount };
  }

  destroyAll(): void {
    for (const [id, player] of this.activeInstances.entries()) {
      if (player && typeof player.destroy === 'function') {
        try {
          player.destroy();
        } catch (err) {
          console.warn(`Error destroying player ${id}:`, err);
        }
      }
    }
    this.activeInstances.clear();
  }

  // --- URL PARSING & VALIDATION ---

  extractVideoId(input: string): string | null {
    if (!input || typeof input !== 'string') return null;
    const trimmed = input.trim();
    if (!trimmed) return null;

    // Reject inputs that start with protocol or domain but don't match YouTube
    if (/^https?:\/\//i.test(trimmed)) {
      if (!/(?:youtube\.com|youtu\.be)/i.test(trimmed)) {
        return null;
      }
    }

    // 1. YouTube Shorts: https://(www|m).youtube.com/shorts/VIDEO_ID
    const shortsMatch = trimmed.match(/(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})(?![a-zA-Z0-9_-])/i);
    if (shortsMatch) {
      return shortsMatch[1];
    }

    // 2. Standard watch URL: youtube.com/watch?v=VIDEO_ID (supports m.youtube.com, query params before and after)
    const watchMatch = trimmed.match(/(?:youtube\.com\/watch\?(?:.*&)?v=)([a-zA-Z0-9_-]{11})(?![a-zA-Z0-9_-])/i);
    if (watchMatch) {
      return watchMatch[1];
    }

    // 3. Short URLs: youtu.be/VIDEO_ID
    const youtuBeMatch = trimmed.match(/(?:youtu\.be\/)([a-zA-Z0-9_-]{11})(?![a-zA-Z0-9_-])/i);
    if (youtuBeMatch) {
      return youtuBeMatch[1];
    }

    // 4. Embed URLs: youtube.com/embed/VIDEO_ID or youtube.com/v/VIDEO_ID
    const embedMatch = trimmed.match(/(?:youtube\.com\/(?:embed|v)\/)([a-zA-Z0-9_-]{11})(?![a-zA-Z0-9_-])/i);
    if (embedMatch) {
      return embedMatch[1];
    }

    // 5. Raw 11-character video ID directly (without any URL prefixes)
    if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed) && !trimmed.includes('.') && !trimmed.includes('/')) {
      return trimmed;
    }

    return null;
  }
}
