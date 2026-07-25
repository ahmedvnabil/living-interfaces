import { Canvas2DAsset } from "../core/Canvas2DAsset.js";
import { getMeta } from "../core/catalog.js";
import { rgba } from "../utils/color.js";
const DOMAINS = ["SYS", "BIO", "GEO", "NET", "MAT"];
class KnowledgeGraph extends Canvas2DAsset {
  nodesArr = [];
  edges = [];
  constructor() {
    super(getMeta("knowledge-graph"));
  }
  setup() {
    const n = Math.round(this.params.nodes);
    this.nodesArr = [];
    for (let i = 0; i < n; i++) {
      const domain = this.rng.int(0, DOMAINS.length - 1);
      this.nodesArr.push({
        x: this.w / 2 + this.rng.range(-80, 80),
        y: this.h / 2 + this.rng.range(-80, 80),
        vx: 0,
        vy: 0,
        domain,
        label: `${DOMAINS[domain]}-${String(i).padStart(2, "0")}`,
        deg: 0
      });
    }
    this.edges = [];
    for (let i = 1; i < n; i++) {
      const sameDomain = this.nodesArr.map((nd, j) => ({ nd, j })).filter(({ nd, j }) => j < i && nd.domain === this.nodesArr[i].domain);
      const pool = sameDomain.length > 0 && this.rng.next() < 0.8 ? sameDomain : this.nodesArr.slice(0, i).map((nd, j) => ({ nd, j }));
      const weights = pool.map(({ nd }) => nd.deg + 1);
      const total = weights.reduce((a, b) => a + b, 0);
      let r = this.rng.next() * total;
      let pick = pool[0].j;
      for (let k = 0; k < pool.length; k++) {
        r -= weights[k];
        if (r <= 0) {
          pick = pool[k].j;
          break;
        }
      }
      this.edges.push({ a: i, b: pick });
      this.nodesArr[i].deg++;
      this.nodesArr[pick].deg++;
      if (this.rng.next() < 0.25) {
        const extra = this.rng.int(0, i - 1);
        if (extra !== pick) {
          this.edges.push({ a: i, b: extra });
          this.nodesArr[i].deg++;
          this.nodesArr[extra].deg++;
        }
      }
    }
  }
  onParamChange(key) {
    if (key === "nodes") this.setup();
  }
  frame(dt) {
    const { charge, spring } = this.params;
    const nodes = this.nodesArr;
    const step = Math.min(dt, 0.033);
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j];
        const dx = b.x - a.x, dy = b.y - a.y;
        const d2 = Math.max(dx * dx + dy * dy, 60);
        const f = charge / d2;
        const d = Math.sqrt(d2);
        const fx = dx / d * f, fy = dy / d * f;
        a.vx -= fx;
        a.vy -= fy;
        b.vx += fx;
        b.vy += fy;
      }
    }
    for (const e of this.edges) {
      const a = nodes[e.a], b = nodes[e.b];
      const dx = b.x - a.x, dy = b.y - a.y;
      const d = Math.hypot(dx, dy) || 1;
      const f = (d - 70) * spring;
      a.vx += dx / d * f;
      a.vy += dy / d * f;
      b.vx -= dx / d * f;
      b.vy -= dy / d * f;
    }
    const cx = this.w / 2, cy = this.h / 2;
    for (const nd of nodes) {
      nd.vx += (cx - nd.x) * 12e-4;
      nd.vy += (cy - nd.y) * 12e-4;
      if (this.pointer.active) {
        const dx = nd.x - this.pointer.x, dy = nd.y - this.pointer.y;
        const d2 = Math.max(dx * dx + dy * dy, 100);
        if (d2 < 8100) {
          const d = Math.sqrt(d2);
          const f = (1 - d / 90) * 2.6;
          nd.vx += dx / d * f;
          nd.vy += dy / d * f;
        }
      }
      nd.vx *= 0.86;
      nd.vy *= 0.86;
      nd.x += nd.vx * step * 60 * 0.4;
      nd.y += nd.vy * step * 60 * 0.4;
    }
    this.clear();
    const ctx = this.ctx;
    ctx.strokeStyle = rgba(this.theme.muted, 0.28);
    ctx.beginPath();
    for (const e of this.edges) {
      ctx.moveTo(nodes[e.a].x, nodes[e.a].y);
      ctx.lineTo(nodes[e.b].x, nodes[e.b].y);
    }
    ctx.stroke();
    ctx.font = "8px monospace";
    ctx.textAlign = "left";
    for (const nd of nodes) {
      const r = 2 + Math.min(nd.deg, 8) * 0.7;
      const hub = nd.deg >= 4;
      ctx.fillStyle = hub ? rgba(this.theme.accent, 0.95) : rgba(this.theme.fg, 0.85);
      ctx.beginPath();
      ctx.arc(nd.x, nd.y, r, 0, Math.PI * 2);
      ctx.fill();
      if (hub || this.pointer.active && Math.hypot(nd.x - this.pointer.x, nd.y - this.pointer.y) < 60) {
        ctx.fillStyle = rgba(this.theme.muted, 0.9);
        ctx.fillText(nd.label, nd.x + r + 3, nd.y + 2.5);
      }
    }
  }
  exportSVG() {
    const nodes = this.nodesArr;
    const edges = this.edges.map(
      (e) => `<line x1="${nodes[e.a].x.toFixed(1)}" y1="${nodes[e.a].y.toFixed(1)}" x2="${nodes[e.b].x.toFixed(1)}" y2="${nodes[e.b].y.toFixed(1)}" stroke="${this.theme.muted}" stroke-opacity="0.3"/>`
    ).join("\n  ");
    const circles = nodes.map(
      (nd) => `<circle cx="${nd.x.toFixed(1)}" cy="${nd.y.toFixed(1)}" r="${(2 + Math.min(nd.deg, 8) * 0.7).toFixed(1)}" fill="${nd.deg >= 4 ? this.theme.accent : this.theme.fg}"/>`
    ).join("\n  ");
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${this.w} ${this.h}">
  <rect width="100%" height="100%" fill="${this.theme.bg}"/>
  ${edges}
  ${circles}
</svg>`;
  }
}
var knowledge_graph_default = KnowledgeGraph;
export {
  KnowledgeGraph,
  knowledge_graph_default as default
};
