# Wind Map

*Charta ventorum · streamline advection*

Meteorological streamlines traced through a slowly rotating synoptic field. Particle age maps to opacity, reading as wind intensity.

| | |
|---|---|
| **ID** | `wind-map` |
| **Renderer** | canvas2d |
| **SVG export** | no (PNG only) |
| **Tags** | field, geo |
| **Module** | `/assets/simulations/wind-map.js` |

## Parameters

| key | label | range | default |
|---|---|---|---|
| `lines` | Streamlines | 200 – 3000 | 1100 |
| `scale` | Synoptic scale | 0.5 – 4 | 1.4 |
| `speed` | Wind speed | 0.2 – 3 | 1.1 |

Set live with `asset.setParam(key, value)`, or pass `{ params: { lines: 1100 } }` to `init()`.

## Usage

```html
<link rel="stylesheet" href="/themes/tokens.css">
<div id="stage" style="width:640px;height:480px"></div>
<script type="importmap">
{ "imports": { "three": "https://cdn.jsdelivr.net/npm/three@0.165.0/build/three.module.min.js" } }
</script>
<script type="module">
  import Asset from '/assets/simulations/wind-map.js';
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
