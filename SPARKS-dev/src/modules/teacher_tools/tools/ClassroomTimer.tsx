import React, { useState, useEffect, useRef } from 'react';
import './ClassroomTimer.css';

type Theme = 'bar' | 'water-drip' | 'flower' | 'marbles' | 'shark' | 'pug' | 'extreme';

const TIMER_THEME_KEY = 'donTimerTheme';
const SIDE_BY_SIDE_THEMES: Theme[] = ['water-drip', 'flower', 'marbles', 'pug'];

const EXTREME_THEMES = [
  { name: 'Space',     icons: ['🚀', '⭐', '🌙', '🪐', '🌌', '🛸', '☄️'] },
  { name: 'Fast Food', icons: ['🍕', '🍔', '🌮', '🍟', '🧁', '🍦', '🧇'] },
  { name: 'Wild Life', icons: ['🦁', '🐆', '🦒', '🐘', '🦊', '🐺', '🐻'] },
  { name: 'Magic',     icons: ['🔮', '🪄', '✨', '💫', '🌟', '🎭', '🧿'] },
  { name: 'Weather',   icons: ['⛈️', '🌪️', '🌊', '🌈', '❄️', '🌬️', '⚡'] },
  { name: 'Tech',      icons: ['💻', '🤖', '🎮', '📱', '💾', '📡', '🔌'] },
  { name: 'Party',     icons: ['🎉', '🎊', '🎈', '🎁', '🥳', '🎆', '🎇'] },
  { name: 'Ocean',     icons: ['🌊', '🐬', '🐙', '🦑', '🐠', '🦀', '🦈'] },
  { name: 'Sports',    icons: ['⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🏆'] },
  { name: 'Nature',    icons: ['🌲', '🌸', '🌿', '🍀', '🌺', '🌻', '🌾'] },
  { name: 'Japan',     icons: ['🗾', '🍱', '🌸', '🏯', '🎌', '🍣', '🎋'] },
  { name: 'Vegas',     icons: ['🎰', '🃏', '🎲', '💰', '💎', '🎭', '🍀'] },
];

interface ClassroomTimerProps {
  isFullscreen: boolean;
}

