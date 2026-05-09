import React, { useState, useEffect, useRef } from 'react';
import { getAllDecks } from '../../../utils/tango-bridge';
import { CATEGORIES } from '../../tango/components/TangoSetupScreen';
import './Whiteboard.css';

const WB_CATEGORY_IMAGE: Record<string, string> = Object.fromEntries(
    CATEGORIES.map((c: { id: string; image: string }) => [c.id, c.image])
);
const WB_CATEGORY_NAME: Record<string, string> = Object.fromEntries(
    CATEGORIES.map((c: { id: string; name: string }) => [c.id, c.name])
);

interface WhiteboardProps { isFullscreen: boolean; }

type Brush =
  | 'pen' | 'airbrush' | 'spray' | 'rainbow-band'
  | 'flower' | 'snow' | 'rain' | 'fire' | 'smoke' | 'lava' | 'stars' | 'sparkles'
  | 'lightbeam' | 'bubble' | 'watersplash' | 'candy' | 'leaf'
  | 'heart-brush' | 'spiderweb' | 'streamer';

type DrawShape =
  | 'none' | 'line' | 'circle' | 'square' | 'rectangle'
  | 'heart' | 'hexagon' | 'star' | 'diamond' | 'octagon' | 'pentagon';

type Style = 'solid' | 'dashed' | 'dotted' | 'rainbow' | 'mirror';

interface Stroke { path: { x: number; y: number }[]; width: number; }
interface RainbowStroke extends Stroke { hueOffset: number; }
interface HistoryEntry {
  static: string; rainbow: RainbowStroke[]; erase: Stroke[];
  width: number; height: number;
}
interface FlashcardItem { text?: string; image?: string; }

const PALETTE = ['#000000','#FFFFFF','#FF3B30','#FF9500','#FFCC00','#4CD964','#34C759','#5AC8FA','#007AFF','#AF52DE'];
const HISTORY_LIMIT = 20;

// ─── Brush helpers ─────────────────────────────────────────────────────────────
const rnd = (a: number, b: number) => a + Math.random() * (b - a);
function hexToRgb(hex: string): [number, number, number] {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return m ? [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)] : [0, 0, 0];
}

const BRUSH_SPACING: Partial<Record<Brush, number>> = {
  pen: 0, airbrush: 2, spray: 2, 'rainbow-band': 1,
  flower: 22, snow: 18, rain: 6, fire: 5, smoke: 12, lava: 10,
  stars: 20, sparkles: 18, lightbeam: 18, bubble: 24,
  watersplash: 16, leaf: 14, 'heart-brush': 22,
  spiderweb: 30, streamer: 8,
};

