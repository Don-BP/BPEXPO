import React from 'react';
import { motion } from 'framer-motion';

const SPARKLES = [
  { id: 0,  x: 5,   y: 8,  size: 36, dur: 4.2, delay: 0.0, glyph: '✦', color: '#f97316' },
  { id: 1,  x: 18,  y: 22, size: 14, dur: 3.8, delay: 1.1, glyph: '✸', color: '#60a5fa' },
  { id: 2,  x: 32,  y: 5,  size: 28, dur: 5.1, delay: 0.4, glyph: '★', color: '#facc15' },
  { id: 3,  x: 48,  y: 15, size: 16, dur: 3.5, delay: 2.2, glyph: '✿', color: '#a78bfa' },
  { id: 4,  x: 65,  y: 8,  size: 40, dur: 4.7, delay: 0.8, glyph: '✦', color: '#38bdf8' },
  { id: 5,  x: 80,  y: 20, size: 13, dur: 3.9, delay: 1.6, glyph: '◆', color: '#fbbf24' },
  { id: 6,  x: 92,  y: 10, size: 22, dur: 4.4, delay: 0.2, glyph: '★', color: '#818cf8' },
  { id: 7,  x: 10,  y: 45, size: 10, dur: 3.2, delay: 2.8, glyph: '✺', color: '#e879f9' },
  { id: 8,  x: 42,  y: 40, size: 18, dur: 4.0, delay: 1.9, glyph: '✸', color: '#2dd4bf' },
  { id: 9,  x: 58,  y: 55, size: 12, dur: 3.6, delay: 3.1, glyph: '❋', color: '#facc15' },
  { id: 10, x: 73,  y: 42, size: 38, dur: 4.8, delay: 0.3, glyph: '★', color: '#fb923c' },
  { id: 11, x: 8,   y: 75, size: 24, dur: 5.0, delay: 2.5, glyph: '✿', color: '#fbbf24' },
  { id: 12, x: 38,  y: 78, size: 30, dur: 4.3, delay: 1.7, glyph: '✸', color: '#e879f9' },
  { id: 13, x: 55,  y: 88, size: 16, dur: 3.1, delay: 3.4, glyph: '★', color: '#38bdf8' },
  { id: 14, x: 70,  y: 72, size: 20, dur: 4.6, delay: 0.1, glyph: '✺', color: '#facc15' },
  { id: 15, x: 85,  y: 82, size: 34, dur: 5.2, delay: 2.0, glyph: '✦', color: '#818cf8' },
  { id: 16, x: 95,  y: 65, size: 12, dur: 3.3, delay: 1.2, glyph: '❋', color: '#fb923c' },
  { id: 17, x: 50,  y: 30, size: 10, dur: 3.0, delay: 2.0, glyph: '✿', color: '#f97316' },
];

