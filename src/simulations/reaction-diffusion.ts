/** Reaction–Diffusion — Gray–Scott, computed in a Web Worker on an
 *  OffscreenCanvas when available; main-thread fallback otherwise. */
import { AssetBase } from '../core/AssetBase.js';
import { getMeta } from '../core/catalog.js';
import { hexToRgb } from '../utils/color.js';
import { RD_SIZE, createState, step, render, type RdState, type RdTheme } from '../workers/gray-scott.js';

export class ReactionDiffusion extends AssetBase {
  private simCanvas!: HTMLCanvasElement;   // fixed sim resolution, CSS-upscaled
  private worker: Worker | null = null;
  private state: RdState | null = null;    // fallback path
  private fallbackCtx: CanvasRenderingContext2D | null = null;
  private img: ImageData | null = null;

  constructor() { super(getMeta('reaction-diffusion')); }

  private rdTheme(): RdTheme {
    const c = (h: string): [number, number, number] => {
      const { r, g, b } = hexToRgb(h);
      return [r, g, b];
    };
    return { bg: c(this.theme.bg), fg: c(this.theme.fg), accent: c(this.theme.accent) };
  }

  protected createSurface(): void {
    this.simCanvas = document.createElement('canvas');
    this.simCanvas.style.cssText = 'display:block;width:100%;height:100%;image-rendering:auto;';
    this.container.appendChild(this.simCanvas);
    if ('transferControlToOffscreen' in this.simCanvas && typeof Worker !== 'undefined') {
      try {
        const off = this.simCanvas.transferControlToOffscreen();
        this.worker = new Worker(new URL('../workers/rd-worker.js', import.meta.url), { type: 'module' });
        this.worker.postMessage({ type: 'init', canvas: off, seed: this.rng.seed }, [off]);
        this.worker.postMessage({ type: 'theme', theme: this.rdTheme() });
        return;
      } catch {
        this.worker?.terminate();
        this.worker = null;
      }
    }
    this.simCanvas.width = RD_SIZE;
    this.simCanvas.height = RD_SIZE;
    this.fallbackCtx = this.simCanvas.getContext('2d');
    this.img = this.fallbackCtx!.createImageData(RD_SIZE, RD_SIZE);
  }

  protected destroySurface(): void {
    this.worker?.terminate();
    this.worker = null;
    this.simCanvas.remove();
    this.state = null;
    this.fallbackCtx = null;
  }

  protected setup(): void {
    if (this.worker) {
      this.worker.postMessage({ type: 'reset', seed: this.rng.seed });
      this.worker.postMessage({ type: 'theme', theme: this.rdTheme() });
    } else {
      const r = this.rng;
      this.state = createState(() => r.next());
    }
  }

  protected onResize(): void { /* fixed sim resolution; CSS scales */ }

  setTheme(theme: Parameters<AssetBase['setTheme']>[0]): void {
    super.setTheme(theme);
    this.worker?.postMessage({ type: 'theme', theme: this.rdTheme() });
  }

  protected frame(_dt: number): void {
    const { feed, kill, steps } = this.params;
    const poke = this.pointer.active && this.pointer.down
      ? { x: this.pointer.nx, y: this.pointer.ny }
      : this.pointer.active ? { x: this.pointer.nx, y: this.pointer.ny } : undefined;
    if (this.worker) {
      this.worker.postMessage({ type: 'step', feed, kill, steps: Math.round(steps), poke });
    } else if (this.state && this.fallbackCtx && this.img) {
      step(this.state, feed, kill, Math.round(steps), poke);
      render(this.state, this.img, this.rdTheme());
      this.fallbackCtx.putImageData(this.img, 0, 0);
    }
  }

  exportCanvas(): HTMLCanvasElement | null {
    // Worker-driven canvases can't be read back directly; draw a snapshot copy.
    const snap = document.createElement('canvas');
    snap.width = this.simCanvas.width || RD_SIZE;
    snap.height = this.simCanvas.height || RD_SIZE;
    snap.getContext('2d')?.drawImage(this.simCanvas, 0, 0);
    return snap;
  }
}

export default ReactionDiffusion;
