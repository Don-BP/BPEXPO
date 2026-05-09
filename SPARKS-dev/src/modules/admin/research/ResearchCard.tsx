import React, { useState } from 'react';
import type { ResearchResult } from './types';

interface ResearchCardProps {
    result: ResearchResult;
}

export const ResearchCard: React.FC<ResearchCardProps> = ({ result }) => {
    const [expanded, setExpanded] = useState(false);

    return (
        <div
            className={`rs-card${expanded ? ' rs-card--expanded' : ''}`}
            role="button"
            tabIndex={0}
            aria-expanded={expanded}
            onClick={() => setExpanded((e) => !e)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setExpanded((v) => !v); }}
        >
            <div className="rs-card__meta">
                <span className={`rs-badge rs-badge--${result.source}`}>{result.source}</span>
                <span className="rs-card__date">
                    {new Date(result.searched_at).toLocaleString(undefined, {
                        month: 'short', day: 'numeric', year: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                    })}
                </span>
            </div>
            <p className="rs-card__title">{result.title}</p>
            <p className="rs-card__summary">{result.summary}</p>
            {result.url && (
                <a
                    className="rs-card__url"
                    href={result.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                >
                    {result.url}
                </a>
            )}
        </div>
    );
};
