class PointerField {
  x = -1;
  y = -1;
  // element-local CSS px
  nx = 0.5;
  ny = 0.5;
  // normalized 0..1
  vx = 0;
  vy = 0;
  // velocity px/frame (smoothed)
  down = false;
  active = false;
  // pointer over element
  el = null;
  px = -1;
  py = -1;
  handlers = [];
  attach(el) {
    this.el = el;
    const on = (type, fn, opts) => {
      el.addEventListener(type, fn, opts);
      this.handlers.push([type, fn, opts]);
    };
    on("pointermove", (e) => this.move(e.clientX, e.clientY));
    on("pointerdown", (e) => {
      this.down = true;
      this.move(e.clientX, e.clientY);
    });
    on("pointerup", () => {
      this.down = false;
    });
    on("pointerenter", () => {
      this.active = true;
    });
    on("pointerleave", () => {
      this.active = false;
      this.down = false;
    });
    on("touchmove", (e) => {
      const t = e.touches[0];
      if (t) {
        this.active = true;
        this.move(t.clientX, t.clientY);
      }
    }, { passive: true });
    on("touchend", () => {
      this.down = false;
      this.active = false;
    }, { passive: true });
  }
  move(cx, cy) {
    if (!this.el) return;
    const r = this.el.getBoundingClientRect();
    const kx = r.width > 0 ? this.el.offsetWidth / r.width : 1;
    const ky = r.height > 0 ? this.el.offsetHeight / r.height : 1;
    const x = (cx - r.left) * kx, y = (cy - r.top) * ky;
    if (this.px >= 0) {
      this.vx = this.vx * 0.7 + (x - this.px) * 0.3;
      this.vy = this.vy * 0.7 + (y - this.py) * 0.3;
    }
    this.px = x;
    this.py = y;
    this.x = x;
    this.y = y;
    this.nx = this.el.offsetWidth > 0 ? x / this.el.offsetWidth : 0.5;
    this.ny = this.el.offsetHeight > 0 ? y / this.el.offsetHeight : 0.5;
  }
  /** Per-frame decay so velocity settles when the pointer stops. */
  tick() {
    this.vx *= 0.92;
    this.vy *= 0.92;
  }
  detach() {
    if (this.el) for (const [t, fn, o] of this.handlers) this.el.removeEventListener(t, fn, o);
    this.handlers = [];
    this.el = null;
  }
}
export {
  PointerField
};
