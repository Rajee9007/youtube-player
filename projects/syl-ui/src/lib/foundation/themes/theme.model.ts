export type SylThemeId =
  | 'midnight'
  | 'pure-light'
  | 'ocean-blue'
  | 'royal-purple'
  | 'emerald'
  | 'golden-luxury'
  | 'sunset'
  | 'amoled-black'
  | 'rose-pink'
  | 'system';

export type SylEffectiveThemeId = Exclude<SylThemeId, 'system'>;

export interface SylThemeMeta {
  id: SylThemeId;
  name: string;
  description: string;
  isDark: boolean;
  accentColor: string;
  surfaceColor: string;
  bgColor: string;
  tag: string;
}

export interface SylThemeConfig {
  defaultTheme: SylThemeId;
  storageKey: string;
  attribute: string;
  allowSystem: boolean;
}
