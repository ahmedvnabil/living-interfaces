/** Color helpers — theme-token based, no hardcoded palettes in modules. */

export interface RGB { r: number; g: number; b: number }

export function hexToRgb(hex: string): RGB {
  const h = hex.replace('#', '');
  const v = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const n = parseInt(v, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

export function rgba(hex: string, alpha: number): string {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r},${g},${b},${alpha})`;
}

export function mix(hexA: string, hexB: string, t: number): string {
  const a = hexToRgb(hexA), b = hexToRgb(hexB);
  const r = Math.round(a.r + (b.r - a.r) * t);
  const g = Math.round(a.g + (b.g - a.g) * t);
  const bl = Math.round(a.b + (b.b - a.b) * t);
  return `rgb(${r},${g},${bl})`;
}

/** Scientific ramp: bg → muted → fg → accent. t in [0,1]. */
export function ramp(t: number, bg: string, fg: string, accent: string): string {
  const tt = Math.min(Math.max(t, 0), 1);
  if (tt < 0.75) return mix(bg, fg, tt / 0.75);
  return mix(fg, accent, (tt - 0.75) / 0.25);
}
