/** LivingStory — scroll-driven interactive film. Scenes are live simulations;
 *  scroll position interpolates their parameters, the viewer's pointer still
 *  influences every frame. */
import type { AssetBase } from '../core/AssetBase.js';

export interface StoryScene {
  /** module path under /assets/, e.g. 'simulations/flow-field.js' */
  module: string;
  headline: string;
  body: string;
  seed?: number;
  /** params at scene start */
  from?: Record<string, number>;
  /** params at scene end (interpolated by scroll) */
  to?: Record<string, number>;
  theme?: 'dark' | 'light';
}

type AssetCtor = new () => AssetBase;

const VH_PER_SCENE = 1.9; // scroll length of one scene, in viewport heights

export class LivingStory {
  private mountEl!: HTMLElement;
  private scenes: StoryScene[] = [];
  private viewport!: HTMLElement;
  private slots: [HTMLElement, HTMLElement] = [null!, null!];
  private textEl!: HTMLElement;
  private progressEl!: HTMLElement;
  private asset: AssetBase | null = null;
  private activeIdx = -1;
  private activeSlot = 0;
  private loadToken = 0;
  private raf = 0;
  private lastP = -1;

  init(mount: HTMLElement, scenes: StoryScene[]): void {
    this.mountEl = mount;
    this.scenes = scenes;
    mount.style.position = 'relative';
    mount.style.height = `${scenes.length * VH_PER_SCENE * 100}vh`;

    this.viewport = document.createElement('div');
    this.viewport.style.cssText = 'position:sticky;top:0;height:100vh;overflow:hidden;';
    for (let i = 0; i < 2; i++) {
      const slot = document.createElement('div');
      slot.style.cssText = 'position:absolute;inset:0;opacity:0;transition:opacity 900ms var(--la-ease,ease);';
      this.viewport.appendChild(slot);
      this.slots[i] = slot;
    }
    // text overlay
    this.textEl = document.createElement('div');
    this.textEl.style.cssText =
      'position:absolute;left:0;right:0;bottom:10vh;z-index:3;pointer-events:none;' +
      'display:grid;gap:10px;max-width:560px;margin:0 auto;padding:0 24px;' +
      'transition:opacity 500ms var(--la-ease,ease);';
    this.viewport.appendChild(this.textEl);
    // progress rail
    this.progressEl = document.createElement('div');
    this.progressEl.style.cssText =
      'position:absolute;top:0;left:0;height:2px;width:0;background:var(--la-accent);z-index:4;';
    this.viewport.appendChild(this.progressEl);
    mount.appendChild(this.viewport);

    // rAF-driven progress watch: scroll events are unreliable in some embeds,
    // and this also picks up resize + programmatic scrolling for free.
    const watch = () => {
      this.raf = requestAnimationFrame(watch);
      const p = this.progress();
      if (Math.abs(p - this.lastP) > 0.0004) {
        this.lastP = p;
        this.onScroll();
      }
    };
    watch();
  }

  destroy(): void {
    cancelAnimationFrame(this.raf);
    this.asset?.destroy();
    this.asset = null;
    this.mountEl.replaceChildren();
  }

  private progress(): number {
    const r = this.mountEl.getBoundingClientRect();
    const total = r.height - innerHeight;
    return Math.min(Math.max(-r.top / Math.max(total, 1), 0), 1);
  }

  private onScroll(): void {
    const p = this.progress();
    const n = this.scenes.length;
    const idx = Math.min(Math.floor(p * n), n - 1);
    const local = Math.min(Math.max(p * n - idx, 0), 1);
    this.progressEl.style.width = `${p * 100}%`;
    if (idx !== this.activeIdx) void this.activate(idx);
    // interpolate params of active scene
    if (this.asset && idx === this.activeIdx) {
      const sc = this.scenes[idx];
      if (sc.from && sc.to) {
        const s = local * local * (3 - 2 * local);
        for (const k of Object.keys(sc.to)) {
          const a = sc.from[k] ?? sc.to[k];
          this.asset.setParam(k, a + (sc.to[k] - a) * s);
        }
      }
    }
    // text fades out near the very end of a scene
    this.textEl.style.opacity = local > 0.86 ? '0' : '1';
  }

  private async activate(idx: number): Promise<void> {
    const token = ++this.loadToken;
    this.activeIdx = idx;
    const sc = this.scenes[idx];
    const nextSlot = 1 - this.activeSlot;
    const mod = (await import(`/assets/${sc.module}`)) as { default: AssetCtor };
    if (token !== this.loadToken) return; // superseded by faster scrolling
    const prev = this.asset;
    const slotEl = this.slots[nextSlot];
    slotEl.replaceChildren();
    const asset = new mod.default();
    asset.init(slotEl, { seed: sc.seed, params: sc.from, theme: sc.theme ?? 'dark' });
    this.asset = asset;
    this.activeSlot = nextSlot;
    // crossfade
    slotEl.style.opacity = '1';
    this.slots[1 - nextSlot].style.opacity = '0';
    setTimeout(() => {
      if (token === this.loadToken) {
        prev?.destroy();
        this.slots[1 - nextSlot].replaceChildren();
      }
    }, 950);
    // narration
    this.textEl.innerHTML =
      `<span class="la-label">Scene ${String(idx + 1).padStart(2, '0')} / ${this.scenes.length}</span>` +
      `<h2 style="margin:0;font-size:clamp(1.4rem,3.5vw,2.2rem);letter-spacing:-0.02em">${sc.headline}</h2>` +
      `<p style="margin:0;color:var(--la-muted);line-height:1.7">${sc.body}</p>`;
  }
}

export default LivingStory;
