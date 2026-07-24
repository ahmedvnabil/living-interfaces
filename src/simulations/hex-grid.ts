/** Hex Grid — axial hexagonal lattice with propagating activity waves. */
import { Canvas2DAsset } from '../core/Canvas2DAsset.js';
import { getMeta } from '../core/catalog.js';
import { rgba } from '../utils/color.js';

interface Wave { x: number; y: number; t0: number }

export class HexGrid extends Canvas2DAsset {
  private waves: Wave[] = [];
  private nextWave = 0;
  private lastCells: Array<[number, number, number]> = [];

  constructor() { super(getMeta('hex-grid')); }

  protected setup(): void {
    this.waves = [];
    this.nextWave = 0;
  }

  protected frame(_dt: number): void {
    const { size, waves, falloff } = this.params;
    if (this.time > this.nextWave) {
      this.waves.push({ x: this.rng.range(0, this.w), y: this.rng.range(0, this.h), t0: this.time });
      this.nextWave = this.time + 1 / waves;
      if (this.waves.length > 6) this.waves.shift();
    }
    this.clear();
    const ctx = this.ctx;
    const r = size;
    const hexH = r * Math.sqrt(3);
    this.lastCells = [];
    for (let row = 0, y = 0; y < this.h + hexH; y += hexH / 2, row++) {
      const offset = (row % 2) * r * 1.5;
      for (let x = offset; x < this.w + r; x += r * 3) {
        let act = 0;
        for (const wv of this.waves) {
          const age = this.time - wv.t0;
          const radius = age * 120;
          const d = Math.hypot(x - wv.x, y - wv.y);
          const band = Math.abs(d - radius);
          if (band < 60) act += Math.exp(-band * band / (2 * (26 / falloff) ** 2)) * Math.exp(-age * 0.5);
        }
        if (this.pointer.active) {
          const d = Math.hypot(x - this.pointer.x, y - this.pointer.y);
          if (d < 90) act += (1 - d / 90) * 0.9;
        }
        act = Math.min(act, 1);
        this.lastCells.push([x, y, act]);
        this.hex(ctx, x, y, r * 0.92, act);
      }
    }
  }

  private hex(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, act: number): void {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = (Math.PI / 3) * i;
      const px = cx + Math.cos(a) * r, py = cy + Math.sin(a) * r;
      i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
    ctx.closePath();
    if (act > 0.03) {
      ctx.fillStyle = act > 0.75 ? rgba(this.theme.accent, act * 0.35) : rgba(this.theme.fg, act * 0.22);
      ctx.fill();
    }
    ctx.strokeStyle = rgba(this.theme.faint, 1);
    ctx.stroke();
  }

  exportSVG(): string {
    const cells = this.lastCells.map(([x, y, act]) => {
      const pts: string[] = [];
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI / 3) * i;
        pts.push(`${(x + Math.cos(a) * this.params.size * 0.92).toFixed(1)},${(y + Math.sin(a) * this.params.size * 0.92).toFixed(1)}`);
      }
      const fill = act > 0.03 ? ` fill="${act > 0.75 ? this.theme.accent : this.theme.fg}" fill-opacity="${(act * 0.3).toFixed(2)}"` : ' fill="none"';
      return `<polygon points="${pts.join(' ')}"${fill} stroke="${this.theme.faint}"/>`;
    }).join('\n  ');
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${this.w} ${this.h}">\n  <rect width="100%" height="100%" fill="${this.theme.bg}"/>\n  ${cells}\n</svg>`;
  }
}

export default HexGrid;
