import { createDinoLoader } from './dinoloader/index.js';

// DOM Elements
const mountEl = document.getElementById('dino-loader-mount');
const simBanner = document.getElementById('sim-status-banner');
const simStatusText = document.getElementById('sim-status-text');
const btnCancelSim = document.getElementById('btn-cancel-simulation');
const codeSnippetOutput = document.getElementById('code-snippet-output');
const toastEl = document.getElementById('pg-toast');

// Current state
let currentMode = 'inline';
let currentTheme = 'dark';
let currentSize = 'medium';
let currentSpeed = 'normal';
let isProgressDeterminate = true;
let currentProgress = 35;
let currentMessage = 'Loading your experience...';
let showPercentage = true;
let enableCactus = true;
let enableClouds = true;
let enableAutoJump = true;
let isReducedMotion = false;
let currentCodeTab = 'vanilla'; // 'vanilla' | 'react'

// Simulation Timer reference
let simTimer = null;
let toastTimer = null;

// Instantiate the DinoLoader component
const loader = createDinoLoader({
  container: mountEl,
  mode: currentMode,
  theme: currentTheme,
  size: currentSize,
  speed: currentSpeed,
  progress: isProgressDeterminate,
  initialProgress: currentProgress,
  message: currentMessage,
  showPercentage: showPercentage,
  cactus: enableCactus,
  clouds: enableClouds,
  autojump: enableAutoJump,
  reducedMotion: isReducedMotion,
  onComplete: () => {
    updateCodeSnippet();
    stopSimulation();
  },
  onError: () => {
    updateCodeSnippet();
    stopSimulation();
  },
  onProgress: (pct) => {
    currentProgress = Math.round(pct);
    updateSliderUI(currentProgress);
    updateCodeSnippet();
  }
});

// Mount the loader
loader.show();

// ==========================================================================
// Control Bindings
// ==========================================================================

