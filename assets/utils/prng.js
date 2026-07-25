function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = a + 1831565813 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
function randomSeed() {
  return Math.random() * 4294967295 >>> 0;
}
class Rng {
  seed;
  fn;
  constructor(seed = randomSeed()) {
    this.seed = seed >>> 0;
    this.fn = mulberry32(this.seed);
  }
  next() {
    return this.fn();
  }
  range(min, max) {
    return min + (max - min) * this.fn();
  }
  int(min, max) {
    return Math.floor(this.range(min, max + 1));
  }
  pick(arr) {
    return arr[Math.floor(this.fn() * arr.length)];
  }
  sign() {
    return this.fn() < 0.5 ? -1 : 1;
  }
  gaussian() {
    const u = Math.max(this.fn(), 1e-9);
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * this.fn());
  }
}
export {
  Rng,
  mulberry32,
  randomSeed
};
