import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const pkg = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));

test('package has publishable metadata and explicit files', () => {
  assert.equal(pkg.name, 'living-interfaces');
  assert.equal(pkg.license, 'MIT');
  assert.equal(pkg.type, 'module');
  assert.equal(pkg.exports['.'].import, './assets/index.js');
  assert.ok(pkg.files.includes('assets/'));
  assert.ok(pkg.files.includes('themes/'));
  assert.deepEqual(pkg.sideEffects, ['./assets/web-component.js']);
});

test('package declares supported runtime dependencies', () => {
  assert.match(pkg.peerDependencies.three, /^\^/);
  assert.equal(pkg.peerDependenciesMeta.three.optional, true);
});
