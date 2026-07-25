import { mount } from "./index.js";
const HTMLElementBase = globalThis.HTMLElement ?? class {
};
function numberAttribute(element, name) {
  const raw = element.getAttribute(name);
  if (raw === null) return void 0;
  const value = Number(raw);
  if (!Number.isFinite(value)) throw new Error(`${name} must be a number`);
  return value;
}
class LivingAssetElement extends HTMLElementBase {
  asset;
  generation = 0;
  static get observedAttributes() {
    return ["type", "preset", "seed", "theme"];
  }
  connectedCallback() {
    void this.render();
  }
  disconnectedCallback() {
    this.generation += 1;
    this.asset?.destroy();
    this.asset = void 0;
  }
  attributeChangedCallback() {
    if (this.isConnected) void this.render();
  }
  async render() {
    const generation = ++this.generation;
    const type = this.getAttribute("type");
    this.asset?.destroy();
    this.asset = void 0;
    if (!type) {
      this.setAttribute("data-error", "The type attribute is required");
      return;
    }
    this.removeAttribute("data-error");
    try {
      const asset = await mount(this, {
        asset: type,
        preset: this.getAttribute("preset") ?? void 0,
        seed: numberAttribute(this, "seed"),
        theme: this.getAttribute("theme") ?? void 0,
        accessibility: true,
        autoPause: true
      });
      if (generation !== this.generation) {
        asset.destroy();
        return;
      }
      this.asset = asset;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to render asset";
      this.setAttribute("data-error", message);
      this.dispatchEvent(new CustomEvent("living-error", { detail: { message } }));
    }
  }
}
function registerLivingAsset(tagName = "living-asset") {
  if (!globalThis.customElements) return;
  if (!customElements.get(tagName)) customElements.define(tagName, LivingAssetElement);
}
registerLivingAsset();
export {
  LivingAssetElement,
  registerLivingAsset
};
