
import React from 'react';
import { NavLink } from 'react-router-dom';

interface SidebarProps {
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onLogout }) => {
  const links = [
    { to: '/', label: 'Dashboard', icon: '🏠' },
    { to: '/chat', label: 'Nexus Chat', icon: '💬' },
    { to: '/workflows', label: 'Workflows', icon: '⚡' },
    { to: '/tasks', label: 'Tasks', icon: '✅' },
    { to: '/personas', label: 'Staff Team', icon: '👥' },
    { to: '/settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-400 flex flex-col border-r border-slate-800 shrink-0">
      <div className="p-6">
        <div className="flex items-center gap-3 text-white mb-8">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold">N</div>
          <span className="text-xl font-bold tracking-tight">Nexus AI</span>
        </div>

        <nav className="space-y-1">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }: { isActive: boolean }) => 
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <span className="text-xl">{link.icon}</span>
              <span className="font-medium">{link.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-6 border-t border-slate-800">
        <button 
          onClick={onLogout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-xl hover:bg-red-500/10 hover:text-red-500 transition-all"
        >
          <span>🚪</span>
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
