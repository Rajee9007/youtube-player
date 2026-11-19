import { Injectable, signal, computed, inject } from '@angular/core';
import { YouTubePlayerService } from './youtube-player.service';

export type PlayerPlaybackStatus =
  | 'pending'
  | 'loading'
  | 'ready'
  | 'playing'
  | 'paused'
  | 'ended'
  | 'error';

export interface MultiPlayerItem {
  id: string;
  youtubeVideoId: string;
  originalUrl: string;
  title: string;
  thumbnailUrl: string;
  addedAt: string;
  status: PlayerPlaybackStatus;
  isMuted: boolean;
  initialMutePreference: boolean;
  errorMessage?: string;
}

const STORAGE_KEY = 'syl_multi_video_players';

@Injectable({
  providedIn: 'root',
})
export class MultiPlayerStateService {
  private readonly ytService = inject(YouTubePlayerService);

  readonly players = signal<MultiPlayerItem[]>([]);

  // Computed summary statistics (dynamically derived from players signal)
  // Total Players immediately increments upon adding and decrements on removal
  readonly totalPlayers = computed<number>(() => this.players().length);

  readonly initializedPlayers = computed<number>(() =>
    this.players().filter(
      (p) => p.status !== 'pending' && p.status !== 'loading' && p.status !== 'error'
    ).length
  );

  readonly playingPlayers = computed<number>(() =>
    this.players().filter((p) => p.status === 'playing').length
  );

  readonly pausedPlayers = computed<number>(() =>
    this.players().filter((p) => p.status === 'paused').length
  );

  readonly mutedPlayers = computed<number>(() =>
    this.players().filter((p) => p.isMuted).length
  );

  readonly errorPlayers = computed<number>(() =>
    this.players().filter((p) => p.status === 'error').length
  );

  constructor() {
    this.restoreFromStorage();
  }

  /**
   * Adds a new YouTube player immediately to state with pending status.
   * If openWithMuted is true (default), player is created muted.
   */
  addPlayer(
    rawUrl: string,
    openWithMuted: boolean = true
  ): { success: boolean; error?: string; player?: MultiPlayerItem } {
    if (!rawUrl || !rawUrl.trim()) {
      return { success: false, error: 'Please enter a valid YouTube URL or Video ID.' };
    }

    const videoId = this.ytService.extractVideoId(rawUrl);
    if (!videoId) {
      return {
        success: false,
        error:
          'Invalid YouTube link. Please provide a standard URL (youtube.com/watch?v=...), short link (youtu.be/...), Shorts, or 11-char ID.',
      };
    }

    // Check for duplicate video ID
    const exists = this.players().some((p) => p.youtubeVideoId === videoId);
    if (exists) {
      return {
        success: false,
        error: `Video with ID "${videoId}" has already been added to your dashboard.`,
      };
    }

    const newId = 'syl-player-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
    const newPlayer: MultiPlayerItem = {
      id: newId,
      youtubeVideoId: videoId,
      originalUrl: rawUrl.trim(),
      title: `YouTube Video (${videoId})`,
      thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      addedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'pending',
      isMuted: openWithMuted,
      initialMutePreference: openWithMuted,
    };

    // Immediately increment Total Players
    this.players.update((current) => [...current, newPlayer]);
    this.persistToStorage();

    return { success: true, player: newPlayer };
  }

  /**
   * Immediately removes player and decrements Total Players.
   */
  removePlayer(id: string): void {
    this.ytService.unregisterPlayerInstance(id);
    this.players.update((current) => current.filter((p) => p.id !== id));
    this.persistToStorage();
  }

  updatePlayerStatus(id: string, status: PlayerPlaybackStatus, errorMessage?: string): void {
    this.players.update((current) =>
      current.map((p) => {
        if (p.id === id) {
          return {
            ...p,
            status,
            errorMessage: errorMessage ?? (status === 'error' ? p.errorMessage : undefined),
          };
        }
        return p;
      })
    );
  }

  updatePlayerSound(id: string, isMuted: boolean): void {
    this.players.update((current) =>
      current.map((p) => (p.id === id ? { ...p, isMuted } : p))
    );
    this.persistToStorage();
  }

  updatePlayerTitle(id: string, title: string): void {
    if (!title || !title.trim()) return;
    this.players.update((current) =>
      current.map((p) => (p.id === id ? { ...p, title: title.trim() } : p))
    );
    this.persistToStorage();
  }

  // --- PLAYBACK COORDINATION ---
  // When one video starts playing, pause all other actively playing videos
  onPlayerStartedPlaying(activeId: string): void {
    const currentlyPlaying = this.players().filter(
      (p) => p.id !== activeId && p.status === 'playing'
    );

    for (const other of currentlyPlaying) {
      this.ytService.pauseVideo(other.id);
      this.updatePlayerStatus(other.id, 'paused');
    }

    this.updatePlayerStatus(activeId, 'playing');
  }

  // --- GLOBAL ACTIONS ---

  muteAll(): void {
    this.ytService.muteAll();
    this.players.update((current) => current.map((p) => ({ ...p, isMuted: true })));
    this.persistToStorage();
  }

  unmuteAll(): { successCount: number; failedCount: number } {
    const result = this.ytService.unmuteAll();
    this.players.update((current) => current.map((p) => ({ ...p, isMuted: false })));
    this.persistToStorage();
    return result;
  }

  pauseAll(): void {
    this.ytService.pauseAll();
    this.players.update((current) =>
      current.map((p) => (p.status === 'playing' ? { ...p, status: 'paused' } : p))
    );
  }

  clearAll(): void {
    this.ytService.destroyAll();
    this.players.set([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  }

  // --- LOCALSTORAGE PERSISTENCE ---

  private persistToStorage(): void {
    try {
      const serialized = this.players().map((p) => ({
        id: p.id,
        youtubeVideoId: p.youtubeVideoId,
        originalUrl: p.originalUrl,
        title: p.title,
        thumbnailUrl: p.thumbnailUrl,
        addedAt: p.addedAt,
        isMuted: p.isMuted,
        initialMutePreference: p.initialMutePreference,
      }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(serialized));
    } catch (err) {
      console.warn('Unable to persist players to localStorage:', err);
    }
  }

  private restoreFromStorage(): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        // Recreate player cards in 'pending' state to allow lazy initialization
        const restored: MultiPlayerItem[] = parsed.map((item) => ({
          id: item.id || 'syl-player-' + Math.random().toString(36).substring(2, 7),
          youtubeVideoId: item.youtubeVideoId,
          originalUrl: item.originalUrl || `https://www.youtube.com/watch?v=${item.youtubeVideoId}`,
          title: item.title || `YouTube Video (${item.youtubeVideoId})`,
          thumbnailUrl:
            item.thumbnailUrl || `https://i.ytimg.com/vi/${item.youtubeVideoId}/hqdefault.jpg`,
          addedAt: item.addedAt || 'Restored',
          status: 'pending',
          isMuted: item.isMuted ?? true,
          initialMutePreference: item.initialMutePreference ?? item.isMuted ?? true,
        }));
        this.players.set(restored);
      }
    } catch (err) {
      console.warn('Unable to restore players from localStorage:', err);
    }
  }
}
