import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import React, { act, useState, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { DinoLoader, useDinoLoader } from '../dist/react.js';

// Configure JSDOM
const dom = new JSDOM('<!DOCTYPE html><html><body><div id="test-root"></div></body></html>', {
  url: 'http://localhost/'
});

globalThis.window = dom.window;
globalThis.document = dom.window.document;
try {
  Object.defineProperty(globalThis, 'navigator', {
    value: dom.window.navigator,
    configurable: true,
    writable: true
  });
} catch {
  // Use existing navigator if locked
}
globalThis.window.scrollTo = () => {};
globalThis.HTMLElement = dom.window.HTMLElement;
globalThis.customElements = dom.window.customElements;
globalThis.getComputedStyle = dom.window.getComputedStyle.bind(dom.window);
globalThis.requestAnimationFrame = (cb) => setTimeout(cb, 16);
globalThis.cancelAnimationFrame = (id) => clearTimeout(id);
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

globalThis.window.matchMedia = globalThis.window.matchMedia || function() {
  return {
    matches: false,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false
  };
};

describe('DinoLoader React Integration Tests', () => {
  let container;
  let root;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(async () => {
    if (root) {
      await act(async () => {
        root.unmount();
      });
      root = null;
    }
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
    // Clean any stray body children
    const leftovers = document.body.querySelectorAll('.dinoloader');
    leftovers.forEach(el => el.remove());
  });

  test('renders DinoLoader inline component with default props', async () => {
    await act(async () => {
      root.render(
        React.createElement(DinoLoader, {
          className: 'my-custom-class',
          message: 'Initializing tests...'
        })
      );
    });

    const wrapper = container.querySelector('.dinoloader-react-container');
    assert.ok(wrapper, 'Container div is rendered');
    assert.ok(wrapper.classList.contains('my-custom-class'), 'Custom class is applied');
    assert.equal(wrapper.getAttribute('aria-busy'), 'true', 'aria-busy is set to true');

    const loaderRoot = wrapper.querySelector('.dinoloader');
    assert.ok(loaderRoot, 'DinoLoader DOM is mounted inside wrapper');
    assert.equal(loaderRoot.getAttribute('data-mode'), 'inline');
    assert.equal(loaderRoot.getAttribute('data-theme'), 'dark');

    const messageEl = loaderRoot.querySelector('.dl-message-text');
    assert.ok(messageEl, 'Message element exists');
    assert.equal(messageEl.textContent, 'Initializing tests...');

    const svg = loaderRoot.querySelector('.dl-dino-svg');
    assert.ok(svg, 'Dinosaur SVG is rendered');
  });

  test('responds dynamically to loading prop toggle', async () => {
    function App() {
      const [loading, setLoading] = useState(true);
      globalThis.__toggleLoading = setLoading;
      return React.createElement(DinoLoader, { loading, message: 'Toggle test' });
    }

    await act(async () => {
      root.render(React.createElement(App));
    });

    const loaderRoot = container.querySelector('.dinoloader');
    assert.ok(loaderRoot);
    assert.equal(loaderRoot.style.display, '', 'Initially visible');

    // Toggle loading to false
    await act(async () => {
      globalThis.__toggleLoading(false);
    });

    assert.equal(loaderRoot.style.display, 'none', 'Hidden (display: none) when loading=false');

    // Toggle loading back to true
    await act(async () => {
      globalThis.__toggleLoading(true);
    });

    assert.equal(loaderRoot.style.display, '', 'Visible again when loading=true');
    delete globalThis.__toggleLoading;
  });

  test('dynamically updates progress prop and fires onComplete', async () => {
    let completedFired = false;

    function App() {
      const [progress, setProgress] = useState(25);
      globalThis.__setProgress = setProgress;
      return React.createElement(DinoLoader, {
        progress,
        onComplete: () => {
          completedFired = true;
        }
      });
    }

    await act(async () => {
      root.render(React.createElement(App));
    });

    const percentEl = container.querySelector('.dl-progress-percent');
    assert.ok(percentEl, 'Percent text element rendered');
    assert.equal(percentEl.textContent, '25%');

    // Update progress to 65%
    await act(async () => {
      globalThis.__setProgress(65);
    });
    assert.equal(percentEl.textContent, '65%');
    assert.equal(completedFired, false);

    // Update progress to 100% -> should complete
    await act(async () => {
      globalThis.__setProgress(100);
    });
    assert.equal(percentEl.textContent, '100%');
    assert.equal(completedFired, true, 'onComplete callback triggered on 100%');

    delete globalThis.__setProgress;
  });

  test('dynamically updates theme, size, and message props without remounting DOM', async () => {
    function App() {
      const [theme, setTheme] = useState('dark');
      const [size, setSize] = useState('medium');
      const [message, setMessage] = useState('Initial Msg');
      globalThis.__updateProps = (t, s, m) => {
        setTheme(t);
        setSize(s);
        setMessage(m);
      };
      return React.createElement(DinoLoader, { theme, size, message });
    }

    await act(async () => {
      root.render(React.createElement(App));
    });

    const loaderRootBefore = container.querySelector('.dinoloader');
    assert.equal(loaderRootBefore.getAttribute('data-theme'), 'dark');
    assert.equal(loaderRootBefore.getAttribute('data-size'), 'medium');
    assert.equal(container.querySelector('.dl-message-text').textContent, 'Initial Msg');

    // Update props
    await act(async () => {
      globalThis.__updateProps('light', 'large', 'Updated Msg');
    });

    const loaderRootAfter = container.querySelector('.dinoloader');
    // Instance is preserved (same DOM node)
    assert.equal(loaderRootBefore, loaderRootAfter, 'DOM node is preserved without destruction');
    assert.equal(loaderRootAfter.getAttribute('data-theme'), 'light');
    assert.equal(loaderRootAfter.getAttribute('data-size'), 'large');
    assert.equal(container.querySelector('.dl-message-text').textContent, 'Updated Msg');

    delete globalThis.__updateProps;
  });

  test('supports fullscreen mode and cleans up on unmount', async () => {
    await act(async () => {
      root.render(
        React.createElement(DinoLoader, {
          mode: 'fullscreen',
          message: 'Fullscreen overlay'
        })
      );
    });

    const overlay = document.body.querySelector('.dinoloader[data-mode="fullscreen"]');
    assert.ok(overlay, 'Fullscreen overlay mounted on document.body');
    assert.equal(overlay.querySelector('.dl-message-text').textContent, 'Fullscreen overlay');

    // Unmount
    await act(async () => {
      root.unmount();
      root = null;
    });

    const overlayAfter = document.body.querySelector('.dinoloader[data-mode="fullscreen"]');
    assert.equal(overlayAfter, null, 'Fullscreen overlay cleanly removed from document.body on unmount');
  });

  test('simulates React StrictMode mount -> unmount -> mount without leakage or errors', async () => {
    // 1st Mount
    await act(async () => {
      root.render(React.createElement(DinoLoader, { message: 'Strict Mode 1' }));
    });
    assert.ok(container.querySelector('.dinoloader'));

    // Immediate Unmount
    await act(async () => {
      root.render(null);
    });
    assert.equal(container.querySelector('.dinoloader'), null, 'Cleaned up on unmount');

    // 2nd Mount (as in StrictMode)
    await act(async () => {
      root.render(React.createElement(DinoLoader, { message: 'Strict Mode 2' }));
    });
    const secondMount = container.querySelector('.dinoloader');
    assert.ok(secondMount, 'Re-mounted successfully in StrictMode cycle');
    assert.equal(secondMount.querySelector('.dl-message-text').textContent, 'Strict Mode 2');
  });

  test('useDinoLoader programmatic hook provides control methods and state', async () => {
    let hookControls;

    function HookTestComponent() {
      const controls = useDinoLoader({ mode: 'inline', initialProgress: 10 });
      hookControls = controls;
      return React.createElement('div', { id: 'hook-target' }, `Progress: ${controls.progress}, State: ${controls.state}`);
    }

    await act(async () => {
      root.render(React.createElement(HookTestComponent));
    });

    assert.ok(hookControls);
    assert.equal(typeof hookControls.show, 'function');
    assert.equal(typeof hookControls.hide, 'function');
    assert.equal(typeof hookControls.update, 'function');
    assert.equal(typeof hookControls.complete, 'function');
    assert.equal(typeof hookControls.error, 'function');
    assert.equal(typeof hookControls.setMessage, 'function');
    assert.equal(typeof hookControls.setTheme, 'function');
    assert.equal(typeof hookControls.reset, 'function');

    // Update progress through hook
    await act(async () => {
      hookControls.update(55);
    });
    assert.equal(hookControls.progress, 55);

    // Complete loading through hook
    await act(async () => {
      hookControls.complete();
    });
    assert.equal(hookControls.state, 'complete');
    assert.equal(hookControls.progress, 100);
  });
});
