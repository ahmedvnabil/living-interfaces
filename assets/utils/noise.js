import { mulberry32 } from "./prng.js";
const GRAD2 = [
  [1, 1],
  [-1, 1],
  [1, -1],
  [-1, -1],
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1]
];
class Noise {
  perm;
  constructor(seed = 1337) {
    const rand = mulberry32(seed);
    const p = new Uint8Array(256);
    for (let i = 0; i < 256; i++) p[i] = i;
    for (let i = 255; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      const t = p[i];
      p[i] = p[j];
      p[j] = t;
    }
    this.perm = new Uint8Array(512);
    for (let i = 0; i < 512; i++) this.perm[i] = p[i & 255];
  }
  /** Value in [-1, 1]. Classic Perlin-style gradient noise. */
  noise2(x, y) {
    const X = Math.floor(x) & 255, Y = Math.floor(y) & 255;
    const xf = x - Math.floor(x), yf = y - Math.floor(y);
    const u = fade(xf), v = fade(yf);
    const p = this.perm;
    const aa = p[p[X] + Y], ab = p[p[X] + Y + 1];
    const ba = p[p[X + 1] + Y], bb = p[p[X + 1] + Y + 1];
    const g = (h, dx, dy) => {
      const gr = GRAD2[h & 7];
      return gr[0] * dx + gr[1] * dy;
    };
    return lerp(
      lerp(g(aa, xf, yf), g(ba, xf - 1, yf), u),
      lerp(g(ab, xf, yf - 1), g(bb, xf - 1, yf - 1), u),
      v
    ) * 1.4142;
  }
  /** Time-varying 2D noise: third axis mixed through the permutation table. */
  noise3(x, y, z) {
    const zi = Math.floor(z), zf = z - zi;
    const a = this.noise2(x + (zi & 255) * 31.7, y + (zi & 255) * 17.3);
    const b = this.noise2(x + (zi + 1 & 255) * 31.7, y + (zi + 1 & 255) * 17.3);
    return lerp(a, b, fade(zf));
  }
  fbm2(x, y, octaves = 4, lac = 2, gain = 0.5) {
    let amp = 0.5, freq = 1, sum = 0, norm = 0;
    for (let i = 0; i < octaves; i++) {
      sum += amp * this.noise2(x * freq, y * freq);
      norm += amp;
      amp *= gain;
      freq *= lac;
    }
    return sum / norm;
  }
  fbm3(x, y, z, octaves = 4) {
    let amp = 0.5, freq = 1, sum = 0, norm = 0;
    for (let i = 0; i < octaves; i++) {
      sum += amp * this.noise3(x * freq, y * freq, z * freq);
      norm += amp;
      amp *= 0.5;
      freq *= 2;
    }
    return sum / norm;
  }
  /** Divergence-free 2D field from noise gradient rotation. */
  curl2(x, y, t = 0, eps = 0.01) {
    const n1 = this.noise3(x, y + eps, t), n2 = this.noise3(x, y - eps, t);
    const n3 = this.noise3(x + eps, y, t), n4 = this.noise3(x - eps, y, t);
    return [(n1 - n2) / (2 * eps), -(n3 - n4) / (2 * eps)];
  }
}
function fade(t) {
  return t * t * t * (t * (t * 6 - 15) + 10);
}
function lerp(a, b, t) {
  return a + (b - a) * t;
}
function clamp(v, min, max) {
  return v < min ? min : v > max ? max : v;
}
function map(v, a, b, c, d) {
  return c + (v - a) / (b - a) * (d - c);
}
export {
  Noise,
  clamp,
  fade,
  lerp,
  map
};
