import React, { useState } from 'react';
import { useDraftLibrary } from './useDraftLibrary';
import GenerateTab from './GenerateTab';
import LibraryTab from './LibraryTab';
import { ContentVariant, GenerateInputs } from './types';
import './AdsPage.css';

type Tab = 'generate' | 'library';

const AdsPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Tab>('generate');
    const {
        drafts,
        loading,
        error,
        save,
        updateAnatomy,
        updateStatus,
        remove,
        refresh,
    } = useDraftLibrary();

    const handleSave = async (variant: ContentVariant, inputs: GenerateInputs) => {
        await save(variant, inputs);
    };

    return (
        <div className="ads-page">
            <div className="ads-page__header">
                <h1 className="ads-page__title">Ad Manager</h1>
            </div>

            <div className="ads-tabs">
                <button
                    className={`ads-tab${activeTab === 'generate' ? ' ads-tab--active' : ''}`}
                    onClick={() => setActiveTab('generate')}
                >
                    Generate
                </button>
                <button
                    className={`ads-tab${activeTab === 'library' ? ' ads-tab--active' : ''}`}
                    onClick={() => setActiveTab('library')}
                >
                    Library ({drafts.length})
                </button>
            </div>

            {activeTab === 'generate' ? (
                <GenerateTab onSave={handleSave} />
            ) : (
                <LibraryTab
                    drafts={drafts}
                    loading={loading}
                    error={error}
                    onUpdateAnatomy={updateAnatomy}
                    onStatusChange={updateStatus}
                    onDelete={remove}
                    onRefresh={refresh}
                />
            )}
        </div>
    );
};

export default AdsPage;
