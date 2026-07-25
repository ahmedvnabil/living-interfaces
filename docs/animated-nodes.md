# Animated Nodes

*Constellatio nodorum · proximity linking*

Drifting nodes linked when nearer than a threshold radius. Link opacity encodes proximity — the quiet ambient classic, done with restraint.

| | |
|---|---|
| **ID** | `animated-nodes` |
| **Renderer** | canvas2d |
| **SVG export** | no (PNG only) |
| **Tags** | network, ambient |
| **Module** | `/assets/simulations/animated-nodes.js` |

## Parameters

| key | label | range | default |
|---|---|---|---|
| `count` | Nodes | 20 – 200 | 70 |
| `radius` | Link radius | 40 – 220 | 120 |
| `speed` | Drift speed | 0.05 – 1.5 | 0.4 |

Set live with `asset.setParam(key, value)`, or pass `{ params: { count: 70 } }` to `init()`.

## Usage

```html
<link rel="stylesheet" href="/themes/tokens.css">
<div id="stage" style="width:640px;height:480px"></div>
<script type="importmap">
{ "imports": { "three": "https://cdn.jsdelivr.net/npm/three@0.165.0/build/three.module.min.js" } }
</script>
<script type="module">
  import Asset from '/assets/simulations/animated-nodes.js';
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
