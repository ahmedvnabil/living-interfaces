# Organic Growth

*Crescentia differentialis · curve buckling*

A closed curve that resamples, repels and relaxes each step. Differential growth buckles it into coral-like folds.

| | |
|---|---|
| **ID** | `organic-growth` |
| **Renderer** | canvas2d |
| **SVG export** | yes — exportSVG() / downloadSVG() |
| **Tags** | biology, geometry |
| **Module** | `/assets/simulations/organic-growth.js` |

## Parameters

| key | label | range | default |
|---|---|---|---|
| `growth` | Growth rate | 0.1 – 2 | 0.7 |
| `repulsion` | Repulsion | 2 – 20 | 8 |
| `smooth` | Smoothing | 0 – 1 | 0.4 |

Set live with `asset.setParam(key, value)`, or pass `{ params: { growth: 0.7 } }` to `init()`.

## Usage

```html
<link rel="stylesheet" href="/themes/tokens.css">
<div id="stage" style="width:640px;height:480px"></div>
<script type="importmap">
{ "imports": { "three": "https://cdn.jsdelivr.net/npm/three@0.165.0/build/three.module.min.js",
               "gsap": "https://cdn.jsdelivr.net/npm/gsap@3.12.5/index.js" } }
</script>
<script type="module">
  import Asset from '/assets/simulations/organic-growth.js';
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
