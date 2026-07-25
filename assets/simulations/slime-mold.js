import { Canvas2DAsset } from "../core/Canvas2DAsset.js";
import { getMeta } from "../core/catalog.js";
import { rgba } from "../utils/color.js";
import { Noise } from "../utils/noise.js";
class SlimeMold extends Canvas2DAsset {
  foods = [];
  agents = [];
  noise;
  constructor() {
    super(getMeta("slime-mold"));
  }
  setup() {
    this.noise = new Noise(this.rng.seed);
    this.foods = [];
    const n = Math.round(this.params.foods);
    for (let i = 0; i < n; i++) {
      const a = i / n * Math.PI * 2 + this.rng.range(-0.4, 0.4);
      const r = this.rng.range(0.24, 0.44);
      this.foods.push({ x: this.w / 2 + Math.cos(a) * this.w * r, y: this.h / 2 + Math.sin(a) * this.h * r });
    }
    this.agents = [];
    this.clear();
    this.syncAgents();
  }
  syncAgents() {
    const n = Math.round(this.params.agents);
    while (this.agents.length < n) {
      const from = this.rng.int(0, this.foods.length - 1);
      const f = this.foods[from];
      this.agents.push({ x: f.x, y: f.y, a: this.rng.range(0, Math.PI * 2), target: this.pickTarget(from) });
    }
    if (this.agents.length > n) this.agents.length = n;
  }
  pickTarget(exclude) {
    let t = this.rng.int(0, this.foods.length - 1);
    if (t === exclude) t = (t + 1) % this.foods.length;
    return t;
  }
  onParamChange(key) {
    if (key === "foods") this.setup();
  }
  frame(dt) {
    this.syncAgents();
    this.fade(1 - this.params.decay);
    const { sense } = this.params;
    const ctx = this.ctx;
    const ptr = this.pointer;
    for (const ag of this.agents) {
      const f = this.foods[ag.target];
      const want = Math.atan2(f.y - ag.y, f.x - ag.x);
      let diff = want - ag.a;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      ag.a += diff * 0.06 + this.noise.noise3(ag.x * 0.012, ag.y * 0.012, this.time * 0.3) * sense;
      if (ptr.active) {
        const dx = ag.x - ptr.x, dy = ag.y - ptr.y;
        const d = Math.hypot(dx, dy);
        if (d < 60 && d > 1) ag.a += (dx * Math.sin(ag.a) - dy * Math.cos(ag.a) > 0 ? 1 : -1) * (1 - d / 60) * 0.3;
      }
      const px = ag.x, py = ag.y;
      ag.x += Math.cos(ag.a) * 60 * dt;
      ag.y += Math.sin(ag.a) * 60 * dt;
      ctx.strokeStyle = rgba(this.theme.fg, 0.07);
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(ag.x, ag.y);
      ctx.stroke();
      if (Math.hypot(f.x - ag.x, f.y - ag.y) < 6) {
        const from = ag.target;
        ag.target = this.pickTarget(from);
      }
    }
    for (const f of this.foods) {
      ctx.fillStyle = rgba(this.theme.accent, 0.9);
      ctx.fillRect(f.x - 2, f.y - 2, 4, 4);
      ctx.strokeStyle = rgba(this.theme.muted, 0.6);
      ctx.strokeRect(f.x - 5.5, f.y - 5.5, 11, 11);
    }
  }
}
var slime_mold_default = SlimeMold;
export {
  SlimeMold,
  slime_mold_default as default
};
