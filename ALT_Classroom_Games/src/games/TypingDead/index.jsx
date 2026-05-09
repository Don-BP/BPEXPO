import React, { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Heart, Skull, Timer, Trophy, ArrowLeft, Plus, Bomb, Clock, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import Scene3D from './components/Scene3D';
import { WORD_LISTS } from './data/words';
import { soundManager } from '../../utils/sound';

const GAME_STATES = {
    MENU: 'MENU',
    PLAYING: 'PLAYING',
    GAME_OVER: 'GAME_OVER',
    VICTORY: 'VICTORY'
};

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error("TypingDead Error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return <div className="text-red-500 font-bold p-10 text-center">Something went wrong loading the game world.<br />Check console for details.</div>;
        }

        return this.props.children;
    }
}

const TypingDead = () => {
    // --- REACT STATE (For Rendering UI) ---
    const [viewState, setViewState] = useState(GAME_STATES.MENU);
    const [score, setScore] = useState(0);
    const [health, setHealth] = useState(100);
    const [renderMonsters, setRenderMonsters] = useState([]); // Synced from logic for rendering
    const [renderProjectiles, setRenderProjectiles] = useState([]); // Synced from logic
    const [renderExplosions, setRenderExplosions] = useState([]); // Visual FX
    const [renderBlood, setRenderBlood] = useState([]); // Blood Splatters
    const [renderBoss, setRenderBoss] = useState(null); // Boss State
    const [inventory, setInventory] = useState([null, null, null]);
    const [activeEffects, setActiveEffects] = useState({ slowMo: false, shield: false });
    const [gameMode, setGameMode] = useState('STORY');
    const [difficulty, setDifficulty] = useState('MEDIUM');
    const [timeRemaining, setTimeRemaining] = useState(60);
    const [kills, setKills] = useState(0);

    // Feedback State
    const [shakeIntensity, setShakeIntensity] = useState(0);
    const [hitFlash, setHitFlash] = useState(false);

    // --- GAME LOGIC STATE (Refs for stability) ---
    // These hold the "True" state of the game loop to avoid React closure staleness
    const gameStateRef = useRef(GAME_STATES.MENU);
    const monstersRef = useRef([]);
    const bossRef = useRef(null); // Boss Logic
    const projectilesRef = useRef([]);
    const targetIdRef = useRef(null);
    const lastSpawnTimeRef = useRef(0);
    const lastDamageTimeRef = useRef(0); // For flash cooldown/reset
    const killsRef = useRef(0); // Immediate kill count for logic

    // Shake Ref for smooth decay in loop
    const shakeRef = useRef(0);

    // Config Refs (mirrors of state to be accessible in loop)
    const difficultyRef = useRef('MEDIUM');
    const gameModeRef = useRef('STORY');
    const activeEffectsRef = useRef({ slowMo: false, shield: false });

    // Sync Config Refs
    useEffect(() => { difficultyRef.current = difficulty; }, [difficulty]);
    useEffect(() => { gameModeRef.current = gameMode; }, [gameMode]);
    useEffect(() => { activeEffectsRef.current = activeEffects; }, [activeEffects]);

    // Sync Kills Ref on restart
    useEffect(() => {
        if (kills === 0) killsRef.current = 0;
    }, [kills]);

    // --- GAME LOOP ---
    const updateGame = useCallback(() => {
        if (gameStateRef.current !== GAME_STATES.PLAYING) return;

        const now = Date.now();
        const diff = difficultyRef.current;
        const mode = gameModeRef.current;
        const effects = activeEffectsRef.current;
        const currentKills = killsRef.current;

        const speedMultiplier = effects.slowMo ? 0 : 1;
        let currentSpawnRate = 2000;
        if (mode === 'ENDLESS') currentSpawnRate = Math.max(500, 2000 - (currentKills * 20));

        // BOSS SPAWN LOGIC (STORY MODE)
        // Spawn Boss after 20 kills if not already spawned
        if (mode === 'STORY' && currentKills >= 20 && !bossRef.current && monstersRef.current.length === 0) {
            // Spawn Boss
            const bossWords = ['APOCALYPSE', 'NIGHTMARE', 'ETERNAL', 'DARKNESS', 'VICTORY'];
            bossRef.current = {
                id: 'BOSS',
                type: 'BOSS',
                words: bossWords,
                currentWordIndex: 0,
                typed: '',
                position: [0, 0, -15], // Closer (was -25) so text is readable
                speed: 0.01, // Very slow
                lastAttack: 0,
                lastProjectile: 0, // NEW: Separate timer for ranged
                maxHp: bossWords.length,
                hp: bossWords.length
            };
            soundManager.play('growl'); // Boss Roar (using growl as placeholder)
        }

        // Regular Spawning (Only if no Boss and Total Enemies < 20)
        // Checks 'kills' + 'active monsters' to ensure we stop exactly at 20
        const maxMonsters = diff === 'HARD' ? 8 : diff === 'MEDIUM' ? 5 : 3;
        const totalEnemies = currentKills + monstersRef.current.length;

        if (!bossRef.current && totalEnemies < 20 && monstersRef.current.length < maxMonsters && (now - lastSpawnTimeRef.current > (currentSpawnRate / speedMultiplier))) {
            lastSpawnTimeRef.current = now;

            // Logic
            let typeWeights = diff === 'EASY' ? [0.8, 0.2, 0] : diff === 'MEDIUM' ? [0.5, 0.4, 0.1] : [0.3, 0.4, 0.3];
            const roll = Math.random();
            let type = roll > (typeWeights[0] + typeWeights[1]) ? 'HEAVY' : roll > typeWeights[0] ? 'MEDIUM' : 'LIGHT';

            const wordList = type === 'HEAVY' ? WORD_LISTS.HARD : type === 'MEDIUM' ? WORD_LISTS.MEDIUM : WORD_LISTS.EASY;
            const word = wordList[Math.floor(Math.random() * wordList.length)];

            // ... (rest is fine)
            // But need to grab the rest of the block to close it properly if I cut spawn logic here.
            // Actually I'll just replace the Condition Line.

            // Side Spawns (Zip out from edges)
            const side = Math.random() > 0.5 ? 1 : -1;
            const x = side * (6 + Math.random() * 6); // +/- 6 to 12 (Wide start)

            // Difficulty Based Z-Distance
            let zStart = -20;
            if (type === 'LIGHT') zStart = -15 - (Math.random() * 5);
            else if (type === 'MEDIUM') zStart = -20 - (Math.random() * 10);
            else zStart = -25 - (Math.random() * 5);

            // Random Variant (Using New Naming Scheme)
            const variants = ['GHOUL', 'SKELETON', 'FLYING_BAT', 'GHOST', 'FLYING_BUG', 'MONSTER'];
            const variantWeight = Math.random();
            let variant = 'GHOUL';

            if (variantWeight > 0.85) variant = 'FLYING_BUG';
            else if (variantWeight > 0.7) variant = 'FLYING_BAT';
            else if (variantWeight > 0.55) variant = 'GHOST';
            else if (variantWeight > 0.4) variant = 'MONSTER';
            else if (variantWeight > 0.25) variant = 'SKELETON';

            monstersRef.current.push({
                id: now + Math.random(),
                type,
                word,
                variant,
                typed: '',
                position: [x, 0, zStart],
                speed: (type === 'LIGHT' ? 0.08 : type === 'MEDIUM' ? 0.05 : 0.03)
            });
        }

        // 2. BEHAVIOR (Boss & Monsters)
        let hpDamage = 0;
        let shieldHit = false;

        // --- BOSS BEHAVIOR ---
        if (bossRef.current) {
            const boss = bossRef.current;
            // Move
            if (boss.position[2] < 2) {
                boss.position[2] += boss.speed * speedMultiplier;
            } else {
                // Boss Melee Range - Massive Damage
                if (now - boss.lastAttack > 2000) {
                    boss.lastAttack = now;
                    hpDamage += 50;
                    shakeRef.current = 2.0;
                    soundManager.play('wrong'); // Crunch
                }
            }

            // Boss Ranged Attacks (Constant pressure)
            // Limit: Max 3 projectiles on screen, Min 2s cooldown
            const activeBossProjectiles = projectilesRef.current.filter(p => p.isBossProjectile).length;

            if (activeBossProjectiles < 3 && (now - (boss.lastProjectile || 0) > 2000)) {
                if (Math.random() < 0.05) { // reduced chance per frame as well, to be safe
                    boss.lastProjectile = now; // UPDATE TIMER!
                    const pWord = WORD_LISTS.EASY[Math.floor(Math.random() * WORD_LISTS.EASY.length)];
                    projectilesRef.current.push({
                        id: now + Math.random(),
                        position: [boss.position[0], boss.position[1] + 2, boss.position[2]],
                        isBossProjectile: true,
                        word: pWord,
                        typed: ''
                    });
                }
            }
        }

        // --- MONSTER BEHAVIOR ---
        monstersRef.current = monstersRef.current.filter(m => {
            // Ranged Attack (Small chance)
            if (m.type !== 'LIGHT' && now - m.lastAttack > 2000) {
                if (Math.random() < 0.02) {
                    m.lastAttack = now;
                    const pWord = WORD_LISTS.EASY[Math.floor(Math.random() * WORD_LISTS.EASY.length)];
                    projectilesRef.current.push({
                        id: now + Math.random(),
                        position: [...m.position],
                        word: pWord,
                        typed: ''
                    });
                }
            }

            if (m.attacking) {
                if (now - m.attacking > 500) {
                    if (effects.shield && !shieldHit) {
                        shieldHit = true;
                        soundManager.play('shieldBase');
                        if (targetIdRef.current === m.id) targetIdRef.current = null;
                        shakeRef.current = 0.5;
                    } else {
                        hpDamage += (m.type === 'HEAVY' ? 30 : m.type === 'MEDIUM' ? 20 : 10);
                        if (targetIdRef.current === m.id) targetIdRef.current = null;
                        shakeRef.current = 1.0;
                    }
                    return false;
                }
            } else {
                // MOVEMENT
                const speed = m.speed * speedMultiplier;
                const newZ = m.position[2] + speed;
                // Move towards center X=0 faster to "zip" in, but respect time!
                const moveRatio = 1 - (0.01 * speedMultiplier);
                const newX = m.position[0] * moveRatio;
                m.position = [newX, m.position[1], newZ];

                if (newZ > 2.0) {
                    m.attacking = now;
                }
            }
            return true;
        });

        // 3. PROJECTILES
        projectilesRef.current = projectilesRef.current.filter(p => {
            const speed = p.isBossProjectile ? 0.1 : 0.08; // Restored to previous speed
            const newZ = p.position[2] + speed * speedMultiplier;
            p.position = [p.position[0], p.position[1], newZ];

            if (newZ > 2) {
                if (effects.shield && !shieldHit) {
                    shieldHit = true;
                    soundManager.play('shieldBase');
                    shakeRef.current = 0.5;
                } else {
                    hpDamage += (p.isBossProjectile ? 10 : 5); // Reduced damage (was 25/10)
                    shakeRef.current = (p.isBossProjectile ? 1.5 : 0.8);
                }
                return false;
            }
            return true;
        });

        // 3. APPLY UPDATES
        if (shieldHit) {
            setActiveEffects(prev => ({ ...prev, shield: false }));
        }

        if (hpDamage > 0) {
            soundManager.play('wrong');
            setHitFlash(true);
            setTimeout(() => setHitFlash(false), 150);

            setHealth(prev => {
                const newH = Math.max(0, prev - hpDamage);
                if (newH <= 0) endGame(GAME_STATES.GAME_OVER);
                return newH;
            });
        }

        if (shakeRef.current > 0) {
            shakeRef.current = Math.max(0, shakeRef.current - 0.05);
        }

        // 4. SYNC TO RENDER
        setRenderMonsters(monstersRef.current.map(m => ({
            ...m,
            isTargeted: m.id === targetIdRef.current
        })));
        setRenderProjectiles(projectilesRef.current.map(p => ({
            ...p,
            isTargeted: p.id === targetIdRef.current
        })));
        // Sync Boss
        setRenderBoss(bossRef.current ? {
            ...bossRef.current,
            isTargeted: bossRef.current.id === targetIdRef.current
        } : null);
        setShakeIntensity(shakeRef.current);

    }, [kills]);

    // Loop Interval
    useEffect(() => {
        if (viewState !== GAME_STATES.PLAYING) return;
        const interval = setInterval(updateGame, 33);
        return () => clearInterval(interval);
    }, [viewState, updateGame]);


    // --- ITEM LOGIC ---
    const useItem = (index) => {
        if (!inventory[index]) return;

        const item = inventory[index];
        console.log("Using Item:", item.type);
        soundManager.play('switch'); // Placeholder sound

        // Consume Item
        const newInv = [...inventory];
        newInv[index] = null;
        setInventory(newInv);

        // Apply Effect
        switch (item.type) {
            case 'NUKE':
                soundManager.play('tornado'); // Big boom sound
                // Kill all visible
                const killCount = monstersRef.current.length;
                // Trigger explosions for all
                const now = Date.now();
                const newExplosions = monstersRef.current.map((m, i) => ({
                    id: now + i,
                    position: m.position,
                    color: '#ff0000'
                }));
                setRenderExplosions(prev => [...prev, ...newExplosions]);

                // Clear Monsters
                monstersRef.current = [];
                setRenderMonsters([]);

                // Score
                setScore(s => s + (killCount * 100));
                setKills(k => k + killCount);
                break;

            case 'slomo': // Case insensitive just in case
            case 'SLOW_MO':
                soundManager.play('freeze');
                // Update State (Effect will sync to Ref)
                setActiveEffects(prev => ({ ...prev, slowMo: true }));
                setTimeout(() => {
                    setActiveEffects(prev => ({ ...prev, slowMo: false }));
                }, 10000); // 10s Freeze
                break;

            case 'HEALTH':
                soundManager.play('heal');
                setHealth(h => Math.min(100, h + 25)); // It is setHealth, not setHp?
                // Ah! Line 20: const [health, setHealth] = useState(100);
                // The error was "setHp is not defined". User report said setHp.
                // My code used `setHp` in `useItem` (Step 262 line 349).
                // I need to change it to `setHealth`.
                break;

            case 'SHIELD':
                soundManager.play('shield');
                setActiveEffects(prev => ({ ...prev, shield: true }));
                // Auto expire shield? Or hit based? Logic handles hit based expiration.
                // But let's give it a duration too?
                // For now just set Shield.
                // Also heal?
                setHealth(100);
                break;

            default:
                break;
        }
    };


    // --- INPUT HANDLING ---
    useEffect(() => {
        if (viewState !== GAME_STATES.PLAYING) return;

        const handleKeyDown = (e) => {
            // TAB: Cycle Targets
            if (e.key === 'Tab') {
                e.preventDefault();

                // 1. Gather ALL Valid Targets
                let allTargets = [];

                // Boss (Priority?)
                if (bossRef.current) {
                    allTargets.push({ ...bossRef.current, _source: 'BOSS', _sortZ: bossRef.current.position[2] });
                }

                // Monsters
                monstersRef.current.forEach(m => {
                    allTargets.push({ ...m, _source: 'MONSTER', _sortZ: m.position[2] });
                });

                // Projectiles (High Priority to cycle to?)
                projectilesRef.current.forEach(p => {
                    allTargets.push({ ...p, _source: 'PROJECTILE', _sortZ: p.position[2] });
                });

                if (allTargets.length === 0) return;

                // 2. Sort Targets (Left to Right X, then Close Z?)
                // Actually simply Closeness (Z) is best for panic typing.
                // Let's do: Closest (Highest Z) to Furthest (Lowest Z)
                allTargets.sort((a, b) => b._sortZ - a._sortZ);

                // 3. Find Current Index
                let currentIndex = -1;
                if (targetIdRef.current) {
                    currentIndex = allTargets.findIndex(t => t.id === targetIdRef.current);
                }

                // 4. Cycle Next
                let nextIndex = currentIndex + 1;
                if (nextIndex >= allTargets.length) nextIndex = 0;

                const nextTarget = allTargets[nextIndex];
                targetIdRef.current = nextTarget.id;
                soundManager.play('click'); // Click sound for switch

                // 5. Force Update UI
                if (bossRef.current) setRenderBoss({ ...bossRef.current, isTargeted: bossRef.current.id === nextTarget.id });
                setRenderMonsters(monstersRef.current.map(m => ({ ...m, isTargeted: m.id === nextTarget.id })));
                setRenderProjectiles(projectilesRef.current.map(p => ({ ...p, isTargeted: p.id === nextTarget.id })));

                return;
            }

            // ITEM USAGE (1, 2, 3)
            if (['1', '2', '3'].includes(e.key)) {
                const index = parseInt(e.key) - 1;
                useItem(index);
                return;
            }

            const char = e.key.toUpperCase();
            // Allow A-Z and Space
            if (!/^[A-Z ]$/.test(char)) return; // Only letters for typing

            // BOSS INPUT LOGIC (Refactored to allow multitasking)
            // Function to check if we can target something new
            // Priorities: Projectiles (Immediate threat) > Monsters > Boss

            let activeTarget = null;
            if (targetIdRef.current) {
                if (targetIdRef.current === 'BOSS' && bossRef.current) activeTarget = bossRef.current;
                else {
                    activeTarget = projectilesRef.current.find(p => p.id === targetIdRef.current) ||
                        monstersRef.current.find(m => m.id === targetIdRef.current);
                }
            }

            // Lock validation
            if (activeTarget) {
                // Get expected char
                let expected = '';
                if (activeTarget.type === 'BOSS') {
                    expected = activeTarget.words[activeTarget.currentWordIndex][activeTarget.typed.length];
                } else {
                    expected = activeTarget.word[activeTarget.typed.length];
                }

                if (char === expected) {
                    // Correct Input
                    activeTarget.typed += char;
                    soundManager.play('click');

                    // Check Completion
                    let isComplete = false;
                    if (activeTarget.type === 'BOSS') {
                        if (activeTarget.typed === activeTarget.words[activeTarget.currentWordIndex]) isComplete = true;
                    } else {
                        if (activeTarget.typed === activeTarget.word) isComplete = true;
                    }

                    if (isComplete) {
                        // HANDLE DEATH / NEXT WORD
                        if (activeTarget.type === 'BOSS') {
                            soundManager.play('pop');
                            activeTarget.currentWordIndex++;
                            activeTarget.typed = '';
                            activeTarget.hp--;
                            shakeRef.current = 0.5;
                            if (activeTarget.currentWordIndex >= activeTarget.words.length) {
                                soundManager.play('tornado');
                                bossRef.current = null;
                                setScore(s => s + 5000);
                                endGame(GAME_STATES.VICTORY);
                            }
                        } else {
                            // Monster or Projectile
                            soundManager.play('pop');

                            if (activeTarget.isBossProjectile || activeTarget.word) {
                                // It's a projectile (check flag or structure) - wait, projectiles share structure now?
                                // Verify it's a projectile by checking projectilesRef
                                if (projectilesRef.current.some(p => p.id === activeTarget.id)) {
                                    // Destroy Projectile
                                    projectilesRef.current = projectilesRef.current.filter(p => p.id !== activeTarget.id);
                                    setScore(s => s + 50);
                                } else {
                                    // Destroy Monster
                                    // (Existing monster kill logic logic... need to copy it here or set a flag)
                                    // To keep it clean, let's just trigger the kill effect here
                                    const killPos = activeTarget.position;
                                    const killColor = activeTarget.type === 'HEAVY' ? '#ef4444' : activeTarget.type === 'MEDIUM' ? '#eab308' : '#22c55e';
                                    const expId = Date.now();
                                    setRenderExplosions(prev => [...prev, { id: expId, position: killPos, color: killColor }]);
                                    setTimeout(() => setRenderExplosions(prev => prev.filter(e => e.id !== expId)), 1000);

                                    // Blood Splatter Logic
                                    if (Math.random() < 0.7) { // 70% chance
                                        const bloodId = Date.now() + Math.random();
                                        setRenderBlood(prev => {
                                            const next = [...prev, {
                                                id: bloodId,
                                                position: [killPos[0], -0.9, -15 + Math.random() * 10]
                                            }];
                                            if (next.length > 20) return next.slice(next.length - 20);
                                            return next;
                                        });
                                    }

                                    // Remove Monster
                                    monstersRef.current = monstersRef.current.filter(m => m.id !== activeTarget.id);
                                    killsRef.current += 1; // Update Logic Ref
                                    setKills(k => k + 1);
                                    setScore(s => s + (activeTarget.type === 'HEAVY' ? 300 : 100));

                                    // Loot Drop check
                                    if (Math.random() < 0.3) { // 30% chance
                                        setInventory(inv => {
                                            const emptyIdx = inv.findIndex(item => item === null);
                                            if (emptyIdx !== -1) {
                                                // Generate Item
                                                const lootType = Math.random();
                                                let newItem = null;
                                                if (lootType < 0.4) newItem = { type: 'HEALTH', icon: <Heart className="text-red-500" /> };
                                                else if (lootType < 0.7) newItem = { type: 'SLOW_MO', icon: <Clock className="text-blue-500" /> };
                                                else if (lootType < 0.9) newItem = { type: 'SHIELD', icon: <Shield className="text-cyan-500" /> };
                                                else newItem = { type: 'NUKE', icon: <Bomb className="text-yellow-500" /> }; // Rare

                                                soundManager.play('bonus'); // Pickup sound

                                                const newInv = [...inv];
                                                newInv[emptyIdx] = newItem;
                                                return newInv;
                                            }
                                            return inv; // Full
                                        });
                                    }
                                }
                            }
                            targetIdRef.current = null; // Free to target new
                        }
                    }
                    // Immediate Sync (Optimized ref updates)
                    if (activeTarget.type === 'BOSS') {
                        // Check if activeTarget is actually the ref object or a copy. 
                        // In handleKeyDown 'activeTarget' was a reference to the obj in projectile/monster array or bossRef.
                        // So modifying it there modified the ref.
                        if (bossRef.current) setRenderBoss({ ...bossRef.current, isTargeted: bossRef.current.id === targetIdRef.current });
                    }
                    else {
                        setRenderMonsters([...monstersRef.current]);
                        setRenderProjectiles([...projectilesRef.current]);
                    }
                }
                return; // Input consumed by locked target
            }

            // No active target or mismatch (if we allowed switching on mismatch, but we strictly lock)
            // ACQUIRE TARGET
            if (!activeTarget) {
                // Check Projectiles First
                const projCandidates = projectilesRef.current.filter(p => p.word && p.word.startsWith(char));
                if (projCandidates.length > 0) {
                    projCandidates.sort((a, b) => b.position[2] - a.position[2]); // Closest first
                    targetIdRef.current = projCandidates[0].id;
                    projCandidates[0].typed += char;
                    soundManager.play('click');

                    // Update Renders with Targeted flag
                    setRenderProjectiles(projectilesRef.current.map(p => ({ ...p, isTargeted: p.id === targetIdRef.current })));
                    // Also clear others just in case? No, targetIdRef handles uniqueness usually but explicit is safe
                    setRenderMonsters(monstersRef.current.map(m => ({ ...m, isTargeted: false })));
                    if (bossRef.current) setRenderBoss({ ...bossRef.current, isTargeted: false });

                    return;
                }

                // Check Monsters
                const monsCandidates = monstersRef.current.filter(m => m.word.startsWith(char));
                if (monsCandidates.length > 0) {
                    monsCandidates.sort((a, b) => b.position[2] - a.position[2]);
                    targetIdRef.current = monsCandidates[0].id;
                    monsCandidates[0].typed += char;
                    soundManager.play('click');

                    setRenderMonsters(monstersRef.current.map(m => ({ ...m, isTargeted: m.id === targetIdRef.current })));
                    setRenderProjectiles(projectilesRef.current.map(p => ({ ...p, isTargeted: false })));
                    if (bossRef.current) setRenderBoss({ ...bossRef.current, isTargeted: false });

                    return;
                }

                // Check Boss (Lowest Priority if projectiles exist? Or equal?)
                if (bossRef.current) {
                    const boss = bossRef.current;
                    const currentWord = boss.words[boss.currentWordIndex];
                    if (currentWord.startsWith(char)) {
                        targetIdRef.current = 'BOSS';
                        boss.typed += char;
                        soundManager.play('click');
                        setRenderBoss({ ...boss, isTargeted: true });
                        setRenderMonsters(monstersRef.current.map(m => ({ ...m, isTargeted: false })));
                        setRenderProjectiles(projectilesRef.current.map(p => ({ ...p, isTargeted: false })));
                        return;
                    }
                }
            }

            // Boss check falling through to here means inputs were missed or not startsWith
            // But wait, the previous block handles 'ACQUIRE TARGET'. 
            // The block before that handles 'LOCKED TARGET' (if activeTarget).
            // So if we are here, we have no target, and the char didn't match any new target start.
            // So this 'activeMonster' block is indeed dead/legacy code.

            // soundManager.play('error'); ?


            // Immediate Sync (if no return happened)
            setRenderMonsters(monstersRef.current.map(m => ({
                ...m,
                isTargeted: m.id === targetIdRef.current
            })));
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [viewState, inventory, activeEffects]);
    // Added dependencies for item usage




    // --- MANAGMENT ---
    const startGame = () => {
        console.log("Starting New Game...");
        // Reset State
        setHealth(100);
        setScore(0);
        setKills(0);
        setInventory([null, null, null]);
        setActiveEffects({ slowMo: false, shield: false });
        setTimeRemaining(gameMode === 'TIME_ATTACK' ? 60 : 0);

        // Reset Refs
        monstersRef.current = [];
        bossRef.current = null;
        projectilesRef.current = [];
        targetIdRef.current = null;
        lastSpawnTimeRef.current = 0;

        // Start
        gameStateRef.current = GAME_STATES.PLAYING;
        setViewState(GAME_STATES.PLAYING);
    };

    const endGame = (endState) => {
        gameStateRef.current = endState;
        setViewState(endState);
    };


    return (
        <div className="w-full h-screen relative bg-black font-mono overflow-hidden select-none">

            {/* 3D LAYER - ALWAYS MOUNTED */}
            <div className="absolute inset-0 z-0">
                <ErrorBoundary>
                    <Canvas shadows dpr={[1, 2]}>
                        <Suspense fallback={null}>
                            <Scene3D
                                monsters={renderMonsters}
                                boss={renderBoss}
                                projectiles={renderProjectiles}
                                explosions={renderExplosions}
                                bloodSplatters={renderBlood}
                                shakeIntensity={shakeIntensity} // Pass Shake
                            />
                        </Suspense>
                    </Canvas>
                </ErrorBoundary>
            </div>

            {/* DAMAGE FLASH OVERLAY */}
            <div
                className={`absolute inset-0 z-50 bg-red-600 pointer-events-none transition-opacity duration-75 
                ${hitFlash ? 'opacity-40' : 'opacity-0'}`}
            />

            {/* UI LAYER */}
            <div className="absolute inset-0 z-10 pointer-events-none p-6 flex flex-col justify-between">
                {/* HUD - Only visible when playing */}
                {viewState === GAME_STATES.PLAYING && (
                    <>
                        <div className="flex justify-between items-start pointer-events-none">
                            <div className="flex gap-4">
                                <Link to="/" className="pointer-events-auto p-3 bg-red-900/40 hover:bg-red-800/60 text-white rounded-none border border-red-800/50 backdrop-blur-md transition-all">
                                    <ArrowLeft className="w-6 h-6" />
                                </Link>
                                <div className="bg-black/60 p-3 rounded-none border border-red-900/50 flex items-center gap-3 backdrop-blur-sm">
                                    <Heart className="text-red-600 fill-red-600 animate-pulse" />
                                    <span className="font-horror text-red-500 text-3xl tracking-widest">{health}%</span>
                                </div>
                                {gameMode === 'STORY' && (
                                    <div className="bg-black/60 p-3 rounded-none border border-red-900/50 text-white flex items-center gap-2 backdrop-blur-sm">
                                        <Skull className="text-gray-400" />
                                        <span className="font-horror text-2xl text-gray-200">{Math.max(0, 20 - kills)} LEFT</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col items-end gap-2">
                                <div className="bg-slate-900/80 p-3 rounded-lg border-2 border-slate-700 text-white font-bold text-2xl flex items-center gap-2">
                                    <Trophy className="text-yellow-400" />
                                    {score}
                                </div>
                                {/* Active Effects */}
                                <div className="flex flex-col gap-1">
                                    {activeEffects.shield && <div className="text-xs font-bold text-cyan-400 bg-cyan-900/50 px-2 py-1 rounded border border-cyan-500">SHIELD</div>}
                                    {activeEffects.slowMo && <div className="text-xs font-bold text-blue-400 bg-blue-900/50 px-2 py-1 rounded border border-blue-500">SLOW MO</div>}
                                </div>
                            </div>
                        </div>

                        {/* Power-up Bar (Bottom) */}
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-4 pointer-events-auto">
                            {[0, 1, 2].map(i => {
                                const item = inventory[i];
                                return (
                                    <div key={i} className="relative">
                                        <div className={`w-20 h-20 rounded-sm border-2 flex items-center justify-center transition-all duration-300
                                                ${item ? 'bg-black/80 border-red-600 shadow-blood scale-100' : 'bg-black/30 border-white/5'}`}>
                                            {item ? (
                                                <div className="transform scale-125 drop-shadow-lg">
                                                    {item.icon}
                                                </div>
                                            ) : (
                                                <span className="text-red-900/30 font-horror text-2xl">{i + 1}</span>
                                            )}
                                        </div>
                                        {item && (
                                            <div className="absolute -top-3 -right-3 bg-white text-black font-bold w-6 h-6 rounded-full flex items-center justify-center text-sm border-2 border-slate-900">
                                                {i + 1}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}

                {/* CENTER LAYOUT */}
                <div className="flex-1 flex flex-col items-center justify-center pointer-events-auto">
                    {viewState === GAME_STATES.MENU && (
                        <div className="bg-black/90 p-16 rounded-sm border-2 border-red-900/50 shadow-2xl relative overflow-hidden backdrop-blur-lg max-w-5xl w-full">
                            {/* Blood Drip Background Effect can go here via CSS classes if handled by parent */}
                            <div className="absolute inset-0 bg-vignette pointer-events-none opacity-50"></div>

                            <h1 className="text-9xl font-horror text-red-600 mb-8 text-shadow-blood relative z-10 animate-pulse">
                                TYPING DEAD
                            </h1>

                            <div className="grid grid-cols-2 gap-8 mb-8">
                                <div className="space-y-4">
                                    <h3 className="text-red-700 font-horror text-2xl mb-2 tracking-widest">MODE</h3>
                                    {['STORY', 'ENDLESS', 'TIME_ATTACK'].map(m => (
                                        <button key={m} onClick={() => setGameMode(m)}
                                            className={`w-full p-4 rounded-sm font-bold border transition-all duration-200 text-xl tracking-wider
                                            ${gameMode === m ? 'bg-red-900/80 border-red-500 text-white shadow-blood' : 'bg-black/50 border-gray-800 text-gray-500 hover:text-red-400 hover:border-red-900'}`}>
                                            {m}
                                        </button>
                                    ))}
                                </div>
                                <div className="space-y-4">
                                    <h3 className="text-red-700 font-horror text-2xl mb-2 tracking-widest">DIFFICULTY</h3>
                                    {['EASY', 'MEDIUM', 'HARD'].map(d => (
                                        <button key={d} onClick={() => setDifficulty(d)}
                                            className={`w-full p-4 rounded-sm font-bold border transition-all duration-200 text-xl tracking-wider
                                            ${difficulty === d ? 'bg-gray-200 text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.3)]' : 'bg-black/50 border-gray-800 text-gray-500 hover:text-gray-300'}`}>
                                            {d}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button onClick={startGame} className="w-full py-6 mt-4 bg-red-800 hover:bg-red-700 text-white text-5xl font-horror rounded-sm border-b-4 border-red-950 active:border-b-0 active:translate-y-1 shadow-blood transition-all relative z-10">
                                START NIGHTMARE
                            </button>
                        </div>
                    )}

                    {(viewState === GAME_STATES.GAME_OVER || viewState === GAME_STATES.VICTORY) && (
                        <div className="bg-slate-900/95 p-12 rounded-3xl border-4 border-slate-600 text-center">
                            <h1 className="text-6xl font-black text-white mb-6">{viewState === GAME_STATES.VICTORY ? 'SURVIVED' : 'DEAD'}</h1>
                            <p className="text-2xl text-slate-400 mb-8">Final Score: {score}</p>
                            <button onClick={() => setViewState(GAME_STATES.MENU)} className="px-8 py-4 bg-white text-black font-bold rounded-xl hover:bg-gray-200">
                                MENU
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TypingDead;
