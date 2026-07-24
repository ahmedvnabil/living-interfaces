# Reaction–Diffusion

*Gray–Scott · morphogenesis*

Two virtual chemicals feed, kill and diffuse across a lattice. Turing instability produces spots, stripes and labyrinths from uniform noise.

| | |
|---|---|
| **ID** | `reaction-diffusion` |
| **Renderer** | worker |
| **SVG export** | no (PNG only) |
| **Tags** | chemistry, pde |
| **Module** | `/assets/simulations/reaction-diffusion.js` |

## Parameters

| key | label | range | default |
|---|---|---|---|
| `feed` | Feed rate | 0.02 – 0.08 | 0.037 |
| `kill` | Kill rate | 0.045 – 0.07 | 0.06 |
| `steps` | Steps / frame | 1 – 16 | 8 |

Set live with `asset.setParam(key, value)`, or pass `{ params: { feed: 0.037 } }` to `init()`.

## Usage

```html
<link rel="stylesheet" href="/themes/tokens.css">
<div id="stage" style="width:640px;height:480px"></div>
<script type="importmap">
{ "imports": { "three": "https://cdn.jsdelivr.net/npm/three@0.165.0/build/three.module.min.js",
               "gsap": "https://cdn.jsdelivr.net/npm/gsap@3.12.5/index.js" } }
</script>
<script type="module">
  import Asset from '/assets/simulations/reaction-diffusion.js';
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