function emitParticle(ctx: CanvasRenderingContext2D, brush: Brush, x: number, y: number, color: string, sz: number, dx = 0, dy = 0) {
  ctx.save();
  switch (brush) {
    case 'airbrush': {
      const [r, g, b] = hexToRgb(color);
      const gr = ctx.createRadialGradient(x, y, 0, x, y, sz * 0.7);
      gr.addColorStop(0, `rgba(${r},${g},${b},0.3)`);
      gr.addColorStop(1, `rgba(${r},${g},${b},0)`);
      ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(x, y, sz * 0.7, 0, Math.PI * 2); ctx.fill(); break;
    }
    case 'spray': {
      ctx.fillStyle = color; ctx.globalAlpha = 0.8;
      for (let i = 0; i < 50; i++) {
        const a = Math.random() * Math.PI * 2, d = Math.random() * sz / 2;
        ctx.fillRect(x + Math.cos(a) * d, y + Math.sin(a) * d, 1, 1);
      }
      break;
    }
    case 'flower': {
      ctx.translate(x, y); ctx.rotate(rnd(0, Math.PI * 2));
      const ps = sz * 0.4; ctx.fillStyle = color; ctx.globalAlpha = 0.85;
      for (let i = 0; i < 5; i++) {
        ctx.save(); ctx.rotate(i * Math.PI * 2 / 5);
        ctx.beginPath(); ctx.ellipse(ps * 0.6, 0, ps * 0.35, ps * 0.2, 0, 0, Math.PI * 2);
        ctx.fill(); ctx.restore();
      }
      ctx.fillStyle = '#ffee00'; ctx.beginPath(); ctx.arc(0, 0, ps * 0.28, 0, Math.PI * 2); ctx.fill(); break;
    }
    case 'snow': {
      const numFlakes = Math.floor(rnd(2, 5));
      for (let f = 0; f < numFlakes; f++) {
        ctx.save();
        ctx.translate(x + rnd(-sz * 1.5, sz * 1.5), y + rnd(-sz * 1.5, sz * 1.5));
        ctx.rotate(rnd(0, Math.PI * 2));
        const fSz = rnd(sz * 0.3, sz * 0.7);
        ctx.strokeStyle = color;
        ctx.lineWidth = Math.max(1, fSz * 0.06);
        ctx.globalAlpha = rnd(0.7, 1.0);
        const variant = Math.floor(Math.random() * 3);
        if (variant === 0) {
          const bl = fSz * 0.12;
          for (let i = 0; i < 6; i++) {
            ctx.save(); ctx.rotate(i * Math.PI / 3);
            ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -fSz * 0.45);
            for (let b = 1; b <= 2; b++) {
              const by = -fSz * 0.45 * (b / 3);
              ctx.moveTo(0, by); ctx.lineTo(bl * 0.7, by - bl * 0.7);
              ctx.moveTo(0, by); ctx.lineTo(-bl * 0.7, by - bl * 0.7);
            }
            ctx.stroke(); ctx.restore();
          }
        } else if (variant === 1) {
          for (let i = 0; i < 8; i++) {
            ctx.save(); ctx.rotate(i * Math.PI / 4);
            ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -fSz * 0.45);
            ctx.stroke(); ctx.restore();
          }
        } else {
          ctx.fillStyle = color;
          for (let i = 0; i < 4; i++) {
            ctx.save(); ctx.rotate(i * Math.PI / 2);
            ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -fSz * 0.45); ctx.stroke();
            ctx.beginPath(); ctx.arc(0, -fSz * 0.45, fSz * 0.07, 0, Math.PI * 2); ctx.fill();
            ctx.restore();
          }
        }
        ctx.restore();
      }
      break;
    }
    case 'rain': {
      ctx.strokeStyle = '#5599ff'; ctx.lineWidth = Math.max(1, sz * 0.06); ctx.globalAlpha = 0.7;
      for (let i = 0; i < 4; i++) {
        const ox = rnd(-sz * 0.6, sz * 0.6), oy = rnd(-sz * 0.4, sz * 0.4), l = rnd(sz * 0.2, sz * 0.4);
        ctx.beginPath(); ctx.moveTo(x + ox, y + oy); ctx.lineTo(x + ox + l * 0.25, y + oy + l); ctx.stroke();
      }
      break;
    }
    case 'fire': {
      ctx.save();
      const baseGlow = ctx.createRadialGradient(x, y, 0, x, y, sz * 0.65);
      baseGlow.addColorStop(0, 'rgba(255,120,0,0.6)');
      baseGlow.addColorStop(1, 'rgba(255,60,0,0)');
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = baseGlow;
      ctx.beginPath();
      ctx.ellipse(x, y, sz * 0.65, sz * 0.28, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      ctx.globalAlpha = 0.85;
      const numTongues = Math.floor(rnd(4, 8));
      for (let i = 0; i < numTongues; i++) {
        const ox = rnd(-sz * 0.4, sz * 0.4);
        const h = rnd(sz * 0.4, sz * 1.1);
        const w = rnd(sz * 0.07, sz * 0.18);
        const leanX = rnd(-sz * 0.18, sz * 0.18);
        const gr = ctx.createLinearGradient(x + ox, y, x + ox + leanX, y - h);
        gr.addColorStop(0, `hsl(${rnd(35, 52)},100%,${rnd(85, 100)}%)`);
        gr.addColorStop(0.3, `hsl(${rnd(18, 35)},100%,${rnd(55, 70)}%)`);
        gr.addColorStop(0.7, `hsl(${rnd(0, 15)},100%,${rnd(35, 50)}%)`);
        gr.addColorStop(1, 'rgba(80,0,0,0)');
        ctx.fillStyle = gr;
        ctx.beginPath();
        ctx.moveTo(x + ox - w, y);
        ctx.bezierCurveTo(
          x + ox - w + rnd(-sz * 0.08, sz * 0.08), y - h * 0.4,
          x + ox + leanX + rnd(-sz * 0.06, sz * 0.06), y - h * 0.7,
          x + ox + leanX, y - h
        );
        ctx.bezierCurveTo(
          x + ox + leanX + rnd(-sz * 0.06, sz * 0.06), y - h * 0.7,
          x + ox + w + rnd(-sz * 0.08, sz * 0.08), y - h * 0.4,
          x + ox + w, y
        );
        ctx.closePath();
        ctx.fill();
      }
      break;
    }
    case 'smoke': {
      ctx.globalAlpha = 0.6;
      for (let i = 0; i < 4; i++) {
        const ox = rnd(-sz * 0.5, sz * 0.5), oy = rnd(-sz * 0.3, sz * 0.3);
        const r = rnd(sz * 0.2, sz * 0.45);
        const lightness = rnd(40, 78);
        const gr = ctx.createRadialGradient(x + ox, y + oy, 0, x + ox, y + oy, r);
        gr.addColorStop(0, `hsl(0,0%,${lightness + 15}%)`);
        gr.addColorStop(1, `hsla(0,0%,${lightness}%,0)`);
        ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(x + ox, y + oy, r, 0, Math.PI * 2); ctx.fill();
      }
      break;
    }
    case 'lava': {
      ctx.globalAlpha = 0.88;
      const perpNx = -dy, perpNy = dx;
      const numDrops = Math.floor(rnd(2, 4));
      for (let i = 0; i < numDrops; i++) {
        const perpOff = rnd(-sz * 0.4, sz * 0.4);
        const cx = x + perpNx * perpOff;
        const cy = y + perpNy * perpOff;
        const r = rnd(sz * 0.25, sz * 0.45);
        const angle = (dx === 0 && dy === 0) ? 0 : Math.atan2(dy, dx);
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(angle);
        const rl = r * 1.1, rw = r * 0.6;
        const gr = ctx.createRadialGradient(-rw * 0.3, 0, 0, 0, 0, rl * 1.2);
        gr.addColorStop(0, 'hsl(45,100%,85%)');
        gr.addColorStop(0.3, 'hsl(25,100%,65%)');
        gr.addColorStop(0.7, 'hsl(10,100%,45%)');
        gr.addColorStop(1, 'hsl(0,80%,25%)');
        ctx.beginPath();
        ctx.moveTo(-rw * 0.8, 0);
        ctx.bezierCurveTo(-rw * 0.8, -rw, rl * 0.7, -rw * 0.5, rl, 0);
        ctx.bezierCurveTo(rl * 0.7, rw * 0.5, -rw * 0.8, rw, -rw * 0.8, 0);
        ctx.closePath();
        ctx.fillStyle = gr;
        ctx.fill();
        const tipGlow = ctx.createRadialGradient(rl * 0.85, 0, 0, rl * 0.85, 0, rw * 0.5);
        tipGlow.addColorStop(0, 'rgba(255,230,100,0.9)');
        tipGlow.addColorStop(1, 'rgba(255,100,0,0)');
        ctx.beginPath();
        ctx.arc(rl * 0.85, 0, rw * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = tipGlow;
        ctx.fill();
        ctx.restore();
      }
      break;
    }
    case 'stars': {
      const pts = Math.random() < 0.5 ? 5 : 6;
      ctx.translate(x + rnd(-sz * 1.0, sz * 1.0), y + rnd(-sz * 1.0, sz * 1.0));
      ctx.rotate(rnd(0, Math.PI * 2));
      ctx.fillStyle = color;
      ctx.globalAlpha = rnd(0.7, 1.0);
      const outer = rnd(sz * 0.25, sz * 0.55), inner = outer * 0.42;
      ctx.beginPath();
      for (let i = 0; i < pts * 2; i++) {
        const r2 = i % 2 === 0 ? outer : inner, a = (i / (pts * 2)) * Math.PI * 2 - Math.PI / 2;
        if (i === 0) ctx.moveTo(Math.cos(a) * r2, Math.sin(a) * r2); else ctx.lineTo(Math.cos(a) * r2, Math.sin(a) * r2);
      }
      ctx.closePath(); ctx.fill(); break;
    }
    case 'sparkles': {
      ctx.translate(x + rnd(-sz * 0.4, sz * 0.4), y + rnd(-sz * 0.4, sz * 0.4));
      ctx.rotate(rnd(0, Math.PI / 4));
      ctx.fillStyle = color; ctx.globalAlpha = rnd(0.6, 1);
      const outer = rnd(sz * 0.15, sz * 0.4), inner = outer * 0.15;
      ctx.beginPath();
      for (let i = 0; i < 8; i++) {
        const r2 = i % 2 === 0 ? outer : inner, a = (i / 8) * Math.PI * 2;
        if (i === 0) ctx.moveTo(Math.cos(a) * r2, Math.sin(a) * r2); else ctx.lineTo(Math.cos(a) * r2, Math.sin(a) * r2);
      }
      ctx.closePath(); ctx.fill(); break;
    }
    case 'lightbeam': {
      ctx.translate(x, y); ctx.rotate(rnd(0, Math.PI));
      const [r, g, b] = hexToRgb(color);
      for (let i = 0; i < 8; i++) {
        ctx.save(); ctx.rotate(i * Math.PI * 2 / 8);
        const len = rnd(sz * 0.3, sz * 0.9), w = rnd(sz * 0.03, sz * 0.12);
        const gr = ctx.createLinearGradient(0, 0, 0, -len);
        gr.addColorStop(0, `rgba(${r},${g},${b},0.8)`); gr.addColorStop(1, `rgba(${r},${g},${b},0)`);
        ctx.fillStyle = gr;
        ctx.beginPath(); ctx.moveTo(-w, 0); ctx.lineTo(w, 0); ctx.lineTo(0, -len); ctx.closePath(); ctx.fill();
        ctx.restore();
      }
      break;
    }
    case 'bubble': {
      const [rb, gb, bb] = hexToRgb(color);
      const numBubbles = Math.random() < 0.35 ? 2 : 1;
      for (let n = 0; n < numBubbles; n++) {
        const br = rnd(sz * 0.2, sz * 0.55);
        const ox = rnd(-sz * 0.3, sz * 0.3), oy = rnd(-sz * 0.3, sz * 0.3);
        const bx = x + ox, by = y + oy;
        ctx.globalAlpha = 1;
        ctx.beginPath(); ctx.arc(bx, by, br, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${rb},${gb},${bb},0.12)`; ctx.fill();
        ctx.beginPath(); ctx.arc(bx, by, br, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${rb},${gb},${bb},0.7)`;
        ctx.lineWidth = Math.max(1, sz * 0.04); ctx.stroke();
        ctx.beginPath();
        ctx.arc(bx - br * 0.12, by - br * 0.12, br * 0.78, -Math.PI * 0.88, -Math.PI * 0.22);
        ctx.strokeStyle = 'rgba(255,255,255,0.65)';
        ctx.lineWidth = Math.max(1.5, sz * 0.055); ctx.stroke();
        ctx.beginPath(); ctx.arc(bx - br * 0.32, by - br * 0.32, br * 0.18, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.fill();
      }
      break;
    }
    case 'watersplash': {
      ctx.globalAlpha = 0.82;
      const baseAngle = (dx === 0 && dy === 0) ? -Math.PI / 2 : Math.atan2(dy, dx);
      const numStreaks = Math.floor(rnd(4, 7));
      for (let i = 0; i < numStreaks; i++) {
        const spreadAngle = baseAngle + rnd(-Math.PI / 3, Math.PI / 3);
        const len = rnd(sz * 0.4, sz * 0.9);
        const endX = x + Math.cos(spreadAngle) * len;
        const endY = y + Math.sin(spreadAngle) * len;
        const cpX = x + Math.cos(spreadAngle + rnd(-0.25, 0.25)) * len * 0.55;
        const cpY = y + Math.sin(spreadAngle + rnd(-0.25, 0.25)) * len * 0.55;
        const streakGrad = ctx.createLinearGradient(x, y, endX, endY);
        streakGrad.addColorStop(0, 'rgba(85,153,255,0.9)');
        streakGrad.addColorStop(1, 'rgba(85,153,255,0)');
        ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(cpX, cpY, endX, endY);
        ctx.strokeStyle = streakGrad; ctx.lineWidth = Math.max(1, sz * 0.048); ctx.lineCap = 'round'; ctx.stroke();
        const dropR = rnd(sz * 0.04, sz * 0.1);
        ctx.beginPath(); ctx.arc(endX, endY, dropR, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(85,153,255,0.8)'; ctx.fill();
      }
      break;
    }
    case 'leaf': {
      ctx.translate(x + rnd(-sz * 1.2, sz * 1.2), y + rnd(-sz * 1.2, sz * 1.2));
      ctx.rotate(rnd(0, Math.PI * 2));
      ctx.fillStyle = color; ctx.globalAlpha = 0.85;
      const l = rnd(sz * 0.3, sz * 0.7), w = l * rnd(0.32, 0.5);
      const variant = Math.floor(Math.random() * 3);
      ctx.beginPath();
      if (variant === 0) {
        ctx.moveTo(0, -l / 2);
        ctx.bezierCurveTo(w, -l * 0.1, w, l * 0.1, 0, l / 2);
        ctx.bezierCurveTo(-w, l * 0.1, -w, -l * 0.1, 0, -l / 2);
      } else if (variant === 1) {
        const pw = w * 0.55;
        ctx.moveTo(0, -l / 2);
        ctx.bezierCurveTo(pw, -l * 0.12, pw * 1.1, l * 0.06, 0, l / 2);
        ctx.bezierCurveTo(-pw * 1.1, l * 0.06, -pw, -l * 0.12, 0, -l / 2);
      } else {
        const ww = w * 1.45;
        ctx.moveTo(0, -l * 0.34);
        ctx.bezierCurveTo(ww, -l * 0.04, ww, l * 0.22, 0, l * 0.42);
        ctx.bezierCurveTo(-ww, l * 0.22, -ww, -l * 0.04, 0, -l * 0.34);
      }
      ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,0.2)'; ctx.lineWidth = Math.max(0.5, sz * 0.03);
      ctx.beginPath();
      if (variant === 2) { ctx.moveTo(0, -l * 0.34); ctx.lineTo(0, l * 0.42); }
      else { ctx.moveTo(0, -l / 2); ctx.lineTo(0, l / 2); }
      ctx.stroke(); break;
    }
    case 'heart-brush': {
      const s = rnd(sz * 0.3, sz * 0.6);
      const ox = rnd(-sz * 0.8, sz * 0.8), oy = rnd(-sz * 0.6, sz * 0.6);
      ctx.translate(x + ox, y + oy); ctx.rotate(rnd(-0.4, 0.4));
      ctx.shadowColor = 'rgba(0,0,0,0.35)';
      ctx.shadowBlur = 6;
      ctx.shadowOffsetX = 1.5;
      ctx.shadowOffsetY = 2;
      ctx.scale(s, s);
      ctx.globalAlpha = 0.9;
      const [hr, hg, hb] = hexToRgb(color);
      const gr = ctx.createRadialGradient(0, 0.2, 0, 0, 0.5, 1.4);
      gr.addColorStop(0, color);
      gr.addColorStop(1, `rgb(${Math.max(0, hr - 80)},${Math.max(0, hg - 80)},${Math.max(0, hb - 80)})`);

      ctx.fillStyle = gr;
      ctx.beginPath(); ctx.moveTo(0, 0.35);
      ctx.bezierCurveTo(0, 0, -0.5, -0.6, -1, -0.35); ctx.bezierCurveTo(-1.5, -0.1, -1.5, 0.7, 0, 1.2);
      ctx.bezierCurveTo(1.5, 0.7, 1.5, -0.1, 1, -0.35); ctx.bezierCurveTo(0.5, -0.6, 0, 0, 0, 0.35);
      ctx.fill();
      ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0;
      ctx.fillStyle = 'rgba(255,255,255,0.45)';
      ctx.beginPath();
      ctx.ellipse(-0.44, -0.14, 0.28, 0.17, -0.5, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'spiderweb': {
      ctx.translate(x, y); ctx.strokeStyle = color; ctx.lineWidth = Math.max(0.5, sz * 0.035); ctx.globalAlpha = 0.7;
      const mr = sz * 0.5;
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * mr, Math.sin(a) * mr); ctx.stroke();
      }
      for (let ring = 1; ring <= 3; ring++) {
        const rad = (ring / 3) * mr; ctx.beginPath();
        for (let i = 0; i <= 6; i++) {
          const a = (i / 6) * Math.PI * 2;
          if (i === 0) ctx.moveTo(Math.cos(a) * rad, Math.sin(a) * rad); else ctx.lineTo(Math.cos(a) * rad, Math.sin(a) * rad);
        }
        ctx.closePath(); ctx.stroke();
      }
      break;
    }
    case 'streamer': {
      ctx.globalAlpha = 0.85;
      for (let i = 0; i < 6; i++) {
        ctx.strokeStyle = `hsl(${rnd(0, 360)},100%,55%)`; ctx.lineWidth = Math.max(1.5, sz * 0.07);
        const ox = rnd(-sz * 0.5, sz * 0.5), oy = rnd(-sz * 0.4, sz * 0.4);
        const len = rnd(sz * 0.2, sz * 0.6), a = rnd(0, Math.PI * 2), cv = rnd(-sz * 0.3, sz * 0.3);
        ctx.beginPath(); ctx.moveTo(x + ox, y + oy);
        ctx.quadraticCurveTo(x + ox + Math.cos(a + Math.PI / 2) * cv, y + oy + Math.sin(a + Math.PI / 2) * cv, x + ox + Math.cos(a) * len, y + oy + Math.sin(a) * len);
        ctx.stroke();
      }
      break;
    }
  }
  ctx.restore();
}

function drawRainbowBand(ctx: CanvasRenderingContext2D, px: number, py: number, x: number, y: number, width: number) {
  const bands = 7, dx = x - px, dy = y - py, len = Math.hypot(dx, dy);
  if (len < 0.5) return;
  const nx = -dy / len, ny = dx / len;
  ctx.save(); ctx.lineCap = 'round'; ctx.lineWidth = width * 0.9;
  for (let i = 0; i < bands; i++) {
    const t = (i / (bands - 1) - 0.5) * width * bands * 0.5;
    ctx.strokeStyle = `hsl(${(i / bands) * 360},100%,55%)`;
    ctx.beginPath(); ctx.moveTo(px + nx * t, py + ny * t); ctx.lineTo(x + nx * t, y + ny * t); ctx.stroke();
  }
  ctx.restore();
}

function drawCandyCane(ctx: CanvasRenderingContext2D, px: number, py: number, x: number, y: number, width: number, phaseRef: { current: number }) {
  const dist = Math.hypot(x - px, y - py);
  if (dist < 0.5) return;
  const stripeLen = Math.max(3, width * 1.2);
  const phase = phaseRef.current % (stripeLen * 2);
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(px, py);
  ctx.lineTo(x, y);
  ctx.strokeStyle = phase < stripeLen ? '#e8253e' : '#ffffff';
  ctx.lineWidth = width * 2.5;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.globalAlpha = 1;
  ctx.stroke();
  ctx.restore();
  phaseRef.current += dist;
}

// ─── Geometric shape helpers ────────────────────────────────────────────────────
function drawPolygon(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, sides: number) {
  ctx.beginPath();
  for (let i = 0; i < sides; i++) {
    const a = (i / sides) * Math.PI * 2 - Math.PI / 2;
    if (i === 0) ctx.moveTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
    else ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
  }
  ctx.closePath();
}

function drawStarPath(ctx: CanvasRenderingContext2D, cx: number, cy: number, outer: number, inner: number, pts: number) {
  ctx.beginPath();
  for (let i = 0; i < pts * 2; i++) {
    const r = i % 2 === 0 ? outer : inner, a = (i / (pts * 2)) * Math.PI * 2 - Math.PI / 2;
    if (i === 0) ctx.moveTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
    else ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
  }
  ctx.closePath();
}

function drawHeartPath(ctx: CanvasRenderingContext2D, cx: number, cy: number, w: number, h: number) {
  ctx.beginPath();
  ctx.moveTo(cx, cy + h * 0.3);
  ctx.bezierCurveTo(cx, cy - h * 0.1, cx - w * 1.2, cy - h * 0.5, cx - w, cy - h * 0.3);
  ctx.bezierCurveTo(cx - w * 0.5, cy - h * 1.0, cx, cy - h * 0.55, cx, cy - h * 0.2);
  ctx.bezierCurveTo(cx, cy - h * 0.55, cx + w * 0.5, cy - h * 1.0, cx + w, cy - h * 0.3);
  ctx.bezierCurveTo(cx + w * 1.2, cy - h * 0.5, cx, cy - h * 0.1, cx, cy + h * 0.3);
  ctx.closePath();
}

function strokeGeometricShape(ctx: CanvasRenderingContext2D, sx: number, sy: number, ex: number, ey: number, shape: DrawShape) {
  const cx = (sx + ex) / 2, cy = (sy + ey) / 2;
  const rw = Math.abs(ex - sx) / 2, rh = Math.abs(ey - sy) / 2;
  const r = Math.hypot(ex - cx, ey - cy);
  ctx.beginPath();
  switch (shape) {
    case 'line': ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.stroke(); return;
    case 'rectangle': ctx.rect(sx, sy, ex - sx, ey - sy); break;
    case 'square': { const s = Math.min(Math.abs(ex - sx), Math.abs(ey - sy)); ctx.rect(sx, sy, s * (ex >= sx ? 1 : -1), s * (ey >= sy ? 1 : -1)); break; }
    case 'circle': ctx.arc(cx, cy, r, 0, Math.PI * 2); break;
    case 'heart': drawHeartPath(ctx, cx, cy, rw, rh); break;
    case 'hexagon': drawPolygon(ctx, cx, cy, r, 6); break;
    case 'star': drawStarPath(ctx, cx, cy, r, r * 0.42, 5); break;
    case 'diamond': ctx.moveTo(cx, cy - rh); ctx.lineTo(cx + rw, cy); ctx.lineTo(cx, cy + rh); ctx.lineTo(cx - rw, cy); ctx.closePath(); break;
    case 'octagon': drawPolygon(ctx, cx, cy, r, 8); break;
    case 'pentagon': drawPolygon(ctx, cx, cy, r, 5); break;
    default: return;
  }
  ctx.stroke();
}

// ─── Component ──────────────────────────────────────────────────────────────────
const Whiteboard: React.FC<WhiteboardProps> = ({ isFullscreen }) => {
  const [color, setColor] = useState('#000000');
  const [width, setWidth] = useState(6);
  const [brush, setBrush] = useState<Brush>('pen');
  const [drawShape, setDrawShape] = useState<DrawShape>('none');
  const [style, setStyle] = useState<Style>('solid');
  const [isErasing, setIsErasing] = useState(false);
  const [isStamp, setIsStamp] = useState(false);
  const [canUndo, setCanUndo] = useState(false);
  const [stampSize, setStampSize] = useState(80);
  const [flashcardDecks, setFlashcardDecks] = useState<Record<string, FlashcardItem[]>>({});
  const [stampModalOpen, setStampModalOpen] = useState(false);
  const [stampModalView, setStampModalView] = useState<'sets' | 'cards'>('sets');
  const [stampModalSet, setStampModalSet] = useState('');
  const [selectedStampSrc, setSelectedStampSrc] = useState('');

  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rainbowCanvasRef = useRef<HTMLCanvasElement>(null);
  const tempCanvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const prevPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const lastParticleRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const historyRef = useRef<HistoryEntry[]>([]);
  const rainbowStrokesRef = useRef<RainbowStroke[]>([]);
  const eraseStrokesRef = useRef<Stroke[]>([]);
  const currentStrokeRef = useRef<RainbowStroke | Stroke | null>(null);
  const rainbowHueRef = useRef(0);
  const candyPhaseRef = useRef(0);
  const isRainbowAnimRef = useRef(false);
  const currentStampRef = useRef<HTMLImageElement | null>(null);
  const rafIdRef = useRef(0);

  const controlsRef = useRef({
    color: '#000000', width: 6,
    brush: 'pen' as Brush, drawShape: 'none' as DrawShape, style: 'solid' as Style,
    isErasing: false, isStamp: false, stampSize: 80,
  });
  useEffect(() => {
    controlsRef.current = { color, width, brush, drawShape, style, isErasing, isStamp, stampSize };
  }, [color, width, brush, drawShape, style, isErasing, isStamp, stampSize]);

  const drawFnsRef = useRef({ undo: () => {}, clear: () => {}, save: () => {} });

  useEffect(() => { getAllDecks().then(setFlashcardDecks); }, []);

  // ─── Main canvas setup (runs once) ─────────────────────────────────────────
  useEffect(() => {
    const wrapper = wrapperRef.current!;
    const canvas = canvasRef.current!;
    const rainbowCanvas = rainbowCanvasRef.current!;
    const tempCanvas = tempCanvasRef.current!;
    const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
    const rainbowCtx = rainbowCanvas.getContext('2d')!;
    const tempCtx = tempCanvas.getContext('2d')!;

    function applyStyle(context: CanvasRenderingContext2D) {
      const c = controlsRef.current;
      context.strokeStyle = c.isErasing ? '#ffffff' : c.color;
      context.fillStyle = c.isErasing ? '#ffffff' : c.color;
      context.lineWidth = c.width;
      context.lineCap = 'round';
      context.lineJoin = 'round';
      context.setLineDash([]);
      context.globalAlpha = 1.0;
      if (!c.isErasing) {
        if (c.style === 'dashed') context.setLineDash([c.width * 2, c.width * 1.5]);
        else if (c.style === 'dotted') context.setLineDash([1, c.width * 1.5]);
      }
    }

    function animateRainbow() {
      if (!isRainbowAnimRef.current) return;
      rainbowHueRef.current = (rainbowHueRef.current + 1) % 360;
      rainbowCtx.clearRect(0, 0, rainbowCanvas.width, rainbowCanvas.height);
      rainbowCtx.globalCompositeOperation = 'source-over';
      rainbowStrokesRef.current.forEach(s => {
        if (!s.path.length) return;
        rainbowCtx.beginPath();
        rainbowCtx.moveTo(s.path[0].x, s.path[0].y);
        s.path.forEach(p => rainbowCtx.lineTo(p.x, p.y));
        rainbowCtx.strokeStyle = `hsl(${(rainbowHueRef.current + s.hueOffset) % 360},100%,50%)`;
        rainbowCtx.lineWidth = s.width;
        rainbowCtx.lineCap = 'round';
        rainbowCtx.lineJoin = 'round';
        rainbowCtx.stroke();
      });
      if (eraseStrokesRef.current.length > 0) {
        rainbowCtx.globalCompositeOperation = 'destination-out';
        eraseStrokesRef.current.forEach(s => {
          if (!s.path.length) return;
          rainbowCtx.beginPath();
          rainbowCtx.moveTo(s.path[0].x, s.path[0].y);
          s.path.forEach(p => rainbowCtx.lineTo(p.x, p.y));
          rainbowCtx.strokeStyle = 'rgba(0,0,0,1)';
          rainbowCtx.lineWidth = s.width; rainbowCtx.lineCap = 'round'; rainbowCtx.lineJoin = 'round';
          rainbowCtx.stroke();
        });
        rainbowCtx.globalCompositeOperation = 'source-over';
      }
      rafIdRef.current = requestAnimationFrame(animateRainbow);
    }

    function startRainbow() { if (!isRainbowAnimRef.current) { isRainbowAnimRef.current = true; animateRainbow(); } }
    function restartRainbow() { cancelAnimationFrame(rafIdRef.current); isRainbowAnimRef.current = true; animateRainbow(); }
    function stopRainbow() { isRainbowAnimRef.current = false; cancelAnimationFrame(rafIdRef.current); rainbowCtx.clearRect(0, 0, rainbowCanvas.width, rainbowCanvas.height); }

    function saveState() {
      const h = historyRef.current;
      if (h.length >= HISTORY_LIMIT) h.shift();
      h.push({ static: canvas.toDataURL(), rainbow: JSON.parse(JSON.stringify(rainbowStrokesRef.current)), erase: JSON.parse(JSON.stringify(eraseStrokesRef.current)), width: canvas.clientWidth, height: canvas.clientHeight });
      setCanUndo(h.length > 1);
    }

    function stampDims(img: HTMLImageElement, size: number) {
      const r = img.naturalWidth / Math.max(img.naturalHeight, 1);
      return r > 1 ? { w: size, h: size / r } : { w: size * r, h: size };
    }

    function getPos(e: MouseEvent | TouchEvent) {
      const rect = canvas.getBoundingClientRect();
      const t = (e as TouchEvent).touches?.[0] ?? (e as TouchEvent).changedTouches?.[0];
      return { x: (t ? t.clientX : (e as MouseEvent).clientX) - rect.left, y: (t ? t.clientY : (e as MouseEvent).clientY) - rect.top };
    }

    const onDown = (e: Event) => {
      if ((e as MouseEvent).button && (e as MouseEvent).button !== 0) return;
      const c = controlsRef.current;
      const pos = getPos(e as MouseEvent | TouchEvent);

      if (c.isStamp && !c.isErasing) {
        const img = currentStampRef.current;
        if (!img) return;
        const { w, h } = stampDims(img, c.stampSize);
        ctx.drawImage(img, pos.x - w / 2, pos.y - h / 2, w, h);
        if (c.style === 'mirror') ctx.drawImage(img, canvas.clientWidth - pos.x - w / 2, pos.y - h / 2, w, h);
        saveState(); return;
      }

      isDrawingRef.current = true;
      startXRef.current = pos.x;
      startYRef.current = pos.y;
      prevPosRef.current = { ...pos };
      lastParticleRef.current = { ...pos };

      if (c.isErasing) {
        const s: Stroke = { path: [pos], width: c.width };
        currentStrokeRef.current = s;
        eraseStrokesRef.current.push(s);
        startRainbow();
      } else if (c.drawShape === 'none') {
        if (c.style === 'rainbow' && c.brush === 'pen') {
          const s: RainbowStroke = { path: [pos], width: c.width, hueOffset: Math.random() * 360 };
          currentStrokeRef.current = s;
          rainbowStrokesRef.current.push(s);
          startRainbow();
        } else if (c.brush !== 'pen' && c.brush !== 'rainbow-band' && c.brush !== 'candy') {
          emitParticle(ctx, c.brush, pos.x, pos.y, c.color, c.width * 3, 0, 0);
          if (c.style === 'mirror') emitParticle(ctx, c.brush, canvas.clientWidth - pos.x, pos.y, c.color, c.width * 3, 0, 0);
        } else if (c.brush === 'candy') {
          candyPhaseRef.current = 0;
        }
      }
    };

    const onMove = (e: Event) => {
      e.preventDefault();
      const c = controlsRef.current;
      const pos = getPos(e as MouseEvent | TouchEvent);

      if (c.isStamp && !c.isErasing) {
        const img = currentStampRef.current;
        if (!img) return;
        const { w, h } = stampDims(img, c.stampSize);
        tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
        tempCtx.globalAlpha = 0.7;
        tempCtx.drawImage(img, pos.x - w / 2, pos.y - h / 2, w, h);
        if (c.style === 'mirror') tempCtx.drawImage(img, canvas.clientWidth - pos.x - w / 2, pos.y - h / 2, w, h);
        tempCtx.globalAlpha = 1;
        return;
      }

      if (c.drawShape !== 'none' && !c.isErasing && isDrawingRef.current) {
        applyStyle(tempCtx);
        tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
        strokeGeometricShape(tempCtx, startXRef.current, startYRef.current, pos.x, pos.y, c.drawShape);
        if (c.style === 'mirror') strokeGeometricShape(tempCtx, canvas.clientWidth - startXRef.current, startYRef.current, canvas.clientWidth - pos.x, pos.y, c.drawShape);
        return;
      }

      if (!isDrawingRef.current) return;

      if (c.isErasing) {
        if (currentStrokeRef.current) currentStrokeRef.current.path.push(pos);
        applyStyle(ctx);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
        prevPosRef.current = { ...pos };
        return;
      }

      if (c.style === 'rainbow' && c.brush === 'pen') {
        if (currentStrokeRef.current) currentStrokeRef.current.path.push(pos);
        prevPosRef.current = { ...pos };
        return;
      }

      const prev = prevPosRef.current;

      if (c.brush === 'pen') {
        applyStyle(ctx);
        ctx.beginPath(); ctx.moveTo(prev.x, prev.y); ctx.lineTo(pos.x, pos.y); ctx.stroke();
        if (c.style === 'mirror') {
          ctx.beginPath(); ctx.moveTo(canvas.clientWidth - prev.x, prev.y); ctx.lineTo(canvas.clientWidth - pos.x, pos.y); ctx.stroke();
        }
      } else if (c.brush === 'rainbow-band') {
        drawRainbowBand(ctx, prev.x, prev.y, pos.x, pos.y, c.width);
        if (c.style === 'mirror') drawRainbowBand(ctx, canvas.clientWidth - prev.x, prev.y, canvas.clientWidth - pos.x, pos.y, c.width);
      } else if (c.brush === 'candy') {
        const phaseBeforeStroke = candyPhaseRef.current;
        drawCandyCane(ctx, prev.x, prev.y, pos.x, pos.y, c.width, candyPhaseRef);
        if (c.style === 'mirror') {
          const phaseAfterStroke = candyPhaseRef.current;
          candyPhaseRef.current = phaseBeforeStroke;
          drawCandyCane(ctx, canvas.clientWidth - prev.x, prev.y, canvas.clientWidth - pos.x, pos.y, c.width, candyPhaseRef);
          candyPhaseRef.current = phaseAfterStroke;
        }
      } else {
        const rawDx = pos.x - prev.x, rawDy = pos.y - prev.y;
        const dLen = Math.hypot(rawDx, rawDy);
        const ndx = dLen > 0 ? rawDx / dLen : 0;
        const ndy = dLen > 0 ? rawDy / dLen : 0;
        const spacing = BRUSH_SPACING[c.brush] ?? 10;
        const dist = Math.hypot(pos.x - lastParticleRef.current.x, pos.y - lastParticleRef.current.y);
        if (dist >= spacing) {
          emitParticle(ctx, c.brush, pos.x, pos.y, c.color, c.width * 3, ndx, ndy);
          if (c.style === 'mirror') emitParticle(ctx, c.brush, canvas.clientWidth - pos.x, pos.y, c.color, c.width * 3, -ndx, ndy);
          lastParticleRef.current = { ...pos };
        }
      }

      prevPosRef.current = { ...pos };
    };

    const onUp = (e: Event) => {
      if (!isDrawingRef.current) return;
      isDrawingRef.current = false;
      const c = controlsRef.current;
      const pos = getPos(e as MouseEvent | TouchEvent);

      if (c.drawShape !== 'none' && !c.isErasing) {
        applyStyle(ctx);
        strokeGeometricShape(ctx, startXRef.current, startYRef.current, pos.x, pos.y, c.drawShape);
        if (c.style === 'mirror') strokeGeometricShape(ctx, canvas.clientWidth - startXRef.current, startYRef.current, canvas.clientWidth - pos.x, pos.y, c.drawShape);
        tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
      } else if (c.isErasing) {
        ctx.closePath();
      }

      currentStrokeRef.current = null;
      saveState();
    };

    const onLeave = (e: Event) => {
      if (isDrawingRef.current) onUp(e);
      tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
    };

    drawFnsRef.current = {
      undo: () => {
        const h = historyRef.current;
        if (h.length <= 1) return;
        h.pop();
        const last = h[h.length - 1];
        rainbowStrokesRef.current = JSON.parse(JSON.stringify(last.rainbow));
        eraseStrokesRef.current = JSON.parse(JSON.stringify(last.erase));
        const needed = rainbowStrokesRef.current.length > 0 || eraseStrokesRef.current.length > 0;
        if (needed) restartRainbow(); else stopRainbow();
        const img = new Image();
        img.src = last.static;
        img.onload = () => { ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight); ctx.drawImage(img, 0, 0, canvas.clientWidth, canvas.clientHeight); };
        setCanUndo(h.length > 1);
      },
      clear: () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
        rainbowStrokesRef.current = []; eraseStrokesRef.current = [];
        stopRainbow();
        const h = historyRef.current;
        if (h.length >= HISTORY_LIMIT) h.shift();
        h.push({ static: canvas.toDataURL(), rainbow: [], erase: [], width: canvas.clientWidth, height: canvas.clientHeight });
        setCanUndo(h.length > 1);
      },
      save: () => {
        const dl = document.createElement('canvas');
        dl.width = canvas.width; dl.height = canvas.height;
        const dlCtx = dl.getContext('2d')!;
        dlCtx.fillStyle = 'white'; dlCtx.fillRect(0, 0, dl.width, dl.height);
        dlCtx.drawImage(canvas, 0, 0); dlCtx.drawImage(rainbowCanvas, 0, 0);
        const a = document.createElement('a');
        a.download = 'whiteboard-drawing.png'; a.href = dl.toDataURL('image/png'); a.click();
      },
    };

    const ro = new ResizeObserver(entries => {
      const { width: newW, height: newH } = entries[0].contentRect;
      const dpr = window.devicePixelRatio || 1;
      [canvas, rainbowCanvas, tempCanvas].forEach(c => {
        c.width = Math.round(newW * dpr); c.height = Math.round(newH * dpr);
        c.getContext('2d')!.scale(dpr, dpr);
      });
      applyStyle(ctx);
      const last = historyRef.current.at(-1);
      if (!last) { saveState(); return; }
      const sx = last.width > 0 ? newW / last.width : 1;
      const sy = last.height > 0 ? newH / last.height : 1;
      const avg = (sx + sy) / 2;
      const scaleStroke = <T extends Stroke>(s: T): T => ({ ...s, width: s.width * avg, path: s.path.map(p => ({ x: p.x * sx, y: p.y * sy })) });
      rainbowStrokesRef.current = last.rainbow.map(s => scaleStroke(s));
      eraseStrokesRef.current = last.erase.map(s => scaleStroke(s));
      const needed = rainbowStrokesRef.current.length > 0 || eraseStrokesRef.current.length > 0;
      if (needed) restartRainbow(); else stopRainbow();
      const img = new Image();
      img.src = last.static;
      img.onload = () => {
        ctx.clearRect(0, 0, newW, newH);
        const ir = img.naturalWidth / Math.max(img.naturalHeight, 1), cr = newW / Math.max(newH, 1);
        let dw = newW, dh = newH, dx = 0, dy = 0;
        if (ir > cr) { dh = newW / ir; dy = (newH - dh) / 2; } else { dw = newH * ir; dx = (newW - dw) / 2; }
        ctx.drawImage(img, dx, dy, dw, dh);
      };
    });
    ro.observe(wrapper);

    const opts = { passive: false } as AddEventListenerOptions;
    canvas.addEventListener('mousedown', onDown, opts);
    canvas.addEventListener('touchstart', onDown, opts);
    canvas.addEventListener('mousemove', onMove, opts);
    canvas.addEventListener('touchmove', onMove, opts);
    canvas.addEventListener('mouseup', onUp);
    canvas.addEventListener('touchend', onUp);
    canvas.addEventListener('mouseleave', onLeave);
    const timer = setTimeout(() => { applyStyle(ctx); saveState(); }, 100);

    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(rafIdRef.current);
      ro.disconnect();
      canvas.removeEventListener('mousedown', onDown);
      canvas.removeEventListener('touchstart', onDown);
      canvas.removeEventListener('mousemove', onMove);
      canvas.removeEventListener('touchmove', onMove);
      canvas.removeEventListener('mouseup', onUp);
      canvas.removeEventListener('touchend', onUp);
      canvas.removeEventListener('mouseleave', onLeave);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Stamp helpers ──────────────────────────────────────────────────────────
  function selectStamp(src: string) {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => { currentStampRef.current = img; };
    img.src = src;
    setSelectedStampSrc(src);
    setStampModalOpen(false);
  }

  const showStampControls = isFullscreen && isStamp;

  // ─── JSX ────────────────────────────────────────────────────────────────────
  return (
    <div className="wb-tool">
      <div className="wb-controls">

        {/* Color */}
        <div className="wb-color-group">
          <input type="color" value={color} onChange={e => { setColor(e.target.value); setIsErasing(false); }} className="wb-color-input" title="Color" />
          {isFullscreen && (
            <div className="wb-palette">
              {PALETTE.map(c => (
                <div key={c} className="wb-swatch" style={{ background: c, outline: c === color && !isErasing ? '3px solid #7CB342' : undefined }} onClick={() => { setColor(c); setIsErasing(false); }} />
              ))}
            </div>
          )}
        </div>

        {/* Size */}
        <div className="wb-tool-group">
          <label className="wb-label">Size</label>
          <input type="range" min="1" max="50" value={width} onChange={e => setWidth(parseInt(e.target.value))} className="wb-width-slider" />
        </div>

        {/* Draw / Erase */}
        <div className="wb-tool-group">
          <button className={`tool-btn wb-btn${!isErasing ? ' active' : ' inactive'}`} onClick={() => setIsErasing(false)}>✏️ Draw</button>
          <button className={`tool-btn wb-btn${isErasing ? ' active' : ' inactive'}`} onClick={() => { setIsErasing(true); setIsStamp(false); }}>🧹 Erase</button>
        </div>

        {/* Brush */}
        {isFullscreen && !isErasing && (
          <div className="wb-tool-group">
            <label className="wb-label">Brush</label>
            <select value={brush} onChange={e => { setBrush(e.target.value as Brush); setIsStamp(false); setDrawShape('none'); }}>
              <optgroup label="Standard">
                <option value="pen">Pen</option>
                <option value="airbrush">Air Brush</option>
                <option value="spray">Spray</option>
                <option value="rainbow-band">Rainbow Band</option>
              </optgroup>
              <optgroup label="Special Effects">
                <option value="flower">🌸 Flower</option>
                <option value="snow">❄ Snow</option>
                <option value="rain">🌧 Rain</option>
                <option value="fire">🔥 Fire</option>
                <option value="smoke">☁ Smoke</option>
                <option value="lava">🌋 Lava</option>
                <option value="stars">⭐ Stars</option>
                <option value="sparkles">✨ Sparkles</option>
                <option value="lightbeam">💫 Light Beam</option>
                <option value="bubble">🫧 Bubble</option>
                <option value="watersplash">💦 Water Splash</option>
                <option value="candy">🍬 Candy</option>
                <option value="leaf">🍃 Leaf</option>
                <option value="heart-brush">❤ Hearts</option>
                <option value="spiderweb">🕸 Spider Web</option>
                <option value="streamer">🎉 Streamer</option>
              </optgroup>
            </select>
          </div>
        )}

        {/* Shape */}
        {isFullscreen && (
          <div className="wb-tool-group">
            <label className="wb-label">Shape</label>
            <select value={drawShape} onChange={e => { setDrawShape(e.target.value as DrawShape); setIsStamp(false); }}>
              <option value="none">— None</option>
              <option value="line">Line</option>
              <option value="circle">Circle</option>
              <option value="square">Square</option>
              <option value="rectangle">Rectangle</option>
              <option value="heart">Heart</option>
              <option value="hexagon">Hexagon</option>
              <option value="star">Star</option>
              <option value="diamond">Diamond</option>
              <option value="octagon">Octagon</option>
              <option value="pentagon">Pentagon</option>
            </select>
          </div>
        )}

        {/* Style */}
        {isFullscreen && (
          <div className="wb-tool-group">
            <label className="wb-label">Style</label>
            <select value={style} onChange={e => setStyle(e.target.value as Style)}>
              <option value="solid">Solid</option>
              <option value="dashed">Dashed</option>
              <option value="dotted">Dotted</option>
              <option value="rainbow">Rainbow</option>
              <option value="mirror">Mirror</option>
            </select>
          </div>
        )}

        {/* Stamp button */}
        {isFullscreen && (
          <button
            type="button"
            className={`tool-btn wb-btn${isStamp ? ' active' : ' inactive'}`}
            onClick={() => { setIsStamp(p => !p); setIsErasing(false); setDrawShape('none'); }}
            title="Stamp"
          >
            🖼 Stamp
          </button>
        )}

        {/* Stamp inline controls */}
        {showStampControls && (
          <div className="wb-tool-group wb-stamp-inline">
            <button type="button" className="tool-btn wb-btn" onClick={() => { setStampModalView('sets'); setStampModalOpen(true); }}>
              Select Set
            </button>
            {selectedStampSrc && <img src={selectedStampSrc} className="wb-stamp-preview" alt="stamp" />}
            <label className="wb-label">
              Size <input type="range" min="20" max="300" value={stampSize} onChange={e => setStampSize(parseInt(e.target.value))} className="wb-stamp-size-slider" />
            </label>
          </div>
        )}

        {/* Actions */}
        <div className="wb-actions">
          <button className="tool-btn wb-btn" onClick={() => drawFnsRef.current.undo()} disabled={!canUndo}>↩ Undo</button>
          <button className="tool-btn wb-btn" onClick={() => drawFnsRef.current.clear()}>🗑 Clear</button>
          <button className="tool-btn wb-btn" onClick={() => drawFnsRef.current.save()}>💾 Save</button>
        </div>
      </div>

      {/* Canvas area */}
      <div className="wb-canvas-wrapper" ref={wrapperRef}>
        <canvas ref={canvasRef} className="wb-canvas" />
        <canvas ref={rainbowCanvasRef} className="wb-rainbow-canvas" />
        <canvas ref={tempCanvasRef} className="wb-temp-canvas" />

        {/* Stamp picker modal */}
        {stampModalOpen && (
          <div className="wb-stamp-overlay" onClick={() => setStampModalOpen(false)}>
            <div className="wb-stamp-modal" onClick={e => e.stopPropagation()}>
              <div className="wb-stamp-modal-header">
                {stampModalView === 'cards' && (
                  <button type="button" className="wb-stamp-back-btn" onClick={() => setStampModalView('sets')}>← Back</button>
                )}
                <span className="wb-stamp-modal-title">
                  {stampModalView === 'sets' ? 'Select a Set' : stampModalSet}
                </span>
                <button type="button" className="wb-stamp-close-btn" onClick={() => setStampModalOpen(false)}>✕</button>
              </div>
              <div className="wb-stamp-modal-grid">
                {stampModalView === 'sets'
                  ? Object.entries(flashcardDecks).map(([name, cards]) => {
                      const catId = name.startsWith('Tango: ') ? name.slice(7) : null;
                      const cover = (catId && WB_CATEGORY_IMAGE[catId]) ?? (cards as FlashcardItem[]).find(c => c.image)?.image;
                      const label = (catId && WB_CATEGORY_NAME[catId]) ?? name;
                      return (
                        <div key={name} className="wb-stamp-set-tile" onClick={() => { setStampModalSet(name); setStampModalView('cards'); }}>
                          {cover ? <img src={cover} alt={label} /> : <div className="wb-stamp-set-noimg">📁</div>}
                          <span>{label}</span>
                        </div>
                      );
                    })
                  : ((flashcardDecks[stampModalSet] as FlashcardItem[]) || [])
                      .filter(c => c.image)
                      .map((card, i) => (
                        <div key={i} className={`wb-stamp-card-tile${selectedStampSrc === card.image ? ' active' : ''}`} onClick={() => selectStamp(card.image!)}>
                          <img src={card.image} alt={card.text ?? ''} />
                          {card.text && <span>{card.text}</span>}
                        </div>
                      ))
                }
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Whiteboard;
