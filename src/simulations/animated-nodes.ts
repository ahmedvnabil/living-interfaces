/** Animated Nodes — drifting constellation with proximity linking. */
import { Canvas2DAsset } from '../core/Canvas2DAsset.js';
import { getMeta } from '../core/catalog.js';
import { rgba } from '../utils/color.js';

interface N { x: number; y: number; vx: number; vy: number }

export class AnimatedNodes extends Canvas2DAsset {
  private nodesArr: N[] = [];

  constructor() { super(getMeta('animated-nodes')); }

  protected setup(): void {
    this.nodesArr = [];
    for (let i = 0; i < this.params.count; i++) this.nodesArr.push(this.spawn());
  }

  private spawn(): N {
    const a = this.rng.range(0, Math.PI * 2);
    const sp = this.rng.range(0.1, 1);
    return { x: this.rng.range(0, this.w), y: this.rng.range(0, this.h), vx: Math.cos(a) * sp, vy: Math.sin(a) * sp };
  }

  protected frame(dt: number): void {
    const n = Math.round(this.params.count);
    while (this.nodesArr.length < n) this.nodesArr.push(this.spawn());
    if (this.nodesArr.length > n) this.nodesArr.length = n;
    const { radius, speed } = this.params;
    for (const nd of this.nodesArr) {
      nd.x += nd.vx * speed * dt * 60;
      nd.y += nd.vy * speed * dt * 60;
      if (nd.x < 0 || nd.x > this.w) nd.vx *= -1;
      if (nd.y < 0 || nd.y > this.h) nd.vy *= -1;
      nd.x = Math.max(0, Math.min(this.w, nd.x));
      nd.y = Math.max(0, Math.min(this.h, nd.y));
    }
    this.clear();
    const ctx = this.ctx;
    const pts: Array<{ x: number; y: number }> = this.pointer.active
      ? [...this.nodesArr, { x: this.pointer.x, y: this.pointer.y }]
      : this.nodesArr;
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
        const d2 = dx * dx + dy * dy;
        if (d2 < radius * radius) {
          const k = 1 - Math.sqrt(d2) / radius;
          const isPtr = j === pts.length - 1 && this.pointer.active;
          ctx.strokeStyle = isPtr ? rgba(this.theme.accent, k * 0.55) : rgba(this.theme.fg, k * 0.22);
          ctx.beginPath();
          ctx.moveTo(pts[i].x, pts[i].y);
          ctx.lineTo(pts[j].x, pts[j].y);
          ctx.stroke();
        }
      }
    }
    ctx.fillStyle = rgba(this.theme.fg, 0.8);
    for (const nd of this.nodesArr) ctx.fillRect(nd.x - 1, nd.y - 1, 2, 2);
  }
}

export default AnimatedNodes;
