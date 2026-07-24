# Neural Network Graph

*Rete neurale · feed-forward activations*

A layered perceptron with live activations pulsing along weighted edges. Edge weight maps to stroke width; sign maps to tone.

| | |
|---|---|
| **ID** | `neural-network-graph` |
| **Renderer** | canvas2d |
| **SVG export** | yes — exportSVG() / downloadSVG() |
| **Tags** | network, ml |
| **Module** | `/assets/simulations/neural-network-graph.js` |

## Parameters

| key | label | range | default |
|---|---|---|---|
| `layers` | Hidden layers | 1 – 5 | 3 |
| `width` | Neurons / layer | 3 – 12 | 6 |
| `rate` | Signal rate | 0.2 – 3 | 1 |

Set live with `asset.setParam(key, value)`, or pass `{ params: { layers: 3 } }` to `init()`.

## Usage

```html
<link rel="stylesheet" href="/themes/tokens.css">
<div id="stage" style="width:640px;height:480px"></div>
<script type="importmap">
{ "imports": { "three": "https://cdn.jsdelivr.net/npm/three@0.165.0/build/three.module.min.js",
               "gsap": "https://cdn.jsdelivr.net/npm/gsap@3.12.5/index.js" } }
</script>
<script type="module">
  import Asset from '/assets/simulations/neural-network-graph.js';
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
