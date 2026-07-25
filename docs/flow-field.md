# Flow Field

*Advectio particularum · curl noise*

Particles advected through a divergence-free velocity field derived from the curl of gradient noise. Streamline density reveals the underlying vector topology.

| | |
|---|---|
| **ID** | `flow-field` |
| **Renderer** | canvas2d |
| **SVG export** | no (PNG only) |
| **Tags** | field, particles |
| **Module** | `/assets/simulations/flow-field.js` |

## Parameters

| key | label | range | default |
|---|---|---|---|
| `count` | Particles | 200 – 4000 | 1400 |
| `scale` | Field scale | 0.5 – 6 | 2.2 |
| `speed` | Speed | 0.2 – 3 | 1 |
| `drift` | Temporal drift | 0 – 1 | 0.15 |

Set live with `asset.setParam(key, value)`, or pass `{ params: { count: 1400 } }` to `init()`.

## Usage

```html
<link rel="stylesheet" href="/themes/tokens.css">
<div id="stage" style="width:640px;height:480px"></div>
<script type="importmap">
{ "imports": { "three": "https://cdn.jsdelivr.net/npm/three@0.165.0/build/three.module.min.js" } }
</script>
<script type="module">
  import Asset from '/assets/simulations/flow-field.js';
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
