# Energy Streams

*Flumina energiae · Bézier transport*

Quanta transported along curved conduits between terminals. Throughput, direction and congestion are readable at a glance.

| | |
|---|---|
| **ID** | `energy-streams` |
| **Renderer** | canvas2d |
| **SVG export** | no (PNG only) |
| **Tags** | flow, network |
| **Module** | `/assets/simulations/energy-streams.js` |

## Parameters

| key | label | range | default |
|---|---|---|---|
| `conduits` | Conduits | 2 – 12 | 6 |
| `quanta` | Quanta / conduit | 4 – 40 | 16 |
| `speed` | Transport speed | 0.2 – 3 | 1 |

Set live with `asset.setParam(key, value)`, or pass `{ params: { conduits: 6 } }` to `init()`.

## Usage

```html
<link rel="stylesheet" href="/themes/tokens.css">
<div id="stage" style="width:640px;height:480px"></div>
<script type="importmap">
{ "imports": { "three": "https://cdn.jsdelivr.net/npm/three@0.165.0/build/three.module.min.js",
               "gsap": "https://cdn.jsdelivr.net/npm/gsap@3.12.5/index.js" } }
</script>
<script type="module">
  import Asset from '/assets/simulations/energy-streams.js';
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
