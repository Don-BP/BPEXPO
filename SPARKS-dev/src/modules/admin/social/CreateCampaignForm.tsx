import React, { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { useCreateCampaign } from './useCreateCampaign';
import { Platform } from './types';

const GOALS = ['Grow user base', 'Drive engagement', 'Promote feature', 'Build brand', 'Other'];
const AUDIENCES = ['ALTs in Japan', 'JTEs', 'School admins', 'Parents', 'Other'];
const TONES = ['Professional', 'Friendly', 'Playful', 'Inspirational'];
const ALL_PLATFORMS: Platform[] = ['facebook', 'threads', 'instagram', 'tiktok', 'pinterest', 'twitter'];
const TEXT_ONLY_INCAPABLE: Platform[] = ['instagram', 'tiktok', 'pinterest'];

interface DraftRow {
    id: string;
    key_message: string;
    content: string;
    goal: string;
    audience: string;
    tone: string;
}

interface Props {
    onLaunched: () => void | Promise<void>;
    onCancel: () => void;
}

const CreateCampaignForm: React.FC<Props> = ({ onLaunched, onCancel }) => {
    const { generate, launch, plan, editPost, loading, error, reset } = useCreateCampaign();

    const [name, setName] = useState('');
    const [goal, setGoal] = useState(GOALS[0]);
    const [audience, setAudience] = useState(AUDIENCES[0]);
    const [tone, setTone] = useState(TONES[0]);
    const [keyMessage, setKeyMessage] = useState('');
    const [startAt, setStartAt] = useState(() => new Date().toISOString().slice(0, 16));
    const [platforms, setPlatforms] = useState<Platform[]>(['facebook', 'threads']);
    const [drafts, setDrafts] = useState<DraftRow[]>([]);
    const [importDraftId, setImportDraftId] = useState('');

    useEffect(() => {
        let isMounted = true;
        (async () => {
            const { data } = await supabase
                .from('admin_content_drafts')
                .select('id, key_message, content, goal, audience, tone')
                .eq('status', 'sent_to_social')
                .order('created_at', { ascending: false });
            if (isMounted) setDrafts((data ?? []) as DraftRow[]);
        })();
        return () => { isMounted = false; };
    }, []);

    useEffect(() => {
        if (!importDraftId) return;
        const d = drafts.find(x => x.id === importDraftId);
        if (!d) return;
        setKeyMessage(d.key_message);
        if (GOALS.includes(d.goal)) setGoal(d.goal);
        if (AUDIENCES.includes(d.audience)) setAudience(d.audience);
        if (TONES.includes(d.tone)) setTone(d.tone);
    }, [importDraftId, drafts]);

    const togglePlatform = (p: Platform) => {
        setPlatforms(prev =>
            prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]
        );
    };

    const hasMediaPlatforms = platforms.some(p => TEXT_ONLY_INCAPABLE.includes(p));

    const handleGenerate = async () => {
        const startDate = new Date(startAt);
        if (!startAt || isNaN(startDate.getTime())) return;
        await generate({
            goal,
            audience,
            tone,
            key_message: keyMessage,
            platforms,
            start_at: startDate.toISOString(),
        });
    };

    const handleLaunch = async () => {
        const startDate = new Date(startAt);
        if (!startAt || isNaN(startDate.getTime())) return;
        try {
            await launch(name, startDate.toISOString(), platforms);
            reset();
            await onLaunched();
        } catch {
            // error already set in hook
        }
    };

    if (plan) {
        return (
            <div className="social-form">
                <div style={{ fontSize: 16, fontWeight: 600 }}>Review Campaign</div>
                <div className="social-campaign-card__stats">{plan.schedule_summary}</div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 400, overflowY: 'auto' }}>
                    {plan.posts.map((p, idx) => (
                        <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            <div className="social-label">
                                {p.platform} — {new Date(p.scheduled_at).toLocaleString('en-US', { timeZone: 'Asia/Tokyo' })} JST
                            </div>
                            <textarea
                                className="social-textarea"
                                value={p.content}
                                onChange={e => editPost(idx, e.target.value)}
                                style={{ minHeight: 70 }}
                            />
                        </div>
                    ))}
                </div>

                {error && <div className="social-error">{error}</div>}

                <div style={{ display: 'flex', gap: 8 }}>
                    <button
                        className="social-launch-btn"
                        disabled={loading || !name.trim()}
                        onClick={handleLaunch}
                    >
                        {loading ? <span className="social-spin-icon" /> : 'Launch Campaign'}
                    </button>
                    <button className="social-btn" onClick={() => { reset(); }}>
                        Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="social-form">
            <div className="social-form__field">
                <label className="social-label">Campaign Name</label>
                <input
                    className="social-input"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Spring Onboarding Push"
                />
            </div>

            {drafts.length > 0 && (
                <div className="social-form__field">
                    <label className="social-label">Import from Ad Manager</label>
                    <select
                        className="social-select"
                        value={importDraftId}
                        onChange={e => setImportDraftId(e.target.value)}
                    >
                        <option value="">— None —</option>
                        {drafts.map(d => (
                            <option key={d.id} value={d.id}>
                                {d.key_message.slice(0, 60)}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            <div className="social-form__field">
                <label className="social-label">Goal</label>
                <select className="social-select" value={goal} onChange={e => setGoal(e.target.value)}>
                    {GOALS.map(g => <option key={g}>{g}</option>)}
                </select>
            </div>

            <div className="social-form__field">
                <label className="social-label">Audience</label>
                <select className="social-select" value={audience} onChange={e => setAudience(e.target.value)}>
                    {AUDIENCES.map(a => <option key={a}>{a}</option>)}
                </select>
            </div>

            <div className="social-form__field">
                <label className="social-label">Tone</label>
                <select className="social-select" value={tone} onChange={e => setTone(e.target.value)}>
                    {TONES.map(t => <option key={t}>{t}</option>)}
                </select>
            </div>

            <div className="social-form__field">
                <label className="social-label">Key Message</label>
                <textarea
                    className="social-textarea"
                    value={keyMessage}
                    onChange={e => setKeyMessage(e.target.value)}
                    placeholder="What is the single most important thing this campaign should communicate?"
                />
            </div>

            <div className="social-form__field">
                <label className="social-label">Start Date</label>
                <input
                    className="social-input"
                    type="datetime-local"
                    value={startAt}
                    onChange={e => setStartAt(e.target.value)}
                />
            </div>

            <div className="social-form__field">
                <label className="social-label">Platforms</label>
                <div className="social-checkbox-grid">
                    {ALL_PLATFORMS.map(p => (
                        <label key={p} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                            <input
                                type="checkbox"
                                checked={platforms.includes(p)}
                                onChange={() => togglePlatform(p)}
                                disabled={p === 'twitter'}
                            />
                            {p}
                        </label>
                    ))}
                </div>
            </div>

            {hasMediaPlatforms && (
                <div className="social-warning">
                    Instagram, TikTok, and Pinterest require image/video content — text-only campaigns will skip these platforms automatically.
                </div>
            )}

            {error && <div className="social-error">{error}</div>}

            <div style={{ display: 'flex', gap: 8 }}>
                <button
                    className="social-generate-btn"
                    disabled={loading || !keyMessage.trim() || platforms.length === 0}
                    onClick={handleGenerate}
                >
                    {loading ? <span className="social-spin-icon" /> : 'Generate'}
                </button>
                <button className="social-btn" onClick={onCancel}>Cancel</button>
            </div>
        </div>
    );
};

export default CreateCampaignForm;
