import { mount } from './index.js';
import type { LivingAsset } from './core/types.js';

const HTMLElementBase = globalThis.HTMLElement ?? class {};

function numberAttribute(element: Element, name: string): number | undefined {
  const raw = element.getAttribute(name);
  if (raw === null) return undefined;
  const value = Number(raw);
  if (!Number.isFinite(value)) throw new Error(`${name} must be a number`);
  return value;
}

export class LivingAssetElement extends HTMLElementBase {
  private asset?: LivingAsset;
  private generation = 0;

  static get observedAttributes(): string[] {
    return ['type', 'preset', 'seed', 'theme'];
  }

  connectedCallback(): void {
    void this.render();
  }

  disconnectedCallback(): void {
    this.generation += 1;
    this.asset?.destroy();
    this.asset = undefined;
  }

  attributeChangedCallback(): void {
    if ((this as Element).isConnected) void this.render();
  }

  private async render(): Promise<void> {
    const generation = ++this.generation;
    const type = (this as Element).getAttribute('type');
    this.asset?.destroy();
    this.asset = undefined;
    if (!type) {
      (this as Element).setAttribute('data-error', 'The type attribute is required');
      return;
    }

    (this as Element).removeAttribute('data-error');

    try {
      const asset = await mount(this as unknown as HTMLElement, {
        asset: type,
        preset: (this as Element).getAttribute('preset') ?? undefined,
        seed: numberAttribute(this as unknown as Element, 'seed'),
        theme: ((this as Element).getAttribute('theme') as 'dark' | 'light' | null) ?? undefined,
        accessibility: true,
        autoPause: true,
      });
      if (generation !== this.generation) {
        asset.destroy();
        return;
      }
      this.asset = asset;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to render asset';
      (this as Element).setAttribute('data-error', message);
      this.dispatchEvent(new CustomEvent('living-error', { detail: { message } }));
    }
  }
}

export function registerLivingAsset(tagName = 'living-asset'): void {
  if (!globalThis.customElements) return;
  if (!customElements.get(tagName)) customElements.define(tagName, LivingAssetElement as CustomElementConstructor);
}

registerLivingAsset();
