import { useEffect, useRef, useState, useCallback } from 'react';
import { createDinoLoader } from '../dinoloader/index.js';

/**
 * Custom React hook for programmatic control of DinoLoader
 * @param {Object} [initialOptions]
 */
export function useDinoLoader(initialOptions = {}) {
  const loaderRef = useRef(null);
  const [progress, setProgress] = useState(initialOptions.initialProgress || 0);
  const [state, setState] = useState('idle');

  useEffect(() => {
    const loader = createDinoLoader({
      ...initialOptions,
      onProgress: (p) => {
        setProgress(p);
        if (typeof initialOptions.onProgress === 'function') {
          initialOptions.onProgress(p);
        }
      },
      onComplete: () => {
        setState('complete');
        if (typeof initialOptions.onComplete === 'function') {
          initialOptions.onComplete();
        }
      },
      onError: (err) => {
        setState('error');
        if (typeof initialOptions.onError === 'function') {
          initialOptions.onError(err);
        }
      }
    });

    loaderRef.current = loader;

    return () => {
      loader.destroy();
      loaderRef.current = null;
    };
  }, []); // Mounts once and handles destruction on unmount

  const show = useCallback((target) => loaderRef.current?.show(target), []);
  const hide = useCallback(() => loaderRef.current?.hide(), []);
  const update = useCallback((val) => loaderRef.current?.update(val), []);
  const complete = useCallback((msg) => loaderRef.current?.complete(msg), []);
  const error = useCallback((msg) => loaderRef.current?.error(msg), []);
  const setMessage = useCallback((msg) => loaderRef.current?.setMessage(msg), []);
  const setTheme = useCallback((theme) => loaderRef.current?.setTheme(theme), []);
  const reset = useCallback((init) => loaderRef.current?.reset(init), []);

  return {
    loader: loaderRef.current,
    show,
    hide,
    update,
    complete,
    error,
    setMessage,
    setTheme,
    reset,
    progress,
    state
  };
}
