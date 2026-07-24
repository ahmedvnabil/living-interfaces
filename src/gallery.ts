/** Specimen Gallery — builds a SpecimenCard per catalog entry and lazily
 *  instantiates each module as it approaches the viewport. */
import { CATALOG } from './core/catalog.js';
import type { LivingAsset, ModuleMeta } from './core/types.js';
import type { AssetBase } from './core/AssetBase.js';
import { button, paramSlider } from './components/controls.js';
import { badge, setBadge, metadataPanel, update, seedViewer, setSeed } from './components/panels.js';
import { miniGraph, fpsCounter } from './components/graphs.js';
import { noiseOverlay } from './components/overlays.js';
import { randomSeed } from './utils/prng.js';

type AssetCtor = new () => AssetBase;
const instances = new Map<string, AssetBase>();

function specimenCard(meta: ModuleMeta, index: number): HTMLElement {
  const card = document.createElement('article');
  card.className = 'la-card';
  card.id = meta.id;

  // head
  const head = document.createElement('div');
  head.className = 'la-card__head';
  const titleBox = document.createElement('div');
  titleBox.innerHTML =
    `<h3 class="la-card__title">${meta.name}</h3>` +
    `<p class="la-card__subtitle">${meta.subtitle}</p>`;
  const idx = document.createElement('span');
  idx.className = 'la-card__index';
  idx.textContent = `${String(index + 1).padStart(2, '0')} / ${CATALOG.length} · ${meta.renderer.toUpperCase()}`;
  head.append(titleBox, idx);

  // stage
  const stage = document.createElement('div');
  stage.className = 'la-card__stage';
  const status = badge('STANDBY', 'idle');
  status.classList.add('la-card__status');
  stage.appendChild(status);

  // description
  const desc = document.createElement('p');
  desc.className = 'la-card__desc';
  desc.textContent = meta.description;

  // controls
  const controls = document.createElement('div');
  controls.className = 'la-card__controls';

  // actions
  const actions = document.createElement('div');
  actions.className = 'la-card__actions';

  // footer
  const footer = document.createElement('div');
  footer.className = 'la-card__footer';
  const metaPanel = metadataPanel([
    ['renderer', meta.renderer],
    ['fps', '--'],
    ['heap', '--'],
    ['gpu', '--'],
  ]);
  const fpsBox = document.createElement('div');
  fpsBox.className = 'la-card__fps';
  const fps = fpsCounter();
  const spark = miniGraph(88, 20);
  fpsBox.append(spark.el, fps.el);
  footer.append(metaPanel, fpsBox);

  card.append(head, stage, desc, controls, actions, footer);

  // ---- lazy init ----
  let asset: AssetBase | null = null;
  let statTimer = 0;

  const io = new IntersectionObserver((entries) => {
    if (!entries.some((e) => e.isIntersecting)) return;
    io.disconnect();
    setBadge(status, 'LOADING', 'idle');
    import(`./simulations/${meta.id}.js`)
      .then((mod: { default: AssetCtor }) => {
        asset = new mod.default();
        instances.set(meta.id, asset);
        asset.init(stage, { seed: randomSeed() });
        stage.appendChild(status); // keep status above canvas
        setBadge(status, 'LIVE', 'live');
        wire(asset);
      })
      .catch((err) => {
        console.error(`[gallery] ${meta.id} failed`, err);
        setBadge(status, 'ERROR', 'error');
      });
  }, { rootMargin: '200px' });
  io.observe(stage);

  function wire(a: AssetBase): void {
    // parameter sliders
    for (const def of a.paramDefs()) {
      controls.appendChild(paramSlider(def, (v) => a.setParam(def.key, v)));
    }
    // seed viewer
    const seedEl = seedViewer(a.rng.seed);
    // actions
    const pauseBtn = button('Pause', () => {
      if (a.paused) {
        a.resume(); pauseBtn.textContent = 'Pause'; setBadge(status, 'LIVE', 'live');
      } else {
        a.pause(); pauseBtn.textContent = 'Resume'; setBadge(status, 'PAUSED', 'paused');
      }
    });
    actions.append(
      pauseBtn,
      button('Reset', () => a.reset()),
      button('Regenerate', () => { a.regenerate(); setSeed(seedEl, a.rng.seed); }, { primary: true }),
      button('PNG', () => a.exportPNG()),
    );
    if (meta.svgExport) actions.append(button('SVG', () => a.downloadSVG()));
    actions.append(seedEl);
    // metrics loop
    statTimer = window.setInterval(() => {
      const m = a.getMetrics();
      fps.set(m.fps);
      spark.draw(m.history);
      update(metaPanel, [
        ['renderer', meta.renderer],
        ['fps', String(m.fps)],
        ['heap', m.heapMB === null ? 'n/a' : `${m.heapMB} MB`],
        ['gpu', m.gpuEstimate],
      ]);
    }, 1000);
    void statTimer;
  }

  return card;
}

// ---- page assembly ----
export function mountGallery(root: HTMLElement): void {
  const grid = document.createElement('div');
  grid.className = 'la-grid la-grid--cards';
  CATALOG.forEach((meta, i) => grid.appendChild(specimenCard(meta, i)));
  root.appendChild(grid);
}

export function setPageTheme(theme: 'dark' | 'light'): void {
  document.documentElement.dataset.theme = theme;
  for (const a of instances.values()) (a as LivingAsset).setTheme(theme);
}

export function pauseAll(): void { for (const a of instances.values()) a.pause(); }
export function resumeAll(): void { for (const a of instances.values()) a.resume(); }

// boot
const root = document.getElementById('gallery');
if (root) {
  mountGallery(root);
  const grain = document.getElementById('grain');
  if (grain) noiseOverlay(grain, 0.04);
}
