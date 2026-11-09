import { createDinoSvg } from '../assets/dino.js';
import { createCactusSvg, createCloudSvg, createGroundTextureSvg } from '../assets/obstacles.js';

/**
 * DOM Renderer for DinoLoader
 * Constructs semantic SVG and HTML tree, caches DOM handles, and provides mounting/unmounting.
 */
export class Renderer {
  /**
   * @param {Object} options
   */
  constructor(options = {}) {
    this.options = options;
    this.dom = {
      root: null,
      stage: null,
      dinoContainer: null,
      progressTrack: null,
      progressFill: null,
      percentText: null,
      messageText: null,
      statusBadge: null,
      closeBtn: null
    };

    this._buildTree();
  }

  /**
   * Builds the DOM structure
   * @private
   */
  _buildTree() {
    if (typeof document === 'undefined') return;

    const root = document.createElement('div');
    root.className = 'dinoloader';
    root.setAttribute('role', 'progressbar');
    root.setAttribute('aria-valuemin', '0');
    root.setAttribute('aria-valuemax', '100');
    root.setAttribute('aria-live', 'polite');

    const dinoSvg = createDinoSvg();
    const groundTexture = createGroundTextureSvg();
    const cactus1 = createCactusSvg('single');
    const cactus2 = createCactusSvg('double');
    const cloud1 = createCloudSvg(1);
    const cloud2 = createCloudSvg(2);

    // 8 seamless repeating texture tiles to comfortably span up to ultra-wide displays
    const textureStrips = Array(8)
      .fill(`<div class="dl-ground-texture-strip">${groundTexture}</div>`)
      .join('');

    root.innerHTML = `
      <button type="button" class="dl-fullscreen-close" aria-label="Exit fullscreen">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="square">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
        <span>Exit (Esc)</span>
      </button>

      <div class="dl-stage">
        <!-- Clouds in upper background -->
        <div class="dl-clouds-layer">
          <div class="dl-cloud dl-cloud-1">${cloud1}</div>
          <div class="dl-cloud dl-cloud-2">${cloud2}</div>
        </div>

        <!-- Dinosaur positioned directly on ground baseline -->
        <div class="dl-dino-container">
          <div class="dl-dino-jumper">
            ${dinoSvg}
          </div>
        </div>

        <!-- Moving cactus obstacles sitting flush on ground -->
        <div class="dl-cactus-layer">
          <div class="dl-cactus-item dl-cactus-1">${cactus1}</div>
          <div class="dl-cactus-item dl-cactus-2">${cactus2}</div>
        </div>

        <!-- Continuous ground baseline and moving ground texture -->
        <div class="dl-ground-layer">
          <div class="dl-ground-baseline"></div>
          <div class="dl-ground-texture-track">
            ${textureStrips}
          </div>
        </div>
      </div>

      <div class="dl-progress-wrapper">
        <div class="dl-progress-bar-container">
          <div class="dl-progress-track">
            <div class="dl-progress-fill"></div>
          </div>
          <div class="dl-progress-percent">0%</div>
        </div>

        <div class="dl-message-row">
          <span class="dl-message-text"></span>
          <span class="dl-status-badge">RUNNING</span>
        </div>
      </div>
    `;

    this.dom.root = root;
    this.dom.stage = root.querySelector('.dl-stage');
    this.dom.dinoContainer = root.querySelector('.dl-dino-container');
    this.dom.progressTrack = root.querySelector('.dl-progress-track');
    this.dom.progressFill = root.querySelector('.dl-progress-fill');
    this.dom.percentText = root.querySelector('.dl-progress-percent');
    this.dom.messageText = root.querySelector('.dl-message-text');
    this.dom.statusBadge = root.querySelector('.dl-status-badge');
    this.dom.closeBtn = root.querySelector('.dl-fullscreen-close');

    if (this.dom.messageText) {
      this.dom.messageText.textContent = this.options.message || 'Loading your experience...';
    }
  }

  /**
   * Updates loading text message
   * @param {string} message
   */
  setMessage(message) {
    if (this.dom.messageText) {
      this.dom.messageText.textContent = String(message || '');
    }
  }

  /**
   * Updates status badge text
   * @param {string} statusText
   */
  setStatus(statusText) {
    if (this.dom.statusBadge) {
      this.dom.statusBadge.textContent = String(statusText).toUpperCase();
    }
  }

  /**
   * Mounts root element to container
   * @param {HTMLElement|string} target
   * @returns {boolean} Whether mounting succeeded
   */
  mount(target) {
    if (typeof document === 'undefined') return false;

    const container = target
      ? (typeof target === 'string' ? document.querySelector(target) : target)
      : document.body;

    if (!container || !this.dom.root) return false;

    if (this.dom.root.parentNode !== container) {
      container.appendChild(this.dom.root);
    }
    return true;
  }

  /**
   * Unmounts root element from container
   */
  unmount() {
    if (this.dom.root && this.dom.root.parentNode) {
      this.dom.root.parentNode.removeChild(this.dom.root);
    }
  }

  /**
   * Completely tears down DOM elements
   */
  destroy() {
    this.unmount();
    this.dom.root = null;
    this.dom.stage = null;
    this.dom.dinoContainer = null;
    this.dom.progressTrack = null;
    this.dom.progressFill = null;
    this.dom.percentText = null;
    this.dom.messageText = null;
    this.dom.statusBadge = null;
    this.dom.closeBtn = null;
  }
}
