import { Canvas2DAsset } from "../core/Canvas2DAsset.js";
import { getMeta } from "../core/catalog.js";
import { hexToRgb } from "../utils/color.js";
import { Noise } from "../utils/noise.js";
const N = 128;
class HeatMap extends Canvas2DAsset {
  field = new Float32Array(N * N);
  next = new Float32Array(N * N);
  noise;
  off;
  offCtx;
  img;
  constructor() {
    super(getMeta("heat-map"));
  }
  setup() {
    this.noise = new Noise(this.rng.seed);
    this.field.fill(0);
    this.off = document.createElement("canvas");
    this.off.width = N;
    this.off.height = N;
    this.offCtx = this.off.getContext("2d");
    this.img = this.offCtx.createImageData(N, N);
  }
  frame(_dt) {
    const { sources, conduct, cool } = this.params;
    for (let s = 0; s < sources; s++) {
      const t = this.time * 0.14 + s * 100;
      const x = Math.floor((0.5 + 0.36 * this.noise.noise3(s * 7.1, 0, t)) * N);
      const y = Math.floor((0.5 + 0.36 * this.noise.noise3(0, s * 13.7, t)) * N);
      const i = Math.max(0, Math.min(N - 1, y)) * N + Math.max(0, Math.min(N - 1, x));
      this.field[i] = Math.min(this.field[i] + 0.9, 3);
    }
    if (this.pointer.active) {
      const x = Math.max(1, Math.min(N - 2, Math.floor(this.pointer.nx * N)));
      const y = Math.max(1, Math.min(N - 2, Math.floor(this.pointer.ny * N)));
      this.field[y * N + x] = Math.min(this.field[y * N + x] + 1.4, 3);
    }
    const f = this.field, nx = this.next;
    for (let y = 0; y < N; y++) {
      const ym = Math.max(y - 1, 0) * N, y0 = y * N, yp = Math.min(y + 1, N - 1) * N;
      for (let x = 0; x < N; x++) {
        const xm = Math.max(x - 1, 0), xp = Math.min(x + 1, N - 1);
        const lap = f[ym + x] + f[yp + x] + f[y0 + xm] + f[y0 + xp] - 4 * f[y0 + x];
        nx[y0 + x] = (f[y0 + x] + lap * conduct) * cool;
      }
    }
    this.field.set(nx);
    const bg = hexToRgb(this.theme.bg), fg = hexToRgb(this.theme.fg), ac = hexToRgb(this.theme.accent);
    const d = this.img.data;
    for (let i = 0; i < N * N; i++) {
      const t = Math.min(this.field[i], 1);
      const hot = t > 0.7 ? (t - 0.7) / 0.3 : 0;
      d[i * 4] = bg.r + (fg.r - bg.r) * t * 0.85 + (ac.r - fg.r) * hot * 0.8;
      d[i * 4 + 1] = bg.g + (fg.g - bg.g) * t * 0.85 + (ac.g - fg.g) * hot * 0.8;
      d[i * 4 + 2] = bg.b + (fg.b - bg.b) * t * 0.85 + (ac.b - fg.b) * hot * 0.8;
      d[i * 4 + 3] = 255;
    }
    this.offCtx.putImageData(this.img, 0, 0);
    this.ctx.drawImage(this.off, 0, 0, this.w, this.h);
  }
}
var heat_map_default = HeatMap;
export {
  HeatMap,
  heat_map_default as default
};
