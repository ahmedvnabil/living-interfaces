import { Canvas2DAsset } from "../core/Canvas2DAsset.js";
import { getMeta } from "../core/catalog.js";
import { rgba } from "../utils/color.js";
import { Noise } from "../utils/noise.js";
class LivingBackground extends Canvas2DAsset {
  noise;
  motesArr = [];
  constructor() {
    super(getMeta("living-background"));
  }
  setup() {
    this.noise = new Noise(this.rng.seed);
    this.motesArr = [];
    for (let i = 0; i < this.params.motes; i++) this.motesArr.push(this.spawn());
  }
  spawn() {
    return { x: this.rng.range(0, this.w), y: this.rng.range(0, this.h), z: this.rng.range(0.3, 1), ph: this.rng.range(0, Math.PI * 2) };
  }
  frame(dt) {
    const n = Math.round(this.params.motes);
    while (this.motesArr.length < n) this.motesArr.push(this.spawn());
    if (this.motesArr.length > n) this.motesArr.length = n;
    const { breathe, presence } = this.params;
    this.clear();
    const ctx = this.ctx;
    const rows = 7;
    for (let r = 0; r < rows; r++) {
      const baseY = (r + 0.5) / rows * this.h;
      ctx.strokeStyle = rgba(this.theme.faint, 0.8);
      ctx.beginPath();
      for (let x = 0; x <= this.w; x += 8) {
        const y = baseY + this.noise.noise3(x * 3e-3, r * 3.7, this.time * breathe) * 26;
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    for (const m of this.motesArr) {
      const [u, v] = this.noise.curl2(m.x * 2e-3, m.y * 2e-3, this.time * breathe * 0.6);
      m.x += u * 9 * m.z * dt;
      m.y += (v * 9 * m.z - 2 * m.z) * dt;
      if (this.pointer.active) {
        const dx = m.x - this.pointer.x, dy = m.y - this.pointer.y;
        const d = Math.hypot(dx, dy);
        if (d < 100 && d > 1) {
          m.x += dx / d * (1 - d / 100) * 24 * dt;
          m.y += dy / d * (1 - d / 100) * 24 * dt;
        }
      }
      if (m.y < -4) {
        m.y = this.h + 4;
        m.x = this.rng.range(0, this.w);
      }
      if (m.x < -4) m.x = this.w + 4;
      if (m.x > this.w + 4) m.x = -4;
      const tw = 0.55 + Math.sin(this.time * 1.1 + m.ph) * 0.45;
      const rare = m.ph < 0.35;
      ctx.fillStyle = rare ? rgba(this.theme.accent, presence * tw * 1.6) : rgba(this.theme.fg, presence * tw * m.z);
      const s = 1 + m.z * 1.2;
      ctx.fillRect(m.x - s / 2, m.y - s / 2, s, s);
    }
  }
}
var living_background_default = LivingBackground;
export {
  LivingBackground,
  living_background_default as default
};
