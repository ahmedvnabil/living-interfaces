/** Cellular Automata — Life-like rules on a toroidal lattice. */
import { Canvas2DAsset } from '../core/Canvas2DAsset.js';
import { getMeta } from '../core/catalog.js';
import { rgba } from '../utils/color.js';

export class CellularAutomata extends Canvas2DAsset {
  private cols = 0; private rows = 0;
  private cells!: Uint8Array;
  private next!: Uint8Array;
  private age!: Float32Array;
  private acc = 0;

  constructor() { super(getMeta('cellular-automata')); }

  protected setup(): void {
    const cell = this.params.cell;
    this.cols = Math.max(8, Math.floor(this.w / cell));
    this.rows = Math.max(8, Math.floor(this.h / cell));
    const n = this.cols * this.rows;
    this.cells = new Uint8Array(n);
    this.next = new Uint8Array(n);
    this.age = new Float32Array(n);
    for (let i = 0; i < n; i++) this.cells[i] = this.rng.next() < this.params.fill ? 1 : 0;
    this.acc = 0;
  }

  protected onParamChange(key: string): void {
    if (key === 'cell' || key === 'fill') this.setup();
  }

  private generation(): void {
    const { cols, rows, cells, next } = this;
    for (let y = 0; y < rows; y++) {
      const ym = ((y - 1 + rows) % rows) * cols, y0 = y * cols, yp = ((y + 1) % rows) * cols;
      for (let x = 0; x < cols; x++) {
        const xm = (x - 1 + cols) % cols, xp = (x + 1) % cols;
        const n = cells[ym + xm] + cells[ym + x] + cells[ym + xp] + cells[y0 + xm] + cells[y0 + xp] + cells[yp + xm] + cells[yp + x] + cells[yp + xp];
        next[y0 + x] = cells[y0 + x] ? (n === 2 || n === 3 ? 1 : 0) : (n === 3 ? 1 : 0);
      }
    }
    this.cells.set(next);
  }

  protected frame(dt: number): void {
    this.acc += dt * this.params.rate;
    while (this.acc >= 1) { this.acc -= 1; this.generation(); }
    // pointer seeds life
    if (this.pointer.active && this.pointer.down) {
      const cx = Math.floor((this.pointer.x / this.w) * this.cols);
      const cy = Math.floor((this.pointer.y / this.h) * this.rows);
      for (let i = 0; i < 5; i++) {
        const x = (cx + this.rng.int(-2, 2) + this.cols) % this.cols;
        const y = (cy + this.rng.int(-2, 2) + this.rows) % this.rows;
        this.cells[y * this.cols + x] = 1;
      }
    }
    const cw = this.w / this.cols, ch = this.h / this.rows;
    this.clear();
    const ctx = this.ctx;
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        const i = y * this.cols + x;
        if (this.cells[i]) {
          this.age[i] = Math.min(this.age[i] + dt, 4);
          const mature = this.age[i] > 1.4;
          ctx.fillStyle = mature ? rgba(this.theme.fg, 0.85) : rgba(this.theme.accent, 0.9);
          ctx.fillRect(x * cw + 0.5, y * ch + 0.5, cw - 1, ch - 1);
        } else {
          this.age[i] = 0;
        }
      }
    }
  }
}

export default CellularAutomata;
