/** Neural Network Graph — feed-forward net with live activation pulses. */
import { Canvas2DAsset } from '../core/Canvas2DAsset.js';
import { getMeta } from '../core/catalog.js';
import { rgba } from '../utils/color.js';

interface Pulse { layer: number; from: number; to: number; t: number }

export class NeuralNetworkGraph extends Canvas2DAsset {
  private layout: number[] = [];
  private weights: number[][][] = [];
  private act: number[][] = [];
  private pulses: Pulse[] = [];
  private emitAcc = 0;

  constructor() { super(getMeta('neural-network-graph')); }

  protected setup(): void {
    const hidden = Math.round(this.params.layers);
    const width = Math.round(this.params.width);
    this.layout = [4, ...Array.from({ length: hidden }, () => width), 2];
    this.weights = [];
    for (let l = 0; l < this.layout.length - 1; l++) {
      const m: number[][] = [];
      for (let i = 0; i < this.layout[l]; i++) {
        m.push(Array.from({ length: this.layout[l + 1] }, () => this.rng.range(-1, 1)));
      }
      this.weights.push(m);
    }
    this.act = this.layout.map((n) => new Array(n).fill(0));
    this.pulses = [];
    this.emitAcc = 0;
  }

  protected onParamChange(key: string): void {
    if (key === 'layers' || key === 'width') this.setup();
  }

  private pos(l: number, i: number): [number, number] {
    const x = this.w * (0.12 + (l / (this.layout.length - 1)) * 0.76);
    const n = this.layout[l];
    const y = this.h * (0.5 + (i - (n - 1) / 2) * (0.8 / Math.max(n, 1)));
    return [x, y];
  }

  protected frame(dt: number): void {
    const { rate } = this.params;
    this.emitAcc += dt * rate;
    while (this.emitAcc >= 1) {
      this.emitAcc -= 1;
      const from = this.rng.int(0, this.layout[0] - 1);
      this.act[0][from] = 1;
      for (let to = 0; to < this.layout[1]; to++) {
        if (Math.abs(this.weights[0][from][to]) > 0.35) this.pulses.push({ layer: 0, from, to, t: 0 });
      }
    }
    // advance pulses; on arrival, activate + cascade
    for (let i = this.pulses.length - 1; i >= 0; i--) {
      const p = this.pulses[i];
      p.t += dt * 1.6;
      if (p.t >= 1) {
        const l = p.layer + 1;
        this.act[l][p.to] = Math.min(this.act[l][p.to] + 0.8, 1);
        if (l < this.layout.length - 1) {
          for (let to = 0; to < this.layout[l + 1]; to++) {
            if (Math.abs(this.weights[l][p.to][to]) > 0.45 && this.pulses.length < 400) {
              this.pulses.push({ layer: l, from: p.to, to, t: 0 });
            }
          }
        }
        this.pulses.splice(i, 1);
      }
    }
    for (const layer of this.act) for (let i = 0; i < layer.length; i++) layer[i] *= Math.exp(-dt * 2.2);

    this.clear();
    const ctx = this.ctx;
    // edges: width = |w|, tone = sign
    for (let l = 0; l < this.weights.length; l++) {
      for (let i = 0; i < this.layout[l]; i++) {
        const [x1, y1] = this.pos(l, i);
        for (let j = 0; j < this.layout[l + 1]; j++) {
          const w = this.weights[l][i][j];
          const [x2, y2] = this.pos(l + 1, j);
          ctx.strokeStyle = w > 0 ? rgba(this.theme.fg, 0.05 + Math.abs(w) * 0.14) : rgba(this.theme.muted, 0.05 + Math.abs(w) * 0.12);
          ctx.lineWidth = 0.4 + Math.abs(w) * 1.3;
          ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
        }
      }
    }
    // pulses
    for (const p of this.pulses) {
      const [x1, y1] = this.pos(p.layer, p.from);
      const [x2, y2] = this.pos(p.layer + 1, p.to);
      const x = x1 + (x2 - x1) * p.t, y = y1 + (y2 - y1) * p.t;
      ctx.fillStyle = rgba(this.theme.accent, 0.9);
      ctx.fillRect(x - 1.5, y - 1.5, 3, 3);
    }
    // neurons
    ctx.lineWidth = 1;
    for (let l = 0; l < this.layout.length; l++) {
      for (let i = 0; i < this.layout[l]; i++) {
        const [x, y] = this.pos(l, i);
        const a = this.act[l][i];
        const near = this.pointer.active && Math.hypot(x - this.pointer.x, y - this.pointer.y) < 30;
        if (near) this.act[l][i] = 1;
        ctx.beginPath();
        ctx.arc(x, y, 5 + a * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = a > 0.02 ? rgba(this.theme.accent, a * 0.75) : rgba(this.theme.bg, 1);
        ctx.fill();
        ctx.strokeStyle = rgba(this.theme.fg, 0.5 + a * 0.5);
        ctx.stroke();
      }
    }
  }

  exportSVG(): string {
    const parts: string[] = [];
    for (let l = 0; l < this.weights.length; l++) {
      for (let i = 0; i < this.layout[l]; i++) {
        const [x1, y1] = this.pos(l, i);
        for (let j = 0; j < this.layout[l + 1]; j++) {
          const w = this.weights[l][i][j];
          const [x2, y2] = this.pos(l + 1, j);
          parts.push(`<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${w > 0 ? this.theme.fg : this.theme.muted}" stroke-opacity="${(0.06 + Math.abs(w) * 0.16).toFixed(2)}" stroke-width="${(0.4 + Math.abs(w) * 1.3).toFixed(2)}"/>`);
        }
      }
    }
    for (let l = 0; l < this.layout.length; l++) {
      for (let i = 0; i < this.layout[l]; i++) {
        const [x, y] = this.pos(l, i);
        parts.push(`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="5" fill="${this.theme.bg}" stroke="${this.theme.fg}" stroke-opacity="0.6"/>`);
      }
    }
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${this.w} ${this.h}">\n  <rect width="100%" height="100%" fill="${this.theme.bg}"/>\n  ${parts.join('\n  ')}\n</svg>`;
  }
}

export default NeuralNetworkGraph;
