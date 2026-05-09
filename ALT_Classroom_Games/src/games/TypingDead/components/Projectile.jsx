import { useRef } from 'react';
import { Html } from '@react-three/drei';
import { Target } from 'lucide-react'; // Maybe a small target icon instead of big arrow

const Projectile = ({ position, word = '', typed = '', isTargeted }) => {
    // SAFEGUARD: If word is missing (e.g. lingering ref), don't render or crash
    if (!word) return null;

    return (
        <group position={position}>
            {/* Sphere Model */}
            <mesh>
                <sphereGeometry args={[0.3, 16, 16]} />
                <meshStandardMaterial
                    color={isTargeted ? "#ef4444" : "#f97316"}
                    emissive={isTargeted ? "#ef4444" : "#dc2626"}
                    emissiveIntensity={isTargeted ? 2.0 : 0.8}
                />
            </mesh>

            {/* Target Indicator for Projectiles */}
            {isTargeted && (
                <group position={[0, 0, 0]}>
                    {/* Halo or simple Ring */}
                    <mesh rotation={[Math.PI / 2, 0, 0]}>
                        <torusGeometry args={[0.5, 0.05, 16, 32]} />
                        <meshBasicMaterial color="red" />
                    </mesh>
                </group>
            )}

            {/* HTML Overlay */}
            <group position={[0, 0.5, 0]}>
                <Html center transform distanceFactor={15} zIndexRange={[50, 0]}>
                    <div className={`
                        px-2 py-1 rounded font-mono text-sm font-bold tracking-widest whitespace-nowrap
                        ${isTargeted ? 'bg-black/80 border border-red-500' : 'bg-black/40 border border-white/20'}
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

export default Projectile;
