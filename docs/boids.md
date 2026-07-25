# Boids

*Grex simulatus · Reynolds flocking*

Separation, alignment and cohesion — three local rules integrated over a spatial hash. Global flocking order emerges without a leader.

| | |
|---|---|
| **ID** | `boids` |
| **Renderer** | canvas2d |
| **SVG export** | no (PNG only) |
| **Tags** | agents, emergence |
| **Module** | `/assets/simulations/boids.js` |

## Parameters

| key | label | range | default |
|---|---|---|---|
| `count` | Boids | 40 – 600 | 220 |
| `cohesion` | Cohesion | 0 – 2 | 0.9 |
| `separation` | Separation | 0 – 2 | 1.1 |
| `speed` | Max speed | 0.5 – 4 | 1.8 |

Set live with `asset.setParam(key, value)`, or pass `{ params: { count: 220 } }` to `init()`.

## Usage

```html
<link rel="stylesheet" href="/themes/tokens.css">
<div id="stage" style="width:640px;height:480px"></div>
<script type="importmap">
{ "imports": { "three": "https://cdn.jsdelivr.net/npm/three@0.165.0/build/three.module.min.js" } }
</script>
<script type="module">
  import Asset from '/assets/simulations/boids.js';
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
