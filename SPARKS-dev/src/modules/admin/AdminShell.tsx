// SPARKS-dev/src/modules/admin/AdminShell.tsx
import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Megaphone,
    Share2,
    Mail,
    Search,
    Brain,
    BarChart2,
    Layers,
    LogOut,
    Home,
    Star,
    type LucideIcon,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './AdminShell.css';

interface NavItem {
    icon: LucideIcon;
    label: string;
    to: string;
    end?: boolean;
}

const NAV_ITEMS: NavItem[] = [
    { icon: LayoutDashboard, label: 'Overview',     to: '/admin',            end: true },
    { icon: Megaphone,       label: 'Ad Manager',   to: '/admin/ads' },
    { icon: Share2,          label: 'Social Media', to: '/admin/social' },
    { icon: Mail,            label: 'Cold Email',   to: '/admin/email' },
    { icon: Search,          label: 'Research',     to: '/admin/research' },
    { icon: Brain,           label: 'Auto-Learn',   to: '/admin/autolearn' },
    { icon: BarChart2,       label: 'Analytics',    to: '/admin/analytics' },
    { icon: Layers,          label: 'Content',      to: '/admin/content' },
];

const AdminShell: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
        } catch {
            // signOut errors are non-fatal; auth state cleared via onAuthStateChange
        }
        navigate('/login');
    };

    return (
        <div className="admin-shell">
            <aside className="admin-sidebar">
                <div className="admin-sidebar__header">
                    <span className="admin-sidebar__logo">SPARKS</span>
                    <span className="admin-sidebar__sublabel">Admin</span>
                </div>

                <nav className="admin-sidebar__nav">
                    {NAV_ITEMS.map(({ icon: Icon, label, to, end }) => (
                        <NavLink
                            key={to}
                            to={to}
                            end={end}
                            className={({ isActive }) =>
                                `admin-nav-item${isActive ? ' admin-nav-item--active' : ''}`
                            }
                        >
                            <Icon size={18} />
                            <span>{label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="admin-sidebar__footer">
                    <span className="admin-sidebar__email">{user?.email}</span>
                    <button className="admin-logout-btn" onClick={() => navigate('/pricing')}>
                        <Star size={15} />
                        Go Pro
                    </button>
                    <button className="admin-logout-btn" onClick={() => navigate('/hub')}>
                        <Home size={15} />
                        Back to Hub
                    </button>
                    <button className="admin-logout-btn" onClick={handleLogout}>
                        <LogOut size={15} />
                        Logout
                    </button>
                </div>
            </aside>

            <main className="admin-content">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminShell;
