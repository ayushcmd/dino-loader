/**
 * Animation Engine for DinoLoader
 * Controls running states, obstacle toggles, animation speeds, sizing,
 * reduced-motion compliance (with OS query listener), and execution pause/resume.
 */

export class AnimationManager {
  /**
   * @param {HTMLElement} rootElement
   * @param {Object} options
   */
  constructor(rootElement, options = {}) {
    this.root = rootElement;

    // Support both 'animationSpeed' and legacy 'speed' alias
    this.speed = this._sanitizeSpeed(options.animationSpeed || options.speed || 'normal');
    this.size = this._sanitizeSize(options.size || 'medium');
    this.cactus = options.cactus !== false;
    this.clouds = options.clouds !== false;
    this.autojump = options.autojump !== false;
    this.state = 'running'; // 'running' | 'idle' | 'complete' | 'error'
    this.isPaused = false;

    // Reduced motion handling
    this._explicitReducedMotion = options.reducedMotion !== undefined ? Boolean(options.reducedMotion) : null;
    this.reducedMotion = false;
    this._mediaQueryList = null;
    this._onMotionQueryChange = this._onMotionQueryChange.bind(this);

    this._setupReducedMotion();
    this.apply();
  }

  _sanitizeSpeed(speed) {
    const val = String(speed).toLowerCase().trim();
    if (['slow', 'normal', 'fast'].includes(val)) return val;
    return 'normal';
  }

  _sanitizeSize(size) {
    const val = String(size).toLowerCase().trim();
    if (['small', 'medium', 'large'].includes(val)) return val;
    return 'medium';
  }

  _setupReducedMotion() {
    if (this._explicitReducedMotion !== null) {
      this.reducedMotion = this._explicitReducedMotion;
      return;
    }

    if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
      try {
        this._mediaQueryList = window.matchMedia('(prefers-reduced-motion: reduce)');
        this.reducedMotion = Boolean(this._mediaQueryList.matches);

        if (this._mediaQueryList.addEventListener) {
          this._mediaQueryList.addEventListener('change', this._onMotionQueryChange);
        } else if (this._mediaQueryList.addListener) {
          this._mediaQueryList.addListener(this._onMotionQueryChange);
        }
      } catch {
        this.reducedMotion = false;
      }
    }
  }

  _onMotionQueryChange(e) {
    if (this._explicitReducedMotion === null) {
      this.reducedMotion = Boolean(e.matches);
      this._updateMotionClass();
    }
  }

  _updateMotionClass() {
    if (!this.root) return;
    if (this.reducedMotion) {
      this.root.classList.add('dl-reduced-motion');
    } else {
      this.root.classList.remove('dl-reduced-motion');
    }
  }

  apply() {
    if (!this.root) return;

    this.root.dataset.speed = this.speed;
    this.root.dataset.size = this.size;
    this.root.dataset.cactus = String(this.cactus);
    this.root.dataset.clouds = String(this.clouds);
    this.root.dataset.autojump = String(this.autojump);
    this.root.dataset.state = this.state;

    this._updateMotionClass();

    if (this.isPaused) {
      this.root.classList.add('dl-paused');
    } else {
      this.root.classList.remove('dl-paused');
    }
  }

  /**
   * Updates state ('running' | 'idle' | 'complete' | 'error')
   * @param {string} state
   */
  setState(state) {
    const val = String(state).toLowerCase().trim();
    if (['running', 'idle', 'complete', 'error'].includes(val)) {
      this.state = val;
      if (this.root) {
        this.root.dataset.state = this.state;
      }
    }
  }

  /**
   * Sets animation speed ('slow' | 'normal' | 'fast')
   * @param {string} speed
   */
  setSpeed(speed) {
    this.speed = this._sanitizeSpeed(speed);
    if (this.root) {
      this.root.dataset.speed = this.speed;
    }
  }

  /**
   * Sets size preset ('small' | 'medium' | 'large')
   * @param {string} size
   */
  setSize(size) {
    this.size = this._sanitizeSize(size);
    if (this.root) {
      this.root.dataset.size = this.size;
    }
  }

  /**
   * Toggles cactus obstacles
   * @param {boolean} enabled
   */
  setCactus(enabled) {
    this.cactus = Boolean(enabled);
    if (this.root) {
      this.root.dataset.cactus = String(this.cactus);
    }
  }

  /**
   * Toggles clouds
   * @param {boolean} enabled
   */
  setClouds(enabled) {
    this.clouds = Boolean(enabled);
    if (this.root) {
      this.root.dataset.clouds = String(this.clouds);
    }
  }

  /**
   * Toggles auto-jump
   * @param {boolean} enabled
   */
  setAutoJump(enabled) {
    this.autojump = Boolean(enabled);
    if (this.root) {
      this.root.dataset.autojump = String(this.autojump);
    }
  }

  /**
   * Explicitly set reduced-motion mode
   * @param {boolean} enabled
   */
  setReducedMotion(enabled) {
    this._explicitReducedMotion = Boolean(enabled);
    this.reducedMotion = this._explicitReducedMotion;
    this._updateMotionClass();
  }

  /**
   * Pauses all CSS animations to eliminate background CPU/GPU usage
   */
  pause() {
    this.isPaused = true;
    if (this.root) {
      this.root.classList.add('dl-paused');
    }
  }

  /**
   * Resumes CSS animations
   */
  resume() {
    this.isPaused = false;
    if (this.root) {
      this.root.classList.remove('dl-paused');
    }
  }

  /**
   * Cleans up media query listeners
   */
  destroy() {
    if (this._mediaQueryList) {
      if (this._mediaQueryList.removeEventListener) {
        this._mediaQueryList.removeEventListener('change', this._onMotionQueryChange);
      } else if (this._mediaQueryList.removeListener) {
        this._mediaQueryList.removeListener(this._onMotionQueryChange);
      }
      this._mediaQueryList = null;
    }
  }
}
