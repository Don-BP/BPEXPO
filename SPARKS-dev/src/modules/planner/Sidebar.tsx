// --- START OF SECTION: src/Sidebar.tsx ---
import React from 'react';
import {
    LayoutDashboard,
    Sparkles,
    PenTool,
    Wrench,
    X,
    LogOut,
    ChevronLeft,
    ChevronRight,
    Gamepad2,
    Settings,
    Users
} from 'lucide-react';
import { UserProfile } from './types';
import LanguageToggle from '../../components/common/LanguageToggle';

type ViewType = 'dashboard' | 'ai-planner' | 'manual-builder' | 'activities' | 'tools' | 'collaboration';

export const Sidebar = ({
    currentView,
    onChangeView,
    isOpen,
    closeMenu,
    isCollapsed,
    toggleCollapse,
    openSettings,
    profile,
    sparks
}: {
    currentView: ViewType;
    onChangeView: (view: ViewType) => void;
    isOpen: boolean;
    closeMenu: () => void;
    isCollapsed: boolean;
    toggleCollapse: () => void;
    openSettings: () => void;
    profile: UserProfile;
    sparks: number;
}) => {
    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'ai-planner', label: 'Sparkii Assistant', icon: Sparkles },
        { id: 'manual-builder', label: 'Manual Builder', icon: PenTool },
        { id: 'activities', label: 'Library', icon: Gamepad2 },
        { id: 'collaboration', label: 'Collaboration', icon: Users },
        { id: 'tools', label: 'Tools', icon: Wrench },
    ];

    const widthClass = isCollapsed ? 'lg:w-20' : 'lg:w-64';

    const sidebarClasses = `
    fixed inset-y-0 left-0 z-30 bg-slate-900 text-slate-300 
    transform transition-all duration-300 ease-in-out 
    ${widthClass}
    ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'}
    flex flex-col h-screen min-h-screen
    border-r border-slate-800
    lg:static lg:inset-auto
  `;

    return (
        <>
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-20 lg:hidden backdrop-blur-sm"
                    onClick={closeMenu}
                />
            )}

            <aside className={sidebarClasses}>
                {/* --- UPDATED HEADER SECTION WITH LOGO --- */}
                <div className={`h-16 flex items-center px-4 border-b border-slate-800 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>

                    {!isCollapsed ? (
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 relative flex items-center justify-center bg-white rounded-lg overflow-hidden border border-slate-700">
                                {/* <img src="/bp-planner/assets/images/icons/BP_logo.png" alt="SPARKS" ... /> Replaced with Icon */}
                                <div className="h-full w-full flex items-center justify-center bg-orange-500 text-white">
                                    <Sparkles className="w-5 h-5" />
                                </div>
                                <div className="absolute inset-0 flex items-center justify-center -z-10 bg-orange-600 text-[10px] font-bold text-white">S</div>
                            </div>
                            <span className="font-bold text-white tracking-tight leading-tight">
                                BUILD & LINK
                            </span>
                        </div>
                    ) : (
                        <div className="h-8 w-8 bg-blue-800 rounded-lg flex items-center justify-center text-white font-bold text-xs">
                            S
                        </div>
                    )}

                    <button onClick={closeMenu} className="lg:hidden text-slate-400 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                {/* --- END UPDATED HEADER --- */}

                <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto overflow-x-hidden custom-scrollbar">
                    {menuItems.map((item) => {
                        const isActive = currentView === item.id;

                        return (
                            <button
                                key={item.id}
                                onClick={() => { onChangeView(item.id as ViewType); closeMenu(); }}
                                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all font-medium group relative ${isActive
                                    ? "bg-orange-500 text-white shadow-lg shadow-orange-900/20"
                                    : "hover:bg-slate-800 hover:text-white"
                                    } ${isCollapsed ? 'justify-center' : ''}`}
                                title={isCollapsed ? item.label : ''}
                            >
                                <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? "text-yellow-100" : "text-slate-500 group-hover:text-white"}`} />
                                {!isCollapsed && <span className="whitespace-nowrap overflow-hidden">{item.label}</span>}

                                {isCollapsed && (
                                    <div className="absolute left-14 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap border border-slate-700 shadow-xl">
                                        {item.label}
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </nav>

                <div className="hidden lg:flex justify-center p-2 border-t border-slate-800 bg-slate-900">
                    <button
                        onClick={toggleCollapse}
                        className="p-2 rounded-lg text-slate-500 hover:bg-slate-800 hover:text-white transition-colors"
                    >
                        {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                    </button>
                </div>

                <div className="p-4 border-t border-slate-800 space-y-2 bg-slate-900">
                    {/* SPARKS DISPLAY */}
                    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50 text-yellow-400 w-full mb-2 ${isCollapsed ? 'justify-center px-0' : ''}`} title={isCollapsed ? `${sparks} Sparks` : ""}>
                        <div className="w-5 h-5 flex items-center justify-center font-bold text-lg">💎</div>
                        {!isCollapsed && (
                            <div className="flex flex-col leading-none">
                                <span className="font-bold text-white text-sm">{sparks} Sparks</span>
                                <span className="text-[10px] text-teal-500/70 uppercase font-black">Balance</span>
                            </div>
                        )}
                    </div>

                    {/* Language Toggle */}
                    {!isCollapsed && (
                        <div className="px-2 py-1">
                            <LanguageToggle />
                        </div>
                    )}

                    <button
                        onClick={() => window.location.href = '../index.html'}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-colors w-full ${isCollapsed ? 'justify-center px-0' : ''}`}
                        title={isCollapsed ? "Back to Labo Hub" : ""}
                    >
                        <span className="w-5 h-5 flex items-center justify-center">↩️</span>
                        {!isCollapsed && <span className="whitespace-nowrap">Home</span>}
                    </button>

                    <button
                        onClick={openSettings}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-colors w-full ${isCollapsed ? 'justify-center px-0' : ''}`}
                        title={isCollapsed ? "Profile Settings" : ""}
                    >
                        <Settings className="w-5 h-5" />
                        {!isCollapsed && <span>Profile</span>}
                    </button>
                </div>
            </aside>
        </>
    );
};
// --- END OF SECTION: src/Sidebar.tsx ---