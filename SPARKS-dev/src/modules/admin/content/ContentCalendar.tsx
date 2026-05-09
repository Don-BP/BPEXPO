import React, { useState } from 'react';
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useContentCalendar } from './useContentCalendar';
import { CalendarEntry } from './types';

const STATUS_COLORS: Record<CalendarEntry['status'], string> = {
    draft: '#6b7280', scheduled: '#d97706', posted: '#16a34a',
};

const scoreColor = (n: number | null) =>
    n === null ? '#9ca3af' : n >= 8 ? '#16a34a' : n >= 5 ? '#d97706' : '#dc2626';

const SortableEntry: React.FC<{
    entry: CalendarEntry;
    onStatusChange: (id: string, status: CalendarEntry['status']) => void;
    onRemove: (id: string) => void;
}> = ({ entry, onStatusChange, onRemove }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: entry.id });
    const style = { transform: CSS.Transform.toString(transform), transition };

    return (
        <div ref={setNodeRef} style={style} className="calendar-entry" {...attributes}>
            <div className="calendar-entry__drag-handle" {...listeners}>⠿</div>
            <div className="calendar-entry__body">
                <div className="calendar-entry__header">
                    <span className="ads-type-badge">{entry.platform}</span>
                    <span style={{ color: STATUS_COLORS[entry.status], fontSize: '.75rem', fontWeight: 600 }}>
                        {entry.status}
                    </span>
                    {entry.virality_score !== null && (
                        <span style={{ color: scoreColor(entry.virality_score), fontSize: '.75rem' }}>
                            ★ {entry.virality_score}
                        </span>
                    )}
                    <span style={{ fontSize: '.75rem', color: '#9ca3af' }}>
                        {new Date(entry.scheduled_at).toLocaleDateString('en-US', {
                            weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                    </span>
                </div>
                <p className="calendar-entry__content">{entry.content.slice(0, 120)}{entry.content.length > 120 ? '…' : ''}</p>
                <div className="calendar-entry__actions">
                    {entry.status === 'draft' && (
                        <button className="ads-btn ads-btn--ghost ads-btn--xs"
                            onClick={() => onStatusChange(entry.id, 'scheduled')}>
                            Mark Scheduled
                        </button>
                    )}
                    {entry.status === 'scheduled' && (
                        <button className="ads-btn ads-btn--ghost ads-btn--xs"
                            onClick={() => onStatusChange(entry.id, 'posted')}>
                            Mark Posted
                        </button>
                    )}
                    <button className="ads-btn ads-btn--ghost ads-btn--xs"
                        onClick={() => onRemove(entry.id)} style={{ color: '#dc2626' }}>
                        Remove
                    </button>
                </div>
            </div>
        </div>
    );
};

const ContentCalendar: React.FC = () => {
    const { entries, loading, error, reschedule, updateStatus, remove } = useContentCalendar();
    const [filter, setFilter] = useState<'all' | 'draft' | 'scheduled' | 'posted'>('all');

    const filtered = filter === 'all' ? entries : entries.filter(e => e.status === filter);

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        const draggedEntry = entries.find(e => e.id === active.id);
        const targetEntry = entries.find(e => e.id === over.id);
        if (draggedEntry && targetEntry) {
            reschedule(draggedEntry.id, targetEntry.scheduled_at);
        }
    };

    if (loading) return <div className="social-loading">Loading calendar…</div>;
    if (error) return <div className="al-error">{error}</div>;

    return (
        <div className="content-calendar">
            <h2 className="content-section-title">Content Calendar</h2>

            <div className="calendar-filters">
                {(['all', 'draft', 'scheduled', 'posted'] as const).map(f => (
                    <button key={f} type="button"
                        className={`ads-format-pill ${filter === f ? 'ads-format-pill--active' : ''}`}
                        onClick={() => setFilter(f)}>
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                ))}
            </div>

            {filtered.length === 0 ? (
                <p className="content-section-hint" style={{ marginTop: '2rem' }}>
                    No entries. Add content from Script Builder or Repurpose Engine.
                </p>
            ) : (
                <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={filtered.map(e => e.id)} strategy={verticalListSortingStrategy}>
                        <div className="calendar-list">
                            {filtered.map(entry => (
                                <SortableEntry
                                    key={entry.id}
                                    entry={entry}
                                    onStatusChange={updateStatus}
                                    onRemove={remove}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
            )}
        </div>
    );
};

export default ContentCalendar;
