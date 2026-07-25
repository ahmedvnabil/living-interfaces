import assert from 'node:assert/strict';
import test from 'node:test';

import {
  CATALOG,
  PRESETS,
  createAsset,
  definePreset,
  getPreset,
  resolveSetup,
} from '../assets/index.js';

test('catalog exposes forty uniquely identified assets', () => {
  assert.equal(CATALOG.length, 40);
  assert.equal(new Set(CATALOG.map(({ id }) => id)).size, CATALOG.length);
});

test('every catalog entry can be created through the public API', async () => {
  for (const { id } of CATALOG) {
    const asset = await createAsset(id);
    for (const method of ['init', 'destroy', 'pause', 'resume', 'resize', 'setTheme', 'setData']) {
      assert.equal(typeof asset[method], 'function', `${id}.${method} is missing`);
    }
  }
});

test('createAsset rejects unknown asset ids', async () => {
  await assert.rejects(() => createAsset('not-real'), /Unknown Living Interfaces asset/);
});

test('shipped presets reference real assets and valid parameters', () => {
  assert.ok(PRESETS.length >= 12);

  for (const preset of PRESETS) {
    const meta = CATALOG.find(({ id }) => id === preset.asset);
    assert.ok(meta, `${preset.id} references an unknown asset`);
    const keys = new Set(meta.params.map(({ key }) => key));
    for (const key of Object.keys(preset.params)) {
      assert.ok(keys.has(key), `${preset.id} uses unknown parameter ${key}`);
    }
  }
});

test('definePreset returns an immutable validated copy', () => {
  const input = {
    id: 'test-calm',
    name: 'Test Calm',
    asset: 'flow-field',
    seed: 42,
    params: { speed: 0.5 },
  };
  const preset = definePreset(input);
  input.params.speed = 2;

  assert.equal(preset.params.speed, 0.5);
  assert.ok(Object.isFrozen(preset));
  assert.throws(
    () => definePreset({ ...input, id: '', asset: 'missing' }),
    /Preset id is required|Unknown asset/,
  );
});

test('resolveSetup merges preset and explicit options without mutation', () => {
  const preset = getPreset('flow-field-calm');
  const result = resolveSetup({
    asset: 'flow-field',
    preset: preset.id,
    seed: 99,
    params: { speed: 2 },
  });

  assert.equal(result.asset, 'flow-field');
  assert.equal(result.seed, 99);
  assert.equal(result.params.speed, 2);
  assert.notEqual(result.params, preset.params);
});
