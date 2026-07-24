/** Root Growth — gravitropic branching apices with nutrient-seeking curvature. */
import { Canvas2DAsset } from '../core/Canvas2DAsset.js';
import { getMeta } from '../core/catalog.js';
import { rgba } from '../utils/color.js';
import { Noise } from '../utils/noise.js';

interface Tip { x: number; y: number; a: number; depth: number; alive: boolean }
interface Seg { x1: number; y1: number; x2: number; y2: number; depth: number }

export class RootGrowth extends Canvas2DAsset {
  private tips: Tip[] = [];
  private segs: Seg[] = [];
  private allSegs: Seg[] = [];
  private noise!: Noise;
  private restTimer = 0;

  constructor() { super(getMeta('root-growth')); }

  protected setup(): void {
    this.noise = new Noise(this.rng.seed);
    this.tips = [];
    this.segs = [];
    this.allSegs = [];
    const n = Math.round(this.params.tips);
    for (let i = 0; i < n; i++) {
      this.tips.push({ x: this.w * ((i + 0.5) / n) + this.rng.range(-20, 20), y: 4, a: Math.PI / 2, depth: 0, alive: true });
    }
    this.restTimer = 0;
    this.clear();
  }

  protected onParamChange(key: string): void {
    if (key === 'tips') this.setup();
  }

  protected frame(dt: number): void {
    const { branch, wander } = this.params;
    let anyAlive = false;
    const speed = 55 * dt;
    for (let i = this.tips.length - 1; i >= 0; i--) {
      const t = this.tips[i];
      if (!t.alive) continue;
      anyAlive = true;
      // gravitropism pulls angle toward down (π/2), noise wanders it
      const grav = (Math.PI / 2 - t.a) * 0.05;
      const wob = this.noise.noise3(t.x * 0.02, t.y * 0.02, i) * wander * 0.5;
      let steer = grav + wob;
      // pointer acts as nutrient source
      if (this.pointer.active) {
        const dx = this.pointer.x - t.x, dy = this.pointer.y - t.y;
        const d = Math.hypot(dx, dy);
        if (d < 140 && d > 1) {
          const want = Math.atan2(dy, dx);
          let diff = want - t.a;
          while (diff > Math.PI) diff -= Math.PI * 2;
          while (diff < -Math.PI) diff += Math.PI * 2;
          steer += diff * 0.08 * (1 - d / 140);
        }
      }
      t.a += steer;
      const nx = t.x + Math.cos(t.a) * speed;
      const ny = t.y + Math.sin(t.a) * speed;
      this.segs.push({ x1: t.x, y1: t.y, x2: nx, y2: ny, depth: t.depth });
      t.x = nx; t.y = ny;
      if (t.y > this.h - 2 || t.x < -10 || t.x > this.w + 10 || this.segs.length > 5000) t.alive = false;
      if (this.rng.next() < branch && this.tips.length < 120) {
        this.tips.push({ x: t.x, y: t.y, a: t.a + this.rng.range(0.35, 0.9) * this.rng.sign(), depth: t.depth + 1, alive: true });
      }
    }
    if (!anyAlive) {
      this.restTimer += dt;
      if (this.restTimer > 2.5) this.regenerate();
    }
    // incremental draw: draw only fresh segments over persistent canvas
    const ctx = this.ctx;
    const recent = this.segs.splice(0, this.segs.length); // draw + flush queue
    if (this.allSegs.length < 12000) this.allSegs.push(...recent);
    for (const s of recent) {
      const wgt = Math.max(2.2 - s.depth * 0.35, 0.4);
      ctx.strokeStyle = s.depth === 0 ? rgba(this.theme.fg, 0.85) : rgba(this.theme.muted, Math.max(0.7 - s.depth * 0.1, 0.25));
      ctx.lineWidth = wgt;
      ctx.beginPath(); ctx.moveTo(s.x1, s.y1); ctx.lineTo(s.x2, s.y2); ctx.stroke();
      // apex marker
      ctx.fillStyle = rgba(this.theme.accent, 0.5);
      ctx.fillRect(s.x2 - 0.7, s.y2 - 0.7, 1.4, 1.4);
    }
    ctx.lineWidth = 1;
  }

  exportSVG(): string {
    const lines = this.allSegs.map((s) =>
      `<line x1="${s.x1.toFixed(1)}" y1="${s.y1.toFixed(1)}" x2="${s.x2.toFixed(1)}" y2="${s.y2.toFixed(1)}" stroke="${s.depth === 0 ? this.theme.fg : this.theme.muted}" stroke-width="${Math.max(2.2 - s.depth * 0.35, 0.4).toFixed(2)}" stroke-opacity="${Math.max(0.85 - s.depth * 0.1, 0.25).toFixed(2)}"/>`,
    ).join('\n  ');
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${this.w} ${this.h}">\n  <rect width="100%" height="100%" fill="${this.theme.bg}"/>\n  ${lines}\n</svg>`;
  }
}

export default RootGrowth;
