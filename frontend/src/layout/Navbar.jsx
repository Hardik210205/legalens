import React from 'react';
import { Menu, Bell, User as UserIcon, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ onMobileMenuToggle }) => {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-950/80 backdrop-blur-sm flex items-center">
      <div className="flex items-center justify-between w-full px-4 md:px-6">
        <div className="flex items-center gap-2 md:gap-4">
          <button
            type="button"
            className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-800 bg-slate-900 text-slate-200"
            onClick={onMobileMenuToggle}
          >
            <Menu className="h-4 w-4" />
          </button>
          <div className="hidden md:block">
            <div className="text-xs uppercase tracking-wide text-slate-500">
              Workspace
            </div>
            <div className="text-sm font-medium text-slate-100">
              LegalLens · Control Center
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            type="button"
            className="hidden sm:inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-800 bg-slate-900 text-slate-300 hover:text-slate-100"
          >
            <Bell className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-xs font-medium text-slate-100">
                {user?.name || 'Guest'}
              </span>
              <span className="text-[11px] text-slate-500">
                {user?.role === 'admin' ? 'Administrator' : 'Member'}
              </span>
            </div>
            <div className="h-8 w-8 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-300">
              <UserIcon className="h-4 w-4" />
            </div>
            <button
              type="button"
              onClick={logout}
              className="hidden md:inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-100"
            >
              <LogOut className="h-3 w-3" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

