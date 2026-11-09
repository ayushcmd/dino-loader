/**
 * Theme & Display Mode Manager for DinoLoader
 * Handles theme application, custom colors, z-index, and body scroll lock restoration.
 */

// Global scroll lock counter to handle multiple concurrent fullscreen instances safely
let scrollLockCount = 0;
let originalBodyOverflow = '';

export class ThemeManager {
  /**
   * @param {HTMLElement} rootElement
   * @param {Object} options
   */
  constructor(rootElement, options = {}) {
    this.root = rootElement;
    this.theme = this._sanitizeTheme(options.theme || 'dark');
    this.mode = options.mode || 'inline';
    this.preventScroll = options.preventScroll !== false;
    this.zIndex = options.zIndex !== undefined ? options.zIndex : null;
    this.background = options.background || null;
    this._isScrollLocked = false;

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

    // If switching from fullscreen to inline, release scroll lock
    if (prevMode === 'fullscreen' && this.mode === 'inline') {
      this.unlockBodyScroll();
    }
  }

  /**
   * Locks document body scrolling when entering fullscreen mode
   */
  lockBodyScroll() {
    if (typeof document === 'undefined' || !document.body) return;
    if (this.mode !== 'fullscreen' || !this.preventScroll || this._isScrollLocked) return;

    if (scrollLockCount === 0) {
      originalBodyOverflow = document.body.style.overflow || '';
      document.body.style.overflow = 'hidden';
    }
    scrollLockCount++;
    this._isScrollLocked = true;
  }

  /**
   * Restores document body scrolling when hiding or destroying fullscreen mode
   */
  unlockBodyScroll() {
    if (typeof document === 'undefined' || !document.body || !this._isScrollLocked) return;

    scrollLockCount = Math.max(0, scrollLockCount - 1);
    if (scrollLockCount === 0) {
      document.body.style.overflow = originalBodyOverflow;
    }
    this._isScrollLocked = false;
  }

  /**
   * Cleanup on destroy
   */
  destroy() {
    this.unlockBodyScroll();
  }
}
