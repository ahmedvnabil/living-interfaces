import { Canvas2DAsset } from "../core/Canvas2DAsset.js";
import { getMeta } from "../core/catalog.js";
import { rgba } from "../utils/color.js";
class ParticleSystem extends Canvas2DAsset {
  pts = [];
  acc = 0;
  constructor() {
    super(getMeta("particle-system"));
  }
  setup() {
    this.pts = [];
    this.acc = 0;
    this.clear();
  }
  frame(dt) {
    const { rate, gravity, drag, life } = this.params;
    this.acc += rate * dt;
    const ex = this.w / 2, ey = this.h * 0.35;
    while (this.acc >= 1 && this.pts.length < 4e3) {
      this.acc -= 1;
      const a = this.rng.range(0, Math.PI * 2);
      const sp = this.rng.range(8, 46);
      this.pts.push({ x: ex, y: ey, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, age: 0, life: this.rng.range(life * 0.6, life * 1.3), r: this.rng.range(0.6, 1.8) });
    }
    this.clear();
    const ctx = this.ctx;
    const ptr = this.pointer;
    for (let i = this.pts.length - 1; i >= 0; i--) {
      const p = this.pts[i];
      p.vy += gravity * 60 * dt * 9;
      if (ptr.active) {
        const dx = ptr.x - p.x, dy = ptr.y - p.y;
        const d2 = Math.max(dx * dx + dy * dy, 400);
        const f = 26e3 / d2;
        const d = Math.sqrt(d2);
        p.vx += dx / d * f * dt * 8;
        p.vy += dy / d * f * dt * 8;
      }
      p.vx *= drag;
      p.vy *= drag;
      p.x += p.vx * dt * 4;
      p.y += p.vy * dt * 4;
      p.age += dt;
      if (p.age > p.life) {
        this.pts.splice(i, 1);
        continue;
      }
      const k = 1 - p.age / p.life;
      const accent = p.r > 1.55;
      ctx.fillStyle = accent ? rgba(this.theme.accent, k * 0.85) : rgba(this.theme.fg, k * 0.6);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * (0.5 + k * 0.5), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.strokeStyle = rgba(this.theme.muted, 0.5);
    ctx.strokeRect(ex - 3.5, ey - 3.5, 7, 7);
  }
}
var particle_system_default = ParticleSystem;
export {
  ParticleSystem,
  particle_system_default as default
};
