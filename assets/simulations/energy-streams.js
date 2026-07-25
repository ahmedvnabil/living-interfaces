import { Canvas2DAsset } from "../core/Canvas2DAsset.js";
import { getMeta } from "../core/catalog.js";
import { rgba } from "../utils/color.js";
class EnergyStreams extends Canvas2DAsset {
  conduitsArr = [];
  quanta = [];
  constructor() {
    super(getMeta("energy-streams"));
  }
  setup() {
    const n = Math.round(this.params.conduits);
    this.conduitsArr = [];
    for (let i = 0; i < n; i++) {
      const y1 = this.h * ((i + 0.5) / n) + this.rng.range(-10, 10);
      const y2 = this.h * ((this.rng.int(0, n - 1) + 0.5) / n) + this.rng.range(-10, 10);
      const x1 = this.w * 0.08, x2 = this.w * 0.92;
      this.conduitsArr.push({
        x1,
        y1,
        x2,
        y2,
        cx: this.w * this.rng.range(0.35, 0.65),
        cy: (y1 + y2) / 2 + this.rng.range(-this.h * 0.25, this.h * 0.25),
        load: this.rng.range(0.4, 1)
      });
    }
    this.quanta = [];
    const per = Math.round(this.params.quanta);
    this.conduitsArr.forEach((_, ci) => {
      for (let q = 0; q < per; q++) {
        this.quanta.push({ conduit: ci, t: this.rng.next(), speed: this.rng.range(0.7, 1.3) });
      }
    });
  }
  onParamChange(key) {
    if (key !== "speed") this.setup();
  }
  bez(c, t) {
    const u = 1 - t;
    return [
      u * u * c.x1 + 2 * u * t * c.cx + t * t * c.x2,
      u * u * c.y1 + 2 * u * t * c.cy + t * t * c.y2
    ];
  }
  frame(dt) {
    const { speed } = this.params;
    this.clear();
    const ctx = this.ctx;
    for (const c of this.conduitsArr) {
      if (this.pointer.active) {
        const d = Math.hypot(c.cx - this.pointer.x, c.cy - this.pointer.y);
        if (d < 150) {
          c.cx += (this.pointer.x - c.cx) * 0.04;
          c.cy += (this.pointer.y - c.cy) * 0.04;
        }
      }
      ctx.strokeStyle = rgba(this.theme.faint, 1);
      ctx.beginPath();
      ctx.moveTo(c.x1, c.y1);
      ctx.quadraticCurveTo(c.cx, c.cy, c.x2, c.y2);
      ctx.stroke();
      ctx.strokeStyle = rgba(this.theme.muted, 0.8);
      ctx.strokeRect(c.x1 - 4, c.y1 - 4, 8, 8);
      ctx.strokeRect(c.x2 - 4, c.y2 - 4, 8, 8);
    }
    for (const q of this.quanta) {
      const c = this.conduitsArr[q.conduit];
      if (!c) continue;
      q.t += dt * 0.22 * speed * q.speed * c.load;
      if (q.t > 1) q.t -= 1;
      const [x, y] = this.bez(c, q.t);
      const [px, py] = this.bez(c, Math.max(q.t - 0.018, 0));
      const congested = c.load > 0.85;
      ctx.strokeStyle = congested ? rgba(this.theme.accent, 0.9) : rgba(this.theme.fg, 0.7);
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(x, y);
      ctx.stroke();
    }
    ctx.lineWidth = 1;
  }
}
var energy_streams_default = EnergyStreams;
export {
  EnergyStreams,
  energy_streams_default as default
};
