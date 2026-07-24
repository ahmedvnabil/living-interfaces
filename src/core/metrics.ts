/** Frame metrics: FPS, frame time, heap, coarse GPU-load estimate. */
import type { MetricsSnapshot, RendererTier } from './types.js';

const HISTORY = 60;

export class Metrics {
  private times: number[] = [];
  private fpsHistory: number[] = [];
  private last = 0;
  private tier: RendererTier;
  private pixels = 0;

  constructor(tier: RendererTier) {
    this.tier = tier;
  }

  setPixels(w: number, h: number, dpr: number): void {
    this.pixels = w * h * dpr * dpr;
  }

  tick(now: number): number {
    const dt = this.last > 0 ? now - this.last : 16.7;
    this.last = now;
    this.times.push(dt);
    if (this.times.length > 30) this.times.shift();
    return Math.min(dt, 100) / 1000; // clamped seconds
  }

  sample(): void {
    const fps = this.fps();
    this.fpsHistory.push(fps);
    if (this.fpsHistory.length > HISTORY) this.fpsHistory.shift();
  }

  fps(): number {
    if (this.times.length === 0) return 0;
    const avg = this.times.reduce((a, b) => a + b, 0) / this.times.length;
    return avg > 0 ? Math.round(1000 / avg) : 0;
  }

  snapshot(): MetricsSnapshot {
    const perf = performance as Performance & { memory?: { usedJSHeapSize: number } };
    const heapMB = perf.memory ? +(perf.memory.usedJSHeapSize / 1048576).toFixed(1) : null;
    const mp = this.pixels / 1e6;
    const gpuEstimate =
      this.tier === 'webgl' ? (mp > 2 ? 'high' : 'medium')
      : this.tier === 'canvas2d' ? (mp > 4 ? 'medium' : 'low')
      : 'low';
    return { fps: this.fps(), frameMs: +(this.times.at(-1) ?? 0).toFixed(1), heapMB, gpuEstimate, history: [...this.fpsHistory] };
  }

  reset(): void {
    this.times = [];
    this.fpsHistory = [];
    this.last = 0;
  }
}
