import { CATALOG, getMeta } from "./core/catalog.js";
import { resolveSetup } from "./presets.js";
import { CATALOG as CATALOG2, getMeta as getMeta2 } from "./core/catalog.js";
export * from "./core/types.js";
import { PRESETS, definePreset, getPreset, resolveSetup as resolveSetup2 } from "./presets.js";
async function createAsset(id) {
  let meta;
  try {
    meta = getMeta(id);
  } catch {
    throw new Error(`Unknown Living Interfaces asset "${id}"`);
  }
  const module = await import(`./${meta.path}`);
  const Constructor = module.default;
  if (typeof Constructor !== "function") {
    throw new Error(`Asset "${id}" does not provide a default constructor`);
  }
  return new Constructor();
}
async function mount(target, setup) {
  const container = typeof target === "string" ? document.querySelector(target) : target;
  if (!container) throw new Error(`Living Interfaces mount target was not found`);
  const resolved = resolveSetup(setup);
  const asset = await createAsset(resolved.asset);
  asset.init(container, {
    seed: resolved.seed,
    theme: resolved.theme,
    params: resolved.params,
    maxDpr: resolved.maxDpr,
    accessibility: resolved.accessibility,
    autoPause: resolved.autoPause
  });
  return asset;
}
const VERSION = "0.1.0";
const ASSET_COUNT = CATALOG.length;
export {
  ASSET_COUNT,
  CATALOG2 as CATALOG,
  PRESETS,
  VERSION,
  createAsset,
  definePreset,
  getMeta2 as getMeta,
  getPreset,
  mount,
  resolveSetup2 as resolveSetup
};
