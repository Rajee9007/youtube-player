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

    it('should return null for invalid inputs', () => {
      expect(service.extractVideoId('')).toBeNull();
      expect(service.extractVideoId('https://google.com')).toBeNull();
      expect(service.extractVideoId('short')).toBeNull();
    });
  });
});
