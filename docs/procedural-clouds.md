# Procedural Clouds

*Nubes procedurales · volumetric fBm*

Ray-marched pseudo-volumetric cloud strata in a fragment shader — four octaves of drifting fBm density with height falloff.

| | |
|---|---|
| **ID** | `procedural-clouds` |
| **Renderer** | webgl |
| **SVG export** | no (PNG only) |
| **Tags** | 3d, atmosphere |
| **Module** | `/assets/simulations/procedural-clouds.js` |

## Parameters

| key | label | range | default |
|---|---|---|---|
| `coverage` | Coverage | 0.2 – 0.8 | 0.5 |
| `speed` | Wind | 0 – 2 | 0.4 |
| `detail` | Detail | 1 – 6 | 4 |

Set live with `asset.setParam(key, value)`, or pass `{ params: { coverage: 0.5 } }` to `init()`.

## Usage

```html
<link rel="stylesheet" href="/themes/tokens.css">
<div id="stage" style="width:640px;height:480px"></div>
<script type="importmap">
{ "imports": { "three": "https://cdn.jsdelivr.net/npm/three@0.165.0/build/three.module.min.js",
               "gsap": "https://cdn.jsdelivr.net/npm/gsap@3.12.5/index.js" } }
</script>
<script type="module">
  import Asset from '/assets/simulations/procedural-clouds.js';
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
