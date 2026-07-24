# Terrain Generator

*Orogenesis proceduralis · fBm displacement*

A displaced wireframe lattice under multi-octave noise, lit as an orbiting survey model. Regeneration re-seeds the mountain range.

| | |
|---|---|
| **ID** | `terrain-generator` |
| **Renderer** | webgl |
| **SVG export** | no (PNG only) |
| **Tags** | 3d, geo |
| **Module** | `/assets/simulations/terrain-generator.js` |

## Parameters

| key | label | range | default |
|---|---|---|---|
| `relief` | Relief | 0.2 – 3 | 1.1 |
| `scale` | Feature scale | 0.5 – 4 | 1.5 |
| `detail` | Octaves | 1 – 7 | 5 |

Set live with `asset.setParam(key, value)`, or pass `{ params: { relief: 1.1 } }` to `init()`.

## Usage

```html
<link rel="stylesheet" href="/themes/tokens.css">
<div id="stage" style="width:640px;height:480px"></div>
<script type="importmap">
{ "imports": { "three": "https://cdn.jsdelivr.net/npm/three@0.165.0/build/three.module.min.js",
               "gsap": "https://cdn.jsdelivr.net/npm/gsap@3.12.5/index.js" } }
</script>
<script type="module">
  import Asset from '/assets/simulations/terrain-generator.js';
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
