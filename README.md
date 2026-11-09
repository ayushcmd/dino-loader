# 🦖 DinoLoader

> A lightweight, customizable retro pixel-art dinosaur loading component with **zero runtime dependencies**.

Inspired by classic 8-bit endless runners, DinoLoader transforms boring loading states into a delightful, nostalgic micro-experience. Featuring original SVG pixel-art sprites, smooth CSS keyframe physics, and support for both indeterminate and determinate progress.

![DinoLoader Preview](https://img.shields.io/badge/bundle_size-%3C_3.8_KB_gzip-success?style=flat-square)
![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=flat-square)
![Graphics](https://img.shields.io/badge/graphics-100%25_crisp_SVG-blueviolet?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)

---

## ✨ Features

- **👾 Original Pixel-Art Assets**: Handcrafted 24×24 pixel-art dinosaur with animated running strides, jumping arc, crash/dazed state, and victory celebration.
- **🌵 Moving Environment**: Parallax pixel clouds, moving cactus obstacles, and infinite seamless cracked ground.
- **⚡ Zero Runtime Dependencies**: Pure Vanilla JavaScript and hardware-accelerated CSS keyframes.
- **🎨 Dark, Light & Auto Themes**: Authentic dark charcoal (`#0d1117`) default, crisp light mode, and automatic system detection (`prefers-color-scheme`).
- **📏 Flexible Sizing & Modes**: `small`, `medium`, and `large` presets; `inline` (embeddable widget) and `fullscreen` (modal overlay) display modes.
- **📊 Determinate & Indeterminate**: Live numerical progress bar or classic retro scanning block.
- **♿ Accessible**: Full `prefers-reduced-motion` compliance and ARIA progressbar attributes (`aria-valuenow`, `aria-live`).
- **📦 Dual Distribution**: Built with future npm distribution in mind (`createDinoLoader` for Vanilla JS and planned `<DinoLoader />` for React).

---

## 🚀 Quick Start (Running the Playground)

### Prerequisites

- [Node.js](https://nodejs.org/) v18+ (verified on v24)
- npm v9+

### 1. Clone & Install

```bash
cd C:\Projects\npm\DinoLoader
npm install
```

### 2. Start Local Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Build for Production

```bash
npm run build
```

Production output will be generated in `dist/`.

---

## 📖 Vanilla JavaScript API

### Installation (Future NPM Package)

```bash
npm install dinoloader
```

### Basic Usage

```javascript
import { createDinoLoader } from "dinoloader";
import "dinoloader/style.css";

// 1. Initialize component
const loader = createDinoLoader({
  container: "#my-container", // or document.body
  mode: "inline",             // 'inline' | 'fullscreen'
  theme: "dark",              // 'dark' | 'light' | 'auto'
  progress: true,             // true (determinate) | false (indeterminate)
  message: "Loading your experience..."
});

// 2. Mount & show
loader.show();

// 3. Update determinate progress (0–100%)
loader.update(45, "Excavating fossil dependencies...");

// 4. Mark completed (triggers celebration animation)
loader.complete("All assets loaded!");

// Or trigger error (trips the dinosaur with alert banner)
// loader.error("Failed to connect to prehistoric database");
```

---

## ⚛️ React Integration

DinoLoader provides a first-class React adapter under `dinoloader/react`, compatible with both **React 18** and **React 19**.

React is configured as an optional peer dependency (`react >= 18.0.0`, `react-dom >= 18.0.0`), meaning it introduces zero bloat into the core Vanilla JS package.

### Installation

```bash
npm install dinoloader
```

Import the CSS once in your application entry file (e.g. `main.jsx` or `App.jsx`):

```javascript
import "dinoloader/style.css";
```

### 1. Declarative `<DinoLoader />` Component

Embed directly inside your JSX tree:

```jsx
import React, { useState, useEffect } from "react";
import { DinoLoader } from "dinoloader/react";

export function DashboardLoader() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => (prev < 100 ? prev + 10 : 100));
    }, 400);
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{ maxWidth: 640, margin: "40px auto" }}>
      <DinoLoader
        loading={progress < 100}
        progress={progress}
        mode="inline"
        theme="dark"
        size="medium"
        message={progress < 100 ? "Fetching dinosaur telemetry..." : "Telemetry synchronized!"}
        animationSpeed="normal"
        showPercentage={true}
        onComplete={() => console.log("Loading completed!")}
      />
    </div>
  );
}
```

### 2. Fullscreen Page-Blocking Overlay

When `mode="fullscreen"`, `<DinoLoader />` mounts directly into `document.body`, locks scrolling safely across multiple instances, and cleans up automatically on unmount:

```jsx
import React from "react";
import { DinoLoader } from "dinoloader/react";

export function FullscreenBlockingLoader({ isAuthenticating }) {
  return (
    <DinoLoader
      loading={isAuthenticating}
      mode="fullscreen"
      theme="dark"
      message="Securing your session..."
      preventScroll={true}
      zIndex={999999}
    />
  );
}
```

### 3. Programmatic Control with `useDinoLoader` Hook

For imperative control from button clicks or asynchronous workflows:

```jsx
import React from "react";
import { useDinoLoader } from "dinoloader/react";

export function ExportWorkflow() {
  const { show, hide, update, complete, error, progress, state } = useDinoLoader({
    mode: "fullscreen",
    theme: "dark"
  });

  const handleExport = async () => {
    show();
    update(25);
    await new Promise((r) => setTimeout(r, 800));

    update(75);
    await new Promise((r) => setTimeout(r, 800));

    complete("Export package ready!");
    setTimeout(hide, 1200);
  };

  return (
    <div>
      <button onClick={handleExport}>Export Data</button>
      <p>State: {state} ({progress}%)</p>
    </div>
  );
}
```

### 📋 React Component Props Reference

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `loading` | `boolean` | `true` | Controls whether the loader is visible. Pauses animations when `false`. |
| `progress` | `number \| boolean` | `undefined` | Progress (0–100). If omitted or `false`, runs in indeterminate scan mode. |
| `mode` | `'inline' \| 'fullscreen'` | `'inline'` | `'inline'` embeds in parent; `'fullscreen'` covers the viewport. |
| `theme` | `'dark' \| 'light' \| 'auto'` | `'dark'` | Color scheme (`'dark'` #0d1117, `'light'` #f6f8fa, or system auto). |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | Dinosaur scale preset (small 48px, medium 66px, large 84px). |
| `message` | `string` | `'Loading your experience...'` | Description text beneath the progress bar. |
| `animationSpeed`| `'slow' \| 'normal' \| 'fast'` | `'normal'` | Animation step and translation speed (alias: `speed`). |
| `showPercentage`| `boolean` | `true` | Toggle display of numerical `XX%` label. |
| `cactus` | `boolean` | `true` | Enable or disable moving cactus obstacles. |
| `clouds` | `boolean` | `true` | Enable or disable background floating pixel clouds. |
| `autojump` | `boolean` | `true` | Automatically hops over approaching cactus obstacles. |
| `reducedMotion`| `boolean` | `false` | Explicitly enforce reduced-motion mode. |
| `zIndex` | `number \| null` | `null` | Custom z-index for fullscreen overlay mode. |
| `background` | `string \| null` | `null` | Custom CSS background override for the canvas stage. |
| `preventScroll`| `boolean` | `true` | Safely locks `document.body` scrolling in fullscreen mode. |
| `className` | `string` | `''` | Custom CSS class for the inline wrapper container. |
| `style` | `React.CSSProperties` | `{}` | Inline CSS styles for the inline wrapper container. |
| `onComplete` | `() => void` | `null` | Fired when progress reaches 100% or `complete()` is triggered. |
| `onError` | `(error: Error) => void` | `null` | Fired when an error state occurs. |

---

## ⚙️ Configuration Options

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `mode` | `'inline' \| 'fullscreen'` | `'inline'` | Embed as a card or display as a fixed full-screen overlay |
| `theme` | `'dark' \| 'light' \| 'auto'` | `'dark'` | Color scheme (charcoal `#0d1117`, light `#f6f8fa`, or auto) |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | Dino size: 48px, 66px, or 84px |
| `animationSpeed` | `'slow' \| 'normal' \| 'fast'` | `'normal'` | Animation step and translation speed (alias: `speed`) |
| `progress` | `boolean` | `true` | `true` for determinate bar; `false` for indeterminate scan |
| `initialProgress`| `number` | `0` | Initial percentage (0–100) |
| `message` | `string` | `'Loading your experience...'` | Status message displayed beneath the progress bar |
| `showPercentage` | `boolean` | `true` | Show or hide numerical `XX%` label |
| `cactus` | `boolean` | `true` | Enable or disable moving cactus obstacles |
| `clouds` | `boolean` | `true` | Enable or disable drifting pixel clouds |
| `autojump` | `boolean` | `true` | Synchronizes dinosaur jump when cactus arrives |
| `reducedMotion` | `boolean` | `false` | Explicitly simulate reduced-motion behavior |
| `container` | `HTMLElement \| string \| null` | `null` | Target mounting element (defaults to `document.body`) |
| `zIndex` | `number \| null` | `null` | Custom z-index for fullscreen mode (defaults to 999999) |
| `background` | `string \| null` | `null` | Custom background override (e.g. `'#111'`) |
| `preventScroll` | `boolean` | `true` | Prevents document body scrolling while in fullscreen mode |
| `onComplete` | `Function \| null` | `null` | Lifecycle hook called upon completion |
| `onError` | `Function \| null` | `null` | Lifecycle hook called upon error trigger |
| `onProgress` | `Function \| null` | `null` | Lifecycle hook called on each progress update |

---

## 🛠 Methods

- `loader.show(target?)` — Mounts and displays the loader; unpauses animations; locks scroll if fullscreen.
- `loader.hide()` — Hides the loader from view; pauses animations to eliminate background resource usage; unlocks scroll.
- `loader.update(value)` — Sanitizes and applies new determinate progress (0–100).
- `loader.complete(message?)` — Sets progress to 100% and triggers the victory cheer state.
- `loader.error(message?)` — Halts movement and displays the dizzy crash frame with error message.
- `loader.setMessage(message)` — Dynamically updates the loading status text.
- `loader.setTheme(theme)` — Dynamically switches the theme (`'dark'`, `'light'`, `'auto'`).
- `loader.setOptions(options)` — Dynamically updates component options without re-mounting.
- `loader.reset(initialProgress?)` — Resets loader back to running state.
- `loader.getElement()` — Returns the underlying root DOM element.
- `loader.getProgress()` — Returns current progress percentage (0–100).
- `loader.getState()` — Returns current state (`'running'`, `'idle'`, `'complete'`, `'error'`).
- `loader.getTheme()` — Returns current theme.
- `loader.getMode()` — Returns current display mode (`'inline'`, `'fullscreen'`).
- `loader.destroy()` — Completely removes DOM elements, event listeners, and restores body scroll. Safe and idempotent.

---

## 📁 Project Architecture

```
C:\Projects\npm\DinoLoader\
├── index.html                  # Developer playground entry page
├── package.json                # Project configuration & npm scripts
├── vite.config.js              # Vite multi-entry library bundler configuration
├── README.md                   # Documentation & API reference
├── src\
│   ├── main.js                 # Playground UI controller & simulation orchestrator
│   ├── playground.css          # Developer tool styling (themeable, responsive)
│   ├── dinoloader\             # Standalone Vanilla JS engine (zero dependencies)
│   │   ├── index.js            # Public exports: createDinoLoader & DinoLoader class
│   │   ├── dinoloader.css      # Scoped component styles (.dinoloader, .dl-*)
│   │   ├── types.d.ts          # Core TypeScript declarations & JSDoc
│   │   ├── core\               # DinoLoader orchestrator & lifecycle
│   │   ├── dom\                # DOM tree renderer & state binding
│   │   ├── progress\           # Determinate & indeterminate progress engine
│   │   ├── animation\          # CSS animation controller & autojump detector
│   │   ├── theme\              # Theme manager & multi-instance scroll-lock
│   │   └── assets\             # Original vector pixel-art sprites (SVG)
│   └── react\                  # React Adapter (compatible with React 18 & 19)
│       ├── index.js            # React entry point: DinoLoader & useDinoLoader
│       ├── DinoLoader.jsx      # Declarative <DinoLoader /> component
│       ├── useDinoLoader.js    # Programmatic hook
│       └── types.d.ts          # React TypeScript definitions
├── test\
│   ├── dinoloader.test.js      # Unit and lifecycle tests for core engine
│   ├── dist.test.js            # ESM & CJS distribution verification
│   └── react.test.js           # React 18 & 19 mount, prop updates, and StrictMode tests
```

---

## 🎨 Asset Design Philosophy

All pixel art in DinoLoader is 100% original and generated as crisp SVG vector paths using integer grids (`shape-rendering="crispEdges"`). Unlike raster images or canvas bitmaps, these vector sprites:

1. Never blur or distort on high-DPI (Retina) displays.
2. Inherit color dynamically via `fill="currentColor"`.
3. Add virtually zero network payload (entire sprite suite is under 2.5 KB uncompressed).

---

## 📄 License

MIT © [DinoLoader Contributors](https://github.com/dinoloader/dinoloader)
