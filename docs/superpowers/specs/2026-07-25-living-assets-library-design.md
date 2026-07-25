# Living Assets Library — Design Spec

Date: 2026-07-25 · Status: Approved

## Purpose

A reusable, framework-free "operating system for futuristic interfaces": 40 generative
visualization modules, a 16-piece UI component library, a specimen gallery, and 25
showcase pages. Importable into any future site with `<div>` + `init(el)`.

Aesthetic: scientific research lab — Anthropic/FIELD.io/IBM Research/Nothing OS.
Never dashboard, never cyberpunk. Near-black bg, white/soft-gray text, lime accent
used sparingly, IBM Plex Mono + Inter, sharp corners, hairline borders, micro-labels.

## Core contract

Every module implements:

```ts
interface LivingAsset {
  init(container: HTMLElement, options?: AssetOptions): void;
  destroy(): void;
  pause(): void;
  resume(): void;
  resize(): void;
  setTheme(theme: ThemeName | ThemeTokens): void;
  setData(data: unknown): void;
}
```

`AssetBase` (abstract) provides: seeded PRNG (mulberry32), RAF loop with delta clamp,
IntersectionObserver auto-pause, ResizeObserver + DPR cap, unified pointer field
(mouse+touch), FPS/frame-time/memory metrics ring buffer, PNG export, reduced-motion
accessibility mode, theme token resolution from CSS custom properties, param schema.
`Canvas2DAsset` and `ThreeAsset` specialize setup/teardown. SVG-native modules also
implement `exportSVG()`.

Input placeholders (hand tracking, microphone, camera, MIDI, WebSocket, live data)
share one `InputSource` interface with stub implementations in `src/core/inputs.ts`.

## Rendering tiers

- Canvas2D: most agent/field simulations
- Three.js (WebGL): terrain, mesh morphing, procedural clouds
- Worker + OffscreenCanvas: reaction-diffusion (with main-thread fallback); pattern
  reusable for other heavy sims
- SVG export: voronoi, hex grid, network topology, L-systems, contours

## Structure

```
/src              TypeScript source
  /core           AssetBase, Canvas2DAsset, ThreeAsset, prng, pointer, metrics, inputs, catalog
  /simulations    40 module files
  /components     UI component factories
  /themes         theme.ts token resolution
  /shaders        GLSL as exported template strings
  /workers        sim workers
  /utils          shared math/noise/color
  /export         png/svg exporters
/assets           compiled ES modules (the droppable artifact)
/themes           tokens.css (dark + light)
/vendor           three.module.js, gsap fallback
/examples         25 showcase HTML pages + shared css
/docs             generated per-module docs + index
index.html        specimen gallery
build.mjs         esbuild: TS → ES modules, bundle:false
```

Dependencies: import map → jsdelivr CDN for `three`/`gsap`; vendored copies in
`/vendor` for offline (one-line swap in the import map).

## Catalog-driven everything

`src/core/catalog.ts` is pure data: id, name, scientific subtitle, description, tags,
renderer, param schema, module path. The gallery builds SpecimenCards from it and
lazy-imports module classes on scroll; the docs generator renders it to markdown/HTML.

## SpecimenCard anatomy

Title / scientific subtitle (taxonomy line) / status badge / live canvas / description /
parameter sliders from schema / seed viewer / sparkline (FPS) / footer metadata /
buttons: pause, reset, regenerate, export PNG (SVG when supported).

## The 40 modules

flow-field, particle-system, slime-mold, physarum, voronoi, reaction-diffusion,
cellular-automata, boids, wind-map, noise-field, magnetic-field, fluid-simulation,
wave-simulation, contour-map, heat-map, terrain-generator, hex-grid,
neural-network-graph, knowledge-graph, animated-nodes, signal-propagation,
path-finding, swarm-intelligence, organic-growth, root-growth, crystal-growth,
l-system-trees, data-rivers, ribbon-trails, energy-streams, procedural-clouds,
distance-fields, vector-fields, network-topology, mesh-morphing,
generative-typography, dynamic-grid, living-background, ai-thinking, cursor-physics

## The 16 components

button, icon-button, toggle, scientific badge, mini graph, FPS counter, metadata
panel, seed viewer, timeline, parameter slider, inspector, floating tooltip, context
menu, animated cursor, loading skeleton, noise overlay

## The 25 showcases

landing-hero, ai-dashboard, portfolio, agency, data-lab, map, humanitarian-intelligence,
uae-intelligence, creative-studio, media-platform, interactive-story, museum,
scientific-report, digital-twin, knowledge-graph, weather, finance, space, biology,
architecture, genomics-browser, ocean-systems, energy-grid, materials-lab,
signal-observatory

## Quality bar

60 FPS target per module at card size; auto-pause off-screen; clean destroy (no
leaked RAF/listeners/contexts); both themes; responsive (mobile-first); reduced-motion
respected; browser-verified before completion.
