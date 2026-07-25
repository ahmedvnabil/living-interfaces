import { AssetBase } from "./AssetBase.js";
class Canvas2DAsset extends AssetBase {
  canvas;
  ctx;
  /** CSS-pixel dimensions — draw in these units, DPR is pre-applied. */
  w = 0;
  h = 0;
  createSurface() {
    this.canvas = document.createElement("canvas");
    this.canvas.style.cssText = "display:block;width:100%;height:100%;";
    this.container.appendChild(this.canvas);
    const ctx = this.canvas.getContext("2d");
    if (!ctx) throw new Error(`[${this.meta.id}] Canvas2D context unavailable`);
    this.ctx = ctx;
  }
  destroySurface() {
    this.canvas.remove();
  }
  onResize() {
    const dpr = this.dpr();
    this.w = Math.max(1, this.container.offsetWidth);
    this.h = Math.max(1, this.container.offsetHeight);
    this.canvas.width = Math.round(this.w * dpr);
    this.canvas.height = Math.round(this.h * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  /** Solid clear in theme background. */
  clear() {
    this.ctx.fillStyle = this.theme.bg;
    this.ctx.fillRect(0, 0, this.w, this.h);
  }
  /** Translucent clear — leaves motion trails. */
  fade(alpha) {
    this.ctx.globalAlpha = alpha;
    this.ctx.fillStyle = this.theme.bg;
    this.ctx.fillRect(0, 0, this.w, this.h);
    this.ctx.globalAlpha = 1;
  }
  exportCanvas() {
    return this.canvas ?? null;
  }
}
export {
  Canvas2DAsset
};
