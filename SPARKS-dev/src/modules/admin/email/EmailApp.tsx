import React, { useState } from 'react';
import { useCampaigns } from './useCampaigns';
import { useProspects } from './useProspects';
import CampaignList from './CampaignList';
import CampaignDetail from './CampaignDetail';
import type { EmailCampaign } from './types';
import './EmailApp.css';

const EmailApp: React.FC = () => {
  const [selectedCampaign, setSelectedCampaign] = useState<EmailCampaign | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newGoal, setNewGoal] = useState('');
  const [creating, setCreating] = useState(false);

  const campaignHook = useCampaigns();
  const prospectHook = useProspects();

  const handleCreate = async () => {
    if (!newName.trim() || !newGoal.trim()) return;
    setCreating(true);
    const campaign = await campaignHook.create(newName.trim(), newGoal.trim());
    setCreating(false);
    if (campaign) {
      setNewName(''); setNewGoal(''); setShowNewForm(false);
      setSelectedCampaign(campaign);
    }
  };

  if (selectedCampaign) {
    return (
      <CampaignDetail
        campaign={selectedCampaign}
        prospectHook={prospectHook}
        onBack={() => { setSelectedCampaign(null); campaignHook.refresh(); }}
      />
    );
  }

  return (
    <div className="em-root">
      <div className="em-header">
        <div>
          <h1 className="em-title">Cold Email</h1>
          <p className="em-subtitle">AI-powered prospect outreach with full funnel tracking.</p>
        </div>
        <button className="em-btn em-btn--primary" onClick={() => setShowNewForm(v => !v)}>
          + New Campaign
        </button>
      </div>

      {showNewForm && (
        <div className="em-new-form">
          <input
            className="em-input"
            placeholder="Campaign name"
            value={newName}
            onChange={e => setNewName(e.target.value)}
          />
          <input
            className="em-input"
            placeholder="Goal — e.g. Get signups from ESL teachers in Germany"
            value={newGoal}
            onChange={e => setNewGoal(e.target.value)}
          />
          <div className="em-new-form__actions">
            <button
              className="em-btn em-btn--primary"
              onClick={handleCreate}
              disabled={creating || !newName.trim() || !newGoal.trim()}
            >
              {creating ? 'Creating…' : 'Create'}
            </button>
            <button
              className="em-btn em-btn--ghost"
              onClick={() => { setShowNewForm(false); setNewName(''); setNewGoal(''); }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {campaignHook.error && <p className="em-error">{campaignHook.error}</p>}

      <CampaignList
        campaigns={campaignHook.campaigns}
        statsMap={campaignHook.statsMap}
        loading={campaignHook.loading}
        onSelect={setSelectedCampaign}
        onDelete={campaignHook.remove}
      />
    </div>
  );
};

export default EmailApp;
