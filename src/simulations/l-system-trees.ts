/** L-System Trees — bracketed rewriting interpreted as turtle graphics. */
import { Canvas2DAsset } from '../core/Canvas2DAsset.js';
import { getMeta } from '../core/catalog.js';
import { rgba } from '../utils/color.js';

const RULES: Array<{ axiom: string; rules: Record<string, string> }> = [
  { axiom: 'F', rules: { F: 'FF+[+F-F-F]-[-F+F+F]' } },
  { axiom: 'X', rules: { X: 'F[+X]F[-X]+X', F: 'FF' } },
  { axiom: 'X', rules: { X: 'F[+X][-X]FX', F: 'FF' } },
  { axiom: 'F', rules: { F: 'F[+FF][-FF]F[-F][+F]F' } },
];

interface Seg { x1: number; y1: number; x2: number; y2: number; depth: number; order: number }

export class LSystemTrees extends Canvas2DAsset {
  private segs: Seg[] = [];
  private total = 0;
  private grown = 0;

  constructor() { super(getMeta('l-system-trees')); }

  protected setup(): void {
    const { depth, angle, decay } = this.params;
    const species = RULES[this.rng.int(0, RULES.length - 1)];
    let s = species.axiom;
    for (let i = 0; i < depth; i++) {
      let out = '';
      for (const ch of s) out += species.rules[ch] ?? ch;
      if (out.length > 60000) break;
      s = out;
    }
    // interpret
    this.segs = [];
    const stack: Array<{ x: number; y: number; a: number; d: number; len: number }> = [];
    let x = this.w / 2, y = this.h - 6, a = -Math.PI / 2, d = 0;
    let len = Math.min(this.h, this.w) * 0.28 * Math.pow(decay, depth - 1) / Math.pow(2, depth - 3);
    len = Math.max(Math.min(len, 22), 2.2);
    const rad = (angle * Math.PI) / 180;
    let order = 0;
    for (const ch of s) {
      if (ch === 'F') {
        const nx = x + Math.cos(a) * len, ny = y + Math.sin(a) * len;
        this.segs.push({ x1: x, y1: y, x2: nx, y2: ny, depth: d, order: order++ });
        x = nx; y = ny;
      } else if (ch === '+') a += rad + this.rng.range(-0.03, 0.03);
      else if (ch === '-') a -= rad + this.rng.range(-0.03, 0.03);
      else if (ch === '[') { stack.push({ x, y, a, d, len }); d++; len *= decay; }
      else if (ch === ']') { const st = stack.pop(); if (st) { x = st.x; y = st.y; a = st.a; d = st.d; len = st.len; } }
      if (this.segs.length > 14000) break;
    }
    this.total = this.segs.length;
    this.grown = 0;
    this.clear();
  }

  protected onParamChange(): void { this.setup(); }

  protected frame(dt: number): void {
    // animate growth by drawing segments in generation order
    const speed = Math.max(this.total / 3.2, 60);
    const until = Math.min(this.grown + speed * dt, this.total);
    // wind sway: redraw fully each frame with slight angular perturbation near tips
    this.clear();
    const ctx = this.ctx;
    const sway = Math.sin(this.time * 0.9) * 0.012 + (this.pointer.active ? (this.pointer.nx - 0.5) * 0.05 : 0);
    for (let i = 0; i < until; i++) {
      const s = this.segs[i];
      const flex = s.depth * s.depth * sway;
      const cx = (s.x1 + s.x2) / 2;
      const dy1 = s.y1 - (this.h - 6), dy2 = s.y2 - (this.h - 6);
      const ox1 = flex * dy1 * -0.06, ox2 = flex * dy2 * -0.06;
      ctx.strokeStyle = s.depth < 2 ? rgba(this.theme.fg, 0.85) : rgba(this.theme.muted, Math.max(0.75 - s.depth * 0.08, 0.3));
      ctx.lineWidth = Math.max(2.6 - s.depth * 0.45, 0.4);
      ctx.beginPath();
      ctx.moveTo(s.x1 + ox1, s.y1);
      ctx.lineTo(s.x2 + ox2, s.y2);
      ctx.stroke();
      // budding tip accent while growing
      if (i > until - 30 && until < this.total) {
        ctx.fillStyle = rgba(this.theme.accent, 0.6);
        ctx.fillRect(s.x2 + ox2 - 1, s.y2 - 1, 2, 2);
      }
      void cx;
    }
    ctx.lineWidth = 1;
    this.grown = until;
  }

  exportSVG(): string {
    const lines = this.segs.map((s) =>
      `<line x1="${s.x1.toFixed(1)}" y1="${s.y1.toFixed(1)}" x2="${s.x2.toFixed(1)}" y2="${s.y2.toFixed(1)}" stroke="${s.depth < 2 ? this.theme.fg : this.theme.muted}" stroke-width="${Math.max(2.6 - s.depth * 0.45, 0.4).toFixed(2)}"/>`,
    ).join('\n  ');
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${this.w} ${this.h}">\n  <rect width="100%" height="100%" fill="${this.theme.bg}"/>\n  ${lines}\n</svg>`;
  }
}

export default LSystemTrees;