const ClassroomTimer: React.FC<ClassroomTimerProps> = ({ isFullscreen }) => {
  // --- React state (drives re-renders) ---
  const [displayTime, setDisplayTime] = useState('05:00');
  const [progressPct, setProgressPct] = useState(100);
  const [isRunning, setIsRunning] = useState(false);
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(TIMER_THEME_KEY) as Theme) || 'bar'
  );
  const [customInput, setCustomInput] = useState('');

  // --- Mutable refs (avoids stale closures in setInterval callbacks) ---
  const totalSecsRef = useRef(300);
  const initialSecsRef = useRef(300);
  const isRunningRef = useRef(false);
  const themeRef = useRef<Theme>(theme);
  const isFullscreenRef = useRef(isFullscreen);

  // Intervals / animation frames
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const heartIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pugAnimIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Physics engine
  const physicsRef = useRef<{ engine: any; runner: any; Matter: any } | null>(null);

  // Theme-specific data (particle bodies, food items, etc.)
  const complexRef = useRef<any>({});

  // --- DOM refs ---
  const waterDripContainerRef = useRef<HTMLDivElement>(null);
  const waterDripSceneRef = useRef<HTMLDivElement>(null);
  const flowerSceneRef = useRef<HTMLDivElement>(null);
  const flowerStemRef = useRef<HTMLDivElement>(null);
  const flowerHeadRef = useRef<HTMLDivElement>(null);
  const flowerLeaf1Ref = useRef<HTMLImageElement>(null);
  const flowerLeaf2Ref = useRef<HTMLImageElement>(null);
  const flowerPetalRefs = useRef<(HTMLImageElement | null)[]>(Array(6).fill(null));
  const marbleSceneRef = useRef<HTMLDivElement>(null);
  const marblesContainerRef = useRef<HTMLDivElement>(null);
  const swimmerRef = useRef<HTMLDivElement>(null);
  const sharkRef = useRef<HTMLDivElement>(null);
  const sharkHugRef = useRef<HTMLDivElement>(null);
  const pugDogRef = useRef<HTMLDivElement>(null);
  const pugFoodContainerRef = useRef<HTMLDivElement>(null);

  // Extreme countdown refs
  const extremeSceneRef = useRef<HTMLDivElement>(null);
  const extremeFlashRef = useRef<HTMLDivElement>(null);
  const extremeThemeIndicatorRef = useRef<HTMLDivElement>(null);
  const extremeStatusRef = useRef<HTMLDivElement>(null);
  const extremeBoomRef = useRef<HTMLDivElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const musicLoopTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep refs in sync with props/state
  useEffect(() => { themeRef.current = theme; }, [theme]);
  useEffect(() => { isFullscreenRef.current = isFullscreen; }, [isFullscreen]);

  // Load Matter.js from public folder (for water-drip and marbles themes)
  useEffect(() => {
    if ((window as any).Matter) return;
    const script = document.createElement('script');
    script.src = '/teacher_tools/js/lib/matter.min.js';
    document.head.appendChild(script);
    return () => { document.head.contains(script) && document.head.removeChild(script); };
  }, []);

  // =========================================
  // Physics engine helpers
  // =========================================

  function startPhysics(gravityY = 1) {
    if (physicsRef.current) return physicsRef.current;
    const M = (window as any).Matter;
    if (!M) return null;

    const engine = M.Engine.create({ gravity: { y: gravityY } });
    const runner = M.Runner.create();
    physicsRef.current = { engine, runner, Matter: M };

    (function renderLoop() {
      animFrameRef.current = requestAnimationFrame(renderLoop);
      if (!physicsRef.current) return;
      const bodies = M.Composite.allBodies(engine.world);
      for (const body of bodies) {
        if (body.isStatic || !body.domElement) continue;
        const { x, y } = body.position;
        body.domElement.style.transform =
          `translate(${x - body.domRadius}px, ${y - body.domRadius}px) rotate(${body.angle}rad)`;
      }
    })();

    M.Runner.run(runner, engine);
    return physicsRef.current;
  }

  function stopPhysics() {
    if (!physicsRef.current) return;
    const { engine, runner, Matter: M } = physicsRef.current;
    M.Runner.stop(runner);
    M.World.clear(engine.world);
    M.Engine.clear(engine);
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    physicsRef.current = null;
    animFrameRef.current = null;
    if (marblesContainerRef.current) marblesContainerRef.current.innerHTML = '';
    if (waterDripContainerRef.current) waterDripContainerRef.current.innerHTML = '';
  }

  // =========================================
  // Pug animation helpers
  // =========================================

  function stopPugAnim() {
    if (pugAnimIntervalRef.current) {
      clearInterval(pugAnimIntervalRef.current);
      pugAnimIntervalRef.current = null;
    }
  }

  function startPugAnim(type: string, frameCount: number, interval: number) {
    stopPugAnim();
    let frame = 1;
    pugAnimIntervalRef.current = setInterval(() => {
      const pug = pugDogRef.current;
      if (pug) pug.style.backgroundImage =
        `url('/teacher_tools/assets/pug_timer/pug-${type}/${type}-frame${frame}.png')`;
      frame = (frame % frameCount) + 1;
    }, interval);
  }

  function pugEatNextFood() {
    if (!isRunningRef.current) return;
    const { foodItems, isPugBusy, pugPos, eatenCount } = complexRef.current;
    if (isPugBusy || !foodItems || eatenCount >= foodItems.length) return;

    let closestFood: any = null;
    let minDist = Infinity;
    foodItems.forEach((f: any) => {
      if (!f.eaten) {
        const dx = f.pos.x - pugPos.x;
        const dy = f.pos.y - pugPos.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < minDist) { minDist = d; closestFood = f; }
      }
    });

    if (closestFood) {
      closestFood.eaten = true;
      complexRef.current.eatenCount++;
      startEatingSequence(closestFood, complexRef.current.timePerFoodItem);
    }
  }

  function startEatingSequence(foodData: any, duration: number) {
    complexRef.current.isPugBusy = true;
    stopPugAnim();

    const { element: foodEl, pos: foodPos, foodType } = foodData;
    const pug = pugDogRef.current;
    if (!pug) return;

    const travelMs = Math.min(800, duration * 1000 * 0.25);
    const eatingMs = duration * 1000 - travelMs;

    pug.style.transition = `left ${travelMs}ms ease-in-out, bottom ${travelMs}ms ease-in-out`;
    pug.style.left = `${foodEl.offsetLeft + foodEl.offsetWidth - 30}px`;
    pug.style.bottom =
      `calc(100% - ${foodEl.offsetTop + foodEl.offsetHeight / 2 + pug.offsetHeight / 2}px)`;
    pug.style.transform = 'none';
    complexRef.current.pugPos = { x: foodPos.x, y: foodPos.y };

    setTimeout(() => {
      if (!isRunningRef.current) {
        complexRef.current.isPugBusy = false;
        startPugAnim('idle', 2, 750);
        return;
      }
      startPugAnim('eating', 4, 125);
      const timePerBite = eatingMs / 4;
      for (let i = 0; i < 4; i++) {
        setTimeout(() => {
          if (foodEl) foodEl.style.backgroundImage =
            `url('/teacher_tools/assets/pug_timer/food-${foodType}/food${foodType}-frame${i + 2}.png')`;
        }, i * timePerBite);
      }
    }, travelMs);

    setTimeout(() => {
      complexRef.current.isPugBusy = false;
      pugEatNextFood();
    }, duration * 1000);
  }

  // =========================================
  // Theme state reset
  // =========================================

  function resetAllThemeStates() {
    if (heartIntervalRef.current) { clearInterval(heartIntervalRef.current); heartIntervalRef.current = null; }
    stopPugAnim();
    stopPhysics();

    const wdc = waterDripContainerRef.current;
    if (wdc) {
      wdc.style.width = '';
      wdc.style.height = '';
      wdc.style.transform = '';
      wdc.style.position = '';
      wdc.style.left = '';
      wdc.style.top = '';
    }

    const stem = flowerStemRef.current;
    const head = flowerHeadRef.current;
    if (stem) {
      stem.style.height = '0px';
      if (head) { head.style.transform = 'translate(-50%, 50%) scale(0)'; head.style.opacity = '0'; head.style.bottom = ''; }
      [flowerLeaf1Ref.current, flowerLeaf2Ref.current].forEach(leaf => {
        if (leaf) { leaf.style.opacity = '0'; leaf.style.transform = 'scale(0)'; }
      });
      flowerPetalRefs.current.forEach((petal, i) => {
        if (petal) { petal.style.opacity = '0'; petal.style.transform = `translate(-50%, -50%) rotate(${60 * i}deg) translateY(-9px) scale(0)`; }
      });
    }

    if (sharkRef.current) sharkRef.current.style.left = '100%';
    if (swimmerRef.current) swimmerRef.current.style.left = '10%';
    sharkRef.current?.classList.remove('hidden');
    swimmerRef.current?.classList.remove('hidden');
    sharkHugRef.current?.classList.remove('visible');

    const pug = pugDogRef.current;
    if (pug) {
      if (pugFoodContainerRef.current) pugFoodContainerRef.current.innerHTML = '';
      pug.style.left = '50%';
      pug.style.bottom = '5%';
      pug.style.transform = 'translateX(-50%)';
      pug.style.backgroundImage = `url('/teacher_tools/assets/pug_timer/pug-idle/idle-frame1.png')`;
      pug.style.transition = 'left 0.8s ease-in-out, bottom 0.8s ease-in-out';
    }

    stopExtremeMusicLoop();
    const extremeScene = extremeSceneRef.current;
    if (extremeScene) {
      extremeScene.style.backgroundColor = '';
      extremeScene.style.filter = '';
      extremeScene.style.setProperty('--extreme-shake-intensity', '0px');
      extremeScene.classList.remove('extreme-shaking');
      extremeScene.querySelectorAll('.extreme-emoji').forEach(el => el.remove());
    }
    if (extremeFlashRef.current) extremeFlashRef.current.style.opacity = '0';
    if (extremeThemeIndicatorRef.current) extremeThemeIndicatorRef.current.textContent = '';
    if (extremeStatusRef.current) {
      extremeStatusRef.current.textContent = '';
      extremeStatusRef.current.className = 'extreme-status';
    }
    if (extremeBoomRef.current) {
      extremeBoomRef.current.textContent = '';
      extremeBoomRef.current.className = 'extreme-boom';
    }

    complexRef.current = {};
  }

  // =========================================
  // Display update — called every second
  // =========================================

  function updateDisplay() {
    const total = totalSecsRef.current;
    const initial = initialSecsRef.current;
    const t = themeRef.current;

    const mins = Math.floor(total / 60);
    const secs = total % 60;
    setDisplayTime(`${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`);

    const pctLeft = initial > 0 ? (total / initial) * 100 : 0;
    const pctDone = 100 - pctLeft;

    if (t === 'bar') {
      setProgressPct(pctLeft);
    } else if (t === 'water-drip') {
      updateWaterDrip(pctDone);
    } else if (t === 'flower') {
      updateFlower(pctDone);
    } else if (t === 'marbles') {
      updateMarbles();
    } else if (t === 'shark') {
      updateShark(pctDone);
    } else if (t === 'extreme') {
      updateExtreme(pctDone);
    }
    // pug is driven by the eating chain, not the tick
  }

  function updateWaterDrip(pctDone: number) {
    const wdc = waterDripContainerRef.current;
    if (!wdc || !isRunningRef.current || !complexRef.current.particleBodies) return;

    const { totalParticles, particlesRemovedSoFar, spoutPosition } = complexRef.current;
    const shouldBeGone = Math.floor(totalParticles * (pctDone / 100));
    const numToRemove = shouldBeGone - particlesRemovedSoFar;
    if (numToRemove <= 0) return;

    complexRef.current.particleBodies.sort((a: any, b: any) => a.position.y - b.position.y);
    const { Matter: M, engine } = physicsRef.current || {};

    for (let i = 0; i < numToRemove; i++) {
      if (complexRef.current.particleBodies.length === 0) break;
      const body = complexRef.current.particleBodies.shift();
      if (!body) continue;
      if (M && engine) M.World.remove(engine.world, body);
      if (body.domElement) {
        body.domElement.style.transition = 'opacity 0.2s ease-out';
        body.domElement.style.opacity = '0';
        setTimeout(() => body.domElement?.remove(), 250);
      }
      const dripEl = document.createElement('div');
      dripEl.className = 'physics-particle water is-dripping';
      dripEl.style.width = '10px';
      dripEl.style.height = '10px';
      wdc.appendChild(dripEl);
      dripEl.style.left = `${spoutPosition.x - 5}px`;
      dripEl.style.top = `${spoutPosition.y}px`;
      setTimeout(() => dripEl.remove(), 1200);
    }
    complexRef.current.particlesRemovedSoFar += numToRemove;
  }

  function updateFlower(pctDone: number) {
    const stem = flowerStemRef.current;
    const head = flowerHeadRef.current;
    if (!stem || !head) return;

    const scene = flowerSceneRef.current;
    if (scene) {
      if (isFullscreenRef.current && window.innerWidth <= 768) {
        const container = scene.parentElement;
        if (container) {
          const scale = Math.min(1.0, container.clientHeight / 550, container.clientWidth / 350);
          scene.style.setProperty('--flower-scene-scale', String(scale));
        }
      } else {
        scene.style.setProperty('--flower-scene-scale', '1.0');
      }
    }

    const calc = (start: number, end: number) =>
      pctDone < start ? 0 : pctDone > end ? 1 : (pctDone - start) / (end - start);

    stem.style.height = `${calc(0, 60) * 350}px`;

    const l1 = flowerLeaf1Ref.current;
    const l1p = calc(10, 50);
    if (l1p > 0 && l1) { l1.style.opacity = '1'; l1.style.transform = `scale(${l1p})`; }

    const l2 = flowerLeaf2Ref.current;
    const l2p = calc(20, 60);
    if (l2p > 0 && l2) { l2.style.opacity = '1'; l2.style.transform = `scale(${l2p})`; }

    const hp = calc(55, 75);
    if (hp > 0) { head.style.opacity = '1'; head.style.transform = `translate(-50%, 50%) scale(${hp})`; }

    if (pctDone >= 70) {
      const pp = calc(70, 100);
      const step = 1 / 6;
      flowerPetalRefs.current.forEach((petal, i) => {
        if (!petal) return;
        const ps = Math.max(0, Math.min(1, (pp - i * step) / step));
        if (ps > 0) {
          petal.style.opacity = '1';
          petal.style.transform =
            `translate(-50%, -50%) rotate(${60 * i}deg) translateY(${-65 + (1 - ps) * 56}px) scale(${ps})`;
        }
      });
    }
  }

  function updateMarbles() {
    const { totalMarbles, timePerMarble, marbleBodies } = complexRef.current;
    if (!marbleBodies || timePerMarble === 0 || !physicsRef.current) return;
    const { Matter: M, engine } = physicsRef.current;
    const elapsed = initialSecsRef.current - totalSecsRef.current;
    const shouldBeGone = Math.floor(elapsed / timePerMarble);
    const toRemove = marbleBodies.length - (totalMarbles - shouldBeGone);
    for (let i = 0; i < toRemove; i++) {
      if (marbleBodies.length === 0) break;
      const body = marbleBodies.pop();
      M.World.remove(engine.world, body);
      body.domElement.classList.add('removing');
      setTimeout(() => body.domElement?.parentElement?.removeChild(body.domElement), 500);
    }
  }

  function updateShark(pctDone: number) {
    if (sharkRef.current) sharkRef.current.style.left = `${100 - 90 * (pctDone / 100)}%`;
    if (swimmerRef.current) swimmerRef.current.style.left = '10%';
  }

  // =========================================
  // Extreme Countdown theme helpers
  // =========================================

  function updateExtreme(pctDone: number) {
    const scene = extremeSceneRef.current;
    if (!scene) return;

    const hue = Math.abs((240 - (pctDone / 100) * 480) % 360);
    const lightness = 10 + (pctDone / 100) * 30;
    scene.style.backgroundColor = `hsl(${hue}, 90%, ${lightness}%)`;

    if (!isRunningRef.current) return;

    if (pctDone > 30) {
      const p = (pctDone - 30) / 70;
      scene.style.filter = `blur(${Math.pow(p, 2) * 3.5}px)`;
      scene.style.setProperty('--extreme-shake-intensity', `${Math.pow(p, 3) * 6}px`);
      scene.classList.add('extreme-shaking');
    } else {
      scene.style.filter = 'blur(0px)';
      scene.classList.remove('extreme-shaking');
      scene.style.setProperty('--extreme-shake-intensity', '0px');
    }

    if (pctDone > 65 && extremeFlashRef.current) {
      const flashEl = extremeFlashRef.current;
      flashEl.style.opacity = '1';
      setTimeout(() => { flashEl.style.opacity = '0'; }, 35);
    }

    const elapsed = initialSecsRef.current - totalSecsRef.current;
    const themeIdx = Math.floor(elapsed / 4) % EXTREME_THEMES.length;
    if (extremeThemeIndicatorRef.current) {
      extremeThemeIndicatorRef.current.textContent = `THEME: ${EXTREME_THEMES[themeIdx].name}`;
    }

    if (totalSecsRef.current <= 5 && totalSecsRef.current > 0 && extremeStatusRef.current) {
      extremeStatusRef.current.textContent = 'ALMOST THERE!!!';
      extremeStatusRef.current.classList.add('extreme-status--urgent');
    }

    spawnExtremeEmoji(Math.floor(5 + (pctDone / 100) * 15));
  }

  function spawnExtremeEmoji(count = 1) {
    const scene = extremeSceneRef.current;
    if (!scene) return;
    const elapsed = initialSecsRef.current - totalSecsRef.current;
    const themeIdx = Math.floor(elapsed / 4) % EXTREME_THEMES.length;
    const { icons } = EXTREME_THEMES[themeIdx];
    for (let i = 0; i < count; i++) {
      const emoji = document.createElement('div');
      emoji.className = 'extreme-emoji';
      emoji.textContent = icons[Math.floor(Math.random() * icons.length)];
      emoji.style.left = `${Math.random() * 85 + 5}%`;
      emoji.style.animationDelay = `${Math.random() * 0.3}s`;
      scene.appendChild(emoji);
      setTimeout(() => emoji.remove(), 3000);
    }
  }

  function initExtremeAudio() {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume();
  }

  function playExtremeBeat(freq: number, type: OscillatorType = 'sine', decay = 0.2, volume = 0.1) {
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + decay);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + decay);
    } catch { /* no-op */ }
  }

  function playExtremeVictory() {
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    const now = ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98, 2093.00].forEach((freq, i) => {
      try {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now + i * 0.12);
        gain.gain.setValueAtTime(0.06, now + i * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.12 + 1.5);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.12);
        osc.stop(now + i * 0.12 + 1.5);
      } catch { /* no-op */ }
    });
  }

  function startExtremeMusicLoop() {
    if (!isRunningRef.current || themeRef.current !== 'extreme') return;
    const progress = initialSecsRef.current > 0 ? 1 - (totalSecsRef.current / initialSecsRef.current) : 0;
    const bpm = 120 + progress * 280;
    const beatDuration = 60 / bpm;
    playExtremeBeat(40 + progress * 150, 'triangle', 0.25, 0.4);
    if (progress > 0.3) {
      setTimeout(() => {
        if (isRunningRef.current && themeRef.current === 'extreme') {
          playExtremeBeat(progress > 0.9 ? 1200 : 900, 'square', 0.04, 0.04);
        }
      }, beatDuration * 500);
    }
    musicLoopTimeoutRef.current = setTimeout(startExtremeMusicLoop, beatDuration * 1000);
  }

  function stopExtremeMusicLoop() {
    if (musicLoopTimeoutRef.current) {
      clearTimeout(musicLoopTimeoutRef.current);
      musicLoopTimeoutRef.current = null;
    }
  }

  // =========================================
  // Complex theme setup
  // =========================================

  function setupComplexTimers() {
    const t = themeRef.current;

    if (t === 'marbles') {
      const scene = marbleSceneRef.current;
      const container = marblesContainerRef.current;
      if (!scene || !container) return;
      const physics = startPhysics(1);
      if (!physics) return;
      const { engine, Matter: M } = physics;

      container.innerHTML = '';
      const numMarbles = 400;
      complexRef.current.totalMarbles = numMarbles;
      complexRef.current.marbleBodies = [];
      const initial = initialSecsRef.current;
      complexRef.current.timePerMarble = initial > 0 ? initial / numMarbles : 0;

      const cW = scene.clientWidth;
      const cH = scene.clientHeight;
      M.World.add(engine.world, [
        M.Bodies.rectangle(cW / 2, cH, cW, 20, { isStatic: true }),
        M.Bodies.rectangle(0, cH / 2, 20, cH, { isStatic: true }),
        M.Bodies.rectangle(cW, cH / 2, 20, cH, { isStatic: true }),
      ]);

      const fs = isFullscreenRef.current;
      const radius = Math.max(fs ? 18 : 8, Math.min(fs ? 24 : 18, cW * (fs ? 0.04 : 0.035)));

      for (let i = 0; i < numMarbles; i++) {
        const dom = document.createElement('div');
        dom.className = 'physics-particle marble';
        dom.style.width = `${radius * 2}px`;
        dom.style.height = `${radius * 2}px`;
        dom.style.backgroundImage = `url('/teacher_tools/assets/marbles_timer/marble${(i % 5) + 1}.png')`;
        container.appendChild(dom);
        const body = M.Bodies.circle(
          radius + Math.random() * (cW - radius * 2),
          radius + Math.random() * (cH / 2),
          radius,
          { restitution: 0.01, friction: 0.1, slop: 0.0000001 }
        );
        body.domElement = dom;
        body.domRadius = radius;
        complexRef.current.marbleBodies.push(body);
      }
      M.World.add(engine.world, complexRef.current.marbleBodies);

    } else if (t === 'water-drip') {
      const wdc = waterDripContainerRef.current;
      if (!wdc) return;
      wdc.style.opacity = '0';

      const physics = startPhysics(0.8);
      if (!physics) return;
      const { engine, Matter: M } = physics;

      wdc.innerHTML = '';
      complexRef.current.particleBodies = [];
      complexRef.current.particlesRemovedSoFar = 0;

      const cW = 300, cH = 440;
      wdc.style.width = `${cW}px`;
      wdc.style.height = `${cH}px`;

      const centerX = cW / 2;
      const jarInnerWidth = 238, jarHeight = 360, wallThickness = 30, wallAngle = 0.12;
      const floorY = cH / 2 + jarHeight / 2 - wallThickness / 2;

      complexRef.current.spoutPosition = { x: centerX, y: floorY + wallThickness / 2 - 10 };
      complexRef.current.totalParticles = 1000;

      M.World.add(engine.world, [
        M.Bodies.rectangle(centerX - jarInnerWidth / 2 - wallThickness / 2, cH / 2, wallThickness, jarHeight, { isStatic: true, angle: -wallAngle }),
        M.Bodies.rectangle(centerX + jarInnerWidth / 2 + wallThickness / 2, cH / 2, wallThickness, jarHeight, { isStatic: true, angle: wallAngle }),
        M.Bodies.rectangle(centerX, floorY, jarInnerWidth + wallThickness, wallThickness, { isStatic: true }),
      ]);

      const radius = 5;
      for (let i = 0; i < 1000; i++) {
        const dom = document.createElement('div');
        dom.className = 'physics-particle water';
        dom.style.width = `${radius * 2}px`;
        dom.style.height = `${radius * 2}px`;
        wdc.appendChild(dom);
        const body = M.Bodies.circle(
          centerX + (Math.random() - 0.5) * (jarInnerWidth * 0.9),
          (cH - jarHeight) / 2 + Math.random() * jarHeight * 0.6,
          radius,
          { restitution: 0.9, friction: 0.000001, slop: 0.000001, density: 0.000000000001 }
        );
        body.domElement = dom;
        body.domRadius = radius;
        complexRef.current.particleBodies.push(body);
      }
      M.World.add(engine.world, complexRef.current.particleBodies);

      // Position water container — grid view needs manual scaling
      // 'relative' in fullscreen so absolute drip children position within wdc, not the scene
      wdc.style.transform = '';
      wdc.style.position = 'relative';
      wdc.style.left = '';
      wdc.style.top = '';
      if (!isFullscreenRef.current) {
        wdc.style.position = 'absolute';
        wdc.style.left = '50%';
        wdc.style.top = '50%';
        wdc.style.transform = 'translate(-50%, -50%) scale(0.50)';
      }

      setTimeout(() => {
        if (wdc) { wdc.style.opacity = '1'; wdc.style.transition = 'opacity 0.3s'; }
      }, 500);

    } else if (t === 'pug') {
      const foodContainer = pugFoodContainerRef.current;
      const pug = pugDogRef.current;
      if (!foodContainer || !pug) return;

      foodContainer.innerHTML = '';
      const positions: { top: number; left: number }[] = [];
      for (let row = 0; row < 6; row++) {
        for (let col = 0; col < 10; col++) {
          if (row < 2 && col > 3 && col < 6) continue;
          positions.push({ top: 5 + row * 15, left: 5 + col * 9 });
        }
      }
      for (let i = positions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [positions[i], positions[j]] = [positions[j], positions[i]];
      }

      const initial = initialSecsRef.current;
      const numFood = Math.max(1, Math.min(positions.length, Math.floor(initial / 5)));
      complexRef.current.foodItems = [];

      for (let i = 0; i < numFood; i++) {
        const food = document.createElement('div');
        food.className = 'pug-food-item';
        food.style.top = `${positions[i].top}%`;
        food.style.left = `${positions[i].left}%`;
        const foodType = Math.floor(Math.random() * 3) + 1;
        food.style.backgroundImage =
          `url('/teacher_tools/assets/pug_timer/food-${foodType}/food${foodType}-frame1.png')`;
        foodContainer.appendChild(food);
        complexRef.current.foodItems.push({
          element: food,
          pos: { x: food.offsetLeft + food.offsetWidth / 2, y: food.offsetTop + food.offsetHeight / 2 },
          eaten: false,
          foodType,
        });
      }

      complexRef.current.timePerFoodItem = initial > 0 ? initial / numFood : 0;
      complexRef.current.eatenCount = 0;
      complexRef.current.isPugBusy = false;

      const pugRect = pug.getBoundingClientRect();
      const contRect = foodContainer.getBoundingClientRect();
      complexRef.current.pugPos = {
        x: (pugRect.left - contRect.left) + pugRect.width / 2,
        y: (pugRect.top - contRect.top) + pugRect.height / 2,
      };
      pug.style.backgroundImage = `url('/teacher_tools/assets/pug_timer/pug-idle/idle-frame1.png')`;
    }
  }

  // =========================================
  // End animation
  // =========================================

  function createHeartParticle() {
    const hug = sharkHugRef.current;
    if (!hug?.classList.contains('visible')) return;
    const heart = document.createElement('div');
    heart.className = 'heart-particle';
    heart.style.left = `${Math.random() * hug.offsetWidth}px`;
    heart.style.top = `${Math.random() * hug.offsetHeight}px`;
    hug.appendChild(heart);
    setTimeout(() => heart.remove(), 2000);
  }

  function triggerEndAnimation() {
    try { new Audio('/teacher_tools/assets/sounds/time-end.mp3').play(); } catch { /* no-op */ }
    const t = themeRef.current;

    if (t === 'shark' && sharkRef.current && swimmerRef.current && sharkHugRef.current) {
      sharkRef.current.classList.add('hidden');
      swimmerRef.current.classList.add('hidden');
      sharkHugRef.current.classList.add('visible');
      heartIntervalRef.current = setInterval(createHeartParticle, 150);
      setTimeout(() => {
        if (heartIntervalRef.current) { clearInterval(heartIntervalRef.current); heartIntervalRef.current = null; }
      }, 4000);
    } else if (t === 'pug') {
      stopPugAnim();
      startPugAnim('happy', 2, 500);
    } else if ((t === 'marbles' || t === 'water-drip') && complexRef.current.particleBodies) {
      complexRef.current.particleBodies.forEach((body: any) => {
        if (body.domElement) { body.domElement.style.transition = 'opacity 0.2s'; body.domElement.style.opacity = '0'; }
      });
      setTimeout(() => {
        complexRef.current.particleBodies?.forEach((body: any) => body.domElement?.remove());
        if (complexRef.current.particleBodies) complexRef.current.particleBodies = [];
      }, 200);
    } else if (t === 'extreme') {
      stopExtremeMusicLoop();
      playExtremeVictory();
      const scene = extremeSceneRef.current;
      if (scene) {
        scene.classList.remove('extreme-shaking');
        scene.style.filter = 'none';
        scene.style.backgroundColor = '#ffffff';
      }
      if (extremeBoomRef.current) { extremeBoomRef.current.textContent = 'BOOM!'; extremeBoomRef.current.classList.add('visible'); }
      if (extremeStatusRef.current) {
        extremeStatusRef.current.textContent = 'LEGENDARY!';
        extremeStatusRef.current.className = 'extreme-status extreme-status--legendary';
      }
      if (extremeThemeIndicatorRef.current) extremeThemeIndicatorRef.current.textContent = '';
      for (let i = 0; i < 150; i++) setTimeout(() => spawnExtremeEmoji(1), i * 12);
      setTimeout(() => { if (extremeSceneRef.current) extremeSceneRef.current.style.backgroundColor = '#00ffcc'; }, 2500);
    }
  }

  // =========================================
  // Timer controls
  // =========================================

  function setTimerDuration(seconds: number) {
    if (isRunningRef.current) _stopTimer();
    totalSecsRef.current = Math.max(0, seconds);
    initialSecsRef.current = Math.max(0, seconds);
    resetAllThemeStates();
    setupComplexTimers();
    updateDisplay();
    if (themeRef.current === 'pug') startPugAnim('idle', 2, 750);
  }

  function startTimer() {
    if (totalSecsRef.current <= 0 || isRunningRef.current) return;
    if (totalSecsRef.current === initialSecsRef.current) {
      resetAllThemeStates();
      setupComplexTimers();
    }
    isRunningRef.current = true;
    setIsRunning(true);
    if (themeRef.current === 'pug') { startPugAnim('idle', 2, 750); setTimeout(pugEatNextFood, 100); }
    if (themeRef.current === 'extreme') {
      initExtremeAudio();
      startExtremeMusicLoop();
      if (extremeStatusRef.current) extremeStatusRef.current.textContent = 'POWER UP!';
    }
    updateDisplay();
    timerIntervalRef.current = setInterval(() => {
      if (!isRunningRef.current) return;
      totalSecsRef.current--;
      updateDisplay();
      if (totalSecsRef.current <= 0) { _stopTimer(); triggerEndAnimation(); }
    }, 1000);
  }

  function _stopTimer() {
    if (timerIntervalRef.current) { clearInterval(timerIntervalRef.current); timerIntervalRef.current = null; }
    if (heartIntervalRef.current) { clearInterval(heartIntervalRef.current); heartIntervalRef.current = null; }
    stopExtremeMusicLoop();
    isRunningRef.current = false;
    setIsRunning(false);
    if (themeRef.current === 'pug' && pugDogRef.current) {
      stopPugAnim();
      pugDogRef.current.style.backgroundImage = `url('/teacher_tools/assets/pug_timer/pug-idle/idle-frame1.png')`;
      complexRef.current.isPugBusy = false;
    }
  }

  function handleStartStop() {
    if (isRunningRef.current) _stopTimer(); else startTimer();
  }

  function handleReset() { setTimerDuration(initialSecsRef.current); }

  function handlePreset(seconds: number) {
    setCustomInput('');
    setTimerDuration(seconds);
  }

  function handleSetCustom() {
    const parts = customInput.split(':').map(p => parseInt(p, 10) || 0);
    const secs = parts.length === 2 ? parts[0] * 60 + parts[1] : parts[0] || 0;
    if (secs > 0) setTimerDuration(secs);
  }

  function handleThemeChange(newTheme: Theme) {
    const wasRunning = isRunningRef.current;
    if (wasRunning) _stopTimer();
    themeRef.current = newTheme;
    localStorage.setItem(TIMER_THEME_KEY, newTheme);
    setTheme(newTheme); // triggers useEffect below
    if (wasRunning) {
      // startTimer will be called in the theme-change effect after DOM updates
      complexRef.current._pendingStart = true;
    }
  }

  // =========================================
  // Lifecycle effects
  // =========================================

  // Mount: initial setup only
  useEffect(() => {
    const t = setTimeout(() => {
      setupComplexTimers();
      updateDisplay();
      if (themeRef.current === 'pug') startPugAnim('idle', 2, 750);
    }, 100);
    return () => {
      clearTimeout(t);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (heartIntervalRef.current) clearInterval(heartIntervalRef.current);
      stopPugAnim();
      stopPhysics();
      stopExtremeMusicLoop();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Theme change: reset and re-setup after DOM renders new theme
  const isFirstThemeRender = useRef(true);
  useEffect(() => {
    if (isFirstThemeRender.current) { isFirstThemeRender.current = false; return; }
    const t = setTimeout(() => {
      resetAllThemeStates();
      setupComplexTimers();
      updateDisplay();
      if (themeRef.current === 'pug') startPugAnim('idle', 2, 750);
      if (complexRef.current._pendingStart) {
        delete complexRef.current._pendingStart;
        startTimer();
      }
    }, 50);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme]);

  // Fullscreen change: re-init physics themes (layout size changes)
  const isFirstFullscreenRender = useRef(true);
  useEffect(() => {
    if (isFirstFullscreenRender.current) { isFirstFullscreenRender.current = false; return; }
    if (theme === 'water-drip' || theme === 'marbles') {
      if (!isRunningRef.current) {
        const t = setTimeout(() => { resetAllThemeStates(); setupComplexTimers(); updateDisplay(); }, 100);
        return () => clearTimeout(t);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFullscreen]);

  // =========================================
  // Layout classes
  // =========================================
  const isSideBySide = SIDE_BY_SIDE_THEMES.includes(theme);
  const isSharkLayout = theme === 'shark';

  const layoutClass = [
    'timer-layout-container',
    isSideBySide ? 'side-by-side-theme-active' : '',
    isSharkLayout ? 'is-shark-theme' : '',
  ].filter(Boolean).join(' ');

  // =========================================
  // Render
  // =========================================
  return (
    <div className={`classroom-timer-tool${isFullscreen ? ' fullscreen-mode' : ''}`}>
      <div className={layoutClass}>

        {/* ── Controls panel ── */}
        <div className="timer-controls-panel">
          <div className="timer-display">{displayTime}</div>

          <div className="preset-timers">
            <button className="preset-btn" onClick={() => handlePreset(60)}>1m</button>
            <button className="preset-btn" onClick={() => handlePreset(120)}>2m</button>
            <div className="custom-timer-setter">
              <input
                type="text"
                className="timer-custom-input"
                placeholder="mm:ss"
                value={customInput}
                onChange={e => setCustomInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSetCustom()}
              />
              <button onClick={handleSetCustom}>Set</button>
            </div>
          </div>

          <div className="timer-controls">
            <button onClick={handleStartStop}>{isRunning ? 'Pause' : 'Start'}</button>
            <button className="reset-btn" onClick={handleReset}>Reset</button>
            <div className="timer-theme-selector">
              <label>Theme:</label>
              <select value={theme} onChange={e => handleThemeChange(e.target.value as Theme)}>
                <option value="bar">Progress Bar</option>
                <option value="water-drip">Water Drip</option>
                <option value="flower">Growing Flower</option>
                <option value="shark">Shark Chase</option>
                <option value="marbles">Marble Jar</option>
                <option value="pug">Pug Snack Time</option>
                <option value="extreme">⚡ Extreme Countdown</option>
              </select>
            </div>
          </div>
        </div>

        {/* ── Visual container ── */}
        <div className="timer-visual-container">

          {/* Bar */}
          <div className={`timer-theme timer-theme-bar${theme === 'bar' ? ' active' : ''}`}>
            <div className="timer-progress-bar">
              <div className="timer-progress" style={{ width: `${progressPct}%` }} />
            </div>
          </div>

          {/* Water Drip */}
          <div className={`timer-theme${theme === 'water-drip' ? ' active' : ''}`}>
            <div className="water-drip-scene" ref={waterDripSceneRef}>
              <div ref={waterDripContainerRef} />
              <div className="water-jar-overlay" />
            </div>
          </div>

          {/* Growing Flower */}
          <div className={`timer-theme timer-theme-flower${theme === 'flower' ? ' active' : ''}`}>
            <div className="flower-scene" ref={flowerSceneRef}>
              <img src="/teacher_tools/assets/flower_timer/pot.png" className="flower-pot" alt="Flower Pot" />
              <div className="flower-stem" ref={flowerStemRef}>
                <img src="/teacher_tools/assets/flower_timer/leaf1.png" alt="Leaf" className="leaf leaf1" ref={flowerLeaf1Ref} />
                <img src="/teacher_tools/assets/flower_timer/leaf2.png" alt="Leaf" className="leaf leaf2" ref={flowerLeaf2Ref} />
                <div className="flower-head" ref={flowerHeadRef}>
                  <img src="/teacher_tools/assets/flower_timer/petal-center.png" className="flower-center" alt="Center" />
                  {[0, 1, 2, 3, 4, 5].map(i => (
                    <img
                      key={i}
                      src="/teacher_tools/assets/flower_timer/petal.png"
                      className={`petal p${i + 1}`}
                      alt="Petal"
                      ref={el => { flowerPetalRefs.current[i] = el; }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Marble Jar */}
          <div className={`timer-theme${theme === 'marbles' ? ' active' : ''}`}>
            <div className="marbles-scene" ref={marbleSceneRef}>
              <div ref={marblesContainerRef} className="marbles-container" />
              <div className="marbles-jar-overlay" />
            </div>
          </div>

          {/* Shark Chase */}
          <div className={`timer-theme${theme === 'shark' ? ' active' : ''}`}>
            <div className="shark-scene">
              <div className="shark-water" />
              <div ref={swimmerRef} className="shark-swimmer" />
              <div ref={sharkRef} className="shark" />
              <div ref={sharkHugRef} className="shark-hug" />
            </div>
          </div>

          {/* Pug Snack Time */}
          <div className={`timer-theme${theme === 'pug' ? ' active' : ''}`}>
            <div className="pug-scene">
              <div ref={pugDogRef} className="pug-dog" />
              <div ref={pugFoodContainerRef} className="pug-food-container" />
            </div>
          </div>

          {/* Extreme Countdown */}
          <div className={`timer-theme timer-theme-extreme${theme === 'extreme' ? ' active' : ''}`}>
            <div className="extreme-scene" ref={extremeSceneRef}>
              <div className="extreme-flash-overlay" ref={extremeFlashRef} />
              <div className="extreme-theme-indicator" ref={extremeThemeIndicatorRef} />
              <div className="extreme-status" ref={extremeStatusRef} />
              <div className="extreme-boom" ref={extremeBoomRef} />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ClassroomTimer;
