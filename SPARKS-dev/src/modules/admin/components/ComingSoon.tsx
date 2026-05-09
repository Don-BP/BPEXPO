// SPARKS-dev/src/modules/admin/components/ComingSoon.tsx
import React from 'react';
import { type LucideIcon } from 'lucide-react';

interface ComingSoonProps {
    name: string;
    description: string;
    icon: LucideIcon;
}

const ComingSoon: React.FC<ComingSoonProps> = ({ name, description, icon: Icon }) => (
    <div className="admin-coming-soon">
        <Icon size={52} className="admin-coming-soon__icon" />
        <h2 className="admin-coming-soon__name">{name}</h2>
        <p className="admin-coming-soon__description">{description}</p>
        <span className="admin-coming-soon__badge">Coming Soon</span>
    </div>
);

export default ComingSoon;
