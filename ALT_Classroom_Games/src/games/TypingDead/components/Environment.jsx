import React, { useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Instance, Instances, Stars, Cloud, useTexture, Billboard } from '@react-three/drei';
import * as THREE from 'three';

import imgGrass from '../../../assets/textures/texture_grass.png';
import imgStone from '../../../assets/textures/texture_stone.png';
import imgDirt from '../../../assets/textures/texture_dirt.png';
import imgBark from '../../../assets/textures/texture_bark.png';

const Environment = () => {
    // Load Textures
    const textures = useTexture({
        grass: imgGrass,
        stone: imgStone,
        dirt: imgDirt,
        bark: imgBark
    });

    // Configure Textures (Repeat/Wrapping)
    useMemo(() => {
        Object.values(textures).forEach(t => {
            t.wrapS = t.wrapT = THREE.RepeatWrapping;
        });
        textures.grass.repeat.set(20, 20);
        textures.dirt.repeat.set(1, 40);
        textures.bark.repeat.set(1, 3);
        // Stone texture mapped individually
    }, [textures]);

    // Generate Tombstone Data
    const tombstones = useMemo(() => {
        const items = [];
        for (let i = 0; i < 60; i++) { // Increased density
            // Exclude center path (-3 to 3)
            const side = Math.random() > 0.5 ? 1 : -1;
            const x = side * (3.5 + Math.random() * 20); // Wider spread

            items.push({
                position: [
                    x,
                    0.6, // Slight raise
                    -(Math.random() * 60) + 5 // Z range
                ],
                rotation: [
                    (Math.random() - 0.5) * 0.2,
                    (Math.random() - 0.5) * 0.8,
                    (Math.random() - 0.5) * 0.2
                ],
                scale: 0.8 + Math.random() * 0.6
            });
        }
        return items;
    }, []);

    // Generate Dead Trees
    const trees = useMemo(() => {
        const items = [];
        for (let i = 0; i < 100; i++) { // Increased to 100 for dense forest
            const side = Math.random() > 0.5 ? 1 : -1;
            const x = side * (6 + Math.random() * 25);

            items.push({
                position: [
                    x,
                    0,
                    -(Math.random() * 80) // Further back
                ],
                scale: 1.5 + Math.random() * 2,
                rotation: [0, Math.random() * Math.PI, 0]
            });
        }
        return items;
    }, []);

    // Generate Lanterns
    const lanterns = useMemo(() => {
        const items = [];
        // REDUCED COUNT TO 5 TO ENABLE SHADOWS WITHOUT CRASHING (WebGL Limit)
        for (let i = 0; i < 5; i++) {
            const side = Math.random() > 0.5 ? 1 : -1;
            const x = side * (2.5 + Math.random() * 10);

            items.push({
                position: [x, 0, -(Math.random() * 50)],
                scale: 0.5 + Math.random() * 0.3,
                rotation: [0, Math.random() * Math.PI, 0]
            });
        }
        return items;
    }, []);

    return (
        <group>
            {/* --- SKY & MOON -- */}
            <Stars radius={150} depth={50} count={3000} factor={6} saturation={0} fade speed={0.5} />

            {/* Moon Object */}
            <mesh position={[20, 30, -80]}>
                <sphereGeometry args={[8, 32, 32]} />
                <meshStandardMaterial
                    color="#e0e0e0"
                    emissive="#ffffff"
                    emissiveIntensity={0.8}
                    fog={false}
                />
            </mesh>
            {/* Moon Glow */}
            <pointLight position={[20, 30, -70]} intensity={1.5} color="#a0c0ff" distance={100} />

            {/* --- GROUND --- */}
            {/* Grass/Dirt Base */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, -0.05, 0]}>
                <planeGeometry args={[200, 200, 32, 32]} />
                <meshStandardMaterial
                    map={textures.grass}
                    color="#ffffff"
                    roughness={1}
                />
            </mesh>

            {/* Path */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, 0.01, 0]}>
                <planeGeometry args={[7, 200]} />
                <meshStandardMaterial
                    map={textures.dirt}
                    roughness={1}
                    color="#ffffff"
                />
            </mesh>

            {/* --- TOMBSTONES --- */}
            <Instances range={60}>
                <boxGeometry args={[0.8, 1.4, 0.25]} />
                <meshStandardMaterial
                    map={textures.stone}
                    roughness={0.8}
                    color="#ffffff"
                />
                {tombstones.map((data, i) => (
                    <Instance
                        key={i}
                        position={data.position}
                        rotation={data.rotation}
                        scale={[data.scale, data.scale, data.scale]}
                    />
                ))}
            </Instances>

            {/* --- DEAD TREES --- */}
            {trees.map((t, i) => (
                <group key={i} position={t.position} rotation={t.rotation} scale={[t.scale, t.scale, t.scale]}>
                    {/* Trunk */}
                    <mesh position={[0, 2.5, 0]} castShadow receiveShadow>
                        <cylinderGeometry args={[0.2, 0.5, 5, 5]} />
                        <meshStandardMaterial
                            map={textures.bark}
                            roughness={1}
                            color="#cccccc"
                        />
                    </mesh>

                    {/* Twisted Branches (Pivoted from trunk center) */}

                    {/* Branch 1 */}
                    <group position={[0, 3.5, 0]} rotation={[0, 0, -0.8]}>
                        <mesh position={[0, 1.2, 0]} castShadow>
                            <cylinderGeometry args={[0.08, 0.2, 3, 4]} />
                            <meshStandardMaterial map={textures.bark} color="#cccccc" />
                        </mesh>
                    </group>

                    {/* Branch 2 */}
                    <group position={[0, 2.8, 0]} rotation={[0.5, 0, 0.8]}>
                        <mesh position={[0, 1.0, 0]} castShadow>
                            <cylinderGeometry args={[0.08, 0.2, 2.5, 4]} />
                            <meshStandardMaterial map={textures.bark} color="#cccccc" />
                        </mesh>
                    </group>

                    {/* Branch 3 */}
                    <group position={[0, 4.2, 0]} rotation={[-0.6, 0.3, 0]}>
                        <mesh position={[0, 0.8, 0]} castShadow>
                            <cylinderGeometry args={[0.05, 0.15, 2, 4]} />
                            <meshStandardMaterial map={textures.bark} color="#cccccc" />
                        </mesh>
                    </group>
                </group>
            ))}

            {/* --- LANTERNS --- */}
            {lanterns.map((l, i) => (
                <group key={i} position={l.position} rotation={l.rotation} scale={[l.scale, l.scale, l.scale]}>
                    {/* Tall Post/Stick */}
                    <mesh position={[0, 1.0, 0]} castShadow>
                        <cylinderGeometry args={[0.04, 0.06, 2.0, 6]} />
                        <meshStandardMaterial color="#111" roughness={0.9} />
                    </mesh>
                    {/* Horizontal Arm */}
                    <mesh position={[0.15, 1.8, 0]} castShadow>
                        <boxGeometry args={[0.4, 0.05, 0.05]} />
                        <meshStandardMaterial color="#111" />
                    </mesh>
                    {/* Ring/Hook */}
                    <mesh position={[0.3, 1.75, 0]}>
                        <torusGeometry args={[0.05, 0.01, 8, 16]} />
                        <meshStandardMaterial color="#222" />
                    </mesh>

                    {/* LANTERN ASSEMBLY */}
                    <group position={[0.3, 1.5, 0]}>
                        {/* Housing Top */}
                        <mesh position={[0, 0.2, 0]} castShadow>
                            <coneGeometry args={[0.15, 0.15, 4]} />
                            <meshStandardMaterial color="#222" />
                        </mesh>
                        {/* Housing Frame */}
                        <mesh castShadow>
                            <cylinderGeometry args={[0.12, 0.1, 0.35, 4]} />
                            <meshStandardMaterial color="#111" wireframe={true} />
                        </mesh>
                        {/* Glowing Essence (The Light Source) */}
                        <mesh>
                            <sphereGeometry args={[0.08, 16, 16]} />
                            <meshBasicMaterial color="#ffaa00" toneMapped={false} />
                        </mesh>
                        {/* The Actual Light */}
                        <pointLight
                            intensity={20}
                            distance={25}
                            decay={2}
                            color="#ffaa00"
                            castShadow={false}
                            shadow-bias={-0.0001}
                        />
                    </group>
                </group>
            ))}

            {/* --- GROUND MIST TEXTURE --- */}
            {/* Restored scrolling ground mist */}
            <GroundMist />

            {/* --- FOG MOVED TO SCENE3D ROOT --- */}

            {/* --- MANUAL MIST CLOUDS --- */}
            {/* Custom billboard particles with precise slow animation control */}
            <MistCloudParticles />

            {/* --- LIGHTNING --- */}
            <Lightning />
        </group>
    );
};

