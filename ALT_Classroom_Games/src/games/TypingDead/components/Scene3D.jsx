import { useRef } from 'react';
import { PerspectiveCamera, Stars, Plane, CameraShake, SpotLight } from '@react-three/drei';
import Monster from './Monster';
import Projectile from './Projectile';
import Explosion from './Explosion';
import BloodSplatter from './BloodSplatter';
import Environment from './Environment';

import BossMonster from './BossMonster';

const Scene3D = ({ monsters, boss, projectiles, explosions, bloodSplatters, shakeIntensity }) => {
    return (
        <>
            <PerspectiveCamera makeDefault position={[0, 2, 5]} />

            {/* Global Ambient Light - Dimmed for atmosphere */}
            <ambientLight intensity={1.5} color="#444466" />

            {/* Hemisphere Light for natural sky/ground fill */}
            <hemisphereLight skyColor="#88aaff" groundColor="#000000" intensity={0.5} />

            {/* Moonlight (Cool Blue/White) - Key Light */}
            <directionalLight
                position={[20, 30, 10]}
                intensity={2.0}
                color="#aabbff"
                castShadow
                shadow-bias={-0.001}
            />

            {/* Dramatic Rim Light */}
            <spotLight
                position={[0, 10, -20]}
                angle={1.0}
                penumbra={0.5}
                intensity={4.0}
                color="#aa88ff"
                distance={80}
            />

            {/* Atmosphere & Environment */}
            <fog attach="fog" args={['#3b4c5a', 5, 25]} />
            <Environment />
            <CameraShake
                maxYaw={0.05}
                maxPitch={0.05}
                maxRoll={0.05}
                yawFrequency={shakeIntensity * 10}
                pitchFrequency={shakeIntensity * 10}
                rollFrequency={shakeIntensity * 10}
                intensity={shakeIntensity}
                decay={true}
                decayRate={0.65}
            />

            <color attach="background" args={['#3b4c5a']} />

            {/* Boss */}
            {boss && <BossMonster {...boss} />}

            {/* Monsters */}
            {monsters.map(monster => (
                <Monster
                    key={monster.id}
                    {...monster}
                />
            ))}

            {/* Projectiles */}
            {projectiles && projectiles.map(p => (
                <Projectile
                    key={p.id}
                    position={p.position}
                    word={p.word}
                    typed={p.typed}
                />
            ))}

            {/* Explosions */}
            {explosions && explosions.map(e => (
                <Explosion key={e.id} position={e.position} color={e.color} />
            ))}

            {/* Blood Splatters */}
            {bloodSplatters && bloodSplatters.map(s => (
                <BloodSplatter key={s.id} position={s.position} />
            ))}
        </>
    );
};

export default Scene3D;

