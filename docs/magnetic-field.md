# Magnetic Field

*Campus magneticus · dipole lines*

Field lines integrated from superposed magnetic dipoles. Poles are draggable; the pointer itself carries a weak charge.

| | |
|---|---|
| **ID** | `magnetic-field` |
| **Renderer** | canvas2d |
| **SVG export** | yes — exportSVG() / downloadSVG() |
| **Tags** | physics, field |
| **Module** | `/assets/simulations/magnetic-field.js` |

## Parameters

| key | label | range | default |
|---|---|---|---|
| `poles` | Dipoles | 1 – 6 | 2 |
| `lines` | Lines / pole | 8 – 48 | 22 |
| `strength` | Strength | 0.2 – 3 | 1 |

Set live with `asset.setParam(key, value)`, or pass `{ params: { poles: 2 } }` to `init()`.

## Usage

```html
<link rel="stylesheet" href="/themes/tokens.css">
<div id="stage" style="width:640px;height:480px"></div>
<script type="importmap">
{ "imports": { "three": "https://cdn.jsdelivr.net/npm/three@0.165.0/build/three.module.min.js" } }
</script>
<script type="module">
  import Asset from '/assets/simulations/magnetic-field.js';
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