// RANDOM LIGHTNING EFFECT
const Lightning = () => {
    const { scene } = useThree();
    const light = React.useRef();
    const [flash, setFlash] = React.useState(0);

    // Base fog color
    const baseColor = new THREE.Color('#3b4c5a');
    const flashColor = new THREE.Color('#8899cc'); // Bright blue-white flash

    useFrame((state, delta) => {
        // Random chance to trigger a flash sequence
        if (Math.random() > 0.99 && flash <= 0) {
            setFlash(1.0); // Start flash at full intensity

            // Randomize position for the point light shadow casting
            if (light.current) {
                light.current.position.x = (Math.random() - 0.5) * 100;
            }
        }

        // Handle Flash Decay
        if (flash > 0) {
            // Slower decay for more visibility
            const decay = 3.0 * delta;
            const newFlash = Math.max(0, flash - decay);
            setFlash(newFlash);

            // Interpolate Background & Fog Color
            // varied intensity for flickering effect
            const intensity = newFlash > 0.8 ? newFlash : newFlash * (0.5 + Math.random() * 0.5);

            // Flash Fog
            if (scene.fog) {
                scene.fog.color.lerpColors(baseColor, flashColor, intensity);
            }
            // Flash Background
            if (scene.background) {
                scene.background.lerpColors(baseColor, flashColor, intensity);
            }

            // Sync PointLight intensity
            if (light.current) {
                // Massive intensity multiplier to ensure it cuts through everything
                light.current.intensity = intensity * 200;
            }
        } else {
            // Ensure we are back to base color effectively (optimization)
            if (scene.fog && scene.fog.color.getHexString() !== baseColor.getHexString()) {
                scene.fog.color.copy(baseColor);
            }
            if (scene.background && scene.background.getHexString() !== baseColor.getHexString()) {
                scene.background.copy(baseColor);
            }
        }
    });

    return (
        <pointLight
            ref={light}
            position={[0, 80, -20]}
            color="#aaccff"
            distance={500}
            decay={1}
            intensity={0}
        />
    );
};

