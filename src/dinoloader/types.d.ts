export type DinoLoaderMode = 'inline' | 'fullscreen';
export type DinoLoaderTheme = 'dark' | 'light' | 'auto';
export type DinoLoaderSize = 'small' | 'medium' | 'large';
export type DinoLoaderSpeed = 'slow' | 'normal' | 'fast';
export type DinoLoaderState = 'running' | 'idle' | 'complete' | 'error';

export interface DinoLoaderOptions {
  /**
   * Display mode: 'inline' (embed inside container) or 'fullscreen' (fixed viewport overlay)
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
   * Whether to show determinate progress bar (true) or indeterminate scanning block (false)
   * @default true
   */
  progress?: boolean;

  /**
   * Initial progress percentage (0 - 100)
   * @default 0
   */
  initialProgress?: number;

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
   * Target container element or CSS selector string for inline mode
   * @default null (defaults to document.body)
   */
  container?: HTMLElement | string | null;

  /**
   * Configurable z-index for fullscreen overlay mode
   * @default null (defaults to 999999)
   */
  zIndex?: number | null;

  /**
   * Custom background color override (e.g. '#121212' or 'rgba(0,0,0,0.8)')
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
   * Callback fired when error() is called
   */
  onError?: ((error: Error) => void) | null;

  /**
   * Callback fired on each progress update
   */
  onProgress?: ((progress: number) => void) | null;
}

export declare class DinoLoader {
  constructor(options?: DinoLoaderOptions);

  /**
   * Mounts and displays the loader
   */
  show(target?: HTMLElement | string | null): DinoLoader;

  /**
   * Hides the loader and pauses animations to eliminate background CPU/GPU usage
   */
  hide(): DinoLoader;

  /**
   * Updates actual determinate progress percentage (0-100)
   */
  update(value: number): DinoLoader;

  /**
   * Triggers the completed state with victory animation
   */
  complete(message?: string): DinoLoader;

  /**
   * Triggers the error state with tripped dinosaur and alert message
   */
  error(message?: string): DinoLoader;

  /**
   * Updates the loading message text dynamically
   */
  setMessage(message: string): DinoLoader;

  /**
   * Updates the color theme dynamically
   */
  setTheme(theme: DinoLoaderTheme): DinoLoader;

  /**
   * Updates component configuration options dynamically
   */
  setOptions(options: Partial<DinoLoaderOptions>): DinoLoader;

  /**
   * Resets loader back to running state and initial progress
   */
  reset(initialProgress?: number): DinoLoader;

  /**
   * Returns root DOM element
   */
  getElement(): HTMLElement | null;

  /**
   * Returns current progress percentage (0-100)
   */
  getProgress(): number;

  /**
   * Returns current component state ('running' | 'idle' | 'complete' | 'error')
   */
  getState(): DinoLoaderState;

  /**
   * Returns current theme ('dark' | 'light' | 'auto')
   */
  getTheme(): DinoLoaderTheme;

  /**
   * Returns current mode ('inline' | 'fullscreen')
   */
  getMode(): DinoLoaderMode;

  /**
   * Completely destroys instance, removing event listeners, DOM, and restored body styles
   */
  destroy(): void;
}

/**
 * Creates and returns a new DinoLoader instance
 */
export declare function createDinoLoader(options?: DinoLoaderOptions): DinoLoader;
