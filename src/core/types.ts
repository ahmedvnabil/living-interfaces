/** Shared contracts for every Living Asset. */

export type ThemeName = 'dark' | 'light';

export interface ThemeTokens {
  bg: string;      // canvas background
  fg: string;      // primary ink
  muted: string;   // secondary ink
  faint: string;   // hairlines, grids
  accent: string;  // lime — used sparingly
  accent2: string; // desaturated support accent
}

export interface ParamDef {
  key: string;
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
}

export type RendererTier = 'canvas2d' | 'webgl' | 'svg' | 'worker';

export interface ModuleMeta {
  id: string;
  name: string;
  subtitle: string;      // scientific taxonomy line
  description: string;   // scientific description
  tags: string[];
  renderer: RendererTier;
  svgExport: boolean;
  params: ParamDef[];
  path: string;          // module file relative to /assets
}

export interface AssetOptions {
  seed?: number;
  theme?: ThemeName | ThemeTokens;
  params?: Record<string, number>;
  /** cap device pixel ratio (default 2) */
  maxDpr?: number;
  /** honor prefers-reduced-motion (default true) */
  accessibility?: boolean;
  /** auto-pause when scrolled off screen (default true) */
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

export interface MetricsSnapshot {
  fps: number;
  frameMs: number;
  heapMB: number | null;
  gpuEstimate: 'low' | 'medium' | 'high';
  history: number[]; // recent fps samples for sparklines
}
