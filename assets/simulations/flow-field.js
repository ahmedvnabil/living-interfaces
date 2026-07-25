import { Canvas2DAsset } from "../core/Canvas2DAsset.js";
import { getMeta } from "../core/catalog.js";
import { Noise } from "../utils/noise.js";
import { rgba } from "../utils/color.js";
class FlowField extends Canvas2DAsset {
  noise;
  pts = [];
  constructor() {
    super(getMeta("flow-field"));
  }
  setup() {
    this.noise = new Noise(this.rng.seed);
    this.pts = [];
    this.clear();
    this.syncCount();
  }
  syncCount() {
    const n = Math.round(this.params.count);
    while (this.pts.length < n) this.pts.push(this.spawn());
    if (this.pts.length > n) this.pts.length = n;
  }
  spawn() {
    return { x: this.rng.range(0, this.w), y: this.rng.range(0, this.h), life: this.rng.range(2, 7) };
  }
  frame(dt) {
    this.syncCount();
    this.fade(0.045);
    const { scale, speed, drift } = this.params;
    const s = scale / Math.max(this.w, this.h);
    const t = this.time * drift;
    const ctx = this.ctx;
    ctx.lineWidth = 1;
    const ptr = this.pointer;
    for (const p of this.pts) {
      const [u, v] = this.noise.curl2(p.x * s * 4, p.y * s * 4, t);
      let vx = u * 40 * speed, vy = v * 40 * speed;
      if (ptr.active) {
        const dx = p.x - ptr.x, dy = p.y - ptr.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 8100) {
          const f = (1 - d2 / 8100) * 90;
          const d = Math.sqrt(d2) || 1;
          vx += dx / d * f;
          vy += dy / d * f;
        }
      }
      const nx = p.x + vx * dt * 60 * 0.016, ny = p.y + vy * dt * 60 * 0.016;
      const mag = Math.min(Math.hypot(vx, vy) / (60 * speed), 1);
      ctx.strokeStyle = mag > 0.82 ? rgba(this.theme.accent, 0.5) : rgba(this.theme.fg, 0.16 + mag * 0.3);
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(nx, ny);
      ctx.stroke();
      p.x = nx;
      p.y = ny;
      p.life -= dt;
      if (p.life <= 0 || p.x < -5 || p.x > this.w + 5 || p.y < -5 || p.y > this.h + 5) {
        Object.assign(p, this.spawn());
      }
    }
  }
}
var flow_field_default = FlowField;
export {
  FlowField,
  flow_field_default as default
};
