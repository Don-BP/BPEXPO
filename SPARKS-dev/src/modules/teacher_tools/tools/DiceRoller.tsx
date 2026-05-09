import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import './DiceRoller.css';

const DEFAULT_PALETTE = ['#FF6B6B','#FFD166','#06D6A0','#118AB2','#7B2D8B','#FF9A3C','#4ECDC4','#1A535C'];

function extractPalette(dataUrl: string): Promise<string[]> {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      const cv = document.createElement('canvas');
      cv.width = cv.height = 60;
      const ctx = cv.getContext('2d')!;
      ctx.drawImage(img, 0, 0, 60, 60);
      const { data } = ctx.getImageData(0, 0, 60, 60);
      const pixels: [number,number,number][] = [];
      for (let i = 0; i < data.length; i += 4) pixels.push([data[i], data[i+1], data[i+2]]);
      // k-means k=8
      let c: [number,number,number][] = Array.from({length:8}, (_,k) => [...pixels[Math.floor(k*pixels.length/8)]] as [number,number,number]);
      for (let it = 0; it < 14; it++) {
        const s: [number,number,number,number][] = Array.from({length:8}, ()=>[0,0,0,0]);
        pixels.forEach(p => {
          let b=0, bd=Infinity;
          c.forEach((ci,k)=>{ const d=(p[0]-ci[0])**2+(p[1]-ci[1])**2+(p[2]-ci[2])**2; if(d<bd){bd=d;b=k;} });
          s[b][0]+=p[0]; s[b][1]+=p[1]; s[b][2]+=p[2]; s[b][3]++;
        });
        c = s.map((s2,k)=> s2[3]>0 ? [s2[0]/s2[3],s2[1]/s2[3],s2[2]/s2[3]] : c[k]);
      }
      resolve(c.map(([r,g,b])=>`rgb(${Math.round(r)},${Math.round(g)},${Math.round(b)})`));
    };
    img.onerror = () => resolve(DEFAULT_PALETTE);
    img.src = dataUrl;
  });
}

interface DiceRollerProps {
  isFullscreen: boolean;
  onGoToScoreboard?: () => void;
}

const TABLE_IMAGE_KEY = 'donDiceTableImage';
const DICE_SCALE = 3.0;
const GRAVITY_LEVELS: Record<number, number> = { 1: -90, 2: -50, 3: -20, 4: -5 };
const FAILSAFE_MS: Record<number, number> = { 1: 2500, 2: 4000, 3: 6000, 4: 8000 };

interface DieObj { mesh: THREE.Mesh; body: CANNON.Body; values: number[]; bounceHits: number; }

function playSound(file: string) {
  new Audio(`/teacher_tools/assets/sounds/${file}`).play().catch(() => {});
}

