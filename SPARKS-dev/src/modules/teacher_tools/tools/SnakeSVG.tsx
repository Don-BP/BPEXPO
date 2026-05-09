import { useMemo } from 'react';

export interface SnakePalette {
    primary: string;
    scale: string;
    belly: string;
}

export const SNAKE_PALETTES: SnakePalette[] = [
    { primary: '#2E7D32', scale: '#1B5E20', belly: '#A5D6A7' },
    { primary: '#C62828', scale: '#7B0000', belly: '#FFCDD2' },
    { primary: '#1565C0', scale: '#003c8f', belly: '#BBDEFB' },
    { primary: '#6A1B9A', scale: '#38006b', belly: '#E1BEE7' },
    { primary: '#E65100', scale: '#AC1900', belly: '#FFE0B2' },
    { primary: '#00695C', scale: '#003D33', belly: '#B2DFDB' },
    { primary: '#F57F17', scale: '#BC5100', belly: '#FFF9C4' },
    { primary: '#AD1457', scale: '#78002E', belly: '#FCE4EC' },
];

interface Props {
    x1: number; y1: number; // head position (start cell = high number)
    x2: number; y2: number; // tail position (end cell = low number)
    cellSize: number;
    palette: SnakePalette;
}

// Cubic bezier point at parameter t
const cb = (t: number, p0: number, p1: number, p2: number, p3: number) =>
    Math.pow(1 - t, 3) * p0 + 3 * Math.pow(1 - t, 2) * t * p1 +
    3 * (1 - t) * t * t * p2 + Math.pow(t, 3) * p3;

// Cubic bezier tangent (derivative) at t — proportional, not normalized
const cbd = (t: number, p0: number, p1: number, p2: number, p3: number) =>
    3 * Math.pow(1 - t, 2) * (p1 - p0) +
    6 * (1 - t) * t * (p2 - p1) +
    3 * t * t * (p3 - p2);

const norm = (x: number, y: number) => {
    const l = Math.sqrt(x * x + y * y) || 1;
    return { x: x / l, y: y / l };
};

