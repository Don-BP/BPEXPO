import React, { useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { callAi } from '../../../lib/ai';

type Step = 1 | 2 | 3 | 4;
const STEP_LABELS = ['Find Reference', 'Generate Script', 'Review & Edit', 'Schedule'];
const SHORTS_PLATFORMS = ['TikTok', 'Instagram Reels', 'YouTube Shorts'];

const buildRewritePrompt = (transcript: string, topic: string) =>
    `You are a viral Shorts scriptwriter applying the 80/20 rule: same proven format, new topic.

Reference transcript structure (extract the format, not the content):
"""
${transcript.slice(0, 3000)}
"""

New topic: "${topic}"

Rewrite a Short (60-90 seconds) on the new topic, using the same structural format as the reference.
Apply the viral vector formula for the hook: unexpected modifier OR curiosity gap.

Return a plain-text script with these sections marked:
[HOOK]
...hook line(s)...

[BODY]
...3-5 punchy body points...

[CTA]
...call to action...`;

const ShortsPipeline: React.FC = () => {
    const [step, setStep] = useState<Step>(1);
    const [referenceUrl, setReferenceUrl] = useState('');
    const [transcript, setTranscript] = useState('');
    const [topic, setTopic] = useState('');
    const [script, setScript] = useState('');
    const [platform, setPlatform] = useState('TikTok');
    const [scheduledAt, setScheduledAt] = useState('');
    const [loading, setLoading] = useState(false);

    const fetchTranscript = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase.functions.invoke('research', {
                body: { action: 'fetch', url: referenceUrl },
            });
            if (error) throw error;
            setTranscript(typeof data === 'string' ? data : JSON.stringify(data));
            setStep(2);
        } catch {
            setTranscript('');
            setStep(2);
        } finally {
            setLoading(false);
        }
    };

    const generateScript = async () => {
        setLoading(true);
        try {
            const text = await callAi(buildRewritePrompt(transcript || '(no transcript — use the topic directly)', topic), 'gemini-2.0-flash');
            if (text) {
                setScript(text);
                setStep(3);
            }
        } finally {
            setLoading(false);
        }
    };

    const schedulePost = async () => {
        await supabase.from('content_calendar').insert({
            platform: platform.toLowerCase().replace(' ', '_'),
            content: script,
            scheduled_at: scheduledAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'scheduled',
            source: 'shorts_pipeline',
        });
        alert(`Scheduled for ${platform}!`);
        setStep(1);
        setReferenceUrl(''); setTranscript(''); setTopic(''); setScript('');
    };

    return (
        <div className="shorts-pipeline">
            <h2 className="content-section-title">Shorts Pipeline</h2>

            <div className="shorts-steps">
                {STEP_LABELS.map((label, i) => (
                    <div key={i} className={`shorts-step ${step === i + 1 ? 'shorts-step--active' : step > i + 1 ? 'shorts-step--done' : ''}`}>
                        <span className="shorts-step__num">{i + 1}</span>
                        <span className="shorts-step__label">{label}</span>
                    </div>
                ))}
            </div>

            {step === 1 && (
                <div className="shorts-step-body">
                    <label className="ads-label">Reference YouTube URL</label>
                    <input className="ads-input" placeholder="https://youtube.com/watch?v=..."
                        value={referenceUrl} onChange={e => setReferenceUrl(e.target.value)} />
                    <p className="content-section-hint">Or skip — you can paste the transcript manually in the next step.</p>
                    <div style={{ display: 'flex', gap: '.5rem', marginTop: '1rem' }}>
                        <button className="ads-btn ads-btn--primary" onClick={fetchTranscript}
                            disabled={loading || !referenceUrl.trim()}>
                            {loading ? '⟳ Fetching…' : 'Fetch Transcript'}
                        </button>
                        <button className="ads-btn ads-btn--ghost" onClick={() => setStep(2)}>
                            Skip — paste manually
                        </button>
                    </div>
                </div>
            )}

            {step === 2 && (
                <div className="shorts-step-body">
                    <label className="ads-label">Transcript (paste here if auto-fetch failed)</label>
                    <textarea className="ads-textarea" rows={8}
                        placeholder="Paste the reference transcript here, or leave empty to generate from topic alone."
                        value={transcript} onChange={e => setTranscript(e.target.value)} />
                    <label className="ads-label" style={{ marginTop: '1rem' }}>New Topic</label>
                    <input className="ads-input" placeholder="What is your Short about?"
                        value={topic} onChange={e => setTopic(e.target.value)} />
                    <button className="ads-btn ads-btn--primary" style={{ marginTop: '1rem' }}
                        onClick={generateScript} disabled={loading || !topic.trim()}>
                        {loading ? '⟳ Generating…' : 'Generate Script'}
                    </button>
                </div>
            )}

            {step === 3 && (
                <div className="shorts-step-body">
                    <label className="ads-label">Review & Edit Script</label>
                    <textarea className="ads-textarea" rows={16}
                        value={script} onChange={e => setScript(e.target.value)} />
                    <button className="ads-btn ads-btn--primary" style={{ marginTop: '1rem' }}
                        onClick={() => setStep(4)}>
                        Looks Good → Schedule
                    </button>
                </div>
            )}

            {step === 4 && (
                <div className="shorts-step-body">
                    <label className="ads-label">Platform</label>
                    <div className="ads-format-pills">
                        {SHORTS_PLATFORMS.map(p => (
                            <button key={p} type="button"
                                className={`ads-format-pill ${platform === p ? 'ads-format-pill--active' : ''}`}
                                onClick={() => setPlatform(p)}>{p}</button>
                        ))}
                    </div>
                    <label className="ads-label" style={{ marginTop: '1rem' }}>Schedule Date & Time</label>
                    <input type="datetime-local" className="ads-input"
                        value={scheduledAt} onChange={e => setScheduledAt(e.target.value)} />
                    <button className="ads-btn ads-btn--primary" style={{ marginTop: '1rem' }}
                        onClick={schedulePost} disabled={!script.trim()}>
                        Schedule Post
                    </button>
                </div>
            )}
        </div>
    );
};

export default ShortsPipeline;
