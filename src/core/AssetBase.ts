/** Abstract base for every Living Asset. Owns the lifecycle so modules only
 *  implement setup() and frame(). */
import type { AssetOptions, LivingAsset, MetricsSnapshot, ModuleMeta, ParamDef, ThemeName, ThemeTokens } from './types.js';
import { Metrics } from './metrics.js';
import { PointerField } from './pointer.js';
import { Rng, randomSeed } from '../utils/prng.js';
import { DARK, resolveTokens, toTokens } from '../themes/theme.js';

export abstract class AssetBase implements LivingAsset {
  readonly meta: ModuleMeta;
  container!: HTMLElement;
  theme: ThemeTokens = DARK;
  rng: Rng = new Rng();
  pointer = new PointerField();
  metrics: Metrics;
  params: Record<string, number> = {};
  /** true when prefers-reduced-motion or accessibility mode is on */
  reducedMotion = false;

  protected running = false;
  protected initialized = false;
  protected time = 0;
  private raf = 0;
  private io: IntersectionObserver | null = null;
  private ro: ResizeObserver | null = null;
  private sampler = 0;
  private opts: AssetOptions = {};
  private pausedByViewport = false;
  private pausedByUser = false;

  constructor(meta: ModuleMeta) {
    this.meta = meta;
    this.metrics = new Metrics(meta.renderer);
    for (const p of meta.params) this.params[p.key] = p.value;
  }

  // ---- subclass contract -------------------------------------------------
  /** Create the drawing surface inside container. */
  protected abstract createSurface(): void;
  /** Remove the drawing surface, free contexts. */
  protected abstract destroySurface(): void;
  /** (Re)build simulation state from this.rng + this.params. */
  protected abstract setup(): void;
  /** Advance + draw one frame. dt seconds, this.time total seconds. */
  protected abstract frame(dt: number): void;
  /** Surface pixel resize hook. */
  protected abstract onResize(): void;
  /** The exportable canvas, if any. */
  abstract exportCanvas(): HTMLCanvasElement | null;

  // ---- lifecycle ---------------------------------------------------------
  init(container: HTMLElement, options: AssetOptions = {}): void {
    if (this.initialized) this.destroy();
    this.opts = options;
    this.container = container;
    this.rng = new Rng(options.seed ?? randomSeed());
    if (options.params) Object.assign(this.params, options.params);
    this.theme = options.theme ? toTokens(options.theme) : resolveTokens(container);

    const mq = matchMedia('(prefers-reduced-motion: reduce)');
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
    // Reduced motion: render a single settled frame instead of animating.
    if (this.reducedMotion) {
      this.frame(1 / 60);
      this.pausedByUser = true;
      this.applyRunState();
    }
  }

  destroy(): void {
    if (!this.initialized) return;
    this.stopLoop();
    this.io?.disconnect(); this.io = null;
    this.ro?.disconnect(); this.ro = null;
    this.pointer.detach();
    this.destroySurface();
    this.metrics.reset();
    this.initialized = false;
    this.running = false;
    this.time = 0;
  }

  pause(): void { this.pausedByUser = true; this.applyRunState(); }
  resume(): void { this.pausedByUser = false; this.applyRunState(); }
  get paused(): boolean { return this.pausedByUser; }

  resize(): void {
    if (!this.initialized) return;
    this.onResize();
    this.metrics.setPixels(this.container.offsetWidth, this.container.offsetHeight, this.dpr());
  }

  setTheme(theme: ThemeName | ThemeTokens): void {
    this.theme = toTokens(theme);
    if (this.initialized && (this.pausedByUser || this.reducedMotion)) this.frame(0);
  }

  /** Live-data entry point; modules override to consume feeds. */
  setData(_data: unknown): void { /* module-specific */ }

  // ---- controls ----------------------------------------------------------
  reset(): void {
    if (!this.initialized) return;
    this.rng = new Rng(this.rng.seed);
    this.time = 0;
    this.setup();
    if (this.pausedByUser) this.frame(0);
  }

  regenerate(seed: number = randomSeed()): void {
    if (!this.initialized) return;
    this.rng = new Rng(seed);
    this.time = 0;
    this.setup();
    if (this.pausedByUser) this.frame(0);
  }

  /** Advance exactly one frame with a fixed timestep while paused — the
   *  offline-rendering entry point. Deterministic given seed + call sequence. */
  renderFrame(dt: number): void {
    if (!this.initialized) return;
    this.time += dt;
    this.frame(dt);
  }

  setParam(key: string, value: number): void {
    this.params[key] = value;
    this.onParamChange(key, value);
    if (this.initialized && this.pausedByUser) this.frame(0);
  }

  /** Override when a param needs a rebuild rather than live pickup. */
  protected onParamChange(_key: string, _value: number): void { /* live params by default */ }

  paramDefs(): ParamDef[] {
    return this.meta.params.map((p) => ({ ...p, value: this.params[p.key] ?? p.value }));
  }

  getMetrics(): MetricsSnapshot { return this.metrics.snapshot(); }

  // ---- export ------------------------------------------------------------
  async exportPNG(filename = `${this.meta.id}-${this.rng.seed}.png`): Promise<void> {
    const canvas = this.exportCanvas();
    if (!canvas) return;
    const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/png'));
    if (blob) downloadBlob(blob, filename);
  }

  /** SVG-native modules override. */
  exportSVG(): string | null { return null; }

  async downloadSVG(filename = `${this.meta.id}-${this.rng.seed}.svg`): Promise<void> {
    const svg = this.exportSVG();
    if (svg) downloadBlob(new Blob([svg], { type: 'image/svg+xml' }), filename);
  }

  // ---- internals ---------------------------------------------------------
  protected dpr(): number {
    return Math.min(devicePixelRatio || 1, this.opts.maxDpr ?? 2);
  }

  private applyRunState(): void {
    const shouldRun = this.initialized && !this.pausedByUser && !this.pausedByViewport;
    if (shouldRun && !this.raf) this.startLoop();
    else if (!shouldRun && this.raf) this.stopLoop();
  }

  private startLoop(): void {
    const loop = (now: number) => {
      this.raf = requestAnimationFrame(loop);
      const dt = this.metrics.tick(now);
      this.time += dt;
      this.pointer.tick();
      this.frame(dt);
    };
    this.raf = requestAnimationFrame(loop);
    this.sampler = window.setInterval(() => this.metrics.sample(), 500);
  }

  private stopLoop(): void {
    if (this.raf) cancelAnimationFrame(this.raf);
    if (this.sampler) clearInterval(this.sampler);
    this.raf = 0; this.sampler = 0;
    this.metrics.interrupt();
  }
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
