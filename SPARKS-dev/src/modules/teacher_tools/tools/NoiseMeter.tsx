import React, { useState, useRef, useCallback, useEffect } from 'react';
import './NoiseMeter.css';

interface NoiseMeterProps {
  isFullscreen: boolean;
}

type Theme = 'cat' | 'campfire' | 'windy';

const THEME_PREFIX: Record<Theme, string> = {
  cat: 'cat-state',
  campfire: 'fire-state',
  windy: 'windy-state',
};

function getThemeState(volume: number): number {
  if (volume < 15) return 1;
  if (volume < 35) return 2;
  if (volume < 60) return 3;
  if (volume < 85) return 4;
  return 5;
}

function getMeterColor(volume: number): string {
  if (volume < 40) return '#5cb85c';
  if (volume < 75) return '#f0ad4e';
  return '#d9534f';
}

const NoiseMeter: React.FC<NoiseMeterProps> = ({ isFullscreen }) => {
  const [isActive, setIsActive] = useState(false);
  const [volume, setVolume] = useState(0);
  const [themeState, setThemeState] = useState(1);
  const [theme, setTheme] = useState<Theme>('cat');
  const [sensitivity, setSensitivity] = useState(1.5);
  const [status, setStatus] = useState('Meter is off.');
  const [statusColor, setStatusColor] = useState('#555');

  const isActiveRef = useRef(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastStateRef = useRef(1);
  const sensitivityRef = useRef(sensitivity);

  useEffect(() => { sensitivityRef.current = sensitivity; }, [sensitivity]);

  const updateLoop = useCallback(() => {
    if (!isActiveRef.current || !analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);

    let sum = 0;
    for (const amp of dataArray) sum += amp * amp;
    const average = Math.sqrt(sum / dataArray.length);
    const finalVolume = Math.min(100, (average / 180) * 100 * sensitivityRef.current);

    setVolume(finalVolume);

    const newState = getThemeState(finalVolume);
    if (newState !== lastStateRef.current) {
      lastStateRef.current = newState;
      setThemeState(newState);
    }

    rafRef.current = requestAnimationFrame(updateLoop);
  }, []);

  const stopMeter = useCallback(() => {
    if (!isActiveRef.current) return;
    isActiveRef.current = false;

    if (rafRef.current !== null) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null; }
    if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }
    analyserRef.current = null;
    lastStateRef.current = 1;

    setIsActive(false);
    setVolume(0);
    setThemeState(1);
    setStatus('Meter is off.');
    setStatusColor('#555');
  }, []);

  const startMeter = useCallback(async () => {
    if (isActiveRef.current) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      streamRef.current = stream;

      const ctx = new AudioContext();
      await ctx.resume();
      audioCtxRef.current = ctx;

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      ctx.createMediaStreamSource(stream).connect(analyser);
      analyserRef.current = analyser;

      isActiveRef.current = true;
      setIsActive(true);
      setStatus('Listening...');
      setStatusColor('#5cb85c');
      updateLoop();
    } catch {
      setStatus('Microphone access denied!');
      setStatusColor('#d9534f');
    }
  }, [updateLoop]);

  // Stop when leaving fullscreen or unmounting
  useEffect(() => { if (!isFullscreen) stopMeter(); }, [isFullscreen, stopMeter]);
  useEffect(() => () => { stopMeter(); }, [stopMeter]);

  const handleThemeChange = (t: Theme) => {
    setTheme(t);
    lastStateRef.current = 1;
    setThemeState(1);
  };


  const imgSrc = `/teacher_tools/assets/noise-meter/${THEME_PREFIX[theme]}${themeState}.png`;
  const meterColor = getMeterColor(volume);

  return (
    <div className={`nm-tool${isActive ? ' is-active' : ''}`}>

      <div className="nm-controls">
        <div className="nm-control-group">
          <label>Theme:</label>
          <select value={theme} onChange={e => handleThemeChange(e.target.value as Theme)} disabled={isActive}>
            <option value="cat">Cat</option>
            <option value="campfire">Campfire</option>
            <option value="windy">Windy</option>
          </select>
        </div>
        <div className="nm-control-group">
          <label>Sensitivity: <strong>{sensitivity.toFixed(1)}</strong></label>
          <input
            type="range"
            min="0.5"
            max="3"
            step="0.1"
            value={sensitivity}
            onChange={e => setSensitivity(parseFloat(e.target.value))}
          />
        </div>
        <button
          className={`tool-btn nm-toggle-btn${isActive ? ' stop' : ''}`}
          onClick={isActive ? stopMeter : startMeter}
        >
          {isActive ? '⏹ Stop Meter' : '🎤 Start Meter'}
        </button>
      </div>

      <div className="nm-visual-container">
        <img className="nm-theme-img" src={imgSrc} alt={`noise level ${themeState}`} />
      </div>

      <div className="nm-meter-container">
        <div
          className="nm-meter-fill"
          style={{ width: `${volume}%`, backgroundColor: meterColor }}
        />
      </div>

      <p className="nm-status" style={{ color: statusColor }}>{status}</p>

    </div>
  );
};

export default NoiseMeter;
