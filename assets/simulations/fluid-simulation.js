import { Canvas2DAsset } from "../core/Canvas2DAsset.js";
import { getMeta } from "../core/catalog.js";
import { hexToRgb } from "../utils/color.js";
class FluidSimulation extends Canvas2DAsset {
  N = 80;
  u;
  v;
  u0;
  v0;
  dye;
  dye0;
  off;
  offCtx;
  img;
  constructor() {
    super(getMeta("fluid-simulation"));
  }
  setup() {
    this.N = Math.round(this.params.res);
    const n = (this.N + 2) * (this.N + 2);
    this.u = new Float32Array(n);
    this.v = new Float32Array(n);
    this.u0 = new Float32Array(n);
    this.v0 = new Float32Array(n);
    this.dye = new Float32Array(n);
    this.dye0 = new Float32Array(n);
    this.off = document.createElement("canvas");
    this.off.width = this.N;
    this.off.height = this.N;
    this.offCtx = this.off.getContext("2d");
    this.img = this.offCtx.createImageData(this.N, this.N);
  }
  onParamChange(key) {
    if (key === "res") this.setup();
  }
  ix(x, y) {
    return x + (this.N + 2) * y;
  }
  setBnd(b, x) {
    const N = this.N;
    for (let i = 1; i <= N; i++) {
      x[this.ix(0, i)] = b === 1 ? -x[this.ix(1, i)] : x[this.ix(1, i)];
      x[this.ix(N + 1, i)] = b === 1 ? -x[this.ix(N, i)] : x[this.ix(N, i)];
      x[this.ix(i, 0)] = b === 2 ? -x[this.ix(i, 1)] : x[this.ix(i, 1)];
      x[this.ix(i, N + 1)] = b === 2 ? -x[this.ix(i, N)] : x[this.ix(i, N)];
    }
  }
  linSolve(b, x, x0, a, c) {
    const N = this.N;
    for (let k = 0; k < 10; k++) {
      for (let j = 1; j <= N; j++) for (let i = 1; i <= N; i++) {
        x[this.ix(i, j)] = (x0[this.ix(i, j)] + a * (x[this.ix(i - 1, j)] + x[this.ix(i + 1, j)] + x[this.ix(i, j - 1)] + x[this.ix(i, j + 1)])) / c;
      }
      this.setBnd(b, x);
    }
  }
  advect(b, d, d0, u, v, dt) {
    const N = this.N;
    const dt0 = dt * N;
    for (let j = 1; j <= N; j++) for (let i = 1; i <= N; i++) {
      let x = i - dt0 * u[this.ix(i, j)], y = j - dt0 * v[this.ix(i, j)];
      x = Math.max(0.5, Math.min(N + 0.5, x));
      y = Math.max(0.5, Math.min(N + 0.5, y));
      const i0 = Math.floor(x), i1 = i0 + 1, j0 = Math.floor(y), j1 = j0 + 1;
      const s1 = x - i0, s0 = 1 - s1, t1 = y - j0, t0 = 1 - t1;
      d[this.ix(i, j)] = s0 * (t0 * d0[this.ix(i0, j0)] + t1 * d0[this.ix(i0, j1)]) + s1 * (t0 * d0[this.ix(i1, j0)] + t1 * d0[this.ix(i1, j1)]);
    }
    this.setBnd(b, d);
  }
  project(u, v, p, div) {
    const N = this.N;
    for (let j = 1; j <= N; j++) for (let i = 1; i <= N; i++) {
      div[this.ix(i, j)] = -0.5 * (u[this.ix(i + 1, j)] - u[this.ix(i - 1, j)] + v[this.ix(i, j + 1)] - v[this.ix(i, j - 1)]) / N;
      p[this.ix(i, j)] = 0;
    }
    this.setBnd(0, div);
    this.setBnd(0, p);
    this.linSolve(0, p, div, 1, 4);
    for (let j = 1; j <= N; j++) for (let i = 1; i <= N; i++) {
      u[this.ix(i, j)] -= 0.5 * N * (p[this.ix(i + 1, j)] - p[this.ix(i - 1, j)]);
      v[this.ix(i, j)] -= 0.5 * N * (p[this.ix(i, j + 1)] - p[this.ix(i, j - 1)]);
    }
    this.setBnd(1, u);
    this.setBnd(2, v);
  }
  frame(dt) {
    const N = this.N;
    const { visc, dye } = this.params;
    const step = Math.min(dt, 0.033);
    if (this.pointer.active) {
      const gx = Math.max(1, Math.min(N, Math.round(this.pointer.nx * N)));
      const gy = Math.max(1, Math.min(N, Math.round(this.pointer.ny * N)));
      this.u[this.ix(gx, gy)] += this.pointer.vx * 0.12;
      this.v[this.ix(gx, gy)] += this.pointer.vy * 0.12;
      const speed = Math.hypot(this.pointer.vx, this.pointer.vy);
      this.dye[this.ix(gx, gy)] += speed * dye * 0.02;
    } else {
      const a2 = this.time * 0.6;
      const gx = Math.round(N / 2 + Math.cos(a2) * N * 0.26);
      const gy = Math.round(N / 2 + Math.sin(a2 * 1.3) * N * 0.26);
      this.u[this.ix(gx, gy)] += Math.cos(a2 + 1) * 0.9;
      this.v[this.ix(gx, gy)] += Math.sin(a2) * 0.9;
      this.dye[this.ix(gx, gy)] += dye * 0.012;
    }
    this.u0.set(this.u);
    this.v0.set(this.v);
    const a = step * visc * N * N;
    if (a > 0) {
      this.linSolve(1, this.u, this.u0, a, 1 + 4 * a);
      this.linSolve(2, this.v, this.v0, a, 1 + 4 * a);
    }
    this.project(this.u, this.v, this.u0, this.v0);
    this.u0.set(this.u);
    this.v0.set(this.v);
    this.advect(1, this.u, this.u0, this.u0, this.v0, step);
    this.advect(2, this.v, this.v0, this.u0, this.v0, step);
    this.project(this.u, this.v, this.u0, this.v0);
    this.dye0.set(this.dye);
    this.advect(0, this.dye, this.dye0, this.u, this.v, step);
    for (let i = 0; i < this.dye.length; i++) this.dye[i] *= 0.995;
    const bg = hexToRgb(this.theme.bg), fg = hexToRgb(this.theme.fg), ac = hexToRgb(this.theme.accent);
    const d = this.img.data;
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
      const t = Math.min(this.dye[this.ix(i + 1, j + 1)], 1);
      const hot = t > 0.72 ? (t - 0.72) / 0.28 : 0;
      const p = (j * N + i) * 4;
      d[p] = bg.r + (fg.r - bg.r) * t + (ac.r - fg.r) * hot * 0.65;
      d[p + 1] = bg.g + (fg.g - bg.g) * t + (ac.g - fg.g) * hot * 0.65;
      d[p + 2] = bg.b + (fg.b - bg.b) * t + (ac.b - fg.b) * hot * 0.65;
      d[p + 3] = 255;
    }
    this.offCtx.putImageData(this.img, 0, 0);
    this.ctx.drawImage(this.off, 0, 0, this.w, this.h);
  }
}
var fluid_simulation_default = FluidSimulation;
export {
  FluidSimulation,
  fluid_simulation_default as default
};
