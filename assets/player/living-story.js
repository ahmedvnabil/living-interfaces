const VH_PER_SCENE = 1.9;
class LivingStory {
  mountEl;
  scenes = [];
  viewport;
  slots = [null, null];
  textEl;
  progressEl;
  asset = null;
  activeIdx = -1;
  activeSlot = 0;
  loadToken = 0;
  raf = 0;
  lastP = -1;
  init(mount, scenes) {
    this.mountEl = mount;
    this.scenes = scenes;
    mount.style.position = "relative";
    mount.style.height = `${scenes.length * VH_PER_SCENE * 100}vh`;
    this.viewport = document.createElement("div");
    this.viewport.style.cssText = "position:sticky;top:0;height:100vh;overflow:hidden;";
    for (let i = 0; i < 2; i++) {
      const slot = document.createElement("div");
      slot.style.cssText = "position:absolute;inset:0;opacity:0;transition:opacity 900ms var(--la-ease,ease);";
      this.viewport.appendChild(slot);
      this.slots[i] = slot;
    }
    this.textEl = document.createElement("div");
    this.textEl.style.cssText = "position:absolute;left:0;right:0;bottom:10vh;z-index:3;pointer-events:none;display:grid;gap:10px;max-width:560px;margin:0 auto;padding:0 24px;transition:opacity 500ms var(--la-ease,ease);";
    this.viewport.appendChild(this.textEl);
    this.progressEl = document.createElement("div");
    this.progressEl.style.cssText = "position:absolute;top:0;left:0;height:2px;width:0;background:var(--la-accent);z-index:4;";
    this.viewport.appendChild(this.progressEl);
    mount.appendChild(this.viewport);
    const watch = () => {
      this.raf = requestAnimationFrame(watch);
      const p = this.progress();
      if (Math.abs(p - this.lastP) > 4e-4) {
        this.lastP = p;
        this.onScroll();
      }
    };
    watch();
  }
  destroy() {
    cancelAnimationFrame(this.raf);
    this.asset?.destroy();
    this.asset = null;
    this.mountEl.replaceChildren();
  }
  progress() {
    const r = this.mountEl.getBoundingClientRect();
    const total = r.height - innerHeight;
    return Math.min(Math.max(-r.top / Math.max(total, 1), 0), 1);
  }
  onScroll() {
    const p = this.progress();
    const n = this.scenes.length;
    const idx = Math.min(Math.floor(p * n), n - 1);
    const local = Math.min(Math.max(p * n - idx, 0), 1);
    this.progressEl.style.width = `${p * 100}%`;
    if (idx !== this.activeIdx) void this.activate(idx);
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
    this.textEl.style.opacity = local > 0.86 ? "0" : "1";
  }
  async activate(idx) {
    const token = ++this.loadToken;
    this.activeIdx = idx;
    const sc = this.scenes[idx];
    const nextSlot = 1 - this.activeSlot;
    const mod = await import(`/assets/${sc.module}`);
    if (token !== this.loadToken) return;
    const prev = this.asset;
    const slotEl = this.slots[nextSlot];
    slotEl.replaceChildren();
    const asset = new mod.default();
    asset.init(slotEl, { seed: sc.seed, params: sc.from, theme: sc.theme ?? "dark" });
    this.asset = asset;
    this.activeSlot = nextSlot;
    slotEl.style.opacity = "1";
    this.slots[1 - nextSlot].style.opacity = "0";
    setTimeout(() => {
      if (token === this.loadToken) {
        prev?.destroy();
        this.slots[1 - nextSlot].replaceChildren();
      }
    }, 950);
    this.textEl.innerHTML = `<span class="la-label">Scene ${String(idx + 1).padStart(2, "0")} / ${this.scenes.length}</span><h2 style="margin:0;font-size:clamp(1.4rem,3.5vw,2.2rem);letter-spacing:-0.02em">${sc.headline}</h2><p style="margin:0;color:var(--la-muted);line-height:1.7">${sc.body}</p>`;
  }
}
var living_story_default = LivingStory;
export {
  LivingStory,
  living_story_default as default
};
