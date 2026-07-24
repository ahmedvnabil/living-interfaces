import { Canvas2DAsset } from "../core/Canvas2DAsset.js";
import { getMeta } from "../core/catalog.js";
import { rgba } from "../utils/color.js";
class MagneticField extends Canvas2DAsset {
  polesArr = [];
  lastLines = [];
  constructor() {
    super(getMeta("magnetic-field"));
  }
  setup() {
    this.polesArr = [];
    const n = Math.round(this.params.poles);
    for (let i = 0; i < n; i++) {
      const cx = this.rng.range(this.w * 0.2, this.w * 0.8);
      const cy = this.rng.range(this.h * 0.25, this.h * 0.75);
      const a = this.rng.range(0, Math.PI * 2);
      const sep = this.rng.range(30, 70);
      this.polesArr.push({ x: cx + Math.cos(a) * sep, y: cy + Math.sin(a) * sep, q: 1 });
      this.polesArr.push({ x: cx - Math.cos(a) * sep, y: cy - Math.sin(a) * sep, q: -1 });
    }
  }
  onParamChange(key) {
    if (key === "poles") this.setup();
  }
  fieldAt(x, y) {
    let fx = 0, fy = 0;
    for (const p of this.polesArr) {
      const dx = x - p.x, dy = y - p.y;
      const d2 = Math.max(dx * dx + dy * dy, 100);
      const f = p.q * this.params.strength * 4e3 / d2;
      const d = Math.sqrt(d2);
      fx += dx / d * f;
      fy += dy / d * f;
    }
    if (this.pointer.active) {
      const dx = x - this.pointer.x, dy = y - this.pointer.y;
      const d2 = Math.max(dx * dx + dy * dy, 100);
      const f = 1800 / d2;
      const d = Math.sqrt(d2);
      fx += dx / d * f;
      fy += dy / d * f;
    }
    return [fx, fy];
  }
  frame(_dt) {
    this.clear();
    const ctx = this.ctx;
    const { lines } = this.params;
    this.lastLines = [];
    this.polesArr.forEach((p, i) => {
      const a = this.time * 0.08 + i;
      p.x += Math.cos(a) * 0.12;
      p.y += Math.sin(a * 1.3) * 0.12;
    });
    for (const p of this.polesArr) {
      if (p.q < 0) continue;
      for (let li = 0; li < lines; li++) {
        const a0 = li / lines * Math.PI * 2;
        let x = p.x + Math.cos(a0) * 8, y = p.y + Math.sin(a0) * 8;
        const path = [[x, y]];
        for (let s = 0; s < 260; s++) {
          const [fx, fy] = this.fieldAt(x, y);
          const m = Math.hypot(fx, fy) || 1;
          x += fx / m * 3;
          y += fy / m * 3;
          path.push([x, y]);
          if (x < -10 || x > this.w + 10 || y < -10 || y > this.h + 10) break;
          const nearNeg = this.polesArr.some((o) => o.q < 0 && Math.hypot(o.x - x, o.y - y) < 9);
          if (nearNeg) break;
        }
        this.lastLines.push(path);
        ctx.strokeStyle = rgba(this.theme.fg, 0.28);
        ctx.beginPath();
        ctx.moveTo(path[0][0], path[0][1]);
        for (const [px, py] of path) ctx.lineTo(px, py);
        ctx.stroke();
      }
    }
    for (const p of this.polesArr) {
      ctx.strokeStyle = p.q > 0 ? rgba(this.theme.accent, 0.95) : rgba(this.theme.muted, 0.9);
      ctx.beginPath();
      ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = ctx.strokeStyle;
      ctx.font = "9px monospace";
      ctx.textAlign = "center";
      ctx.fillText(p.q > 0 ? "N" : "S", p.x, p.y - 9);
    }
  }
  exportSVG() {
    const lines = this.lastLines.map((path) => {
      const d = path.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ");
      return `<path d="${d}" fill="none" stroke="${this.theme.fg}" stroke-opacity="0.3"/>`;
    }).join("\n  ");
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${this.w} ${this.h}">
  <rect width="100%" height="100%" fill="${this.theme.bg}"/>
  ${lines}
</svg>`;
  }
}
var magnetic_field_default = MagneticField;
export {
  MagneticField,
  magnetic_field_default as default
};
