# AI Thinking

*Cogitatio machinae · attention dynamics*

A particle nucleus in query–key oscillation: focus contracts, associations orbit, resolution releases. An honest visual for model latency.

| | |
|---|---|
| **ID** | `ai-thinking` |
| **Renderer** | canvas2d |
| **SVG export** | no (PNG only) |
| **Tags** | ambient, ml |
| **Module** | `/assets/simulations/ai-thinking.js` |

## Parameters

| key | label | range | default |
|---|---|---|---|
| `tokens` | Tokens | 20 – 160 | 64 |
| `tempo` | Thinking tempo | 0.2 – 2 | 0.7 |
| `focus` | Focus | 0.2 – 1 | 0.6 |

Set live with `asset.setParam(key, value)`, or pass `{ params: { tokens: 64 } }` to `init()`.

## Usage

```html
<link rel="stylesheet" href="/themes/tokens.css">
<div id="stage" style="width:640px;height:480px"></div>
<script type="importmap">
{ "imports": { "three": "https://cdn.jsdelivr.net/npm/three@0.165.0/build/three.module.min.js",
               "gsap": "https://cdn.jsdelivr.net/npm/gsap@3.12.5/index.js" } }
</script>
<script type="module">
  import Asset from '/assets/simulations/ai-thinking.js';
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
