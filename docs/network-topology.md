# Network Topology

*Topologia retis · hierarchical infrastructure*

Core, aggregation and edge tiers with live health states and traffic pulses. An operations diagram drawn as an engineering document.

| | |
|---|---|
| **ID** | `network-topology` |
| **Renderer** | canvas2d |
| **SVG export** | yes — exportSVG() / downloadSVG() |
| **Tags** | network, infra |
| **Module** | `/assets/simulations/network-topology.js` |

## Parameters

| key | label | range | default |
|---|---|---|---|
| `edge` | Edge nodes | 4 – 24 | 12 |
| `traffic` | Traffic rate | 0.1 – 3 | 1 |
| `fail` | Fault probability | 0 – 0.02 | 0.004 |

Set live with `asset.setParam(key, value)`, or pass `{ params: { edge: 12 } }` to `init()`.

## Usage

```html
<link rel="stylesheet" href="/themes/tokens.css">
<div id="stage" style="width:640px;height:480px"></div>
<script type="importmap">
{ "imports": { "three": "https://cdn.jsdelivr.net/npm/three@0.165.0/build/three.module.min.js" } }
</script>
<script type="module">
  import Asset from '/assets/simulations/network-topology.js';
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
