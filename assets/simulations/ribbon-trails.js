import { Canvas2DAsset } from "../core/Canvas2DAsset.js";
import { getMeta } from "../core/catalog.js";
import { rgba } from "../utils/color.js";
class RibbonTrails extends Canvas2DAsset {
  ribbonsArr = [];
  constructor() {
    super(getMeta("ribbon-trails"));
  }
  setup() {
    this.ribbonsArr = [];
    this.rebuild();
    this.clear();
  }
  rebuild() {
    const n = Math.round(this.params.ribbons);
    const segs = Math.round(this.params.segments);
    while (this.ribbonsArr.length < n) {
      const x = this.rng.range(0, this.w), y = this.rng.range(0, this.h);
      this.ribbonsArr.push({ pts: Array.from({ length: segs }, () => ({ x, y })), phase: this.rng.range(0, Math.PI * 2) });
    }
    if (this.ribbonsArr.length > n) this.ribbonsArr.length = n;
    for (const r of this.ribbonsArr) {
      while (r.pts.length < segs) r.pts.push({ ...r.pts[r.pts.length - 1] });
      if (r.pts.length > segs) r.pts.length = segs;
    }
  }
  frame(dt) {
    this.rebuild();
    const { stiffness } = this.params;
    this.fade(0.1);
    const ctx = this.ctx;
    this.ribbonsArr.forEach((r, ri) => {
      let hx, hy;
      if (this.pointer.active) {
        const a = ri / this.ribbonsArr.length * Math.PI * 2 + this.time;
        hx = this.pointer.x + Math.cos(a) * 16 * ri * 0.4;
        hy = this.pointer.y + Math.sin(a) * 16 * ri * 0.4;
      } else {
        const t = this.time * 0.5 + r.phase;
        hx = this.w / 2 + Math.cos(t * 1.1) * this.w * 0.32 * Math.sin(t * 0.4 + ri);
        hy = this.h / 2 + Math.sin(t * 0.9 + ri) * this.h * 0.32;
      }
      const head = r.pts[0];
      head.x += (hx - head.x) * Math.min(stiffness * 2.4 * dt * 60, 1);
      head.y += (hy - head.y) * Math.min(stiffness * 2.4 * dt * 60, 1);
      for (let i = 1; i < r.pts.length; i++) {
        const p = r.pts[i], prev = r.pts[i - 1];
        p.x += (prev.x - p.x) * Math.min(stiffness * dt * 60, 1);
        p.y += (prev.y - p.y) * Math.min(stiffness * dt * 60, 1);
      }
      const m = r.pts.length;
      for (let i = 1; i < m; i++) {
        const a = r.pts[i - 1], b = r.pts[i];
        const k = 1 - i / m;
        const isLead = ri === 0;
        ctx.strokeStyle = isLead ? rgba(this.theme.accent, k * 0.75) : rgba(this.theme.fg, k * 0.5);
        ctx.lineWidth = Math.max(k * 3.2, 0.3);
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    });
    ctx.lineWidth = 1;
  }
}
var ribbon_trails_default = RibbonTrails;
export {
  RibbonTrails,
  ribbon_trails_default as default
};
