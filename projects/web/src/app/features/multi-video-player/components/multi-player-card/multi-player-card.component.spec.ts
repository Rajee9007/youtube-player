import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MultiPlayerCardComponent } from './multi-player-card.component';
import { MultiPlayerItem, MultiPlayerStateService } from '../../../../core/services/multi-player-state.service';
import { YouTubePlayerService, YTPlayerInstance, YTPlayerOptions } from '../../../../core/services/youtube-player.service';

describe('MultiPlayerCardComponent', () => {
  let fixture: ComponentFixture<MultiPlayerCardComponent>;
  let component: MultiPlayerCardComponent;
  let ytService: YouTubePlayerService;
  let stateService: MultiPlayerStateService;

  const samplePlayer: MultiPlayerItem = {
    id: 'test-card-1',
    slotNumber: 1,
    youtubeVideoId: 'dQw4w9WgXcQ',
    originalUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    title: 'Never Gonna Give You Up',
    thumbnailUrl: 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
    addedAt: new Date().toISOString(),
    status: 'pending',
    isMuted: true,
    initialMutePreference: true,
  };

  let mockPlayerInstance: YTPlayerInstance;
  let capturedOptions: YTPlayerOptions;

  beforeEach(async () => {
    mockPlayerInstance = {
      playVideo: vi.fn(),
      pauseVideo: vi.fn(),
      mute: vi.fn(),
      unMute: vi.fn(),
      destroy: vi.fn(),
      getVideoData: vi.fn().mockReturnValue({ title: 'Mock Video Title' }),
      getPlayerState: vi.fn().mockReturnValue(1),
    };

    const mockYtService = {
      loadIFrameApi: vi.fn().mockResolvedValue(undefined),
      createPlayer: vi.fn().mockImplementation((_elementId: string, _videoId: string, options: YTPlayerOptions) => {
        capturedOptions = options;
        return mockPlayerInstance;
      }),
      registerPlayerInstance: vi.fn(),
      unregisterPlayerInstance: vi.fn(),
      playVideo: vi.fn(),
      pauseVideo: vi.fn(),
      muteVideo: vi.fn(),
      unMuteVideo: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [MultiPlayerCardComponent],
      providers: [
        MultiPlayerStateService,
        { provide: YouTubePlayerService, useValue: mockYtService },
      ],
    }).compileComponents();

    ytService = TestBed.inject(YouTubePlayerService);
    stateService = TestBed.inject(MultiPlayerStateService);

    fixture = TestBed.createComponent(MultiPlayerCardComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('player', samplePlayer);
    fixture.detectChanges();
  });

  it('should create the card component', () => {
    expect(component).toBeTruthy();
  });

  describe('onReady resolution & event.target handling', () => {
    it('should resolve player instance from event.target first when present', async () => {
      const targetInstance: YTPlayerInstance = {
        playVideo: vi.fn(),
        pauseVideo: vi.fn(),
        mute: vi.fn(),
        unMute: vi.fn(),
        destroy: vi.fn(),
      };

      await component.initializePlayer();
      expect(capturedOptions?.onReady).toBeDefined();

      capturedOptions.onReady!({ target: targetInstance });

      expect(ytService.registerPlayerInstance).toHaveBeenCalledWith('test-card-1', targetInstance);
      expect(targetInstance.mute).toHaveBeenCalled();
    });

    it('should fallback to this.playerInstance when event.target is missing or undefined', async () => {
      await component.initializePlayer();
      expect(capturedOptions?.onReady).toBeDefined();

      // Trigger with missing target
      capturedOptions.onReady!({});

      expect(ytService.registerPlayerInstance).toHaveBeenCalledWith('test-card-1', mockPlayerInstance);
      expect(mockPlayerInstance.mute).toHaveBeenCalled();
    });

    it('should apply sound preference when initial mute is false', async () => {
      fixture.componentRef.setInput('player', { ...samplePlayer, isMuted: false });
      fixture.detectChanges();

      await component.initializePlayer();
      capturedOptions.onReady!({ target: mockPlayerInstance });

      expect(mockPlayerInstance.unMute).toHaveBeenCalled();
    });

    it('should trigger deferred play action on onReady when playRequestedOnReady is true', async () => {
      component.onPlay(); // Sets playRequestedOnReady = true before instance ready
      await component.initializePlayer();

      capturedOptions.onReady!({ target: mockPlayerInstance });

      expect(ytService.playVideo).toHaveBeenCalledWith('test-card-1');
    });
  });

  describe('onStateChange & onError resilience with missing or malformed data', () => {
    beforeEach(async () => {
      await component.initializePlayer();
    });

    it('should update status on valid state change events', () => {
      const spyUpdate = vi.spyOn(stateService, 'updatePlayerStatus');
      const spyCoordinate = vi.spyOn(stateService, 'onPlayerStartedPlaying');

      // State 1: playing
      capturedOptions.onStateChange!({ data: 1 });
      expect(spyCoordinate).toHaveBeenCalledWith('test-card-1');

      // State 2: paused
      capturedOptions.onStateChange!({ data: 2 });
      expect(spyUpdate).toHaveBeenCalledWith('test-card-1', 'paused');

      // State 0: ended
      capturedOptions.onStateChange!({ data: 0 });
      expect(spyUpdate).toHaveBeenCalledWith('test-card-1', 'ended');

      // State 5: cued/ready
      capturedOptions.onStateChange!({ data: 5 });
      expect(spyUpdate).toHaveBeenCalledWith('test-card-1', 'ready');
    });

    it('should safely ignore onStateChange when event.data is missing or undefined', () => {
      const spyUpdate = vi.spyOn(stateService, 'updatePlayerStatus');
      expect(() => {
        capturedOptions.onStateChange!({} as any);
      }).not.toThrow();
      expect(spyUpdate).not.toHaveBeenCalled();
    });

    it('should update player status with specific messages on error', () => {
      const spyUpdate = vi.spyOn(stateService, 'updatePlayerStatus');

      // Error 100
      capturedOptions.onError!({ data: 100 });
      expect(spyUpdate).toHaveBeenCalledWith('test-card-1', 'error', 'Video removed or private');

      // Error 101/150
      capturedOptions.onError!({ data: 150 });
      expect(spyUpdate).toHaveBeenCalledWith('test-card-1', 'error', 'Embedding disabled by owner');
    });

    it('should safely handle onError when err.data is missing or undefined', () => {
      const spyUpdate = vi.spyOn(stateService, 'updatePlayerStatus');
      expect(() => {
        capturedOptions.onError!({} as any);
      }).not.toThrow();
      expect(spyUpdate).toHaveBeenCalledWith('test-card-1', 'error', 'Unable to play video');
    });
  });
});
