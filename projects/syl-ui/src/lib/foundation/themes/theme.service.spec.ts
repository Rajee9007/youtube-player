import { TestBed } from '@angular/core/testing';
import { SylThemeService } from './theme.service';
import { SYL_THEME_REGISTRY } from './theme.registry';

describe('SylThemeService', () => {
  let service: SylThemeService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SylThemeService],
    });
    service = TestBed.inject(SylThemeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have 10 registered themes', () => {
    expect(service.availableThemes().length).toBe(10);
    expect(Object.keys(SYL_THEME_REGISTRY).length).toBe(10);
  });

  it('should switch theme correctly', () => {
    service.setTheme('emerald');
    expect(service.currentTheme()).toBe('emerald');
    expect(service.effectiveTheme()).toBe('emerald');
    expect(service.themeMeta().name).toBe('Emerald');
  });

  it('should resolve system mode to dark or light', () => {
    service.setTheme('system');
    service.systemIsDark.set(true);
    expect(service.effectiveTheme()).toBe('midnight');

    service.systemIsDark.set(false);
    expect(service.effectiveTheme()).toBe('pure-light');
  });
});
