# Living Background

*Fundus vivens · ambient field layer*

A full-bleed ambient layer: sparse drifting motes over a breathing gradient field. Designed to sit behind content at near-zero cognitive cost.

| | |
|---|---|
| **ID** | `living-background` |
| **Renderer** | canvas2d |
| **SVG export** | no (PNG only) |
| **Tags** | ambient, background |
| **Module** | `/assets/simulations/living-background.js` |

## Parameters

| key | label | range | default |
|---|---|---|---|
| `motes` | Motes | 20 – 200 | 70 |
| `breathe` | Breathing rate | 0.02 – 0.4 | 0.08 |
| `presence` | Presence | 0.05 – 0.6 | 0.2 |

Set live with `asset.setParam(key, value)`, or pass `{ params: { motes: 70 } }` to `init()`.

## Usage

```html
<link rel="stylesheet" href="/themes/tokens.css">
<div id="stage" style="width:640px;height:480px"></div>
<script type="importmap">
{ "imports": { "three": "https://cdn.jsdelivr.net/npm/three@0.165.0/build/three.module.min.js",
               "gsap": "https://cdn.jsdelivr.net/npm/gsap@3.12.5/index.js" } }
</script>
<script type="module">
  import Asset from '/assets/simulations/living-background.js';
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
