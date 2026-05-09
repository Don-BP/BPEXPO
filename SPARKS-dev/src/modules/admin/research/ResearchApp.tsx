import React, { useState, useEffect } from 'react';
import { useResearch } from './useResearch';
import { ResearchTab } from './ResearchTab';
import './ResearchApp.css';

type Category = 'opportunities' | 'competitors' | 'market_signals';

const TABS: Array<{ label: string; value: Category }> = [
    { label: 'Opportunities', value: 'opportunities' },
    { label: 'Competitors', value: 'competitors' },
    { label: 'Market Signals', value: 'market_signals' },
];

const ResearchApp: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Category>('opportunities');
    const { results, loading, searching, error, loadCategory, search } = useResearch();

    useEffect(() => {
        loadCategory(activeTab);
    }, [activeTab, loadCategory]);

    return (
        <div className="rs-root">
            <div className="rs-header">
                <h1 className="rs-title">Research</h1>
                <p className="rs-subtitle">
                    AI-powered research for opportunity discovery, competitor intel, and market signals.
                </p>
            </div>
            <div className="rs-tabs">
                {TABS.map((tab) => (
                    <button
                        key={tab.value}
                        className={`rs-tab${activeTab === tab.value ? ' rs-tab--active' : ''}`}
                        onClick={() => setActiveTab(tab.value)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
            <ResearchTab
                results={results}
                loading={loading}
                searching={searching}
                error={error}
                onSearch={(q) => search(q, activeTab)}
            />
        </div>
    );
};

export default ResearchApp;
