
import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, Environment, PerspectiveCamera, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { useTheme } from '../context/ThemeContext';

const COLORS = {
    light: {
        cloud: '#ffffff',
        // Dynamic sky is handled by the cycle now
        skyDay: '#87CEEB',
        skyNight: '#0f172a',
        plane: '#ff7675',
        balloon: ['#ff9ff3', '#54a0ff']
    }
};

const CAR_COLORS = ['#ff9f43', '#ee5253', '#0abde3', '#10ac84', '#222f3e'];

const CelestialBody = ({ position, color, scale, emissiveIntensity }) => {
    return (
        <group position={position}>
            <mesh scale={scale}>
                <sphereGeometry args={[1, 32, 32]} />
                <meshStandardMaterial color={color} emissive={color} emissiveIntensity={emissiveIntensity} toneMapped={false} />
            </mesh>
            {/* Glow Halo */}
            <mesh scale={scale * 1.5}>
                <sphereGeometry args={[1, 32, 32]} />
                <meshBasicMaterial color={color} transparent opacity={0.2} side={THREE.BackSide} />
            </mesh>
        </group>
    );
}

const SceneContent = ({ isDark, timeOfDay, setTimeOfDay }) => {
    const { camera, mouse, scene } = useThree();

    // Derived values
    const sunPos = new THREE.Vector3(Math.sin(timeOfDay) * 30, Math.cos(timeOfDay) * 30, -20);
    const moonPos = new THREE.Vector3(Math.sin(timeOfDay + Math.PI) * 30, Math.cos(timeOfDay + Math.PI) * 30, -20);

    // Light intensity: Peak day (0 rad) = 1, Night (PI rad) = 0
    // Actually timeOfDay 0 = Noon (Top), PI = Midnight (Bottom)?
    // Let's define: 
    // timeOfDay goes 0 -> 2PI. 
    // 0 = Noon (Sun Top). PI = Midnight (Sun Bottom).

    const dayIntensity = Math.max(0, Math.cos(timeOfDay)); // 1 at noon, 0 at horizon
    const nightIntensity = Math.max(0, Math.cos(timeOfDay + Math.PI)); // 1 at midnight

    useFrame((state, delta) => {
        // Time progression: Full day in X seconds?
        // User said: "Instantly switches to peak", implying manual control dominates.
        // But "Make the background have a day night cycle" implies auto.
        // I will add a very slow auto-cycle (e.g., 2 minutes per day)
        // AND instant snap on button press.

        const cycleSpeed = 0.1 * delta; // Slow rotation
        setTimeOfDay(prev => (prev + cycleSpeed) % (Math.PI * 2));

        // Scroll Parallax
        const scrollOffset = window.scrollY / window.innerHeight;
        const targetY = -(scrollOffset * 5);
        const mouseX = (mouse.x * 2);
        const mouseY = (mouse.y * 2);

        camera.position.x += (mouseX - camera.position.x) * 0.05;
        camera.position.y += ((targetY + mouseY) - camera.position.y) * 0.05;
        camera.lookAt(0, 0, 0);

        // Dynamic Sky Color
        // Simple Lerp between Blue and Dark Slate
        const bg = new THREE.Color('#87CEEB').lerp(new THREE.Color('#0f172a'), 1 - dayIntensity);
        // Look up how to set background in R3F? `scene.background = bg`
        // Or handle via CSS/HTML overlay opacity? 
        // The background div is behind canvas. I can't easily sync React state to that div's style effectively every frame without perf hit.
        // Better: Use a big plane or `color` att on scene?
        // Actually, I can pass `bg` up? No. 
        // I'll set scene.background.
        scene.background = bg;
    });

    return (
        <>
            <ambientLight intensity={0.2 + dayIntensity * 0.6} />
            <pointLight position={[10, 10, 10]} intensity={0.5 + dayIntensity * 0.5} />
            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} opacity={nightIntensity} />

            <CelestialBody position={sunPos} color="#f1c40f" scale={2} emissiveIntensity={2} />
            <CelestialBody position={moonPos} color="#f5f6fa" scale={1.5} emissiveIntensity={1} />
        </>
    );
};

