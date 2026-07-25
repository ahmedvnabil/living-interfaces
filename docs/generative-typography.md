# Generative Typography

*Typographia generativa · glyph particle sampling*

Glyph outlines sampled to a particle lattice that scatters and reassembles. Text remains data; setData() retypes the specimen.

| | |
|---|---|
| **ID** | `generative-typography` |
| **Renderer** | canvas2d |
| **SVG export** | no (PNG only) |
| **Tags** | typography, particles |
| **Module** | `/assets/simulations/generative-typography.js` |

## Parameters

| key | label | range | default |
|---|---|---|---|
| `density` | Sample density | 2 – 10 | 5 |
| `scatter` | Scatter | 0 – 200 | 60 |
| `return` | Return spring | 0.01 – 0.3 | 0.08 |

Set live with `asset.setParam(key, value)`, or pass `{ params: { density: 5 } }` to `init()`.

## Usage

```html
<link rel="stylesheet" href="/themes/tokens.css">
<div id="stage" style="width:640px;height:480px"></div>
<script type="importmap">
{ "imports": { "three": "https://cdn.jsdelivr.net/npm/three@0.165.0/build/three.module.min.js" } }
</script>
<script type="module">
  import Asset from '/assets/simulations/generative-typography.js';
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