const BG_FILENAMES = [
  '0001-50x42.png','0002-50x47.png','0003-50x44.png','0004-50x36.png','0005-43x50.png',
  '0006-50x46.png','0007-50x36.png','0008-50x37.png','0009-47x50.png','0010-50x26.png',
  '0011-50x24.png','0012-50x30.png','0013-50x38.png','0014-41x50.png','0015-50x32.png',
  '0016-50x36.png','0017-50x37.png','0018-36x50.png','0019-50x40.png','0020-50x44.png',
  '0021-50x43.png','0022-50x41.png','0023-47x50.png','0024-37x50.png','0025-36x50.png',
  '0026-31x50.png','0027-18x50.png','0028-42x50.png','0029-50x42.png','0030-50x42.png',
  '0031-50x25.png','0032-50x47.png','0033-50x46.png','0034-50x26.png','0035-50x50.png',
  '0036-50x28.png','0037-50x40.png','0038-50x42.png','0039-50x24.png','0040-16x50.png',
  '0041-50x35.png','0042-50x41.png','0043-50x37.png','0044-26x50.png','0045-40x50.png',
  '0046-50x48.png','0047-50x50.png','0048-50x48.png','0049-50x34.png','0050-50x50.png',
  '0051-50x43.png','0052-50x31.png','0053-50x50.png','0054-50x49.png','0055-46x50.png',
  '0056-41x50.png','0057-50x35.png','0058-50x38.png','0059-28x50.png','0060-50x44.png',
  '0061-34x50.png','0062-50x49.png','0063-50x44.png','0064-50x47.png','0065-46x50.png',
  '0066-50x46.png','0067-41x50.png','0068-50x45.png','0069-50x37.png','0070-50x41.png',
  '0071-50x45.png','0072-50x37.png','0073-50x38.png','0074-50x47.png','0075-50x50.png',
  '0076-50x31.png','0077-50x37.png','0078-48x50.png','0079-42x50.png','0080-50x45.png',
  '0081-50x39.png','0082-50x30.png','0083-45x50.png','0084-50x24.png','0085-50x28.png',
  '0086-50x44.png','0087-50x31.png','0088-50x41.png','0089-50x18.png','0090-50x32.png',
  '0091-32x50.png','0092-50x27.png','0093-50x39.png','0094-50x48.png','0095-50x37.png',
  '0096-40x50.png','0097-50x38.png','0098-50x29.png','0099-50x25.png','0100-28x50.png',
  '0101-50x31.png','0102-19x50.png','0103-50x33.png','0104-45x50.png','0105-50x41.png',
  '0106-50x41.png','0107-50x31.png','0108-43x50.png','0109-50x32.png','0110-50x40.png',
  '0111-50x26.png','0112-50x20.png','0113-50x32.png','0114-40x50.png','0115-50x36.png',
  '0116-50x50.png','0117-50x32.png','0118-50x27.png','0119-50x45.png','0120-50x28.png',
  '0121-50x36.png','0122-50x36.png','0123-50x47.png','0124-50x35.png','0125-50x27.png',
  '0126-50x31.png','0127-50x37.png','0128-50x35.png','0129-50x26.png','0130-50x33.png',
  '0131-47x50.png','0132-47x50.png','0133-50x46.png','0134-50x45.png','0135-50x27.png',
  '0136-50x42.png','0137-42x50.png','0138-50x40.png','0139-50x39.png','0140-50x33.png',
  '0141-50x47.png','0142-50x24.png','0143-50x41.png','0144-50x30.png','0145-50x37.png',
  '0146-50x36.png','0147-50x21.png','0148-46x50.png','0149-50x31.png','0150-50x38.png',
  '0151-43x50.png','0152-37x50.png','0153-35x50.png','0154-50x47.png','0155-50x39.png',
  '0156-50x48.png','0157-47x50.png','0158-50x45.png','0159-50x36.png','0160-50x50.png',
  '0161-50x48.png','0162-42x50.png','0163-50x42.png','0164-48x50.png','0165-50x36.png',
  '0166-50x43.png','0167-50x40.png','0168-47x50.png','0169-31x50.png','0170-50x43.png',
  '0171-46x50.png','0172-50x38.png','0173-50x38.png','0174-43x50.png','0175-50x24.png',
  '0176-47x50.png','0177-50x43.png','0178-50x44.png','0179-46x50.png','0180-50x15.png',
  '0181-50x44.png','0182-45x50.png','0183-45x50.png','0184-50x48.png','0185-45x50.png',
  '0186-47x50.png','0187-50x35.png','0188-50x33.png','0189-50x50.png','0190-50x37.png',
  '0191-42x50.png','0192-50x34.png','0193-50x38.png','0194-50x26.png',
];

// Drift directions cycle so images move in varied directions
const DX_CYCLE = [55, 40, -50, -65, 45, 70, -55, -40];
const DY_CYCLE = [-22, 32, 18, -38, 28, -18];

