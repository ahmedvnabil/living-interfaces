# Wave Simulation

*Aequatio undarum · 2-D wave equation*

The discrete wave equation on a height lattice with damped boundaries. Pointer impacts radiate, interfere and reflect.

| | |
|---|---|
| **ID** | `wave-simulation` |
| **Renderer** | canvas2d |
| **SVG export** | no (PNG only) |
| **Tags** | physics, pde |
| **Module** | `/assets/simulations/wave-simulation.js` |

## Parameters

| key | label | range | default |
|---|---|---|---|
| `res` | Lattice | 64 – 200 | 120 |
| `damping` | Damping | 0.95 – 0.999 | 0.992 |
| `impulse` | Impulse | 50 – 800 | 300 |

Set live with `asset.setParam(key, value)`, or pass `{ params: { res: 120 } }` to `init()`.

## Usage

```html
<link rel="stylesheet" href="/themes/tokens.css">
<div id="stage" style="width:640px;height:480px"></div>
<script type="importmap">
{ "imports": { "three": "https://cdn.jsdelivr.net/npm/three@0.165.0/build/three.module.min.js",
               "gsap": "https://cdn.jsdelivr.net/npm/gsap@3.12.5/index.js" } }
</script>
<script type="module">
  import Asset from '/assets/simulations/wave-simulation.js';
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
