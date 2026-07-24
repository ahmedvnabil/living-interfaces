import { Canvas2DAsset } from "../core/Canvas2DAsset.js";
import { getMeta } from "../core/catalog.js";
import { rgba } from "../utils/color.js";
class CursorPhysics extends Canvas2DAsset {
  bodiesArr = [];
  constructor() {
    super(getMeta("cursor-physics"));
  }
  setup() {
    this.bodiesArr = [];
    const n = Math.round(this.params.bodies);
    for (let i = 0; i < n; i++) {
      this.bodiesArr.push({
        x: this.w / 2 + this.rng.range(-40, 40),
        y: this.h / 2 + this.rng.range(-40, 40),
        vx: 0,
        vy: 0,
        r: this.rng.range(3, 9)
      });
    }
  }
  onParamChange(key) {
    if (key === "bodies") this.setup();
  }
  frame(dt) {
    const { stiffness, damping } = this.params;
    const tx = this.pointer.active ? this.pointer.x : this.w / 2 + Math.cos(this.time * 0.6) * this.w * 0.22;
    const ty = this.pointer.active ? this.pointer.y : this.h / 2 + Math.sin(this.time * 0.45) * this.h * 0.22;
    const bodies = this.bodiesArr;
    for (const b of bodies) {
      b.vx += (tx - b.x) * stiffness * dt * 60;
      b.vy += (ty - b.y) * stiffness * dt * 60;
      b.vx *= damping;
      b.vy *= damping;
    }
    for (let i = 0; i < bodies.length; i++) {
      for (let j = i + 1; j < bodies.length; j++) {
        const a = bodies[i], c = bodies[j];
        const dx = c.x - a.x, dy = c.y - a.y;
        const d = Math.hypot(dx, dy) || 1;
        const min = a.r + c.r + 2;
        if (d < min) {
          const push = (min - d) * 0.18;
          const nx = dx / d, ny = dy / d;
          a.vx -= nx * push;
          a.vy -= ny * push;
          c.vx += nx * push;
          c.vy += ny * push;
        }
      }
    }
    for (const b of bodies) {
      b.x += b.vx * dt * 60 * 0.4;
      b.y += b.vy * dt * 60 * 0.4;
    }
    this.fade(0.22);
    const ctx = this.ctx;
    for (let i = 0; i < bodies.length; i++) {
      for (let j = i + 1; j < bodies.length; j++) {
        const a = bodies[i], c = bodies[j];
        const d = Math.hypot(c.x - a.x, c.y - a.y);
        if (d < 70) {
          ctx.strokeStyle = rgba(this.theme.muted, (1 - d / 70) * 0.3);
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(c.x, c.y);
          ctx.stroke();
        }
      }
    }
    bodies.forEach((b, i) => {
      const speed = Math.hypot(b.vx, b.vy);
      const strained = speed > 6;
      ctx.strokeStyle = strained ? rgba(this.theme.accent, 0.9) : rgba(this.theme.fg, 0.75);
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.stroke();
      if (i === 0) {
        ctx.fillStyle = rgba(this.theme.accent, 0.9);
        ctx.fillRect(b.x - 1.5, b.y - 1.5, 3, 3);
      }
    });
    ctx.strokeStyle = rgba(this.theme.muted, 0.5);
    ctx.beginPath();
    ctx.moveTo(tx - 6, ty);
    ctx.lineTo(tx + 6, ty);
    ctx.moveTo(tx, ty - 6);
    ctx.lineTo(tx, ty + 6);
    ctx.stroke();
  }
}
var cursor_physics_default = CursorPhysics;
export {
  CursorPhysics,
  cursor_physics_default as default
};
