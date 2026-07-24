const HISTORY = 60;
class Metrics {
  times = [];
  fpsHistory = [];
  last = 0;
  tier;
  pixels = 0;
  constructor(tier) {
    this.tier = tier;
  }
  setPixels(w, h, dpr) {
    this.pixels = w * h * dpr * dpr;
  }
  tick(now) {
    const dt = this.last > 0 ? now - this.last : 16.7;
    this.last = now;
    this.times.push(dt);
    if (this.times.length > 30) this.times.shift();
    return Math.min(dt, 100) / 1e3;
  }
  sample() {
    const fps = this.fps();
    this.fpsHistory.push(fps);
    if (this.fpsHistory.length > HISTORY) this.fpsHistory.shift();
  }
  fps() {
    if (this.times.length === 0) return 0;
    const avg = this.times.reduce((a, b) => a + b, 0) / this.times.length;
    return avg > 0 ? Math.round(1e3 / avg) : 0;
  }
  snapshot() {
    const perf = performance;
    const heapMB = perf.memory ? +(perf.memory.usedJSHeapSize / 1048576).toFixed(1) : null;
    const mp = this.pixels / 1e6;
    const gpuEstimate = this.tier === "webgl" ? mp > 2 ? "high" : "medium" : this.tier === "canvas2d" ? mp > 4 ? "medium" : "low" : "low";
    return { fps: this.fps(), frameMs: +(this.times.at(-1) ?? 0).toFixed(1), heapMB, gpuEstimate, history: [...this.fpsHistory] };
  }
  /** Call when the loop stops so the resume delta doesn't poison the average. */
  interrupt() {
    this.last = 0;
    this.times = [];
  }
  reset() {
    this.times = [];
    this.fpsHistory = [];
    this.last = 0;
  }
}
export {
  Metrics
};
