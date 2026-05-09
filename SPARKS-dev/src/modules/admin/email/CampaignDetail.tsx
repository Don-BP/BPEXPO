import React, { useEffect, useState } from 'react';
import type { EmailCampaign, DiscoverResult } from './types';
import type { useProspects } from './useProspects';
import ProspectCard from './ProspectCard';

type ProspectHook = ReturnType<typeof useProspects>;

interface Props {
  campaign: EmailCampaign;
  prospectHook: ProspectHook;
  onBack: () => void;
}

const EMPTY_MANUAL: DiscoverResult = { name: '', email: '', website: '', country: '', role: '' };

const CampaignDetail: React.FC<Props> = ({ campaign, prospectHook, onBack }) => {
  const { prospects, loading, discovering, enriching, drafting, sending, error,
          load, discover, addManual, enrichAll, draftAll, sendAll } = prospectHook;

  const [discoverQuery, setDiscoverQuery] = useState('');
  const [showDiscoverInput, setShowDiscoverInput] = useState(false);
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualData, setManualData] = useState<DiscoverResult>(EMPTY_MANUAL);
  const [showSchedule, setShowSchedule] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');

  useEffect(() => { load(campaign.id); }, [campaign.id, load]);

  const hasPending  = prospects.some(p => p.send_status === 'pending');
  const hasEnriched = prospects.some(p => p.send_status === 'enriched');
  const hasDrafted  = prospects.some(p => p.send_status === 'drafted');

  const handleDiscover = () => {
    if (!discoverQuery.trim()) return;
    discover(campaign.id, discoverQuery.trim());
    setDiscoverQuery('');
    setShowDiscoverInput(false);
  };

  const handleAddManual = async () => {
    if (!manualData.email.trim()) return;
    await addManual(campaign.id, manualData);
    setManualData(EMPTY_MANUAL);
    setShowManualForm(false);
  };

  const handleSendAll = () => {
    const at = showSchedule && scheduleDate ? new Date(scheduleDate).toISOString() : undefined;
    sendAll(campaign.id, at);
    setShowSchedule(false);
    setScheduleDate('');
  };

  return (
    <div className="em-root">
      <div className="em-detail-header">
        <button className="em-btn em-btn--ghost" onClick={onBack}>← Back</button>
        <h2 className="em-detail-title">{campaign.name}</h2>
        <span className={`em-badge em-badge--${campaign.status}`}>{campaign.status}</span>
      </div>
      <p style={{ color: 'var(--admin-text-muted,#64748b)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
        {campaign.goal}
      </p>

      <div className="em-pipeline">
        {showDiscoverInput ? (
          <div className="em-discover-inline">
            <input
              className="em-input"
              placeholder="e.g. ESL teachers Germany email"
              value={discoverQuery}
              onChange={e => setDiscoverQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleDiscover()}
              autoFocus
            />
            <button className="em-btn em-btn--primary" onClick={handleDiscover} disabled={discovering || !discoverQuery.trim()}>
              {discovering ? 'Searching…' : 'Search'}
            </button>
            <button className="em-btn em-btn--ghost" onClick={() => { setShowDiscoverInput(false); setDiscoverQuery(''); }}>
              Cancel
            </button>
          </div>
        ) : (
          <button className="em-btn em-btn--secondary" onClick={() => setShowDiscoverInput(true)} disabled={discovering}>
            {discovering ? 'Discovering…' : 'Discover Prospects'}
          </button>
        )}

        <button className="em-btn em-btn--ghost" onClick={() => setShowManualForm(v => !v)}>
          + Add Manually
        </button>

        {hasPending && (
          <button className="em-btn em-btn--secondary" onClick={() => enrichAll(campaign.id)} disabled={enriching}>
            {enriching ? 'Enriching…' : 'Enrich All'}
          </button>
        )}

        {hasEnriched && (
          <button className="em-btn em-btn--secondary" onClick={() => draftAll(campaign.id)} disabled={drafting}>
            {drafting ? 'Drafting…' : 'Draft All'}
          </button>
        )}

        {hasDrafted && !showSchedule && (
          <>
            <button className="em-btn em-btn--primary" onClick={handleSendAll} disabled={sending}>
              {sending ? 'Sending…' : 'Send All'}
            </button>
            <button className="em-btn em-btn--ghost" onClick={() => setShowSchedule(true)}>
              Schedule Send
            </button>
          </>
        )}

        {showSchedule && (
          <div className="em-discover-inline">
            <input
              type="datetime-local"
              className="em-input"
              value={scheduleDate}
              onChange={e => setScheduleDate(e.target.value)}
              style={{ width: 'auto' }}
            />
            <button className="em-btn em-btn--primary" onClick={handleSendAll} disabled={sending || !scheduleDate}>
              {sending ? 'Scheduling…' : 'Schedule'}
            </button>
            <button className="em-btn em-btn--ghost" onClick={() => { setShowSchedule(false); setScheduleDate(''); }}>
              Cancel
            </button>
          </div>
        )}
      </div>

      {showManualForm && (
        <div className="em-manual-form">
          {(['name', 'email', 'website', 'country', 'role'] as (keyof DiscoverResult)[]).map(field => (
            <input
              key={field}
              className="em-input"
              placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
              value={manualData[field]}
              onChange={e => setManualData(prev => ({ ...prev, [field]: e.target.value }))}
            />
          ))}
          <div className="em-manual-form__actions">
            <button className="em-btn em-btn--primary" onClick={handleAddManual} disabled={!manualData.email.trim()}>
              Add
            </button>
            <button className="em-btn em-btn--ghost" onClick={() => { setShowManualForm(false); setManualData(EMPTY_MANUAL); }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {error && <p className="em-error">{error}</p>}
      {loading && <p className="em-loading">Loading prospects…</p>}

      {!loading && !prospects.length && (
        <p className="em-empty">No prospects yet — discover or add manually.</p>
      )}

      <div className="em-prospect-list">
        {prospects.map(p => (
          <ProspectCard
            key={p.id}
            prospect={p}
            campaignId={campaign.id}
            prospectHook={prospectHook}
          />
        ))}
      </div>
    </div>
  );
};

export default CampaignDetail;
