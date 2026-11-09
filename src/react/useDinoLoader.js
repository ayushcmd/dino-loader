import { useEffect, useRef, useState, useCallback } from 'react';
import { createDinoLoader } from '../dinoloader/index.js';

/**
 * Custom React hook for programmatic control of DinoLoader
 * @param {Object} [initialOptions]
 */
export function useDinoLoader(initialOptions = {}) {
  const loaderRef = useRef(null);
  const optionsRef = useRef(initialOptions);
  const [loaderInstance, setLoaderInstance] = useState(null);
  const [progress, setProgress] = useState(initialOptions.initialProgress || 0);
  const [state, setState] = useState('idle');

  // Keep options reference synchronized with latest props/callbacks
  useEffect(() => {
    optionsRef.current = initialOptions;
  }, [initialOptions]);

  useEffect(() => {
    const loader = createDinoLoader({
      ...optionsRef.current,
      onProgress: (p) => {
        setProgress(p);
        if (typeof optionsRef.current?.onProgress === 'function') {
          optionsRef.current.onProgress(p);
        }
      },
      onComplete: () => {
        setState('complete');
        if (typeof optionsRef.current?.onComplete === 'function') {
          optionsRef.current.onComplete();
        }
      },
      onError: (err) => {
        setState('error');
        if (typeof optionsRef.current?.onError === 'function') {
          optionsRef.current.onError(err);
        }
      }
    });

    loaderRef.current = loader;
    setLoaderInstance(loader);

    return () => {
      loader.destroy();
      loaderRef.current = null;
      setLoaderInstance(null);
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
    loader: loaderInstance || loaderRef.current,
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
