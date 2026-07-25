class Timeline {
  duration;
  lanes = /* @__PURE__ */ new Map();
  constructor(duration = 10) {
    this.duration = duration;
  }
  addKeyframe(param, t, v) {
    const lane = this.lanes.get(param) ?? [];
    const near = lane.findIndex((k) => Math.abs(k.t - t) < 0.15);
    if (near >= 0) lane[near] = { t, v };
    else lane.push({ t, v });
    lane.sort((a, b) => a.t - b.t);
    this.lanes.set(param, lane);
  }
  removeKeyframe(param, index) {
    const lane = this.lanes.get(param);
    if (!lane) return;
    lane.splice(index, 1);
    if (lane.length === 0) this.lanes.delete(param);
  }
  lane(param) {
    return this.lanes.get(param) ?? [];
  }
  laneNames() {
    return [...this.lanes.keys()];
  }
  clear() {
    this.lanes.clear();
  }
  /** Interpolated value at time t, or null when the lane is empty. */
  valueAt(param, t) {
    const lane = this.lanes.get(param);
    if (!lane || lane.length === 0) return null;
    if (t <= lane[0].t) return lane[0].v;
    const last = lane[lane.length - 1];
    if (t >= last.t) return last.v;
    for (let i = 0; i < lane.length - 1; i++) {
      const a = lane[i], b = lane[i + 1];
      if (t >= a.t && t <= b.t) {
        const u = (t - a.t) / Math.max(b.t - a.t, 1e-9);
        const s = u * u * (3 - 2 * u);
        return a.v + (b.v - a.v) * s;
      }
    }
    return last.v;
  }
  /** All animated values at time t. */
  sample(t) {
    const out = {};
    for (const name of this.lanes.keys()) {
      const v = this.valueAt(name, t);
      if (v !== null) out[name] = v;
    }
    return out;
  }
  toJSON() {
    const lanes = {};
    for (const [k, v] of this.lanes) lanes[k] = v;
    return { duration: this.duration, lanes };
  }
}
export {
  Timeline
};
