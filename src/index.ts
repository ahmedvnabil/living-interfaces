import { CATALOG, getMeta } from './core/catalog.js';
import type { LivingAsset } from './core/types.js';
import { resolveSetup, type LivingSetup } from './presets.js';

export { CATALOG, getMeta } from './core/catalog.js';
export * from './core/types.js';
export { PRESETS, definePreset, getPreset, resolveSetup } from './presets.js';
export type { LivingPreset, LivingSetup, ResolvedSetup } from './presets.js';

type AssetConstructor = new () => LivingAsset;

export async function createAsset(id: string): Promise<LivingAsset> {
  let meta;
  try {
    meta = getMeta(id);
  } catch {
    throw new Error(`Unknown Living Interfaces asset "${id}"`);
  }
  const module = await import(`./${meta.path}`);
  const Constructor = module.default as AssetConstructor | undefined;
  if (typeof Constructor !== 'function') {
    throw new Error(`Asset "${id}" does not provide a default constructor`);
  }
  return new Constructor();
}

export async function mount(
  target: string | HTMLElement,
  setup: LivingSetup,
): Promise<LivingAsset> {
  const container = typeof target === 'string' ? document.querySelector<HTMLElement>(target) : target;
  if (!container) throw new Error(`Living Interfaces mount target was not found`);

  const resolved = resolveSetup(setup);
  const asset = await createAsset(resolved.asset);
  asset.init(container, {
    seed: resolved.seed,
    theme: resolved.theme,
    params: resolved.params,
    maxDpr: resolved.maxDpr,
    accessibility: resolved.accessibility,
    autoPause: resolved.autoPause,
  });
  return asset;
}

export const VERSION = '0.1.0';
export const ASSET_COUNT = CATALOG.length;
