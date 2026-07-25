import { Canvas2DAsset } from "../core/Canvas2DAsset.js";
import { getMeta } from "../core/catalog.js";
import { rgba } from "../utils/color.js";
class SignalPropagation extends Canvas2DAsset {
  nodesArr = [];
  edges = [];
  adj = [];
  sigs = [];
  acc = 0;
  constructor() {
    super(getMeta("signal-propagation"));
  }
  setup() {
    const n = Math.round(this.params.nodes);
    this.nodesArr = [];
    let guard = 0;
    while (this.nodesArr.length < n && guard++ < n * 60) {
      const x = this.rng.range(this.w * 0.06, this.w * 0.94);
      const y = this.rng.range(this.h * 0.08, this.h * 0.92);
      if (this.nodesArr.every((o) => Math.hypot(o.x - x, o.y - y) > 34)) this.nodesArr.push({ x, y, heat: 0 });
    }
    this.edges = [];
    const seen = /* @__PURE__ */ new Set();
    this.nodesArr.forEach((nd, i) => {
      const near = this.nodesArr.map((o, j) => ({ j, d: Math.hypot(o.x - nd.x, o.y - nd.y) })).filter(({ j }) => j !== i).sort((a, b) => a.d - b.d).slice(0, 2);
      for (const { j } of near) {
        const key = i < j ? `${i}-${j}` : `${j}-${i}`;
        if (!seen.has(key)) {
          seen.add(key);
          this.edges.push({ a: Math.min(i, j), b: Math.max(i, j) });
        }
      }
    });
    this.adj = this.nodesArr.map(() => []);
    this.edges.forEach((e, ei) => {
      this.adj[e.a].push(ei);
      this.adj[e.b].push(ei);
    });
    this.sigs = [];
    this.acc = 0;
  }
  onParamChange(key) {
    if (key === "nodes") this.setup();
  }
  frame(dt) {
    const { rate, decay } = this.params;
    this.acc += dt * rate;
    while (this.acc >= 1) {
      this.acc -= 1;
      const src = this.rng.int(0, this.nodesArr.length - 1);
      for (const ei of this.adj[src]) {
        this.sigs.push({ edge: ei, dir: this.edges[ei].a === src ? 1 : -1, t: 0, power: 1 });
      }
    }
    if (this.pointer.active && this.pointer.down) {
      let best = 0, bd = Infinity;
      this.nodesArr.forEach((nd, i) => {
        const d = Math.hypot(nd.x - this.pointer.x, nd.y - this.pointer.y);
        if (d < bd) {
          bd = d;
          best = i;
        }
      });
      if (bd < 40) for (const ei of this.adj[best]) {
        this.sigs.push({ edge: ei, dir: this.edges[ei].a === best ? 1 : -1, t: 0, power: 1 });
      }
    }
    for (let i = this.sigs.length - 1; i >= 0; i--) {
      const s = this.sigs[i];
      s.t += dt * 1.8;
      if (s.t >= 1) {
        const e = this.edges[s.edge];
        const arrive = s.dir === 1 ? e.b : e.a;
        this.nodesArr[arrive].heat = Math.min(this.nodesArr[arrive].heat + s.power, 1);
        const p = s.power * decay;
        if (p > 0.12 && this.sigs.length < 600) {
          for (const ei of this.adj[arrive]) {
            if (ei === s.edge) continue;
            this.sigs.push({ edge: ei, dir: this.edges[ei].a === arrive ? 1 : -1, t: 0, power: p });
          }
        }
        this.sigs.splice(i, 1);
      }
    }
    for (const nd of this.nodesArr) nd.heat *= Math.exp(-dt * 1.6);
    this.clear();
    const ctx = this.ctx;
    ctx.strokeStyle = rgba(this.theme.faint, 1);
    ctx.beginPath();
    for (const e of this.edges) {
      ctx.moveTo(this.nodesArr[e.a].x, this.nodesArr[e.a].y);
      ctx.lineTo(this.nodesArr[e.b].x, this.nodesArr[e.b].y);
    }
    ctx.stroke();
    for (const s of this.sigs) {
      const e = this.edges[s.edge];
      const a = this.nodesArr[s.dir === 1 ? e.a : e.b];
      const b = this.nodesArr[s.dir === 1 ? e.b : e.a];
      const x = a.x + (b.x - a.x) * s.t, y = a.y + (b.y - a.y) * s.t;
      ctx.fillStyle = rgba(this.theme.accent, s.power);
      ctx.fillRect(x - 1.5, y - 1.5, 3, 3);
    }
    for (const nd of this.nodesArr) {
      ctx.fillStyle = nd.heat > 0.04 ? rgba(this.theme.accent, 0.3 + nd.heat * 0.7) : rgba(this.theme.fg, 0.55);
      ctx.beginPath();
      ctx.arc(nd.x, nd.y, 2.4 + nd.heat * 2.4, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}
var signal_propagation_default = SignalPropagation;
export {
  SignalPropagation,
  signal_propagation_default as default
};
