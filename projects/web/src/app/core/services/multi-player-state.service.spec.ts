import { TestBed } from '@angular/core/testing';
import { MultiPlayerStateService } from './multi-player-state.service';
import { YouTubePlayerService } from './youtube-player.service';

describe('MultiPlayerStateService — Append-Only Dynamic Multi-Player', () => {
  let service: MultiPlayerStateService;
  let ytService: YouTubePlayerService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [MultiPlayerStateService, YouTubePlayerService],
    });
    service = TestBed.inject(MultiPlayerStateService);
    ytService = TestBed.inject(YouTubePlayerService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created and have initial empty state', () => {
    expect(service).toBeTruthy();
    expect(service.players().length).toBe(0);
    expect(service.totalPlayers()).toBe(0);
    expect(service.initializedPlayers()).toBe(0);
    expect(service.playingPlayers()).toBe(0);
    expect(service.pausedPlayers()).toBe(0);
    expect(service.mutedPlayers()).toBe(0);
    expect(service.errorPlayers()).toBe(0);
  });

  describe('Feature 1: Append-Only Dynamic Batch Creation and Sequential Numbering', () => {
    it('Scenario 1: URL A + 5 creates Player 1–5', () => {
      const res = service.appendPlayers('https://www.youtube.com/watch?v=dQw4w9WgXcQ', 5);
      expect(res.success).toBe(true);
      expect(res.addedCount).toBe(5);
      expect(service.totalPlayers()).toBe(5);

      const players = service.players();
      expect(players.length).toBe(5);
      expect(players.map((p) => p.slotNumber)).toEqual([1, 2, 3, 4, 5]);
      players.forEach((p) => {
        expect(p.youtubeVideoId).toBe('dQw4w9WgXcQ');
        expect(p.autoPlayOnInit).toBe(true);
      });
    });

    it('Scenario 2: URL B + 10 appends Player 6–15 without altering existing players', () => {
      // First batch: 5 players
      service.appendPlayers('https://www.youtube.com/watch?v=dQw4w9WgXcQ', 5);

      // Second batch: 10 players
      const res2 = service.appendPlayers('https://www.youtube.com/watch?v=L_LUpnjgPso', 10);
      expect(res2.success).toBe(true);
      expect(res2.addedCount).toBe(10);
      expect(service.totalPlayers()).toBe(15);

      const players = service.players();
      expect(players.length).toBe(15);
      expect(players.slice(0, 5).map((p) => p.slotNumber)).toEqual([1, 2, 3, 4, 5]);
      expect(players.slice(5).map((p) => p.slotNumber)).toEqual([6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
      expect(players[0].youtubeVideoId).toBe('dQw4w9WgXcQ');
      expect(players[14].youtubeVideoId).toBe('L_LUpnjgPso');
    });

    it('Scenario 3: URL C + 50 appends Player 16–65 sequentially', () => {
      service.appendPlayers('https://www.youtube.com/watch?v=dQw4w9WgXcQ', 5);
      service.appendPlayers('https://www.youtube.com/watch?v=L_LUpnjgPso', 10);

      const res3 = service.appendPlayers('https://youtu.be/9bZkp7q19f0', 50);
      expect(res3.success).toBe(true);
      expect(res3.addedCount).toBe(50);
      expect(service.totalPlayers()).toBe(65);

      const players = service.players();
      expect(players.length).toBe(65);
      expect(players[15].slotNumber).toBe(16);
      expect(players[64].slotNumber).toBe(65);
    });

    it('Scenario 4: Duplicate URLs are allowed — Same URL + 5 twice creates 10 independent players', () => {
      const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
      const b1 = service.appendPlayers(url, 5);
      const b2 = service.appendPlayers(url, 5);

      expect(b1.success).toBe(true);
      expect(b2.success).toBe(true);
      expect(service.totalPlayers()).toBe(10);

      const players = service.players();
      // Ensure each player has a unique internal ID
      const uniqueIds = new Set(players.map((p) => p.id));
      expect(uniqueIds.size).toBe(10);
      expect(players.map((p) => p.slotNumber)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    });

    it('Scenario 5: Add up to 100 players in a single batch', () => {
      const res = service.appendPlayers('https://www.youtube.com/watch?v=dQw4w9WgXcQ', 100);
      expect(res.success).toBe(true);
      expect(res.addedCount).toBe(100);
      expect(service.totalPlayers()).toBe(100);
      expect(service.players()[99].slotNumber).toBe(100);
    });
  });

  describe('Feature 2: Count and URL Validation', () => {
    it('should reject non-positive or zero player count', () => {
      const r0 = service.appendPlayers('https://www.youtube.com/watch?v=dQw4w9WgXcQ', 0);
      expect(r0.success).toBe(false);
      expect(r0.error).toContain('at least 1');

      const rNeg = service.appendPlayers('https://www.youtube.com/watch?v=dQw4w9WgXcQ', -3);
      expect(rNeg.success).toBe(false);
      expect(rNeg.error).toContain('positive whole number');
    });

    it('should reject decimals and non-numeric counts', () => {
      const rDec = service.appendPlayers('https://www.youtube.com/watch?v=dQw4w9WgXcQ', 2.5);
      expect(rDec.success).toBe(false);

      const rStr = service.appendPlayers('https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'five');
      expect(rStr.success).toBe(false);
    });

    it('should reject count exceeding maximum batch size (500) with clear guidance', () => {
      const rLarge = service.appendPlayers('https://www.youtube.com/watch?v=dQw4w9WgXcQ', 501);
      expect(rLarge.success).toBe(false);
      expect(rLarge.error).toContain('Maximum batch size is 500');
      expect(service.totalPlayers()).toBe(0);
    });

    it('should reject invalid or blank YouTube URL', () => {
      const rEmpty = service.appendPlayers('', 5);
      expect(rEmpty.success).toBe(false);

      const rInvalid = service.appendPlayers('https://google.com/test', 5);
      expect(rInvalid.success).toBe(false);
      expect(rInvalid.error).toContain('Invalid YouTube link');
    });
  });

  describe('Feature 3: Simultaneous Multi-Playback (No Auto-Pause)', () => {
    it('should allow multiple players to play simultaneously without pausing others', () => {
      service.appendPlayers('https://www.youtube.com/watch?v=dQw4w9WgXcQ', 3);
      const [p1, p2, p3] = service.players();

      // Start p1
      service.onPlayerStartedPlaying(p1.id);
      expect(service.playingPlayers()).toBe(1);

      // Start p2 — must NOT pause p1!
      service.onPlayerStartedPlaying(p2.id);
      expect(service.playingPlayers()).toBe(2);

      // Start p3 — all 3 playing simultaneously
      service.onPlayerStartedPlaying(p3.id);
      expect(service.playingPlayers()).toBe(3);

      expect(service.players()[0].status).toBe('playing');
      expect(service.players()[1].status).toBe('playing');
      expect(service.players()[2].status).toBe('playing');
    });

    it('should track blocked status in errorPlayers counter', () => {
      service.appendPlayers('https://www.youtube.com/watch?v=dQw4w9WgXcQ', 2);
      const [p1, p2] = service.players();

      service.updatePlayerStatus(p1.id, 'blocked', 'Autoplay blocked by browser policy');
      expect(service.errorPlayers()).toBe(1);

      service.updatePlayerStatus(p2.id, 'error', 'Video unavailable');
      expect(service.errorPlayers()).toBe(2);
    });
  });

  describe('Feature 4: Global Controls and Sequential Numbering Continuity', () => {
    it('Play All: should trigger playVideo on all registered player instances without unmuting or recreating', () => {
      service.appendPlayers('https://www.youtube.com/watch?v=dQw4w9WgXcQ', 2);
      const [p1, p2] = service.players();

      const mockInstance1 = { playVideo: vi.fn(), mute: vi.fn() };
      const mockInstance2 = { playVideo: vi.fn(), mute: vi.fn() };

      ytService.registerPlayerInstance(p1.id, mockInstance1 as any);
      ytService.registerPlayerInstance(p2.id, mockInstance2 as any);

      service.updatePlayerStatus(p1.id, 'paused');
      service.updatePlayerStatus(p2.id, 'ready');

      service.playAll();

      expect(mockInstance1.playVideo).toHaveBeenCalled();
      expect(mockInstance2.playVideo).toHaveBeenCalled();
      // Does not alter player counts or create new players
      expect(service.totalPlayers()).toBe(2);
      // Does not unmute players automatically
      expect(p1.isMuted).toBe(true);
      expect(p2.isMuted).toBe(true);
    });

    it('Play All: should work across multiple batches and duplicate URLs', () => {
      // Batch 1
      service.appendPlayers('https://www.youtube.com/watch?v=dQw4w9WgXcQ', 2);
      // Batch 2 with duplicate URL
      service.appendPlayers('https://www.youtube.com/watch?v=dQw4w9WgXcQ', 2);
      expect(service.totalPlayers()).toBe(4);

      const mockInstances = service.players().map((p) => {
        const mock = { playVideo: vi.fn() };
        ytService.registerPlayerInstance(p.id, mock as any);
        return mock;
      });

      service.playAll();

      mockInstances.forEach((inst) => {
        expect(inst.playVideo).toHaveBeenCalled();
      });
      expect(service.totalPlayers()).toBe(4);
    });

    it('Play All: should handle pending players by enabling autoPlayOnInit', () => {
      service.appendPlayers('https://www.youtube.com/watch?v=dQw4w9WgXcQ', 2);
      // Manually set pending with autoPlayOnInit false (e.g. after storage restore)
      service.players.update((current) =>
        current.map((p) => ({ ...p, status: 'pending', autoPlayOnInit: false }))
      );

      service.playAll();

      service.players().forEach((p) => {
        expect(p.autoPlayOnInit).toBe(true);
      });
    });

    it('should mute all and unmute all players correctly', () => {
      service.appendPlayers('https://www.youtube.com/watch?v=dQw4w9WgXcQ', 4);
      expect(service.mutedPlayers()).toBe(4);

      service.unmuteAll();
      expect(service.mutedPlayers()).toBe(0);

      service.muteAll();
      expect(service.mutedPlayers()).toBe(4);
    });

    it('should pause all active players', () => {
      service.appendPlayers('https://www.youtube.com/watch?v=dQw4w9WgXcQ', 3);
      const [p1, p2] = service.players();

      service.updatePlayerStatus(p1.id, 'playing');
      service.updatePlayerStatus(p2.id, 'playing');
      expect(service.playingPlayers()).toBe(2);

      service.pauseAll();
      expect(service.playingPlayers()).toBe(0);
      expect(service.pausedPlayers()).toBe(2);
    });

    it('Individual Remove: should remove only selected player without renumbering remaining players', () => {
      service.appendPlayers('https://www.youtube.com/watch?v=dQw4w9WgXcQ', 5);
      const p3 = service.players()[2]; // Player #3
      expect(p3.slotNumber).toBe(3);

      service.removePlayer(p3.id);
      expect(service.totalPlayers()).toBe(4);

      const remainingSlots = service.players().map((p) => p.slotNumber);
      // Slots remain 1, 2, 4, 5 — NO renumbering of existing cards!
      expect(remainingSlots).toEqual([1, 2, 4, 5]);

      // Adding next batch must continue after highest slot (Slot #6)
      service.appendPlayers('https://www.youtube.com/watch?v=L_LUpnjgPso', 2);
      expect(service.totalPlayers()).toBe(6);
      expect(service.players().map((p) => p.slotNumber)).toEqual([1, 2, 4, 5, 6, 7]);
    });

    it('Clear All: should remove all players and reset sequential numbering to 1 for next batch', () => {
      service.appendPlayers('https://www.youtube.com/watch?v=dQw4w9WgXcQ', 5);
      expect(service.totalPlayers()).toBe(5);

      service.clearAll();
      expect(service.totalPlayers()).toBe(0);
      expect(service.players().length).toBe(0);

      // Next batch starts at Player #1
      service.appendPlayers('https://www.youtube.com/watch?v=L_LUpnjgPso', 3);
      expect(service.totalPlayers()).toBe(3);
      expect(service.players().map((p) => p.slotNumber)).toEqual([1, 2, 3]);
    });
  });

  describe('Feature 5: LocalStorage Persistence and SSR Safety', () => {
    it('should persist and restore player records without triggering autoPlayOnInit', () => {
      service.appendPlayers('https://www.youtube.com/watch?v=dQw4w9WgXcQ', 3);
      expect(service.totalPlayers()).toBe(3);

      // Create a new instance simulating page reload
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [MultiPlayerStateService, YouTubePlayerService],
      });
      const reloadedService = TestBed.inject(MultiPlayerStateService);

      expect(reloadedService.totalPlayers()).toBe(3);
      expect(reloadedService.players().map((p) => p.slotNumber)).toEqual([1, 2, 3]);

      // Restored players must NOT auto-play on initial reload
      reloadedService.players().forEach((p) => {
        expect(p.autoPlayOnInit).toBe(false);
        expect(p.status).toBe('pending');
      });
    });
  });

  describe('Feature 6: Duplicate Player Action', () => {
    it('should append exactly one new player inheriting URL and mute preference', () => {
      service.appendPlayers('https://www.youtube.com/watch?v=dQw4w9WgXcQ', 2);
      const original = service.players()[0];

      const duplicated = service.duplicatePlayer(original.id);
      expect(duplicated).not.toBeNull();
      expect(duplicated?.youtubeVideoId).toBe(original.youtubeVideoId);
      expect(duplicated?.originalUrl).toBe(original.originalUrl);
      expect(duplicated?.autoPlayOnInit).toBe(true);
      expect(duplicated?.id).not.toBe(original.id);
      expect(service.totalPlayers()).toBe(3);
    });

    it('should return null when attempting to duplicate non-existent player', () => {
      const res = service.duplicatePlayer('non-existent-id');
      expect(res).toBeNull();
      expect(service.totalPlayers()).toBe(0);
    });

    it('should leave the source player completely undisturbed when duplicating', () => {
      service.appendPlayers('https://www.youtube.com/watch?v=dQw4w9WgXcQ', 1);
      const original = service.players()[0];
      service.updatePlayerStatus(original.id, 'playing');

      service.duplicatePlayer(original.id);

      const updatedOriginal = service.players().find((p) => p.id === original.id);
      expect(updatedOriginal?.status).toBe('playing');
    });
  });
});
