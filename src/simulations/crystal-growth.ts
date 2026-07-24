/** Crystal Growth — diffusion-limited aggregation with optional symmetry. */
import { Canvas2DAsset } from '../core/Canvas2DAsset.js';
import { getMeta } from '../core/catalog.js';
import { rgba } from '../utils/color.js';

const GRID = 240;

export class CrystalGrowth extends Canvas2DAsset {
  private frozen!: Uint8Array;         // 0 empty, 1..255 age bucket
  private walkers: Array<{ x: number; y: number }> = [];
  private radius = 4;
  private ageCounter = 1;
  private restTimer = 0;

  constructor() { super(getMeta('crystal-growth')); }

  protected setup(): void {
    this.frozen = new Uint8Array(GRID * GRID);
    const c = GRID / 2;
    this.frozen[c * GRID + c] = 1;
    this.walkers = [];
    this.radius = 6;
    this.ageCounter = 1;
    this.restTimer = 0;
    this.clear();
  }

  private spawnWalker(): { x: number; y: number } {
    const a = this.rng.range(0, Math.PI * 2);
    const r = Math.min(this.radius + 10, GRID / 2 - 2);
    return { x: GRID / 2 + Math.cos(a) * r, y: GRID / 2 + Math.sin(a) * r };
  }

  protected frame(dt: number): void {
    const { walkers, stick, sym } = this.params;
    const target = Math.round(walkers);
    while (this.walkers.length < target) this.walkers.push(this.spawnWalker());
    if (this.walkers.length > target) this.walkers.length = target;

    const c = GRID / 2;
    const symN = Math.max(1, Math.round(sym));
    let frozeAny = false;
    const kill = Math.min(this.radius + 24, GRID / 2 - 1);
    // pointer bias: walkers drift toward pointer position
    const bias = this.pointer.active;
    const bx = (this.pointer.nx - 0.5) * 0.35, by = (this.pointer.ny - 0.5) * 0.35;
    for (const wk of this.walkers) {
      for (let s = 0; s < 8; s++) {
        wk.x += this.rng.range(-1, 1) + (bias ? bx : 0);
        wk.y += this.rng.range(-1, 1) + (bias ? by : 0);
        const dx = wk.x - c, dy = wk.y - c;
        const d = Math.hypot(dx, dy);
        if (d > kill) { Object.assign(wk, this.spawnWalker()); continue; }
        const xi = Math.round(wk.x), yi = Math.round(wk.y);
        if (xi < 1 || yi < 1 || xi >= GRID - 1 || yi >= GRID - 1) continue;
        // touch check
        if (this.frozen[yi * GRID + xi - 1] || this.frozen[yi * GRID + xi + 1] ||
            this.frozen[(yi - 1) * GRID + xi] || this.frozen[(yi + 1) * GRID + xi]) {
          if (this.rng.next() < stick) {
            const bucket = Math.min(1 + Math.floor(this.ageCounter / 220), 250);
            // apply n-fold symmetry
            const a0 = Math.atan2(dy, dx);
            for (let k = 0; k < symN; k++) {
              const a = a0 + (k / symN) * Math.PI * 2;
              const sx = Math.round(c + Math.cos(a) * d), sy = Math.round(c + Math.sin(a) * d);
              if (sx > 0 && sy > 0 && sx < GRID - 1 && sy < GRID - 1) this.frozen[sy * GRID + sx] = bucket;
            }
            this.ageCounter++;
            this.radius = Math.max(this.radius, d + 2);
            frozeAny = true;
            Object.assign(wk, this.spawnWalker());
            break;
          }
        }
      }
    }
    if (this.radius >= GRID / 2 - 12) {
      this.restTimer += dt;
      if (this.restTimer > 2) this.regenerate();
    }
    if (!frozeAny && this.time < 0.1) return;
    // render
    this.clear();
    const ctx = this.ctx;
    const sx = this.w / GRID, sy = this.h / GRID;
    const maxBucket = Math.min(1 + Math.floor(this.ageCounter / 220), 250);
    for (let y = 0; y < GRID; y++) {
      for (let x = 0; x < GRID; x++) {
        const v = this.frozen[y * GRID + x];
        if (!v) continue;
        const recency = v / maxBucket; // 0 old .. 1 new
        ctx.fillStyle = recency > 0.85 ? rgba(this.theme.accent, 0.9) : rgba(this.theme.fg, 0.25 + recency * 0.6);
        ctx.fillRect(x * sx, y * sy, Math.max(sx, 1), Math.max(sy, 1));
      }
    }
  }
}

export default CrystalGrowth;
