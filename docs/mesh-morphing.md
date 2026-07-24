# Mesh Morphing

*Metamorphosis polygonalis · vertex displacement*

An icosphere whose vertices ride layered noise between geometric archetypes. Wireframe over depth-toned faces, rotating like a specimen.

| | |
|---|---|
| **ID** | `mesh-morphing` |
| **Renderer** | webgl |
| **SVG export** | no (PNG only) |
| **Tags** | 3d, geometry |
| **Module** | `/assets/simulations/mesh-morphing.js` |

## Parameters

| key | label | range | default |
|---|---|---|---|
| `amp` | Displacement | 0 – 1.2 | 0.45 |
| `freq` | Noise frequency | 0.5 – 5 | 1.8 |
| `speed` | Morph speed | 0 – 2 | 0.5 |

Set live with `asset.setParam(key, value)`, or pass `{ params: { amp: 0.45 } }` to `init()`.

## Usage

```html
<link rel="stylesheet" href="/themes/tokens.css">
<div id="stage" style="width:640px;height:480px"></div>
<script type="importmap">
{ "imports": { "three": "https://cdn.jsdelivr.net/npm/three@0.165.0/build/three.module.min.js",
               "gsap": "https://cdn.jsdelivr.net/npm/gsap@3.12.5/index.js" } }
</script>
<script type="module">
  import Asset from '/assets/simulations/mesh-morphing.js';
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
