import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

describe('DinoLoader Distribution Package Verification', () => {
  test('ESM dist exposes createDinoLoader and DinoLoader', async () => {
    const esm = await import('../dist/index.js');
    assert.equal(typeof esm.createDinoLoader, 'function');
    assert.equal(typeof esm.DinoLoader, 'function');

    const loader = esm.createDinoLoader({
      mode: 'inline',
      theme: 'dark',
      progress: true
    });

    assert.equal(loader.getMode(), 'inline');
    assert.equal(loader.getTheme(), 'dark');
    assert.equal(loader.getProgress(), 0);

    loader.update(45);
    assert.equal(loader.getProgress(), 45);

    loader.setMessage('Testing ESM');
    assert.equal(loader.options.message, 'Testing ESM');

    loader.setTheme('light');
    assert.equal(loader.getTheme(), 'light');

    loader.complete();
    assert.equal(loader.getProgress(), 100);
    assert.equal(loader.getState(), 'complete');

    loader.destroy();
  });

  test('CommonJS dist exposes createDinoLoader and DinoLoader via require()', () => {
    const cjs = require('../dist/index.cjs');
    assert.equal(typeof cjs.createDinoLoader, 'function');
    assert.equal(typeof cjs.DinoLoader, 'function');

    const loader = cjs.createDinoLoader({
      mode: 'fullscreen',
      theme: 'light'
    });

    assert.equal(loader.getMode(), 'fullscreen');
    assert.equal(loader.getTheme(), 'light');

    loader.update(88);
    assert.equal(loader.getProgress(), 88);

    loader.error('CJS Error');
    assert.equal(loader.getState(), 'error');

    loader.destroy();
  });
});
