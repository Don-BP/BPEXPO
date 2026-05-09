import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp, Send, Mail, Trash2 } from 'lucide-react';
import { ContentDraft, DraftStatus, AdAnatomy } from './types';

const PLATFORM_LABELS: Record<string, string> = {
    instagram: 'Instagram',
    facebook: 'Facebook',
    tiktok: 'TikTok',
    linkedin: 'LinkedIn',
    twitter_x: 'Twitter / X',
    email: 'Email',
};

const STATUS_LABELS: Record<DraftStatus, string> = {
    draft: 'Draft',
    sent_to_social: 'Sent to Social',
    sent_to_email: 'Sent to Email',
};

interface DraftCardProps {
    draft: ContentDraft;
    onUpdateAnatomy: (id: string, anatomy: AdAnatomy) => Promise<void>;
    onStatusChange: (id: string, status: DraftStatus) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
}

const DraftCard: React.FC<DraftCardProps> = ({
    draft,
    onUpdateAnatomy,
    onStatusChange,
    onDelete,
}) => {
    const navigate = useNavigate();
    const [expanded, setExpanded] = useState(false);
    const [headline, setHeadline] = useState(draft.anatomy?.headline ?? '');
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [statusMsg, setStatusMsg] = useState<string | null>(null);

    const flash = (msg: string) => {
        setStatusMsg(msg);
        setTimeout(() => setStatusMsg(null), 2500);
    };

    const handleSave = async () => {
        try {
            const updatedAnatomy: AdAnatomy = { ...(draft.anatomy ?? {}), headline };
            await onUpdateAnatomy(draft.id, updatedAnatomy);
            flash('Saved!');
        } catch {
            flash('Save failed — please retry.');
        }
    };

    const handleStatus = async (status: DraftStatus) => {
        try {
            await onStatusChange(draft.id, status);
            flash(`Marked as ${STATUS_LABELS[status]}`);
        } catch {
            flash('Update failed — please retry.');
        }
    };

    const handleDelete = async () => {
        if (!confirmDelete) {
            setConfirmDelete(true);
            return;
        }
        try {
            await onDelete(draft.id);
        } catch {
            flash('Delete failed — please retry.');
            setConfirmDelete(false);
        }
    };

    const preview = draft.anatomy?.headline ?? '(no headline)';
    const date = new Date(draft.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });

    return (
        <div className="ads-draft-card">
            <div
                className="ads-draft-card__row"
                onClick={() => setExpanded(e => !e)}
            >
                <span className="ads-type-badge">{PLATFORM_LABELS[draft.platform] ?? draft.platform}</span>
                <span className="ads-draft-card__preview">
                    {preview.slice(0, 80)}{preview.length > 80 ? '…' : ''}
                </span>
                <span className={`ads-status-badge ads-status-badge--${draft.status}`}>
                    {STATUS_LABELS[draft.status]}
                </span>
                <span className="ads-draft-card__date">{date}</span>
                {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>

            {expanded && (
                <div className="ads-draft-card__body">
                    <textarea
                        className="ads-variant-card__textarea"
                        value={headline}
                        onChange={e => setHeadline(e.target.value)}
                        rows={6}
                    />
                    {statusMsg && <p className="ads-status-msg">{statusMsg}</p>}
                    <div className="ads-draft-card__actions">
                        <button
                            className="ads-btn ads-btn--primary"
                            onClick={handleSave}
                        >
                            Save changes
                        </button>
                        <button
                            className="ads-btn ads-btn--ghost"
                            onClick={() => handleStatus('sent_to_social')}
                        >
                            <Send size={14} />
                            Send to Social
                        </button>
                        <button
                            className="ads-btn ads-btn--ghost"
                            onClick={() => {
                                handleStatus('sent_to_email');
                                navigate('/admin/email', { state: { prefillBody: headline } });
                            }}
                        >
                            <Mail size={14} />
                            Send to Email
                        </button>
                        {confirmDelete ? (
                            <div className="ads-confirm-delete">
                                <span>Delete this draft?</span>
                                <button
                                    className="ads-btn ads-btn--danger"
                                    onClick={handleDelete}
                                >
                                    Confirm
                                </button>
                                <button
                                    className="ads-btn ads-btn--ghost"
                                    onClick={() => setConfirmDelete(false)}
                                >
                                    Cancel
                                </button>
                            </div>
                        ) : (
                            <button
                                className="ads-btn ads-btn--ghost ads-btn--danger-ghost"
                                onClick={() => setConfirmDelete(true)}
                            >
                                <Trash2 size={14} />
                                Delete
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default DraftCard;
