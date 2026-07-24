import { Canvas2DAsset } from "../core/Canvas2DAsset.js";
import { getMeta } from "../core/catalog.js";
import { rgba } from "../utils/color.js";
class AiThinking extends Canvas2DAsset {
  toks = [];
  phase = 0;
  // 0 idle → 1 focusing → release
  phaseT = 0;
  constructor() {
    super(getMeta("ai-thinking"));
  }
  setup() {
    this.toks = [];
    const n = Math.round(this.params.tokens);
    for (let i = 0; i < n; i++) {
      this.toks.push({
        a: this.rng.range(0, Math.PI * 2),
        r0: this.rng.range(0.25, 1),
        r: 0,
        sp: this.rng.range(0.5, 1.5) * this.rng.sign(),
        attend: 0
      });
    }
    this.phase = 0;
    this.phaseT = 0;
  }
  onParamChange(key) {
    if (key === "tokens") this.setup();
  }
  frame(dt) {
    const { tempo, focus } = this.params;
    this.phaseT += dt * tempo;
    const cyc = this.phaseT % 4;
    const gather = cyc < 1.6 ? cyc / 1.6 : cyc < 2.6 ? 1 : Math.max(1 - (cyc - 2.6) / 1.4, 0);
    const R = Math.min(this.w, this.h) * 0.36;
    const cx = this.w / 2, cy = this.h / 2;
    this.clear();
    const ctx = this.ctx;
    const fa = this.pointer.active ? Math.atan2(this.pointer.y - cy, this.pointer.x - cx) : this.time * 0.35;
    for (const tk of this.toks) {
      tk.a += tk.sp * dt * 0.5;
      let diff = tk.a - fa;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      const aligned = Math.exp(-diff * diff * 2.4) * focus;
      tk.attend += (aligned - tk.attend) * dt * 3;
      const pull = gather * tk.attend;
      const targetR = tk.r0 * (1 - pull * 0.78);
      tk.r += (targetR - tk.r) * dt * 4;
      const x = cx + Math.cos(tk.a) * tk.r * R;
      const y = cy + Math.sin(tk.a) * tk.r * R;
      if (tk.attend > 0.4 && gather > 0.2) {
        ctx.strokeStyle = rgba(this.theme.muted, tk.attend * gather * 0.22);
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(x, y);
        ctx.stroke();
      }
      const hot = tk.attend * gather;
      ctx.fillStyle = hot > 0.55 ? rgba(this.theme.accent, 0.4 + hot * 0.6) : rgba(this.theme.fg, 0.3 + tk.attend * 0.4);
      const s = 1.4 + hot * 1.8;
      ctx.fillRect(x - s / 2, y - s / 2, s, s);
    }
    const breath = 5 + Math.sin(this.time * 2 * tempo) * 1.4 + gather * 3.4;
    ctx.strokeStyle = rgba(this.theme.fg, 0.5 + gather * 0.5);
    ctx.strokeRect(cx - breath, cy - breath, breath * 2, breath * 2);
    ctx.fillStyle = rgba(this.theme.accent, gather * 0.85);
    ctx.fillRect(cx - 1.5, cy - 1.5, 3, 3);
  }
}
var ai_thinking_default = AiThinking;
export {
  AiThinking,
  ai_thinking_default as default
};
