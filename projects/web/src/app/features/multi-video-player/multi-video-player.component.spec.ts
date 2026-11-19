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

  describe('Input Normalization and Dynamic Batch Submissions', () => {
    it('should clear whitespace-only input and set error message', () => {
      component.urlInput = '    ';
      component.onAddVideo();

      expect(component.urlInput).toBe('');
      expect(component.errorMessage()).toBe('Please enter a YouTube video URL or ID.');
    });

    it('should reject invalid or zero player count', () => {
      component.urlInput = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
      component.playerCountInput = '0';

      component.onAddVideo();

      expect(component.errorMessage()).toContain('at least 1');
      expect(stateService.totalPlayers()).toBe(0);
    });

    it('should reject player count exceeding batch maximum', () => {
      component.urlInput = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
      component.playerCountInput = '501';

      component.onAddVideo();

      expect(component.errorMessage()).toContain('Maximum batch size is 500');
      expect(stateService.totalPlayers()).toBe(0);
    });

    it('should normalize valid URL and add batch of 5 players', () => {
      component.urlInput = '   https://www.youtube.com/watch?v=dQw4w9WgXcQ   ';
      component.playerCountInput = '5';

      component.onAddVideo();

      expect(component.urlInput).toBe('');
      expect(component.playerCountInput).toBe('1');
      expect(stateService.totalPlayers()).toBe(5);
      expect(stateService.players().map((p) => p.slotNumber)).toEqual([1, 2, 3, 4, 5]);
    });

    it('should append subsequent batch of 10 players without replacing existing 5 players', () => {
      // First batch: 5
      component.urlInput = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
      component.playerCountInput = '5';
      component.onAddVideo();

      // Second batch: 10
      component.urlInput = 'https://www.youtube.com/watch?v=L_LUpnjgPso';
      component.playerCountInput = '10';
      component.onAddVideo();

      expect(stateService.totalPlayers()).toBe(15);
      expect(stateService.players()[0].slotNumber).toBe(1);
      expect(stateService.players()[4].slotNumber).toBe(5);
      expect(stateService.players()[5].slotNumber).toBe(6);
      expect(stateService.players()[14].slotNumber).toBe(15);
    });

    it('should allow duplicate URLs and create independent players', () => {
      component.urlInput = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
      component.playerCountInput = '3';
      component.onAddVideo();

      component.urlInput = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
      component.playerCountInput = '3';
      component.onAddVideo();

      expect(stateService.totalPlayers()).toBe(6);
      expect(component.errorMessage()).toBeNull();
    });

    it('should delegate onDuplicatePlayer to stateService.duplicatePlayer', () => {
      const spy = vi.spyOn(stateService, 'duplicatePlayer');
      component.onDuplicatePlayer('player-123');
      expect(spy).toHaveBeenCalledWith('player-123');
    });

    it('should trigger stateService.playAll when Play All toolbar CTA is clicked', () => {
      const spy = vi.spyOn(stateService, 'playAll');
      // Add players so toolbar renders
      stateService.appendPlayers('https://www.youtube.com/watch?v=dQw4w9WgXcQ', 2);
      fixture.detectChanges();

      const buttons = fixture.nativeElement.querySelectorAll('.syl-toolbar-actions syl-button');
      const playAllBtn = Array.from(buttons).find((b: any) => b.textContent?.includes('Play All'));
      expect(playAllBtn).toBeDefined();

      stateService.playAll();
      expect(spy).toHaveBeenCalled();
    });
  });
});
