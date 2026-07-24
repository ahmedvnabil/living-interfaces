# Fluid Simulation

*Navier–Stokes · stable fluids*

Jos Stam's unconditionally stable solver: advect, diffuse, project. The pointer injects momentum and dye into an incompressible field.

| | |
|---|---|
| **ID** | `fluid-simulation` |
| **Renderer** | canvas2d |
| **SVG export** | no (PNG only) |
| **Tags** | physics, pde |
| **Module** | `/assets/simulations/fluid-simulation.js` |

## Parameters

| key | label | range | default |
|---|---|---|---|
| `res` | Grid resolution | 48 – 128 | 80 |
| `visc` | Viscosity | 0 – 0.001 | 0.0002 |
| `dye` | Dye amount | 10 – 200 | 80 |

Set live with `asset.setParam(key, value)`, or pass `{ params: { res: 80 } }` to `init()`.

## Usage

```html
<link rel="stylesheet" href="/themes/tokens.css">
<div id="stage" style="width:640px;height:480px"></div>
<script type="importmap">
{ "imports": { "three": "https://cdn.jsdelivr.net/npm/three@0.165.0/build/three.module.min.js",
               "gsap": "https://cdn.jsdelivr.net/npm/gsap@3.12.5/index.js" } }
</script>
<script type="module">
  import Asset from '/assets/simulations/fluid-simulation.js';
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
