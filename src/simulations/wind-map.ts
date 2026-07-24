/** Wind Map — meteorological streamlines; particle age maps to opacity. */
import { Canvas2DAsset } from '../core/Canvas2DAsset.js';
import { getMeta } from '../core/catalog.js';
import { Noise } from '../utils/noise.js';
import { rgba } from '../utils/color.js';

interface S { x: number; y: number; age: number; max: number }

export class WindMap extends Canvas2DAsset {
  private noise!: Noise;
  private lines: S[] = [];

  constructor() { super(getMeta('wind-map')); }

  protected setup(): void {
    this.noise = new Noise(this.rng.seed);
    this.lines = [];
    this.clear();
  }

  private spawn(): S {
    return { x: this.rng.range(0, this.w), y: this.rng.range(0, this.h), age: 0, max: this.rng.range(1.5, 5) };
  }

  protected frame(dt: number): void {
    const n = Math.round(this.params.lines);
    while (this.lines.length < n) this.lines.push(this.spawn());
    if (this.lines.length > n) this.lines.length = n;
    this.fade(0.06);
    const { scale, speed } = this.params;
    const s = (scale * 2.4) / Math.max(this.w, this.h);
    const t = this.time * 0.04;
    const ctx = this.ctx;
    for (const p of this.lines) {
      // synoptic field: rotational noise + gentle zonal jet
      const a = this.noise.noise3(p.x * s, p.y * s, t) * Math.PI * 2;
      const jet = Math.sin((p.y / this.h) * Math.PI) * 0.7;
      const vx = (Math.cos(a) + jet) * 34 * speed;
      const vy = Math.sin(a) * 30 * speed;
      const nx = p.x + vx * dt, ny = p.y + vy * dt;
      const mag = Math.min(Math.hypot(vx, vy) / (56 * speed), 1);
      const fadeIn = Math.min(p.age / 0.4, 1) * (1 - p.age / p.max);
      ctx.strokeStyle = mag > 0.86 ? rgba(this.theme.accent, fadeIn * 0.6) : rgba(this.theme.fg, fadeIn * (0.1 + mag * 0.35));
      ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(nx, ny); ctx.stroke();
      p.x = nx; p.y = ny; p.age += dt;
      if (p.age > p.max || p.x < -4 || p.x > this.w + 4 || p.y < -4 || p.y > this.h + 4) Object.assign(p, this.spawn());
    }
  }
}

export default WindMap;
