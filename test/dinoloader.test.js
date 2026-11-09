import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

// Set up lightweight DOM mock for Node.js environment before importing DinoLoader
class MockDOMElement {
  constructor(tagName = 'div') {
    this.tagName = tagName.toUpperCase();
    this.className = '';
    this.style = {
      _props: {},
      setProperty: (prop, val) => {
        this.style._props[prop] = String(val);
        this.style[prop] = String(val);
      },
      getPropertyValue: (prop) => this.style._props[prop] || ''
    };
    this.dataset = {};
    this.attributes = {};
    this.children = [];
    this.parentNode = null;
    this.textContent = '';
    this._innerHTML = '';
    this.classList = {
      _classes: new Set(),
      add: (c) => this.classList._classes.add(c),
      remove: (c) => this.classList._classes.delete(c),
      contains: (c) => this.classList._classes.has(c),
      toggle: (c) => {
        if (this.classList._classes.has(c)) {
          this.classList._classes.delete(c);
          return false;
        } else {
          this.classList._classes.add(c);
          return true;
        }
      }
    };
    this.listeners = {};
  }

  get innerHTML() {
    return this._innerHTML;
  }

  set innerHTML(html) {
    this._innerHTML = html;
    // Mock basic query selector targets for tests
    this._mockChild('.dl-progress-fill');
    this._mockChild('.dl-progress-percent');
    this._mockChild('.dl-message-text');
    this._mockChild('.dl-status-badge');
    this._mockChild('.dl-fullscreen-close');
    this._mockChild('.dl-dino-container');
    this._mockChild('.dl-stage');
  }

  _mockChild(selector) {
    const child = new MockDOMElement('div');
    child.className = selector.replace('.', '');
    this.children.push(child);
  }

  querySelector(selector) {
    const cls = selector.replace('.', '');
    return this.children.find((c) => c.className === cls) || null;
  }

  setAttribute(name, val) {
    this.attributes[name] = String(val);
  }

  getAttribute(name) {
    return this.attributes[name] || null;
  }

  removeAttribute(name) {
    delete this.attributes[name];
  }

  appendChild(child) {
    if (child.parentNode) {
      child.parentNode.removeChild(child);
    }
    child.parentNode = this;
    this.children.push(child);
    return child;
  }

  removeChild(child) {
    const idx = this.children.indexOf(child);
    if (idx !== -1) {
      this.children.splice(idx, 1);
      child.parentNode = null;
    }
    return child;
  }

  addEventListener(type, fn) {
    if (!this.listeners[type]) this.listeners[type] = [];
    this.listeners[type].push(fn);
  }

  removeEventListener(type, fn) {
    if (!this.listeners[type]) return;
    this.listeners[type] = this.listeners[type].filter((f) => f !== fn);
  }
}

// Global document & window mocks
globalThis.document = {
  body: new MockDOMElement('body'),
  createElement: (tag) => new MockDOMElement(tag),
  querySelector: (sel) => {
    if (sel === 'body') return globalThis.document.body;
    return null;
  }
};

globalThis.window = {
  listeners: {},
  addEventListener: (type, fn) => {
    if (!globalThis.window.listeners[type]) globalThis.window.listeners[type] = [];
    globalThis.window.listeners[type].push(fn);
  },
  removeEventListener: (type, fn) => {
    if (!globalThis.window.listeners[type]) return;
    globalThis.window.listeners[type] = globalThis.window.listeners[type].filter((f) => f !== fn);
  }
};

// Now import DinoLoader modules
const { createDinoLoader, DinoLoader } = await import('../src/dinoloader/core/DinoLoader.js');
const { ProgressManager } = await import('../src/dinoloader/progress/progressManager.js');
const { ThemeManager, ScrollLock } = await import('../src/dinoloader/theme/themeManager.js');
const { AnimationManager } = await import('../src/dinoloader/animation/animationManager.js');

