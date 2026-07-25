import { Metrics } from "./metrics.js";
import { PointerField } from "./pointer.js";
import { Rng, randomSeed } from "../utils/prng.js";
import { DARK, resolveTokens, toTokens } from "../themes/theme.js";
class AssetBase {
  meta;
  container;
  theme = DARK;
  rng = new Rng();
  pointer = new PointerField();
  metrics;
  params = {};
  /** true when prefers-reduced-motion or accessibility mode is on */
  reducedMotion = false;
  running = false;
  initialized = false;
  time = 0;
  raf = 0;
  io = null;
  ro = null;
  sampler = 0;
  opts = {};
  pausedByViewport = false;
  pausedByUser = false;
  constructor(meta) {
    this.meta = meta;
    this.metrics = new Metrics(meta.renderer);
    for (const p of meta.params) this.params[p.key] = p.value;
  }
  // ---- lifecycle ---------------------------------------------------------
  init(container, options = {}) {
    if (this.initialized) this.destroy();
    this.opts = options;
    this.container = container;
    this.rng = new Rng(options.seed ?? randomSeed());
    if (options.params) Object.assign(this.params, options.params);
    this.theme = options.theme ? toTokens(options.theme) : resolveTokens(container);
    const mq = matchMedia("(prefers-reduced-motion: reduce)");
    this.reducedMotion = (options.accessibility ?? true) && mq.matches;
    this.createSurface();
    this.pointer.attach(container);
    this.ro = new ResizeObserver(() => this.resize());
    this.ro.observe(container);
    if (options.autoPause ?? true) {
      this.io = new IntersectionObserver((entries) => {
        const visible = entries.some((e) => e.isIntersecting);
        this.pausedByViewport = !visible;
        this.applyRunState();
      }, { threshold: 0.02 });
      this.io.observe(container);
    }
    this.initialized = true;
    this.resize();
    this.setup();
    this.running = true;
    this.applyRunState();
    if (this.reducedMotion) {
      this.frame(1 / 60);
      this.pausedByUser = true;
      this.applyRunState();
    }
  }
  destroy() {
    if (!this.initialized) return;
    this.stopLoop();
    this.io?.disconnect();
    this.io = null;
    this.ro?.disconnect();
    this.ro = null;
    this.pointer.detach();
    this.destroySurface();
    this.metrics.reset();
    this.initialized = false;
    this.running = false;
    this.time = 0;
  }
  pause() {
    this.pausedByUser = true;
    this.applyRunState();
  }
  resume() {
    this.pausedByUser = false;
    this.applyRunState();
  }
  get paused() {
    return this.pausedByUser;
  }
  resize() {
    if (!this.initialized) return;
    this.onResize();
    this.metrics.setPixels(this.container.offsetWidth, this.container.offsetHeight, this.dpr());
  }
  setTheme(theme) {
    this.theme = toTokens(theme);
    if (this.initialized && (this.pausedByUser || this.reducedMotion)) this.frame(0);
  }
  /** Live-data entry point; modules override to consume feeds. */
  setData(_data) {
  }
  // ---- controls ----------------------------------------------------------
  reset() {
    if (!this.initialized) return;
    this.rng = new Rng(this.rng.seed);
    this.time = 0;
    this.setup();
    if (this.pausedByUser) this.frame(0);
  }
  regenerate(seed = randomSeed()) {
    if (!this.initialized) return;
    this.rng = new Rng(seed);
    this.time = 0;
    this.setup();
    if (this.pausedByUser) this.frame(0);
  }
  /** Advance exactly one frame with a fixed timestep while paused — the
   *  offline-rendering entry point. Deterministic given seed + call sequence. */
  renderFrame(dt) {
    if (!this.initialized) return;
    this.time += dt;
    this.frame(dt);
  }
  setParam(key, value) {
    this.params[key] = value;
    this.onParamChange(key, value);
    if (this.initialized && this.pausedByUser) this.frame(0);
  }
  /** Override when a param needs a rebuild rather than live pickup. */
  onParamChange(_key, _value) {
  }
  paramDefs() {
    return this.meta.params.map((p) => ({ ...p, value: this.params[p.key] ?? p.value }));
  }
  getMetrics() {
    return this.metrics.snapshot();
  }
  // ---- export ------------------------------------------------------------
  async exportPNG(filename = `${this.meta.id}-${this.rng.seed}.png`) {
    const canvas = this.exportCanvas();
    if (!canvas) return;
    const blob = await new Promise((res) => canvas.toBlob(res, "image/png"));
    if (blob) downloadBlob(blob, filename);
  }
  /** SVG-native modules override. */
  exportSVG() {
    return null;
  }
  async downloadSVG(filename = `${this.meta.id}-${this.rng.seed}.svg`) {
    const svg = this.exportSVG();
    if (svg) downloadBlob(new Blob([svg], { type: "image/svg+xml" }), filename);
  }
  // ---- internals ---------------------------------------------------------
  dpr() {
    return Math.min(devicePixelRatio || 1, this.opts.maxDpr ?? 2);
  }
  applyRunState() {
    const shouldRun = this.initialized && !this.pausedByUser && !this.pausedByViewport;
    if (shouldRun && !this.raf) this.startLoop();
    else if (!shouldRun && this.raf) this.stopLoop();
  }
  startLoop() {
    const loop = (now) => {
      this.raf = requestAnimationFrame(loop);
      const dt = this.metrics.tick(now);
      this.time += dt;
      this.pointer.tick();
      this.frame(dt);
    };
    this.raf = requestAnimationFrame(loop);
    this.sampler = window.setInterval(() => this.metrics.sample(), 500);
  }
  stopLoop() {
    if (this.raf) cancelAnimationFrame(this.raf);
    if (this.sampler) clearInterval(this.sampler);
    this.raf = 0;
    this.sampler = 0;
    this.metrics.interrupt();
  }
}
function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 4e3);
}
export {
  AssetBase,
  downloadBlob
};
