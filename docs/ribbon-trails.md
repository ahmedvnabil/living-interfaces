# Ribbon Trails

*Taeniae sequentes · spring-chain kinematics*

Ribbons of chained springs pursuing attractors (or the pointer). Width tapers along arclength like a pen with momentum.

| | |
|---|---|
| **ID** | `ribbon-trails` |
| **Renderer** | canvas2d |
| **SVG export** | no (PNG only) |
| **Tags** | motion, interaction |
| **Module** | `/assets/simulations/ribbon-trails.js` |

## Parameters

| key | label | range | default |
|---|---|---|---|
| `ribbons` | Ribbons | 1 – 12 | 5 |
| `segments` | Segments | 10 – 80 | 36 |
| `stiffness` | Stiffness | 0.05 – 0.6 | 0.22 |

Set live with `asset.setParam(key, value)`, or pass `{ params: { ribbons: 5 } }` to `init()`.

## Usage

```html
<link rel="stylesheet" href="/themes/tokens.css">
<div id="stage" style="width:640px;height:480px"></div>
<script type="importmap">
{ "imports": { "three": "https://cdn.jsdelivr.net/npm/three@0.165.0/build/three.module.min.js" } }
</script>
<script type="module">
  import Asset from '/assets/simulations/ribbon-trails.js';
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
