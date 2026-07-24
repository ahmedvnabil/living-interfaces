/** GLSL for the Procedural Clouds fragment shader. */

export const CLOUDS_VERT = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 1.0);
}
`;

export const CLOUDS_FRAG = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform float uTime;
uniform float uCoverage;
uniform float uSpeed;
uniform float uDetail;
uniform float uSeed;
uniform vec2 uPointer;
uniform float uPointerOn;
uniform vec3 uBg;
uniform vec3 uFg;
uniform vec3 uAccent;
uniform vec2 uRes;

// hash + value noise + fbm
float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21) + uSeed);
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}
float fbm(vec2 p, int oct) {
  float v = 0.0;
  float amp = 0.5;
  for (int i = 0; i < 6; i++) {
    if (i >= oct) break;
    v += amp * noise(p);
    p *= 2.03;
    amp *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = vUv;
  vec2 asp = vec2(uRes.x / uRes.y, 1.0);
  vec2 p = uv * asp;
  float t = uTime * uSpeed * 0.05;
  // stratified drift: two layers moving at different rates
  float base = fbm(p * 2.4 + vec2(t, t * 0.3), int(uDetail));
  float high = fbm(p * 5.2 + vec2(t * 1.7, -t * 0.2) + base * 1.4, int(uDetail));
  float density = base * 0.65 + high * 0.35;
  // pointer clears a thermal gap
  if (uPointerOn > 0.5) {
    float d = distance(uv * asp, uPointer * asp);
    density -= smoothstep(0.28, 0.0, d) * 0.35;
  }
  // height falloff: denser strata mid-frame
  float band = 1.0 - abs(uv.y - 0.55) * 1.4;
  density *= clamp(band, 0.0, 1.0);
  float cloud = smoothstep(1.0 - uCoverage, 1.0 - uCoverage + 0.28, density);
  // tone: bg → fg with a restrained sun-edge accent
  float edge = smoothstep(0.42, 0.5, density) - smoothstep(0.5, 0.62, density);
  vec3 col = mix(uBg, uFg, cloud * 0.82);
  col = mix(col, uAccent, edge * 0.03);
  gl_FragColor = vec4(col, 1.0);
}
`;
