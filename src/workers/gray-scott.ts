/** Gray–Scott reaction–diffusion kernel, shared by the worker and the
 *  main-thread fallback. Operates on plain typed arrays. */

export const RD_SIZE = 192;

export interface RdState {
  u: Float32Array;
  v: Float32Array;
  u2: Float32Array;
  v2: Float32Array;
}

export function createState(seedRand: () => number): RdState {
  const n = RD_SIZE * RD_SIZE;
  const u = new Float32Array(n).fill(1);
  const v = new Float32Array(n);
  // sparse random inoculations
  for (let k = 0; k < 14; k++) {
    const cx = Math.floor(seedRand() * RD_SIZE), cy = Math.floor(seedRand() * RD_SIZE);
    for (let y = -3; y <= 3; y++) for (let x = -3; x <= 3; x++) {
      const xi = (cx + x + RD_SIZE) % RD_SIZE, yi = (cy + y + RD_SIZE) % RD_SIZE;
      v[yi * RD_SIZE + xi] = 1;
    }
  }
  return { u, v, u2: new Float32Array(n), v2: new Float32Array(n) };
}

export function step(s: RdState, feed: number, kill: number, iterations: number, poke?: { x: number; y: number }): void {
  const N = RD_SIZE;
  const du = 0.21, dv = 0.105, dt = 1;
  for (let it = 0; it < iterations; it++) {
    const { u, v, u2, v2 } = s;
    for (let y = 0; y < N; y++) {
      const ym = ((y - 1 + N) % N) * N, y0 = y * N, yp = ((y + 1) % N) * N;
      for (let x = 0; x < N; x++) {
        const xm = (x - 1 + N) % N, xp = (x + 1) % N;
        const i = y0 + x;
        const lapU = u[ym + x] + u[yp + x] + u[y0 + xm] + u[y0 + xp] - 4 * u[i];
        const lapV = v[ym + x] + v[yp + x] + v[y0 + xm] + v[y0 + xp] - 4 * v[i];
        const uvv = u[i] * v[i] * v[i];
        u2[i] = u[i] + (du * lapU - uvv + feed * (1 - u[i])) * dt;
        v2[i] = v[i] + (dv * lapV + uvv - (kill + feed) * v[i]) * dt;
      }
    }
    s.u = u2; s.u2 = u;
    s.v = v2; s.v2 = v;
  }
  if (poke) {
    const cx = Math.floor(poke.x * N), cy = Math.floor(poke.y * N);
    for (let y = -2; y <= 2; y++) for (let x = -2; x <= 2; x++) {
      const xi = (cx + x + N) % N, yi = (cy + y + N) % N;
      s.v[yi * N + xi] = 1;
    }
  }
}

export interface RdTheme { bg: [number, number, number]; fg: [number, number, number]; accent: [number, number, number] }

export function render(s: RdState, img: ImageData, theme: RdTheme): void {
  const d = img.data;
  const { bg, fg, accent } = theme;
  for (let i = 0; i < RD_SIZE * RD_SIZE; i++) {
    const t = Math.min(Math.max(s.v[i] * 2.4, 0), 1);
    const hot = t > 0.8 ? (t - 0.8) / 0.2 : 0;
    d[i * 4] = bg[0] + (fg[0] - bg[0]) * t + (accent[0] - fg[0]) * hot * 0.6;
    d[i * 4 + 1] = bg[1] + (fg[1] - bg[1]) * t + (accent[1] - fg[1]) * hot * 0.6;
    d[i * 4 + 2] = bg[2] + (fg[2] - bg[2]) * t + (accent[2] - fg[2]) * hot * 0.6;
    d[i * 4 + 3] = 255;
  }
}
