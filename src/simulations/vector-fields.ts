/** Vector Fields — quiver lattice over a time-varying analytic field. */
import { Canvas2DAsset } from '../core/Canvas2DAsset.js';
import { getMeta } from '../core/catalog.js';
import { rgba } from '../utils/color.js';
import { Noise } from '../utils/noise.js';

export class VectorFields extends Canvas2DAsset {
  private noise!: Noise;
  private lastArrows: Array<[number, number, number, number, number]> = [];

  constructor() { super(getMeta('vector-fields')); }

  protected setup(): void {
    this.noise = new Noise(this.rng.seed);
  }

  protected frame(_dt: number): void {
    const { pitch, scale, evolve } = this.params;
    const t = this.time * evolve;
    this.clear();
    const ctx = this.ctx;
    const s = scale / Math.max(this.w, this.h);
    this.lastArrows = [];
    for (let y = pitch / 2; y < this.h; y += pitch) {
      for (let x = pitch / 2; x < this.w; x += pitch) {
        let [u, v] = this.noise.curl2(x * s * 3, y * s * 3, t);
        if (this.pointer.active) {
          const dx = x - this.pointer.x, dy = y - this.pointer.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 14400) {
            const d = Math.sqrt(d2) || 1;
            const f = (1 - d / 120) * 2.4;
            u += (-dy / d) * f; v += (dx / d) * f;
          }
        }
        const mag = Math.min(Math.hypot(u, v) * 0.55, 1);
        const a = Math.atan2(v, u);
        const len = pitch * 0.38 * (0.4 + mag * 0.6);
        const x2 = x + Math.cos(a) * len, y2 = y + Math.sin(a) * len;
        ctx.strokeStyle = mag > 0.82 ? rgba(this.theme.accent, 0.9) : rgba(this.theme.fg, 0.2 + mag * 0.5);
        ctx.lineWidth = 0.6 + mag;
        ctx.beginPath();
        ctx.moveTo(x - Math.cos(a) * len * 0.6, y - Math.sin(a) * len * 0.6);
        ctx.lineTo(x2, y2);
        // head
        ctx.moveTo(x2, y2);
        ctx.lineTo(x2 - Math.cos(a - 0.5) * 3.4, y2 - Math.sin(a - 0.5) * 3.4);
        ctx.moveTo(x2, y2);
        ctx.lineTo(x2 - Math.cos(a + 0.5) * 3.4, y2 - Math.sin(a + 0.5) * 3.4);
        ctx.stroke();
        this.lastArrows.push([x, y, a, len, mag]);
      }
    }
    ctx.lineWidth = 1;
  }

  exportSVG(): string {
    const arrows = this.lastArrows.map(([x, y, a, len, mag]) => {
      const x1 = x - Math.cos(a) * len * 0.6, y1 = y - Math.sin(a) * len * 0.6;
      const x2 = x + Math.cos(a) * len, y2 = y + Math.sin(a) * len;
      const color = mag > 0.82 ? this.theme.accent : this.theme.fg;
      return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${color}" stroke-opacity="${(0.2 + mag * 0.6).toFixed(2)}" stroke-width="${(0.6 + mag).toFixed(2)}"/>`;
    }).join('\n  ');
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${this.w} ${this.h}">\n  <rect width="100%" height="100%" fill="${this.theme.bg}"/>\n  ${arrows}\n</svg>`;
  }
}

export default VectorFields;
