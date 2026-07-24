# Vector Fields

*Campus vectorius · quiver plot*

A quiver lattice sampling a time-varying analytic field. Arrow length and weight encode magnitude — the textbook figure, alive.

| | |
|---|---|
| **ID** | `vector-fields` |
| **Renderer** | canvas2d |
| **SVG export** | yes — exportSVG() / downloadSVG() |
| **Tags** | field, math |
| **Module** | `/assets/simulations/vector-fields.js` |

## Parameters

| key | label | range | default |
|---|---|---|---|
| `pitch` | Lattice pitch | 14 – 48 | 26 |
| `scale` | Field scale | 0.5 – 4 | 1.5 |
| `evolve` | Evolution | 0 – 1 | 0.25 |

Set live with `asset.setParam(key, value)`, or pass `{ params: { pitch: 26 } }` to `init()`.

## Usage

```html
<link rel="stylesheet" href="/themes/tokens.css">
<div id="stage" style="width:640px;height:480px"></div>
<script type="importmap">
{ "imports": { "three": "https://cdn.jsdelivr.net/npm/three@0.165.0/build/three.module.min.js",
               "gsap": "https://cdn.jsdelivr.net/npm/gsap@3.12.5/index.js" } }
</script>
<script type="module">
  import Asset from '/assets/simulations/vector-fields.js';
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
