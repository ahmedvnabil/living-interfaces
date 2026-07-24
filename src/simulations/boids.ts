/** Boids — Reynolds flocking over a spatial hash grid. */
import { Canvas2DAsset } from '../core/Canvas2DAsset.js';
import { getMeta } from '../core/catalog.js';
import { rgba } from '../utils/color.js';

interface B { x: number; y: number; vx: number; vy: number }
const R = 42; // neighbor radius

export class Boids extends Canvas2DAsset {
  private boids: B[] = [];

  constructor() { super(getMeta('boids')); }

  protected setup(): void {
    this.boids = [];
    for (let i = 0; i < this.params.count; i++) this.boids.push(this.spawn());
  }

  private spawn(): B {
    const a = this.rng.range(0, Math.PI * 2);
    return { x: this.rng.range(0, this.w), y: this.rng.range(0, this.h), vx: Math.cos(a), vy: Math.sin(a) };
  }

  protected frame(dt: number): void {
    const n = Math.round(this.params.count);
    while (this.boids.length < n) this.boids.push(this.spawn());
    if (this.boids.length > n) this.boids.length = n;

    const { cohesion, separation, speed } = this.params;
    // spatial hash
    const cell = R;
    const grid = new Map<number, B[]>();
    const key = (x: number, y: number) => (Math.floor(x / cell) * 7919) ^ Math.floor(y / cell);
    for (const b of this.boids) {
      const k = key(b.x, b.y);
      (grid.get(k) ?? grid.set(k, []).get(k)!).push(b);
    }
    const ptr = this.pointer;
    for (const b of this.boids) {
      let cx = 0, cy = 0, ax = 0, ay = 0, sx = 0, sy = 0, cnt = 0;
      for (let gx = -1; gx <= 1; gx++) for (let gy = -1; gy <= 1; gy++) {
        const bucket = grid.get(key(b.x + gx * cell, b.y + gy * cell));
        if (!bucket) continue;
        for (const o of bucket) {
          if (o === b) continue;
          const dx = o.x - b.x, dy = o.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 > R * R) continue;
          cnt++;
          cx += o.x; cy += o.y;
          ax += o.vx; ay += o.vy;
          if (d2 < 260) { const d = Math.sqrt(d2) || 1; sx -= dx / d; sy -= dy / d; }
        }
      }
      if (cnt > 0) {
        b.vx += ((cx / cnt - b.x) * 0.004 * cohesion + (ax / cnt - b.vx) * 0.06 + sx * 0.09 * separation) * dt * 60;
        b.vy += ((cy / cnt - b.y) * 0.004 * cohesion + (ay / cnt - b.vy) * 0.06 + sy * 0.09 * separation) * dt * 60;
      }
      if (ptr.active) {
        const dx = b.x - ptr.x, dy = b.y - ptr.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 10000) { const d = Math.sqrt(d2) || 1; b.vx += (dx / d) * 0.5 * dt * 60; b.vy += (dy / d) * 0.5 * dt * 60; }
      }
      const v = Math.hypot(b.vx, b.vy) || 1;
      const max = speed;
      if (v > max) { b.vx = (b.vx / v) * max; b.vy = (b.vy / v) * max; }
      if (v < max * 0.4) { b.vx = (b.vx / v) * max * 0.4; b.vy = (b.vy / v) * max * 0.4; }
      b.x = (b.x + b.vx * dt * 60 + this.w) % this.w;
      b.y = (b.y + b.vy * dt * 60 + this.h) % this.h;
    }
    // render as oriented darts
    this.clear();
    const ctx = this.ctx;
    ctx.strokeStyle = rgba(this.theme.fg, 0.8);
    for (const b of this.boids) {
      const a = Math.atan2(b.vy, b.vx);
      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.rotate(a);
      ctx.beginPath();
      ctx.moveTo(4, 0); ctx.lineTo(-3, 2); ctx.lineTo(-3, -2); ctx.closePath();
      ctx.stroke();
      ctx.restore();
    }
  }
}

export default Boids;
