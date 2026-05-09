import React, { useMemo, useState } from 'react';
import { SocialPost } from './types';

interface Props {
    posts: SocialPost[];
    onRetry: (postId: string) => Promise<void>;
    onUpdate: (postId: string, content: string, scheduledAt: string) => Promise<void>;
}

type View = 'week' | 'month';

const startOfDay = (d: Date) => {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x;
};

const toDateKey = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const startOfWeek = (d: Date) => {
    const x = startOfDay(d);
    const day = x.getDay();
    x.setDate(x.getDate() - day);
    return x;
};

const startOfMonth = (d: Date) => {
    const x = startOfDay(d);
    x.setDate(1);
    return x;
};

const addDays = (d: Date, n: number) => {
    const x = new Date(d);
    x.setDate(x.getDate() + n);
    return x;
};

const PostCalendar: React.FC<Props> = ({ posts, onRetry, onUpdate }) => {
    const [view, setView] = useState<View>('week');
    const [cursor, setCursor] = useState<Date>(new Date());
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [editContent, setEditContent] = useState('');
    const [editScheduledAt, setEditScheduledAt] = useState('');
    const [saveError, setSaveError] = useState<string | null>(null);

    const days = useMemo(() => {
        if (view === 'week') {
            const start = startOfWeek(cursor);
            return Array.from({ length: 7 }, (_, i) => addDays(start, i));
        }
        const start = startOfMonth(cursor);
        const last = new Date(start.getFullYear(), start.getMonth() + 1, 0).getDate();
        return Array.from({ length: last }, (_, i) => addDays(start, i));
    }, [view, cursor]);

    const postsByDay = useMemo(() => {
        const map = new Map<string, SocialPost[]>();
        posts.forEach(p => {
            const local = new Date(p.scheduled_at);
            const d = toDateKey(local);
            const arr = map.get(d) ?? [];
            arr.push(p);
            map.set(d, arr);
        });
        return map;
    }, [posts]);

    const navigate = (delta: number) => {
        setCursor(prev => {
            const x = new Date(prev);
            if (view === 'week') x.setDate(x.getDate() + 7 * delta);
            else x.setMonth(x.getMonth() + delta);
            return x;
        });
    };

    const selectPost = (p: SocialPost) => {
        setSelectedId(p.id);
        setEditContent(p.content);
        setEditScheduledAt(p.scheduled_at.slice(0, 16));
        setSaveError(null);
    };

    const selected = posts.find(p => p.id === selectedId) ?? null;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="social-calendar">
                <div className="social-calendar__header">
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button className="social-btn" onClick={() => navigate(-1)}>‹ Prev</button>
                        <button className="social-btn" onClick={() => setCursor(new Date())}>Today</button>
                        <button className="social-btn" onClick={() => navigate(1)}>Next ›</button>
                    </div>
                    <div style={{ fontWeight: 600 }}>
                        {cursor.toLocaleString('en-US', {
                            month: 'long',
                            year: 'numeric',
                            ...(view === 'week' ? { day: 'numeric' } : {}),
                        })}
                    </div>
                    <div style={{ display: 'flex', gap: 4 }}>
                        <button
                            className={`social-btn ${view === 'week' ? 'social-btn--primary' : ''}`}
                            onClick={() => setView('week')}
                        >Week</button>
                        <button
                            className={`social-btn ${view === 'month' ? 'social-btn--primary' : ''}`}
                            onClick={() => setView('month')}
                        >Month</button>
                    </div>
                </div>

                <div className="social-calendar__grid">
                    {days.map(d => {
                        const key = toDateKey(d);
                        const list = postsByDay.get(key) ?? [];
                        return (
                            <div key={key} className="social-calendar__day">
                                <div className="social-calendar__day-label">
                                    {d.toLocaleString('en-US', { weekday: 'short', day: 'numeric' })}
                                </div>
                                {list.map(p => (
                                    <div
                                        key={p.id}
                                        className={`social-post-chip social-post-chip--${p.status === 'failed_permanently' ? 'failed' : p.status}`}
                                        onClick={() => selectPost(p)}
                                        title={p.content}
                                    >
                                        {p.platform.slice(0, 2).toUpperCase()} · {p.content.slice(0, 24)}
                                    </div>
                                ))}
                            </div>
                        );
                    })}
                </div>
            </div>

            {selected && (
                <div className="social-form">
                    <div style={{ fontSize: 14, fontWeight: 600 }}>
                        Edit Post — {selected.platform} · {selected.status}
                    </div>
                    <div className="social-form__field">
                        <label className="social-label">Content</label>
                        <textarea
                            className="social-textarea"
                            value={editContent}
                            onChange={e => setEditContent(e.target.value)}
                        />
                    </div>
                    <div className="social-form__field">
                        <label className="social-label">Scheduled At</label>
                        <input
                            className="social-input"
                            type="datetime-local"
                            value={editScheduledAt}
                            onChange={e => setEditScheduledAt(e.target.value)}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button
                            className="social-btn social-btn--primary"
                            onClick={async () => {
                                try {
                                    await onUpdate(selected.id, editContent, new Date(editScheduledAt).toISOString());
                                    setSelectedId(null);
                                    setSaveError(null);
                                } catch {
                                    setSaveError('Failed to save — please try again.');
                                }
                            }}
                        >
                            Save
                        </button>
                        {(selected.status === 'failed' || selected.status === 'failed_permanently') && (
                            <button
                                className="social-btn social-btn--danger"
                                onClick={async () => {
                                    try {
                                        await onRetry(selected.id);
                                        setSelectedId(null);
                                    } catch {
                                        setSaveError('Retry failed — please try again.');
                                    }
                                }}
                            >
                                Retry
                            </button>
                        )}
                        <button className="social-btn" onClick={() => setSelectedId(null)}>
                            Cancel
                        </button>
                    </div>
                    {saveError && <div className="social-error">{saveError}</div>}
                </div>
            )}
        </div>
    );
};

export default PostCalendar;
