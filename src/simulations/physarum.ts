/** Physarum — sense / rotate / deposit / diffuse / decay on a trail lattice. */
import { Canvas2DAsset } from '../core/Canvas2DAsset.js';
import { getMeta } from '../core/catalog.js';
import { hexToRgb } from '../utils/color.js';

const GRID = 220;

interface A { x: number; y: number; a: number }

export class Physarum extends Canvas2DAsset {
  private trail = new Float32Array(GRID * GRID);
  private next = new Float32Array(GRID * GRID);
  private agents: A[] = [];
  private off!: HTMLCanvasElement;
  private offCtx!: CanvasRenderingContext2D;
  private img!: ImageData;

  constructor() { super(getMeta('physarum')); }

  protected setup(): void {
    this.trail.fill(0);
    this.agents = [];
    const n = Math.round(this.params.agents);
    for (let i = 0; i < n; i++) {
      const r = this.rng.range(0, GRID * 0.28);
      const t = this.rng.range(0, Math.PI * 2);
      this.agents.push({ x: GRID / 2 + Math.cos(t) * r, y: GRID / 2 + Math.sin(t) * r, a: this.rng.range(0, Math.PI * 2) });
    }
    this.off = document.createElement('canvas');
    this.off.width = GRID; this.off.height = GRID;
    this.offCtx = this.off.getContext('2d')!;
    this.img = this.offCtx.createImageData(GRID, GRID);
  }

  private sense(x: number, y: number): number {
    const xi = ((Math.round(x) % GRID) + GRID) % GRID;
    const yi = ((Math.round(y) % GRID) + GRID) % GRID;
    return this.trail[yi * GRID + xi];
  }

  protected frame(_dt: number): void {
    const { turn, sensorDist, decay } = this.params;
    const nAgents = Math.round(this.params.agents);
    while (this.agents.length < nAgents) this.agents.push({ x: this.rng.range(0, GRID), y: this.rng.range(0, GRID), a: this.rng.range(0, Math.PI * 2) });
    if (this.agents.length > nAgents) this.agents.length = nAgents;

    const ptr = this.pointer;
    const px = ptr.nx * GRID, py = ptr.ny * GRID;
    for (const ag of this.agents) {
      const sa = 0.45;
      const f = this.sense(ag.x + Math.cos(ag.a) * sensorDist, ag.y + Math.sin(ag.a) * sensorDist);
      const l = this.sense(ag.x + Math.cos(ag.a - sa) * sensorDist, ag.y + Math.sin(ag.a - sa) * sensorDist);
      const r = this.sense(ag.x + Math.cos(ag.a + sa) * sensorDist, ag.y + Math.sin(ag.a + sa) * sensorDist);
      if (f < l && f < r) ag.a += (this.rng.next() < 0.5 ? -1 : 1) * turn;
      else if (l > r) ag.a -= turn;
      else if (r > l) ag.a += turn;
      if (ptr.active) {
        const dx = px - ag.x, dy = py - ag.y;
        const d = Math.hypot(dx, dy);
        if (d < 55 && d > 1) {
          const target = Math.atan2(dy, dx);
          let diff = target - ag.a;
          while (diff > Math.PI) diff -= Math.PI * 2;
          while (diff < -Math.PI) diff += Math.PI * 2;
          ag.a += diff * 0.08;
        }
      }
      ag.x = (ag.x + Math.cos(ag.a) * 1.1 + GRID) % GRID;
      ag.y = (ag.y + Math.sin(ag.a) * 1.1 + GRID) % GRID;
      const idx = (Math.floor(ag.y) * GRID + Math.floor(ag.x));
      this.trail[idx] = Math.min(this.trail[idx] + 0.35, 2);
    }
    // diffuse (3x3 mean) + decay
    const t = this.trail, nx = this.next;
    for (let y = 0; y < GRID; y++) {
      const ym = ((y - 1 + GRID) % GRID) * GRID, y0 = y * GRID, yp = ((y + 1) % GRID) * GRID;
      for (let x = 0; x < GRID; x++) {
        const xm = (x - 1 + GRID) % GRID, xp = (x + 1) % GRID;
        const sum = t[ym + xm] + t[ym + x] + t[ym + xp] + t[y0 + xm] + t[y0 + x] + t[y0 + xp] + t[yp + xm] + t[yp + x] + t[yp + xp];
        nx[y0 + x] = (sum / 9) * decay;
      }
    }
    this.trail.set(nx);
    // render lattice → offscreen → upscale
    const bg = hexToRgb(this.theme.bg), fg = hexToRgb(this.theme.fg), ac = hexToRgb(this.theme.accent);
    const d = this.img.data;
    for (let i = 0; i < GRID * GRID; i++) {
      const v = Math.min(this.trail[i], 1);
      const hot = v > 0.75 ? (v - 0.75) / 0.25 : 0;
      const base = Math.min(v / 0.75, 1);
      d[i * 4] = bg.r + (fg.r - bg.r) * base + (ac.r - fg.r) * hot * 0.7;
      d[i * 4 + 1] = bg.g + (fg.g - bg.g) * base + (ac.g - fg.g) * hot * 0.7;
      d[i * 4 + 2] = bg.b + (fg.b - bg.b) * base + (ac.b - fg.b) * hot * 0.7;
      d[i * 4 + 3] = 255;
    }
    this.offCtx.putImageData(this.img, 0, 0);
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.drawImage(this.off, 0, 0, this.w, this.h);
  }
}

export default Physarum;
