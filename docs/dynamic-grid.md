# Dynamic Grid

*Reticulum reactivum · cursor field response*

A typographic lattice whose weight, scale and tone respond to pointer distance — the interface itself as a field instrument.

| | |
|---|---|
| **ID** | `dynamic-grid` |
| **Renderer** | canvas2d |
| **SVG export** | no (PNG only) |
| **Tags** | grid, interaction |
| **Module** | `/assets/simulations/dynamic-grid.js` |

## Parameters

| key | label | range | default |
|---|---|---|---|
| `pitch` | Pitch | 16 – 60 | 32 |
| `radius` | Influence radius | 60 – 300 | 150 |
| `gain` | Response gain | 0.2 – 3 | 1.2 |

Set live with `asset.setParam(key, value)`, or pass `{ params: { pitch: 32 } }` to `init()`.

## Usage

```html
<link rel="stylesheet" href="/themes/tokens.css">
<div id="stage" style="width:640px;height:480px"></div>
<script type="importmap">
{ "imports": { "three": "https://cdn.jsdelivr.net/npm/three@0.165.0/build/three.module.min.js",
               "gsap": "https://cdn.jsdelivr.net/npm/gsap@3.12.5/index.js" } }
</script>
<script type="module">
  import Asset from '/assets/simulations/dynamic-grid.js';
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
