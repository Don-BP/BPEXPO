import React, { useState } from 'react';
import { Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { HookVariant } from './types';
import { useHookGenerator } from './useHookGenerator';

const FORMULA_LABELS: Record<HookVariant['formula'], string> = {
    unexpected_modifier: 'Unexpected',
    curiosity_gap: 'Curiosity Gap',
    number: 'Number',
    contrast: 'Contrast',
    question: 'Question',
};

const FORMULA_COLORS: Record<HookVariant['formula'], string> = {
    unexpected_modifier: '#7c3aed',
    curiosity_gap: '#d97706',
    number: '#0369a1',
    contrast: '#b91c1c',
    question: '#047857',
};

interface HookGeneratorProps {
    onSelect: (hook: string) => void;
}

const HookGenerator: React.FC<HookGeneratorProps> = ({ onSelect }) => {
    const [open, setOpen] = useState(false);
    const [topic, setTopic] = useState('');
    const { hooks, loading, error, generate } = useHookGenerator();

    return (
        <div className="hook-generator">
            <button
                className="hook-generator__toggle"
                onClick={() => setOpen(o => !o)}
                type="button"
            >
                <Sparkles size={15} />
                Hook Generator
                {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {open && (
                <div className="hook-generator__body">
                    <p className="hook-generator__hint">
                        Generate 5 viral hook formulas. Click any hook to use it as your Key Message.
                    </p>
                    <div className="hook-generator__input-row">
                        <input
                            className="ads-input"
                            placeholder="Topic or subject (e.g. 'lesson planning for JET teachers')"
                            value={topic}
                            onChange={e => setTopic(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && generate(topic)}
                        />
                        <button
                            className="ads-btn ads-btn--primary"
                            onClick={() => generate(topic)}
                            disabled={loading || !topic.trim()}
                            type="button"
                        >
                            {loading ? '⟳' : 'Generate Hooks'}
                        </button>
                    </div>

                    {error && <p className="ads-error">{error}</p>}

                    {hooks.length > 0 && (
                        <div className="hook-generator__list">
                            {hooks.map((h, i) => (
                                <button
                                    key={i}
                                    className="hook-generator__item"
                                    onClick={() => onSelect(h.hook)}
                                    type="button"
                                    title="Click to use as Key Message"
                                >
                                    <span
                                        className="hook-generator__formula-tag"
                                        style={{ backgroundColor: FORMULA_COLORS[h.formula] }}
                                    >
                                        {FORMULA_LABELS[h.formula]}
                                    </span>
                                    <span className="hook-generator__hook-text">{h.hook}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default HookGenerator;
