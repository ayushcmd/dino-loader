import React, { useEffect, useRef } from 'react';
import { createDinoLoader } from '../dinoloader/index.js';

/**
 * DinoLoader React Component
 * A declarative React adapter for the lightweight pixel-art dinosaur loading component.
 * Compatible with React 18 and React 19.
 *
 * @param {Object} props
 * @param {boolean} [props.loading=true] Whether the loader is visible
 * @param {number|null} [props.progress] Progress percentage (0–100). If omitted or false, runs indeterminate.
 * @param {'inline'|'fullscreen'} [props.mode='inline'] Display mode
 * @param {'dark'|'light'|'auto'} [props.theme='dark'] Color theme
 * @param {'small'|'medium'|'large'} [props.size='medium'] Size preset
 * @param {string} [props.message='Loading your experience...'] Status text message
 * @param {'slow'|'normal'|'fast'} [props.animationSpeed='normal'] Animation speed
 * @param {'slow'|'normal'|'fast'} [props.speed] Alias for animationSpeed
 * @param {boolean} [props.showPercentage=true] Whether to display numerical percentage text
 * @param {boolean} [props.cactus=true] Whether moving cactus obstacles are enabled
 * @param {boolean} [props.clouds=true] Whether drifting pixel clouds are enabled
 * @param {boolean} [props.autojump=true] Whether dino hops over obstacles
 * @param {boolean} [props.reducedMotion] Explicitly set reduced-motion mode
 * @param {number} [props.zIndex] Custom z-index for fullscreen mode
 * @param {string} [props.background] Custom background override for fullscreen mode
 * @param {boolean} [props.preventScroll=true] Lock background body scroll in fullscreen mode
 * @param {Function} [props.onComplete] Callback fired when progress reaches 100% or complete() is called
 * @param {Function} [props.onError] Callback fired on error state
 * @param {string} [props.className] Optional CSS class name for container (inline mode)
 * @param {Object} [props.style] Optional CSS inline styles for container (inline mode)
 */
export function DinoLoader({
  loading = true,
  progress = undefined,
  mode = 'inline',
  theme = 'dark',
  size = 'medium',
  message = 'Loading your experience...',
  animationSpeed = 'normal',
  speed,
  showPercentage = true,
  cactus = true,
  clouds = true,
  autojump = true,
  reducedMotion,
  zIndex = null,
  background = null,
  preventScroll = true,
  onComplete,
  onError,
  className = '',
  style = {}
}) {
  const containerRef = useRef(null);
  const loaderRef = useRef(null);

  // Stabilize callbacks to prevent unnecessary effect re-executions
  const onCompleteRef = useRef(onComplete);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  const effectiveSpeed = animationSpeed || speed || 'normal';
  const isDeterminate = typeof progress === 'number';

  // 1. Initialize and manage loader lifecycle
  useEffect(() => {
    const targetContainer = mode === 'fullscreen' ? (typeof document !== 'undefined' ? document.body : null) : containerRef.current;
    if (!targetContainer) return;

    const loader = createDinoLoader({
      container: targetContainer,
      mode,
      theme,
      size,
      speed: effectiveSpeed,
      animationSpeed: effectiveSpeed,
      progress: isDeterminate,
      initialProgress: isDeterminate ? progress : 0,
      message,
      showPercentage,
      cactus,
      clouds,
      autojump,
      reducedMotion,
      zIndex,
      background,
      preventScroll,
      onComplete: () => {
        if (typeof onCompleteRef.current === 'function') {
          onCompleteRef.current();
        }
      },
      onError: (err) => {
        if (typeof onErrorRef.current === 'function') {
          onErrorRef.current(err);
        }
      }
    });

    loaderRef.current = loader;

    if (loading) {
      loader.show();
    } else {
      loader.hide();
    }

    return () => {
      loader.destroy();
      loaderRef.current = null;
    };
  }, [mode]); // Re-create only if display mode fundamentally changes (inline <-> fullscreen)

  // 2. React to loading prop toggles
  useEffect(() => {
    const loader = loaderRef.current;
    if (!loader) return;

    if (loading) {
      loader.show();
    } else {
      loader.hide();
    }
  }, [loading]);

  // 3. React to progress changes
  useEffect(() => {
    const loader = loaderRef.current;
    if (!loader) return;

    if (typeof progress === 'number') {
      if (progress >= 100) {
        loader.complete(message);
      } else {
        loader.update(progress);
      }
    } else if (progress === false) {
      loader.setOptions({ progress: false });
    }
  }, [progress, message]);

  // 4. React to message changes
  useEffect(() => {
    const loader = loaderRef.current;
    if (!loader) return;
    loader.setMessage(message);
  }, [message]);

  // 5. React to theme changes
  useEffect(() => {
    const loader = loaderRef.current;
    if (!loader) return;
    loader.setTheme(theme);
  }, [theme]);

  // 6. React to dynamic option changes without DOM re-mount
  useEffect(() => {
    const loader = loaderRef.current;
    if (!loader) return;

    loader.setOptions({
      size,
      speed: effectiveSpeed,
      animationSpeed: effectiveSpeed,
      showPercentage,
      cactus,
      clouds,
      autojump,
      reducedMotion,
      zIndex,
      background,
      preventScroll
    });
  }, [size, effectiveSpeed, showPercentage, cactus, clouds, autojump, reducedMotion, zIndex, background, preventScroll]);

  // For fullscreen mode, the loader mounts directly to document.body
  if (mode === 'fullscreen') {
    return null;
  }

  // For inline mode, render mounting container div
  return (
    <div
      ref={containerRef}
      className={`dinoloader-react-container ${className}`.trim()}
      style={style}
      aria-busy={loading}
    />
  );
}

export default DinoLoader;
