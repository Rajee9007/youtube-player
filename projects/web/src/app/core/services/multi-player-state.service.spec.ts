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

  describe('Immediate Player Count and Validation', () => {
    // Test 1: Add valid URL increments Total Players immediately
    it('1. Add valid URL increments Total Players immediately without waiting for iframe', () => {
      expect(service.totalPlayers()).toBe(0);
      const res = service.addPlayer('https://www.youtube.com/watch?v=dQw4w9WgXcQ');

      expect(res.success).toBe(true);
      expect(res.player).toBeDefined();
      expect(res.player?.status).toBe('pending');
      expect(service.totalPlayers()).toBe(1);
    });

    // Test 2: Adding multiple valid URLs increments count correctly
    it('2. Adding multiple valid URLs increments count correctly', () => {
      service.addPlayer('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
      service.addPlayer('https://www.youtube.com/watch?v=L_LUpnjgPso');
      service.addPlayer('https://youtu.be/9bZkp7q19f0');

      expect(service.totalPlayers()).toBe(3);
      expect(service.players().length).toBe(3);
    });

    // Test 3: Duplicate URL does not increment count
    it('3. Duplicate URL does not increment count', () => {
      const first = service.addPlayer('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
      expect(first.success).toBe(true);
      expect(service.totalPlayers()).toBe(1);

      const dup = service.addPlayer('https://youtu.be/dQw4w9WgXcQ');
      expect(dup.success).toBe(false);
      expect(dup.error).toContain('already been added');
      expect(service.totalPlayers()).toBe(1);
    });

    // Test 4: Invalid URL does not increment count
    it('4. Invalid URL does not increment count', () => {
      expect(service.totalPlayers()).toBe(0);

      const emptyRes = service.addPlayer('   ');
      expect(emptyRes.success).toBe(false);
      expect(service.totalPlayers()).toBe(0);

      const invalidRes = service.addPlayer('https://invalid-domain.com/abc');
      expect(invalidRes.success).toBe(false);
      expect(service.totalPlayers()).toBe(0);
    });
  });

  describe('Open with Muted Option and Initialization', () => {
    // Test 5: Open with Muted enabled creates a muted player record
    it('5. Open with Muted enabled creates a muted player record with initialMutePreference true', () => {
      const res = service.addPlayer('https://www.youtube.com/watch?v=dQw4w9WgXcQ', true);

      expect(res.success).toBe(true);
      expect(res.player?.isMuted).toBe(true);
      expect(res.player?.initialMutePreference).toBe(true);
      expect(service.mutedPlayers()).toBe(1);
    });

    // Test 6: Open with Muted disabled creates a player with normal preference
    it('6. Open with Muted disabled creates a player with the configured normal preference (unmuted)', () => {
      const res = service.addPlayer('https://www.youtube.com/watch?v=dQw4w9WgXcQ', false);

      expect(res.success).toBe(true);
      expect(res.player?.isMuted).toBe(false);
      expect(res.player?.initialMutePreference).toBe(false);
      expect(service.mutedPlayers()).toBe(0);
    });

    // Test 7: Player initializes with the saved mute preference
    it('7. Player initializes with the saved mute preference', () => {
      // Add one muted and one unmuted
      const p1Res = service.addPlayer('https://www.youtube.com/watch?v=dQw4w9WgXcQ', true);
      const p2Res = service.addPlayer('https://www.youtube.com/watch?v=L_LUpnjgPso', false);

      const p1 = p1Res.player!;
      const p2 = p2Res.player!;

      // Simulate player initialization: pending -> loading -> ready
      service.updatePlayerStatus(p1.id, 'loading');
      service.updatePlayerStatus(p1.id, 'ready');

      service.updatePlayerStatus(p2.id, 'loading');
      service.updatePlayerStatus(p2.id, 'ready');

      const restoredP1 = service.players().find((p) => p.id === p1.id);
      const restoredP2 = service.players().find((p) => p.id === p2.id);

      expect(restoredP1?.isMuted).toBe(true);
      expect(restoredP1?.initialMutePreference).toBe(true);

      expect(restoredP2?.isMuted).toBe(false);
      expect(restoredP2?.initialMutePreference).toBe(false);

      expect(service.initializedPlayers()).toBe(2);
      expect(service.mutedPlayers()).toBe(1);
    });
  });

  describe('Player Removal and Counters', () => {
    // Test 8: Removing a player decrements count
    it('8. Removing a player decrements count immediately', () => {
      const p1 = service.addPlayer('https://www.youtube.com/watch?v=dQw4w9WgXcQ').player!;
      const p2 = service.addPlayer('https://www.youtube.com/watch?v=L_LUpnjgPso').player!;
      expect(service.totalPlayers()).toBe(2);

      service.removePlayer(p1.id);
      expect(service.totalPlayers()).toBe(1);
      expect(service.players()[0].id).toBe(p2.id);

      service.removePlayer(p2.id);
      expect(service.totalPlayers()).toBe(0);
    });

    // Test 9: Clear All resets count
    it('9. Clear All resets count to 0', () => {
      service.addPlayer('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
      service.addPlayer('https://www.youtube.com/watch?v=L_LUpnjgPso');
      expect(service.totalPlayers()).toBe(2);

      service.clearAll();
      expect(service.totalPlayers()).toBe(0);
      expect(service.players().length).toBe(0);
    });

    // Test 10: Counters remain correct when iframe initialization fails
    it('10. Counters remain correct when iframe initialization fails', () => {
      const p1 = service.addPlayer('https://www.youtube.com/watch?v=dQw4w9WgXcQ').player!;
      const p2 = service.addPlayer('https://www.youtube.com/watch?v=L_LUpnjgPso').player!;
      expect(service.totalPlayers()).toBe(2);
      expect(service.errorPlayers()).toBe(0);
      expect(service.initializedPlayers()).toBe(0);

      // p1 initializes successfully
      service.updatePlayerStatus(p1.id, 'ready');
      expect(service.initializedPlayers()).toBe(1);

      // p2 fails initialization (e.g. embedding disabled or API failure)
      service.updatePlayerStatus(p2.id, 'error', 'Embedding disabled by owner');

      expect(service.totalPlayers()).toBe(2);
      expect(service.initializedPlayers()).toBe(1);
      expect(service.errorPlayers()).toBe(1);
      expect(service.players().find((p) => p.id === p2.id)?.errorMessage).toBe(
        'Embedding disabled by owner'
      );
    });
  });

  describe('Playback Coordination and Global Controls', () => {
    it('should coordinate single active audio playback', () => {
      const p1 = service.addPlayer('https://www.youtube.com/watch?v=dQw4w9WgXcQ').player!;
      const p2 = service.addPlayer('https://www.youtube.com/watch?v=L_LUpnjgPso').player!;

      service.updatePlayerStatus(p1.id, 'playing');
      expect(service.playingPlayers()).toBe(1);

      // When p2 starts playing, p1 should pause
      service.onPlayerStartedPlaying(p2.id);
      expect(service.players().find((p) => p.id === p1.id)?.status).toBe('paused');
      expect(service.players().find((p) => p.id === p2.id)?.status).toBe('playing');
      expect(service.playingPlayers()).toBe(1);
      expect(service.pausedPlayers()).toBe(1);
    });

    it('should mute and unmute all players globally', () => {
      service.addPlayer('https://www.youtube.com/watch?v=dQw4w9WgXcQ', false);
      service.addPlayer('https://www.youtube.com/watch?v=L_LUpnjgPso', false);
      expect(service.mutedPlayers()).toBe(0);

      service.muteAll();
      expect(service.mutedPlayers()).toBe(2);

      service.unmuteAll();
      expect(service.mutedPlayers()).toBe(0);
    });
  });
});
