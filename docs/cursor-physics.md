# Cursor Physics

*Physica cursoris · spring-mass follower*

A mass-spring entourage trailing the pointer with critically-damped lag. Interface furniture that obeys F = ma.

| | |
|---|---|
| **ID** | `cursor-physics` |
| **Renderer** | canvas2d |
| **SVG export** | no (PNG only) |
| **Tags** | interaction, physics |
| **Module** | `/assets/simulations/cursor-physics.js` |

## Parameters

| key | label | range | default |
|---|---|---|---|
| `bodies` | Bodies | 3 – 30 | 12 |
| `stiffness` | Stiffness | 0.02 – 0.4 | 0.12 |
| `damping` | Damping | 0.5 – 0.95 | 0.8 |

Set live with `asset.setParam(key, value)`, or pass `{ params: { bodies: 12 } }` to `init()`.

## Usage

```html
<link rel="stylesheet" href="/themes/tokens.css">
<div id="stage" style="width:640px;height:480px"></div>
<script type="importmap">
{ "imports": { "three": "https://cdn.jsdelivr.net/npm/three@0.165.0/build/three.module.min.js" } }
</script>
<script type="module">
  import Asset from '/assets/simulations/cursor-physics.js';
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
