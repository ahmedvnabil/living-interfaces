// Compiles /src TypeScript to plain ES modules in /assets. No bundling — output
// files keep their relative imports and load natively via <script type="module">.
import { build, context } from 'esbuild';
import { globSync } from 'node:fs';

const entryPoints = globSync('src/**/*.ts');

const options = {
  entryPoints,
  outdir: 'assets',
  outbase: 'src',
  bundle: false,
  format: 'esm',
  target: 'es2022',
  sourcemap: false,
  logLevel: 'info',
};

if (process.argv.includes('--watch')) {
  const ctx = await context(options);
  await ctx.watch();
  console.log('watching src/ …');
} else {
  await build(options);
}
