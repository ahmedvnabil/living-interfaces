=== Living Assets ===
Contributors: ahmednabil
Tags: generative, visualization, canvas, animation, block
Requires at least: 6.5
Tested up to: 6.7
Requires PHP: 8.0
Stable tag: 1.1.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

40 generative visualization modules as Gutenberg blocks and shortcodes — scientific, premium, framework-free.

== Description ==

Living Assets brings a laboratory of generative instruments to WordPress: flow
fields, physarum, reaction–diffusion, boids, WebGL terrain, knowledge graphs,
interactive typography and 30+ more. Every module renders live on a canvas,
responds to the visitor's pointer, pauses off-screen, honors reduced-motion,
and inherits your theme's colors through CSS custom properties.

**Two ways to use it:**

* **Living Asset block / `[living_asset]` shortcode** — one visualization in
  any post, page or template.
* **Living Story block / `[living_story]` shortcode** — a scroll-driven
  interactive film: scenes are live simulations whose parameters follow the
  reader's scroll.

`[living_asset module="knowledge-graph" height="70vh" seed="42" params='{"nodes":80}']`

All rendering is local: no CDN calls, no external requests, no tracking.
Three.js ships vendored inside the plugin and loads only on pages that
use a module needing them.

**Theming:** override any `--la-*` CSS variable (bg, fg, muted, faint, accent)
in Additional CSS and every module recolors live. RTL themes are fully
supported — canvases are direction-neutral.

== Frequently Asked Questions ==

= Does it slow my site down? =
Pages without a Living Asset load zero extra JavaScript (only a ~250-byte
import map declaration). Modules lazy-load, render on demand and pause when
scrolled out of view.

= Where do the parameter JSONs come from? =
From the Living Assets Studio (bundled with the library): compose a module
visually, press "Copy setup JSON", paste into the block.

== Changelog ==

= 1.1.0 =
* Added interactive background mode, parent pointer tracking, z-index isolation,
  and a Gutenberg background toggle.

= 1.0.1 =
* Changed plugin CSS defaults to zero specificity so theme palettes win.

= 1.0.0 =
* Initial release: 40 modules, Living Asset + Living Story blocks and shortcodes.
