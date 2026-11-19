import { Injectable, signal, computed, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { YouTubePlayerService } from './youtube-player.service';

export type PlayerPlaybackStatus =
  | 'pending'
  | 'loading'
  | 'ready'
  | 'playing'
  | 'paused'
  | 'ended'
  | 'error'
  | 'blocked';

export interface MultiPlayerItem {
  id: string;
  slotNumber: number; // Sequential player number (Player 1, 2, ...)
  youtubeVideoId: string;
  originalUrl: string;
  title: string;
  thumbnailUrl: string;
  addedAt: string;
  status: PlayerPlaybackStatus;
  isMuted: boolean;
  initialMutePreference: boolean;
  autoPlayOnInit?: boolean;
  errorMessage?: string;
}

export interface AddBatchResult {
  success: boolean;
  addedCount: number;
  failedCount?: number;
  error?: string;
  players?: MultiPlayerItem[];
}

export interface AddPlayerResult {
  success: boolean;
  occupied?: boolean;
  replaced?: boolean;
  error?: string;
  player?: MultiPlayerItem;
  existingPlayer?: MultiPlayerItem;
}

const STORAGE_KEY = 'syl_multi_video_players';
export const MAX_BATCH_PLAYERS = 500;

@Injectable({
  providedIn: 'root',
})
export class MultiPlayerStateService {
  private readonly ytService = inject(YouTubePlayerService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  readonly players = signal<MultiPlayerItem[]>([]);

  // Computed summary statistics (dynamically derived from players signal)
  readonly totalPlayers = computed<number>(() => this.players().length);

  readonly initializedPlayers = computed<number>(() =>
    this.players().filter(
      (p) => p.status !== 'pending' && p.status !== 'loading' && p.status !== 'error' && p.status !== 'blocked'
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
    this.players().filter((p) => p.status === 'error' || p.status === 'blocked').length
  );

  constructor() {
    this.restoreFromStorage();
  }

  /**
   * Validates number of players to add:
   * Must be a positive integer >= 1 up to MAX_BATCH_PLAYERS (100).
   */
  validatePlayerCount(count: unknown): { valid: boolean; error?: string; count?: number } {
    if (count === null || count === undefined || String(count).trim() === '') {
      return { valid: false, error: 'Number of players is required.' };
    }

    const trimmed = String(count).trim();
    if (!/^\d+$/.test(trimmed)) {
      return { valid: false, error: 'Number of players must be a positive whole number (e.g. 1, 5, 10).' };
    }

    const num = Number(trimmed);
    if (!Number.isInteger(num) || num < 1) {
      return { valid: false, error: 'Number of players must be at least 1.' };
    }

    if (num > MAX_BATCH_PLAYERS) {
      return {
        valid: false,
        error: `Maximum batch size is ${MAX_BATCH_PLAYERS} players per submission. Please enter a count between 1 and ${MAX_BATCH_PLAYERS}.`,
      };
    }

    return { valid: true, count: num };
  }

  /**
   * Backwards-compatible validator for slot number.
   */
  validateSlotNumber(slot: unknown): { valid: boolean; error?: string; slotNumber?: number } {
    const res = this.validatePlayerCount(slot);
    return { valid: res.valid, error: res.error, slotNumber: res.count };
  }

  /**
   * Returns true if any player with the given sequential player number exists.
   */
  isSlotOccupied(slotNumber: number): boolean {
    return this.players().some((p) => p.slotNumber === slotNumber);
  }

  getPlayerInSlot(slotNumber: number): MultiPlayerItem | undefined {
    return this.players().find((p) => p.slotNumber === slotNumber);
  }

  /**
   * Append-Only Dynamic Multi Player Creation:
   * - Appends `count` independent players for the given YouTube URL.
   * - Never overwrites, replaces, or renumbers existing players.
   * - Duplicate URLs are explicitly allowed; each gets a unique player instance.
   * - Assigns sequential player numbers starting from max(existing) + 1.
   * - Sets autoPlayOnInit: true so cards attempt muted autoplay immediately.
   */
  appendPlayers(
    rawUrl: string,
    countInput: unknown = 1,
    openWithMuted: boolean = true
  ): AddBatchResult {
    // 1. Validate URL
    if (!rawUrl || !String(rawUrl).trim()) {
      return { success: false, addedCount: 0, error: 'Please enter a valid YouTube URL or Video ID.' };
    }

    const videoId = this.ytService.extractVideoId(String(rawUrl).trim());
    if (!videoId) {
      return {
        success: false,
        addedCount: 0,
        error:
          'Invalid YouTube link. Please provide a standard URL (youtube.com/watch?v=...), short link (youtu.be/...), Shorts, or 11-char ID.',
      };
    }

    // 2. Validate Player Count
    const countVal = this.validatePlayerCount(countInput);
    if (!countVal.valid || countVal.count === undefined) {
      return { success: false, addedCount: 0, error: countVal.error };
    }
    const count = countVal.count;

    // 3. Compute starting sequential player number (append-only)
    const currentPlayers = this.players();
    const startNumber =
      currentPlayers.length === 0
        ? 1
        : Math.max(0, ...currentPlayers.map((p) => p.slotNumber)) + 1;

    // 4. Generate unique player items (duplicate URLs allowed!)
    const newItems: MultiPlayerItem[] = [];
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    for (let i = 0; i < count; i++) {
      const slotNumber = startNumber + i;
      const id = `syl-player-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 7)}`;

      newItems.push({
        id,
        slotNumber,
        youtubeVideoId: videoId,
        originalUrl: String(rawUrl).trim(),
        title: `YouTube Video (${videoId})`,
        thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
        addedAt: timestamp,
        status: 'pending',
        isMuted: openWithMuted,
        initialMutePreference: openWithMuted,
        autoPlayOnInit: true,
      });
    }

    // 5. Append atomically to state
    this.players.update((current) => [...current, ...newItems]);
    this.persistToStorage();

    return {
      success: true,
      addedCount: count,
      players: newItems,
    };
  }

  /**
   * Compatibility method: adds a player record or batch.
   */
  addPlayer(
    rawUrl: string,
    slotOrCountInput: unknown = 1,
    openWithMuted: boolean = true,
    _forceReplace: boolean = false
  ): AddPlayerResult {
    // Determine count: if slotOrCountInput is a valid positive integer, use it as count (or 1)
    const countVal = this.validatePlayerCount(slotOrCountInput);
    if (!countVal.valid) {
      return { success: false, error: countVal.error };
    }

    const batchRes = this.appendPlayers(rawUrl, countVal.count, openWithMuted);
    if (!batchRes.success) {
      return { success: false, error: batchRes.error };
    }

    return {
      success: true,
      player: batchRes.players?.[0],
    };
  }

  /**
   * Immediately removes player and decrements Total Players.
   * Preserves all other slot numbers without renumbering or shifting.
   */
  removePlayer(id: string): void {
    this.ytService.unregisterPlayerInstance(id);
    this.players.update((current) => current.filter((p) => p.id !== id));
    this.persistToStorage();
  }

  /**
   * Duplicate Player:
   * Appends exactly one new independent player at the end of the grid
   * inheriting the original video URL, muted autoplay, and loop configuration.
   * Leaves the original source player completely undisturbed.
   */
  duplicatePlayer(originalPlayerId: string): MultiPlayerItem | null {
    const original = this.players().find((p) => p.id === originalPlayerId);
    if (!original) return null;
    const url = original.originalUrl || `https://www.youtube.com/watch?v=${original.youtubeVideoId}`;
    const res = this.appendPlayers(url, 1, true);
    return res.players?.[0] ?? null;
  }

  updatePlayerStatus(id: string, status: PlayerPlaybackStatus, errorMessage?: string): void {
    this.players.update((current) =>
      current.map((p) => {
        if (p.id === id) {
          return {
            ...p,
            status,
            errorMessage: errorMessage ?? (status === 'error' || status === 'blocked' ? p.errorMessage : undefined),
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

  /**
   * Simultaneous Multi-Playback:
   * When a player starts playing, mark its status as 'playing'.
   * DO NOT pause other players — all players run independently!
   */
  onPlayerStartedPlaying(activeId: string): void {
    this.updatePlayerStatus(activeId, 'playing');
  }

  // --- GLOBAL ACTIONS ---

  /**
   * Play All:
   * - Retrieves all existing player records and triggers playVideo() on every available YouTube instance.
   * - Attempts playback for paused and ready players.
   * - Attempts playback for pending or autoplay-blocked players when instances are available.
   * - For pending players without an instance yet, enables autoPlayOnInit so they automatically
   *   start playback as soon as their player instance becomes ready.
   * - Preserves each player's independent playback state, sound preference, and loop configuration.
   * - Does NOT create, duplicate, replace, or remove players.
   */
  playAll(): void {
    for (const p of this.players()) {
      const instance = this.ytService.getPlayerInstance(p.id);
      if (instance && typeof instance.playVideo === 'function') {
        try {
          this.ytService.playVideo(p.id);
        } catch (err) {
          console.warn(`Error starting playback for player ${p.id} in playAll:`, err);
        }
      }
    }

    this.players.update((current) =>
      current.map((p) => (p.status === 'pending' ? { ...p, autoPlayOnInit: true } : p))
    );
  }

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

  /**
   * Clear All:
   * Cleans up all YouTube iframe instances, resets state to empty,
   * and clears LocalStorage.
   * Sequential numbering for the next batch starts from 1.
   */
  clearAll(): void {
    this.ytService.destroyAll();
    this.players.set([]);
    if (this.isBrowser) {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (err) {
        console.warn('Unable to clear localStorage:', err);
      }
    }
  }

  /**
   * Next sequential player number for the next submission.
   */
  getNextAvailableSlot(): number {
    const current = this.players();
    if (current.length === 0) return 1;
    return Math.max(0, ...current.map((p) => p.slotNumber)) + 1;
  }

  // --- LOCALSTORAGE PERSISTENCE (SSR-SAFE) ---

  private persistToStorage(): void {
    if (!this.isBrowser) return;

    try {
      const serialized = this.players().map((p) => ({
        id: p.id,
        slotNumber: p.slotNumber,
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
    if (!this.isBrowser) return;

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        // Restored players mount in 'pending' state without autoPlayOnInit
        // to prevent unwanted simultaneous playback upon browser page reload
        const restored: MultiPlayerItem[] = parsed.map((item, index) => ({
          id: item.id || 'syl-player-' + Math.random().toString(36).substring(2, 7),
          slotNumber: typeof item.slotNumber === 'number' && item.slotNumber >= 1 ? item.slotNumber : index + 1,
          youtubeVideoId: item.youtubeVideoId,
          originalUrl: item.originalUrl || `https://www.youtube.com/watch?v=${item.youtubeVideoId}`,
          title: item.title || `YouTube Video (${item.youtubeVideoId})`,
          thumbnailUrl:
            item.thumbnailUrl || `https://i.ytimg.com/vi/${item.youtubeVideoId}/hqdefault.jpg`,
          addedAt: item.addedAt || 'Restored',
          status: 'pending',
          isMuted: item.isMuted ?? true,
          initialMutePreference: item.initialMutePreference ?? item.isMuted ?? true,
          autoPlayOnInit: false,
        }));

        restored.sort((a, b) => a.slotNumber - b.slotNumber);
        this.players.set(restored);
      }
    } catch (err) {
      console.warn('Unable to restore players from localStorage (corrupted data handled):', err);
    }
  }
}
