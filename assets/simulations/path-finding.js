import { Canvas2DAsset } from "../core/Canvas2DAsset.js";
import { getMeta } from "../core/catalog.js";
import { rgba } from "../utils/color.js";
class PathFinding extends Canvas2DAsset {
  cols = 0;
  rows = 0;
  grid = [];
  open = [];
  start = 0;
  goal = 0;
  path = [];
  done = false;
  restTimer = 0;
  constructor() {
    super(getMeta("path-finding"));
  }
  setup() {
    const cell = this.params.cell;
    this.cols = Math.max(10, Math.floor(this.w / cell));
    this.rows = Math.max(10, Math.floor(this.h / cell));
    this.grid = [];
    for (let i = 0; i < this.cols * this.rows; i++) {
      this.grid.push({ wall: this.rng.next() < this.params.walls, g: Infinity, f: Infinity, parent: -1, state: 0 });
    }
    this.start = this.rng.int(0, this.rows - 1) * this.cols;
    this.goal = this.rng.int(0, this.rows - 1) * this.cols + this.cols - 1;
    this.grid[this.start].wall = false;
    this.grid[this.goal].wall = false;
    this.grid[this.start].g = 0;
    this.grid[this.start].f = this.hCost(this.start);
    this.open = [this.start];
    this.path = [];
    this.done = false;
    this.restTimer = 0;
  }
  onParamChange(key) {
    if (key !== "speed") this.setup();
  }
  hCost(i) {
    const x1 = i % this.cols, y1 = Math.floor(i / this.cols);
    const x2 = this.goal % this.cols, y2 = Math.floor(this.goal / this.cols);
    return Math.abs(x1 - x2) + Math.abs(y1 - y2);
  }
  expand() {
    if (this.open.length === 0) {
      this.done = true;
      this.restTimer = 1.6;
      return;
    }
    let bi = 0;
    for (let i = 1; i < this.open.length; i++) if (this.grid[this.open[i]].f < this.grid[this.open[bi]].f) bi = i;
    const cur = this.open.splice(bi, 1)[0];
    this.grid[cur].state = 2;
    if (cur === this.goal) {
      let n = cur;
      while (n !== -1) {
        this.path.push(n);
        n = this.grid[n].parent;
      }
      this.done = true;
      this.restTimer = 2.4;
      return;
    }
    const x = cur % this.cols, y = Math.floor(cur / this.cols);
    const neigh = [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]];
    for (const [nx, ny] of neigh) {
      if (nx < 0 || ny < 0 || nx >= this.cols || ny >= this.rows) continue;
      const ni = ny * this.cols + nx;
      const c = this.grid[ni];
      if (c.wall || c.state === 2) continue;
      const g = this.grid[cur].g + 1;
      if (g < c.g) {
        c.g = g;
        c.f = g + this.hCost(ni);
        c.parent = cur;
        if (c.state !== 1) {
          c.state = 1;
          this.open.push(ni);
        }
      }
    }
  }
  frame(dt) {
    if (!this.done) {
      const steps = Math.max(1, Math.round(this.params.speed));
      for (let s = 0; s < steps && !this.done; s++) this.expand();
    } else {
      this.restTimer -= dt;
      if (this.restTimer <= 0) this.regenerate();
    }
    const cw = this.w / this.cols, ch = this.h / this.rows;
    this.clear();
    const ctx = this.ctx;
    for (let i = 0; i < this.grid.length; i++) {
      const c = this.grid[i];
      const x = i % this.cols * cw, y = Math.floor(i / this.cols) * ch;
      if (c.wall) {
        ctx.fillStyle = rgba(this.theme.faint, 1);
        ctx.fillRect(x + 0.5, y + 0.5, cw - 1, ch - 1);
      } else if (c.state === 2) {
        ctx.fillStyle = rgba(this.theme.muted, 0.22);
        ctx.fillRect(x + 1, y + 1, cw - 2, ch - 2);
      } else if (c.state === 1) {
        ctx.fillStyle = rgba(this.theme.fg, 0.3);
        ctx.fillRect(x + 1, y + 1, cw - 2, ch - 2);
      }
    }
    if (this.path.length > 1) {
      ctx.strokeStyle = rgba(this.theme.accent, 0.95);
      ctx.lineWidth = 2;
      ctx.beginPath();
      this.path.forEach((i, k) => {
        const x = i % this.cols * cw + cw / 2, y = Math.floor(i / this.cols) * ch + ch / 2;
        k === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      });
      ctx.stroke();
      ctx.lineWidth = 1;
    }
    const sx = this.start % this.cols * cw, sy = Math.floor(this.start / this.cols) * ch;
    const gx = this.goal % this.cols * cw, gy = Math.floor(this.goal / this.cols) * ch;
    ctx.fillStyle = rgba(this.theme.fg, 1);
    ctx.fillRect(sx + 1, sy + 1, cw - 2, ch - 2);
    ctx.fillStyle = rgba(this.theme.accent, 1);
    ctx.fillRect(gx + 1, gy + 1, cw - 2, ch - 2);
  }
}
var path_finding_default = PathFinding;
export {
  PathFinding,
  path_finding_default as default
};
