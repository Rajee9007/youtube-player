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
    autoPlayOnInit: true,
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
      unmuteVideo: vi.fn(),
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
    fixture.componentRef.setInput('index', 0);
    fixture.detectChanges();
  });

  it('should create the card component', () => {
    expect(component).toBeTruthy();
  });

  describe('Automatic Muted Playback & onReady resolution', () => {
    it('should automatically attempt muted playback on onReady', async () => {
      await component.initializePlayer(true);
      expect(capturedOptions?.onReady).toBeDefined();

      capturedOptions.onReady!({ target: mockPlayerInstance });

      expect(ytService.registerPlayerInstance).toHaveBeenCalledWith('test-card-1', mockPlayerInstance);
      expect(mockPlayerInstance.mute).toHaveBeenCalled();
      expect(ytService.playVideo).toHaveBeenCalledWith('test-card-1');
    });

    it('should resolve player instance from event.target first when present', async () => {
      const targetInstance: YTPlayerInstance = {
        playVideo: vi.fn(),
        pauseVideo: vi.fn(),
        mute: vi.fn(),
        unMute: vi.fn(),
        destroy: vi.fn(),
      };

      await component.initializePlayer(true);
      capturedOptions.onReady!({ target: targetInstance });

      expect(ytService.registerPlayerInstance).toHaveBeenCalledWith('test-card-1', targetInstance);
      expect(targetInstance.mute).toHaveBeenCalled();
    });

    it('should fallback to this.playerInstance when event.target is missing or undefined', async () => {
      await component.initializePlayer(true);
      capturedOptions.onReady!({});

      expect(ytService.registerPlayerInstance).toHaveBeenCalledWith('test-card-1', mockPlayerInstance);
      expect(mockPlayerInstance.mute).toHaveBeenCalled();
    });

    it('should transition to blocked state if autoplay check fails', async () => {
      vi.useFakeTimers();
      const spyUpdate = vi.spyOn(stateService, 'updatePlayerStatus');
      (mockPlayerInstance as any).getPlayerState = vi.fn().mockReturnValue(2); // paused / blocked

      await component.initializePlayer(true);
      capturedOptions.onReady!({ target: mockPlayerInstance });

      // Advance timers by 3500ms
      vi.advanceTimersByTime(3600);

      expect(spyUpdate).toHaveBeenCalledWith(
        'test-card-1',
        'blocked',
        expect.stringContaining('Autoplay blocked')
      );
      vi.useRealTimers();
    });
  });

  describe('onStateChange & onError resilience with missing or malformed data', () => {
    beforeEach(async () => {
      await component.initializePlayer(true);
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

      // State 0: ended (triggers continuous loop restart)
      capturedOptions.onStateChange!({ data: 0 });
      expect(ytService.playVideo).toHaveBeenCalledWith('test-card-1');

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

  describe('UI Refinements: No Sequential Numbering & Duplicate Action', () => {
    it('should not render any sequential player number element in the DOM', () => {
      const numberEl = fixture.nativeElement.querySelector('.syl-player-number');
      expect(numberEl).toBeNull();
      expect(fixture.nativeElement.textContent).not.toContain('Player #1');
    });

    it('should render video ID badge and video title', () => {
      const idEl = fixture.nativeElement.querySelector('.syl-card-video-id');
      expect(idEl?.textContent).toContain('dQw4w9WgXcQ');

      const titleEl = fixture.nativeElement.querySelector('.syl-card-video-title');
      expect(titleEl?.textContent).toContain('Never Gonna Give You Up');
    });

    it('should emit duplicate event when duplicate button is clicked', () => {
      let emittedId: string | undefined;
      component.duplicate.subscribe((id) => {
        emittedId = id;
      });

      component.onDuplicate();
      expect(emittedId).toBe('test-card-1');
    });
  });
});