// Generate all 194 items — positions spread pseudo-randomly, delays staggered
// so ~25-30 are visible at any time
const WORD_ITEMS = BG_FILENAMES.map((filename, i) => ({
  id: i,
  src: `/assets/images/bg/${filename}`,
  x: Math.round(((i * 7.3) % 90) + (i % 5)),
  y: Math.round(((i * 11.7) % 82) + (i % 6)),
  dx: DX_CYCLE[i % 8],
  dy: DY_CYCLE[i % 6],
  dur: 4 + (i % 4),
  delay: Math.round((i * 0.19) % 36 * 10) / 10,
  rest: 80 + (i % 8) * 10,
}));

const SparkleBackground: React.FC = () => (
  <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>

    {/* Layer 1: Animated gradient background */}
    <div
      className="absolute inset-0"
      style={{
        background: 'linear-gradient(-45deg, #1746a2, #3d2d90, #1a5f9a, #2448b0, #5028a0, #1258a8)',
        backgroundSize: '400% 400%',
        animation: 'aurora-gradient 18s ease infinite',
      }}
    />

    {/* Dot grid */}
    <div
      className="absolute inset-0"
      style={{
        backgroundImage: 'radial-gradient(circle, rgba(148,163,184,0.10) 1px, transparent 1px)',
        backgroundSize: '36px 36px',
      }}
    />

    {/* Layer 2: Drifting aurora blobs */}
    <motion.div
      className="absolute rounded-full bg-purple-400/20 blur-3xl"
      style={{ width: 620, height: 420, top: '8%', left: '-8%' }}
      animate={{ x: [-60, 70, -60], y: [-40, 50, -40] }}
      transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
    />
    <motion.div
      className="absolute rounded-full bg-sky-400/18 blur-3xl"
      style={{ width: 500, height: 500, top: '45%', right: '-10%' }}
      animate={{ x: [50, -50, 50], y: [-30, 40, -30] }}
      transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
    />
    <motion.div
      className="absolute rounded-full bg-teal-400/15 blur-3xl"
      style={{ width: 450, height: 600, top: '55%', left: '15%' }}
      animate={{ x: [-40, 55, -40], y: [-25, 25, -25] }}
      transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
    />
    <motion.div
      className="absolute rounded-full bg-violet-400/18 blur-3xl"
      style={{ width: 560, height: 360, top: '2%', right: '18%' }}
      animate={{ x: [30, -55, 30], y: [35, -35, 35] }}
      transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
    />
    <motion.div
      className="absolute rounded-full bg-pink-400/12 blur-3xl"
      style={{ width: 480, height: 480, top: '75%', left: '55%' }}
      animate={{ x: [-45, 35, -45], y: [-30, 20, -30] }}
      transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
    />

    {/* Layer 3: All 194 bg images — each drifts, fades in, then fades out */}
    {WORD_ITEMS.map((item) => (
      <motion.img
        key={item.id}
        src={item.src}
        alt=""
        className="absolute select-none"
        style={{ left: `${item.x}%`, top: `${item.y}%`, maxWidth: 50, maxHeight: 50, width: 'auto', height: 'auto' }}
        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        animate={{
          x: [0, item.dx],
          y: [0, item.dy],
          opacity: [0, 0, 0.65, 0.65, 0],
        }}
        transition={{
          duration: item.dur,
          delay: item.delay,
          repeat: Infinity,
          repeatDelay: item.rest,
          ease: 'easeInOut',
          times: [0, 0.1, 0.25, 0.8, 1],
        }}
      />
    ))}

    {/* Layer 4: Sparkle glyphs */}
    {SPARKLES.map((s) => (
      <motion.span
        key={s.id}
        className="absolute select-none font-black leading-none"
        style={{ left: `${s.x}%`, top: `${s.y}%`, fontSize: s.size, color: s.color }}
        animate={{ opacity: [0, 0.85, 0], scale: [0.3, 1.2, 0.3], rotate: [0, 90, 180] }}
        transition={{ duration: s.dur, delay: s.delay, repeat: Infinity, ease: 'easeInOut' }}
      >
        {s.glyph}
      </motion.span>
    ))}
  </div>
);

export default SparkleBackground;
