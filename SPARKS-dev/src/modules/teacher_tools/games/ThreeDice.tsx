import { Canvas, useFrame } from '@react-three/fiber';
import { Physics, useBox, usePlane } from '@react-three/cannon';
import { useRef, useState, useEffect } from 'react';
import { RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { soundManager } from './soundManager';

function Plane(props: any) {
    const [ref] = usePlane<THREE.Mesh>(() => ({ rotation: [-Math.PI / 2, 0, 0], ...props }));
    return <mesh ref={ref} receiveShadow><planeGeometry args={[100, 100]} /><shadowMaterial color="#171717" transparent opacity={0.4} /></mesh>;
}

function Wall({ args, ...props }: any) {
    const [ref] = useBox<THREE.Mesh>(() => ({ args, ...props }));
    return <mesh ref={ref} visible={false}><boxGeometry args={args} /></mesh>;
}

const DOT_conf: Record<number, number[][]> = {
    1: [[0, 0, 0]],
    2: [[-0.2, -0.2, 0], [0.2, 0.2, 0]],
    3: [[-0.2, -0.2, 0], [0, 0, 0], [0.2, 0.2, 0]],
    4: [[-0.2, -0.2, 0], [0.2, -0.2, 0], [-0.2, 0.2, 0], [0.2, 0.2, 0]],
    5: [[-0.2, -0.2, 0], [0.2, -0.2, 0], [0, 0, 0], [-0.2, 0.2, 0], [0.2, 0.2, 0]],
    6: [[-0.2, -0.26, 0], [0.2, -0.26, 0], [-0.2, 0, 0], [0.2, 0, 0], [-0.2, 0.26, 0], [0.2, 0.26, 0]],
};

function FaceDots({ number, position, rotation }: { number: number; position: [number, number, number]; rotation: [number, number, number] }) {
    if (!DOT_conf[number]) return null;
    return (
        <group position={position} rotation={rotation}>
            {DOT_conf[number].map((pos, i) => (
                <mesh key={i} position={[pos[0], pos[1], 0.51]}>
                    <sphereGeometry args={[0.08, 16, 16]} />
                    <meshStandardMaterial color="black" />
                </mesh>
            ))}
        </group>
    );
}

function Rig({ zoom, dicePos }: { zoom: boolean; dicePos: React.RefObject<THREE.Vector3> }) {
    useFrame((state) => {
        const defaultFocus = new THREE.Vector3(0, 0.5, 0);
        const defaultCamPos = new THREE.Vector3(0, 6, 4);
        const targetFocus = zoom && dicePos.current ? dicePos.current : defaultFocus;
        const zoomOffset = new THREE.Vector3(0, 2.5, 1);
        const targetCamPos = zoom && dicePos.current ? targetFocus.clone().add(zoomOffset) : defaultCamPos;
        state.camera.position.lerp(targetCamPos, 0.1);
        state.camera.lookAt(targetFocus);
    });
    return null;
}

function Dice({ onRollComplete, isRolling, triggerRoll, dicePos }: any) {
    const [ref, api] = useBox<THREE.Mesh>(() => ({ mass: 1, position: [0, 5, 0], args: [1, 1, 1], friction: 0.1, restitution: 0.5 }));
    const velocity = useRef([0, 0, 0]);
    // Prevent onRollComplete from firing on every frame while the dice is still
    const hasReported = useRef(false);

    useEffect(() => api.velocity.subscribe((v: number[]) => (velocity.current = v)), [api.velocity]);

    useEffect(() => {
        if (triggerRoll) {
            hasReported.current = false;
            api.position.set(0, 4, 0);
            api.velocity.set(0, 0, 0);
            api.angularVelocity.set(0, 0, 0);
            api.applyImpulse(
                [(Math.random() - 0.5) * 10, Math.random() * 5 + 5, (Math.random() - 0.5) * 10],
                [0, 0, 0]
            );
            api.angularVelocity.set(
                (Math.random() - 0.5) * 20,
                (Math.random() - 0.5) * 20,
                (Math.random() - 0.5) * 20
            );
            soundManager.play('click');
        }
    }, [triggerRoll, api]);

    useEffect(() => {
        const unsubscribe = api.position.subscribe((v: number[]) => {
            if (dicePos?.current) dicePos.current.set(v[0], v[1], v[2]);
        });
        return unsubscribe;
    }, [api.position, dicePos]);

    useFrame(() => {
        if (!isRolling || hasReported.current) return;
        if (Date.now() - 500 < ((window as any)._lastDiceRollTime || 0)) return;
        const v = velocity.current;
        if (Math.abs(v[0]) < 0.1 && Math.abs(v[1]) < 0.1 && Math.abs(v[2]) < 0.1) {
            if (ref.current) {
                const q = new THREE.Quaternion(
                    ref.current.quaternion.x, ref.current.quaternion.y,
                    ref.current.quaternion.z, ref.current.quaternion.w
                );
                const normals = [
                    { face: 3, vec: new THREE.Vector3(1, 0, 0) },
                    { face: 4, vec: new THREE.Vector3(-1, 0, 0) },
                    { face: 2, vec: new THREE.Vector3(0, 1, 0) },
                    { face: 5, vec: new THREE.Vector3(0, -1, 0) },
                    { face: 1, vec: new THREE.Vector3(0, 0, 1) },
                    { face: 6, vec: new THREE.Vector3(0, 0, -1) },
                ];
                let maxDot = -1, bestFace = 1;
                normals.forEach(n => {
                    const worldVec = n.vec.clone().applyQuaternion(q);
                    if (worldVec.y > maxDot) { maxDot = worldVec.y; bestFace = n.face; }
                });
                hasReported.current = true;
                onRollComplete(bestFace);
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

export default function ThreeDice({ rolling, onResult, zoom }: { rolling: boolean; onResult: (v: number) => void; zoom: boolean }) {
    const [internalRolling, setInternalRolling] = useState(false);
    const dicePos = useRef(new THREE.Vector3(0, 0, 0));
    // Ref mirrors internalRolling so timeout/context-loss callbacks don't capture stale state
    const internalRollingRef = useRef(false);
    const onResultRef = useRef(onResult);
    const rollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    onResultRef.current = onResult;

    const fireResult = (value: number) => {
        if (!internalRollingRef.current) return;
        internalRollingRef.current = false;
        setInternalRolling(false);
        if (rollTimeoutRef.current) clearTimeout(rollTimeoutRef.current);
        setTimeout(() => onResultRef.current(value), 200);
    };

    useEffect(() => {
        if (rolling) {
            (window as any)._lastDiceRollTime = Date.now();
            internalRollingRef.current = true;
            setInternalRolling(true);
            // Fallback: if physics never settles (e.g. context loss), unblock the game after 4s
            rollTimeoutRef.current = setTimeout(() => {
                fireResult(Math.floor(Math.random() * 6) + 1);
            }, 4000);
        }
        return () => { if (rollTimeoutRef.current) clearTimeout(rollTimeoutRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [rolling]);

    const handleComplete = (result: number) => fireResult(result);

    const handleCreated = ({ gl }: { gl: THREE.WebGLRenderer }) => {
        gl.domElement.addEventListener('webglcontextlost', (e) => {
            e.preventDefault();
            fireResult(Math.floor(Math.random() * 6) + 1);
        }, false);
    };

    return (
        <div style={{ width: '100%', height: '100%' }}>
            <Canvas shadows camera={{ position: [0, 5, 5], fov: 50 }} onCreated={handleCreated}>
                <Rig zoom={zoom} dicePos={dicePos} />
                <ambientLight intensity={0.6} />
                <directionalLight position={[5, 10, 5]} intensity={1.5} castShadow shadow-mapSize-width={512} shadow-mapSize-height={512} />
                <pointLight position={[-4, 6, -4]} intensity={0.5} />
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
