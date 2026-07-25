import { getMeta } from "./core/catalog.js";
function assertPreset(input) {
  if (!input.id.trim()) throw new Error("Preset id is required");
  if (!input.name.trim()) throw new Error("Preset name is required");
  let meta;
  try {
    meta = getMeta(input.asset);
  } catch {
    throw new Error(`Unknown asset "${input.asset}" in preset "${input.id}"`);
  }
  const definitions = new Map(meta.params.map((definition) => [definition.key, definition]));
  for (const [key, value] of Object.entries(input.params)) {
    const definition = definitions.get(key);
    if (!definition) throw new Error(`Unknown parameter "${key}" in preset "${input.id}"`);
    if (!Number.isFinite(value) || value < definition.min || value > definition.max) {
      throw new Error(`Parameter "${key}" is outside its valid range in preset "${input.id}"`);
    }
  }
}
function definePreset(input) {
  assertPreset(input);
  const params = Object.freeze({ ...input.params });
  const theme = typeof input.theme === "object" ? Object.freeze({ ...input.theme }) : input.theme;
  return Object.freeze({ ...input, params, theme });
}
const PRESET_DEFINITIONS = [
  { id: "flow-field-calm", name: "Calm Current", asset: "flow-field", seed: 42, params: { count: 1100, scale: 2.8, speed: 0.55, drift: 0.08 } },
  { id: "flow-field-dense", name: "Dense Current", asset: "flow-field", seed: 731, params: { count: 3200, scale: 1.4, speed: 1.25, drift: 0.22 } },
  { id: "boids-gentle", name: "Gentle Flock", asset: "boids", seed: 18, params: { count: 160, cohesion: 0.7, separation: 1.3, speed: 1.2 } },
  { id: "physarum-veins", name: "Veins", asset: "physarum", seed: 640, params: { agents: 4200, turn: 0.28, sensorDist: 11, decay: 0.95 } },
  { id: "voronoi-editorial", name: "Editorial Cells", asset: "voronoi", seed: 81, params: { seeds: 18, jitter: 0.25, relax: 0.5 } },
  { id: "reaction-labyrinth", name: "Labyrinth", asset: "reaction-diffusion", seed: 314, params: { feed: 0.036, kill: 0.059, steps: 9 } },
  { id: "terrain-survey", name: "Survey Terrain", asset: "terrain-generator", seed: 2048, params: { relief: 1.35, scale: 1.2, detail: 5 } },
  { id: "knowledge-corpus", name: "Research Corpus", asset: "knowledge-graph", seed: 95, params: { nodes: 72, charge: 1450, spring: 0.025 } },
  { id: "contour-atlas", name: "Atlas", asset: "contour-map", seed: 404, params: { levels: 14, scale: 1.8, drift: 0.04 } },
  { id: "magnetic-dipoles", name: "Dipoles", asset: "magnetic-field", seed: 67, params: { poles: 3, lines: 26, strength: 1.2 } },
  { id: "living-background-quiet", name: "Quiet Background", asset: "living-background", seed: 120, params: { motes: 45, breathe: 0.06, presence: 0.16 } },
  { id: "ribbons-silk", name: "Silk Ribbons", asset: "ribbon-trails", seed: 512, params: { ribbons: 8, segments: 56, stiffness: 0.18 } }
];
const BUILT_INS = PRESET_DEFINITIONS.map(definePreset);
const PRESETS = Object.freeze(BUILT_INS);
function getPreset(id) {
  const preset = PRESETS.find((candidate) => candidate.id === id);
  if (!preset) throw new Error(`Unknown Living Interfaces preset "${id}"`);
  return preset;
}
function resolveSetup(input) {
  const preset = input.preset ? getPreset(input.preset) : void 0;
  if (preset && preset.asset !== input.asset) {
    throw new Error(`Preset "${preset.id}" belongs to "${preset.asset}", not "${input.asset}"`);
  }
  getMeta(input.asset);
  return {
    asset: input.asset,
    seed: input.seed ?? preset?.seed,
    theme: input.theme ?? preset?.theme,
    params: { ...preset?.params ?? {}, ...input.params ?? {} },
    maxDpr: input.maxDpr,
    accessibility: input.accessibility,
    autoPause: input.autoPause
  };
}
export {
  PRESETS,
  definePreset,
  getPreset,
  resolveSetup
};
