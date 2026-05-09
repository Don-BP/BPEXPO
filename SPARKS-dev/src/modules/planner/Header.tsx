// --- START OF SECTION: src/Header.tsx ---
import React from 'react';
import { Menu } from 'lucide-react';

export const Header = ({
  toggleMenu,
}: {
  toggleMenu: () => void;
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-20 print:hidden lg:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <button onClick={toggleMenu} className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg">
              <Menu className="w-6 h-6" />
            </button>
          </div>

          {/* Logo - Only visible on Mobile now, since Desktop Sidebar has it */}
          <div className="flex items-center gap-3 lg:hidden">
            <div className="h-8 w-8 relative flex items-center justify-center">
              <img
                src="/bp-planner/assets/images/icons/BP_logo.png"
                alt="Logo"
                className="h-full w-full object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
            <span className="text-lg font-bold tracking-tight text-teal-900">
              SPARKS
            </span>
          </div>
        </div>

        {/* Empty right side to maintain layout */}
        <div></div>
      </div>
    </header>
  );
};
// --- END OF SECTION: src/Header.tsx ---