import React, { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { ContentDraft, DraftStatus, AdAnatomy, Platform } from './types';
import DraftCard from './DraftCard';

type PlatformFilter = 'all' | Platform;
type StatusFilter = 'all' | DraftStatus;

interface LibraryTabProps {
    drafts: ContentDraft[];
    loading: boolean;
    error: string | null;
    onUpdateAnatomy: (id: string, anatomy: AdAnatomy) => Promise<void>;
    onStatusChange: (id: string, status: DraftStatus) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
    onRefresh: () => Promise<void>;
}

const PLATFORM_PILLS: { label: string; value: PlatformFilter }[] = [
    { label: 'All', value: 'all' },
    { label: 'Instagram', value: 'instagram' },
    { label: 'Facebook', value: 'facebook' },
    { label: 'TikTok', value: 'tiktok' },
    { label: 'LinkedIn', value: 'linkedin' },
    { label: 'Twitter / X', value: 'twitter_x' },
    { label: 'Email', value: 'email' },
];

const STATUS_PILLS: { label: string; value: StatusFilter }[] = [
    { label: 'All', value: 'all' },
    { label: 'Draft', value: 'draft' },
    { label: 'Sent to Social', value: 'sent_to_social' },
    { label: 'Sent to Email', value: 'sent_to_email' },
];

const LibraryTab: React.FC<LibraryTabProps> = ({
    drafts,
    loading,
    error,
    onUpdateAnatomy,
    onStatusChange,
    onDelete,
    onRefresh,
}) => {
    const [platformFilter, setPlatformFilter] = useState<PlatformFilter>('all');
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
    const [search, setSearch] = useState('');

    const filtered = drafts.filter(d => {
        if (platformFilter !== 'all' && d.platform !== platformFilter) return false;
        if (statusFilter !== 'all' && d.status !== statusFilter) return false;
        if (search.trim() !== '') {
            const headline = d.anatomy?.headline ?? '';
            if (!headline.toLowerCase().includes(search.toLowerCase())) return false;
        }
        return true;
    });

    if (loading) {
        return <p style={{ color: 'var(--admin-text-muted)' }}>Loading drafts…</p>;
    }

    if (error) {
        return (
            <div>
                <p className="ads-error">{error}</p>
                <button className="ads-btn ads-btn--ghost" onClick={onRefresh}>
                    <RefreshCw size={14} /> Retry
                </button>
            </div>
        );
    }

    return (
        <div className="ads-library-tab">
            <div className="ads-filter-bar">
                <div className="ads-filter-group">
                    {PLATFORM_PILLS.map(p => (
                        <button
                            key={p.value}
                            className={`ads-filter-pill${platformFilter === p.value ? ' ads-filter-pill--active' : ''}`}
                            onClick={() => setPlatformFilter(p.value)}
                        >
                            {p.label}
                        </button>
                    ))}
                </div>
                <div className="ads-filter-group">
                    {STATUS_PILLS.map(p => (
                        <button
                            key={p.value}
                            className={`ads-filter-pill${statusFilter === p.value ? ' ads-filter-pill--active' : ''}`}
                            onClick={() => setStatusFilter(p.value)}
                        >
                            {p.label}
                        </button>
                    ))}
                </div>
                <input
                    className="ads-search"
                    placeholder="Search drafts…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>

            {filtered.length === 0 ? (
                <div className="ads-empty-state">
                    {drafts.length === 0
                        ? 'No drafts yet — generate some content first.'
                        : 'No drafts match your filters.'}
                </div>
            ) : (
                <div className="ads-draft-list">
                    {filtered.map(draft => (
                        <DraftCard
                            key={draft.id}
                            draft={draft}
                            onUpdateAnatomy={onUpdateAnatomy}
                            onStatusChange={onStatusChange}
                            onDelete={onDelete}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default LibraryTab;
