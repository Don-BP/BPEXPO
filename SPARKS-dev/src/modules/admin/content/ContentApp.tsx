import React, { useState } from 'react';
import ViralityScorer from './ViralityScorer';
import RepurposeEngine from './RepurposeEngine';
import ScriptBuilder from './ScriptBuilder';
import ShortsPipeline from './ShortsPipeline';
import ContentCalendar from './ContentCalendar';
import './ContentApp.css';

const TABS = ['Virality Scorer', 'Repurpose Engine', 'Script Builder', 'Shorts Pipeline', 'Content Calendar'] as const;
type Tab = typeof TABS[number];

const ContentApp: React.FC = () => {
    const [tab, setTab] = useState<Tab>('Virality Scorer');

    return (
        <div className="content-app">
            <div className="content-app__header">
                <h1 className="content-app__title">Content Pipeline</h1>
                <p className="content-app__subtitle">Script, repurpose, score, schedule.</p>
            </div>
            <div className="content-app__tabs">
                {TABS.map(t => (
                    <button
                        key={t}
                        className={`content-app__tab ${tab === t ? 'content-app__tab--active' : ''}`}
                        onClick={() => setTab(t)}
                        type="button"
                    >
                        {t}
                    </button>
                ))}
            </div>
            <div className="content-app__body">
                {tab === 'Virality Scorer' && <ViralityScorer />}
                {tab === 'Repurpose Engine' && <RepurposeEngine />}
                {tab === 'Script Builder' && <ScriptBuilder />}
                {tab === 'Shorts Pipeline' && <ShortsPipeline />}
                {tab === 'Content Calendar' && <ContentCalendar />}
            </div>
        </div>
    );
};

export default ContentApp;
