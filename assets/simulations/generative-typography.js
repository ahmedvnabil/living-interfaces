import { Canvas2DAsset } from "../core/Canvas2DAsset.js";
import { getMeta } from "../core/catalog.js";
import { rgba } from "../utils/color.js";
class GenerativeTypography extends Canvas2DAsset {
  text = "LIVING";
  pts = [];
  constructor() {
    super(getMeta("generative-typography"));
  }
  /** setData(string) retypes the specimen. */
  setData(data) {
    if (typeof data === "string" && data.length > 0) {
      this.text = data.slice(0, 16).toUpperCase();
      if (this.initialized) this.sample();
    }
  }
  setup() {
    this.sample();
  }
  onParamChange(key) {
    if (key === "density") this.sample();
  }
  sample() {
    const off = document.createElement("canvas");
    off.width = Math.max(this.w, 10);
    off.height = Math.max(this.h, 10);
    const octx = off.getContext("2d");
    const fontSize = Math.min(this.w / (this.text.length * 0.62), this.h * 0.5);
    octx.font = `700 ${fontSize}px Inter, sans-serif`;
    octx.textAlign = "center";
    octx.textBaseline = "middle";
    octx.fillStyle = "#fff";
    octx.fillText(this.text, off.width / 2, off.height / 2);
    const img = octx.getImageData(0, 0, off.width, off.height).data;
    const step = Math.max(Math.round(12 - this.params.density), 3);
    const targets = [];
    for (let y = 0; y < off.height; y += step) {
      for (let x = 0; x < off.width; x += step) {
        if (img[(y * off.width + x) * 4 + 3] > 128) targets.push([x, y]);
      }
    }
    const old = this.pts;
    this.pts = targets.map(([hx, hy], i) => {
      const prev = old[i];
      return prev ? { ...prev, hx, hy } : { x: this.rng.range(0, this.w), y: this.rng.range(0, this.h), hx, hy, vx: 0, vy: 0 };
    });
  }
  frame(dt) {
    const { scatter, return: ret } = this.params;
    this.clear();
    const ctx = this.ctx;
    for (const p of this.pts) {
      p.vx += (p.hx - p.x) * ret * dt * 60 * 0.2;
      p.vy += (p.hy - p.y) * ret * dt * 60 * 0.2;
      if (this.pointer.active) {
        const dx = p.x - this.pointer.x, dy = p.y - this.pointer.y;
        const d2 = dx * dx + dy * dy;
        const r = 40 + scatter;
        if (d2 < r * r) {
          const d = Math.sqrt(d2) || 1;
          const f = (1 - d / r) * 3;
          p.vx += dx / d * f * dt * 60;
          p.vy += dy / d * f * dt * 60;
        }
      }
      p.vx *= 0.86;
      p.vy *= 0.86;
      p.x += p.vx * dt * 60 * 0.4;
      p.y += p.vy * dt * 60 * 0.4;
      const displaced = Math.hypot(p.x - p.hx, p.y - p.hy) > 4;
      ctx.fillStyle = displaced ? rgba(this.theme.accent, 0.85) : rgba(this.theme.fg, 0.85);
      ctx.fillRect(p.x - 1, p.y - 1, 2, 2);
    }
  }
  onResize() {
    super.onResize();
    if (this.initialized && this.pts.length) this.sample();
  }
}
var generative_typography_default = GenerativeTypography;
export {
  GenerativeTypography,
  generative_typography_default as default
};
