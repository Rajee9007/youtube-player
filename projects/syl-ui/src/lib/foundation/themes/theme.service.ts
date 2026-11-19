import { Injectable, signal, computed, effect, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { SylThemeId, SylEffectiveThemeId, SylThemeMeta, SylThemeConfig } from './theme.model';
import { SYL_THEME_REGISTRY, SYL_THEMES_LIST } from './theme.registry';

const DEFAULT_CONFIG: SylThemeConfig = {
  defaultTheme: 'midnight',
  storageKey: 'syl_user_theme',
  attribute: 'data-theme',
  allowSystem: true,
};

@Injectable({
  providedIn: 'root',
})
export class SylThemeService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private mediaQueryList: MediaQueryList | null = null;

  // Selected theme preference (can be 'system')
  readonly currentTheme = signal<SylThemeId>(DEFAULT_CONFIG.defaultTheme);

  // System OS prefers dark
  readonly systemIsDark = signal<boolean>(true);

  // Effective theme applied to DOM (always resolved, never 'system')
  readonly effectiveTheme = computed<SylEffectiveThemeId>(() => {
    const theme = this.currentTheme();
    if (theme === 'system') {
      return this.systemIsDark() ? 'midnight' : 'pure-light';
    }
    return theme;
  });

  // Current theme metadata
  readonly themeMeta = computed<SylThemeMeta>(() => {
    return SYL_THEME_REGISTRY[this.currentTheme()] || SYL_THEME_REGISTRY['midnight'];
  });

  // All registered themes
  readonly availableThemes = signal<SylThemeMeta[]>(SYL_THEMES_LIST);

  constructor() {
    if (this.isBrowser) {
      this.initSystemPreferenceListener();
      this.loadSavedTheme();

      // Effect to apply the theme to the document root whenever effectiveTheme changes
      effect(() => {
        const effective = this.effectiveTheme();
        this.applyThemeToDOM(effective);
      });
    }
  }

  setTheme(themeId: SylThemeId): void {
    if (!SYL_THEME_REGISTRY[themeId]) {
      return;
    }
    this.currentTheme.set(themeId);
    if (this.isBrowser) {
      try {
        localStorage.setItem(DEFAULT_CONFIG.storageKey, themeId);
      } catch (err) {
        console.warn('Unable to persist theme to localStorage', err);
      }
    }
  }

  private loadSavedTheme(): void {
    try {
      const saved = localStorage.getItem(DEFAULT_CONFIG.storageKey) as SylThemeId | null;
      if (saved && SYL_THEME_REGISTRY[saved]) {
        this.currentTheme.set(saved);
        return;
      }
    } catch {
      // Ignore localStorage error (private browsing / disabled)
    }

    // Default
    this.currentTheme.set(DEFAULT_CONFIG.defaultTheme);
  }

  private initSystemPreferenceListener(): void {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return;
    }

    this.mediaQueryList = window.matchMedia('(prefers-color-scheme: dark)');
    this.systemIsDark.set(this.mediaQueryList.matches);

    const listener = (event: MediaQueryListEvent) => {
      this.systemIsDark.set(event.matches);
    };

    if (this.mediaQueryList.addEventListener) {
      this.mediaQueryList.addEventListener('change', listener);
    } else {
      // Fallback for older browsers
      (this.mediaQueryList as any).addListener(listener);
    }
  }

  private applyThemeToDOM(theme: SylEffectiveThemeId): void {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    root.setAttribute(DEFAULT_CONFIG.attribute, theme);

    // Apply color-scheme meta for browser controls
    const meta = SYL_THEME_REGISTRY[theme];
    root.style.colorScheme = meta?.isDark ? 'dark' : 'light';
  }
}
