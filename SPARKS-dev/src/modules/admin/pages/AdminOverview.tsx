// SPARKS-dev/src/modules/admin/pages/AdminOverview.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import {
    LayoutDashboard,
    Megaphone,
    Share2,
    Mail,
    Search,
    Brain,
    BarChart2,
    Layers,
    type LucideIcon,
} from 'lucide-react';

interface SectionMeta {
    icon: LucideIcon;
    label: string;
    to: string;
    description: string;
    live: boolean;
}

const SECTIONS: SectionMeta[] = [
    {
        icon: LayoutDashboard,
        label: 'Overview',
        to: '/admin',
        description: 'Admin home and status dashboard.',
        live: true,
    },
    {
        icon: Megaphone,
        label: 'Ad Manager',
        to: '/admin/ads',
        description: 'AI-powered ad copy generation, creative management, and A/B testing for SPARKS campaigns.',
        live: true,
    },
    {
        icon: Share2,
        label: 'Social Media',
        to: '/admin/social',
        description: 'Multi-platform post scheduling, per-platform toggles, draft approval workflow, and auto-posting.',
        live: true,
    },
    {
        icon: Mail,
        label: 'Cold Email',
        to: '/admin/email',
        description: 'Prospect research, AI-drafted outreach campaigns, send scheduling, and reply tracking.',
        live: true,
    },
    {
        icon: Search,
        label: 'Research',
        to: '/admin/research',
        description: 'Web scraping engine for opportunity discovery, competitor intel, and market signals.',
        live: true,
    },
    {
        icon: Brain,
        label: 'Auto-Learn',
        to: '/admin/autolearn',
        description: 'Karpathy AutoResearch loop — AI analyzes campaign results and rewrites strategies to self-improve.',
        live: true,
    },
    {
        icon: BarChart2,
        label: 'Analytics',
        to: '/admin/analytics',
        description: 'Deep performance dashboard with charts for ROAS, CTR, impressions, and per-campaign breakdowns.',
        live: true,
    },
    {
        icon: Layers,
        label: 'Content Pipeline',
        to: '/admin/content',
        description: 'AI script builder, repurpose engine, content calendar, virality scorer, and Shorts pipeline.',
        live: true,
    },
];

const AdminOverview: React.FC = () => {
    const today = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    return (
        <div>
            <div className="admin-overview__header">
                <h1 className="admin-overview__title">SPARKS Admin</h1>
                <p className="admin-overview__date">{today}</p>
            </div>

            <div className="admin-overview__grid">
                {SECTIONS.map(({ icon: Icon, label, to, description, live }) => (
                    <Link key={to} to={to} className="admin-section-card">
                        <div className="admin-section-card__header">
                            <div className="admin-section-card__icon-name">
                                <Icon size={18} />
                                <span>{label}</span>
                            </div>
                            <span className={live ? 'admin-badge--live' : 'admin-badge--soon'}>
                                {live ? 'Live' : 'Soon'}
                            </span>
                        </div>
                        <p className="admin-section-card__description">{description}</p>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default AdminOverview;
