# Physarum

*Chemotaxis simulata · trail following*

Classic agent-based physarum: sense, rotate, deposit, diffuse, decay. Millions of micro-decisions condense into vascular patterns.

| | |
|---|---|
| **ID** | `physarum` |
| **Renderer** | canvas2d |
| **SVG export** | no (PNG only) |
| **Tags** | biology, agents |
| **Module** | `/assets/simulations/physarum.js` |

## Parameters

| key | label | range | default |
|---|---|---|---|
| `agents` | Agents | 500 – 8000 | 3000 |
| `turn` | Turn rate | 0.05 – 1 | 0.35 |
| `sensorDist` | Sensor distance | 2 – 20 | 9 |
| `decay` | Decay | 0.85 – 0.99 | 0.93 |

Set live with `asset.setParam(key, value)`, or pass `{ params: { agents: 3000 } }` to `init()`.

## Usage

```html
<link rel="stylesheet" href="/themes/tokens.css">
<div id="stage" style="width:640px;height:480px"></div>
<script type="importmap">
{ "imports": { "three": "https://cdn.jsdelivr.net/npm/three@0.165.0/build/three.module.min.js" } }
</script>
<script type="module">
  import Asset from '/assets/simulations/physarum.js';
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
