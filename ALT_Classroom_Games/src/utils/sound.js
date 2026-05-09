class SoundManager {
    constructor() {
        this.muted = localStorage.getItem('audio_muted') === 'true';
        this.audioCtx = null;
        this.bufferCache = {};
        this.currentSource = null;
        this.legacyAudio = null;

        // Lazy init audio context on first interaction
        this.initContext = this.initContext.bind(this);
    }

    async initContext() {
        if (!this.audioCtx) {
            this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.audioCtx.state === 'suspended') {
            await this.audioCtx.resume();
        }
        return this.audioCtx;
    }

    async preloadBGM(url) {
        if (this.bufferCache[url]) return;
        await this.initContext();
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const arrayBuffer = await response.arrayBuffer();
            if (arrayBuffer.byteLength === 0) {
                throw new Error("Empty audio buffer");
            }
            const audioBuffer = await this.audioCtx.decodeAudioData(arrayBuffer);
            this.bufferCache[url] = audioBuffer;
            console.log("Audio Preloaded Successfully:", url);
        } catch (e) {
            console.error("Failed to preload BGM:", url, e.message);
        }
    }

    toggleMute() {
        this.muted = !this.muted;
        localStorage.setItem('audio_muted', this.muted);
        if (this.muted) this.stopBGM();
        return this.muted;
    }

    play(type) {
        if (this.muted) return;
        this.initContext();

        // Use Synth by default for reliability in this demo
        this.playSynth(type);
    }

    playSynth(type) {
        if (!this.audioCtx) return;

        const osc = this.audioCtx.createOscillator();
        const gainNode = this.audioCtx.createGain();

        osc.connect(gainNode);
        gainNode.connect(this.audioCtx.destination);

        const now = this.audioCtx.currentTime;

        switch (type) {
            case 'correct': // Ding!
            case 'bonus':
                osc.type = 'sine';
                osc.frequency.setValueAtTime(600, now);
                osc.frequency.exponentialRampToValueAtTime(1200, now + 0.1);
                gainNode.gain.setValueAtTime(0.3, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
                osc.start(now);
                osc.stop(now + 0.5);
                break;

            case 'wrong': // Buzz
            case 'penalty':
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(150, now);
                osc.frequency.linearRampToValueAtTime(100, now + 0.3);
                gainNode.gain.setValueAtTime(0.3, now);
                gainNode.gain.linearRampToValueAtTime(0.01, now + 0.3);
                osc.start(now);
                osc.stop(now + 0.3);
                break;

            case 'start': // Game Start
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(440, now);
                osc.frequency.linearRampToValueAtTime(880, now + 0.2);
                gainNode.gain.setValueAtTime(0.3, now);
                gainNode.gain.linearRampToValueAtTime(0.01, now + 0.5);
                osc.start(now);
                osc.stop(now + 0.5);
                break;

            case 'gameover': // Fanfare-ish
                this.playNote(523.25, now, 0.2);
                this.playNote(659.25, now + 0.2, 0.2);
                this.playNote(783.99, now + 0.4, 0.4);
                break;

            case 'tornado': // White noise / chaos
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(100, now);
                osc.frequency.linearRampToValueAtTime(50, now + 1.0);
                gainNode.gain.setValueAtTime(0.2, now);
                gainNode.gain.linearRampToValueAtTime(0.01, now + 1.0);
                osc.start(now);
                osc.stop(now + 1.0);
                break;

            case 'switch': // Slide
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(400, now);
                osc.frequency.linearRampToValueAtTime(800, now + 0.2);
                osc.frequency.linearRampToValueAtTime(400, now + 0.4);
                gainNode.gain.setValueAtTime(0.2, now);
                osc.start(now);
                osc.stop(now + 0.4);
                break;

            case 'pop': // Zombie Death
                osc.type = 'square';
                osc.frequency.setValueAtTime(200, now);
                osc.frequency.exponentialRampToValueAtTime(50, now + 0.1);
                gainNode.gain.setValueAtTime(0.2, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
                osc.start(now);
                osc.stop(now + 0.1);
                break;

            case 'shieldBase': // Shield Hit
                osc.type = 'sine';
                osc.frequency.setValueAtTime(150, now);
                osc.frequency.linearRampToValueAtTime(100, now + 0.3);
                gainNode.gain.setValueAtTime(0.3, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
                osc.start(now);
                osc.stop(now + 0.3);
                break;

            case 'metronome':
                osc.type = 'sine';
                osc.frequency.setValueAtTime(1000, now);
                gainNode.gain.setValueAtTime(0.1, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
                osc.start(now);
                osc.stop(now + 0.05);
                break;

            case 'chant':
                this.playNote(440, now, 0.05);
                this.playNote(554.37, now + 0.1, 0.05);
                this.playNote(659.25, now + 0.2, 0.05);
                this.playNote(880, now + 0.3, 0.1);
                break;

            default:
                osc.type = 'sine';
                osc.frequency.setValueAtTime(800, now);
                gainNode.gain.setValueAtTime(0.05, now);
                gainNode.gain.linearRampToValueAtTime(0.01, now + 0.05);
                osc.start(now);
                osc.stop(now + 0.05);
        }
    }

    playNote(freq, time, duration, volume = 0.2) {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.frequency.setValueAtTime(freq, time);
        gain.gain.setValueAtTime(volume, time);
        gain.gain.linearRampToValueAtTime(0.01, time + duration);
        osc.start(time);
        osc.stop(time + duration);
    }

    startLoop(bpm) {
        if (this.loopInterval) clearInterval(this.loopInterval);
        this.initContext();

        const interval = (60 / bpm) * 1000;
        let count = 0;

        this.loopInterval = setInterval(() => {
            const now = this.audioCtx.currentTime;
            if (count % 2 === 0) {
                this.playNote(60, now, 0.1, 0.3);
            } else {
                this.playNote(200, now, 0.05, 0.1);
            }
            count++;
        }, interval);
    }

    stopLoop() {
        if (this.loopInterval) {
            clearInterval(this.loopInterval);
            this.loopInterval = null;
        }
    }

    playBGM(url, currentBPM, nativeBPM = 92) {
        if (this.muted) return;
        this.initContext();
        this.stopBGM();

        const buffer = this.bufferCache[url];
        if (!buffer) {
            console.warn("BGM not preloaded, using legacy audio:", url);
            this.playLegacyBGM(url, currentBPM, nativeBPM);
            this.preloadBGM(url);
            return;
        }

        const source = this.audioCtx.createBufferSource();
        source.buffer = buffer;
        source.loop = true;

        let speed = currentBPM / nativeBPM;
        if (!isFinite(speed)) speed = 1.0;
        source.playbackRate.value = speed;

        source.connect(this.audioCtx.destination);

        const startTime = this.audioCtx.currentTime;
        source.start(startTime);

        this.currentSource = {
            type: 'web', // Type marker
            node: source,
            startTime: startTime,
            bpm: currentBPM,
            nativeBPM: nativeBPM,
            speed: speed,
            url: url
        };
    }

    playLegacyBGM(url, currentBPM, nativeBPM) {
        const audio = new Audio(url);
        audio.loop = true;

        let speed = currentBPM / nativeBPM;
        if (!isFinite(speed)) speed = 1.0;

        audio.playbackRate = speed;
        audio.play().catch(e => console.error("Legacy BGM Error:", e));

        this.legacyAudio = audio; // Keep ref for direct cleanup if needed

        // Unified state tracking
        this.currentSource = {
            type: 'legacy',
            node: audio,
            startTime: Date.now() / 1000, // Approximate start time
            bpm: currentBPM,
            nativeBPM: nativeBPM,
            speed: speed,
            url: url
        };
    }

    isBGMPlaying(url) {
        if (!this.currentSource) {
            console.log('[SoundManager] isBGMPlaying: currentSource is null');
            return false;
        }

        const isExact = this.currentSource.url === url;
        if (isExact) return true;

        // Fuzzy match
        try {
            const srcName = this.currentSource.url.split('/').pop();
            const targetName = url.split('/').pop();
            const isFuzzy = srcName && targetName && srcName === targetName;

            console.log(`[SoundManager] isBGMPlaying Check. Exact: ${isExact}, Fuzzy: ${isFuzzy}. Src: ${this.currentSource.url}, Tgt: ${url}`);

            if (isFuzzy) return true;
        } catch (e) {
            console.warn("Fuzzy match error", e);
        }

        return false;
    }

    getTimeInfo() {
        if (!this.currentSource) return null;

        if (this.currentSource.type === 'web' && this.audioCtx) {
            return {
                elapsed: this.audioCtx.currentTime - this.currentSource.startTime,
                bpm: this.currentSource.bpm,
                speed: this.currentSource.speed,
                currentTime: this.audioCtx.currentTime
            };
        } else if (this.currentSource.type === 'legacy') {
            return {
                elapsed: this.currentSource.node.currentTime,
                bpm: this.currentSource.bpm,
                speed: this.currentSource.speed,
                currentTime: Date.now() / 1000
            };
        }
        return null;
    }

    getAudioTime() {
        if (this.currentSource && this.currentSource.type === 'legacy') {
            return this.currentSource.node.currentTime;
        }
        return this.audioCtx ? this.audioCtx.currentTime : 0;
    }

    setBGMTempo(newBPM) {
        if (!this.currentSource) return;

        const nativeBPM = this.currentSource.nativeBPM;
        let speed = newBPM / nativeBPM;
        if (!isFinite(speed)) speed = 1.0;

        // Update playback rate based on type
        if (this.currentSource.type === 'web' && this.audioCtx) {
            this.currentSource.node.playbackRate.setValueAtTime(speed, this.audioCtx.currentTime);
        } else if (this.currentSource.type === 'legacy') {
            this.currentSource.node.playbackRate = speed;
        }

        // Update state
        this.currentSource.bpm = newBPM;
        this.currentSource.speed = speed;
    }

    stopBGM() {
        console.log('[SoundManager] stopBGM called');
        // console.trace(); // Uncomment for deep debugging if needed
        if (this.currentSource) {
            try {
                if (this.currentSource.type === 'web') {
                    this.currentSource.node.stop();
                } else if (this.currentSource.type === 'legacy') {
                    this.currentSource.node.pause();
                    this.currentSource.node.currentTime = 0;
                }
            } catch (e) { }
            this.currentSource = null;
        }
        // Double check legacy ref cleanup
        if (this.legacyAudio) {
            this.legacyAudio.pause();
            this.legacyAudio.currentTime = 0;
            this.legacyAudio = null;
        }
    }
}

export const soundManager = new SoundManager();
