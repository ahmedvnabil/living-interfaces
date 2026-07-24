// Generates /docs from the compiled catalog: one markdown sheet per module
// plus an HTML index. Run after `node build.mjs`.
import { writeFileSync, mkdirSync } from 'node:fs';
import { CATALOG } from '../assets/core/catalog.js';

mkdirSync('docs', { recursive: true });

const usage = (m) => `\`\`\`html
<link rel="stylesheet" href="/themes/tokens.css">
<div id="stage" style="width:640px;height:480px"></div>
<script type="importmap">
{ "imports": { "three": "https://cdn.jsdelivr.net/npm/three@0.165.0/build/three.module.min.js",
               "gsap": "https://cdn.jsdelivr.net/npm/gsap@3.12.5/index.js" } }
</script>
<script type="module">
  import Asset from '/assets/${m.path}';
  const asset = new Asset();
  asset.init(document.getElementById('stage'), { seed: 42 });
  // asset.pause() · resume() · resize() · setTheme('light') · setData(...) · destroy()
</script>
\`\`\``;

for (const m of CATALOG) {
  const params = m.params
    .map((p) => `| \`${p.key}\` | ${p.label} | ${p.min} – ${p.max} | ${p.value} |`)
    .join('\n');
  const md = `# ${m.name}

*${m.subtitle}*

${m.description}

| | |
|---|---|
| **ID** | \`${m.id}\` |
| **Renderer** | ${m.renderer} |
| **SVG export** | ${m.svgExport ? 'yes — exportSVG() / downloadSVG()' : 'no (PNG only)'} |
| **Tags** | ${m.tags.join(', ')} |
| **Module** | \`/assets/${m.path}\` |

## Parameters

| key | label | range | default |
|---|---|---|---|
${params}

Set live with \`asset.setParam(key, value)\`, or pass \`{ params: { ${m.params[0].key}: ${m.params[0].value} } }\` to \`init()\`.

## Usage

${usage(m)}

## Lifecycle contract

Every Living Asset implements \`init(container, options?)\`, \`destroy()\`, \`pause()\`,
\`resume()\`, \`resize()\` (also automatic via ResizeObserver), \`setTheme(name | tokens)\`
and \`setData(payload)\`. Rendering auto-pauses off-screen and honors
\`prefers-reduced-motion\`. Seeded runs reproduce exactly: pass \`{ seed }\`.
`;
  writeFileSync(`docs/${m.id}.md`, md);
}

// index page
const rows = CATALOG.map((m, i) => `
  <tr>
    <td class="la-mono idx">${String(i + 1).padStart(2, '0')}</td>
    <td><a class="la-link" href="${m.id}.md"><strong>${m.name}</strong></a><br>
        <span class="sub">${m.subtitle}</span></td>
    <td class="la-mono small">${m.renderer}</td>
    <td class="la-mono small">${m.svgExport ? 'PNG+SVG' : 'PNG'}</td>
    <td class="small">${m.tags.join(' · ')}</td>
    <td><a class="la-link small" href="../index.html#${m.id}">specimen ↗</a></td>
  </tr>`).join('');

writeFileSync('docs/index.html', `<!DOCTYPE html><html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Living Assets — Documentation</title>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:ital,wght@0,400;0,500;1,400&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../themes/tokens.css">
<link rel="stylesheet" href="../themes/lab.css">
<style>
  .wrap { max-width: 1100px; margin: 0 auto; padding: 48px 24px 96px; }
  table { border-collapse: collapse; width: 100%; margin-top: 28px; }
  td, th { border-top: var(--la-border); padding: 12px 14px 12px 0; text-align: left; vertical-align: top; }
  th { font-family: var(--la-font-mono); font-size: var(--la-text-xs); text-transform: uppercase; letter-spacing: 0.08em; color: var(--la-muted); }
  .sub { color: var(--la-muted); font-size: var(--la-text-sm); font-style: italic; }
  .small { font-size: var(--la-text-sm); color: var(--la-muted); }
  .idx { color: var(--la-muted); }
  code { font-family: var(--la-font-mono); background: var(--la-bg-raised); border: var(--la-border); padding: 1px 6px; }
</style></head><body class="la-body"><div class="wrap">
<a class="la-link" href="../index.html"><span class="la-label">← Specimen Catalog</span></a>
<h1 style="letter-spacing:-0.02em;margin:16px 0 8px">Documentation</h1>
<p style="color:var(--la-muted);max-width:640px">Every module ships as a plain ES module in
<code>/assets</code> and mounts with <code>new Asset().init(element)</code>. The lifecycle
contract is identical across all ${CATALOG.length} instruments:
<code>init · destroy · pause · resume · resize · setTheme · setData</code>.
Per-module sheets below are generated from the catalog.</p>
<table>
<tr><th>#</th><th>Module</th><th>Renderer</th><th>Export</th><th>Tags</th><th></th></tr>
${rows}
</table>
</div></body></html>`);

console.log(`docs: ${CATALOG.length} module sheets + index.html`);
