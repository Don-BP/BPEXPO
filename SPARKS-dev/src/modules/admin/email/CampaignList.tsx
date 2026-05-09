import React, { useState } from 'react';
import type { EmailCampaign, CampaignStats } from './types';

interface Props {
  campaigns: EmailCampaign[];
  statsMap: Record<string, CampaignStats>;
  loading: boolean;
  onSelect: (campaign: EmailCampaign) => void;
  onDelete: (id: string) => void;
}

const CampaignList: React.FC<Props> = ({ campaigns, statsMap, loading, onSelect, onDelete }) => {
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  if (loading) return <p className="em-loading">Loading campaigns…</p>;
  if (!campaigns.length) return <p className="em-empty">No campaigns yet — create one to get started.</p>;

  return (
    <div className="em-campaign-grid">
      {campaigns.map(c => {
        const s = statsMap[c.id];
        return (
          <div key={c.id} className="em-campaign-card" onClick={() => onSelect(c)}>
            <div className="em-campaign-card__header">
              <span className="em-campaign-card__name">{c.name}</span>
              <span className={`em-badge em-badge--${c.status}`}>{c.status}</span>
            </div>
            <p className="em-campaign-card__goal">{c.goal}</p>
            {s && s.sent > 0 ? (
              <div className="em-campaign-card__funnel">
                Sent <span>{s.sent}</span> → Opened <span>{s.opened} ({s.open_rate}%)</span> → Clicked <span>{s.clicked} ({s.click_rate}%)</span> → Replied <span>{s.replied} ({s.reply_rate}%)</span> → Converted <span>{s.converted} ({s.conversion_rate}%)</span>
              </div>
            ) : (
              <div className="em-campaign-card__funnel">
                <span>{s?.total ?? 0}</span> prospects
              </div>
            )}
            {confirmDelete === c.id ? (
              <div
                className="em-prospect__confirm"
                style={{ marginTop: '0.5rem' }}
                onClick={e => e.stopPropagation()}
              >
                Delete campaign?
                <button
                  className="em-btn em-btn--danger"
                  style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem' }}
                  onClick={() => { onDelete(c.id); setConfirmDelete(null); }}
                >
                  Delete
                </button>
                <button
                  className="em-btn em-btn--ghost"
                  style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem' }}
                  onClick={() => setConfirmDelete(null)}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                className="em-btn em-btn--ghost"
                style={{ marginTop: '0.5rem', padding: '0.2rem 0.6rem', fontSize: '0.75rem' }}
                onClick={e => { e.stopPropagation(); setConfirmDelete(c.id); }}
              >
                Delete
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default CampaignList;
