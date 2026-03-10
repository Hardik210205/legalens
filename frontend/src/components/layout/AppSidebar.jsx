import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  FileText,
  MessageCircle,
  Users,
  Settings
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/cases', label: 'Cases', icon: FolderKanban },
  { to: '/documents', label: 'Documents', icon: FileText },
  { to: '/ask', label: 'Ask AI', icon: MessageCircle },
  { to: '/users', label: 'Users', icon: Users, adminOnly: true },
  { to: '/settings', label: 'Settings', icon: Settings }
];

const AppSidebar = ({ collapsed = false }) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  return (
    <aside
      className={`relative z-30 hidden md:flex md:flex-col ${
        collapsed ? 'w-20' : 'w-64'
      } bg-sidebar border-r border-border/70 transition-all duration-200`}
    >
      <div className="h-16 flex items-center justify-between px-4 border-b border-border/70">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-2xl bg-accent-soft border border-accent/40 flex items-center justify-center text-accent">
            LL
          </div>
          {!collapsed && (
            <div className="leading-tight">
              <div className="text-xs font-semibold text-text-primary">
                LegalLens
              </div>
              <div className="text-[11px] text-text-secondary">
                AI Legal Workspace
              </div>
            </div>
          )}
        </div>
      </div>
      <nav className="flex-1 px-2 py-3 space-y-1">
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
                    'group flex items-center gap-2 px-3 py-2 rounded-xl text-sm relative overflow-hidden',
                    isActive
                      ? 'text-text-primary bg-background/60'
                      : 'text-text-secondary hover:text-text-primary hover:bg-background/40'
                  ].join(' ')
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={`absolute left-0 top-1/2 -translate-y-1/2 h-7 w-0.5 rounded-full bg-accent transition-opacity ${
                        isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-60'
                      }`}
                    />
                    <Icon className="h-4 w-4" />
                    {!collapsed && <span>{item.label}</span>}
                  </>
                )}
              </NavLink>
            );
          })}
      </nav>
      <div className="px-4 py-3 border-t border-border/70 text-[11px] text-text-secondary">
        {!collapsed && (
          <>
            <div className="uppercase tracking-wide mb-1">Workspace</div>
            <div className="font-medium text-text-primary truncate">
              {user?.email || 'guest@legallens.app'}
            </div>
          </>
        )}
      </div>
    </aside>
  );
};

export default AppSidebar;

