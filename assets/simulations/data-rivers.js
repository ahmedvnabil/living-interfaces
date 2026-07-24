import { Canvas2DAsset } from "../core/Canvas2DAsset.js";
import { getMeta } from "../core/catalog.js";
import { rgba } from "../utils/color.js";
import { Noise } from "../utils/noise.js";
class DataRivers extends Canvas2DAsset {
  noise;
  live = null;
  lastPaths = [];
  constructor() {
    super(getMeta("data-rivers"));
  }
  setup() {
    this.noise = new Noise(this.rng.seed);
    this.live = null;
  }
  /** Accepts number[] of relative series weights for live data. */
  setData(data) {
    if (Array.isArray(data) && data.every((d) => typeof d === "number")) this.live = data;
  }
  frame(_dt) {
    const { series, speed, turbulence } = this.params;
    const n = Math.round(series);
    const t = this.time * speed * 0.12;
    this.clear();
    const ctx = this.ctx;
    const cols = 90;
    const thick = [];
    for (let s = 0; s < n; s++) {
      const row = [];
      const liveW = this.live?.[s % (this.live.length || 1)] ?? 1;
      for (let c = 0; c <= cols; c++) {
        const x = c / cols;
        let v = 0.35 + 0.65 * (this.noise.noise3(x * 2.2 + s * 13.7, s * 5.1, t) * 0.5 + 0.5);
        v += this.noise.noise3(x * 7 + s * 31, s * 9, t * 2.4) * turbulence * 0.4;
        if (this.pointer.active) {
          const d = Math.abs(x - this.pointer.nx);
          if (d < 0.14) v *= 1 + (1 - d / 0.14) * 0.8 * (1 - Math.abs(this.pointer.ny - (s + 0.5) / n) * 2);
        }
        row.push(Math.max(v, 0.05) * liveW);
      }
      thick.push(row);
    }
    const pad = this.h * 0.1;
    const bandH = this.h - pad * 2;
    this.lastPaths = [];
    const edges = [new Array(cols + 1).fill(0)];
    for (let c = 0; c <= cols; c++) {
      let sum = 0;
      for (let s = 0; s < n; s++) sum += thick[s][c];
      let acc = 0;
      for (let s = 0; s < n; s++) {
        acc += thick[s][c];
        if (!edges[s + 1]) edges[s + 1] = new Array(cols + 1);
        edges[s + 1][c] = acc / sum;
      }
    }
    for (let s = 0; s < n; s++) {
      const topE = edges[s], botE = edges[s + 1];
      ctx.beginPath();
      let d = "";
      for (let c = 0; c <= cols; c++) {
        const x = c / cols * this.w;
        const y = pad + topE[c] * bandH;
        c === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        d += `${c === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)} `;
      }
      for (let c = cols; c >= 0; c--) {
        const x = c / cols * this.w;
        const y = pad + botE[c] * bandH;
        ctx.lineTo(x, y);
        d += `L${x.toFixed(1)} ${y.toFixed(1)} `;
      }
      ctx.closePath();
      const k = s / Math.max(n - 1, 1);
      const isAccent = s === Math.floor(n / 2);
      ctx.fillStyle = isAccent ? rgba(this.theme.accent, 0.16) : rgba(this.theme.fg, 0.04 + k * 0.07);
      ctx.fill();
      ctx.strokeStyle = isAccent ? rgba(this.theme.accent, 0.55) : rgba(this.theme.fg, 0.25);
      ctx.stroke();
      this.lastPaths.push(d + "Z");
    }
  }
  exportSVG() {
    const n = this.lastPaths.length;
    const paths = this.lastPaths.map((d, s) => {
      const isAccent = s === Math.floor(n / 2);
      const stroke = isAccent ? this.theme.accent : this.theme.fg;
      return `<path d="${d}" fill="${stroke}" fill-opacity="${isAccent ? 0.16 : 0.06}" stroke="${stroke}" stroke-opacity="${isAccent ? 0.55 : 0.25}"/>`;
    }).join("\n  ");
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${this.w} ${this.h}">
  <rect width="100%" height="100%" fill="${this.theme.bg}"/>
  ${paths}
</svg>`;
  }
}
var data_rivers_default = DataRivers;
export {
  DataRivers,
  data_rivers_default as default
};
