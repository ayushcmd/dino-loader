import { Renderer } from '../dom/renderer.js';
import { ProgressManager } from '../progress/progressManager.js';
import { AnimationManager } from '../animation/animationManager.js';
import { ThemeManager } from '../theme/themeManager.js';

/**
 * Default configuration options for DinoLoader
 */
export const DEFAULT_OPTIONS = {
  mode: 'inline',               // 'inline' | 'fullscreen'
  theme: 'dark',                // 'dark' | 'light' | 'auto'
  size: 'medium',               // 'small' | 'medium' | 'large'
  progress: true,               // true (determinate) | false (indeterminate)
  initialProgress: 0,           // 0 - 100
  message: 'Loading your experience...',
  animationSpeed: 'normal',     // 'slow' | 'normal' | 'fast'
  speed: 'normal',              // legacy alias for animationSpeed
  showPercentage: true,         // boolean
  cactus: true,                 // boolean
  clouds: true,                 // boolean
  autojump: true,               // boolean
  reducedMotion: false,         // boolean
  container: null,              // HTMLElement | string | null
  zIndex: null,                 // number | null (for fullscreen mode)
  background: null,             // string | null (custom background override)
  preventScroll: true,          // boolean (prevent background scroll in fullscreen)
  onComplete: null,             // Function | null
  onError: null,                // Function | null
  onProgress: null              // Function | null
};

export class DinoLoader {
  /**
   * @param {Partial<typeof DEFAULT_OPTIONS>} options
   */
  constructor(options = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
    if (options.animationSpeed && !options.speed) {
      this.options.speed = options.animationSpeed;
    }

    this.isMounted = false;
    this.isVisible = false;
    this.isDestroyed = false;

    this._onCloseClick = this._onCloseClick.bind(this);
    this._onKeyDown = this._onKeyDown.bind(this);

    // Initialize subsystems
    this.renderer = new Renderer(this.options);
    const rootEl = this.renderer.dom.root;

    this.themeManager = new ThemeManager(rootEl, this.options);
    this.progressManager = new ProgressManager(this.renderer.dom, this.options);
    this.animationManager = new AnimationManager(rootEl, this.options);

    // Setup close button listener
    if (this.renderer.dom.closeBtn) {
      this.renderer.dom.closeBtn.addEventListener('click', this._onCloseClick);
    }
  }

  /**
   * Internal handler for fullscreen close button
   * @private
   */
  _onCloseClick() {
    if (this.themeManager.mode === 'fullscreen') {
      this.hide();
    }
  }

  /**
   * Internal keyboard listener (Esc to close fullscreen)
   * @private
   */
  _onKeyDown(e) {
    if (e.key === 'Escape' && this.themeManager.mode === 'fullscreen') {
      this.hide();
    }
  }

  /**
   * Displays the loader in the container
   * @param {HTMLElement|string} [target]
   * @returns {DinoLoader}
   */
  show(target = null) {
    if (this.isDestroyed) return this;

    const mountTarget = target || this.options.container;
    const mounted = this.renderer.mount(mountTarget);

    if (mounted && !this.isMounted) {
      this.isMounted = true;
      if (typeof window !== 'undefined') {
        window.addEventListener('keydown', this._onKeyDown);
      }
    }

    if (this.renderer.dom.root) {
      this.renderer.dom.root.style.display = '';
    }

    this.isVisible = true;
    this.animationManager.resume();

    if (this.themeManager.mode === 'fullscreen') {
      this.themeManager.lockBodyScroll();
    }

    return this;
  }

  /**
   * Hides the loader and pauses animations to eliminate background resource usage
   * @returns {DinoLoader}
   */
  hide() {
    if (this.isDestroyed) return this;

    if (this.renderer.dom.root) {
      this.renderer.dom.root.style.display = 'none';
    }

    this.isVisible = false;
    this.animationManager.pause();
    this.themeManager.unlockBodyScroll();

    return this;
  }

  /**
   * Updates actual determinate progress value (0–100)
   * @param {*} value Progress percentage (sanitized and clamped)
   * @returns {DinoLoader}
   */
  update(value) {
    if (this.isDestroyed) return this;

    this.progressManager.update(value);

    // Resume running state if progress is advancing and not complete
    if (this.animationManager.state !== 'running' && this.progressManager.getValue() < 100) {
      this.animationManager.setState('running');
      this.renderer.setStatus('RUNNING');
    }

    return this;
  }

  /**
   * Triggers the completed state with victory dinosaur animation
   * @param {string} [completionMessage='Loading complete!']
   * @returns {DinoLoader}
   */
  complete(completionMessage = 'Loading complete!') {
    if (this.isDestroyed) return this;

    this.progressManager.update(100);
    this.animationManager.setState('complete');
    this.renderer.setMessage(completionMessage);
    this.renderer.setStatus('COMPLETE');

    if (typeof this.options.onComplete === 'function') {
      this.options.onComplete();
    }

    return this;
  }

