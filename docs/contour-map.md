# Contour Map

*Isohypsae · marching squares*

Elevation isolines extracted by marching squares from an evolving fBm terrain. Index contours are weighted like survey sheets.

| | |
|---|---|
| **ID** | `contour-map` |
| **Renderer** | canvas2d |
| **SVG export** | yes — exportSVG() / downloadSVG() |
| **Tags** | geo, field |
| **Module** | `/assets/simulations/contour-map.js` |

## Parameters

| key | label | range | default |
|---|---|---|---|
| `levels` | Contour levels | 4 – 24 | 12 |
| `scale` | Terrain scale | 0.5 – 4 | 1.6 |
| `drift` | Drift | 0 – 0.5 | 0.06 |

Set live with `asset.setParam(key, value)`, or pass `{ params: { levels: 12 } }` to `init()`.

## Usage

```html
<link rel="stylesheet" href="/themes/tokens.css">
<div id="stage" style="width:640px;height:480px"></div>
<script type="importmap">
{ "imports": { "three": "https://cdn.jsdelivr.net/npm/three@0.165.0/build/three.module.min.js",
               "gsap": "https://cdn.jsdelivr.net/npm/gsap@3.12.5/index.js" } }
</script>
<script type="module">
  import Asset from '/assets/simulations/contour-map.js';
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
