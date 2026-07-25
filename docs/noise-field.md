# Noise Field

*Campus perturbationis · fBm scalar field*

A fractal Brownian motion scalar field sampled on a lattice and rendered as a displaced dot matrix — the raw material of procedural worlds.

| | |
|---|---|
| **ID** | `noise-field` |
| **Renderer** | canvas2d |
| **SVG export** | no (PNG only) |
| **Tags** | field, noise |
| **Module** | `/assets/simulations/noise-field.js` |

## Parameters

| key | label | range | default |
|---|---|---|---|
| `grid` | Grid pitch | 6 – 30 | 14 |
| `octaves` | Octaves | 1 – 7 | 4 |
| `amp` | Displacement | 0 – 30 | 10 |
| `flow` | Evolution | 0 – 1 | 0.2 |

Set live with `asset.setParam(key, value)`, or pass `{ params: { grid: 14 } }` to `init()`.

## Usage

```html
<link rel="stylesheet" href="/themes/tokens.css">
<div id="stage" style="width:640px;height:480px"></div>
<script type="importmap">
{ "imports": { "three": "https://cdn.jsdelivr.net/npm/three@0.165.0/build/three.module.min.js" } }
</script>
<script type="module">
  import Asset from '/assets/simulations/noise-field.js';
  const asset = new Asset();
  asset.init(document.getElementById('stage'), { seed: 42 });
  // asset.pause() · resume() · resize() · setTheme('light') · setData(...) · destroy()
</script>
```

## Lifecycle contract

Every Living Asset implements `init(container, options?)`, `destroy()`, `pause()`,
`resume()`, `resize()` (also automatic via ResizeObserver), `setTheme(name | tokens)`
and `setData(payload)`. Rendering auto-pauses off-screen and honors
`prefers-reduced-motion`. Seeded runs reproduce exactly: pass `{ seed }`.