  /**
   * Triggers the error state with tumbled dinosaur and alert message
   * @param {string} [errorMessage='An error occurred during loading.']
   * @returns {DinoLoader}
   */
  error(errorMessage = 'An error occurred during loading.') {
    if (this.isDestroyed) return this;

    this.animationManager.setState('error');
    this.renderer.setMessage(errorMessage);
    this.renderer.setStatus('ERROR');

    if (typeof this.options.onError === 'function') {
      this.options.onError(new Error(errorMessage));
    }

    return this;
  }

  /**
   * Updates loading text message
   * @param {string} message
   * @returns {DinoLoader}
   */
  setMessage(message) {
    if (this.isDestroyed) return this;
    this.options.message = String(message || '');
    this.renderer.setMessage(this.options.message);
    return this;
  }

  /**
   * Updates theme dynamically ('dark' | 'light' | 'auto')
   * @param {string} theme
   * @returns {DinoLoader}
   */
  setTheme(theme) {
    if (this.isDestroyed) return this;
    this.options.theme = theme;
    this.themeManager.setTheme(theme);
    return this;
  }

  /**
   * Updates component options dynamically
   * @param {Partial<typeof DEFAULT_OPTIONS>} newOptions
   * @returns {DinoLoader}
   */
  setOptions(newOptions = {}) {
    if (this.isDestroyed) return this;

    this.options = { ...this.options, ...newOptions };

    if (newOptions.theme !== undefined) {
      this.themeManager.setTheme(newOptions.theme);
    }
    if (newOptions.mode !== undefined) {
      this.themeManager.setMode(newOptions.mode);
      if (this.isVisible && newOptions.mode === 'fullscreen') {
        this.themeManager.lockBodyScroll();
      }
    }
    if (newOptions.animationSpeed !== undefined || newOptions.speed !== undefined) {
      this.animationManager.setSpeed(newOptions.animationSpeed || newOptions.speed);
    }
    if (newOptions.size !== undefined) {
      this.animationManager.setSize(newOptions.size);
    }
    if (newOptions.cactus !== undefined) {
      this.animationManager.setCactus(newOptions.cactus);
    }
    if (newOptions.clouds !== undefined) {
      this.animationManager.setClouds(newOptions.clouds);
    }
    if (newOptions.autojump !== undefined) {
      this.animationManager.setAutoJump(newOptions.autojump);
    }
    if (newOptions.reducedMotion !== undefined) {
      this.animationManager.setReducedMotion(newOptions.reducedMotion);
    }
    if (newOptions.message !== undefined) {
      this.renderer.setMessage(newOptions.message);
    }
    if (newOptions.progress !== undefined) {
      this.progressManager.setDeterminate(newOptions.progress);
    }
    if (newOptions.showPercentage !== undefined) {
      this.progressManager.setShowPercentage(newOptions.showPercentage);
    }

    return this;
  }

  /**
   * Resets loader back to running state and initial progress
   * @param {number} [initialProgress=0]
   * @returns {DinoLoader}
   */
  reset(initialProgress = 0) {
    if (this.isDestroyed) return this;

    this.progressManager.update(initialProgress);
    this.animationManager.setState('running');
    this.renderer.setMessage(this.options.message || 'Loading your experience...');
    this.renderer.setStatus('RUNNING');
    this.animationManager.resume();

    return this;
  }

  /**
   * Returns root DOM element
   * @returns {HTMLElement|null}
   */
  getElement() {
    return this.renderer.dom.root;
  }

  /**
   * Returns current progress percentage (0–100)
   * @returns {number}
   */
  getProgress() {
    return this.progressManager.getValue();
  }

  /**
   * Returns current component state ('running' | 'idle' | 'complete' | 'error')
   * @returns {string}
   */
  getState() {
    return this.animationManager.state;
  }

  /**
   * Returns current theme
   * @returns {string}
   */
  getTheme() {
    return this.themeManager.theme;
  }

  /**
   * Returns current mode
   * @returns {string}
   */
  getMode() {
    return this.themeManager.mode;
  }

  /**
   * Completely destroys instance, cleaning up all DOM elements, event listeners,
   * animations, and restored body styles.
   */
  destroy() {
    if (this.isDestroyed) return;

    if (typeof window !== 'undefined') {
      window.removeEventListener('keydown', this._onKeyDown);
    }
    if (this.renderer.dom.closeBtn) {
      this.renderer.dom.closeBtn.removeEventListener('click', this._onCloseClick);
    }

    this.themeManager.destroy();
    this.animationManager.pause();
    this.renderer.destroy();

    this.isMounted = false;
    this.isVisible = false;
    this.isDestroyed = true;
  }
}

/**
 * Factory function creating a new DinoLoader instance
 * @param {Partial<typeof DEFAULT_OPTIONS>} options
 * @returns {DinoLoader}
 */
export function createDinoLoader(options = {}) {
  return new DinoLoader(options);
}
