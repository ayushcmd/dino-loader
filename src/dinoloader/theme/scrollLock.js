/**
 * Safe, Instance-Aware Shared Scroll Lock Manager for DinoLoader
 * Prevents multiple concurrent fullscreen instances from prematurely releasing scroll lock,
 * avoids layout shifts, and restores original body styles and scroll coordinates.
 */

const activeLockers = new Set();
let originalBodyStyles = null;
let savedScrollPos = { x: 0, y: 0 };

export const ScrollLock = {
  /**
   * Locks document body scrolling for a specific instance
   * @param {string} instanceId
   */
  lock(instanceId) {
    if (typeof document === 'undefined' || !document.body || typeof window === 'undefined') return;

    if (activeLockers.size === 0) {
      savedScrollPos = {
        x: window.scrollX !== undefined ? window.scrollX : (window.pageXOffset || 0),
        y: window.scrollY !== undefined ? window.scrollY : (window.pageYOffset || 0)
      };

      originalBodyStyles = {
        overflow: document.body.style.overflow || '',
        paddingRight: document.body.style.paddingRight || ''
      };

      // Prevent layout shift if a scrollbar was visible
      if (typeof document.documentElement !== 'undefined' && window.innerWidth) {
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
        if (scrollbarWidth > 0) {
          const currentPadding = window.getComputedStyle
            ? (parseFloat(window.getComputedStyle(document.body).paddingRight) || 0)
            : 0;
          document.body.style.paddingRight = `${currentPadding + scrollbarWidth}px`;
        }
      }

      document.body.style.overflow = 'hidden';
    }

    activeLockers.add(instanceId);
  },

  /**
   * Releases scroll lock for a specific instance.
   * Only restores original body styles and scroll position when all active instances release.
   * @param {string} instanceId
   */
  unlock(instanceId) {
    if (typeof document === 'undefined' || !document.body || typeof window === 'undefined') return;
    if (!activeLockers.has(instanceId)) return;

    activeLockers.delete(instanceId);

    if (activeLockers.size === 0 && originalBodyStyles) {
      document.body.style.overflow = originalBodyStyles.overflow;
      document.body.style.paddingRight = originalBodyStyles.paddingRight;
      originalBodyStyles = null;

      if (typeof window.scrollTo === 'function') {
        window.scrollTo(savedScrollPos.x, savedScrollPos.y);
      }
    }
  },

  /**
   * Checks if an instance currently holds a scroll lock
   * @param {string} instanceId
   * @returns {boolean}
   */
  isLocked(instanceId) {
    return activeLockers.has(instanceId);
  },

  /**
   * Returns current number of active fullscreen lockers
   * @returns {number}
   */
  getActiveCount() {
    return activeLockers.size;
  },

  /**
   * Reset for testing environments
   */
  reset() {
    activeLockers.clear();
    originalBodyStyles = null;
    savedScrollPos = { x: 0, y: 0 };
  }
};
