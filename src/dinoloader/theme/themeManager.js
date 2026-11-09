import { ScrollLock } from './scrollLock.js';

let instanceSeq = 0;

/**
 * Theme & Display Mode Manager for DinoLoader
 * Handles theme application, custom colors, z-index, and instance-aware body scroll lock.
 */
export class ThemeManager {
  /**
   * @param {HTMLElement} rootElement
   * @param {Object} options
   * @param {string} [instanceId]
   */
  constructor(rootElement, options = {}, instanceId = null) {
    this.root = rootElement;
    this.instanceId = instanceId || `dl_${++instanceSeq}_${Date.now()}`;
    this.theme = this._sanitizeTheme(options.theme || 'dark');
    this.mode = options.mode || 'inline';
    this.preventScroll = options.preventScroll !== false;
    this.zIndex = options.zIndex !== undefined ? options.zIndex : null;
    this.background = options.background || null;

    this.apply();
  }

  /**
   * Sanitizes theme string
   * @private
   */
  _sanitizeTheme(theme) {
    const val = String(theme).toLowerCase().trim();
    if (['dark', 'light', 'auto'].includes(val)) {
      return val;
    }
    return 'dark';
  }

  /**
   * Applies theme, mode, custom background, and z-index to the root element
   */
  apply() {
    if (!this.root) return;

    this.root.dataset.theme = this.theme;
    this.root.dataset.mode = this.mode;

    if (this.background) {
      if (typeof this.root.style.setProperty === 'function') {
        this.root.style.setProperty('--dl-bg', this.background);
      } else {
        this.root.style['--dl-bg'] = this.background;
      }
    }

    if (this.zIndex !== null) {
      this.root.style.zIndex = String(this.zIndex);
    }
  }

  /**
   * Dynamically sets theme ('dark' | 'light' | 'auto')
   * @param {string} theme
   */
  setTheme(theme) {
    this.theme = this._sanitizeTheme(theme);
    if (this.root) {
      this.root.dataset.theme = this.theme;
    }
  }

  /**
   * Dynamically updates display mode ('fullscreen' | 'inline')
   * @param {string} mode
   */
  setMode(mode) {
    const prevMode = this.mode;
    this.mode = mode === 'fullscreen' ? 'fullscreen' : 'inline';
    if (this.root) {
      this.root.dataset.mode = this.mode;
    }

    if (prevMode === 'fullscreen' && this.mode === 'inline') {
      this.unlockBodyScroll();
    }
  }

  /**
   * Locks document body scrolling for this instance
   */
  lockBodyScroll() {
    if (this.mode !== 'fullscreen' || !this.preventScroll) return;
    ScrollLock.lock(this.instanceId);
  }

  /**
   * Releases document body scrolling for this instance
   */
  unlockBodyScroll() {
    ScrollLock.unlock(this.instanceId);
  }

  /**
   * Cleanup on destroy
   */
  destroy() {
    this.unlockBodyScroll();
  }
}

export { ScrollLock };