describe('DinoLoader Phase 2 Engine Tests', () => {
  beforeEach(() => {
    globalThis.document.body = new MockDOMElement('body');
    globalThis.window.listeners = {};
  });

  describe('1. Factory & Instance Creation', () => {
    test('creates instance with default options', () => {
      const loader = createDinoLoader();
      assert.ok(loader instanceof DinoLoader);
      assert.equal(loader.getMode(), 'inline');
      assert.equal(loader.getTheme(), 'dark');
      assert.equal(loader.getProgress(), 0);
      assert.equal(loader.getState(), 'running');
      loader.destroy();
    });

    test('accepts custom configuration options', () => {
      const loader = createDinoLoader({
        mode: 'fullscreen',
        theme: 'light',
        size: 'large',
        animationSpeed: 'fast',
        message: 'Excavating data...',
        progress: false
      });

      assert.equal(loader.getMode(), 'fullscreen');
      assert.equal(loader.getTheme(), 'light');
      assert.equal(loader.renderer.dom.root.dataset.size, 'large');
      assert.equal(loader.renderer.dom.root.dataset.speed, 'fast');
      assert.equal(loader.renderer.dom.root.dataset.indeterminate, 'true');
      assert.equal(loader.renderer.dom.messageText.textContent, 'Excavating data...');
      loader.destroy();
    });
  });

  describe('2. Multiple Independent Instances', () => {
    test('instances maintain completely isolated state and DOM', () => {
      const loader1 = createDinoLoader({ theme: 'dark', initialProgress: 20 });
      const loader2 = createDinoLoader({ theme: 'light', initialProgress: 70 });

      assert.notEqual(loader1.getElement(), loader2.getElement());
      assert.equal(loader1.getProgress(), 20);
      assert.equal(loader2.getProgress(), 70);
      assert.equal(loader1.getTheme(), 'dark');
      assert.equal(loader2.getTheme(), 'light');

      loader1.update(40);
      assert.equal(loader1.getProgress(), 40);
      assert.equal(loader2.getProgress(), 70);

      loader1.destroy();
      loader2.destroy();
    });
  });

  describe('3. Display Modes & Fullscreen Scroll Lock', () => {
    test('inline mode renders inside target container without locking body scroll', () => {
      const container = new MockDOMElement('div');
      const loader = createDinoLoader({ mode: 'inline', container });

      loader.show();
      assert.equal(loader.getElement().parentNode, container);
      assert.equal(globalThis.document.body.style.overflow, undefined);

      loader.destroy();
    });

    test('fullscreen mode locks body scroll on show and restores on hide/destroy', () => {
      ScrollLock.reset();
      globalThis.document.body.style.overflow = 'auto';

      const loader = createDinoLoader({ mode: 'fullscreen', preventScroll: true });
      loader.show();

      assert.equal(globalThis.document.body.style.overflow, 'hidden');

      loader.hide();
      assert.equal(globalThis.document.body.style.overflow, 'auto');

      loader.show();
      assert.equal(globalThis.document.body.style.overflow, 'hidden');

      loader.destroy();
      assert.equal(globalThis.document.body.style.overflow, 'auto');
    });

    test('shared scroll lock management prevents premature unlock when multiple fullscreen instances are active', () => {
      ScrollLock.reset();
      globalThis.document.body.style.overflow = 'scroll';

      const loaderA = createDinoLoader({ mode: 'fullscreen', preventScroll: true });
      const loaderB = createDinoLoader({ mode: 'fullscreen', preventScroll: true });

      // Instance A locks
      loaderA.show();
      assert.equal(globalThis.document.body.style.overflow, 'hidden');
      assert.equal(ScrollLock.getActiveCount(), 1);

      // Instance B also locks
      loaderB.show();
      assert.equal(globalThis.document.body.style.overflow, 'hidden');
      assert.equal(ScrollLock.getActiveCount(), 2);

      // Instance A is hidden/closed -> Instance B still needs lock!
      loaderA.hide();
      assert.equal(globalThis.document.body.style.overflow, 'hidden');
      assert.equal(ScrollLock.getActiveCount(), 1);

      // Instance B is destroyed -> last one releases, restores original style!
      loaderB.destroy();
      assert.equal(globalThis.document.body.style.overflow, 'scroll');
      assert.equal(ScrollLock.getActiveCount(), 0);

      loaderA.destroy();
    });

    test('fullscreen mode applies custom zIndex and background', () => {
      const loader = createDinoLoader({
        mode: 'fullscreen',
        zIndex: 50000,
        background: '#1a1a1a'
      });

      const root = loader.getElement();
      assert.equal(root.style.zIndex, '50000');
      loader.destroy();
    });
  });

  describe('4. Lifecycle: Show, Hide, and Animation Pause', () => {
    test('show() mounts and unpauses; hide() hides and pauses animations', () => {
      const loader = createDinoLoader();
      loader.show();

      assert.equal(loader.isVisible, true);
      assert.equal(loader.animationManager.isPaused, false);
      assert.equal(loader.getElement().style.display, '');

      loader.hide();
      assert.equal(loader.isVisible, false);
      assert.equal(loader.animationManager.isPaused, true);
      assert.equal(loader.getElement().style.display, 'none');

      loader.destroy();
    });
  });

  describe('5. Progress Sanitization and Boundary Clamping', () => {
    test('clamps values < 0 to 0', () => {
      const loader = createDinoLoader();
      loader.update(-25);
      assert.equal(loader.getProgress(), 0);
      loader.destroy();
    });

    test('clamps values > 100 to 100', () => {
      const loader = createDinoLoader();
      loader.update(150);
      assert.equal(loader.getProgress(), 100);
      loader.destroy();
    });

    test('handles invalid inputs gracefully (NaN, null, undefined, strings)', () => {
      const loader = createDinoLoader();
      loader.update('not-a-number');
      assert.equal(loader.getProgress(), 0);

      loader.update(null);
      assert.equal(loader.getProgress(), 0);

      loader.update('45.8');
      assert.equal(Math.round(loader.getProgress()), 46);
      loader.destroy();
    });

    test('fires onProgress callback with sanitized numbers', () => {
      let reported = null;
      const loader = createDinoLoader({
        onProgress: (val) => { reported = val; }
      });

      loader.update(65);
      assert.equal(reported, 65);
      loader.destroy();
    });
  });

  describe('6. Completion and Error State Transitions', () => {
    test('complete() advances to 100%, changes state, and triggers onComplete', () => {
      let completed = false;
      const loader = createDinoLoader({
        onComplete: () => { completed = true; }
      });

      loader.update(50);
      loader.complete('Finished loading files!');

      assert.equal(loader.getProgress(), 100);
      assert.equal(loader.getState(), 'complete');
      assert.equal(loader.renderer.dom.messageText.textContent, 'Finished loading files!');
      assert.equal(completed, true);

      loader.destroy();
    });

    test('error() switches state to error and triggers onError callback', () => {
      let caughtError = null;
      const loader = createDinoLoader({
        onError: (err) => { caughtError = err; }
      });

      loader.error('Network timeout (HTTP 504)');

      assert.equal(loader.getState(), 'error');
      assert.equal(loader.renderer.dom.messageText.textContent, 'Network timeout (HTTP 504)');
      assert.ok(caughtError instanceof Error);
      assert.equal(caughtError.message, 'Network timeout (HTTP 504)');

      loader.destroy();
    });
  });

  describe('7. Dynamic Updates: setMessage, setTheme, setOptions', () => {
    test('setMessage updates message text in real time', () => {
      const loader = createDinoLoader();
      loader.setMessage('Custom text step 2');
      assert.equal(loader.renderer.dom.messageText.textContent, 'Custom text step 2');
      loader.destroy();
    });

    test('setTheme updates theme attribute dynamically', () => {
      const loader = createDinoLoader({ theme: 'dark' });
      assert.equal(loader.getTheme(), 'dark');

      loader.setTheme('light');
      assert.equal(loader.getTheme(), 'light');
      assert.equal(loader.getElement().dataset.theme, 'light');

      loader.destroy();
    });

    test('setOptions applies multiple options simultaneously', () => {
      const loader = createDinoLoader();
      loader.setOptions({
        theme: 'light',
        animationSpeed: 'slow',
        size: 'small',
        cactus: false,
        clouds: false
      });

      assert.equal(loader.getTheme(), 'light');
      assert.equal(loader.getElement().dataset.speed, 'slow');
      assert.equal(loader.getElement().dataset.size, 'small');
      assert.equal(loader.getElement().dataset.cactus, 'false');
      assert.equal(loader.getElement().dataset.clouds, 'false');

      loader.destroy();
    });

    test('supports responsive size presets (small, medium, large)', () => {
      const loader = createDinoLoader({ size: 'small' });
      assert.equal(loader.getElement().dataset.size, 'small');

      loader.setOptions({ size: 'medium' });
      assert.equal(loader.getElement().dataset.size, 'medium');

      loader.setOptions({ size: 'large' });
      assert.equal(loader.getElement().dataset.size, 'large');

      // Invalid size falls back to medium
      loader.setOptions({ size: 'invalid-size' });
      assert.equal(loader.getElement().dataset.size, 'medium');

      loader.destroy();
    });

    test('supports animation speed presets (slow, normal, fast)', () => {
      const loader = createDinoLoader({ animationSpeed: 'slow' });
      assert.equal(loader.getElement().dataset.speed, 'slow');

      loader.setOptions({ animationSpeed: 'fast' });
      assert.equal(loader.getElement().dataset.speed, 'fast');

      // Invalid speed falls back to normal
      loader.setOptions({ animationSpeed: 'ultra-sonic' });
      assert.equal(loader.getElement().dataset.speed, 'normal');

      loader.destroy();
    });
  });

  describe('8. Reset Functionality', () => {
    test('reset restores running state, resets progress, and resumes animations', () => {
      const loader = createDinoLoader({ message: 'Default message' });
      loader.error('Failed');
      assert.equal(loader.getState(), 'error');

      loader.reset(10);
      assert.equal(loader.getState(), 'running');
      assert.equal(loader.getProgress(), 10);
      assert.equal(loader.renderer.dom.messageText.textContent, 'Default message');

      loader.destroy();
    });
  });

  describe('9. Idempotent Calls & Safe Teardown', () => {
    test('show() and hide() can be called repeatedly without duplicate listeners or state corruption', () => {
      const loader = createDinoLoader({ mode: 'fullscreen' });

      // Call show() 4 times consecutively
      loader.show();
      loader.show();
      loader.show();
      loader.show();

      assert.equal(loader.isVisible, true);
      assert.equal(loader.isMounted, true);

      // Call hide() 4 times consecutively
      loader.hide();
      loader.hide();
      loader.hide();
      loader.hide();

      assert.equal(loader.isVisible, false);

      loader.destroy();
    });

    test('complete() can be called repeatedly without throwing or re-triggering callbacks', () => {
      let callbackCount = 0;
      const loader = createDinoLoader({
        onComplete: () => { callbackCount++; }
      });

      loader.complete();
      loader.complete();
      loader.complete();

      assert.equal(loader.getProgress(), 100);
      assert.equal(loader.getState(), 'complete');
      assert.equal(callbackCount, 1); // Callback only fires once on initial transition

      loader.destroy();
    });

    test('destroy() can be called multiple times without throwing errors', () => {
      const loader = createDinoLoader();
      loader.show();

      assert.doesNotThrow(() => {
        loader.destroy();
        loader.destroy();
        loader.destroy();
      });

      assert.equal(loader.isDestroyed, true);
    });

    test('calling methods on destroyed instance does not throw or corrupt state', () => {
      const loader = createDinoLoader();
      loader.destroy();

      assert.doesNotThrow(() => {
        loader.show();
        loader.update(50);
        loader.complete();
        loader.error('error');
        loader.setMessage('msg');
        loader.setTheme('light');
        loader.hide();
      });
    });
  });
});