const Cloud = ({ position, scale = 1, speed = 0.1, color }) => {
    const mesh = useRef();
    useFrame((state, delta) => {
        if (mesh.current) {
            mesh.current.position.x += speed * delta;
            if (mesh.current.position.x > 15) mesh.current.position.x = -15;
        }
    });

    return (
        <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
            <group position={position} ref={mesh} scale={scale}>
                <mesh position={[0, 0, 0]}>
                    <sphereGeometry args={[1, 16, 16]} />
                    <meshStandardMaterial color={color} opacity={0.8} transparent roughness={0.9} />
                </mesh>
                <mesh position={[1.2, -0.2, 0]} scale={0.7}>
                    <sphereGeometry args={[1, 16, 16]} />
                    <meshStandardMaterial color={color} opacity={0.8} transparent roughness={0.9} />
                </mesh>
                <mesh position={[-1.1, -0.1, 0]} scale={0.8}>
                    <sphereGeometry args={[1, 16, 16]} />
                    <meshStandardMaterial color={color} opacity={0.8} transparent roughness={0.9} />
                </mesh>
            </group>
        </Float>
    );
};

const HotAirBalloon = ({ position }) => {
    const ref = useRef();
    const [active, setActive] = useState(false);
    const colors = COLORS.light.balloon;

    useFrame(({ clock }) => {
        if (ref.current) {
            const t = clock.getElapsedTime();
            ref.current.position.y = position[1] + Math.sin(t * 0.5) * 1;
            ref.current.position.x = position[0] + Math.sin(t * 0.2) * 0.5;

            if (active) {
                ref.current.rotation.y += 0.2;
                if (ref.current.rotation.y > Math.PI * 4) {
                    setActive(false);
                    ref.current.rotation.y = 0;
                }
            }
        }
    });

    return (
        <group
            ref={ref}
            position={position}
            onClick={(e) => { e.stopPropagation(); setActive(true); }}
            onPointerOver={() => document.body.style.cursor = 'pointer'}
            onPointerOut={() => document.body.style.cursor = 'auto'}
        >
            <mesh position={[0, 1.5, 0]}>
                <sphereGeometry args={[1.2, 16, 16]} />
                <meshStandardMaterial color={colors[0]} roughness={0.3} />
            </mesh>
            <mesh position={[0.6, 0.5, 0]} rotation={[0, 0, -0.2]}>
                <cylinderGeometry args={[0.02, 0.02, 1.5]} />
                <meshStandardMaterial color="#ecf0f1" />
            </mesh>
            <mesh position={[-0.6, 0.5, 0]} rotation={[0, 0, 0.2]}>
                <cylinderGeometry args={[0.02, 0.02, 1.5]} />
                <meshStandardMaterial color="#ecf0f1" />
            </mesh>
            <mesh position={[0, -0.2, 0]}>
                <boxGeometry args={[0.8, 0.6, 0.8]} />
                <meshStandardMaterial color="#8e44ad" />
            </mesh>
        </group>
    )
};

