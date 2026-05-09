class SoundManager {
    muted: boolean;
    private audioCtx: AudioContext | null = null;
    private bufferCache: Record<string, AudioBuffer> = {};
    private currentSource: { type: string; node: AudioBufferSourceNode | HTMLAudioElement; startTime: number; bpm: number; nativeBPM: number; speed: number; url: string } | null = null;
    private legacyAudio: HTMLAudioElement | null = null;
    private loopInterval: ReturnType<typeof setInterval> | null = null;
    private bgmGain: GainNode | null = null;
    private fadeOutTimer: ReturnType<typeof setTimeout> | null = null;

    constructor() {
        this.muted = localStorage.getItem('audio_muted') === 'true';
    }

    async initContext(): Promise<AudioContext | null> {
        if (!this.audioCtx) {
            this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        if (this.audioCtx.state === 'suspended') {
            await this.audioCtx.resume();
        }
        return this.audioCtx;
    }

    async preloadBGM(url: string) {
        if (this.bufferCache[url]) return;
        await this.initContext();
        if (!this.audioCtx) return;
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const arrayBuffer = await response.arrayBuffer();
            if (arrayBuffer.byteLength === 0) throw new Error('Empty audio buffer');
            const audioBuffer = await this.audioCtx.decodeAudioData(arrayBuffer);
            this.bufferCache[url] = audioBuffer;
        } catch (e: any) {
            console.error('Failed to preload BGM:', url, e.message);
        }
    }

    toggleMute(): boolean {
        this.muted = !this.muted;
        localStorage.setItem('audio_muted', String(this.muted));
        if (this.muted) this.stopBGM();
        return this.muted;
    }

    play(type: string) {
        if (this.muted) return;
        this.initContext();
        this.playSynth(type);
    }

    private playSynth(type: string) {
        if (!this.audioCtx) return;
        const osc = this.audioCtx.createOscillator();
        const gainNode = this.audioCtx.createGain();
        osc.connect(gainNode);
        gainNode.connect(this.audioCtx.destination);
        const now = this.audioCtx.currentTime;

        switch (type) {
            case 'correct': case 'bonus':
                osc.type = 'sine'; osc.frequency.setValueAtTime(600, now); osc.frequency.exponentialRampToValueAtTime(1200, now + 0.1);
                gainNode.gain.setValueAtTime(0.3, now); gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
                osc.start(now); osc.stop(now + 0.5); break;
            case 'wrong': case 'penalty':
                osc.type = 'sawtooth'; osc.frequency.setValueAtTime(150, now); osc.frequency.linearRampToValueAtTime(100, now + 0.3);
                gainNode.gain.setValueAtTime(0.3, now); gainNode.gain.linearRampToValueAtTime(0.01, now + 0.3);
                osc.start(now); osc.stop(now + 0.3); break;
            case 'start':
                osc.type = 'triangle'; osc.frequency.setValueAtTime(440, now); osc.frequency.linearRampToValueAtTime(880, now + 0.2);
                gainNode.gain.setValueAtTime(0.3, now); gainNode.gain.linearRampToValueAtTime(0.01, now + 0.5);
                osc.start(now); osc.stop(now + 0.5); break;
            case 'gameover':
                this.playNote(523.25, now, 0.2); this.playNote(659.25, now + 0.2, 0.2); this.playNote(783.99, now + 0.4, 0.4); break;
            case 'tornado':
                osc.type = 'sawtooth'; osc.frequency.setValueAtTime(100, now); osc.frequency.linearRampToValueAtTime(50, now + 1.0);
                gainNode.gain.setValueAtTime(0.2, now); gainNode.gain.linearRampToValueAtTime(0.01, now + 1.0);
                osc.start(now); osc.stop(now + 1.0); break;
            case 'switch':
                osc.type = 'triangle'; osc.frequency.setValueAtTime(400, now); osc.frequency.linearRampToValueAtTime(800, now + 0.2); osc.frequency.linearRampToValueAtTime(400, now + 0.4);
                gainNode.gain.setValueAtTime(0.2, now); osc.start(now); osc.stop(now + 0.4); break;
            case 'pop':
                osc.type = 'square'; osc.frequency.setValueAtTime(200, now); osc.frequency.exponentialRampToValueAtTime(50, now + 0.1);
                gainNode.gain.setValueAtTime(0.2, now); gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
                osc.start(now); osc.stop(now + 0.1); break;
            case 'metronome':
                osc.type = 'sine'; osc.frequency.setValueAtTime(1000, now);
                gainNode.gain.setValueAtTime(0.1, now); gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
                osc.start(now); osc.stop(now + 0.05); break;
            case 'win': case 'daily_double':
                this.playNote(523.25, now, 0.15); this.playNote(659.25, now + 0.15, 0.15); this.playNote(783.99, now + 0.3, 0.15); this.playNote(1046.5, now + 0.45, 0.3); break;
            default:
                osc.type = 'sine'; osc.frequency.setValueAtTime(800, now);
                gainNode.gain.setValueAtTime(0.05, now); gainNode.gain.linearRampToValueAtTime(0.01, now + 0.05);
                osc.start(now); osc.stop(now + 0.05);
        }
    }

    private playNote(freq: number, time: number, duration: number, volume = 0.2) {
        if (!this.audioCtx) return;
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.connect(gain); gain.connect(this.audioCtx.destination);
        osc.frequency.setValueAtTime(freq, time);
        gain.gain.setValueAtTime(volume, time); gain.gain.linearRampToValueAtTime(0.01, time + duration);
        osc.start(time); osc.stop(time + duration);
    }

    stopLoop() {
        if (this.loopInterval) { clearInterval(this.loopInterval); this.loopInterval = null; }
    }

    playBGM(url: string, currentBPM: number, nativeBPM = 92) {
        if (this.muted) return;
        this.initContext();
        this.stopBGM();
        const buffer = this.bufferCache[url];
        if (!buffer || !this.audioCtx) { this.playLegacyBGM(url, currentBPM, nativeBPM); return; }
        const source = this.audioCtx.createBufferSource();
        source.buffer = buffer; source.loop = true;
        let speed = currentBPM / nativeBPM;
        if (!isFinite(speed)) speed = 1.0;
        source.playbackRate.value = speed;
        this.bgmGain = this.audioCtx.createGain();
        this.bgmGain.gain.value = 1;
        source.connect(this.bgmGain);
        this.bgmGain.connect(this.audioCtx.destination);
        const startTime = this.audioCtx.currentTime;
        source.start(startTime);
        this.currentSource = { type: 'web', node: source, startTime, bpm: currentBPM, nativeBPM, speed, url };
    }

    private playLegacyBGM(url: string, currentBPM: number, nativeBPM: number) {
        const audio = new Audio(url); audio.loop = true;
        let speed = currentBPM / nativeBPM;
        if (!isFinite(speed)) speed = 1.0;
        audio.playbackRate = speed;
        audio.play().catch(e => console.error('Legacy BGM Error:', e));
        this.legacyAudio = audio;
        this.currentSource = { type: 'legacy', node: audio, startTime: Date.now() / 1000, bpm: currentBPM, nativeBPM, speed, url };
    }

    isBGMPlaying(url: string): boolean {
        if (!this.currentSource) return false;
        if (this.currentSource.url === url) return true;
        try {
            const srcName = this.currentSource.url.split('/').pop();
            const targetName = url.split('/').pop();
            if (srcName && targetName && srcName === targetName) return true;
        } catch (_) {}
        return false;
    }

    getAudioTime(): number {
        if (this.currentSource && this.currentSource.type === 'legacy') {
            return (this.currentSource.node as HTMLAudioElement).currentTime;
        }
        return this.audioCtx ? this.audioCtx.currentTime : 0;
    }

    setBGMTempo(newBPM: number) {
        if (!this.currentSource) return;
        const nativeBPM = this.currentSource.nativeBPM;
        let speed = newBPM / nativeBPM;
        if (!isFinite(speed)) speed = 1.0;
        if (this.currentSource.type === 'web' && this.audioCtx) {
            (this.currentSource.node as AudioBufferSourceNode).playbackRate.setValueAtTime(speed, this.audioCtx.currentTime);
        } else if (this.currentSource.type === 'legacy') {
            (this.currentSource.node as HTMLAudioElement).playbackRate = speed;
        }
        this.currentSource.bpm = newBPM; this.currentSource.speed = speed;
    }

    fadeOutBGM(durationMs = 800): Promise<void> {
        if (this.fadeOutTimer) { clearTimeout(this.fadeOutTimer); this.fadeOutTimer = null; }
        return new Promise(resolve => {
            if (!this.currentSource) { resolve(); return; }
            if (this.currentSource.type === 'web' && this.audioCtx && this.bgmGain) {
                const now = this.audioCtx.currentTime;
                this.bgmGain.gain.cancelScheduledValues(now);
                this.bgmGain.gain.setValueAtTime(this.bgmGain.gain.value, now);
                this.bgmGain.gain.linearRampToValueAtTime(0, now + durationMs / 1000);
                this.fadeOutTimer = setTimeout(() => { this.stopBGM(); resolve(); }, durationMs);
            } else if (this.currentSource.type === 'legacy') {
                const audio = this.currentSource.node as HTMLAudioElement;
                const startVol = audio.volume;
                const steps = 20;
                const stepMs = durationMs / steps;
                let step = 0;
                const interval = setInterval(() => {
                    step++;
                    audio.volume = Math.max(0, startVol * (1 - step / steps));
                    if (step >= steps) { clearInterval(interval); this.stopBGM(); resolve(); }
                }, stepMs);
            } else {
                this.stopBGM(); resolve();
            }
        });
    }

    stopBGM() {
        if (this.fadeOutTimer) { clearTimeout(this.fadeOutTimer); this.fadeOutTimer = null; }
        if (this.currentSource) {
            try {
                if (this.currentSource.type === 'web') (this.currentSource.node as AudioBufferSourceNode).stop();
                else if (this.currentSource.type === 'legacy') {
                    const a = this.currentSource.node as HTMLAudioElement;
                    a.pause(); a.currentTime = 0;
                }
            } catch (_) {}
            this.currentSource = null;
        }
        if (this.bgmGain) { this.bgmGain.disconnect(); this.bgmGain = null; }
        if (this.legacyAudio) { this.legacyAudio.pause(); this.legacyAudio.currentTime = 0; this.legacyAudio = null; }
    }
}

export const soundManager = new SoundManager();
