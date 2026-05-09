import { useMemo } from 'react';

interface Props {
    x1: number; y1: number; // bottom of ladder (start cell center)
    x2: number; y2: number; // top of ladder (end cell center)
    cellSize: number;
}

const LadderSVG: React.FC<Props> = ({ x1, y1, x2, y2, cellSize }) => {
    const derived = useMemo(() => {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const len = Math.sqrt(dx * dx + dy * dy);
        if (len < 1) return null;

        const railHalfGap = cellSize * 0.1;
        const perpX = (-dy / len) * railHalfGap;
        const perpY = (dx / len) * railHalfGap;

        const leftRail = {
            x1: x1 + perpX, y1: y1 + perpY,
            x2: x2 + perpX, y2: y2 + perpY,
        };
        const rightRail = {
            x1: x1 - perpX, y1: y1 - perpY,
            x2: x2 - perpX, y2: y2 - perpY,
        };

        const rungSpacing = cellSize * 0.38;
        const numRungs = Math.max(2, Math.floor(len / rungSpacing));
        const rungs: { x1: number; y1: number; x2: number; y2: number }[] = [];
        for (let i = 1; i < numRungs; i++) {
            const t = i / numRungs;
            const cx = x1 + dx * t;
            const cy = y1 + dy * t;
            rungs.push({
                x1: cx + perpX, y1: cy + perpY,
                x2: cx - perpX, y2: cy - perpY,
            });
        }

        const railW = Math.max(4, cellSize * 0.046);
        const rungW = Math.max(3, cellSize * 0.033);
        return { leftRail, rightRail, rungs, railW, rungW };
    }, [x1, y1, x2, y2, cellSize]);

    if (!derived) return null;
    const { leftRail, rightRail, rungs, railW, rungW } = derived;

    return (
        <g>
            {/* Drop shadow on rails */}
            {[leftRail, rightRail].map((r, i) => (
                <line key={`s${i}`}
                    x1={r.x1 + 3} y1={r.y1 + 3} x2={r.x2 + 3} y2={r.y2 + 3}
                    stroke="rgba(0,0,0,0.2)" strokeWidth={railW + 2} strokeLinecap="round"
                />
            ))}
            {/* Rails */}
            {[leftRail, rightRail].map((r, i) => (
                <line key={`r${i}`}
                    x1={r.x1} y1={r.y1} x2={r.x2} y2={r.y2}
                    stroke="#8B5E3C" strokeWidth={railW} strokeLinecap="round"
                    filter="url(#woodGrain)"
                />
            ))}
            {/* Rail highlight streak */}
            {[leftRail, rightRail].map((r, i) => (
                <line key={`h${i}`}
                    x1={r.x1 + 1} y1={r.y1 + 1} x2={r.x2 + 1} y2={r.y2 + 1}
                    stroke="rgba(255,255,255,0.25)" strokeWidth={railW * 0.3} strokeLinecap="round"
                />
            ))}
            {/* Rung shadows */}
            {rungs.map((rg, i) => (
                <line key={`rs${i}`}
                    x1={rg.x1 + 2} y1={rg.y1 + 2} x2={rg.x2 + 2} y2={rg.y2 + 2}
                    stroke="rgba(0,0,0,0.15)" strokeWidth={rungW + 1} strokeLinecap="round"
                />
            ))}
            {/* Rungs */}
            {rungs.map((rg, i) => (
                <line key={`rg${i}`}
                    x1={rg.x1} y1={rg.y1} x2={rg.x2} y2={rg.y2}
                    stroke="#A0724A" strokeWidth={rungW} strokeLinecap="round"
                    filter="url(#woodGrain)"
                />
            ))}
        </g>
    );
};

export default LadderSVG;
