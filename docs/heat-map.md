# Heat Map

*Diffusio caloris · Fourier lattice*

Heat sources diffusing across a conductive plate under the discrete heat equation. The pointer is a moving thermode.

| | |
|---|---|
| **ID** | `heat-map` |
| **Renderer** | canvas2d |
| **SVG export** | no (PNG only) |
| **Tags** | physics, field |
| **Module** | `/assets/simulations/heat-map.js` |

## Parameters

| key | label | range | default |
|---|---|---|---|
| `sources` | Sources | 1 – 8 | 3 |
| `conduct` | Conductivity | 0.05 – 0.3 | 0.16 |
| `cool` | Cooling | 0.9 – 0.999 | 0.985 |

Set live with `asset.setParam(key, value)`, or pass `{ params: { sources: 3 } }` to `init()`.

## Usage

```html
<link rel="stylesheet" href="/themes/tokens.css">
<div id="stage" style="width:640px;height:480px"></div>
<script type="importmap">
{ "imports": { "three": "https://cdn.jsdelivr.net/npm/three@0.165.0/build/three.module.min.js" } }
</script>
<script type="module">
  import Asset from '/assets/simulations/heat-map.js';
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
