import { TestBed } from '@angular/core/testing';
import { YouTubePlayerService } from './youtube-player.service';

describe('YouTubePlayerService', () => {
  let service: YouTubePlayerService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [YouTubePlayerService],
    });
    service = TestBed.inject(YouTubePlayerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('extractVideoId', () => {
    it('should extract 11-char ID from standard watch URL', () => {
      const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
      expect(service.extractVideoId(url)).toBe('dQw4w9WgXcQ');
    });

    it('should extract 11-char ID from short youtu.be URL', () => {
      const url = 'https://youtu.be/M7lc1UVf-VE';
      expect(service.extractVideoId(url)).toBe('M7lc1UVf-VE');
    });

    it('should extract 11-char ID from embed URL', () => {
      const url = 'https://www.youtube.com/embed/jNQXAC9IVRw';
      expect(service.extractVideoId(url)).toBe('jNQXAC9IVRw');
    });

    it('should return plain 11-character video ID directly', () => {
      expect(service.extractVideoId('fJ9rUzIMcZQ')).toBe('fJ9rUzIMcZQ');
    });

    it('should extract 11-char ID from YouTube Shorts URL', () => {
      const url = 'https://www.youtube.com/shorts/kJQP7kiw5Fk';
      expect(service.extractVideoId(url)).toBe('kJQP7kiw5Fk');
    });

    it('should extract 11-char ID from YouTube Shorts URL with query parameters', () => {
      const url = 'https://www.youtube.com/shorts/kJQP7kiw5Fk?feature=share&si=abc123';
      expect(service.extractVideoId(url)).toBe('kJQP7kiw5Fk');
    });

    it('should extract 11-char ID from YouTube Shorts URL with trailing slash', () => {
      const url = 'https://www.youtube.com/shorts/kJQP7kiw5Fk/';
      expect(service.extractVideoId(url)).toBe('kJQP7kiw5Fk');
    });

    it('should reject inputs with trailing characters beyond 11 characters', () => {
      expect(service.extractVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQextra')).toBeNull();
      expect(service.extractVideoId('https://youtu.be/M7lc1UVf-VEextra')).toBeNull();
      expect(service.extractVideoId('fJ9rUzIMcZQextra')).toBeNull();
    });

    it('should return null for invalid inputs', () => {
      expect(service.extractVideoId('')).toBeNull();
      expect(service.extractVideoId('https://google.com')).toBeNull();
      expect(service.extractVideoId('short')).toBeNull();
    });
  });

  describe('Player Instance Registry and Strongly Typed Creation', () => {
    let mockPlayer: any;

    beforeEach(() => {
      mockPlayer = {
        playVideo: vi.fn(),
        pauseVideo: vi.fn(),
        mute: vi.fn(),
        unMute: vi.fn(),
        destroy: vi.fn(),
        getVideoData: vi.fn().mockReturnValue({ title: 'Test Video', author: 'Author' }),
        getPlayerState: vi.fn().mockReturnValue(1),
      };
    });

    it('should register and retrieve strongly typed player instances', () => {
      service.registerPlayerInstance('card-1', mockPlayer);
      expect(service.getPlayerInstance('card-1')).toBe(mockPlayer);
    });

    it('should return null for unregistered instance IDs', () => {
      expect(service.getPlayerInstance('unknown-card')).toBeNull();
    });

    it('should unregister player instance and call destroy safely', () => {
      service.registerPlayerInstance('card-2', mockPlayer);
      service.unregisterPlayerInstance('card-2');
      expect(mockPlayer.destroy).toHaveBeenCalled();
      expect(service.getPlayerInstance('card-2')).toBeNull();
    });

    it('should delegate playVideo, pauseVideo, muteVideo, and unmuteVideo to instance', () => {
      service.registerPlayerInstance('card-3', mockPlayer);

      service.playVideo('card-3');
      expect(mockPlayer.playVideo).toHaveBeenCalled();

      service.pauseVideo('card-3');
      expect(mockPlayer.pauseVideo).toHaveBeenCalled();

      service.muteVideo('card-3');
      expect(mockPlayer.mute).toHaveBeenCalled();

      service.unmuteVideo('card-3');
      expect(mockPlayer.unMute).toHaveBeenCalled();
    });

    it('should call playVideo on all registered instances when playAll is invoked', () => {
      const mockPlayerA = { playVideo: vi.fn() };
      const mockPlayerB = { playVideo: vi.fn() };

      service.registerPlayerInstance('card-a', mockPlayerA as any);
      service.registerPlayerInstance('card-b', mockPlayerB as any);

      service.playAll();

      expect(mockPlayerA.playVideo).toHaveBeenCalled();
      expect(mockPlayerB.playVideo).toHaveBeenCalled();
    });

    it('should create strongly typed player instance when window.YT is ready', () => {
      const mockConstructorCalls: any[] = [];
      function MockYTPlayer(this: any, elementId: string, config: any) {
        mockConstructorCalls.push({ elementId, config });
        return mockPlayer;
      }

      (window as any).YT = {
        Player: MockYTPlayer,
      };

      const options = {
        isMadeForKids: false,
        onReady: vi.fn(),
        onStateChange: vi.fn(),
        onError: vi.fn(),
      };

      const instance = service.createPlayer('mount-1', 'dQw4w9WgXcQ', options);
      expect(instance).toBe(mockPlayer);
      expect(mockConstructorCalls.length).toBe(1);
      expect(mockConstructorCalls[0]).toEqual({
        elementId: 'mount-1',
        config: expect.objectContaining({
          videoId: 'dQw4w9WgXcQ',
          host: 'https://www.youtube.com',
        }),
      });
    });

    it('should use privacy-enhanced nocookie host when isMadeForKids is true', () => {
      const mockConstructorCalls: any[] = [];
      function MockYTPlayer(this: any, elementId: string, config: any) {
        mockConstructorCalls.push({ elementId, config });
        return mockPlayer;
      }
      (window as any).YT = { Player: MockYTPlayer };

      service.createPlayer('mount-kids', 'dQw4w9WgXcQ', { isMadeForKids: true });
      expect(mockConstructorCalls.length).toBe(1);
      expect(mockConstructorCalls[0]).toEqual({
        elementId: 'mount-kids',
        config: expect.objectContaining({
          host: 'https://www.youtube-nocookie.com',
        }),
      });
    });
  });
});
