import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderOpen,
  FileText,
  MessageCircle,
  Users,
  Settings
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/cases', label: 'Cases', icon: FolderOpen },
  { to: '/documents', label: 'Documents', icon: FileText },
  { to: '/ask', label: 'Ask AI', icon: MessageCircle },
  { to: '/users', label: 'Users', icon: Users, adminOnly: true },
  { to: '/settings', label: 'Settings', icon: Settings }
];

const Sidebar = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  return (
    <aside className="hidden md:flex md:flex-col w-60 border-r border-slate-800 bg-slate-950/90 backdrop-blur-sm">
      <div className="h-16 flex items-center px-5 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="h-8 w-8 rounded-lg bg-primary-500/10 border border-primary-500/50 flex items-center justify-center text-primary-300 font-semibold">
            LL
          </span>
          <div className="leading-tight">
            <div className="text-slate-50 font-semibold text-sm">LegalLens</div>
            <div className="text-[11px] text-slate-400">AI Legal Workspace</div>
          </div>
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems
          .filter((item) => (item.adminOnly ? isAdmin : true))
          .map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  [
                    'flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors',
                    isActive
                      ? 'bg-slate-800 text-slate-50'
                      : 'text-slate-300 hover:bg-slate-900 hover:text-slate-100'
                  ].join(' ')
                }
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
      </nav>
      <div className="px-4 py-3 border-t border-slate-800 text-xs text-slate-500">
        <div>Workspace</div>
        <div className="font-medium text-slate-300 truncate">
          {user?.email || 'guest@legallens.app'}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

