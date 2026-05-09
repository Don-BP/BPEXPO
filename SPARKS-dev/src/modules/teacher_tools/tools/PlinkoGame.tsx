import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import * as CANNON from 'cannon-es';

const BW = 12, BH = 18, PR = 0.15, SLOTS = 9;
const BR = 0.25;          // smaller ball
const SLOT_PTS = [1, 2, 3, 4, 5, 4, 3, 2, 1];
// 16 rows, 0.95 spacing, start close to top → pegs fill the board
const PEG_ROWS = 16, PEG_SPACING_Y = 0.95, PEG_START_Y = BH / 2 - 1.5;
const FLASH_MS = 500;

interface Props {
  onBallLanded: (pts: number) => void;
  onYellowHit?: () => void;
}

export default function PlinkoGame({ onBallLanded, onYellowHit }: Props) {
  const mountRef = useRef<HTMLDivElement>(null);
  const landCb = useRef(onBallLanded);
  const hitCb = useRef(onYellowHit);
  landCb.current = onBallLanded;
  hitCb.current = onYellowHit;
  const [dropped, setDropped] = useState(false);

  useEffect(() => {
    const el = mountRef.current!;
    let raf: number;
    let landed = false;
    let inFlight = false;

    // ── Scene ────────────────────────────────────────────────
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050505);
    const W = el.clientWidth, H = el.clientHeight;
    // lookAt(0,0,0) centers the board in view — no extra black at top/bottom
    const cam = new THREE.PerspectiveCamera(55, W / H, 0.1, 1000);
    cam.position.set(0, 0, 19);
    cam.lookAt(0, 0, 0);

    const ren = new THREE.WebGLRenderer({ antialias: true });
    ren.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    ren.setSize(W, H);
    ren.shadowMap.enabled = true;
    ren.shadowMap.type = THREE.PCFSoftShadowMap;
    el.appendChild(ren.domElement);

    // ── Physics ──────────────────────────────────────────────
    const world = new CANNON.World({ gravity: new CANNON.Vec3(0, -9.8, 0) });
    world.broadphase = new CANNON.NaiveBroadphase();
    const bMat = new CANNON.Material('b'), pMat = new CANNON.Material('p'), wMat = new CANNON.Material('w');
    world.addContactMaterial(new CANNON.ContactMaterial(bMat, pMat, { restitution: 0.75, friction: 0.02 }));
    world.addContactMaterial(new CANNON.ContactMaterial(bMat, wMat, { restitution: 0.9, friction: 0.05 }));

    // ── Lights ───────────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0xffffff, 0.15));
    const pl = new THREE.PointLight(0xffffff, 0.8, 70);
    pl.position.set(0, 5, 15); pl.castShadow = true; scene.add(pl);

    // ── Metadata maps ────────────────────────────────────────
    const pegType = new WeakMap<CANNON.Body, string>();
    const edgeWall = new WeakSet<CANNON.Body>();
    type Wall = { mesh: THREE.Mesh; body: CANNON.Body };
    const walls: Wall[] = [];

    // ── Board back ───────────────────────────────────────────
    const board = new THREE.Mesh(new THREE.BoxGeometry(BW, BH, 0.5),
      new THREE.MeshPhongMaterial({ color: 0x0a0a0a }));
    board.position.set(0, 0, -0.6); board.receiveShadow = true; scene.add(board);
    const bb = new CANNON.Body({ mass: 0, shape: new CANNON.Box(new CANNON.Vec3(BW/2, BH/2, 0.25)), material: wMat });
    bb.position.set(0, 0, -0.6); world.addBody(bb);

    // ── Side walls ───────────────────────────────────────────
    [-1, 1].forEach(s => {
      const wt = 1.0, wh = BH * 1.5, wd = 4.0;
      const wm = new THREE.Mesh(new THREE.BoxGeometry(wt, wh, wd),
        new THREE.MeshPhongMaterial({ color: 0x1a1a1a, emissive: new THREE.Color(0x1a1a1a), emissiveIntensity: 0.05 }));
      const xp = (BW / 2 + wt / 2) * s;
      wm.position.set(xp, 0, 0.4); wm.receiveShadow = true; scene.add(wm);
      const wb = new CANNON.Body({ mass: 0, shape: new CANNON.Box(new CANNON.Vec3(wt/2, wh/2, wd/2)), material: wMat });
      wb.position.set(xp, 0, 0.4);
      edgeWall.add(wb); world.addBody(wb);
      walls.push({ mesh: wm, body: wb });
    });

    // ── Pegs ─────────────────────────────────────────────────
    // Standard pegs: dark base + random emissive color (fun glow)
    // Spring (cyan) and confetti (yellow) keep type colours for visual identification
    type PegT = 'standard' | 'spring' | 'confetti';
    type Peg = { mesh: THREE.Mesh; body: CANNON.Body; initE: number; emissiveColor: THREE.Color; flashColor: THREE.Color; flashT: number };
    const pegs: Peg[] = [];
    const useW = 5.75 * 2, sX = useW / 8;

    for (let r = 0; r < PEG_ROWS; r++) {
      const even = r % 2 === 0, cols = even ? 9 : 8;
      const startX = even ? -useW/2 : -useW/2 + sX/2;
      for (let c = 0; c < cols; c++) {
        const x = startX + c * sX, y = PEG_START_Y - r * PEG_SPACING_Y;
        const rand = Math.random();
        const t: PegT = rand < 0.12 ? 'spring' : rand < 0.55 ? 'confetti' : 'standard';

        let baseColor: number;
        let emissiveColor: THREE.Color;
        let emissiveIntensity: number;

        if (t === 'spring') {
          baseColor = 0x00ffff;
          emissiveColor = new THREE.Color(0x00ffff);
          emissiveIntensity = 0.8;
        } else if (t === 'confetti') {
          baseColor = 0xffd700;
          emissiveColor = new THREE.Color(0xffd700);
          emissiveIntensity = 0.8;
        } else {
          baseColor = 0x888888;
          emissiveColor = new THREE.Color(0x222222);
          emissiveIntensity = 0.1;
        }

        const mat = new THREE.MeshPhongMaterial({
          color: baseColor, emissive: emissiveColor, emissiveIntensity, shininess: 120,
        });
        const mesh = new THREE.Mesh(new THREE.CylinderGeometry(PR, PR, 1.2, 16), mat);
        mesh.rotation.x = Math.PI / 2; mesh.position.set(x, y, 0); mesh.castShadow = true; scene.add(mesh);

        const body = new CANNON.Body({ mass: 0, shape: new CANNON.Sphere(PR), material: pMat });
        body.position.set(x, y, 0); pegType.set(body, t); world.addBody(body);
        pegs.push({ mesh, body, initE: emissiveIntensity, emissiveColor, flashColor: new THREE.Color(0), flashT: 0 });
      }
    }

    // ── Slot dividers & floor ────────────────────────────────
    const slotW = BW / SLOTS, ySlot = -BH/2 + 1;
    const slotGeo = new THREE.BoxGeometry(0.12, 3.2, 1.5);
    const slotMat = new THREE.MeshPhongMaterial({ color: 0x333333 });
    for (let i = 0; i <= SLOTS; i++) {
      const x = -BW/2 + i * slotW;
      const dm = new THREE.Mesh(slotGeo, slotMat);
      dm.position.set(x, ySlot - 0.6, 0.2); scene.add(dm);
      const db = new CANNON.Body({ mass: 0, shape: new CANNON.Box(new CANNON.Vec3(0.06, 1.6, 0.75)), material: wMat });
      db.position.set(x, ySlot - 0.6, 0.2); world.addBody(db);
    }
    const fb = new CANNON.Body({ mass: 0, shape: new CANNON.Box(new CANNON.Vec3(BW/2, 0.5, 2)), material: wMat });
    fb.position.set(0, -BH/2 - 0.5, 0); world.addBody(fb);

    // ── Slot labels as 3D sprites (perspective-correct) ──────
    const labelSprites: THREE.Sprite[] = [];
    for (let i = 0; i < SLOTS; i++) {
      const cx = -BW/2 + (i + 0.5) * slotW;
      const canvas = document.createElement('canvas');
      canvas.width = 128; canvas.height = 128;
      const ctx = canvas.getContext('2d')!;
      ctx.font = 'bold 80px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = 'rgba(255,204,0,0.9)';
      ctx.shadowBlur = 18;
      ctx.fillStyle = '#ffcc00';
      ctx.fillText(String(SLOT_PTS[i]), 64, 64);
      const tex = new THREE.CanvasTexture(canvas);
      const spr = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false }));
      spr.position.set(cx, -BH/2 + 1.7, 1.6);
      spr.scale.set(1.0, 1.0, 1);
      scene.add(spr);
      labelSprites.push(spr);
    }

    // ── Particles ────────────────────────────────────────────
    type Part = { mesh: THREE.Mesh; vel: THREE.Vector3; life: number; initLife?: number; trail?: true; conf?: true; rv?: THREE.Vector3 };
    const parts: Part[] = [];
    const trailGeo = new THREE.SphereGeometry(BR * 0.7, 8, 8);
    const confGeo = new THREE.PlaneGeometry(0.2, 0.2);
    const CCOLS = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff];

    // Flash lights: PointLights spawned on peg hit, faded per-frame
    type FlashLight = { light: THREE.PointLight; life: number };
    const flashLights: FlashLight[] = [];

    // Pulse a peg on hit — random neon PointLight + emissive flash, both fade out
    const pulsePeg = (pb: CANNON.Body) => {
      const p = pegs.find(x => x.body === pb); if (!p) return;
      p.flashColor.setHSL(Math.random(), 1.0, 0.6);
      p.flashT = 1.0;
      p.mesh.scale.set(1.5, 1.5, 1.5);
      const mat = p.mesh.material as THREE.MeshPhongMaterial;
      mat.emissive.copy(p.flashColor);
      mat.emissiveIntensity = 5.0;
      // Spawn a point light so surrounding pegs + ball are actually illuminated
      const fl = new THREE.PointLight(p.flashColor, 12, 5);
      fl.position.set(p.mesh.position.x, p.mesh.position.y, 1.5);
      scene.add(fl);
      flashLights.push({ light: fl, life: 1.0 });
    };

    const spawnConfetti = (pos: CANNON.Vec3) => {
      for (let i = 0; i < 50; i++) {
        const m = new THREE.MeshBasicMaterial({ color: CCOLS[i % CCOLS.length], side: THREE.DoubleSide, transparent: true });
        const mesh = new THREE.Mesh(confGeo, m);
        mesh.position.set(pos.x, pos.y, 0.5);
        mesh.rotation.set(Math.random()*Math.PI, Math.random()*Math.PI, Math.random()*Math.PI);
        const vel = new THREE.Vector3((Math.random()-.5)*.35, Math.random()*.4+.2, (Math.random()-.5)*.25);
        parts.push({ mesh, vel, life: 2+Math.random(), conf: true,
          rv: new THREE.Vector3(Math.random()*.3, Math.random()*.3, Math.random()*.3) });
        scene.add(mesh);
      }
    };

    // ── Ball ─────────────────────────────────────────────────
    type Ball = { mesh: THREE.Mesh; body: CANNON.Body; dead: boolean; t0: number; lx: number; ly: number; col: THREE.Color };
    const balls: Ball[] = [];
    const slotIdx = (x: number) => Math.min(SLOTS-1, Math.max(0, Math.floor((x + BW/2) / slotW)));
    const killBall = (b: Ball) => { b.dead = true; scene.remove(b.mesh); world.removeBody(b.body); };
    const report = (x: number) => { if (!landed) { landed = true; landCb.current(SLOT_PTS[slotIdx(x)]); } };

    const spawnBall = (x: number) => {
      if (inFlight || landed) return;
      inFlight = true;
      setDropped(true);
      const cx = Math.max(-BW/2 + BR + 0.1, Math.min(BW/2 - BR - 0.1, x));
      const hue = Math.random();
      const col = new THREE.Color().setHSL(hue, 1, 0.5);
      const emCol = new THREE.Color().setHSL(hue, 1, 0.6);
      const mesh = new THREE.Mesh(new THREE.SphereGeometry(BR, 20, 20),
        new THREE.MeshStandardMaterial({ color: col, metalness: 0.1, roughness: 0.1, emissive: emCol, emissiveIntensity: 5.0 }));
      mesh.castShadow = true; scene.add(mesh);
      mesh.add(new THREE.PointLight(emCol, 3.0, 6));
      const body = new CANNON.Body({ mass: 1.5, shape: new CANNON.Sphere(BR), material: bMat, linearDamping: 0.1 });
      body.position.set(cx, BH/2 + 0.5, 0);
      body.velocity.set((Math.random() - 0.5) * 0.4, -1.5, 0);
      world.addBody(body);
      const ball: Ball = { mesh, body, dead: false, t0: Date.now(), lx: cx, ly: BH/2 - 0.5, col: emCol };

      body.addEventListener('collide', (ev: any) => {
        if (ball.dead) return;
        const other = ev.body as CANNON.Body;
        const t = pegType.get(other);
        if (t) {
          pulsePeg(other);
          // direction away from peg for bounce boost
          const dx = body.position.x - other.position.x, dy = body.position.y - other.position.y;
          const len = Math.sqrt(dx*dx + dy*dy) || 1;
          if (t === 'spring') {
            // strong bounce
            body.velocity.x += (dx/len) * 18; body.velocity.y += (dy/len) * 18;
          } else if (t === 'confetti') {
            // medium bounce + confetti + bonus counter
            body.velocity.x += (dx/len) * 3.5; body.velocity.y += (dy/len) * 3.5;
            spawnConfetti(other.position);
            hitCb.current?.();
          } else {
            // standard: slight extra bounce so ball feels lively
            body.velocity.x += (dx/len) * 2.5; body.velocity.y += (dy/len) * 2.5;
          }
        } else if (edgeWall.has(other)) {
          const w = walls.find(w => w.body === other);
          if (w) {
            (w.mesh.material as THREE.MeshPhongMaterial).emissiveIntensity = 2.0;
            setTimeout(() => { (w.mesh.material as THREE.MeshPhongMaterial).emissiveIntensity = 0.05; }, 100);
          }
        }
      });
      balls.push(ball);
    };

    // ── Raycaster for accurate click → world position ─────────
    // Projects the click through the camera to the board plane (z=0)
    // so the ball always drops at the screen position the user tapped.
    const raycaster = new THREE.Raycaster();
    const boardPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);

    const onDown = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      if ((e.clientY - r.top) > r.height * 0.65) return;
      const ndcX = ((e.clientX - r.left) / r.width) * 2 - 1;
      const ndcY = -((e.clientY - r.top) / r.height) * 2 + 1;
      raycaster.setFromCamera(new THREE.Vector2(ndcX, ndcY), cam);
      const hit = new THREE.Vector3();
      if (raycaster.ray.intersectPlane(boardPlane, hit)) {
        spawnBall(hit.x);
      }
    };

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width * 2 - 1;
      const y = (e.clientY - r.top) / r.height * 2 - 1;
      cam.position.x = THREE.MathUtils.lerp(cam.position.x, x * 1.5, 0.05);
      cam.position.y = THREE.MathUtils.lerp(cam.position.y, -y * 1.5, 0.05);
      cam.lookAt(0, 0, 0);
    };
    el.addEventListener('pointerdown', onDown);
    el.addEventListener('pointermove', onMove);

    const ro = new ResizeObserver(() => {
      const nW = el.clientWidth, nH = el.clientHeight;
      cam.aspect = nW / nH; cam.updateProjectionMatrix(); ren.setSize(nW, nH);
    });
    ro.observe(el);

    // ── Loop ─────────────────────────────────────────────────
    const loop = () => {
      raf = requestAnimationFrame(loop);
      world.fixedStep();
      const now = Date.now();

      for (let i = balls.length - 1; i >= 0; i--) {
        const b = balls[i];
        if (b.dead) { balls.splice(i, 1); continue; }
        b.body.position.z = 0; b.body.velocity.z = 0;
        b.mesh.position.set(b.body.position.x, b.body.position.y, 0);
        b.mesh.quaternion.set(b.body.quaternion.x, b.body.quaternion.y, b.body.quaternion.z, b.body.quaternion.w);

        // trail
        const tm = new THREE.Mesh(trailGeo,
          new THREE.MeshBasicMaterial({ color: b.col, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending }));
        tm.position.copy(b.mesh.position);
        parts.push({ mesh: tm, vel: new THREE.Vector3(), life: 0.7, initLife: 0.7, trail: true });
        scene.add(tm);

        const dx = b.body.position.x - b.lx, dy = b.body.position.y - b.ly;
        if (dx*dx + dy*dy > 0.005) { b.lx = b.body.position.x; b.ly = b.body.position.y; b.t0 = now; }
        else if (now - b.t0 > 5000) { report(b.body.position.x); killBall(b); balls.splice(i, 1); continue; }

        if (b.body.position.y < -BH/2 + 0.65) { report(b.body.position.x); killBall(b); balls.splice(i, 1); continue; }
        if (Math.abs(b.body.position.x) > BW || b.body.position.y < -BH) { report(b.body.position.x); killBall(b); balls.splice(i, 1); }
      }

      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        p.mesh.position.add(p.vel);
        if (p.conf) {
          p.vel.y -= 0.009; p.vel.x *= 0.99;
          if (p.rv) { p.mesh.rotation.x += p.rv.x; p.mesh.rotation.y += p.rv.y; p.mesh.rotation.z += p.rv.z; }
          p.life -= 0.015; (p.mesh.material as THREE.MeshBasicMaterial).opacity = Math.min(1, p.life * 2);
        } else if (p.trail) {
          p.life -= 0.025;
          const ratio = p.life / (p.initLife || 0.7);
          p.mesh.scale.setScalar(ratio); (p.mesh.material as THREE.MeshBasicMaterial).opacity = ratio * 0.6;
        }
        if (p.life <= 0) { scene.remove(p.mesh); parts.splice(i, 1); }
      }

      // Fade peg emissive back to base colour
      for (const p of pegs) {
        if (p.flashT > 0) {
          p.flashT = Math.max(0, p.flashT - 1 / 30);
          const mat = p.mesh.material as THREE.MeshPhongMaterial;
          mat.emissive.lerpColors(p.emissiveColor, p.flashColor, p.flashT);
          mat.emissiveIntensity = p.initE + (5.0 - p.initE) * p.flashT;
          p.mesh.scale.setScalar(1 + 0.5 * p.flashT);
        }
      }

      // Fade and remove flash point lights
      for (let i = flashLights.length - 1; i >= 0; i--) {
        const fl = flashLights[i];
        fl.life -= 1 / 30;
        fl.light.intensity = 12 * fl.life;
        if (fl.life <= 0) { scene.remove(fl.light); flashLights.splice(i, 1); }
      }

      ren.render(scene, cam);
    };
    loop();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      el.removeEventListener('pointerdown', onDown);
      el.removeEventListener('pointermove', onMove);
      labelSprites.forEach(s => { scene.remove(s); (s.material as THREE.SpriteMaterial).map?.dispose(); s.material.dispose(); });
      ren.dispose();
      if (ren.domElement.parentElement === el) el.removeChild(ren.domElement);
    };
  }, []);

  return (
    <div ref={mountRef} className="w-full h-full relative" style={{ touchAction: 'none' }}>
      {!dropped && (
        <div className="absolute top-6 w-full text-center pointer-events-none z-10 animate-pulse">
          <span style={{ color: '#ffcc00', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '3px', opacity: 0.6 }}>
            Tap the board to drop the ball
          </span>
        </div>
      )}
    </div>
  );
}