function setupControls() {
  // 1. Display Mode Buttons (Inline vs Fullscreen)
  const modeButtons = document.querySelectorAll('#ctrl-mode button');
  modeButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      modeButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const mode = btn.dataset.val;
      setMode(mode);
    });
  });

  // Preview tab switches
  const tabInline = document.getElementById('tab-mode-inline');
  const tabSimFullscreen = document.getElementById('tab-mode-sim-fullscreen');

  tabInline.addEventListener('click', () => {
    tabInline.classList.add('active');
    tabSimFullscreen.classList.remove('active');
    setMode('inline');
    updateSegmentedUI('#ctrl-mode', 'inline');
  });

  tabSimFullscreen.addEventListener('click', () => {
    tabSimFullscreen.classList.add('active');
    tabInline.classList.remove('active');
    setMode('fullscreen');
    updateSegmentedUI('#ctrl-mode', 'fullscreen');
  });

  // Live Window Overlay button
  const btnLaunchFullscreen = document.getElementById('btn-launch-fullscreen');
  btnLaunchFullscreen.addEventListener('click', () => {
    setMode('fullscreen');
    // Remove simulated container constraint to let it fill actual window
    mountEl.classList.remove('is-simulated-fullscreen');
    loader.setOptions({ mode: 'fullscreen' });
    showToast('Press Escape or click "Exit (Esc)" to close overlay');
  });

  // 2. Theme Buttons
  const themeButtons = document.querySelectorAll('#ctrl-theme button');
  themeButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      themeButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      currentTheme = btn.dataset.val;
      document.getElementById('val-theme').textContent = currentTheme;
      loader.setOptions({ theme: currentTheme });
      updateCodeSnippet();
    });
  });

  // 3. Size Buttons
  const sizeButtons = document.querySelectorAll('#ctrl-size button');
  sizeButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      sizeButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      currentSize = btn.dataset.val;
      document.getElementById('val-size').textContent = currentSize;
      loader.setOptions({ size: currentSize });
      updateCodeSnippet();
    });
  });

  // 4. Speed Buttons
  const speedButtons = document.querySelectorAll('#ctrl-speed button');
  speedButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      speedButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      currentSpeed = btn.dataset.val;
      document.getElementById('val-speed').textContent = currentSpeed;
      loader.setOptions({ speed: currentSpeed });
      updateCodeSnippet();
    });
  });

  // 5. Progress Mode (Determinate vs Indeterminate)
  const progModeButtons = document.querySelectorAll('#ctrl-progress-mode button');
  progModeButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      progModeButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const val = btn.dataset.val;
      isProgressDeterminate = val === 'determinate';
      document.getElementById('val-progress-mode').textContent = isProgressDeterminate ? 'Determinate' : 'Indeterminate';
      
      const sliderGroup = document.getElementById('group-progress-slider');
      sliderGroup.style.opacity = isProgressDeterminate ? '1' : '0.4';
      sliderGroup.style.pointerEvents = isProgressDeterminate ? 'auto' : 'none';

      loader.setOptions({ progress: isProgressDeterminate });
      updateCodeSnippet();
    });
  });

  // 6. Progress Slider & Direct Number Input
  const sliderProgress = document.getElementById('slider-progress');
  const inputProgressNum = document.getElementById('input-progress-num');

  const onProgressInput = (value) => {
    stopSimulation();
    const val = Math.max(0, Math.min(100, Number(value) || 0));
    currentProgress = val;
    sliderProgress.value = val;
    inputProgressNum.value = val;
    document.getElementById('val-progress-pct').textContent = `${val}%`;

    loader.update(val);
    updateCodeSnippet();
  };

  sliderProgress.addEventListener('input', (e) => onProgressInput(e.target.value));
  inputProgressNum.addEventListener('input', (e) => onProgressInput(e.target.value));

  // 7. Show Percentage Toggle
  const toggleShowPercentage = document.getElementById('toggle-show-percentage');
  toggleShowPercentage.addEventListener('change', (e) => {
    showPercentage = e.target.checked;
    loader.setOptions({ showPercentage });
    updateCodeSnippet();
  });

  // 8. Cactus Toggle
  const toggleCactus = document.getElementById('toggle-cactus');
  toggleCactus.addEventListener('change', (e) => {
    enableCactus = e.target.checked;
    loader.setOptions({ cactus: enableCactus });
    updateCodeSnippet();
  });

  // 9. Clouds Toggle
  const toggleClouds = document.getElementById('toggle-clouds');
  toggleClouds.addEventListener('change', (e) => {
    enableClouds = e.target.checked;
    loader.setOptions({ clouds: enableClouds });
    updateCodeSnippet();
  });

  // 10. Auto-Jump Toggle
  const toggleAutoJump = document.getElementById('toggle-autojump');
  toggleAutoJump.addEventListener('change', (e) => {
    enableAutoJump = e.target.checked;
    loader.setOptions({ autojump: enableAutoJump });
    updateCodeSnippet();
  });

  // 11. Editable Message Input
  const inputMessage = document.getElementById('input-message');
  inputMessage.addEventListener('input', (e) => {
    currentMessage = e.target.value;
    loader.setOptions({ message: currentMessage });
    updateCodeSnippet();
  });

  // Preset Pills
  const presetPills = document.querySelectorAll('.pg-preset-pill');
  presetPills.forEach((pill) => {
    pill.addEventListener('click', () => {
      const msg = pill.dataset.msg;
      currentMessage = msg;
      inputMessage.value = msg;
      loader.setOptions({ message: msg });
      updateCodeSnippet();
    });
  });

  // Reduced Motion Accessibility toggle
  const btnReducedMotion = document.getElementById('btn-reduced-motion-toggle');
  btnReducedMotion.addEventListener('click', () => {
    isReducedMotion = !isReducedMotion;
    document.getElementById('label-motion-state').textContent = isReducedMotion ? 'Reduced' : 'Normal';
    loader.setOptions({ reducedMotion: isReducedMotion });
    showToast(isReducedMotion ? 'Simulating prefers-reduced-motion: reduce' : 'Restored normal animations');
  });

  // Playground theme toggle
  const btnThemeToggle = document.getElementById('btn-theme-toggle');
  btnThemeToggle.addEventListener('click', () => {
    const htmlEl = document.documentElement;
    const current = htmlEl.getAttribute('data-playground-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    htmlEl.setAttribute('data-playground-theme', next);

    document.getElementById('theme-icon').textContent = next === 'dark' ? '☀️' : '🌙';
    document.getElementById('theme-label').textContent = next === 'dark' ? 'Light Mode' : 'Dark Mode';
  });

  // Code tab switching
  const tabVanilla = document.getElementById('tab-code-vanilla');
  const tabReact = document.getElementById('tab-code-react');

  tabVanilla.addEventListener('click', () => {
    tabVanilla.classList.add('active');
    tabReact.classList.remove('active');
    currentCodeTab = 'vanilla';
    updateCodeSnippet();
  });

  tabReact.addEventListener('click', () => {
    tabReact.classList.add('active');
    tabVanilla.classList.remove('active');
    currentCodeTab = 'react';
    updateCodeSnippet();
  });

  // Copy code button
  const btnCopyCode = document.getElementById('btn-copy-code');
  btnCopyCode.addEventListener('click', () => {
    const code = codeSnippetOutput.innerText;
    navigator.clipboard.writeText(code).then(() => {
      showToast('Copied code to clipboard!');
    }).catch(() => {
      showToast('Failed to copy code');
    });
  });

  // Cancel simulation
  btnCancelSim.addEventListener('click', stopSimulation);
}

