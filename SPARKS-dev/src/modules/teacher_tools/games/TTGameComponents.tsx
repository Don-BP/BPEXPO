import React from 'react';
import ReactDOM from 'react-dom';

// Teacher Tools colour palette for games
export const TT = {
    bg: '#FFF9C4',
    card: 'white',
    text: '#3E2723',
    textLight: '#8D6E63',
    border: '#FDD835',
    shadow: '#F9A825',
};

type BtnVariant = 'green' | 'blue' | 'red' | 'orange' | 'purple' | 'yellow' | 'teal' | 'pink' | 'indigo' | 'default' | 'white';

const BTN: Record<BtnVariant, React.CSSProperties> = {
    green:  { background: 'linear-gradient(to bottom, #66BB6A, #43A047)', boxShadow: '0 4px 0 #1B5E20, 0 5px 10px rgba(0,0,0,0.15)' },
    blue:   { background: 'linear-gradient(to bottom, #42A5F5, #1E88E5)', boxShadow: '0 4px 0 #0D47A1, 0 5px 10px rgba(0,0,0,0.15)' },
    red:    { background: 'linear-gradient(to bottom, #EF5350, #E53935)', boxShadow: '0 4px 0 #B71C1C, 0 5px 10px rgba(0,0,0,0.15)' },
    orange: { background: 'linear-gradient(to bottom, #FFA726, #FB8C00)', boxShadow: '0 4px 0 #E65100, 0 5px 10px rgba(0,0,0,0.15)' },
    purple: { background: 'linear-gradient(to bottom, #AB47BC, #8E24AA)', boxShadow: '0 4px 0 #4A148C, 0 5px 10px rgba(0,0,0,0.15)' },
    yellow: { background: 'linear-gradient(to bottom, #FDD835, #F9A825)', boxShadow: '0 4px 0 #F57F17, 0 5px 10px rgba(0,0,0,0.15)', color: '#3E2723' },
    teal:   { background: 'linear-gradient(to bottom, #26A69A, #00897B)', boxShadow: '0 4px 0 #00695C, 0 5px 10px rgba(0,0,0,0.15)' },
    pink:   { background: 'linear-gradient(to bottom, #EC407A, #D81B60)', boxShadow: '0 4px 0 #880E4F, 0 5px 10px rgba(0,0,0,0.15)' },
    indigo: { background: 'linear-gradient(to bottom, #7E57C2, #5E35B1)', boxShadow: '0 4px 0 #1A237E, 0 5px 10px rgba(0,0,0,0.15)' },
    default:{ background: 'linear-gradient(to bottom, #78909C, #546E7A)', boxShadow: '0 4px 0 #263238, 0 5px 10px rgba(0,0,0,0.15)' },
    white:  { background: 'white', boxShadow: '0 4px 0 #CFD8DC, 0 5px 10px rgba(0,0,0,0.1)', color: '#37474F' },
};

const SIZE: Record<string, React.CSSProperties> = {
    sm: { padding: '6px 14px', fontSize: '0.8em', minHeight: '32px' },
    md: { padding: '9px 20px', fontSize: '0.95em', minHeight: '40px' },
    lg: { padding: '11px 26px', fontSize: '1.05em', minHeight: '46px' },
    xl: { padding: '14px 32px', fontSize: '1.2em', minHeight: '54px' },
};

interface TTBtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: BtnVariant;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    icon?: React.ReactNode;
}

export const TTBtn: React.FC<TTBtnProps> = ({ variant = 'blue', size = 'md', icon, children, disabled, style, onClick, ...rest }) => {
    const base = BTN[variant] ?? BTN.blue;
    // Extract the hard-shadow color from the base boxShadow string ("0 4px 0 COLOR, ...")
    // and pre-compute lift/press/normal shadow strings to avoid browser normalisation issues.
    const hardColor = (base.boxShadow as string).match(/0 4px 0 ([^,]+)/)?.[1]?.trim() ?? 'rgba(0,0,0,0.3)';
    const shadowNormal = `0 4px 0 ${hardColor}, 0 5px 10px rgba(0,0,0,0.15)`;
    const shadowHover  = `0 6px 0 ${hardColor}, 0 8px 14px rgba(0,0,0,0.18)`;
    const shadowPress  = `0 1px 0 ${hardColor}, 0 2px 4px rgba(0,0,0,0.12)`;
    return (
        <button
            {...rest}
            onClick={onClick}
            disabled={disabled}
            style={{
                ...base,
                ...SIZE[size],
                border: '2px solid rgba(255,255,255,0.55)',
                borderRadius: '50px',
                color: base.color ?? 'white',
                fontWeight: 800,
                fontFamily: 'Poppins, sans-serif',
                cursor: disabled ? 'not-allowed' : 'pointer',
                opacity: disabled ? 0.6 : 1,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                transition: 'transform 0.1s, box-shadow 0.1s',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                userSelect: 'none',
                whiteSpace: 'nowrap',
                ...style,
            }}
            onMouseEnter={e => { if (!disabled) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = shadowHover; } }}
            onMouseLeave={e => { if (!disabled) { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = shadowNormal; } }}
            onMouseDown={e => { if (!disabled) { e.currentTarget.style.transform = 'translateY(3px)'; e.currentTarget.style.boxShadow = shadowPress; } }}
            onMouseUp={e => { if (!disabled) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = shadowHover; } }}
        >
            {icon && <span style={{ display: 'flex', alignItems: 'center' }}>{icon}</span>}
            {children}
        </button>
    );
};

