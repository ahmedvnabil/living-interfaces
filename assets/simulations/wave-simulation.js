import { Canvas2DAsset } from "../core/Canvas2DAsset.js";
import { getMeta } from "../core/catalog.js";
import { hexToRgb } from "../utils/color.js";
class WaveSimulation extends Canvas2DAsset {
  N = 120;
  cur;
  prev;
  off;
  offCtx;
  img;
  dropTimer = 0;
  constructor() {
    super(getMeta("wave-simulation"));
  }
  setup() {
    this.N = Math.round(this.params.res);
    this.cur = new Float32Array(this.N * this.N);
    this.prev = new Float32Array(this.N * this.N);
    this.off = document.createElement("canvas");
    this.off.width = this.N;
    this.off.height = this.N;
    this.offCtx = this.off.getContext("2d");
    this.img = this.offCtx.createImageData(this.N, this.N);
    this.dropTimer = 0;
  }
  onParamChange(key) {
    if (key === "res") this.setup();
  }
  impulse(nx, ny, power) {
    const N = this.N;
    const cx = Math.floor(nx * N), cy = Math.floor(ny * N);
    for (let y = -2; y <= 2; y++) for (let x = -2; x <= 2; x++) {
      const xi = cx + x, yi = cy + y;
      if (xi > 1 && xi < N - 2 && yi > 1 && yi < N - 2) {
        const d = Math.hypot(x, y);
        this.cur[yi * N + xi] += power * Math.exp(-d * d * 0.5) * 0.01;
      }
    }
  }
  frame(dt) {
    const N = this.N;
    const { damping, impulse } = this.params;
    if (this.pointer.active && (Math.abs(this.pointer.vx) + Math.abs(this.pointer.vy) > 1.2 || this.pointer.down)) {
      this.impulse(this.pointer.nx, this.pointer.ny, impulse * 0.4);
    }
    this.dropTimer -= dt;
    if (this.dropTimer <= 0) {
      this.impulse(this.rng.range(0.15, 0.85), this.rng.range(0.15, 0.85), impulse);
      this.dropTimer = this.rng.range(1.2, 3.2);
    }
    const { cur, prev } = this;
    for (let y = 1; y < N - 1; y++) {
      const y0 = y * N;
      for (let x = 1; x < N - 1; x++) {
        const i = y0 + x;
        prev[i] = (2 * cur[i] - prev[i] + 0.5 * (cur[i - 1] + cur[i + 1] + cur[i - N] + cur[i + N] - 4 * cur[i])) * damping;
      }
    }
    this.prev = cur;
    this.cur = prev;
    const bg = hexToRgb(this.theme.bg), fg = hexToRgb(this.theme.fg), ac = hexToRgb(this.theme.accent);
    const d = this.img.data;
    for (let i = 0; i < N * N; i++) {
      const h = this.cur[i];
      const t = Math.min(Math.abs(h) * 3, 1);
      const pos = h > 0;
      const p = i * 4;
      d[p] = bg.r + ((pos ? fg.r : ac.r) - bg.r) * t * (pos ? 1 : 0.75);
      d[p + 1] = bg.g + ((pos ? fg.g : ac.g) - bg.g) * t * (pos ? 1 : 0.75);
      d[p + 2] = bg.b + ((pos ? fg.b : ac.b) - bg.b) * t * (pos ? 1 : 0.75);
      d[p + 3] = 255;
    }
    this.offCtx.putImageData(this.img, 0, 0);
    this.ctx.drawImage(this.off, 0, 0, this.w, this.h);
  }
}
var wave_simulation_default = WaveSimulation;
export {
  WaveSimulation,
  wave_simulation_default as default
};
