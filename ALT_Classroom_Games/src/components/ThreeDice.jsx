import { Canvas, useFrame } from '@react-three/fiber';
import { Physics, useBox, usePlane } from '@react-three/cannon';
import { useRef, useState, useEffect } from 'react';
import { Environment, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { soundManager } from '../utils/sound';

function Plane(props) {
  const [ref] = usePlane(() => ({ rotation: [-Math.PI / 2, 0, 0], ...props }));
  return <mesh ref={ref} receiveShadow><planeGeometry args={[100, 100]} /><shadowMaterial color="#171717" transparent opacity={0.4} /></mesh>;
}

function Wall({ args, ...props }) {
  const [ref] = useBox(() => ({ args, ...props }));
  return <mesh ref={ref} visible={false}><boxGeometry args={args} /></mesh>;
}

const DOT_conf = {
  1: [[0, 0, 0]],
  2: [[-0.2, -0.2, 0], [0.2, 0.2, 0]],
  3: [[-0.2, -0.2, 0], [0, 0, 0], [0.2, 0.2, 0]],
  4: [[-0.2, -0.2, 0], [0.2, -0.2, 0], [-0.2, 0.2, 0], [0.2, 0.2, 0]],
  5: [[-0.2, -0.2, 0], [0.2, -0.2, 0], [0, 0, 0], [-0.2, 0.2, 0], [0.2, 0.2, 0]],
  6: [[-0.2, -0.26, 0], [0.2, -0.26, 0], [-0.2, 0, 0], [0.2, 0, 0], [-0.2, 0.26, 0], [0.2, 0.26, 0]],
};

function FaceDots({ number, position, rotation }) {
  if (!DOT_conf[number]) return null;
  return (
    <group position={position} rotation={rotation}>
      {DOT_conf[number].map((pos, i) => (
        <mesh key={i} position={[pos[0], pos[1], 0.51]} receiveShadow castShadow>
          <sphereGeometry args={[0.08, 32, 32]} />
          <meshStandardMaterial color="black" />
        </mesh>
      ))}
    </group>
  );
}



function Rig({ zoom = false, dicePos }) {
  useFrame((state, delta) => {
    // Default center focus
    const defaultFocus = new THREE.Vector3(0, 0.5, 0);
    // Default camera position (high angle)
    const defaultCamPos = new THREE.Vector3(0, 6, 4);

    // Zoom focus (dice position)
    const targetFocus = zoom && dicePos.current ? dicePos.current : defaultFocus;

    // Zoom camera position (relative to dice)
    // We want a close up. Let's say 2 units up and 1 unit back.
    const zoomOffset = new THREE.Vector3(0, 2.5, 1);
    const targetCamPos = zoom && dicePos.current
      ? targetFocus.clone().add(zoomOffset)
      : defaultCamPos;

    // Smooth movement
    state.camera.position.lerp(targetCamPos, 0.1);
    state.camera.lookAt(targetFocus);
  });
  return null;
}

function Dice({ onRollComplete, isRolling, triggerRoll, dicePos }) {
  const [ref, api] = useBox(() => ({ mass: 1, position: [0, 5, 0], args: [1, 1, 1], friction: 0.1, restitution: 0.5 }));
  const velocity = useRef([0, 0, 0]);
  useEffect(() => api.velocity.subscribe((v) => (velocity.current = v)), [api.velocity]);

  useEffect(() => {
    if (triggerRoll) {
      api.position.set(0, 4, 0);
      api.velocity.set(0, 0, 0);
      api.angularVelocity.set(0, 0, 0);

      const x = (Math.random() - 0.5) * 10;
      const y = Math.random() * 5 + 5;
      const z = (Math.random() - 0.5) * 10;
      api.applyImpulse([x, y, z], [0, 0, 0]);

      const rx = (Math.random() - 0.5) * 20;
      const ry = (Math.random() - 0.5) * 20;
      const rz = (Math.random() - 0.5) * 20;
      api.angularVelocity.set(rx, ry, rz);

      soundManager.play('click');
    }
  }, [triggerRoll, api]);

  useEffect(() => {
    // Subscribe to physics position for reliable camera tracking
    const unsubscribe = api.position.subscribe((v) => {
      if (dicePos && dicePos.current) {
        dicePos.current.set(v[0], v[1], v[2]);
      }
    });
    return unsubscribe;
  }, [api.position, dicePos]);

  useFrame(() => {
    if (isRolling) {
      if (Date.now() - 500 < (window._lastDiceRollTime || 0)) return;

      const v = velocity.current;
      if (Math.abs(v[0]) < 0.1 && Math.abs(v[1]) < 0.1 && Math.abs(v[2]) < 0.1) {
        if (ref.current) {
          const q = new THREE.Quaternion(ref.current.quaternion.x, ref.current.quaternion.y, ref.current.quaternion.z, ref.current.quaternion.w);

          const normals = [
            { face: 3, vec: new THREE.Vector3(1, 0, 0) },
            { face: 4, vec: new THREE.Vector3(-1, 0, 0) },
            { face: 2, vec: new THREE.Vector3(0, 1, 0) },
            { face: 5, vec: new THREE.Vector3(0, -1, 0) },
            { face: 1, vec: new THREE.Vector3(0, 0, 1) },
            { face: 6, vec: new THREE.Vector3(0, 0, -1) }
          ];

          let maxDot = -1;
          let bestFace = 1;

          normals.forEach(n => {
            const worldVec = n.vec.clone().applyQuaternion(q);
            if (worldVec.y > maxDot) {
              maxDot = worldVec.y;
              bestFace = n.face;
            }
          });

          onRollComplete(bestFace);
        }
      }
    }
  });

  return (
    <group ref={ref}>
      <RoundedBox args={[1, 1, 1]} radius={0.1} smoothness={4} castShadow receiveShadow>
        <meshStandardMaterial color="white" />
      </RoundedBox>
      <FaceDots number={1} position={[0, 0, 0]} rotation={[0, 0, 0]} />
      <FaceDots number={6} position={[0, 0, 0]} rotation={[0, Math.PI, 0]} />
      <FaceDots number={2} position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} />
      <FaceDots number={5} position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]} />
      <FaceDots number={3} position={[0, 0, 0]} rotation={[0, Math.PI / 2, 0]} />
      <FaceDots number={4} position={[0, 0, 0]} rotation={[0, -Math.PI / 2, 0]} />
    </group>
  );
}