// ==========================================================================
// Demo Actions
// ==========================================================================

function setupDemoActions() {
  const btnStart = document.getElementById('btn-action-start');
  const btnSimulate = document.getElementById('btn-action-simulate');
  const btnComplete = document.getElementById('btn-action-complete');
  const btnError = document.getElementById('btn-action-error');
  const btnReset = document.getElementById('btn-action-reset');

  btnStart.addEventListener('click', () => {
    stopSimulation();
    loader.reset(0);
    currentProgress = 0;
    updateSliderUI(0);
    showToast('Loading started at 0%');
    updateCodeSnippet();
  });

  btnSimulate.addEventListener('click', () => {
    startSimulation();
  });

  btnComplete.addEventListener('click', () => {
    stopSimulation();
    loader.complete('All Jurassic assets loaded successfully!');
    currentProgress = 100;
    updateSliderUI(100);
    showToast('Loader completed!');
    updateCodeSnippet();
  });

  btnError.addEventListener('click', () => {
    stopSimulation();
    loader.error('Failed to connect to prehistoric database (HTTP 500)');
    showToast('Error triggered!');
    updateCodeSnippet();
  });

  btnReset.addEventListener('click', () => {
    stopSimulation();
    currentProgress = 35;
    currentMessage = 'Loading your experience...';
    document.getElementById('input-message').value = currentMessage;
    updateSliderUI(35);
    loader.reset(35);
    loader.setOptions({ message: currentMessage });
    showToast('Demo reset to initial defaults');
    updateCodeSnippet();
  });
}

// ==========================================================================
// Realistic Staged Loading Simulation
// ==========================================================================

