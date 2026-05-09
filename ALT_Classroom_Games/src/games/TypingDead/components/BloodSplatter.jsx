import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Instance, Instances } from '@react-three/drei';
import * as THREE from 'three';

const BloodSplatter = ({ position }) => {
    // Generate particles for a single splatter
    const particleCount = 15;
    const particles = useMemo(() => {
        const temp = [];
        for (let i = 0; i < particleCount; i++) {
            // Random direction in a cone facing up/out
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI * 0.5; // Hemisphere

            const speed = 2 + Math.random() * 3;
            const velocity = new THREE.Vector3(
                Math.sin(phi) * Math.cos(theta),
                Math.cos(phi), // Upward
                Math.sin(phi) * Math.sin(theta)
            ).multiplyScalar(speed);

            temp.push({
                velocity,
                scale: 0.05 + Math.random() * 0.1,
                offset: new THREE.Vector3(
                    (Math.random() - 0.5) * 0.2,
                    (Math.random() - 0.5) * 0.2,
                    (Math.random() - 0.5) * 0.2
                )
            });
        }
        return temp;
    }, []);

    return (
        <group position={position}>
            <Instances range={particleCount}>
                <sphereGeometry args={[1, 8, 8]} />
                <meshStandardMaterial color="#880000" roughness={0.1} metalness={0.5} />
                {particles.map((data, i) => (
                    <Particle
                        key={i}
                        initialVelocity={data.velocity}
                        initialScale={data.scale}
                        offset={data.offset}
                    />
                ))}
            </Instances>
        </group>
    );
};

const Particle = ({ initialVelocity, initialScale, offset }) => {
    const ref = useRef();
    const velocity = useRef(initialVelocity.clone());

    useFrame((state, delta) => {
        if (!ref.current) return;

        // Gravity
        velocity.current.y -= 9.8 * delta;

        // Move
        ref.current.position.add(velocity.current.clone().multiplyScalar(delta));

        // Shrink
        if (ref.current.scale.x > 0) {
            const shrink = 1.0 * delta;
            ref.current.scale.subScalar(shrink);
        }

        // Floor Splat logic could go here (if y < 0, stop and flatten)
        if (ref.current.position.y < -1) {
            ref.current.scale.set(0, 0, 0); // Hide below ground
        }
    });

    return (
        <Instance
            ref={ref}
            position={offset}
            scale={[initialScale, initialScale, initialScale]}
        />
    );
};

export default BloodSplatter;
