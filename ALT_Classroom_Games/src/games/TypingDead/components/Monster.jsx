import React, { useRef, useEffect, useMemo, useState } from 'react';
import { useGraph, useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations, Html } from '@react-three/drei';
import { SkeletonUtils } from 'three-stdlib';
import { ArrowDown } from 'lucide-react';

// import gltfGhost from '../../../assets/monsters/ghost/scene.gltf?url'; // Reverted: GLTF bin/texture dependencies
// ...

const MODEL_PATHS = {
    GHOST: 'monsters/ghost/scene.gltf',
    GHOUL: 'monsters/ghoul/scene.gltf',
    SKELETON: 'monsters/skeleton/scene.gltf',
    FLYING_BUG: 'monsters/vivinsect/scene.gltf',
    FLYING_BAT: 'monsters/bat_dark_bad_cartoon_monster/scene.gltf',
    MONSTER: 'monsters/low_poly_monster/scene.gltf',
    BOSS: 'monsters/low_poly_monster_model/scene.gltf'
};

// Preload to avoid pop-in
Object.values(MODEL_PATHS).forEach(path => useGLTF.preload(path));

export const MonsterModel = ({ variant, customScale, isHit }) => {
    const group = useRef();
    const path = MODEL_PATHS[variant] || MODEL_PATHS.GHOUL;
    const { scene, animations } = useGLTF(path);
    const clone = useMemo(() => SkeletonUtils.clone(scene), [scene]);
    const { actions } = useAnimations(animations, group);

    useEffect(() => {
        const actionNames = Object.keys(actions);
        if (actionNames.length > 0) {
            const walkAnim = actionNames.find(name => name.toLowerCase().includes('walk') || name.toLowerCase().includes('run') || name.toLowerCase().includes('fly')) || actionNames[0];
            actions[walkAnim]?.reset().fadeIn(0.5).play();
        }
    }, [actions, variant]);

    // Use default values if switch misses
    let scale = 1.0;
    let yOffset = 0;
    let rotation = [0, 0, 0];

    switch (variant) {
        case 'GHOST': // Was SLIME
            scale = 0.01;
            yOffset = 1.5;
            break;
        case 'GHOUL': // Was ZOMBIE
            scale = 0.01;
            yOffset = 0;
            break;
        case 'SKELETON':
            scale = 1.25;
            yOffset = 0;
            rotation = [0, Math.PI, 0];
            break;
        case 'FLYING_BUG': // Was DRAGON
            scale = 1.5;
            yOffset = 0.5;
            rotation = [0, Math.PI, 0];
            break;
        case 'FLYING_BAT': // Was BAT
            scale = 0.5;
            yOffset = 1.0;
            break;
        case 'MONSTER': // New Low Poly Monster (Regular Size)
            scale = 0.01; // Adjusted to match Ghost/Ghoul scaling
            yOffset = 0;
            break;
        case 'BOSS': // Boss Version of Low Poly Monster
            scale = 1.0;
            yOffset = 0;
            break;
        default:
            scale = 0.5;
    }

    if (customScale) scale = customScale;

    // Jitter Logic
    useFrame((state) => {
        if (!group.current) return;
        if (isHit) {
            group.current.position.x = (Math.random() - 0.5) * 0.2;
            group.current.position.y = yOffset + (Math.random() - 0.5) * 0.2;
        } else {
            // Smooth return to center (yOffset handled by parent pos ultimately but local pos relative to group center)
            group.current.position.x = 0;
            group.current.position.y = yOffset;
        }
    });


    return (
        <group ref={group} dispose={null} position={[0, yOffset, 0]} rotation={rotation} scale={[scale, scale, scale]}>
            <primitive object={clone} />
        </group>
    );
};

const Monster = ({ position, word, typed, variant = 'GHOUL', isTargeted }) => {
    // Detect hit for Jitter
    const [isHit, setIsHit] = useState(false);
    const prevTypedLength = useRef(typed.length);

    useEffect(() => {
        if (typed.length > prevTypedLength.current) {
            setIsHit(true);
            const timer = setTimeout(() => setIsHit(false), 150);
            return () => clearTimeout(timer);
        }
        prevTypedLength.current = typed.length;
    }, [typed]);

    return (
        <group position={position}>
            <MonsterModel variant={variant} isHit={isHit} />

            {/* Visual Target Indicator */}
            {isTargeted && (
                <group position={[0, 4.5, 0]}>
                    <Html center transform={false} distanceFactor={10} zIndexRange={[100, 0]}>
                        <div className="animate-bounce">
                            <ArrowDown className="w-12 h-12 text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
                        </div>
                    </Html>
                </group>
            )}

            {/* HTML Label for Word */}
            <group position={[0, 3.5, 0]}>
                <Html center transform distanceFactor={15}>
                    <div className={`
                        px-4 py-2 rounded-lg font-mono text-2xl font-bold tracking-widest whitespace-nowrap
                        ${isTargeted ? 'bg-black/60 border-2 border-red-500 shadow-[0_0_20px_rgba(220,38,38,0.6)] box-border' : 'bg-black/40 border border-white/20'}
                        backdrop-blur-sm transition-all duration-200
                    `}>
                        <span className="text-red-500 text-shadow-blood">{typed}</span>
                        <span className="text-white drop-shadow-md">{word.slice(typed.length)}</span>
                    </div>
                </Html>
            </group>
        </group>
    );
};

export default Monster;
