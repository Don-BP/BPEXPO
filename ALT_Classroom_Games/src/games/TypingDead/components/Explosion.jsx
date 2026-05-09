import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const Explosion = ({ position, color }) => {
    const group = useRef();
    const particleCount = 20;

    // Create random velocities for particles
    const particles = useMemo(() => {
        return new Array(particleCount).fill(0).map(() => ({
            position: [
                (Math.random() - 0.5) * 0.5,
                (Math.random() - 0.5) * 0.5,
                (Math.random() - 0.5) * 0.5
            ],
            velocity: [
                (Math.random() - 0.5) * 5, // Faster expansion
                (Math.random() - 0.5) * 5,
                (Math.random() - 0.5) * 5
            ],
            scale: Math.random() * 0.4 + 0.1,
            rotation: [Math.random() * Math.PI, Math.random() * Math.PI, 0]
        }));
    }, []);

    useFrame((state, delta) => {
        if (!group.current) return;

        // Animate children (particles)
        group.current.children.forEach((mesh, i) => {
            const p = particles[i];
            mesh.position.x += p.velocity[0] * delta;
            mesh.position.y += p.velocity[1] * delta;
            mesh.position.z += p.velocity[2] * delta;

            // Gravity effect
            p.velocity[1] -= 5 * delta;

            mesh.rotation.x += delta * 2;
            mesh.rotation.y += delta * 2;

            mesh.scale.multiplyScalar(0.92); // Shrink faster
        });
    });

    return (
        <group ref={group} position={position}>
            {particles.map((p, i) => (
                <mesh key={i} position={p.position} rotation={p.rotation} scale={[p.scale, p.scale, p.scale]}>
                    <boxGeometry args={[0.5, 0.5, 0.5]} />
                    <meshStandardMaterial
                        color={color}
                        transparent
                        opacity={1}
                        emissive={color}
                        emissiveIntensity={2}
                    />
                </mesh>
            ))}
        </group>
    );
};

export default Explosion;