export default function ThreeDice({ rolling, onResult, zoom }) {
  const [lastRollTime, setLastRollTime] = useState(0);
  const [internalRolling, setInternalRolling] = useState(false);
  const dicePos = useRef(new THREE.Vector3(0, 0, 0));

  useEffect(() => {
    if (rolling) {
      window._lastDiceRollTime = Date.now();
      setLastRollTime(Date.now());
      setInternalRolling(true);
    }
  }, [rolling]);

  const handleComplete = (result) => {
    if (internalRolling) {
      setInternalRolling(false);
      setTimeout(() => onResult(result), 200);
    }
  };

  return (
    <div className="w-full h-full">
      <Canvas shadows camera={{ position: [0, 5, 5], fov: 50 }}>
        <Rig zoom={zoom} dicePos={dicePos} />
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.5} penumbra={1} castShadow intensity={2} />
        <Environment preset="studio" />
        <Physics>
          <Dice triggerRoll={rolling} isRolling={internalRolling} onRollComplete={handleComplete} dicePos={dicePos} />
          <Plane />
          <Wall args={[10, 10, 1]} position={[0, 5, -3]} />
          <Wall args={[10, 10, 1]} position={[0, 5, 3]} />
          <Wall args={[1, 10, 10]} position={[-3, 5, 0]} />
          <Wall args={[1, 10, 10]} position={[3, 5, 0]} />
        </Physics>
      </Canvas>
    </div>
  );
}
