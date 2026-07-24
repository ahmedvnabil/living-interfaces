import { Canvas2DAsset } from "../core/Canvas2DAsset.js";
import { getMeta } from "../core/catalog.js";
import { hexToRgb } from "../utils/color.js";
const RES = 160;
class DistanceFields extends Canvas2DAsset {
  shapes = [];
  off;
  offCtx;
  img;
  constructor() {
    super(getMeta("distance-fields"));
  }
  setup() {
    this.shapes = [];
    for (let i = 0; i < this.params.shapes; i++) {
      this.shapes.push({
        kind: this.rng.int(0, 1),
        ox: this.rng.range(0.25, 0.75),
        oy: this.rng.range(0.25, 0.75),
        r: this.rng.range(0.06, 0.16),
        ph: this.rng.range(0, Math.PI * 2)
      });
    }
    this.off = document.createElement("canvas");
    this.off.width = RES;
    this.off.height = RES;
    this.offCtx = this.off.getContext("2d");
    this.img = this.offCtx.createImageData(RES, RES);
  }
  onParamChange(key) {
    if (key === "shapes") this.setup();
  }
  frame(_dt) {
    const { bands, blend } = this.params;
    const k = blend / 1e3;
    const t = this.time;
    const positions = this.shapes.map((s) => ({
      x: s.ox + Math.cos(t * 0.4 + s.ph) * 0.13,
      y: s.oy + Math.sin(t * 0.31 + s.ph * 1.7) * 0.13,
      r: s.r,
      kind: s.kind
    }));
    if (this.pointer.active) positions.push({ x: this.pointer.nx, y: this.pointer.ny, r: 0.07, kind: 0 });
    const bg = hexToRgb(this.theme.bg), fg = hexToRgb(this.theme.fg), ac = hexToRgb(this.theme.accent);
    const d = this.img.data;
    for (let py = 0; py < RES; py++) {
      for (let px = 0; px < RES; px++) {
        const x = px / RES, y = py / RES;
        let dist = 1e9;
        for (const s of positions) {
          const sd = s.kind === 0 ? Math.hypot(x - s.x, y - s.y) - s.r : Math.max(Math.abs(x - s.x), Math.abs(y - s.y)) - s.r * 0.85;
          const h = Math.max(k - Math.abs(dist - sd), 0) / (k || 1e-9);
          dist = Math.min(dist, sd) - h * h * k * 0.25;
        }
        const i = (py * RES + px) * 4;
        const inside = dist < 0;
        const band = Math.abs((dist * bands * 8 % 1 + 1) % 1 - 0.5) < 0.12 ? 1 : 0;
        const edge = Math.abs(dist) < 4e-3 ? 1 : 0;
        const base = inside ? 0.55 : Math.max(0.16 - dist * 0.5, 0);
        const bandInk = band * (inside ? 0.35 : 0.1);
        const tt = Math.min(base + bandInk, 1);
        d[i] = bg.r + (fg.r - bg.r) * tt + (ac.r - bg.r) * edge * 0.8;
        d[i + 1] = bg.g + (fg.g - bg.g) * tt + (ac.g - bg.g) * edge * 0.8;
        d[i + 2] = bg.b + (fg.b - bg.b) * tt + (ac.b - bg.b) * edge * 0.8;
        d[i + 3] = 255;
      }
    }
    this.offCtx.putImageData(this.img, 0, 0);
    this.ctx.drawImage(this.off, 0, 0, this.w, this.h);
  }
}
var distance_fields_default = DistanceFields;
export {
  DistanceFields,
  distance_fields_default as default
};
