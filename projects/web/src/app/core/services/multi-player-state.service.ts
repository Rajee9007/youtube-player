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
  | 'error';

export interface MultiPlayerItem {
  id: string;
  slotNumber: number;
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

export interface AddPlayerResult {
  success: boolean;
  occupied?: boolean;
  replaced?: boolean;
  error?: string;
  player?: MultiPlayerItem;
  existingPlayer?: MultiPlayerItem;
}

const STORAGE_KEY = 'syl_multi_video_players';

@Injectable({
  providedIn: 'root',
})
export class MultiPlayerStateService {
  private readonly ytService = inject(YouTubePlayerService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  readonly players = signal<MultiPlayerItem[]>([]);

  // Computed summary statistics (dynamically derived from players signal)
  // Total Players reflects active registered player records, not loaded iframes
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
   * Validates a player slot number:
   * Must be a positive whole integer >= 1 (no decimals, no 0, no negatives, no strings/empty).
   */
  validateSlotNumber(slot: unknown): { valid: boolean; error?: string; slotNumber?: number } {
    if (slot === null || slot === undefined || String(slot).trim() === '') {
      return { valid: false, error: 'Player Number is required.' };
    }

    const trimmed = String(slot).trim();
    // Reject non-numeric or floating point strings
    if (!/^\d+$/.test(trimmed)) {
      return { valid: false, error: 'Player Number must be a positive whole number (e.g. 1, 2, 5).' };
    }

    const num = Number(trimmed);
    if (!Number.isInteger(num) || num < 1) {
      return { valid: false, error: 'Player Number must be at least 1 (positive integers only).' };
    }

    return { valid: true, slotNumber: num };
  }

  isSlotOccupied(slotNumber: number): boolean {
    return this.players().some((p) => p.slotNumber === slotNumber);
  }

  getPlayerInSlot(slotNumber: number): MultiPlayerItem | undefined {
    return this.players().find((p) => p.slotNumber === slotNumber);
  }

  /**
   * Adds or replaces a YouTube video in a specific Player Slot number.
   * - Immediately updates Total Players upon addition.
   * - Does NOT increase Total Players if replacing an existing occupied slot.
   * - Never auto-renumbers other slots.
   */
  addPlayer(
    rawUrl: string,
    slotNumberInput: unknown,
    openWithMuted: boolean = true,
    forceReplace: boolean = false
  ): AddPlayerResult {
    // 1. Validate URL
    if (!rawUrl || !String(rawUrl).trim()) {
      return { success: false, error: 'Please enter a valid YouTube URL or Video ID.' };
    }

    const videoId = this.ytService.extractVideoId(String(rawUrl).trim());
    if (!videoId) {
      return {
        success: false,
        error:
          'Invalid YouTube link. Please provide a standard URL (youtube.com/watch?v=...), short link (youtu.be/...), Shorts, or 11-char ID.',
      };
    }

    // 2. Validate Slot Number
    const slotValidation = this.validateSlotNumber(slotNumberInput);
    if (!slotValidation.valid || slotValidation.slotNumber === undefined) {
      return { success: false, error: slotValidation.error };
    }
    const slotNumber = slotValidation.slotNumber;

    // 3. Check for duplicate video ID across other slots
    const duplicateInOtherSlot = this.players().find(
      (p) => p.youtubeVideoId === videoId && p.slotNumber !== slotNumber
    );
    if (duplicateInOtherSlot) {
      return {
        success: false,
        error: `Video with ID "${videoId}" is already assigned to Player #${duplicateInOtherSlot.slotNumber}.`,
      };
    }

    // 4. Check for occupied slot
    const existingInSlot = this.getPlayerInSlot(slotNumber);
    if (existingInSlot && !forceReplace) {
      return {
        success: false,
        occupied: true,
        existingPlayer: existingInSlot,
        error: `Player ${slotNumber} is already occupied. Do you want to replace the existing video?`,
      };
    }

    // 5. Handle Replacement
    if (existingInSlot && forceReplace) {
      // Safely destroy previous player instance
      this.ytService.unregisterPlayerInstance(existingInSlot.id);

      const replacedPlayer: MultiPlayerItem = {
        id: 'syl-player-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
        slotNumber,
        youtubeVideoId: videoId,
        originalUrl: String(rawUrl).trim(),
        title: `YouTube Video (${videoId})`,
        thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
        addedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'pending',
        isMuted: openWithMuted,
        initialMutePreference: openWithMuted,
      };

      // In-place replacement: Count remains unchanged
      this.players.update((current) =>
        current.map((p) => (p.slotNumber === slotNumber ? replacedPlayer : p))
      );
      this.persistToStorage();

      return { success: true, player: replacedPlayer, replaced: true };
    }

    // 6. Handle New Slot Insertion (Sorted by slotNumber for display)
    const newPlayer: MultiPlayerItem = {
      id: 'syl-player-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      slotNumber,
      youtubeVideoId: videoId,
      originalUrl: String(rawUrl).trim(),
      title: `YouTube Video (${videoId})`,
      thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      addedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'pending',
      isMuted: openWithMuted,
      initialMutePreference: openWithMuted,
    };

    // Immediately increment Total Players and keep sorted by slotNumber
    this.players.update((current) => {
      const updated = [...current, newPlayer];
      return updated.sort((a, b) => a.slotNumber - b.slotNumber);
    });
    this.persistToStorage();

    return { success: true, player: newPlayer };
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
  // Atomic signal update: Pauses other active videos when one begins playing
  onPlayerStartedPlaying(activeId: string): void {
    const currentlyPlaying = this.players().filter(
      (p) => p.id !== activeId && p.status === 'playing'
    );

    for (const other of currentlyPlaying) {
      this.ytService.pauseVideo(other.id);
    }

    // Atomic update to avoid sequential multi-pass signal recomputations
    this.players.update((current) =>
      current.map((p) => {
        if (p.id === activeId) return { ...p, status: 'playing' };
        if (p.status === 'playing') return { ...p, status: 'paused' };
        return p;
      })
    );
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
    if (this.isBrowser) {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (err) {
        console.warn('Unable to clear localStorage:', err);
      }
    }
  }

  // Next suggested empty slot for user convenience
  getNextAvailableSlot(): number {
    const occupied = new Set(this.players().map((p) => p.slotNumber));
    let slot = 1;
    while (occupied.has(slot)) {
      slot++;
    }
    return slot;
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
        // Recreate player cards in 'pending' state (no autoplay)
        const restored: MultiPlayerItem[] = parsed.map((item, index) => ({
          id: item.id || 'syl-player-' + Math.random().toString(36).substring(2, 7),
          // Migration support: fallback to sequential index + 1 if legacy record lacks slotNumber
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
        }));

        restored.sort((a, b) => a.slotNumber - b.slotNumber);
        this.players.set(restored);
      }
    } catch (err) {
      console.warn('Unable to restore players from localStorage (corrupted data handled):', err);
    }
  }
}