function startSimulation() {
  stopSimulation();

  // Switch to determinate mode for simulation
  isProgressDeterminate = true;
  updateSegmentedUI('#ctrl-progress-mode', 'determinate');
  document.getElementById('val-progress-mode').textContent = 'Determinate';
  document.getElementById('group-progress-slider').style.opacity = '1';
  document.getElementById('group-progress-slider').style.pointerEvents = 'auto';

  loader.reset(0);
  currentProgress = 0;
  updateSliderUI(0);

  simBanner.classList.add('active');

  const simulationSteps = [
    { targetPct: 15, msg: 'Step 1/5: Initializing prehistoric engine...', duration: 600 },
    { targetPct: 38, msg: 'Step 2/5: Excavating fossil dependencies...', duration: 900 },
    { targetPct: 68, msg: 'Step 3/5: Synthesizing amber DNA sequences...', duration: 1100 },
    { targetPct: 88, msg: 'Step 4/5: Calibrating Jurassic obstacle physics...', duration: 800 },
    { targetPct: 100, msg: 'Step 5/5: Finalizing boot sequence...', duration: 700 }
  ];

  let stepIdx = 0;

  function runNextStep() {
    if (stepIdx >= simulationSteps.length) {
      loader.complete('All assets loaded successfully!');
      currentProgress = 100;
      updateSliderUI(100);
      stopSimulation();
      showToast('Simulation completed successfully!');
      return;
    }

    const step = simulationSteps[stepIdx];
    simStatusText.textContent = step.msg;

    const startPct = currentProgress;
    const diff = step.targetPct - startPct;
    const startTime = performance.now();

    function animateProgress(now) {
      const elapsed = now - startTime;
      const progressRatio = Math.min(1, elapsed / step.duration);
      const easedRatio = 1 - Math.pow(1 - progressRatio, 3); // ease-out cubic
      const val = Math.round(startPct + diff * easedRatio);

      currentProgress = val;
      updateSliderUI(val);
      loader.update(val, step.msg);

      if (progressRatio < 1) {
        simTimer = requestAnimationFrame(animateProgress);
      } else {
        stepIdx++;
        simTimer = setTimeout(runNextStep, 250);
      }
    }

    simTimer = requestAnimationFrame(animateProgress);
  }

  runNextStep();
}

function stopSimulation() {
  if (simTimer) {
    if (typeof simTimer === 'number') {
      cancelAnimationFrame(simTimer);
      clearTimeout(simTimer);
    }
    simTimer = null;
  }
  simBanner.classList.remove('active');
}

// ==========================================================================
// Mode Switching
// ==========================================================================

function setMode(mode) {
  currentMode = mode;
  document.getElementById('val-mode').textContent = mode;

  const tabInline = document.getElementById('tab-mode-inline');
  const tabSimFullscreen = document.getElementById('tab-mode-sim-fullscreen');

  if (mode === 'fullscreen') {
    mountEl.classList.add('is-simulated-fullscreen');
    tabSimFullscreen.classList.add('active');
    tabInline.classList.remove('active');
  } else {
    mountEl.classList.remove('is-simulated-fullscreen');
    tabInline.classList.add('active');
    tabSimFullscreen.classList.remove('active');
  }

  loader.setOptions({ mode });
  updateCodeSnippet();
}

// ==========================================================================
// UI Helpers
// ==========================================================================

function updateSliderUI(val) {
  const slider = document.getElementById('slider-progress');
  const numInput = document.getElementById('input-progress-num');
  const valText = document.getElementById('val-progress-pct');

  if (slider) slider.value = val;
  if (numInput) numInput.value = val;
  if (valText) valText.textContent = `${val}%`;
}

