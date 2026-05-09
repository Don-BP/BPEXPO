/**
 * Audio Manager
 * Handles sound effects for all games with Web Audio API fallback
 */

class AudioManager {
    constructor() {
        this.muted = localStorage.getItem('audio_muted') === 'true';
        this.sounds = {
            'correct': '../assets/sounds/correct.mp3',
            'wrong': '../assets/sounds/wrong.mp3',
            'tornado': '../assets/sounds/tornado.mp3',
            'daily_double': '../assets/sounds/daily_double.mp3',
            'timer': '../assets/sounds/timer.mp3'
        };
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        this.loadedSounds = {};
    }

    toggleMute() {
        this.muted = !this.muted;
        localStorage.setItem('audio_muted', this.muted);
        return this.muted;
    }

    play(soundName) {
        if (this.muted) return;

        // Try to resume context if suspended (browser policy)
        if (this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
        }

        const path = this.sounds[soundName];
        if (!path) return;

        const audio = new Audio(path);

        // Try playing file, fall back to synth if missing/error
        audio.play().catch(() => {
            console.log(`Sound file not found: ${soundName}, playing synth fallback.`);
            this.playSynth(soundName);
        });
    }

    playSynth(type) {
        if (this.muted) return;

        const osc = this.audioCtx.createOscillator();
        const gainNode = this.audioCtx.createGain();

        osc.connect(gainNode);
        gainNode.connect(this.audioCtx.destination);

        const now = this.audioCtx.currentTime;

        switch (type) {
            case 'correct':
                // High pitch "Ding"
                osc.type = 'sine';
                osc.frequency.setValueAtTime(600, now);
                osc.frequency.exponentialRampToValueAtTime(1200, now + 0.1);
                gainNode.gain.setValueAtTime(0.3, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
                osc.start(now);
                osc.stop(now + 0.5);
                break;

            case 'wrong':
                // Low pitch "Buzz"
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(150, now);
                osc.frequency.linearRampToValueAtTime(100, now + 0.3);
                gainNode.gain.setValueAtTime(0.3, now);
                gainNode.gain.linearRampToValueAtTime(0.01, now + 0.3);
                osc.start(now);
                osc.stop(now + 0.3);
                break;

            case 'daily_double':
                // Laser/Swoosh
                osc.type = 'square';
                osc.frequency.setValueAtTime(200, now);
                osc.frequency.exponentialRampToValueAtTime(800, now + 0.2);
                osc.frequency.exponentialRampToValueAtTime(200, now + 0.4);
                gainNode.gain.setValueAtTime(0.2, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
                osc.start(now);
                osc.stop(now + 0.6);
                break;

            case 'tornado':
                // White noise-ish (using rapid freq change)
                osc.type = 'sawtooth'; // noise node is harder in vanilla web audio without buffer
                osc.frequency.setValueAtTime(100, now);
                osc.frequency.linearRampToValueAtTime(50, now + 1.0);
                gainNode.gain.setValueAtTime(0.2, now);
                gainNode.gain.linearRampToValueAtTime(0.01, now + 1.0);
                // Create a "wobble"
                for (let i = 0; i < 10; i++) {
                    osc.frequency.setValueAtTime(100 + Math.random() * 50, now + (i / 10));
                }
                osc.start(now);
                osc.stop(now + 1.0);
                break;

            default:
                // Simple blip
                osc.type = 'sine';
                osc.frequency.setValueAtTime(440, now);
                gainNode.gain.setValueAtTime(0.1, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
                osc.start(now);
                osc.stop(now + 0.1);
        }
    }
}

// Global instance
window.audioManager = new AudioManager();

function toggleMute() {
    const isMuted = window.audioManager.toggleMute();
    const btn = document.querySelector('button[title="Toggle Sound"]');
    if (btn) {
        btn.textContent = isMuted ? '🔇' : '🔊';
        btn.classList.toggle('muted', isMuted);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Mute Button State
    const isMuted = window.audioManager.muted;
    const btn = document.querySelector('button[title="Toggle Sound"]');
    if (btn) {
        btn.textContent = isMuted ? '🔇' : '🔊';
        if (isMuted) btn.classList.add('muted');
    }
});
