/** Deterministic seeded PRNG (mulberry32) + helpers. */

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function randomSeed(): number {
  return (Math.random() * 0xffffffff) >>> 0;
}

export class Rng {
  seed: number;
  private fn: () => number;

  constructor(seed: number = randomSeed()) {
    this.seed = seed >>> 0;
    this.fn = mulberry32(this.seed);
  }

  next(): number { return this.fn(); }
  range(min: number, max: number): number { return min + (max - min) * this.fn(); }
  int(min: number, max: number): number { return Math.floor(this.range(min, max + 1)); }
  pick<T>(arr: readonly T[]): T { return arr[Math.floor(this.fn() * arr.length)]; }
  sign(): number { return this.fn() < 0.5 ? -1 : 1; }
  gaussian(): number {
    const u = Math.max(this.fn(), 1e-9);
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * this.fn());
  }
}
