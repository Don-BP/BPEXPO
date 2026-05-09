import React, { useState } from 'react';
import type { EmailProspect, ProspectStatus } from './types';
import type { useProspects } from './useProspects';

type ProspectHook = ReturnType<typeof useProspects>;

interface Props {
  prospect: EmailProspect;
  campaignId: string;
  prospectHook: ProspectHook;
}

const STATUS_LABEL: Partial<Record<ProspectStatus, string>> = {
  pending: 'Pending', enriched: 'Enriched', drafted: 'Drafted',
  sent: 'Sent', opened: 'Opened', clicked: 'Clicked',
  bounced: 'Bounced', replied: 'Replied', converted: 'Converted',
  interested: 'Interested', not_interested: 'Not Interested', skipped: 'Skipped',
};

const ProspectCard: React.FC<Props> = ({ prospect: p, campaignId, prospectHook }) => {
  const [expanded, setExpanded] = useState(false);
  const [editSubject, setEditSubject] = useState(p.draft_subject);
  const [editBody, setEditBody] = useState(p.draft_body);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sendingOne, setSendingOne] = useState(false);
  const { updateDraft, updateStatus, sendAll, remove } = prospectHook;

  const handleSaveDraft = async () => {
    setSaving(true);
    await updateDraft(p.id, editSubject, editBody);
    setSaving(false);
  };

  const handleSendOne = async () => {
    setSendingOne(true);
    await sendAll(campaignId);
    setSendingOne(false);
  };

  const handleStatus = (status: ProspectStatus) => updateStatus(p.id, status);

  return (
    <div className="em-prospect">
      <div className="em-prospect__row" onClick={() => setExpanded(v => !v)}>
        <span className="em-prospect__name">{p.name || '(Unknown)'}</span>
        <span className="em-prospect__country">{p.country || '—'}</span>
        <span className="em-prospect__email">{p.email}</span>
        <span className={`em-badge em-badge--${p.send_status}`}>
          {STATUS_LABEL[p.send_status] ?? p.send_status}
        </span>
        <span className="em-prospect__expand">{expanded ? '▲' : '▼'}</span>
      </div>

      {expanded && (
        <div className="em-prospect__detail">
          {p.scraped_context && (
            <div>
              <div className="em-prospect__label">Scraped Context</div>
              <div className="em-prospect__context">
                {p.scraped_context.slice(0, 300)}{p.scraped_context.length > 300 ? '…' : ''}
              </div>
            </div>
          )}

          {(p.draft_subject || p.draft_body) && (
            <div>
              <div className="em-prospect__label">Draft Email</div>
              <input
                className="em-input"
                style={{ marginBottom: '0.5rem' }}
                value={editSubject}
                onChange={e => setEditSubject(e.target.value)}
                placeholder="Subject"
              />
              <textarea
                className="em-textarea"
                value={editBody}
                onChange={e => setEditBody(e.target.value)}
                placeholder="Email body"
              />
              <button
                className="em-btn em-btn--ghost"
                style={{ marginTop: '0.4rem', fontSize: '0.8rem', padding: '0.3rem 0.7rem' }}
                onClick={handleSaveDraft}
                disabled={saving}
              >
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          )}

          <div className="em-prospect__actions">
            {p.send_status === 'drafted' && (
              <button
                className="em-btn em-btn--primary"
                onClick={handleSendOne}
                disabled={sendingOne}
                style={{ fontSize: '0.8rem', padding: '0.3rem 0.8rem' }}
              >
                {sendingOne ? 'Sending…' : 'Send'}
              </button>
            )}
            {!['replied', 'converted', 'interested', 'not_interested', 'skipped', 'bounced'].includes(p.send_status) && (
              <button
                className="em-btn em-btn--ghost"
                onClick={() => handleStatus('skipped')}
                style={{ fontSize: '0.8rem', padding: '0.3rem 0.8rem' }}
              >
                Skip
              </button>
            )}
            {p.send_status !== 'replied' && p.send_status !== 'converted' && (
              <button
                className="em-btn em-btn--secondary"
                onClick={() => handleStatus('replied')}
                style={{ fontSize: '0.8rem', padding: '0.3rem 0.8rem' }}
              >
                Mark Replied
              </button>
            )}
            {p.send_status !== 'converted' && (
              <button
                className="em-btn em-btn--secondary"
                onClick={() => handleStatus('converted')}
                style={{ fontSize: '0.8rem', padding: '0.3rem 0.8rem', borderColor: 'rgba(16,185,129,0.4)', color: '#34d399' }}
              >
                Mark Converted
              </button>
            )}
            <button
              className="em-btn em-btn--ghost"
              onClick={() => handleStatus('interested')}
              style={{ fontSize: '0.8rem', padding: '0.3rem 0.8rem' }}
            >
              Interested
            </button>
            <button
              className="em-btn em-btn--ghost"
              onClick={() => handleStatus('not_interested')}
              style={{ fontSize: '0.8rem', padding: '0.3rem 0.8rem' }}
            >
              Not Interested
            </button>

            {confirmDelete ? (
              <div className="em-prospect__confirm">
                Delete this prospect?
                <button
                  className="em-btn em-btn--danger"
                  onClick={() => remove(p.id)}
                  style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem' }}
                >
                  Delete
                </button>
                <button
                  className="em-btn em-btn--ghost"
                  onClick={() => setConfirmDelete(false)}
                  style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem' }}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                className="em-btn em-btn--danger"
                onClick={() => setConfirmDelete(true)}
                style={{ fontSize: '0.8rem', padding: '0.3rem 0.8rem' }}
              >
                Delete
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProspectCard;
