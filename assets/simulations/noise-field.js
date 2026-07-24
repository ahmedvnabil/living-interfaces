import { Canvas2DAsset } from "../core/Canvas2DAsset.js";
import { getMeta } from "../core/catalog.js";
import { Noise } from "../utils/noise.js";
import { rgba } from "../utils/color.js";
class NoiseField extends Canvas2DAsset {
  noise;
  constructor() {
    super(getMeta("noise-field"));
  }
  setup() {
    this.noise = new Noise(this.rng.seed);
  }
  frame(_dt) {
    this.clear();
    const { grid, octaves, amp, flow } = this.params;
    const t = this.time * flow;
    const ctx = this.ctx;
    const s = 2.2 / Math.max(this.w, this.h);
    const ptr = this.pointer;
    for (let y = grid / 2; y < this.h; y += grid) {
      for (let x = grid / 2; x < this.w; x += grid) {
        let v = this.noise.fbm3(x * s, y * s, t, Math.round(octaves));
        if (ptr.active) {
          const d = Math.hypot(x - ptr.x, y - ptr.y);
          if (d < 120) v += (1 - d / 120) * 0.65;
        }
        const dy = v * amp;
        const mag = Math.min(Math.abs(v) * 1.4, 1);
        const r = 0.7 + mag * 1.5;
        ctx.fillStyle = v > 0.42 ? rgba(this.theme.accent, 0.75) : rgba(this.theme.fg, 0.12 + mag * 0.55);
        ctx.beginPath();
        ctx.arc(x, y - dy, r, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
}
var noise_field_default = NoiseField;
export {
  NoiseField,
  noise_field_default as default
};
