import { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { ArrowDown } from 'lucide-react';
import { MonsterModel } from './Monster'; // Import shared model

const BossMonster = ({ position, words, currentWordIndex, typed, isTargeted }) => {
    const groupRef = useRef();

    // Detect hit for Jitter (reuse logic from Monster)
    const [isHit, setIsHit] = useState(false);
    const prevTypedLength = useRef(typed.length);
    const prevWordIndex = useRef(currentWordIndex);

    useEffect(() => {
        // Hit detection on typing or word completion
        if (typed.length > prevTypedLength.current || currentWordIndex > prevWordIndex.current) {
            setIsHit(true);
            const timer = setTimeout(() => setIsHit(false), 150);
            return () => clearTimeout(timer);
        }
        prevTypedLength.current = typed.length;
        prevWordIndex.current = currentWordIndex;
    }, [typed, currentWordIndex]);


    useEffect(() => {
        console.log("BossMonster Mounted", { position, currentWordIndex, word: words?.[currentWordIndex] });
    }, [currentWordIndex, words]);

    const currentWord = words && words[currentWordIndex];
    if (!currentWord) {
        console.warn("BossMonster: Word Missing", { words, currentWordIndex });
        return null; // Or return just the model without text
    }

    return (
        <group ref={groupRef} position={position} scale={[1, 1, 1]}>
            {/* Reset Group Scale to 1.0 to simplify math */}

            {/* Use Shared Component - Forces Variant BOSS with standard scale first */}
            <MonsterModel variant="BOSS" customScale={0.3} isHit={isHit} />

            {/* Visual Target Indicator */}
            {isTargeted && (
                <group position={[0, 5.5, 0]}>
                    <Html center transform={false} distanceFactor={10} zIndexRange={[100, 0]}>
                        <div className="animate-bounce">
                            <ArrowDown className="w-16 h-16 text-yellow-500 drop-shadow-[0_0_10px_rgba(234,179,8,0.8)]" />
                        </div>
                    </Html>
                </group>
            )}

            {/* HIT BOX HTML */}
            <group position={[0, 4.5, 0]}>
                <Html center transform distanceFactor={40}>
                    <div className={`
                        px-4 py-2 rounded-xl font-mono text-2xl font-black tracking-widest whitespace-nowrap
                        ${isTargeted ? 'bg-black/80 border-4 border-yellow-500 shadow-[0_0_30px_rgba(234,179,8,0.6)]' : 'bg-black/60 border-2 border-white/20'}
                        backdrop-blur-md transition-all duration-200 flex flex-col items-center gap-2
                    `}>
                        {/* Word Progress */}
                        <div>
                            <span className="text-yellow-500 text-shadow-blood">{typed}</span>
                            <span className="text-white drop-shadow-md">{currentWord.slice(typed.length)}</span>
                        </div>

                        {/* Boss HP Bar visual (optional addition since we have the data) */}
                        <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden mt-1">
                            <div
                                className="h-full bg-red-600 transition-all duration-500"
                                style={{ width: `${((words.length - currentWordIndex) / words.length) * 100}%` }}
                            />
                        </div>
                    </div>
                </Html>
            </group>

        </group>
    );
};

export default BossMonster;
