import { Canvas2DAsset } from "../core/Canvas2DAsset.js";
import { getMeta } from "../core/catalog.js";
import { rgba } from "../utils/color.js";
const DANGER = "#ff6b57";
class NetworkTopology extends Canvas2DAsset {
  nodesArr = [];
  links = [];
  packets = [];
  acc = 0;
  constructor() {
    super(getMeta("network-topology"));
  }
  setup() {
    const edgeN = Math.round(this.params.edge);
    const aggN = Math.max(2, Math.round(edgeN / 3));
    this.nodesArr = [];
    this.links = [];
    for (let i = 0; i < 2; i++) {
      this.nodesArr.push({ x: this.w * (0.38 + i * 0.24), y: this.h * 0.16, tier: 0, health: "ok", label: `CORE-${i}`, recovery: 0 });
    }
    for (let i = 0; i < aggN; i++) {
      this.nodesArr.push({ x: this.w * ((i + 0.5) / aggN), y: this.h * 0.48, tier: 1, health: "ok", label: `AGG-${String(i).padStart(2, "0")}`, recovery: 0 });
      this.links.push({ a: 2 + i, b: 0 }, { a: 2 + i, b: 1 });
    }
    for (let i = 0; i < edgeN; i++) {
      const agg = 2 + Math.floor(i / (edgeN / aggN));
      this.nodesArr.push({ x: this.w * ((i + 0.5) / edgeN), y: this.h * 0.82, tier: 2, health: "ok", label: `E${String(i).padStart(2, "0")}`, recovery: 0 });
      this.links.push({ a: 2 + aggN + i, b: Math.min(agg, 1 + aggN) });
    }
    this.packets = [];
    this.acc = 0;
  }
  onParamChange(key) {
    if (key === "edge") this.setup();
  }
  frame(dt) {
    const { traffic, fail } = this.params;
    for (const nd of this.nodesArr) {
      if (nd.health === "ok" && nd.tier > 0 && this.rng.next() < fail * dt * 60) {
        nd.health = this.rng.next() < 0.5 ? "warn" : "down";
        nd.recovery = this.rng.range(2, 6);
      } else if (nd.health !== "ok") {
        nd.recovery -= dt;
        if (nd.recovery <= 0) nd.health = "ok";
      }
    }
    if (this.pointer.active && this.pointer.down) {
      for (const nd of this.nodesArr) {
        if (Math.hypot(nd.x - this.pointer.x, nd.y - this.pointer.y) < 30) nd.health = "ok";
      }
    }
    this.acc += dt * traffic * 6;
    while (this.acc >= 1 && this.packets.length < 300) {
      this.acc -= 1;
      const li = this.rng.int(0, this.links.length - 1);
      const l = this.links[li];
      if (this.nodesArr[l.a].health !== "down" && this.nodesArr[l.b].health !== "down") {
        this.packets.push({ link: li, t: 0, up: this.rng.next() < 0.5 });
      }
    }
    for (let i = this.packets.length - 1; i >= 0; i--) {
      const p = this.packets[i];
      p.t += dt * 1.4;
      if (p.t >= 1) this.packets.splice(i, 1);
    }
    this.clear();
    const ctx = this.ctx;
    for (const l of this.links) {
      const a = this.nodesArr[l.a], b = this.nodesArr[l.b];
      const dead = a.health === "down" || b.health === "down";
      ctx.strokeStyle = dead ? rgba(DANGER, 0.25) : rgba(this.theme.muted, 0.3);
      ctx.setLineDash(dead ? [3, 3] : []);
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }
    ctx.setLineDash([]);
    for (const p of this.packets) {
      const l = this.links[p.link];
      const a = this.nodesArr[p.up ? l.a : l.b], b = this.nodesArr[p.up ? l.b : l.a];
      const x = a.x + (b.x - a.x) * p.t, y = a.y + (b.y - a.y) * p.t;
      ctx.fillStyle = rgba(this.theme.accent, 0.85);
      ctx.fillRect(x - 1, y - 1, 2, 2);
    }
    ctx.font = "8px monospace";
    ctx.textAlign = "center";
    for (const nd of this.nodesArr) {
      const s = nd.tier === 0 ? 9 : nd.tier === 1 ? 7 : 5;
      ctx.fillStyle = rgba(this.theme.bg, 1);
      ctx.fillRect(nd.x - s, nd.y - s, s * 2, s * 2);
      ctx.strokeStyle = nd.health === "ok" ? rgba(this.theme.fg, 0.8) : nd.health === "warn" ? rgba(this.theme.accent, 0.95) : rgba(DANGER, 0.95);
      ctx.strokeRect(nd.x - s, nd.y - s, s * 2, s * 2);
      ctx.fillStyle = nd.health !== "down" ? rgba(this.theme.accent, 0.9) : rgba(DANGER, 0.95);
      ctx.fillRect(nd.x - 1.5, nd.y - 1.5, 3, 3);
      if (nd.tier < 2) {
        ctx.fillStyle = rgba(this.theme.muted, 0.9);
        ctx.fillText(nd.label, nd.x, nd.y - s - 4);
      }
    }
  }
  exportSVG() {
    const links = this.links.map((l) => {
      const a = this.nodesArr[l.a], b = this.nodesArr[l.b];
      return `<line x1="${a.x.toFixed(1)}" y1="${a.y.toFixed(1)}" x2="${b.x.toFixed(1)}" y2="${b.y.toFixed(1)}" stroke="${this.theme.muted}" stroke-opacity="0.35"/>`;
    }).join("\n  ");
    const nodes = this.nodesArr.map((nd) => {
      const s = nd.tier === 0 ? 9 : nd.tier === 1 ? 7 : 5;
      return `<rect x="${(nd.x - s).toFixed(1)}" y="${(nd.y - s).toFixed(1)}" width="${s * 2}" height="${s * 2}" fill="${this.theme.bg}" stroke="${this.theme.fg}" stroke-opacity="0.8"/>`;
    }).join("\n  ");
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${this.w} ${this.h}">
  <rect width="100%" height="100%" fill="${this.theme.bg}"/>
  ${links}
  ${nodes}
</svg>`;
  }
}
var network_topology_default = NetworkTopology;
export {
  NetworkTopology,
  network_topology_default as default
};
