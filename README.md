# Living Assets Library

A framework-free operating system for futuristic interfaces: **40 generative
visualization modules**, a **16-piece UI component library**, a specimen **gallery**
and **25 showcase pages** — all pure TypeScript compiled to plain ES modules.

Aesthetic: scientific research lab. Near-black ground, white/soft-gray ink, one
disciplined lime accent, IBM Plex Mono + Inter, hairline structure. No neon, no HUD
props, no glow.

## Quick start

```bash
npm install        # esbuild + three types (dev only — runtime has zero npm deps)
npm run docs       # compile /src → /assets and regenerate /docs
npm run serve      # http://localhost:4173
```

Open `index.html` for the 40-specimen gallery, `examples/index.html` for the
showcases, `docs/index.html` for documentation.

## Drop a module into any site

```html
<link rel="stylesheet" href="/themes/tokens.css">
<div id="stage" style="width:640px;height:480px"></div>
<script type="importmap">
{ "imports": { "three": "https://cdn.jsdelivr.net/npm/three@0.165.0/build/three.module.min.js",
               "gsap": "https://cdn.jsdelivr.net/npm/gsap@3.12.5/index.js" } }
</script>
<script type="module">
  import FlowField from '/assets/simulations/flow-field.js';
  new FlowField().init(document.getElementById('stage'), { seed: 42 });
</script>
```

Only WebGL modules (`terrain-generator`, `mesh-morphing`, `procedural-clouds`) touch
`three`; everything else needs no import map at all. Offline? Point the import map at
`/vendor/three.module.js`.

## The contract

Every asset implements:

```ts
init(container, options?)  // options: seed, theme, params, maxDpr, accessibility, autoPause
destroy()                  // full teardown — RAF, observers, listeners, GL, workers
pause() / resume()
resize()                   // automatic via ResizeObserver as well
setTheme('dark' | 'light' | tokens)
setData(payload)           // live-data entry point
```

Plus: seeded determinism (`{ seed }` reproduces a run exactly), automatic off-screen
pause, `prefers-reduced-motion` support, PNG export, SVG export where the geometry is
vector-native, FPS/heap/GPU metrics via `getMetrics()`, and mouse/touch influence in
every simulation. Hand-tracking, microphone, camera, MIDI, WebSocket and live-data
sources are stubbed behind one `InputSource` interface in `src/core/inputs.ts`.

## Layout

```
src/          TypeScript source (core, simulations, components, themes, shaders, workers, utils)
assets/       compiled ES modules — the thing you copy into other projects
themes/       tokens.css (dark + light) · lab.css (components, specimen cards)
vendor/       offline copies of three + gsap
examples/     25 application studies
docs/         generated documentation
index.html    specimen gallery
```

## Studio — video export

Open `studio.html`: pick any module, choose a resolution (HD / Full HD / QHD / square /
9:16 reels), keyframe parameters on the timeline (⏺ at the playhead, smoothstep
interpolation), then export:

- **Render WebM · frame-accurate** — steps the simulation offline at a fixed timestep
  and captures every frame via `captureStream(0)` + `requestFrame()`. Never drops
  frames, regardless of resolution or machine speed. (Worker-rendered modules use
  realtime mode instead.)
- **Record realtime** — live capture of the running canvas, pointer interaction included.
- **PNG frame** and **Copy setup JSON** (module + seed + params + timeline) for reuse.

Seeded determinism means a take can be reproduced exactly.

## LivingStory — interactive films

`assets/player/living-story.js` turns scenes (plain JSON: module, headline, body,
`from`/`to` params, seed) into a scroll-driven film: scroll interpolates parameters,
scenes crossfade, and the viewer's pointer still disturbs every simulation.
See `examples/interactive-film.html` for a five-scene demo.

## Theming

All color flows from CSS custom properties (`--la-bg`, `--la-fg`, `--la-muted`,
`--la-faint`, `--la-accent`, `--la-accent2`). Set `data-theme="light"` on `<html>`,
override the variables with your brand, or pass explicit tokens to `setTheme()` —
modules re-read their palette live.
