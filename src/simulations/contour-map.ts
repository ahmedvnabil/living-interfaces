/** Contour Map — marching-squares isolines over evolving fBm terrain. */
import { Canvas2DAsset } from '../core/Canvas2DAsset.js';
import { getMeta } from '../core/catalog.js';
import { rgba } from '../utils/color.js';
import { Noise } from '../utils/noise.js';

const RES = 90;

export class ContourMap extends Canvas2DAsset {
  private noise!: Noise;
  private field = new Float32Array((RES + 1) * (RES + 1));
  private lastSegs: Array<[number, number, number, number, number]> = [];

  constructor() { super(getMeta('contour-map')); }

  protected setup(): void {
    this.noise = new Noise(this.rng.seed);
  }

  protected frame(_dt: number): void {
    const { levels, scale, drift } = this.params;
    const t = this.time * drift;
    // sample field
    for (let y = 0; y <= RES; y++) {
      for (let x = 0; x <= RES; x++) {
        let v = this.noise.fbm3(x / RES * scale, y / RES * scale, t, 4) * 0.5 + 0.5;
        if (this.pointer.active) {
          const dx = x / RES - this.pointer.nx, dy = y / RES - this.pointer.ny;
          const d = Math.hypot(dx, dy);
          if (d < 0.22) v += (1 - d / 0.22) * 0.24;
        }
        this.field[y * (RES + 1) + x] = v;
      }
    }
    this.clear();
    const ctx = this.ctx;
    const cw = this.w / RES, ch = this.h / RES;
    this.lastSegs = [];
    for (let li = 0; li < levels; li++) {
      const iso = (li + 0.5) / levels;
      const index5 = li % 5 === 4; // survey-style index contour
      ctx.strokeStyle = index5 ? rgba(this.theme.fg, 0.75) : rgba(this.theme.muted, 0.45);
      ctx.lineWidth = index5 ? 1.4 : 0.7;
      ctx.beginPath();
      for (let y = 0; y < RES; y++) {
        for (let x = 0; x < RES; x++) {
          const i = y * (RES + 1) + x;
          const tl = this.field[i], tr = this.field[i + 1];
          const bl = this.field[i + RES + 1], br = this.field[i + RES + 2];
          let caseId = 0;
          if (tl > iso) caseId |= 8;
          if (tr > iso) caseId |= 4;
          if (br > iso) caseId |= 2;
          if (bl > iso) caseId |= 1;
          if (caseId === 0 || caseId === 15) continue;
          const lx = x * cw, ly = y * ch;
          const top: [number, number] = [lx + cw * frac(tl, tr, iso), ly];
          const bot: [number, number] = [lx + cw * frac(bl, br, iso), ly + ch];
          const left: [number, number] = [lx, ly + ch * frac(tl, bl, iso)];
          const right: [number, number] = [lx + cw, ly + ch * frac(tr, br, iso)];
          const segs: Array<[[number, number], [number, number]]> = [];
          switch (caseId) {
            case 1: case 14: segs.push([left, bot]); break;
            case 2: case 13: segs.push([bot, right]); break;
            case 3: case 12: segs.push([left, right]); break;
            case 4: case 11: segs.push([top, right]); break;
            case 5: segs.push([left, top], [bot, right]); break;
            case 6: case 9: segs.push([top, bot]); break;
            case 7: case 8: segs.push([left, top]); break;
            case 10: segs.push([top, right], [left, bot]); break;
          }
          for (const [a, b] of segs) {
            ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]);
            this.lastSegs.push([a[0], a[1], b[0], b[1], li]);
          }
        }
      }
      ctx.stroke();
    }
  }

  exportSVG(): string {
    const lines = this.lastSegs.map(([x1, y1, x2, y2, li]) =>
      `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${li % 5 === 4 ? this.theme.fg : this.theme.muted}" stroke-width="${li % 5 === 4 ? 1.4 : 0.7}" stroke-opacity="${li % 5 === 4 ? 0.75 : 0.45}"/>`,
    ).join('\n  ');
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${this.w} ${this.h}">\n  <rect width="100%" height="100%" fill="${this.theme.bg}"/>\n  ${lines}\n</svg>`;
  }
}

function frac(a: number, b: number, iso: number): number {
  const d = b - a;
  return Math.abs(d) < 1e-9 ? 0.5 : Math.max(0, Math.min(1, (iso - a) / d));
}

export default ContourMap;
