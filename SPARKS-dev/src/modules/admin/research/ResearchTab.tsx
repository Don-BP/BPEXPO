import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { ResearchCard } from './ResearchCard';
import type { ResearchResult } from './types';

interface ResearchTabProps {
    results: ResearchResult[];
    loading: boolean;
    searching: boolean;
    error: string | null;
    onSearch: (query: string) => void;
}

export const ResearchTab: React.FC<ResearchTabProps> = ({
    results, loading, searching, error, onSearch,
}) => {
    const [query, setQuery] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) onSearch(query.trim());
    };

    return (
        <div className="rs-tab-content">
            <form className="rs-search-bar" onSubmit={handleSubmit}>
                <input
                    className="rs-search-bar__input"
                    type="text"
                    placeholder="Enter a search query…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    disabled={searching}
                />
                <button
                    className="rs-search-bar__btn"
                    type="submit"
                    disabled={searching || !query.trim()}
                >
                    {searching
                        ? <><span className="rs-spinner" /> Searching…</>
                        : <><Search size={14} /> Search</>
                    }
                </button>
            </form>

            {error && <div className="rs-error">{error}</div>}

            {loading ? (
                <div className="rs-loading">Loading…</div>
            ) : results.length === 0 ? (
                <div className="rs-empty">
                    <Search size={32} opacity={0.3} />
                    <p>No results yet. Run a search to get started.</p>
                </div>
            ) : (
                <div className={`rs-results${searching ? ' rs-results--searching' : ''}`}>
                    {results.map((r) => (
                        <ResearchCard key={r.id} result={r} />
                    ))}
                </div>
            )}
        </div>
    );
};