function updateSegmentedUI(selector, activeVal) {
  const buttons = document.querySelectorAll(`${selector} button`);
  buttons.forEach((btn) => {
    if (btn.dataset.val === activeVal) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

function showToast(message) {
  if (toastTimer) clearTimeout(toastTimer);
  toastEl.textContent = message;
  toastEl.classList.add('visible');
  toastTimer = setTimeout(() => {
    toastEl.classList.remove('visible');
  }, 2400);
}

// ==========================================================================
// Dynamic Code Snippet Generator
// ==========================================================================

function updateCodeSnippet() {
  if (currentCodeTab === 'vanilla') {
    codeSnippetOutput.innerHTML = generateVanillaSnippet();
  } else {
    codeSnippetOutput.innerHTML = generateReactSnippet();
  }
}

function generateVanillaSnippet() {
  const optionsObj = [];
  if (currentMode !== 'inline') optionsObj.push(`  <span class="token-prop">mode</span>: <span class="token-str">"${currentMode}"</span>`);
  if (currentTheme !== 'dark') optionsObj.push(`  <span class="token-prop">theme</span>: <span class="token-str">"${currentTheme}"</span>`);
  if (currentSize !== 'medium') optionsObj.push(`  <span class="token-prop">size</span>: <span class="token-str">"${currentSize}"</span>`);
  if (currentSpeed !== 'normal') optionsObj.push(`  <span class="token-prop">speed</span>: <span class="token-str">"${currentSpeed}"</span>`);
  if (!isProgressDeterminate) optionsObj.push(`  <span class="token-prop">progress</span>: <span class="token-kw">false</span> <span class="token-comment">// indeterminate</span>`);
  if (!showPercentage) optionsObj.push(`  <span class="token-prop">showPercentage</span>: <span class="token-kw">false</span>`);
  if (!enableCactus) optionsObj.push(`  <span class="token-prop">cactus</span>: <span class="token-kw">false</span>`);
  if (!enableClouds) optionsObj.push(`  <span class="token-prop">clouds</span>: <span class="token-kw">false</span>`);
  if (currentMessage !== 'Loading your experience...') {
    optionsObj.push(`  <span class="token-prop">message</span>: <span class="token-str">"${escapeHtml(currentMessage)}"</span>`);
  }

  const optionsStr = optionsObj.length > 0 ? `{\n${optionsObj.join(',\n')}\n}` : '{}';

  return `
<span class="token-kw">import</span> { <span class="token-fn">createDinoLoader</span> } <span class="token-kw">from</span> <span class="token-str">"dinoloader"</span>;
<span class="token-kw">import</span> <span class="token-str">"dinoloader/style.css"</span>;

<span class="token-comment">// 1. Initialize component</span>
<span class="token-kw">const</span> loader = <span class="token-fn">createDinoLoader</span>(${optionsStr});

<span class="token-comment">// 2. Display loader</span>
loader.<span class="token-fn">show</span>();

<span class="token-comment">// 3. Update real progress</span>
loader.<span class="token-fn">update</span>(<span class="token-num">${currentProgress}</span>);

<span class="token-comment">// 4. Complete or error when ready</span>
<span class="token-comment">// loader.complete("Finished loading!");</span>
<span class="token-comment">// loader.error("Something went wrong");</span>
`.trim();
}

function generateReactSnippet() {
  const props = [];
  props.push(`  <span class="token-prop">loading</span>={<span class="token-kw">true</span>}`);
  if (isProgressDeterminate) {
    props.push(`  <span class="token-prop">progress</span>={<span class="token-num">${currentProgress}</span>}`);
  } else {
    props.push(`  <span class="token-prop">indeterminate</span>={<span class="token-kw">true</span>}`);
  }
  if (currentMode !== 'inline') props.push(`  <span class="token-prop">mode</span>=<span class="token-str">"${currentMode}"</span>`);
  if (currentTheme !== 'dark') props.push(`  <span class="token-prop">theme</span>=<span class="token-str">"${currentTheme}"</span>`);
  if (currentSize !== 'medium') props.push(`  <span class="token-prop">size</span>=<span class="token-str">"${currentSize}"</span>`);
  if (currentSpeed !== 'normal') props.push(`  <span class="token-prop">speed</span>=<span class="token-str">"${currentSpeed}"</span>`);
  if (!showPercentage) props.push(`  <span class="token-prop">showPercentage</span>={<span class="token-kw">false</span>}`);
  if (!enableCactus) props.push(`  <span class="token-prop">cactus</span>={<span class="token-kw">false</span>}`);
  if (!enableClouds) props.push(`  <span class="token-prop">clouds</span>={<span class="token-kw">false</span>}`);
  if (currentMessage !== 'Loading your experience...') {
    props.push(`  <span class="token-prop">message</span>=<span class="token-str">"${escapeHtml(currentMessage)}"</span>`);
  }

  return `
<span class="token-kw">import</span> { <span class="token-fn">DinoLoader</span> } <span class="token-kw">from</span> <span class="token-str">"dinoloader/react"</span>;

<span class="token-kw">export default function</span> <span class="token-fn">LoadingScreen</span>() {
  <span class="token-kw">return</span> (
    &lt;<span class="token-fn">DinoLoader</span>
${props.join('\n')}
    /&gt;
  );
}
`.trim();
}

function escapeHtml(str) {
  return str.replace(/"/g, '\\"');
}

// Initialize on load
setupControls();
setupDemoActions();
updateCodeSnippet();
