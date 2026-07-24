/** Voronoi Tessellation — exact half-plane clipped cells with Lloyd drift. */
import { Canvas2DAsset } from '../core/Canvas2DAsset.js';
import { getMeta } from '../core/catalog.js';
import { rgba } from '../utils/color.js';
import { Noise } from '../utils/noise.js';

interface Seed { x: number; y: number; ox: number; oy: number }
type Poly = Array<[number, number]>;

export class Voronoi extends Canvas2DAsset {
  private seedsArr: Seed[] = [];
  private noise!: Noise;
  private cells: Poly[] = [];

  constructor() { super(getMeta('voronoi')); }

  protected setup(): void {
    this.noise = new Noise(this.rng.seed);
    this.seedsArr = [];
    for (let i = 0; i < this.params.seeds; i++) {
      const x = this.rng.range(0, this.w), y = this.rng.range(0, this.h);
      this.seedsArr.push({ x, y, ox: x, oy: y });
    }
  }

  protected onParamChange(key: string): void {
    if (key === 'seeds') this.setup();
  }

  /** Clip the bounding box by bisector half-planes against every other seed. */
  private cell(i: number): Poly {
    const s = this.seedsArr[i];
    let poly: Poly = [[0, 0], [this.w, 0], [this.w, this.h], [0, this.h]];
    for (let j = 0; j < this.seedsArr.length; j++) {
      if (j === i || poly.length === 0) continue;
      const o = this.seedsArr[j];
      const mx = (s.x + o.x) / 2, my = (s.y + o.y) / 2;
      const nxv = o.x - s.x, nyv = o.y - s.y; // keep side where dot < 0
      const out: Poly = [];
      for (let k = 0; k < poly.length; k++) {
        const a = poly[k], b = poly[(k + 1) % poly.length];
        const da = (a[0] - mx) * nxv + (a[1] - my) * nyv;
        const db = (b[0] - mx) * nxv + (b[1] - my) * nyv;
        if (da <= 0) out.push(a);
        if ((da < 0 && db > 0) || (da > 0 && db < 0)) {
          const t = da / (da - db);
          out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]);
        }
      }
      poly = out;
    }
    return poly;
  }

  protected frame(dt: number): void {
    const { jitter, relax } = this.params;
    for (let i = 0; i < this.seedsArr.length; i++) {
      const s = this.seedsArr[i];
      s.x = s.ox + this.noise.noise3(i * 3.1, 0, this.time * 0.2) * 40 * jitter;
      s.y = s.oy + this.noise.noise3(0, i * 5.7, this.time * 0.2) * 40 * jitter;
      if (this.pointer.active) {
        const dx = s.x - this.pointer.x, dy = s.y - this.pointer.y;
        const d = Math.hypot(dx, dy);
        if (d < 110 && d > 1) { s.x += (dx / d) * (1 - d / 110) * 30; s.y += (dy / d) * (1 - d / 110) * 30; }
      }
    }
    this.cells = this.seedsArr.map((_, i) => this.cell(i));
    // Lloyd relaxation drifts rest positions toward centroids
    if (relax > 0) {
      this.cells.forEach((poly, i) => {
        if (poly.length < 3) return;
        let cx = 0, cy = 0;
        for (const p of poly) { cx += p[0]; cy += p[1]; }
        cx /= poly.length; cy /= poly.length;
        this.seedsArr[i].ox += (cx - this.seedsArr[i].ox) * relax * dt;
        this.seedsArr[i].oy += (cy - this.seedsArr[i].oy) * relax * dt;
      });
    }
    this.clear();
    const ctx = this.ctx;
    ctx.lineJoin = 'round';
    this.cells.forEach((poly, i) => {
      if (poly.length < 3) return;
      const s = this.seedsArr[i];
      const near = this.pointer.active ? Math.hypot(s.x - this.pointer.x, s.y - this.pointer.y) < 80 : false;
      ctx.beginPath();
      ctx.moveTo(poly[0][0], poly[0][1]);
      for (let k = 1; k < poly.length; k++) ctx.lineTo(poly[k][0], poly[k][1]);
      ctx.closePath();
      if (near) { ctx.fillStyle = rgba(this.theme.accent, 0.08); ctx.fill(); }
      ctx.strokeStyle = rgba(this.theme.fg, 0.35);
      ctx.stroke();
      ctx.fillStyle = near ? rgba(this.theme.accent, 0.95) : rgba(this.theme.muted, 0.8);
      ctx.fillRect(s.x - 1.5, s.y - 1.5, 3, 3);
    });
  }

  exportSVG(): string {
    const cells = this.cells.map((poly, i) => {
      const pts = poly.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
      const s = this.seedsArr[i];
      return `<polygon points="${pts}" fill="none" stroke="${this.theme.fg}" stroke-opacity="0.4"/>` +
        `<rect x="${(s.x - 1.5).toFixed(1)}" y="${(s.y - 1.5).toFixed(1)}" width="3" height="3" fill="${this.theme.muted}"/>`;
    }).join('\n  ');
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${this.w} ${this.h}">\n  <rect width="100%" height="100%" fill="${this.theme.bg}"/>\n  ${cells}\n</svg>`;
  }
}

export default Voronoi;
