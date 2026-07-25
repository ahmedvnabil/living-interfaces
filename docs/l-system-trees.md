# L-System Trees

*Systema Lindenmayer · grammar rewriting*

Bracketed L-system strings rewritten and interpreted as turtle graphics. Each seed is a new species; growth animates generation depth.

| | |
|---|---|
| **ID** | `l-system-trees` |
| **Renderer** | canvas2d |
| **SVG export** | yes — exportSVG() / downloadSVG() |
| **Tags** | biology, grammar |
| **Module** | `/assets/simulations/l-system-trees.js` |

## Parameters

| key | label | range | default |
|---|---|---|---|
| `depth` | Generations | 2 – 7 | 5 |
| `angle` | Branch angle | 10 – 45 | 24 |
| `decay` | Length decay | 0.5 – 0.85 | 0.7 |

Set live with `asset.setParam(key, value)`, or pass `{ params: { depth: 5 } }` to `init()`.

## Usage

```html
<link rel="stylesheet" href="/themes/tokens.css">
<div id="stage" style="width:640px;height:480px"></div>
<script type="importmap">
{ "imports": { "three": "https://cdn.jsdelivr.net/npm/three@0.165.0/build/three.module.min.js" } }
</script>
<script type="module">
  import Asset from '/assets/simulations/l-system-trees.js';
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
