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

## ⚛️ Future React API

```jsx
import { DinoLoader } from "dinoloader/react";

function LoadingDashboard({ isLoading, progress }) {
  return (
    <DinoLoader
      loading={isLoading}
      progress={progress}
      mode="inline"
      theme="dark"
      size="medium"
      message="Fetching dashboard metrics..."
      cactus={true}
      clouds={true}
    />
  );
}
```

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
├── vite.config.js              # Vite bundler configuration
├── README.md                   # Documentation & API reference
├── src\
│   ├── main.js                 # Playground UI controller & simulation orchestrator
│   ├── playground.css          # Developer tool styling (themeable, responsive)
│   └── dinoloader\             # Standalone component core
│       ├── index.js            # Public exports: createDinoLoader & DinoLoader class
│       ├── dinoloader.css      # Scoped component styles (.dinoloader, .dl-*)
│       ├── types.d.ts          # Complete TypeScript declarations & JSDoc
│       └── assets\
│           ├── pixelUtils.js   # Run-length encoded ASCII-to-SVG vector generator
│           ├── dino.js         # Original pixel-art dinosaur poses (run, jump, crash, win)
│           ├── obstacles.js    # Cactus variants, clouds, and seamless ground pattern
│           └── index.js        # Re-export barrel
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