function createFaceTexture(num: number, size: number, bgColor: string): THREE.CanvasTexture {
  const cv = document.createElement('canvas');
  cv.width = cv.height = size;
  const ctx = cv.getContext('2d')!;
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, size, size);
  ctx.font = `bold ${size * 0.68}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.strokeStyle = 'rgba(0,0,0,0.85)';
  ctx.lineWidth = size * 0.06;
  ctx.lineJoin = 'round';
  ctx.strokeText(String(num), size / 2, size / 2 + size * 0.05);
  ctx.fillStyle = 'white';
  ctx.fillText(String(num), size / 2, size / 2 + size * 0.05);
  return new THREE.CanvasTexture(cv);
}

function createDie(scene: THREE.Scene, world: CANNON.World, size = DICE_SCALE): DieObj {
  const geometry = new THREE.BoxGeometry(size, size, size);
  const hue = Math.random();
  const lightness = 0.52 + Math.random() * 0.14;
  const dieColorStyle = new THREE.Color().setHSL(hue, 1.0, lightness).getStyle();
  const values = [6, 1, 2, 5, 3, 4];
  const materials = values.map(v => {
    const mat = new THREE.MeshStandardMaterial({
      map: createFaceTexture(v, 128, dieColorStyle),
      color: 0xffffff,
      roughness: 0.25,
      metalness: 0.0,
    });
    mat.emissive.setHSL(hue, 1.0, 0.25);
    mat.emissiveIntensity = 0.35;
    return mat;
  });
  const mesh = new THREE.Mesh(geometry, materials);
  mesh.castShadow = true;
  scene.add(mesh);

  const body = new CANNON.Body({
    mass: 1,
    shape: new CANNON.Box(new CANNON.Vec3(size / 2, size / 2, size / 2)),
    allowSleep: true,
  });
  body.sleepSpeedLimit = 0.2;
  body.sleepTimeLimit = 0.5;
  world.addBody(body);

  return { mesh, body, values, bounceHits: 0 };
}

function getD6Result(die: DieObj): number {
  const up = new CANNON.Vec3(0, 1, 0);
  let maxDot = -Infinity; let topIdx = 0;
  const localAxes = [
    new CANNON.Vec3(1,0,0), new CANNON.Vec3(-1,0,0),
    new CANNON.Vec3(0,1,0), new CANNON.Vec3(0,-1,0),
    new CANNON.Vec3(0,0,1), new CANNON.Vec3(0,0,-1),
  ];
  for (let i = 0; i < localAxes.length; i++) {
    const dot = die.body.quaternion.vmult(localAxes[i]).dot(up);
    if (dot > maxDot) { maxDot = dot; topIdx = i; }
  }
  return die.values[topIdx] ?? 1;
}

const DiceRoller: React.FC<DiceRollerProps> = ({ isFullscreen: _isFullscreen, onGoToScoreboard }) => {
  const [diceCount, setDiceCount] = useState(1);
  const [gravity, setGravity] = useState(1);
  const [bounceCount, setBounceCount] = useState(1);
  const [isRolling, setIsRolling] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [resultTotal, setResultTotal] = useState(0);
  const [tableImage, setTableImage] = useState<string | null>(() => localStorage.getItem(TABLE_IMAGE_KEY));
  const [palette, setPalette] = useState<string[]>(DEFAULT_PALETTE);
  const paletteRef = useRef<string[]>(DEFAULT_PALETTE);
  const bgCanvasRef = useRef<HTMLCanvasElement>(null);
  const pixelRafRef = useRef<number>(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const worldRef = useRef<CANNON.World | null>(null);
  const floorMeshRef = useRef<THREE.Mesh | null>(null);
  const gridRef = useRef<THREE.Object3D | null>(null);
  const floorBodyRef = useRef<CANNON.Body | null>(null);
  const bounceCountRef = useRef(bounceCount);
  const dieBouncyMatRef = useRef<CANNON.Material | null>(null);
  const dieFlatMatRef = useRef<CANNON.Material | null>(null);
  const diceRef = useRef<DieObj[]>([]);
  const isRollingRef = useRef(false);
  const gravityRef = useRef(gravity);
  const rafRef = useRef(0);
  const settleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const failsafeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { gravityRef.current = gravity; }, [gravity]);
  useEffect(() => { bounceCountRef.current = bounceCount; }, [bounceCount]);
  useEffect(() => { paletteRef.current = palette; }, [palette]);

  // Load palette from saved image on mount
  useEffect(() => {
    const saved = localStorage.getItem(TABLE_IMAGE_KEY);
    if (saved) extractPalette(saved).then(pal => { setPalette(pal); paletteRef.current = pal; });
  }, []);

  // Undulating pixel gradient + pixel explosion background
  useEffect(() => {
    const canvas = bgCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    const PIXEL = 28;
    type Particle = { x: number; y: number; vx: number; vy: number; ci: number; size: number; alpha: number; decay: number; };
    let particles: Particle[] = [];
    let nextBoom = 80;
    let w = 1, h = 1;
    let startTs: number | null = null;

    const rebuild = () => {
      w = canvas.parentElement?.clientWidth || 800;
      h = canvas.parentElement?.clientHeight || 600;
      canvas.width = w;
      canvas.height = h;
    };
    const ro = new ResizeObserver(rebuild);
    if (canvas.parentElement) ro.observe(canvas.parentElement);
    rebuild();

    const spawnExplosion = (pal: string[]) => {
      const ex = w * 0.1 + Math.random() * w * 0.8;
      const ey = h * 0.1 + Math.random() * h * 0.8;
      const ci = Math.floor(Math.random() * pal.length); // uses full palette length automatically
      const count = 10 + Math.floor(Math.random() * 14);
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 2 + Math.random() * 5;
        particles.push({
          x: ex, y: ey,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          ci,
          size: 6 + Math.floor(Math.random() * 8),
          alpha: 1,
          decay: 0.016 + Math.random() * 0.020,
        });
      }
    };

    const draw = (ts: number) => {
      pixelRafRef.current = requestAnimationFrame(draw);
      if (startTs === null) startTs = ts;
      const t = (ts - startTs) / 1000;
      const pal = paletteRef.current;
      const cols = Math.ceil(w / PIXEL) + 1;
      const rows = Math.ceil(h / PIXEL) + 1;

      // Undulating pixel grid — 4 overlapping sine waves, quantized to 8 palette colors
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const nx = col / cols;
          const ny = row / rows;
          const val =
            Math.sin(nx * 5.5 + t * 0.25) * 0.38 +
            Math.cos(ny * 4.8 + t * 0.20) * 0.30 +
            Math.sin((nx + ny) * 3.5 + t * 0.12) * 0.20 +
            Math.cos((nx * 6.2 - ny * 2.8) + t * 0.30) * 0.12;
          // val ≈ -1..1 → clamp → 0..7
          const palIdx = Math.min(7, Math.max(0, Math.floor(((val + 1) / 2) * 8)));
          ctx.fillStyle = pal[palIdx];
          ctx.fillRect(col * PIXEL, row * PIXEL, PIXEL, PIXEL);
        }
      }

      // Pixel explosions on top
      if (--nextBoom <= 0) {
        spawnExplosion(pal);
        nextBoom = 60 + Math.floor(Math.random() * 80);
      }
      particles = particles.filter(p => p.alpha > 0.02);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        p.vx *= 0.93; p.vy *= 0.93;
        p.alpha -= p.decay;
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = pal[p.ci % pal.length];
        // Snap particle positions to a 4-pixel grid for pixel-art feel
        ctx.fillRect(Math.round(p.x / 4) * 4, Math.round(p.y / 4) * 4, p.size, p.size);
      });
      ctx.globalAlpha = 1;
    };

    pixelRafRef.current = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(pixelRafRef.current); ro.disconnect(); };
  }, []);

  const forceResize = useCallback(() => {
    const c = containerRef.current; const r = rendererRef.current; const cam = cameraRef.current;
    if (!c || !r || !cam) return;
    const { clientWidth: w, clientHeight: h } = c;
    if (!w || !h) return;
    cam.aspect = w / h;
    cam.updateProjectionMatrix();
    r.setSize(w, h, false);
  }, []);

  // Three.js + Cannon-es setup
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight || 1, 0.1, 100);
    camera.position.set(0, 18, 18);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.domElement.style.cssText = 'width:100%;height:100%;display:block;';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.7);
    dirLight.position.set(5, 10, 7.5);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const world = new CANNON.World({ gravity: new CANNON.Vec3(0, GRAVITY_LEVELS[1], 0) });
    worldRef.current = world;

    // Floor physics
    const floorBody = new CANNON.Body({ mass: 0, shape: new CANNON.Plane() });
    floorBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
    world.addBody(floorBody);
    floorBodyRef.current = floorBody;

    const floorMat = new CANNON.Material('floor');
    const dieBouncy = new CANNON.Material('dieBouncy');
    const dieFlat = new CANNON.Material('dieFlat');
    const wallMat = new CANNON.Material('wall');
    world.addContactMaterial(new CANNON.ContactMaterial(floorMat, dieBouncy, { restitution: 1.2, friction: 0.0 }));
    world.addContactMaterial(new CANNON.ContactMaterial(floorMat, dieFlat,   { restitution: 0,   friction: 0.7 }));
    world.addContactMaterial(new CANNON.ContactMaterial(wallMat,  dieBouncy, { restitution: 1.2, friction: 0.0 }));
    world.addContactMaterial(new CANNON.ContactMaterial(wallMat,  dieFlat,   { restitution: 1.2, friction: 0.0 }));
    floorBody.material = floorMat;
    dieBouncyMatRef.current = dieBouncy;
    dieFlatMatRef.current = dieFlat;

    // Floor mesh
    const aspect = container.clientWidth / container.clientHeight || 1;
    const depth = 20; const width = depth * aspect;
    const floorMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(depth, depth),
      new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.7 })
    );
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.receiveShadow = true;
    floorMesh.scale.x = aspect;
    scene.add(floorMesh);
    floorMeshRef.current = floorMesh;

    const grid = new THREE.GridHelper(depth, 20, 0x000000, 0x000000);
    grid.scale.x = aspect;
    (grid.material as THREE.Material).opacity = 0.2;
    (grid.material as THREE.Material).transparent = true;
    scene.add(grid);
    gridRef.current = grid;

    // Walls
    [
      { p: [0, 0, -(depth/2)] as [n,n,n], r: [0,0,0] as [n,n,n] },
      { p: [0, 0, depth/2]    as [n,n,n], r: [0, Math.PI, 0] as [n,n,n] },
      { p: [-(width/2), 0, 0] as [n,n,n], r: [0, Math.PI/2, 0] as [n,n,n] },
      { p: [width/2, 0, 0]    as [n,n,n], r: [0, -Math.PI/2, 0] as [n,n,n] },
    ].forEach(({ p, r }) => {
      const wall = new CANNON.Body({ mass: 0, shape: new CANNON.Plane(), material: wallMat });
      wall.position.set(...p);
      wall.quaternion.setFromEuler(...r);
      world.addBody(wall);
    });

    // Load saved table image
    const saved = localStorage.getItem(TABLE_IMAGE_KEY);
    if (saved) applyTexture(floorMesh, saved);

    forceResize();
    const obs = new ResizeObserver(forceResize);
    obs.observe(container);

    function loop() {
      rafRef.current = requestAnimationFrame(loop);
      world.step(1 / 60);
      diceRef.current.forEach(d => {
        d.mesh.position.set(d.body.position.x, d.body.position.y, d.body.position.z);
        d.mesh.quaternion.set(d.body.quaternion.x, d.body.quaternion.y, d.body.quaternion.z, d.body.quaternion.w);
      });
      renderer.render(scene, camera);
    }
    loop();

    return () => {
      cancelAnimationFrame(rafRef.current);
      obs.disconnect();
      renderer.dispose();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function applyTexture(mesh: THREE.Mesh, dataUrl: string) {
    new THREE.TextureLoader().load(dataUrl, tex => {
      const floorAspect = mesh.scale.x;
      const imageAspect = tex.image.width / tex.image.height;
      tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
      if (imageAspect > floorAspect) {
        const r = floorAspect / imageAspect;
        tex.repeat.set(r, 1);
        tex.offset.set((1 - r) / 2, 0);
      } else if (imageAspect < floorAspect) {
        const s = imageAspect / floorAspect;
        tex.repeat.set(1, s);
        tex.offset.set(0, (1 - s) / 2);
      } else {
        tex.repeat.set(1, 1);
        tex.offset.set(0, 0);
      }
      // MeshBasicMaterial ignores lighting — texture renders at full original color
      const old = mesh.material as THREE.Material;
      old.dispose();
      mesh.material = new THREE.MeshBasicMaterial({ map: tex });
    });
  }

  function removeTexture(mesh: THREE.Mesh) {
    const old = mesh.material as THREE.Material;
    old.dispose();
    mesh.material = new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.7 });
  }

  const showResultNow = useCallback(() => {
    if (!isRollingRef.current) return;
    isRollingRef.current = false;
    setIsRolling(false);
    if (settleTimerRef.current) clearTimeout(settleTimerRef.current);
    if (failsafeTimerRef.current) clearTimeout(failsafeTimerRef.current);
    const total = diceRef.current.reduce((s, d) => s + getD6Result(d), 0);
    setResultTotal(total);
    setShowResult(true);
    playSound('winner_reveal.mp3');
  }, []);

  const checkSettled = useCallback(() => {
    if (!isRollingRef.current) return;
    const settled = diceRef.current.length > 0 && diceRef.current.every(
      d => d.body.velocity.lengthSquared() < 0.01 && d.body.angularVelocity.lengthSquared() < 0.01
    );
    if (settled) showResultNow();
    else settleTimerRef.current = setTimeout(checkSettled, 100);
  }, [showResultNow]);

  const roll = useCallback(() => {
    if (isRollingRef.current || !sceneRef.current || !worldRef.current) return;
    isRollingRef.current = true;
    setIsRolling(true);
    setShowResult(false);

    worldRef.current.gravity.y = GRAVITY_LEVELS[gravityRef.current] ?? -90;

    diceRef.current.forEach(d => {
      sceneRef.current!.remove(d.mesh);
      worldRef.current!.removeBody(d.body);
    });
    diceRef.current = [];

    const dieSize = diceCount === 4 ? 2.4 : DICE_SCALE;
    for (let i = 0; i < diceCount; i++) {
      const die = createDie(sceneRef.current, worldRef.current, dieSize);
      die.body.position.set(Math.random() * 6 - 3, 12 + i * 4, Math.random() * 6 - 3);
      die.body.quaternion.setFromEuler(Math.random()*Math.PI*2, Math.random()*Math.PI*2, Math.random()*Math.PI*2);
      die.body.angularVelocity.set(Math.random()*20-10, Math.random()*20-10, Math.random()*20-10);
      // Assign starting material: flat if bounceCount=0, bouncy otherwise
      die.body.material = bounceCountRef.current > 0 ? dieBouncyMatRef.current! : dieFlatMatRef.current!;
      die.body.addEventListener('collide', ({ body }: any) => {
        if (body !== floorBodyRef.current) return;
        die.bounceHits++;
        if (die.bounceHits >= bounceCountRef.current) {
          die.body.material = dieFlatMatRef.current!;
        }
      });
      diceRef.current.push(die);
    }

    playSound('spin_start.mp3');
    if (settleTimerRef.current) clearTimeout(settleTimerRef.current);
    if (failsafeTimerRef.current) clearTimeout(failsafeTimerRef.current);
    checkSettled();
    failsafeTimerRef.current = setTimeout(showResultNow, FAILSAFE_MS[gravityRef.current] ?? 2500);
  }, [diceCount, checkSettled, showResultNow]);

  const handleTableImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const url = ev.target?.result as string;
      localStorage.setItem(TABLE_IMAGE_KEY, url);
      setTableImage(url);
      if (floorMeshRef.current) applyTexture(floorMeshRef.current, url);
      extractPalette(url).then(pal => { setPalette(pal); paletteRef.current = pal; });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <div className="dr-tool">
      <canvas ref={bgCanvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 0, display: 'block' }} />
      <div className="dr-controls" style={{ position: 'relative', zIndex: 1 }}>
        <div className="dr-control-group">
          <label>Dice:</label>
          <select value={diceCount} onChange={e => setDiceCount(+e.target.value)} disabled={isRolling}>
            {[1,2,3,4].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        <div className="dr-control-group">
          <label>Gravity:</label>
          <select value={gravity} onChange={e => setGravity(+e.target.value)} disabled={isRolling}>
            <option value={1}>Normal</option>
            <option value={2}>Floaty</option>
            <option value={3}>Super Floaty</option>
            <option value={4}>Moon</option>
          </select>
        </div>
        <div className="dr-control-group">
          <label>Bounce:</label>
          <select value={bounceCount} onChange={e => setBounceCount(+e.target.value)} disabled={isRolling}>
            {[0, 1, 2, 3, 4].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        <button className="tool-btn dr-roll-btn" onClick={roll} disabled={isRolling}>
          {isRolling ? 'Rolling…' : 'Roll Dice!'}
        </button>
        <button className="tool-btn dr-scoreboard-btn" title="Go to Scoreboard" onClick={onGoToScoreboard}>🏅</button>
        <div className="dr-control-group">
          <input type="file" id="dr-table-img" className="dr-hidden" accept="image/*" onChange={handleTableImage} />
          <label htmlFor="dr-table-img" className="dr-upload-label">📷 Table Image</label>
          {tableImage && (
            <button className="tool-btn dr-remove-img-btn" onClick={() => {
              localStorage.removeItem(TABLE_IMAGE_KEY);
              setTableImage(null);
              setPalette(DEFAULT_PALETTE);
              paletteRef.current = DEFAULT_PALETTE;
              if (floorMeshRef.current) removeTexture(floorMeshRef.current);
            }}>Remove Image</button>
          )}
        </div>
      </div>

      <div className="dr-canvas-container" ref={containerRef} style={{ position: 'relative', zIndex: 1 }} />

      {showResult && (
        <div className="dr-result-popup">
          <div className="dr-result-content">
            <h3>Total Roll:</h3>
            <p className="dr-result-total">{resultTotal}</p>
            <button className="tool-btn dr-result-close" onClick={() => setShowResult(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

// Type alias for tuple usage
type n = number;

export default DiceRoller;
