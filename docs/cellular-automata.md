# Cellular Automata

*Automata cellularia · discrete dynamics*

A toroidal lattice evolving under local birth/survival rules. Life-like rulesets are explored live; gliders and still lifes emerge unprompted.

| | |
|---|---|
| **ID** | `cellular-automata` |
| **Renderer** | canvas2d |
| **SVG export** | no (PNG only) |
| **Tags** | discrete, emergence |
| **Module** | `/assets/simulations/cellular-automata.js` |

## Parameters

| key | label | range | default |
|---|---|---|---|
| `cell` | Cell size | 3 – 14 | 6 |
| `fill` | Initial density | 0.05 – 0.6 | 0.22 |
| `rate` | Generations /s | 2 – 30 | 12 |

Set live with `asset.setParam(key, value)`, or pass `{ params: { cell: 6 } }` to `init()`.

## Usage

```html
<link rel="stylesheet" href="/themes/tokens.css">
<div id="stage" style="width:640px;height:480px"></div>
<script type="importmap">
{ "imports": { "three": "https://cdn.jsdelivr.net/npm/three@0.165.0/build/three.module.min.js" } }
</script>
<script type="module">
  import Asset from '/assets/simulations/cellular-automata.js';
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