import imgMist from '../../../assets/textures/texture_mist.png';

// Ground Mist (Scrolling Texture)
const GroundMist = () => {
    const texture = useTexture(imgMist);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(10, 10);

    useFrame((state, delta) => {
        texture.offset.y += 0.02 * delta;
        texture.offset.x += 0.01 * delta;
    });

    return (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.2, 0]} receiveShadow={false} castShadow={false}>
            <planeGeometry args={[100, 100]} />
            <meshBasicMaterial
                map={texture}
                transparent
                opacity={0.3}
                depthWrite={false}
                color="#8faabf"
                blending={THREE.AdditiveBlending}
                side={THREE.DoubleSide}
            />
        </mesh>
    );
};

import imgMist3 from '../../../assets/textures/mist_3.png';

// Ground Mist (mist_3.png - Endless Scroll)
const ScrollingFogLayer = () => {
    const texture = useTexture(imgMist3);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 1);

    useFrame((state, delta) => {
        // Move Right to Left
        texture.offset.x += 0.1 * delta;
    });

    return (
        <group>
            {/* Layer 1 - Very Close (Bottom of screen overlay) */}
            <mesh position={[0, 0.5, 3]} rotation={[-Math.PI / 8, 0, 0]}>
                <planeGeometry args={[15, 3]} />
                <meshBasicMaterial
                    map={texture}
                    transparent
                    opacity={0.8}
                    depthWrite={false}
                    color="#aaccff"
                    blending={THREE.AdditiveBlending}
                    side={THREE.DoubleSide}
                />
            </mesh>
            {/* Layer 2 - Mid ground */}
            <mesh position={[0, 0.8, -2]} rotation={[-Math.PI / 8, 0, 0]}>
                <planeGeometry args={[30, 5]} />
                <meshBasicMaterial
                    map={texture}
                    transparent
                    opacity={0.5}
                    depthWrite={false}
                    color="#8faabf"
                    blending={THREE.AdditiveBlending}
                    side={THREE.DoubleSide}
                />
            </mesh>
        </group>
    );
};

import imgMist1 from '../../../assets/textures/mist_1.png';
import imgMist2 from '../../../assets/textures/mist_2.png';

// Custom Mist Component with Random Textures (mist_1, mist_2)
const MistCloudParticles = () => {
    const tex1 = useTexture(imgMist1);
    const tex2 = useTexture(imgMist2);

    // Generate particles
    const particles = useMemo(() => {
        const temp = [];
        for (let i = 0; i < 500; i++) {
            temp.push({
                x: (Math.random() - 0.5) * 60,
                y: 1 + Math.random() * 4,
                z: 5 - (Math.random() * 55),

                rotSpeed: (Math.random() - 0.5) * 0.2,
                fadeSpeed: 0.2 + Math.random() * 0.8,
                phase: Math.random() * Math.PI * 2,
                scale: 3 + Math.random() * 5,
                driftSpeed: 0.05 + Math.random() * 0.25,

                // Randomly assign texture index (0 or 1)
                texIndex: Math.random() > 0.5 ? 1 : 0
            });
        }
        return temp;
    }, []);

    useFrame((state, delta) => {
        const time = state.clock.getElapsedTime();
        particles.forEach((p, i) => {
            const mesh = state.scene.getObjectByName(`mist-cloud-${i}`);
            if (mesh) {
                // 1. Slow Rotate
                mesh.rotation.z += p.rotSpeed * delta;

                // 2. Pulse Opacity
                mesh.material.opacity = 0.05 + (Math.sin(time * p.fadeSpeed + p.phase) + 1) * 0.1;

                // 3. Drift Right to Left (SLOWER)
                mesh.position.x -= p.driftSpeed * delta;

                // 4. Wrap around (Wider range matches generation)
                if (mesh.position.x < -60) {
                    mesh.position.x = 60;
                }
            }
        });
    });

    return (
        <group>
            {particles.map((p, i) => (
                <Billboard key={i} position={[p.x, p.y, p.z]}>
                    <mesh name={`mist-cloud-${i}`}>
                        <planeGeometry args={[p.scale, p.scale]} />
                        <meshBasicMaterial
                            map={p.texIndex === 0 ? tex1 : tex2}
                            transparent
                            opacity={0.1}
                            depthWrite={false}
                            color="#8faabf"
                            blending={THREE.AdditiveBlending}
                            side={THREE.DoubleSide}
                        />
                    </mesh>
                </Billboard>
            ))}
        </group>
    );
};

export default Environment;
