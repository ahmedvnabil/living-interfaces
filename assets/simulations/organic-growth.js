import { Canvas2DAsset } from "../core/Canvas2DAsset.js";
import { getMeta } from "../core/catalog.js";
import { rgba } from "../utils/color.js";
import { Noise } from "../utils/noise.js";
const MAX_PTS = 900;
class OrganicGrowth extends Canvas2DAsset {
  pts = [];
  noise;
  history = [];
  constructor() {
    super(getMeta("organic-growth"));
  }
  setup() {
    this.noise = new Noise(this.rng.seed);
    this.pts = [];
    const r = Math.min(this.w, this.h) * 0.12;
    for (let i = 0; i < 40; i++) {
      const a = i / 40 * Math.PI * 2;
      this.pts.push({ x: this.w / 2 + Math.cos(a) * r, y: this.h / 2 + Math.sin(a) * r });
    }
    this.history = [];
    this.clear();
  }
  frame(dt) {
    const { growth, repulsion, smooth } = this.params;
    const n = this.pts.length;
    if (n < MAX_PTS) {
      const out = [];
      for (let i = 0; i < n; i++) {
        const a = this.pts[i], b = this.pts[(i + 1) % n];
        out.push(a);
        const d = Math.hypot(b.x - a.x, b.y - a.y);
        if (d > 9 && this.rng.next() < growth * dt * 4) {
          out.push({ x: (a.x + b.x) / 2 + this.rng.range(-1, 1), y: (a.y + b.y) / 2 + this.rng.range(-1, 1) });
        }
      }
      this.pts = out;
    }
    const cell = repulsion * 2.2;
    const hash = /* @__PURE__ */ new Map();
    const key = (x, y) => Math.floor(x / cell) * 7919 ^ Math.floor(y / cell);
    this.pts.forEach((p, i) => {
      const k = key(p.x, p.y);
      (hash.get(k) ?? hash.set(k, []).get(k)).push(i);
    });
    const m = this.pts.length;
    const next = new Array(m);
    for (let i = 0; i < m; i++) {
      const p = this.pts[i];
      const prev = this.pts[(i - 1 + m) % m], nx = this.pts[(i + 1) % m];
      let fx = 0, fy = 0;
      fx += (prev.x + nx.x - 2 * p.x) * 0.06;
      fy += (prev.y + nx.y - 2 * p.y) * 0.06;
      fx += ((prev.x + nx.x) / 2 - p.x) * smooth * 0.2;
      fy += ((prev.y + nx.y) / 2 - p.y) * smooth * 0.2;
      for (let gx = -1; gx <= 1; gx++) for (let gy = -1; gy <= 1; gy++) {
        const bucket = hash.get(key(p.x + gx * cell, p.y + gy * cell));
        if (!bucket) continue;
        for (const j of bucket) {
          const diff = Math.abs(i - j);
          if (diff < 2 || diff > m - 2) continue;
          const o = this.pts[j];
          const dx = p.x - o.x, dy = p.y - o.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < repulsion * repulsion && d2 > 0.01) {
            const d = Math.sqrt(d2);
            const f = (1 - d / repulsion) * 0.55;
            fx += dx / d * f;
            fy += dy / d * f;
          }
        }
      }
      if (this.pointer.active) {
        const dx = p.x - this.pointer.x, dy = p.y - this.pointer.y;
        const d = Math.hypot(dx, dy);
        if (d < 80 && d > 1) {
          fx += dx / d * (1 - d / 80) * 2.2;
          fy += dy / d * (1 - d / 80) * 2.2;
        }
      }
      next[i] = { x: p.x + fx * dt * 60 * 0.5, y: p.y + fy * dt * 60 * 0.5 };
    }
    this.pts = next;
    if (Math.floor(this.time * 3) !== Math.floor((this.time - dt) * 3)) {
      this.history.push(this.pts.map((p) => ({ ...p })));
      if (this.history.length > 14) this.history.shift();
    }
    this.clear();
    const ctx = this.ctx;
    this.history.forEach((h, hi) => {
      ctx.strokeStyle = rgba(this.theme.muted, 0.05 + hi / this.history.length * 0.1);
      this.trace(ctx, h);
    });
    ctx.strokeStyle = rgba(this.theme.fg, 0.9);
    this.trace(ctx, this.pts);
  }
  trace(ctx, pts) {
    if (pts.length < 3) return;
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
    ctx.closePath();
    ctx.stroke();
  }
  exportSVG() {
    const d = this.pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ") + " Z";
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${this.w} ${this.h}">
  <rect width="100%" height="100%" fill="${this.theme.bg}"/>
  <path d="${d}" fill="none" stroke="${this.theme.fg}" stroke-width="1"/>
</svg>`;
  }
}
var organic_growth_default = OrganicGrowth;
export {
  OrganicGrowth,
  organic_growth_default as default
};
