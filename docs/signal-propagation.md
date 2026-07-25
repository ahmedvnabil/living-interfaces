# Signal Propagation

*Propagatio signalis · graph traversal*

Impulses released from source nodes travel edge-by-edge with per-hop latency and decay, visualizing information spread through a network.

| | |
|---|---|
| **ID** | `signal-propagation` |
| **Renderer** | canvas2d |
| **SVG export** | no (PNG only) |
| **Tags** | network, dynamics |
| **Module** | `/assets/simulations/signal-propagation.js` |

## Parameters

| key | label | range | default |
|---|---|---|---|
| `nodes` | Nodes | 16 – 120 | 54 |
| `rate` | Emission rate | 0.1 – 3 | 0.8 |
| `decay` | Hop decay | 0.5 – 1 | 0.86 |

Set live with `asset.setParam(key, value)`, or pass `{ params: { nodes: 54 } }` to `init()`.

## Usage

```html
<link rel="stylesheet" href="/themes/tokens.css">
<div id="stage" style="width:640px;height:480px"></div>
<script type="importmap">
{ "imports": { "three": "https://cdn.jsdelivr.net/npm/three@0.165.0/build/three.module.min.js" } }
</script>
<script type="module">
  import Asset from '/assets/simulations/signal-propagation.js';
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
