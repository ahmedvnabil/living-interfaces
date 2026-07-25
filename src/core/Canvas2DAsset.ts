/** Base for Canvas2D-rendered assets: surface creation, DPR scaling, clear. */
import { AssetBase } from './AssetBase.js';

export abstract class Canvas2DAsset extends AssetBase {
  canvas!: HTMLCanvasElement;
  ctx!: CanvasRenderingContext2D;
  /** CSS-pixel dimensions — draw in these units, DPR is pre-applied. */
  w = 0;
  h = 0;

  protected createSurface(): void {
    this.canvas = document.createElement('canvas');
    this.canvas.style.cssText = 'display:block;width:100%;height:100%;';
    this.container.appendChild(this.canvas);
    const ctx = this.canvas.getContext('2d');
    if (!ctx) throw new Error(`[${this.meta.id}] Canvas2D context unavailable`);
    this.ctx = ctx;
  }

  protected destroySurface(): void {
    this.canvas.remove();
  }

  protected onResize(): void {
    // offsetWidth/Height = layout size, immune to CSS transforms (Studio scales
    // the stage visually while the canvas renders at full export resolution)
    const dpr = this.dpr();
    this.w = Math.max(1, this.container.offsetWidth);
    this.h = Math.max(1, this.container.offsetHeight);
    this.canvas.width = Math.round(this.w * dpr);
    this.canvas.height = Math.round(this.h * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  /** Solid clear in theme background. */
  protected clear(): void {
    this.ctx.fillStyle = this.theme.bg;
    this.ctx.fillRect(0, 0, this.w, this.h);
  }

  /** Translucent clear — leaves motion trails. */
  protected fade(alpha: number): void {
    this.ctx.globalAlpha = alpha;
    this.ctx.fillStyle = this.theme.bg;
    this.ctx.fillRect(0, 0, this.w, this.h);
    this.ctx.globalAlpha = 1;
  }

  exportCanvas(): HTMLCanvasElement | null {
    return this.canvas ?? null;
  }
}
