/**
 * Progress Manager for DinoLoader
 * Handles determinate/indeterminate progress states, boundary clamping (0-100),
 * invalid input sanitization, and ARIA accessibility synchronization.
 */

export class ProgressManager {
  /**
   * @param {Object} domElements
   * @param {Object} options
   */
  constructor(domElements, options = {}) {
    this.dom = domElements;
    this.isDeterminate = options.progress !== false;
    this.showPercentage = options.showPercentage !== false;
    this.onProgress = typeof options.onProgress === 'function' ? options.onProgress : null;

    this.currentProgress = this.sanitize(options.initialProgress !== undefined ? options.initialProgress : 0);

    this.apply();
  }

  /**
   * Strict numerical sanitization and clamping between 0 and 100.
   * Gracefully handles NaN, non-numbers, negative values, and overflows.
   * @param {*} value
   * @returns {number}
   */
  sanitize(value) {
    if (value === null || value === undefined) {
      return 0;
    }
    const num = Number(value);
    if (isNaN(num)) {
      return 0;
    }
    return Math.max(0, Math.min(100, num));
  }

  /**
   * Applies progress state to DOM elements and ARIA attributes
   */
  apply() {
    const { root, progressFill, percentText } = this.dom;
    if (!root) return;

    root.dataset.indeterminate = String(!this.isDeterminate);
    root.dataset.showPercentage = String(this.showPercentage);

    if (this.isDeterminate) {
      root.setAttribute('role', 'progressbar');
      root.setAttribute('aria-valuemin', '0');
      root.setAttribute('aria-valuemax', '100');
      const rounded = Math.round(this.currentProgress);
      root.setAttribute('aria-valuenow', String(rounded));

      if (progressFill) {
        progressFill.style.width = `${rounded}%`;
      }
      if (percentText) {
        percentText.textContent = `${rounded}%`;
      }
    } else {
      root.removeAttribute('aria-valuenow');
      if (progressFill) {
        progressFill.style.width = '';
      }
    }
  }

  /**
   * Updates determinate progress value
   * @param {*} value
   * @returns {number} Sanitized applied value
   */
  update(value) {
    const prev = this.currentProgress;
    this.currentProgress = this.sanitize(value);

    // If progress was indeterminate, update switches to determinate
    if (!this.isDeterminate) {
      this.isDeterminate = true;
      if (this.dom.root) {
        this.dom.root.dataset.indeterminate = 'false';
      }
    }

    const rounded = Math.round(this.currentProgress);

    if (this.dom.progressFill) {
      this.dom.progressFill.style.width = `${rounded}%`;
    }
    if (this.dom.percentText) {
      this.dom.percentText.textContent = `${rounded}%`;
    }
    if (this.dom.root) {
      this.dom.root.setAttribute('aria-valuenow', String(rounded));
    }

    if (this.onProgress && prev !== this.currentProgress) {
      this.onProgress(this.currentProgress);
    }

    return this.currentProgress;
  }

  /**
   * Sets mode to determinate (true) or indeterminate (false)
   * @param {boolean} isDeterminate
   */
  setDeterminate(isDeterminate) {
    this.isDeterminate = Boolean(isDeterminate);
    this.apply();
  }

  /**
   * Sets percentage text visibility
   * @param {boolean} show
   */
  setShowPercentage(show) {
    this.showPercentage = Boolean(show);
    if (this.dom.root) {
      this.dom.root.dataset.showPercentage = String(this.showPercentage);
    }
  }

  /**
   * Returns current progress percentage (0-100)
   * @returns {number}
   */
  getValue() {
    return this.currentProgress;
  }

  /**
   * Returns whether mode is determinate
   * @returns {boolean}
   */
  getIsDeterminate() {
    return this.isDeterminate;
  }
}
