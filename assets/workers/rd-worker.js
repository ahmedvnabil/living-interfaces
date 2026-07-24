import { RD_SIZE, createState, step, render } from "./gray-scott.js";
let ctx = null;
let state = null;
let img = null;
let theme = { bg: [10, 11, 12], fg: [244, 245, 244], accent: [198, 255, 77] };
let rand = Math.random;
function mulberry(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = a + 1831565813 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
self.onmessage = (e) => {
  const m = e.data;
  if (m.type === "init") {
    const canvas = m.canvas;
    canvas.width = RD_SIZE;
    canvas.height = RD_SIZE;
    ctx = canvas.getContext("2d");
    rand = mulberry(m.seed >>> 0);
    state = createState(rand);
    img = ctx.createImageData(RD_SIZE, RD_SIZE);
  } else if (m.type === "reset") {
    rand = mulberry(m.seed >>> 0);
    state = createState(rand);
  } else if (m.type === "theme") {
    theme = m.theme;
  } else if (m.type === "step" && state && ctx && img) {
    step(state, m.feed, m.kill, m.steps, m.poke);
    render(state, img, theme);
    ctx.putImageData(img, 0, 0);
  }
};
