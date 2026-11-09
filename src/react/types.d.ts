import * as React from 'react';
import type {
  DinoLoaderMode,
  DinoLoaderTheme,
  DinoLoaderSize,
  DinoLoaderSpeed,
  DinoLoaderState,
  DinoLoaderOptions,
  DinoLoader as DinoLoaderInstance
} from './index.js';

export interface DinoLoaderProps {
  /**
   * Whether the loader is visible
   * @default true
   */
  loading?: boolean;

  /**
   * Progress percentage (0–100).
   * If omitted or false, runs in indeterminate scanning mode.
   */
  progress?: number | boolean;

  /**
   * Display mode: 'inline' (embeds inside container) or 'fullscreen' (fixed viewport overlay)
   * @default 'inline'
   */
  mode?: DinoLoaderMode;

  /**
   * Color theme: 'dark' (#0d1117), 'light' (#f6f8fa), or 'auto' (prefers-color-scheme)
   * @default 'dark'
   */
  theme?: DinoLoaderTheme;

  /**
   * Component size preset
   * @default 'medium'
   */
  size?: DinoLoaderSize;

  /**
   * Status or loading description text displayed beneath the progress bar
   * @default 'Loading your experience...'
   */
  message?: string;

  /**
   * Running animation speed
   * @default 'normal'
   */
  animationSpeed?: DinoLoaderSpeed;

  /**
   * Legacy alias for animationSpeed
   * @default 'normal'
   */
  speed?: DinoLoaderSpeed;

  /**
   * Show/hide numerical percentage indicator
   * @default true
   */
  showPercentage?: boolean;

  /**
   * Enable/disable cactus obstacles
   * @default true
   */
  cactus?: boolean;

  /**
   * Enable/disable background pixel clouds
   * @default true
   */
  clouds?: boolean;

  /**
   * Enable/disable automatic jump when dinosaur approaches cactus
   * @default true
   */
  autojump?: boolean;

  /**
   * Explicitly simulate reduced motion mode
   * @default false
   */
  reducedMotion?: boolean;

  /**
   * Configurable z-index for fullscreen overlay mode
   * @default null (defaults to 999999)
   */
  zIndex?: number | null;

  /**
   * Custom background color override
   * @default null
   */
  background?: string | null;

  /**
   * Whether to prevent background document scrolling in fullscreen mode
   * @default true
   */
  preventScroll?: boolean;

  /**
   * Callback fired when progress reaches 100% or complete() is called
   */
  onComplete?: (() => void) | null;

  /**
   * Callback fired on error state
   */
  onError?: ((error: Error) => void) | null;

  /**
   * Optional CSS class name for container (inline mode)
   */
  className?: string;

  /**
   * Optional CSS styles for container (inline mode)
   */
  style?: React.CSSProperties;
}

export declare const DinoLoader: React.FC<DinoLoaderProps>;
export default DinoLoader;

export interface UseDinoLoaderReturn {
  loader: DinoLoaderInstance | null;
  show: (target?: HTMLElement | string | null) => void;
  hide: () => void;
  update: (value: number) => void;
  complete: (message?: string) => void;
  error: (message?: string) => void;
  setMessage: (message: string) => void;
  setTheme: (theme: DinoLoaderTheme) => void;
  reset: (initialProgress?: number) => void;
  progress: number;
  state: string;
}

export declare function useDinoLoader(initialOptions?: Partial<DinoLoaderOptions>): UseDinoLoaderReturn;
