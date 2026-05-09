
import os
import re

# 1. Create ThreeDice.jsx
three_dice_path = r"d:\ALT_Classroom_Games\src\components\ThreeDice.jsx"
three_dice_code = r"""import { Canvas, useFrame } from '@react-three/fiber';
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

function Dice({ onRollComplete, isRolling, triggerRoll }) {
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

  useFrame(() => {
    if (!triggerRoll && isRolling) {
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
        <FaceDots number={2} position={[0, 0, 0]} rotation={[-Math.PI/2, 0, 0]} />
        <FaceDots number={5} position={[0, 0, 0]} rotation={[Math.PI/2, 0, 0]} />
        <FaceDots number={3} position={[0, 0, 0]} rotation={[0, Math.PI/2, 0]} />
        <FaceDots number={4} position={[0, 0, 0]} rotation={[0, -Math.PI/2, 0]} />
    </group>
  );
}

export default function ThreeDice({ rolling, onResult }) {
    const [lastRollTime, setLastRollTime] = useState(0);
    const [internalRolling, setInternalRolling] = useState(false);
    
    useEffect(() => {
        if (rolling) {
            setLastRollTime(Date.now());
            setInternalRolling(true);
        }
    }, [rolling]);

    const handleComplete = (result) => {
        if (internalRolling) {
             setInternalRolling(false);
             setTimeout(() => onResult(result), 500);
        }
    };

    return (
        <div className="w-full h-full"> 
            <Canvas shadows camera={{ position: [0, 5, 5], fov: 50 }}>
                <ambientLight intensity={0.5} />
                <spotLight position={[10, 10, 10]} angle={0.5} penumbra={1} castShadow intensity={2} />
                <Environment preset="studio" />
                <Physics>
                    <Dice triggerRoll={rolling} isRolling={internalRolling} onRollComplete={handleComplete} />
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
"""

with open(three_dice_path, 'w', encoding='utf-8') as f:
    f.write(three_dice_code)

print(f"Created {three_dice_path}")

# 2. Modify SnakesAndLadders.jsx
sl_path = r"d:\ALT_Classroom_Games\src\games\SnakesAndLadders.jsx"
with open(sl_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Add Import
if "ThreeDice" not in content:
    content = "import ThreeDice from '../components/ThreeDice';\n" + content

# Add isRolling state
if "const [isRolling, setIsRolling] = useState(false);" not in content:
    content = content.replace("const [won, setWon] = useState(false);", "const [won, setWon] = useState(false);\n    const [isRolling, setIsRolling] = useState(false);")

# Update rollDice function
roll_dice_pattern = r"const rollDice = \(\) => \{.+?\};"
roll_dice_replacement = r"""const rollDice = () => {
        if (won || isRolling) return;
        soundManager.play('click');
        setIsRolling(true);
    };

    const handleDiceRollComplete = (value) => {
        setIsRolling(false);
        setDiceValue(value);
        movePlayer(currentPlayer, value);
    };"""

content = re.sub(roll_dice_pattern, roll_dice_replacement, content, flags=re.DOTALL)

# Update UI
button_pattern = r"<button\s+onClick=\{rollDice\}.+?>.+?</button>"
ui_replacement = r"""
                <div className="w-64 h-64 bg-slate-800/50 rounded-3xl overflow-hidden shadow-inner border-2 border-white/10 relative">
                     <ThreeDice rolling={isRolling} onResult={handleDiceRollComplete} />
                     {!isRolling && !won && (
                        <div className="absolute bottom-4 left-0 w-full text-center pointer-events-none">
                            <span className="text-white/50 text-sm font-bold uppercase tracking-widest">Tap Dice to Roll</span>
                        </div>
                     )}
                     <div 
                        className="absolute inset-0 cursor-pointer z-10" 
                        onClick={rollDice}
                     />
                </div>
"""

content = re.sub(button_pattern, ui_replacement, content, flags=re.DOTALL)

with open(sl_path, 'w', encoding='utf-8') as f:
    f.write(content)

print(f"Modified {sl_path}")