const PaperPlane = ({ position, color = COLORS.light.plane }) => {
    const ref = useRef();
    const speed = useRef(Math.random() * 2 + 1);
    const offset = useRef(Math.random() * 100);
    const [active, setActive] = useState(false);

    useFrame(({ clock }) => {
        const t = clock.getElapsedTime() * speed.current + offset.current;

        if (active) {
            ref.current.rotation.z += 0.5;
            if (ref.current.rotation.z > Math.PI * 2) {
                setActive(false);
                ref.current.rotation.z = Math.PI / 2;
            }
        } else {
            const x = Math.sin(t) * 8;
            const y = Math.cos(t * 0.5) * 3 + 2;
            const z = Math.sin(t * 0.3) * 2 - 2;

            if (ref.current) {
                ref.current.position.set(x, y, z);
                ref.current.lookAt(new THREE.Vector3(Math.cos(t) * 8, Math.sin(t * 0.5) * -3, 0));
                ref.current.rotateX(Math.PI / 2);
            }
        }
    });

    return (
        <group
            ref={ref}
            position={position}
            onClick={(e) => { e.stopPropagation(); setActive(true); }}
            onPointerOver={() => document.body.style.cursor = 'pointer'}
            onPointerOut={() => document.body.style.cursor = 'auto'}
        >
            <mesh scale={0.5}>
                <coneGeometry args={[1, 3, 3]} />
                <meshStandardMaterial color={color} roughness={0.6} />
            </mesh>
        </group>
    );
};

const Car = ({ position, speed = 2, color }) => {
    const ref = useRef();
    const [active, setActive] = useState(false);

    useFrame((state, delta) => {
        if (ref.current) {
            if (active) {
                ref.current.position.y += 0.2;
                if (ref.current.position.y > position[1] + 2) {
                    setActive(false);
                }
            } else if (ref.current.position.y > position[1]) {
                ref.current.position.y -= 0.2;
            }

            ref.current.position.x += speed * delta;
            if (ref.current.position.x > 20) ref.current.position.x = -20;
        }
    });

    return (
        <group
            ref={ref}
            position={position}
            onClick={(e) => { e.stopPropagation(); setActive(true); }}
            onPointerOver={() => document.body.style.cursor = 'pointer'}
            onPointerOut={() => document.body.style.cursor = 'auto'}
        >
            <mesh position={[0, 0.5, 0]}>
                <boxGeometry args={[2, 0.8, 1]} />
                <meshStandardMaterial color={color} roughness={0.2} metalness={0.1} />
            </mesh>
            <mesh position={[0.2, 1, 0]}>
                <boxGeometry args={[1.2, 0.6, 0.8]} />
                <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.2} />
            </mesh>
            <mesh position={[-0.6, 0.2, 0.5]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.3, 0.3, 0.2, 12]} />
                <meshStandardMaterial color={"#333"} />
            </mesh>
            <mesh position={[0.6, 0.2, 0.5]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.3, 0.3, 0.2, 12]} />
                <meshStandardMaterial color={"#333"} />
            </mesh>
        </group>
    )
};

const PlayfulBackground = () => {
    const { isDark, timeOfDay, setTimeOfDay } = useTheme();

    return (
        <>
            <div className="fixed inset-0 -z-10 bg-slate-900">
                <Canvas dpr={[1, 2]} eventSource={document.getElementById('root') || undefined} eventPrefix="client">
                    <SceneContent isDark={isDark} timeOfDay={timeOfDay} setTimeOfDay={setTimeOfDay} />
                    <PerspectiveCamera makeDefault position={[0, 0, 15]} fov={50} />

                    {/* Clouds */}
                    <Cloud position={[-10, 4, -5]} scale={1.5} speed={0.5} color="#ecf0f1" />
                    <Cloud position={[8, 6, -8]} scale={1.2} speed={0.3} color="#ecf0f1" />
                    <Cloud position={[2, 8, -10]} scale={2} speed={0.2} color="#bdc3c7" />

                    <HotAirBalloon position={[5, 0, -2]} />
                    <HotAirBalloon position={[-6, 3, -10]} />

                    <PaperPlane position={[0, 0, 0]} />
                    <PaperPlane position={[2, 3, 2]} />
                    <PaperPlane position={[-3, 1, -2]} />

                    <Car position={[-15, -6, 0]} speed={4} color={CAR_COLORS[0]} />
                    <Car position={[-5, -6, 2]} speed={5} color={CAR_COLORS[1]} />
                    <Car position={[-18, -6.5, -2]} speed={3} color={CAR_COLORS[2]} />

                </Canvas>
            </div>
        </>
    );
};

export default PlayfulBackground;
