import { TestBed } from '@angular/core/testing';
import { MultiPlayerStateService } from './multi-player-state.service';
import { YouTubePlayerService } from './youtube-player.service';

describe('MultiPlayerStateService', () => {
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

  describe('Feature 1: Player Number Validation and Arbitrary Slot Assignment', () => {
    it('should add video to Player 5, Player 2, and Player 10 in arbitrary order and sort for display', () => {
      // 1. Add Video A -> Player 5
      const res5 = service.addPlayer('https://www.youtube.com/watch?v=dQw4w9WgXcQ', 5);
      expect(res5.success).toBe(true);
      expect(res5.player?.slotNumber).toBe(5);

      // 2. Add Video B -> Player 2
      const res2 = service.addPlayer('https://www.youtube.com/watch?v=L_LUpnjgPso', 2);
      expect(res2.success).toBe(true);
      expect(res2.player?.slotNumber).toBe(2);

      // 3. Add Video C -> Player 10
      const res10 = service.addPlayer('https://youtu.be/9bZkp7q19f0', 10);
      expect(res10.success).toBe(true);
      expect(res10.player?.slotNumber).toBe(10);

      // Expected sorted order by slot: Player 2, Player 5, Player 10
      const current = service.players();
      expect(current.length).toBe(3);
      expect(current[0].slotNumber).toBe(2);
      expect(current[1].slotNumber).toBe(5);
      expect(current[2].slotNumber).toBe(10);
      expect(service.totalPlayers()).toBe(3);
    });

    it('should reject Player Number 0', () => {
      const res = service.addPlayer('https://www.youtube.com/watch?v=dQw4w9WgXcQ', 0);
      expect(res.success).toBe(false);
      expect(res.error).toContain('at least 1');
      expect(service.totalPlayers()).toBe(0);
    });

    it('should reject negative numbers', () => {
      const res = service.addPlayer('https://www.youtube.com/watch?v=dQw4w9WgXcQ', -5);
      expect(res.success).toBe(false);
      expect(res.error).toContain('positive whole number');
      expect(service.totalPlayers()).toBe(0);
    });

    it('should reject decimals', () => {
      const res = service.addPlayer('https://www.youtube.com/watch?v=dQw4w9WgXcQ', 2.5);
      expect(res.success).toBe(false);
      expect(res.error).toContain('positive whole number');
      expect(service.totalPlayers()).toBe(0);
    });

    it('should reject empty or whitespace values', () => {
      const resEmpty = service.addPlayer('https://www.youtube.com/watch?v=dQw4w9WgXcQ', '');
      expect(resEmpty.success).toBe(false);
      expect(resEmpty.error).toContain('required');

      const resSpace = service.addPlayer('https://www.youtube.com/watch?v=dQw4w9WgXcQ', '   ');
      expect(resSpace.success).toBe(false);
      expect(resSpace.error).toContain('required');
      expect(service.totalPlayers()).toBe(0);
    });

    it('should reject invalid text or non-numeric input', () => {
      const res = service.addPlayer('https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'abc');
      expect(res.success).toBe(false);
      expect(res.error).toContain('positive whole number');
      expect(service.totalPlayers()).toBe(0);
    });

    it('should prompt confirmation when slot is occupied and preserve existing player on Cancel', () => {
      service.addPlayer('https://www.youtube.com/watch?v=dQw4w9WgXcQ', 5);
      expect(service.totalPlayers()).toBe(1);

      // Attempt to add another video in occupied slot 5 without forceReplace
      const res = service.addPlayer('https://www.youtube.com/watch?v=L_LUpnjgPso', 5, true, false);
      expect(res.success).toBe(false);
      expect(res.occupied).toBe(true);
      expect(res.error).toContain('Player 5 is already occupied');

      // Cancel preserves existing player
      expect(service.totalPlayers()).toBe(1);
      const player5 = service.getPlayerInSlot(5);
      expect(player5?.youtubeVideoId).toBe('dQw4w9WgXcQ');
    });

    it('should safely replace the existing video when confirmed without incrementing total players', () => {
      service.addPlayer('https://www.youtube.com/watch?v=dQw4w9WgXcQ', 5);
      expect(service.totalPlayers()).toBe(1);

      // Replace existing slot 5 with forceReplace: true
      const replaceRes = service.addPlayer('https://www.youtube.com/watch?v=L_LUpnjgPso', 5, false, true);
      expect(replaceRes.success).toBe(true);
      expect(replaceRes.replaced).toBe(true);
      expect(replaceRes.player?.slotNumber).toBe(5);
      expect(replaceRes.player?.youtubeVideoId).toBe('L_LUpnjgPso');

      // Total count remains 1
      expect(service.totalPlayers()).toBe(1);
      expect(service.getPlayerInSlot(5)?.youtubeVideoId).toBe('L_LUpnjgPso');
    });

    it('should verify removing Player 5 preserves other slot numbers without renumbering', () => {
      service.addPlayer('https://www.youtube.com/watch?v=dQw4w9WgXcQ', 2);
      service.addPlayer('https://www.youtube.com/watch?v=L_LUpnjgPso', 5);
      service.addPlayer('https://youtu.be/9bZkp7q19f0', 10);
      expect(service.totalPlayers()).toBe(3);

      const p5 = service.getPlayerInSlot(5)!;
      service.removePlayer(p5.id);

      expect(service.totalPlayers()).toBe(2);
      const remainingSlots = service.players().map((p) => p.slotNumber);
      expect(remainingSlots).toEqual([2, 10]); // Slots 2 and 10 remain unchanged!
    });

    it('should allow removed slot number to be reused', () => {
      service.addPlayer('https://www.youtube.com/watch?v=dQw4w9WgXcQ', 5);
      const p5 = service.getPlayerInSlot(5)!;
      service.removePlayer(p5.id);
      expect(service.isSlotOccupied(5)).toBe(false);

      // Re-add into slot 5
      const res = service.addPlayer('https://www.youtube.com/watch?v=L_LUpnjgPso', 5);
      expect(res.success).toBe(true);
      expect(res.player?.slotNumber).toBe(5);
      expect(service.totalPlayers()).toBe(1);
    });
  });

  describe('Feature 2: Open with Muted Option and Initialization', () => {
    it('should create player with isMuted: true and initialMutePreference: true when enabled', () => {
      const res = service.addPlayer('https://www.youtube.com/watch?v=dQw4w9WgXcQ', 1, true);
      expect(res.success).toBe(true);
      expect(res.player?.isMuted).toBe(true);
      expect(res.player?.initialMutePreference).toBe(true);
      expect(service.mutedPlayers()).toBe(1);
    });

    it('should create player with isMuted: false and initialMutePreference: false when disabled', () => {
      const res = service.addPlayer('https://www.youtube.com/watch?v=dQw4w9WgXcQ', 1, false);
      expect(res.success).toBe(true);
      expect(res.player?.isMuted).toBe(false);
      expect(res.player?.initialMutePreference).toBe(false);
      expect(service.mutedPlayers()).toBe(0);
    });

    it('should initialize player with saved mute preference upon status transition to ready', () => {
      const p1 = service.addPlayer('https://www.youtube.com/watch?v=dQw4w9WgXcQ', 1, true).player!;
      const p2 = service.addPlayer('https://www.youtube.com/watch?v=L_LUpnjgPso', 2, false).player!;

      service.updatePlayerStatus(p1.id, 'ready');
      service.updatePlayerStatus(p2.id, 'ready');

      expect(service.players().find((p) => p.id === p1.id)?.isMuted).toBe(true);
      expect(service.players().find((p) => p.id === p2.id)?.isMuted).toBe(false);
      expect(service.initializedPlayers()).toBe(2);
      expect(service.mutedPlayers()).toBe(1);
    });

    it('should apply new mute preference when an existing slot is replaced', () => {
      service.addPlayer('https://www.youtube.com/watch?v=dQw4w9WgXcQ', 1, true);
      expect(service.mutedPlayers()).toBe(1);

      // Replace with unmuted preference
      service.addPlayer('https://www.youtube.com/watch?v=L_LUpnjgPso', 1, false, true);
      expect(service.mutedPlayers()).toBe(0);
      expect(service.getPlayerInSlot(1)?.isMuted).toBe(false);
    });
  });

  describe('Feature 3: Counters and Immediate Updates', () => {
    it('should update Total Players immediately after adding without waiting for iframe', () => {
      expect(service.totalPlayers()).toBe(0);
      const res = service.addPlayer('https://www.youtube.com/watch?v=dQw4w9WgXcQ', 1);

      expect(res.success).toBe(true);
      expect(res.player?.status).toBe('pending');
      expect(service.totalPlayers()).toBe(1);
      expect(service.initializedPlayers()).toBe(0);
    });

    it('should prevent duplicate URLs across different slots and not increment count', () => {
      service.addPlayer('https://www.youtube.com/watch?v=dQw4w9WgXcQ', 1);
      expect(service.totalPlayers()).toBe(1);

      // Attempt to add duplicate in slot 2
      const dup = service.addPlayer('https://youtu.be/dQw4w9WgXcQ', 2);
      expect(dup.success).toBe(false);
      expect(dup.error).toContain('already assigned to Player #1');
      expect(service.totalPlayers()).toBe(1);
    });

    it('should keep counters correct when iframe initialization fails', () => {
      const p1 = service.addPlayer('https://www.youtube.com/watch?v=dQw4w9WgXcQ', 1).player!;
      const p2 = service.addPlayer('https://www.youtube.com/watch?v=L_LUpnjgPso', 2).player!;

      service.updatePlayerStatus(p1.id, 'ready');
      service.updatePlayerStatus(p2.id, 'error', 'Embedding disabled');

      expect(service.totalPlayers()).toBe(2);
      expect(service.initializedPlayers()).toBe(1);
      expect(service.errorPlayers()).toBe(1);
    });
  });

  describe('Feature 6: LocalStorage Persistence and SSR Safety', () => {
    it('should persist and restore player records with stable slot numbers after refresh', () => {
      service.addPlayer('https://www.youtube.com/watch?v=dQw4w9WgXcQ', 5, true);
      service.addPlayer('https://www.youtube.com/watch?v=L_LUpnjgPso', 2, false);

      // Reset TestBed to simulate page reload and re-instantiation
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [MultiPlayerStateService, YouTubePlayerService],
      });
      const restoredService = TestBed.inject(MultiPlayerStateService);

      expect(restoredService.totalPlayers()).toBe(2);
      const slots = restoredService.players().map((p) => p.slotNumber);
      expect(slots).toEqual([2, 5]);

      // All restored in pending state (no autoplay)
      expect(restoredService.players().every((p) => p.status === 'pending')).toBe(true);
    });

    it('should safely handle corrupted LocalStorage data without crashing', () => {
      localStorage.setItem('syl_multi_video_players', 'invalid-json{{');

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [MultiPlayerStateService, YouTubePlayerService],
      });

      expect(() => TestBed.inject(MultiPlayerStateService)).not.toThrow();
    });

    it('should migrate legacy records lacking slotNumber to sequential slots', () => {
      const legacyData = [
        { id: 'p1', youtubeVideoId: 'dQw4w9WgXcQ', isMuted: true },
        { id: 'p2', youtubeVideoId: 'L_LUpnjgPso', isMuted: false },
      ];
      localStorage.setItem('syl_multi_video_players', JSON.stringify(legacyData));

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [MultiPlayerStateService, YouTubePlayerService],
      });
      const migratedService = TestBed.inject(MultiPlayerStateService);

      expect(migratedService.totalPlayers()).toBe(2);
      expect(migratedService.players()[0].slotNumber).toBe(1);
      expect(migratedService.players()[1].slotNumber).toBe(2);
    });
  });

  describe('Playback Coordination and Global Controls Regression', () => {
    it('should coordinate single active audio playback atomically', () => {
      const p1 = service.addPlayer('https://www.youtube.com/watch?v=dQw4w9WgXcQ', 1).player!;
      const p2 = service.addPlayer('https://www.youtube.com/watch?v=L_LUpnjgPso', 2).player!;

      service.updatePlayerStatus(p1.id, 'playing');
      expect(service.playingPlayers()).toBe(1);

      // When p2 starts playing, p1 should pause atomically
      service.onPlayerStartedPlaying(p2.id);
      expect(service.players().find((p) => p.id === p1.id)?.status).toBe('paused');
      expect(service.players().find((p) => p.id === p2.id)?.status).toBe('playing');
      expect(service.playingPlayers()).toBe(1);
    });

    it('should mute and unmute all players globally', () => {
      service.addPlayer('https://www.youtube.com/watch?v=dQw4w9WgXcQ', 1, false);
      service.addPlayer('https://www.youtube.com/watch?v=L_LUpnjgPso', 2, false);

      service.muteAll();
      expect(service.mutedPlayers()).toBe(2);

      service.unmuteAll();
      expect(service.mutedPlayers()).toBe(0);
    });

    it('should clear all players and reset count', () => {
      service.addPlayer('https://www.youtube.com/watch?v=dQw4w9WgXcQ', 1);
      service.addPlayer('https://www.youtube.com/watch?v=L_LUpnjgPso', 2);
      expect(service.totalPlayers()).toBe(2);

      service.clearAll();
      expect(service.totalPlayers()).toBe(0);
      expect(service.players().length).toBe(0);
    });
  });
});
