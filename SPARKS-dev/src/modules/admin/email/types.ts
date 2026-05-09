export type CampaignStatus = 'draft' | 'active' | 'completed';

export type ProspectStatus =
  | 'pending' | 'enriched' | 'drafted'
  | 'sent' | 'opened' | 'clicked' | 'bounced' | 'replied' | 'converted'
  | 'interested' | 'not_interested' | 'skipped';

export interface EmailCampaign {
  id: string;
  name: string;
  goal: string;
  status: CampaignStatus;
  created_at: string;
}

export interface EmailProspect {
  id: string;
  campaign_id: string;
  name: string;
  email: string;
  website: string;
  country: string;
  role: string;
  scraped_context: string;
  draft_subject: string;
  draft_body: string;
  send_status: ProspectStatus;
  resend_message_id: string;
  tracking_token: string;
  reply_to_address: string;
  scheduled_at: string | null;
  sent_at: string | null;
  replied_at: string | null;
  converted_at: string | null;
  created_at: string;
}

export interface DiscoverResult {
  name: string;
  email: string;
  website: string;
  country: string;
  role: string;
}

export interface CampaignStats {
  total: number;
  sent: number;
  opened: number;
  clicked: number;
  replied: number;
  converted: number;
  bounced: number;
  open_rate: number;
  click_rate: number;
  reply_rate: number;
  conversion_rate: number;
}

const SENT_STATUSES: ProspectStatus[] = ['sent', 'opened', 'clicked', 'replied', 'converted'];
const OPENED_STATUSES: ProspectStatus[] = ['opened', 'clicked', 'replied', 'converted'];
const CLICKED_STATUSES: ProspectStatus[] = ['clicked', 'replied', 'converted'];
const REPLIED_STATUSES: ProspectStatus[] = ['replied', 'converted'];

export function computeStats(prospects: EmailProspect[]): CampaignStats {
  const sent      = prospects.filter(p => SENT_STATUSES.includes(p.send_status)).length;
  const opened    = prospects.filter(p => OPENED_STATUSES.includes(p.send_status)).length;
  const clicked   = prospects.filter(p => CLICKED_STATUSES.includes(p.send_status)).length;
  const replied   = prospects.filter(p => REPLIED_STATUSES.includes(p.send_status)).length;
  const converted = prospects.filter(p => p.send_status === 'converted').length;
  const bounced   = prospects.filter(p => p.send_status === 'bounced').length;
  return {
    total: prospects.length,
    sent, opened, clicked, replied, converted, bounced,
    open_rate:       sent > 0 ? Math.round((opened    / sent) * 100) : 0,
    click_rate:      sent > 0 ? Math.round((clicked   / sent) * 100) : 0,
    reply_rate:      sent > 0 ? Math.round((replied   / sent) * 100) : 0,
    conversion_rate: sent > 0 ? Math.round((converted / sent) * 100) : 0,
  };
}
