# Swarm Intelligence

*Intelligentia gregis · particle swarm optimization*

A particle swarm minimizing a moving objective landscape. Personal and global bests pull the population toward consensus.

| | |
|---|---|
| **ID** | `swarm-intelligence` |
| **Renderer** | canvas2d |
| **SVG export** | no (PNG only) |
| **Tags** | agents, optimization |
| **Module** | `/assets/simulations/swarm-intelligence.js` |

## Parameters

| key | label | range | default |
|---|---|---|---|
| `count` | Particles | 20 – 300 | 90 |
| `inertia` | Inertia | 0.5 – 1 | 0.86 |
| `social` | Social pull | 0 – 2 | 0.9 |

Set live with `asset.setParam(key, value)`, or pass `{ params: { count: 90 } }` to `init()`.

## Usage

```html
<link rel="stylesheet" href="/themes/tokens.css">
<div id="stage" style="width:640px;height:480px"></div>
<script type="importmap">
{ "imports": { "three": "https://cdn.jsdelivr.net/npm/three@0.165.0/build/three.module.min.js",
               "gsap": "https://cdn.jsdelivr.net/npm/gsap@3.12.5/index.js" } }
</script>
<script type="module">
  import Asset from '/assets/simulations/swarm-intelligence.js';
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
