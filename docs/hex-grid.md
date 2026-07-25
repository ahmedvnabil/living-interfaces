# Hex Grid

*Reticulum hexagonale · axial lattice*

An axial-coordinate hexagonal lattice with propagating activity waves. Cell state renders as fill weight, not glow.

| | |
|---|---|
| **ID** | `hex-grid` |
| **Renderer** | canvas2d |
| **SVG export** | yes — exportSVG() / downloadSVG() |
| **Tags** | geometry, grid |
| **Module** | `/assets/simulations/hex-grid.js` |

## Parameters

| key | label | range | default |
|---|---|---|---|
| `size` | Cell radius | 8 – 36 | 18 |
| `waves` | Wave rate | 0.1 – 2 | 0.6 |
| `falloff` | Falloff | 0.5 – 4 | 1.6 |

Set live with `asset.setParam(key, value)`, or pass `{ params: { size: 18 } }` to `init()`.

## Usage

```html
<link rel="stylesheet" href="/themes/tokens.css">
<div id="stage" style="width:640px;height:480px"></div>
<script type="importmap">
{ "imports": { "three": "https://cdn.jsdelivr.net/npm/three@0.165.0/build/three.module.min.js" } }
</script>
<script type="module">
  import Asset from '/assets/simulations/hex-grid.js';
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
