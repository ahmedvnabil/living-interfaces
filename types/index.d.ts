export type ThemeName = 'dark' | 'light';

export interface ThemeTokens {
  bg: string;
  fg: string;
  muted: string;
  faint: string;
  accent: string;
  accent2: string;
}

export interface AssetOptions {
  seed?: number;
  theme?: ThemeName | ThemeTokens;
  params?: Record<string, number>;
  maxDpr?: number;
  accessibility?: boolean;
  autoPause?: boolean;
}

export interface LivingAsset {
  init(container: HTMLElement, options?: AssetOptions): void;
  destroy(): void;
  pause(): void;
  resume(): void;
  resize(): void;
  setTheme(theme: ThemeName | ThemeTokens): void;
  setData(data: unknown): void;
}

export interface LivingPreset {
  id: string;
  name: string;
  description?: string;
  asset: string;
  seed: number;
  params: Readonly<Record<string, number>>;
  theme?: ThemeName | ThemeTokens;
}

export interface LivingSetup extends AssetOptions {
  asset: string;
  preset?: string;
}

export interface ResolvedSetup extends AssetOptions {
  asset: string;
}

export interface ModuleMeta {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  tags: string[];
  renderer: 'canvas2d' | 'webgl' | 'svg' | 'worker';
  svgExport: boolean;
  params: Array<{ key: string; label: string; min: number; max: number; step: number; value: number }>;
  path: string;
}

export const CATALOG: ModuleMeta[];
export const PRESETS: readonly LivingPreset[];
export const VERSION: string;
export const ASSET_COUNT: number;
export function createAsset(id: string): Promise<LivingAsset>;
export function mount(target: string | HTMLElement, setup: LivingSetup): Promise<LivingAsset>;
export function definePreset(input: LivingPreset): LivingPreset;
export function getPreset(id: string): LivingPreset;
export function resolveSetup(input: LivingSetup): ResolvedSetup;
export function getMeta(id: string): ModuleMeta;
