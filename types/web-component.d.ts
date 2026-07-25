import type { LivingAsset } from './index.js';

export declare class LivingAssetElement extends HTMLElement {
  private asset?;
}

export declare function registerLivingAsset(tagName?: string): void;