interface TTCardProps {
    children: React.ReactNode;
    style?: React.CSSProperties;
    className?: string;
    onClick?: () => void;
}

export const TTCard: React.FC<TTCardProps> = ({ children, style, onClick, className }) => (
    <div
        className={className}
        onClick={onClick}
        style={{
            background: 'white',
            borderRadius: '20px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
            overflow: 'hidden',
            position: 'relative',
            ...style,
        }}
    >
        {children}
    </div>
);

interface TTHeaderProps {
    text: string;
    color?: string;
    icon?: React.ReactNode;
    size?: 'sm' | 'md' | 'lg';
}

export const TTHeader: React.FC<TTHeaderProps> = ({ text, color = '#1E88E5', icon, size = 'md' }) => {
    const fontSize = size === 'sm' ? '0.9em' : size === 'lg' ? '1.5em' : '1.15em';
    const padding = size === 'sm' ? '8px 16px' : size === 'lg' ? '14px 24px' : '10px 20px';
    return (
        <div style={{
            background: color,
            color: 'white',
            padding,
            fontWeight: 900,
            textTransform: 'uppercase',
            textAlign: 'center',
            fontSize,
            fontFamily: 'Poppins, sans-serif',
            letterSpacing: '0.06em',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            flexShrink: 0,
        }}>
            {icon && <span style={{ display: 'flex', alignItems: 'center' }}>{icon}</span>}
            {text}
        </div>
    );
};

// Reusable game header bar (replaces the dark header across all games)
interface TTGameHeaderProps {
    color: string;       // accent colour for the bar
    left?: React.ReactNode;
    center?: React.ReactNode;
    right?: React.ReactNode;
}

export const TTGameHeader: React.FC<TTGameHeaderProps> = ({ color, left, center, right }) => (
    <header style={{
        width: '100%',
        padding: '8px 52px 8px 12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'white',
        borderBottom: `4px solid ${color}`,
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        flexShrink: 0,
        gap: '8px',
        boxSizing: 'border-box',
        fontFamily: 'Poppins, sans-serif',
    }}>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flex: 1 }}>{left}</div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flex: 2, justifyContent: 'center' }}>{center}</div>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flex: 1, justifyContent: 'flex-end' }}>{right}</div>
    </header>
);

// Team score badge used across games
interface TeamBadgeProps {
    name: string;
    score: number | string;
    color: string;
    active?: boolean;
}

export const TeamBadge: React.FC<TeamBadgeProps> = ({ name, score, color, active }) => (
    <div style={{
        background: active ? 'white' : 'rgba(255,255,255,0.6)',
        border: `3px solid ${active ? color : 'rgba(0,0,0,0.1)'}`,
        borderRadius: '12px',
        padding: '4px 12px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        minWidth: '80px',
        boxShadow: active ? `0 4px 0 ${color}55, 0 6px 12px rgba(0,0,0,0.1)` : 'none',
        transform: active ? 'scale(1.05)' : 'scale(0.97)',
        transition: 'all 0.2s',
        fontFamily: 'Poppins, sans-serif',
    }}>
        {active && (
            <span style={{ fontSize: '0.6em', fontWeight: 800, color, textTransform: 'uppercase', letterSpacing: '0.08em' }}>▶ TURN</span>
        )}
        <span style={{ fontSize: '0.7em', fontWeight: 700, color: '#8D6E63', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{name}</span>
        <span style={{ fontSize: '1.6em', fontWeight: 900, color: '#3E2723', lineHeight: 1 }}>{score}</span>
    </div>
);

export const THEMES = [
  { value: 'default', label: 'Default' },
  { value: 'star-jar', label: 'Star Jar' },
  { value: 'spring', label: 'Spring' },
  { value: 'science', label: 'Science' },
  { value: 'music', label: 'Music' },
  { value: 'energy-bar', label: 'Energy Bar' },
  { value: 'animals', label: 'Animals' },
  { value: 'christmas', label: 'Christmas' },
  { value: 'halloween', label: 'Halloween' },
  { value: 'minimalist', label: 'Minimalist' },
];

// Fullscreen overlay modal backdrop — renders via portal to escape CSS transform stacking contexts (fullscreen container is z-index 9999)
export const TTModal: React.FC<{ children: React.ReactNode; onClick?: () => void }> = ({ children, onClick }) =>
    ReactDOM.createPortal(
        <div
            onClick={onClick}
            style={{
                position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
                backdropFilter: 'blur(8px)', zIndex: 10000, display: 'flex',
                alignItems: 'center', justifyContent: 'center', padding: '16px',
            }}
        >
            {children}
        </div>,
        document.body
    );
