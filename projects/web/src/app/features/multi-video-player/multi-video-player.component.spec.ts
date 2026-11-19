import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MultiVideoPlayerComponent } from './multi-video-player.component';
import { MultiPlayerStateService } from '../../core/services/multi-player-state.service';
import { YouTubePlayerService } from '../../core/services/youtube-player.service';

describe('MultiVideoPlayerComponent', () => {
  let fixture: ComponentFixture<MultiVideoPlayerComponent>;
  let component: MultiVideoPlayerComponent;
  let stateService: MultiPlayerStateService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MultiVideoPlayerComponent],
      providers: [
        MultiPlayerStateService,
        YouTubePlayerService,
      ],
    }).compileComponents();

    stateService = TestBed.inject(MultiPlayerStateService);
    stateService.clearAll();

    fixture = TestBed.createComponent(MultiVideoPlayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the dashboard component', () => {
    expect(component).toBeTruthy();
  });

  describe('Input Normalization and Validation', () => {
    it('should clear whitespace-only input and set error message', () => {
      component.urlInput = '    ';
      component.onAddVideo();

      expect(component.urlInput).toBe('');
      expect(component.errorMessage()).toBe('Please enter a YouTube video URL or ID.');
    });

    it('should normalize valid URL input with trimmed string before processing', () => {
      component.urlInput = '   https://www.youtube.com/watch?v=dQw4w9WgXcQ   ';
      component.slotInput = '1';

      component.onAddVideo();

      // Upon success, urlInput should be cleared
      expect(component.urlInput).toBe('');
      expect(stateService.totalPlayers()).toBe(1);
      expect(stateService.players()[0].youtubeVideoId).toBe('dQw4w9WgXcQ');
    });

    it('should clear URL field upon successful slot addition', () => {
      component.urlInput = 'https://youtu.be/M7lc1UVf-VE';
      component.slotInput = '2';

      component.onAddVideo();

      expect(component.urlInput).toBe('');
      expect(component.errorMessage()).toBeNull();
      expect(stateService.totalPlayers()).toBe(1);
    });

    it('should preserve trimmed URL in pending replace payload when slot is occupied', () => {
      // First add slot 1
      stateService.addPlayer('https://www.youtube.com/watch?v=dQw4w9WgXcQ', 1);

      // Attempt to add another video to slot 1 with padding
      component.urlInput = '   https://youtu.be/M7lc1UVf-VE   ';
      component.slotInput = '1';

      component.onAddVideo();

      expect(component.confirmReplaceOpen()).toBe(true);
      expect((component as any).pendingReplacePayload).toEqual({
        url: 'https://youtu.be/M7lc1UVf-VE',
        slot: 1,
        muted: true,
      });

      // Confirm replace clears URL field
      component.onConfirmReplace();
      expect(component.urlInput).toBe('');
      expect(component.confirmReplaceOpen()).toBe(false);
      expect(stateService.players()[0].youtubeVideoId).toBe('M7lc1UVf-VE');
    });
  });
});
