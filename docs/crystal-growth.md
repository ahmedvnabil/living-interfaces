# Crystal Growth

*Crystallisatio · diffusion-limited aggregation*

Random walkers freezing on contact with the aggregate. Fractal dendrites grow with dimension ≈ 1.71 — matter organizing itself.

| | |
|---|---|
| **ID** | `crystal-growth` |
| **Renderer** | canvas2d |
| **SVG export** | no (PNG only) |
| **Tags** | physics, fractal |
| **Module** | `/assets/simulations/crystal-growth.js` |

## Parameters

| key | label | range | default |
|---|---|---|---|
| `walkers` | Walkers | 100 – 2000 | 700 |
| `stick` | Stick probability | 0.1 – 1 | 0.7 |
| `sym` | Symmetry | 1 – 8 | 1 |

Set live with `asset.setParam(key, value)`, or pass `{ params: { walkers: 700 } }` to `init()`.

## Usage

```html
<link rel="stylesheet" href="/themes/tokens.css">
<div id="stage" style="width:640px;height:480px"></div>
<script type="importmap">
{ "imports": { "three": "https://cdn.jsdelivr.net/npm/three@0.165.0/build/three.module.min.js" } }
</script>
<script type="module">
  import Asset from '/assets/simulations/crystal-growth.js';
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
