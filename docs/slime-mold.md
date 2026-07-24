# Slime Mold

*Physarum polycephalum · network formation*

Transport-network formation between nutrient sites, modeled as agents reinforcing efficient paths. The emergent graph approximates Steiner-like minimal networks.

| | |
|---|---|
| **ID** | `slime-mold` |
| **Renderer** | canvas2d |
| **SVG export** | no (PNG only) |
| **Tags** | biology, agents |
| **Module** | `/assets/simulations/slime-mold.js` |

## Parameters

| key | label | range | default |
|---|---|---|---|
| `foods` | Nutrient sites | 3 – 14 | 7 |
| `agents` | Agents | 200 – 3000 | 1200 |
| `decay` | Trail decay | 0.9 – 0.999 | 0.975 |
| `sense` | Sensor angle | 0.1 – 1.2 | 0.5 |

Set live with `asset.setParam(key, value)`, or pass `{ params: { foods: 7 } }` to `init()`.

## Usage

```html
<link rel="stylesheet" href="/themes/tokens.css">
<div id="stage" style="width:640px;height:480px"></div>
<script type="importmap">
{ "imports": { "three": "https://cdn.jsdelivr.net/npm/three@0.165.0/build/three.module.min.js",
               "gsap": "https://cdn.jsdelivr.net/npm/gsap@3.12.5/index.js" } }
</script>
<script type="module">
  import Asset from '/assets/simulations/slime-mold.js';
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
