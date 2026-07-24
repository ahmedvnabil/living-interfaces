# Data Rivers

*Flumina datorum · stacked stream series*

Time-series layers flowing as a braided stream. Band thickness encodes magnitude; setData() feeds live series into the river.

| | |
|---|---|
| **ID** | `data-rivers` |
| **Renderer** | canvas2d |
| **SVG export** | yes — exportSVG() / downloadSVG() |
| **Tags** | data, flow |
| **Module** | `/assets/simulations/data-rivers.js` |

## Parameters

| key | label | range | default |
|---|---|---|---|
| `series` | Series | 3 – 10 | 5 |
| `speed` | Flow speed | 0.2 – 3 | 1 |
| `turbulence` | Turbulence | 0 – 1 | 0.3 |

Set live with `asset.setParam(key, value)`, or pass `{ params: { series: 5 } }` to `init()`.

## Usage

```html
<link rel="stylesheet" href="/themes/tokens.css">
<div id="stage" style="width:640px;height:480px"></div>
<script type="importmap">
{ "imports": { "three": "https://cdn.jsdelivr.net/npm/three@0.165.0/build/three.module.min.js",
               "gsap": "https://cdn.jsdelivr.net/npm/gsap@3.12.5/index.js" } }
</script>
<script type="module">
  import Asset from '/assets/simulations/data-rivers.js';
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
