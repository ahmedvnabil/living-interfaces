import { Canvas2DAsset } from "../core/Canvas2DAsset.js";
import { getMeta } from "../core/catalog.js";
import { rgba } from "../utils/color.js";
import { Noise } from "../utils/noise.js";
class SwarmIntelligence extends Canvas2DAsset {
  pts = [];
  noise;
  gx = 0;
  gy = 0;
  gv = Infinity;
  constructor() {
    super(getMeta("swarm-intelligence"));
  }
  setup() {
    this.noise = new Noise(this.rng.seed);
    this.pts = [];
    this.gv = Infinity;
    for (let i = 0; i < this.params.count; i++) this.pts.push(this.spawn());
  }
  spawn() {
    const x = this.rng.range(0, this.w), y = this.rng.range(0, this.h);
    return { x, y, vx: this.rng.range(-1, 1), vy: this.rng.range(-1, 1), bx: x, by: y, bv: Infinity };
  }
  /** Objective: valley of a drifting noise landscape (pointer overrides). */
  objective(x, y) {
    if (this.pointer.active) return Math.hypot(x - this.pointer.x, y - this.pointer.y);
    return -this.noise.fbm3(x * 4e-3, y * 4e-3, this.time * 0.06, 3);
  }
  frame(dt) {
    const n = Math.round(this.params.count);
    while (this.pts.length < n) this.pts.push(this.spawn());
    if (this.pts.length > n) this.pts.length = n;
    const { inertia, social } = this.params;
    this.gv += dt * 2;
    for (const p of this.pts) {
      const v = this.objective(p.x, p.y);
      if (v < p.bv) {
        p.bv = v;
        p.bx = p.x;
        p.by = p.y;
      }
      p.bv += dt * 1.4;
      if (v < this.gv) {
        this.gv = v;
        this.gx = p.x;
        this.gy = p.y;
      }
      p.vx = p.vx * inertia + (p.bx - p.x) * 0.012 * this.rng.next() + (this.gx - p.x) * 0.014 * social * this.rng.next();
      p.vy = p.vy * inertia + (p.by - p.y) * 0.012 * this.rng.next() + (this.gy - p.y) * 0.014 * social * this.rng.next();
      const sp = Math.hypot(p.vx, p.vy);
      if (sp > 3.4) {
        p.vx *= 3.4 / sp;
        p.vy *= 3.4 / sp;
      }
      p.x += p.vx * dt * 60;
      p.y += p.vy * dt * 60;
      p.x = Math.max(0, Math.min(this.w, p.x));
      p.y = Math.max(0, Math.min(this.h, p.y));
    }
    this.fade(0.16);
    const ctx = this.ctx;
    for (const p of this.pts) {
      ctx.fillStyle = rgba(this.theme.fg, 0.65);
      ctx.fillRect(p.x - 1, p.y - 1, 2, 2);
    }
    ctx.strokeStyle = rgba(this.theme.accent, 0.9);
    ctx.beginPath();
    ctx.moveTo(this.gx - 7, this.gy);
    ctx.lineTo(this.gx + 7, this.gy);
    ctx.moveTo(this.gx, this.gy - 7);
    ctx.lineTo(this.gx, this.gy + 7);
    ctx.stroke();
    ctx.strokeStyle = rgba(this.theme.muted, 0.5);
    ctx.strokeRect(this.gx - 10, this.gy - 10, 20, 20);
  }
}
var swarm_intelligence_default = SwarmIntelligence;
export {
  SwarmIntelligence,
  swarm_intelligence_default as default
};
