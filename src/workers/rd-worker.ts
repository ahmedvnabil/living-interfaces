/** Reaction–diffusion worker: owns an OffscreenCanvas, steps Gray–Scott on
 *  demand. Messages: init, step, reset, theme. */
import { RD_SIZE, createState, step, render, type RdState, type RdTheme } from './gray-scott.js';

let ctx: OffscreenCanvasRenderingContext2D | null = null;
let state: RdState | null = null;
let img: ImageData | null = null;
let theme: RdTheme = { bg: [10, 11, 12], fg: [244, 245, 244], accent: [198, 255, 77] };
let rand: () => number = Math.random;

function mulberry(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

self.onmessage = (e: MessageEvent) => {
  const m = e.data;
  if (m.type === 'init') {
    const canvas = m.canvas as OffscreenCanvas;
    canvas.width = RD_SIZE; canvas.height = RD_SIZE;
    ctx = canvas.getContext('2d');
    rand = mulberry(m.seed >>> 0);
    state = createState(rand);
    img = ctx!.createImageData(RD_SIZE, RD_SIZE);
  } else if (m.type === 'reset') {
    rand = mulberry(m.seed >>> 0);
    state = createState(rand);
  } else if (m.type === 'theme') {
    theme = m.theme;
  } else if (m.type === 'step' && state && ctx && img) {
    step(state, m.feed, m.kill, m.steps, m.poke);
    render(state, img, theme);
    ctx.putImageData(img, 0, 0);
  }
};
