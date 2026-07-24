/** Dynamic Grid — typographic lattice responding to the pointer field. */
import { Canvas2DAsset } from '../core/Canvas2DAsset.js';
import { getMeta } from '../core/catalog.js';
import { rgba } from '../utils/color.js';

const GLYPHS = ['+', '·', '×', '—'];

export class DynamicGrid extends Canvas2DAsset {
  private drift: Array<{ ph: number; glyph: number }> = [];

  constructor() { super(getMeta('dynamic-grid')); }

  protected setup(): void {
    this.drift = [];
    for (let i = 0; i < 4000; i++) this.drift.push({ ph: this.rng.range(0, Math.PI * 2), glyph: this.rng.int(0, GLYPHS.length - 1) });
  }

  protected frame(_dt: number): void {
    const { pitch, radius, gain } = this.params;
    this.clear();
    const ctx = this.ctx;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    let idx = 0;
    // fallback focal point orbits when pointer idle
    const fx = this.pointer.active ? this.pointer.x : this.w / 2 + Math.cos(this.time * 0.4) * this.w * 0.25;
    const fy = this.pointer.active ? this.pointer.y : this.h / 2 + Math.sin(this.time * 0.3) * this.h * 0.25;
    for (let y = pitch / 2; y < this.h; y += pitch) {
      for (let x = pitch / 2; x < this.w; x += pitch) {
        const cell = this.drift[idx++ % this.drift.length];
        const d = Math.hypot(x - fx, y - fy);
        const k = Math.max(0, 1 - d / radius) * gain;
        const breathe = Math.sin(this.time * 0.8 + cell.ph) * 0.08;
        const size = 8 + k * 9;
        const alpha = Math.min(0.14 + breathe + k * 0.8, 1);
        ctx.font = `${size.toFixed(1)}px monospace`;
        ctx.fillStyle = k > 0.55 ? rgba(this.theme.accent, alpha) : rgba(this.theme.fg, Math.max(alpha, 0.05));
        ctx.fillText(GLYPHS[k > 0.4 ? 0 : cell.glyph], x, y);
      }
    }
  }
}

export default DynamicGrid;
