# Root Growth

*Rhizogenesis · gravitropic branching*

Root apices advancing under gravitropism with stochastic branching and nutrient-seeking curvature — a subterranean search algorithm.

| | |
|---|---|
| **ID** | `root-growth` |
| **Renderer** | canvas2d |
| **SVG export** | yes — exportSVG() / downloadSVG() |
| **Tags** | biology, branching |
| **Module** | `/assets/simulations/root-growth.js` |

## Parameters

| key | label | range | default |
|---|---|---|---|
| `tips` | Initial apices | 1 – 8 | 3 |
| `branch` | Branch probability | 0 – 0.08 | 0.02 |
| `wander` | Wander | 0 – 1 | 0.3 |

Set live with `asset.setParam(key, value)`, or pass `{ params: { tips: 3 } }` to `init()`.

## Usage

```html
<link rel="stylesheet" href="/themes/tokens.css">
<div id="stage" style="width:640px;height:480px"></div>
<script type="importmap">
{ "imports": { "three": "https://cdn.jsdelivr.net/npm/three@0.165.0/build/three.module.min.js",
               "gsap": "https://cdn.jsdelivr.net/npm/gsap@3.12.5/index.js" } }
</script>
<script type="module">
  import Asset from '/assets/simulations/root-growth.js';
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
