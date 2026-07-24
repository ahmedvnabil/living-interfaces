/** Theme token resolution. Tokens come from CSS custom properties so the library
 *  inherits any host site's palette; named themes ship as fallbacks. */
import type { ThemeName, ThemeTokens } from '../core/types.js';

export const DARK: ThemeTokens = {
  bg: '#0a0b0c',
  fg: '#f4f5f4',
  muted: '#8a9088',
  faint: '#22262a',
  accent: '#c6ff4d',
  accent2: '#5f7a52',
};

export const LIGHT: ThemeTokens = {
  bg: '#f6f7f5',
  fg: '#111412',
  muted: '#5c635c',
  faint: '#dde1dc',
  accent: '#79a20b',
  accent2: '#a8bd8a',
};

const VARS: Record<keyof ThemeTokens, string> = {
  bg: '--la-bg',
  fg: '--la-fg',
  muted: '--la-muted',
  faint: '--la-faint',
  accent: '--la-accent',
  accent2: '--la-accent2',
};

/** Resolve tokens from CSS custom properties on `el`, falling back to `base`. */
export function resolveTokens(el: HTMLElement, base: ThemeTokens = DARK): ThemeTokens {
  const cs = getComputedStyle(el);
  const out = { ...base };
  for (const key of Object.keys(VARS) as Array<keyof ThemeTokens>) {
    const v = cs.getPropertyValue(VARS[key]).trim();
    if (v) out[key] = v;
  }
  return out;
}

export function toTokens(theme: ThemeName | ThemeTokens): ThemeTokens {
  if (theme === 'dark') return DARK;
  if (theme === 'light') return LIGHT;
  return theme;
}
