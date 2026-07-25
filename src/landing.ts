import { mount } from './index.js';
import type { LivingAsset } from './core/types.js';

const stages = [
  { key: 'hero', setup: { asset: 'flow-field', preset: 'flow-field-dense', maxDpr: 1.5 } },
  { key: 'terrain', setup: { asset: 'terrain-generator', preset: 'terrain-survey', maxDpr: 1.5 } },
  { key: 'contour', setup: { asset: 'contour-map', preset: 'contour-atlas', maxDpr: 1.5 } },
  { key: 'boids', setup: { asset: 'boids', preset: 'boids-gentle', maxDpr: 1.5 } },
] as const;

const assets: LivingAsset[] = [];

async function boot(): Promise<void> {
  for (const item of stages) {
    const target = document.querySelector<HTMLElement>(`[data-living-stage="${item.key}"]`);
    if (!target) throw new Error(`Missing landing stage "${item.key}"`);
    assets.push(await mount(target, item.setup));
  }
}

const copyButton = document.querySelector<HTMLButtonElement>('#copyCode');
copyButton?.addEventListener('click', async () => {
  const code = document.querySelector('pre code')?.textContent ?? '';
  await navigator.clipboard.writeText(code);
  copyButton.textContent = 'COPIED';
  window.setTimeout(() => { copyButton.textContent = 'COPY'; }, 1600);
});

window.addEventListener('pagehide', () => {
  for (const asset of assets) asset.destroy();
}, { once: true });

void boot();
