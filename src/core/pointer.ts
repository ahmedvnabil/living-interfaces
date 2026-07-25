/** Unified mouse + touch input normalized to element-local coordinates. */

export class PointerField {
  x = -1; y = -1;          // element-local CSS px
  nx = 0.5; ny = 0.5;      // normalized 0..1
  vx = 0; vy = 0;          // velocity px/frame (smoothed)
  down = false;
  active = false;          // pointer over element

  private el: HTMLElement | null = null;
  private px = -1; private py = -1;
  private handlers: Array<[string, EventListener, AddEventListenerOptions?]> = [];

  attach(el: HTMLElement): void {
    this.el = el;
    const on = (type: string, fn: EventListener, opts?: AddEventListenerOptions) => {
      el.addEventListener(type, fn, opts);
      this.handlers.push([type, fn, opts]);
    };
    on('pointermove', ((e: PointerEvent) => this.move(e.clientX, e.clientY)) as EventListener);
    on('pointerdown', ((e: PointerEvent) => { this.down = true; this.move(e.clientX, e.clientY); }) as EventListener);
    on('pointerup', (() => { this.down = false; }) as EventListener);
    on('pointerenter', (() => { this.active = true; }) as EventListener);
    on('pointerleave', (() => { this.active = false; this.down = false; }) as EventListener);
    on('touchmove', ((e: TouchEvent) => {
      const t = e.touches[0];
      if (t) { this.active = true; this.move(t.clientX, t.clientY); }
    }) as EventListener, { passive: true });
    on('touchend', (() => { this.down = false; this.active = false; }) as EventListener, { passive: true });
  }

  private move(cx: number, cy: number): void {
    if (!this.el) return;
    const r = this.el.getBoundingClientRect();
    // correct for CSS transforms: map screen px → layout px
    const kx = r.width > 0 ? this.el.offsetWidth / r.width : 1;
    const ky = r.height > 0 ? this.el.offsetHeight / r.height : 1;
    const x = (cx - r.left) * kx, y = (cy - r.top) * ky;
    if (this.px >= 0) {
      this.vx = this.vx * 0.7 + (x - this.px) * 0.3;
      this.vy = this.vy * 0.7 + (y - this.py) * 0.3;
    }
    this.px = x; this.py = y;
    this.x = x; this.y = y;
    this.nx = this.el.offsetWidth > 0 ? x / this.el.offsetWidth : 0.5;
    this.ny = this.el.offsetHeight > 0 ? y / this.el.offsetHeight : 0.5;
  }

  /** Per-frame decay so velocity settles when the pointer stops. */
  tick(): void {
    this.vx *= 0.92;
    this.vy *= 0.92;
  }

  detach(): void {
    if (this.el) for (const [t, fn, o] of this.handlers) this.el.removeEventListener(t, fn, o);
    this.handlers = [];
    this.el = null;
  }
}
