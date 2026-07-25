/** Parameter automation lanes: keyframes with smoothstep interpolation. */

export interface Keyframe { t: number; v: number }

export class Timeline {
  duration: number;
  private lanes = new Map<string, Keyframe[]>();

  constructor(duration = 10) {
    this.duration = duration;
  }

  addKeyframe(param: string, t: number, v: number): void {
    const lane = this.lanes.get(param) ?? [];
    // replace keyframe within 0.15s of an existing one
    const near = lane.findIndex((k) => Math.abs(k.t - t) < 0.15);
    if (near >= 0) lane[near] = { t, v };
    else lane.push({ t, v });
    lane.sort((a, b) => a.t - b.t);
    this.lanes.set(param, lane);
  }

  removeKeyframe(param: string, index: number): void {
    const lane = this.lanes.get(param);
    if (!lane) return;
    lane.splice(index, 1);
    if (lane.length === 0) this.lanes.delete(param);
  }

  lane(param: string): Keyframe[] {
    return this.lanes.get(param) ?? [];
  }

  laneNames(): string[] {
    return [...this.lanes.keys()];
  }

  clear(): void {
    this.lanes.clear();
  }

  /** Interpolated value at time t, or null when the lane is empty. */
  valueAt(param: string, t: number): number | null {
    const lane = this.lanes.get(param);
    if (!lane || lane.length === 0) return null;
    if (t <= lane[0].t) return lane[0].v;
    const last = lane[lane.length - 1];
    if (t >= last.t) return last.v;
    for (let i = 0; i < lane.length - 1; i++) {
      const a = lane[i], b = lane[i + 1];
      if (t >= a.t && t <= b.t) {
        const u = (t - a.t) / Math.max(b.t - a.t, 1e-9);
        const s = u * u * (3 - 2 * u); // smoothstep easing
        return a.v + (b.v - a.v) * s;
      }
    }
    return last.v;
  }

  /** All animated values at time t. */
  sample(t: number): Record<string, number> {
    const out: Record<string, number> = {};
    for (const name of this.lanes.keys()) {
      const v = this.valueAt(name, t);
      if (v !== null) out[name] = v;
    }
    return out;
  }

  toJSON(): { duration: number; lanes: Record<string, Keyframe[]> } {
    const lanes: Record<string, Keyframe[]> = {};
    for (const [k, v] of this.lanes) lanes[k] = v;
    return { duration: this.duration, lanes };
  }
}
