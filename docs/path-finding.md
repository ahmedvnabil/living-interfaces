# Path Finding

*Inventio itineris · A* search*

A* exploring a weighted grid maze: open set, closed set and the final geodesic rendered as archaeology of the search.

| | |
|---|---|
| **ID** | `path-finding` |
| **Renderer** | canvas2d |
| **SVG export** | no (PNG only) |
| **Tags** | algorithm, grid |
| **Module** | `/assets/simulations/path-finding.js` |

## Parameters

| key | label | range | default |
|---|---|---|---|
| `cell` | Cell size | 8 – 26 | 14 |
| `walls` | Obstacle density | 0.1 – 0.45 | 0.28 |
| `speed` | Search speed | 1 – 40 | 12 |

Set live with `asset.setParam(key, value)`, or pass `{ params: { cell: 14 } }` to `init()`.

## Usage

```html
<link rel="stylesheet" href="/themes/tokens.css">
<div id="stage" style="width:640px;height:480px"></div>
<script type="importmap">
{ "imports": { "three": "https://cdn.jsdelivr.net/npm/three@0.165.0/build/three.module.min.js" } }
</script>
<script type="module">
  import Asset from '/assets/simulations/path-finding.js';
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
