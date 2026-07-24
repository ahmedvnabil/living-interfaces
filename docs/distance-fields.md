# Distance Fields

*Campi distantiae · signed distance functions*

A scene described purely as signed distance to primitives, visualized as banded isolines. Smooth-minimum blending merges bodies like mercury.

| | |
|---|---|
| **ID** | `distance-fields` |
| **Renderer** | canvas2d |
| **SVG export** | no (PNG only) |
| **Tags** | geometry, sdf |
| **Module** | `/assets/simulations/distance-fields.js` |

## Parameters

| key | label | range | default |
|---|---|---|---|
| `shapes` | Primitives | 2 – 8 | 4 |
| `bands` | Iso bands | 4 – 30 | 14 |
| `blend` | Smooth-min k | 5 – 80 | 40 |

Set live with `asset.setParam(key, value)`, or pass `{ params: { shapes: 4 } }` to `init()`.

## Usage

```html
<link rel="stylesheet" href="/themes/tokens.css">
<div id="stage" style="width:640px;height:480px"></div>
<script type="importmap">
{ "imports": { "three": "https://cdn.jsdelivr.net/npm/three@0.165.0/build/three.module.min.js",
               "gsap": "https://cdn.jsdelivr.net/npm/gsap@3.12.5/index.js" } }
</script>
<script type="module">
  import Asset from '/assets/simulations/distance-fields.js';
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
