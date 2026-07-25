/**
 * Living Assets — WordPress front-end mounter.
 * Scans for [data-la-module] embeds and [data-la-story] films, lazy-imports the
 * right module from the bundled library and initializes it. Modules auto-pause
 * off-screen and honor prefers-reduced-motion on their own.
 */
const LIB = new URL('./la/', import.meta.url);

function mountAsset(el) {
  if (el.dataset.laMounted) return;
  el.dataset.laMounted = '1';
  const module = el.dataset.laModule;
  if (!/^[a-z0-9-]+$/.test(module)) return;
  const options = {};
  if (el.dataset.laSeed) options.seed = parseInt(el.dataset.laSeed, 10) >>> 0;
  if (el.dataset.laTheme === 'dark' || el.dataset.laTheme === 'light') options.theme = el.dataset.laTheme;
  if (el.dataset.laParams) {
    try {
      const params = JSON.parse(el.dataset.laParams);
      if (params && typeof params === 'object') options.params = params;
    } catch { /* ignore malformed params */ }
  }
  import(new URL(`simulations/${module}.js`, LIB))
    .then((mod) => {
      const asset = new mod.default();
      asset.init(el, options);
      el.laAsset = asset; // theme switchers / SPAs can reach the instance
    })
    .catch((err) => console.error(`[living-assets] ${module} failed to mount`, err));
}

function mountStory(el) {
  if (el.dataset.laMounted) return;
  el.dataset.laMounted = '1';
  const script = el.querySelector('script[type="application/json"]');
  if (!script) return;
  let scenes;
  try {
    scenes = JSON.parse(script.textContent);
  } catch {
    return;
  }
  if (!Array.isArray(scenes) || scenes.length === 0) return;
  import(new URL('player/living-story.js', LIB))
    .then((mod) => {
      const story = new mod.default();
      story.init(el, scenes);
      el.laStory = story;
    })
    .catch((err) => console.error('[living-assets] story failed to mount', err));
}

function scan(root = document) {
  root.querySelectorAll('[data-la-module]').forEach(mountAsset);
  root.querySelectorAll('[data-la-story]').forEach(mountStory);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => scan());
} else {
  scan();
}
// Late-inserted embeds (AJAX pagination, popup builders, infinite scroll)
new MutationObserver((muts) => {
  for (const m of muts) {
    for (const node of m.addedNodes) {
      if (node.nodeType === 1) scan(node.parentNode ?? document);
    }
  }
}).observe(document.body, { childList: true, subtree: true });

export { scan };
