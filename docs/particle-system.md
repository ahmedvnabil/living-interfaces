# Particle System

*Systema corpusculorum · forces*

A general emitter under gravity, drag and pointer attraction. Each particle integrates Newtonian forces with semi-implicit Euler stepping.

| | |
|---|---|
| **ID** | `particle-system` |
| **Renderer** | canvas2d |
| **SVG export** | no (PNG only) |
| **Tags** | particles, physics |
| **Module** | `/assets/simulations/particle-system.js` |

## Parameters

| key | label | range | default |
|---|---|---|---|
| `rate` | Emission rate | 5 – 300 | 90 |
| `gravity` | Gravity | -1 – 1 | 0.12 |
| `drag` | Drag | 0.8 – 1 | 0.985 |
| `life` | Lifetime s | 1 – 8 | 3.5 |

Set live with `asset.setParam(key, value)`, or pass `{ params: { rate: 90 } }` to `init()`.

## Usage

```html
<link rel="stylesheet" href="/themes/tokens.css">
<div id="stage" style="width:640px;height:480px"></div>
<script type="importmap">
{ "imports": { "three": "https://cdn.jsdelivr.net/npm/three@0.165.0/build/three.module.min.js",
               "gsap": "https://cdn.jsdelivr.net/npm/gsap@3.12.5/index.js" } }
</script>
<script type="module">
  import Asset from '/assets/simulations/particle-system.js';
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
