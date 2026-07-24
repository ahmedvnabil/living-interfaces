# Voronoi Tessellation

*Tessellatio Voronoi · proximity partition*

The plane partitioned by nearest-seed proximity. Cells are computed by exact half-plane intersection and drift under Lloyd-like relaxation.

| | |
|---|---|
| **ID** | `voronoi` |
| **Renderer** | canvas2d |
| **SVG export** | yes — exportSVG() / downloadSVG() |
| **Tags** | geometry |
| **Module** | `/assets/simulations/voronoi.js` |

## Parameters

| key | label | range | default |
|---|---|---|---|
| `seeds` | Seeds | 8 – 80 | 28 |
| `jitter` | Drift | 0 – 2 | 0.6 |
| `relax` | Relaxation | 0 – 1 | 0.2 |

Set live with `asset.setParam(key, value)`, or pass `{ params: { seeds: 28 } }` to `init()`.

## Usage

```html
<link rel="stylesheet" href="/themes/tokens.css">
<div id="stage" style="width:640px;height:480px"></div>
<script type="importmap">
{ "imports": { "three": "https://cdn.jsdelivr.net/npm/three@0.165.0/build/three.module.min.js",
               "gsap": "https://cdn.jsdelivr.net/npm/gsap@3.12.5/index.js" } }
</script>
<script type="module">
  import Asset from '/assets/simulations/voronoi.js';
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
