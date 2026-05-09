import React, { useState } from 'react';
import { Zap } from 'lucide-react';
import { GenerateInputs, ContentVariant, Platform, AdFormat } from './types';
import { useAdGeneration } from './useAdGeneration';
import VariantCard from './VariantCard';
import HookGenerator from './HookGenerator';

const PLATFORMS: { key: Platform; label: string }[] = [
    { key: 'instagram', label: 'Instagram' },
    { key: 'facebook', label: 'Facebook' },
    { key: 'tiktok', label: 'TikTok' },
    { key: 'pinterest', label: 'Pinterest' },
    { key: 'twitter_x', label: 'Twitter/X' },
    { key: 'linkedin', label: 'LinkedIn' },
    { key: 'youtube_shorts', label: 'YT Shorts' },
    { key: 'email', label: 'Email' },
];

const ALL_PLATFORMS = PLATFORMS.map(p => p.key);

const FORMATS: { key: AdFormat; label: string; tooltip: string }[] = [
    { key: 'breaking_news', label: 'Breaking News', tooltip: 'Looks like a real news alert. Highest confidence format.' },
    { key: 'sms_screenshot', label: 'SMS Screenshot', tooltip: 'Looks like a real text message. Native and familiar.' },
    { key: 'native_post', label: 'Native Post', tooltip: 'Looks like organic content from a friend. Blends into the feed.' },
    { key: 'standard', label: 'Standard', tooltip: 'Direct response copywriting without a format overlay.' },
];

const GOALS = ['Get signups', 'Promote a feature', 'Announce an update', 'Drive engagement', 'Other (custom)'];
const TONES = ['Professional', 'Fun & energetic', 'Casual & friendly', 'Urgent'];

interface GenerateTabProps {
    onSave: (variant: ContentVariant, inputs: GenerateInputs) => Promise<void>;
}

const GenerateTab: React.FC<GenerateTabProps> = ({ onSave }) => {
    const { generate, regenerateOne, variants, loading, error } = useAdGeneration();

    const [goal, setGoal] = useState('');
    const [customGoal, setCustomGoal] = useState('');
    const [tone, setTone] = useState('');
    const [keyMessage, setKeyMessage] = useState('');
    const [format, setFormat] = useState<AdFormat>('breaking_news');
    const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>(ALL_PLATFORMS);
    const [painPoints, setPainPoints] = useState('');
    const [desires, setDesires] = useState('');
    const [theirLanguage, setTheirLanguage] = useState('');

    const resolvedGoal = goal === 'Other (custom)' ? customGoal : goal;

    const isValid =
        resolvedGoal.trim() !== '' &&
        painPoints.trim() !== '' &&
        desires.trim() !== '' &&
        tone !== '' &&
        keyMessage.trim() !== '' &&
        selectedPlatforms.length > 0;

    const buildInputs = (): GenerateInputs => ({
        goal: resolvedGoal,
        avatar: { pain_points: painPoints, desires, their_language: theirLanguage },
        tone,
        key_message: keyMessage,
        format,
        platforms: selectedPlatforms,
    });

    const togglePlatform = (p: Platform) => {
        setSelectedPlatforms(prev =>
            prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]
        );
    };

    const handleGenerate = () => generate(buildInputs());

    return (
        <div className="ads-generate-tab">
            <HookGenerator onSelect={hook => setKeyMessage(hook)} />

            <div className="ads-form">
                <div className="ads-form__field">
                    <label className="ads-label">Campaign Goal</label>
                    <select className="ads-select" value={goal} onChange={e => setGoal(e.target.value)}>
                        <option value="">Select a goal…</option>
                        {GOALS.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                    {goal === 'Other (custom)' && (
                        <input className="ads-input" placeholder="Describe your goal…" value={customGoal}
                            onChange={e => setCustomGoal(e.target.value)} />
                    )}
                </div>

                <div className="ads-form__field">
                    <label className="ads-label">Avatar — Pain Points</label>
                    <textarea className="ads-textarea" rows={2}
                        placeholder="What keeps them up at night? What frustrations do they have?"
                        value={painPoints} onChange={e => setPainPoints(e.target.value)} />
                </div>
                <div className="ads-form__field">
                    <label className="ads-label">Avatar — Desires</label>
                    <textarea className="ads-textarea" rows={2}
                        placeholder="What do they want? What outcome are they dreaming about?"
                        value={desires} onChange={e => setDesires(e.target.value)} />
                </div>
                <div className="ads-form__field">
                    <label className="ads-label">Avatar — Their Language</label>
                    <textarea className="ads-textarea" rows={2}
                        placeholder="Words and phrases they actually use. Mirror these back in the copy."
                        value={theirLanguage} onChange={e => setTheirLanguage(e.target.value)} />
                </div>

                <div className="ads-form__field">
                    <label className="ads-label">Tone</label>
                    <select className="ads-select" value={tone} onChange={e => setTone(e.target.value)}>
                        <option value="">Select a tone…</option>
                        {TONES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>

                <div className="ads-form__field">
                    <label className="ads-label">Key Message</label>
                    <textarea className="ads-textarea" rows={4}
                        placeholder="Your key message. Use the Hook Generator above to create a curiosity-gap hook."
                        value={keyMessage} onChange={e => setKeyMessage(e.target.value)} />
                </div>

                <div className="ads-form__field">
                    <label className="ads-label">Ad Format</label>
                    <div className="ads-format-pills">
                        {FORMATS.map(f => (
                            <button
                                key={f.key}
                                type="button"
                                className={`ads-format-pill ${format === f.key ? 'ads-format-pill--active' : ''}`}
                                onClick={() => setFormat(f.key)}
                                title={f.tooltip}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="ads-form__field">
                    <div className="ads-platform-header">
                        <label className="ads-label">Platforms</label>
                        <div className="ads-platform-toggles">
                            <button type="button" className="ads-link-btn"
                                onClick={() => setSelectedPlatforms(ALL_PLATFORMS)}>Select All</button>
                            <span>·</span>
                            <button type="button" className="ads-link-btn"
                                onClick={() => setSelectedPlatforms([])}>Deselect All</button>
                        </div>
                    </div>
                    <div className="ads-platform-grid">
                        {PLATFORMS.map(p => (
                            <label key={p.key} className={`ads-platform-chip ${selectedPlatforms.includes(p.key) ? 'ads-platform-chip--checked' : ''}`}>
                                <input
                                    type="checkbox"
                                    checked={selectedPlatforms.includes(p.key)}
                                    onChange={() => togglePlatform(p.key)}
                                    className="ads-platform-chip__input"
                                />
                                {p.label}
                            </label>
                        ))}
                    </div>
                </div>

                <button
                    className="ads-generate-btn"
                    onClick={handleGenerate}
                    disabled={!isValid || loading}
                >
                    {loading ? (
                        <><span className="ads-spin-icon">⟳</span>Generating…</>
                    ) : (
                        <><Zap size={16} />Generate for {selectedPlatforms.length} platform{selectedPlatforms.length !== 1 ? 's' : ''}</>
                    )}
                </button>

                {error && <p className="ads-error">{error}</p>}
            </div>

            {variants.length > 0 && (
                <div className="ads-variants-grid">
                    {variants.map((v, i) => (
                        <VariantCard
                            key={`${v.platform}-${i}`}
                            variant={v}
                            index={i}
                            onSave={variant => onSave(variant, buildInputs())}
                            onRegenerate={idx => regenerateOne(idx, buildInputs())}
                            globalLoading={loading}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default GenerateTab;