const SnakeSVG: React.FC<Props> = ({ x1, y1, x2, y2, cellSize, palette }) => {
    const derived = useMemo(() => {
        const bw = cellSize * 0.27;
        const dx = x2 - x1;
        const dy = y2 - y1;
        const len = Math.sqrt(dx * dx + dy * dy);
        if (len < 1) return null;

        // Perpendicular unit vector (for S-curve offset)
        const perpX = -dy / len;
        const perpY = dx / len;
        const offset = len * 0.28;

        // Control points: CP1 offset +perp, CP2 offset -perp → S-curve
        const cp1x = x1 + dx * 0.3 + perpX * offset;
        const cp1y = y1 + dy * 0.3 + perpY * offset;
        const cp2x = x2 - dx * 0.3 - perpX * offset;
        const cp2y = y2 - dy * 0.3 - perpY * offset;

        const bodyPath = `M ${x1} ${y1} C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${x2} ${y2}`;

        // Head: tangent at t=0 is proportional to (cp1-x1, cp1-y1)
        // "Away from body" = reversed tangent
        const htx = x1 - cp1x;
        const hty = y1 - cp1y;
        const hDir = norm(htx, hty);         // unit vector pointing out from head
        const hPerp = { x: -hDir.y, y: hDir.x }; // perpendicular for eye placement

        // Scale ellipses: sample bezier at intervals
        const scaleSpacing = bw * 0.95;
        const numScales = Math.floor(len / scaleSpacing);
        const scales: { x: number; y: number; angleDeg: number }[] = [];
        for (let i = 2; i < numScales - 1; i++) {
            const t = i / numScales;
            const sx = cb(t, x1, cp1x, cp2x, x2);
            const sy = cb(t, y1, cp1y, cp2y, y2);
            const tdx = cbd(t, x1, cp1x, cp2x, x2);
            const tdy = cbd(t, y1, cp1y, cp2y, y2);
            const angleDeg = Math.atan2(tdy, tdx) * (180 / Math.PI);
            const tPerp = norm(-tdy, tdx);
            const rowShift = (i % 2 === 0 ? 1 : -1) * bw * 0.18;
            scales.push({ x: sx + tPerp.x * rowShift, y: sy + tPerp.y * rowShift, angleDeg });
        }

        // Tail: pointed triangle at end
        // Tangent at t=1 is proportional to (x2-cp2x, y2-cp2y)
        const ttangX = x2 - cp2x;
        const ttangY = y2 - cp2y;
        const tailDir = norm(ttangX, ttangY); // pointing away from body at tail
        const tailPerp = { x: -tailDir.y, y: tailDir.x };
        const tailBase = 0.88;
        const tbpx = cb(tailBase, x1, cp1x, cp2x, x2);
        const tbpy = cb(tailBase, y1, cp1y, cp2y, y2);
        const halfW = bw * 0.42;
        const tipX = x2 + tailDir.x * bw * 0.55;
        const tipY = y2 + tailDir.y * bw * 0.55;
        const tailPath = `M ${tbpx + tailPerp.x * halfW} ${tbpy + tailPerp.y * halfW} ` +
            `Q ${(tbpx + tipX) / 2} ${(tbpy + tipY) / 2} ${tipX} ${tipY} ` +
            `Q ${(tbpx + tipX) / 2} ${(tbpy + tipY) / 2} ` +
            `${tbpx - tailPerp.x * halfW} ${tbpy - tailPerp.y * halfW} Z`;

        const eyeR = bw * 0.19;
        const eyeOff = bw * 0.23;
        const eye1 = { cx: x1 + hPerp.x * eyeOff, cy: y1 + hPerp.y * eyeOff };
        const eye2 = { cx: x1 - hPerp.x * eyeOff, cy: y1 - hPerp.y * eyeOff };

        return { bodyPath, scales, tailPath, eye1, eye2, eyeR, bodyWidth: bw };
    }, [x1, y1, x2, y2, cellSize]);

    if (!derived) return null;
    const { bodyPath, scales, tailPath, eye1, eye2, eyeR, bodyWidth: bw } = derived;

    return (
        <g>
            {/* Drop shadow */}
            <path d={bodyPath} fill="none"
                stroke="rgba(0,0,0,0.2)" strokeWidth={bw + 4}
                strokeLinecap="round" transform="translate(3,3)"
            />

            {/* Body */}
            <path d={bodyPath} fill="none"
                stroke={palette.primary} strokeWidth={bw}
                strokeLinecap="round"
            />

            {/* Belly stripe */}
            <path d={bodyPath} fill="none"
                stroke={palette.belly} strokeWidth={bw * 0.3}
                strokeLinecap="round" opacity={0.5}
            />

            {/* Scales */}
            {scales.map((s, i) => (
                <ellipse key={i}
                    cx={s.x} cy={s.y}
                    rx={bw * 0.32} ry={bw * 0.18}
                    fill={palette.scale} opacity={0.6}
                    transform={`rotate(${s.angleDeg} ${s.x} ${s.y})`}
                />
            ))}

            {/* Tail tip */}
            <path d={tailPath} fill={palette.primary} stroke="none" />

            {/* Head circle */}
            <circle cx={x1} cy={y1} r={bw * 0.6} fill={palette.primary} />

            {/* Eyes */}
            {[eye1, eye2].map((e, i) => (
                <g key={i}>
                    <circle cx={e.cx} cy={e.cy} r={eyeR} fill="white" />
                    <circle cx={e.cx} cy={e.cy} r={eyeR * 0.58} fill="#111" />
                    <circle cx={e.cx + eyeR * 0.25} cy={e.cy - eyeR * 0.25} r={eyeR * 0.22} fill="white" />
                </g>
            ))}

        </g>
    );
};

export default SnakeSVG;
