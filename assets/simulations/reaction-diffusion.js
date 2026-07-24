import { AssetBase } from "../core/AssetBase.js";
import { getMeta } from "../core/catalog.js";
import { hexToRgb } from "../utils/color.js";
import { RD_SIZE, createState, step, render } from "../workers/gray-scott.js";
class ReactionDiffusion extends AssetBase {
  simCanvas;
  // fixed sim resolution, CSS-upscaled
  worker = null;
  state = null;
  // fallback path
  fallbackCtx = null;
  img = null;
  constructor() {
    super(getMeta("reaction-diffusion"));
  }
  rdTheme() {
    const c = (h) => {
      const { r, g, b } = hexToRgb(h);
      return [r, g, b];
    };
    return { bg: c(this.theme.bg), fg: c(this.theme.fg), accent: c(this.theme.accent) };
  }
  createSurface() {
    this.simCanvas = document.createElement("canvas");
    this.simCanvas.style.cssText = "display:block;width:100%;height:100%;image-rendering:auto;";
    this.container.appendChild(this.simCanvas);
    if ("transferControlToOffscreen" in this.simCanvas && typeof Worker !== "undefined") {
      try {
        const off = this.simCanvas.transferControlToOffscreen();
        this.worker = new Worker(new URL("../workers/rd-worker.js", import.meta.url), { type: "module" });
        this.worker.postMessage({ type: "init", canvas: off, seed: this.rng.seed }, [off]);
        this.worker.postMessage({ type: "theme", theme: this.rdTheme() });
        return;
      } catch {
        this.worker?.terminate();
        this.worker = null;
      }
    }
    this.simCanvas.width = RD_SIZE;
    this.simCanvas.height = RD_SIZE;
    this.fallbackCtx = this.simCanvas.getContext("2d");
    this.img = this.fallbackCtx.createImageData(RD_SIZE, RD_SIZE);
  }
  destroySurface() {
    this.worker?.terminate();
    this.worker = null;
    this.simCanvas.remove();
    this.state = null;
    this.fallbackCtx = null;
  }
  setup() {
    if (this.worker) {
      this.worker.postMessage({ type: "reset", seed: this.rng.seed });
      this.worker.postMessage({ type: "theme", theme: this.rdTheme() });
    } else {
      const r = this.rng;
      this.state = createState(() => r.next());
    }
  }
  onResize() {
  }
  setTheme(theme) {
    super.setTheme(theme);
    this.worker?.postMessage({ type: "theme", theme: this.rdTheme() });
  }
  frame(_dt) {
    const { feed, kill, steps } = this.params;
    const poke = this.pointer.active && this.pointer.down ? { x: this.pointer.nx, y: this.pointer.ny } : this.pointer.active ? { x: this.pointer.nx, y: this.pointer.ny } : void 0;
    if (this.worker) {
      this.worker.postMessage({ type: "step", feed, kill, steps: Math.round(steps), poke });
    } else if (this.state && this.fallbackCtx && this.img) {
      step(this.state, feed, kill, Math.round(steps), poke);
      render(this.state, this.img, this.rdTheme());
      this.fallbackCtx.putImageData(this.img, 0, 0);
    }
  }
  exportCanvas() {
    const snap = document.createElement("canvas");
    snap.width = this.simCanvas.width || RD_SIZE;
    snap.height = this.simCanvas.height || RD_SIZE;
    snap.getContext("2d")?.drawImage(this.simCanvas, 0, 0);
    return snap;
  }
}
var reaction_diffusion_default = ReactionDiffusion;
export {
  ReactionDiffusion,
  reaction_diffusion_default as default
};
