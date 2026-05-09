import React, { useState, useEffect } from 'react';
import { Save, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { ContentVariant, HyperDopamineScore, AdAnatomy } from './types';

const PLATFORM_LABELS: Record<string, string> = {
    instagram: 'Instagram', facebook: 'Facebook', tiktok: 'TikTok',
    pinterest: 'Pinterest', twitter_x: 'Twitter/X', linkedin: 'LinkedIn',
    youtube_shorts: 'YT Shorts', email: 'Email',
};

const FORMAT_LABELS: Record<string, string> = {
    breaking_news: 'Breaking News', sms_screenshot: 'SMS', native_post: 'Native', standard: 'Standard',
};

const FORMAT_COLORS: Record<string, string> = {
    breaking_news: '#b91c1c', sms_screenshot: '#0369a1', native_post: '#047857', standard: '#6b7280',
};

const scoreColor = (total: number): string => {
    if (total >= 8) return '#16a34a';
    if (total >= 5) return '#d97706';
    return '#dc2626';
};

const HDScoreBar: React.FC<{ score: HyperDopamineScore }> = ({ score }) => (
    <div className="hd-score">
        <div className="hd-score__total" style={{ color: scoreColor(score.total) }}>
            HD {score.total.toFixed(1)}
        </div>
        <div className="hd-score__axes">
            {[
                { label: 'Pattern', value: score.pattern_interrupt },
                { label: 'Curiosity', value: score.curiosity_gap },
                { label: 'Benefit', value: score.benefit_specificity },
            ].map(({ label, value }) => (
                <div key={label} className="hd-score__axis">
                    <span className="hd-score__axis-label">{label}</span>
                    <div className="hd-score__axis-bar">
                        <div
                            className="hd-score__axis-fill"
                            style={{ width: `${value * 10}%`, backgroundColor: scoreColor(value) }}
                        />
                    </div>
                    <span className="hd-score__axis-value">{value}</span>
                </div>
            ))}
        </div>
    </div>
);

interface AnatomySectionProps {
    label: string;
    content: string;
    onChange: (v: string) => void;
    rows?: number;
    defaultOpen?: boolean;
}

const AnatomySection: React.FC<AnatomySectionProps> = ({ label, content, onChange, rows = 3, defaultOpen = false }) => {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div className="variant-anatomy-section">
            <button
                type="button"
                className="variant-anatomy-section__header"
                onClick={() => setOpen(o => !o)}
            >
                <span>{label}</span>
                {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>
            {open && (
                <textarea
                    className="ads-variant-card__textarea ads-variant-card__textarea--sm"
                    rows={rows}
                    value={content}
                    onChange={e => onChange(e.target.value)}
                />
            )}
        </div>
    );
};

interface VariantCardProps {
    variant: ContentVariant;
    index: number;
    onSave: (variant: ContentVariant) => Promise<void>;
    onRegenerate: (index: number) => void;
    globalLoading: boolean;
}

const VariantCard: React.FC<VariantCardProps> = ({
    variant, index, onSave, onRegenerate, globalLoading,
}) => {
    const [anatomy, setAnatomy] = useState(variant.anatomy);
    const [saved, setSaved] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        setAnatomy(variant.anatomy);
        setSaved(false);
    }, [variant.anatomy]);

    const updateField = (field: keyof AdAnatomy) => (value: string) => {
        setAnatomy(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await onSave({ ...variant, anatomy });
            setSaved(true);
            setTimeout(() => setSaved(false), 2500);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="ads-variant-card">
            <div className="ads-variant-card__header">
                <div className="ads-variant-card__platform">
                    <span className="ads-type-badge">{PLATFORM_LABELS[variant.platform] ?? variant.platform}</span>
                    <span
                        className="ads-format-badge"
                        style={{ backgroundColor: FORMAT_COLORS[variant.format] ?? '#6b7280' }}
                    >
                        {FORMAT_LABELS[variant.format] ?? variant.format}
                    </span>
                </div>
                <span className="ads-char-count">{variant.char_count} chars</span>
            </div>

            <HDScoreBar score={variant.hd_score} />

            <div className="variant-anatomy">
                <AnatomySection label="Pattern Interrupt Brief"
                    content={anatomy.pattern_interrupt_brief} rows={2}
                    onChange={updateField('pattern_interrupt_brief')} />
                <AnatomySection label="Headline"
                    content={anatomy.headline} rows={2}
                    onChange={updateField('headline')} defaultOpen={true} />
                <AnatomySection label="Slippery Intro"
                    content={anatomy.slippery_intro} rows={3}
                    onChange={updateField('slippery_intro')} defaultOpen={true} />
                <AnatomySection label="Link Description"
                    content={anatomy.link_description} rows={1}
                    onChange={updateField('link_description')} />
                <AnatomySection label="Main Copy"
                    content={anatomy.main_copy} rows={8}
                    onChange={updateField('main_copy')} />
            </div>

            <div className="ads-variant-card__actions">
                <button
                    className="ads-btn ads-btn--primary"
                    onClick={handleSave}
                    disabled={saving || globalLoading}
                >
                    <Save size={14} />
                    {saved ? 'Saved!' : saving ? 'Saving…' : 'Save to Library'}
                </button>
                <button
                    className="ads-btn ads-btn--ghost"
                    onClick={() => onRegenerate(index)}
                    disabled={globalLoading}
                >
                    <RefreshCw size={14} className={globalLoading ? 'ads-spin' : ''} />
                    Regenerate
                </button>
            </div>
        </div>
    );
};

export default VariantCard;
