import React, { useEffect, useRef, useState } from 'react';
import { Bell, Menu, Search, User as UserIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../ui/Button';
import { useAuth } from '../../context/AuthContext';

const AppNavbar = ({ onMobileMenuToggle, onSidebarCollapseToggle }) => {
  const { user, logout } = useAuth();
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);

  useEffect(() => {
    const onDocClick = (e) => {
      if (!notifRef.current) return;
      if (!notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  return (
    <header className="relative z-40 h-16 border-b border-border/70 bg-background/80 flex items-center overflow-visible">
      <div className="flex items-center justify-between w-full px-4 md:px-6 gap-3 overflow-visible">
        <div className="flex items-center gap-2 md:gap-4">
          <button
            type="button"
            className="p-2 rounded-lg border border-border bg-card text-slate-300 hover:text-white hover:bg-slate-800 transition"
            onClick={() => {
              if (window.innerWidth < 768) {
                onMobileMenuToggle();
              } else {
                onSidebarCollapseToggle();
              }
            }}
          >
            <span className="sr-only">Toggle sidebar</span>
            <Menu className="w-5 h-5 text-slate-300" />
          </button>
          <div className="hidden md:block">
            <div className="text-xs uppercase tracking-wide text-text-secondary">
              Workspace
            </div>
            <div className="text-sm font-medium text-text-primary">
              LegalLens · Control Center
            </div>
          </div>
        </div>
        <div className="flex-1 hidden md:flex items-center max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-300 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search cases, documents, users…"
              className="w-full pl-9 pr-3 py-2 bg-card border border-border rounded-2xl text-xs text-text-primary placeholder:text-text-secondary focus:ring-2 focus:ring-accent"
            />
          </div>
        </div>
        <motion.div
          className="flex items-center gap-3"
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="relative" ref={notifRef}>
            <button
              type="button"
              onClick={() => setNotifOpen((v) => !v)}
              className="p-2 rounded-lg border border-border bg-card text-slate-300 hover:text-white hover:bg-slate-800 transition"
            >
              <Bell className="w-5 h-5 text-slate-300" />
            </button>
            {notifOpen && (
              <div className="absolute right-0 top-full mt-3 w-80 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl z-[1000] overflow-hidden">
                <div className="px-4 py-3 border-b border-border/70">
                  <div className="text-xs font-semibold text-text-primary">
                    Notifications
                  </div>
                  <div className="text-[11px] text-text-secondary">
                    Placeholder updates for your workspace
                  </div>
                </div>
                <div className="px-4 py-3 text-xs text-text-secondary space-y-2">
                  <div className="rounded-xl border border-border/70 bg-background/40 px-3 py-2">
                    <div className="text-text-primary text-xs font-medium">
                      Document processed
                    </div>
                    <div className="text-[11px] text-text-secondary">
                      NDA_v2.pdf is ready for Q&A.
                    </div>
                  </div>
                  <div className="rounded-xl border border-border/70 bg-background/40 px-3 py-2">
                    <div className="text-text-primary text-xs font-medium">
                      New case created
                    </div>
                    <div className="text-[11px] text-text-secondary">
                      Vendor MSA – Acme Inc.
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-xs font-medium text-text-primary">
                {user?.name || 'User'}
              </span>
              <span className="text-[11px] text-text-secondary">
                {user?.role === 'admin' ? 'Administrator' : 'Member'}
              </span>
            </div>
            <div className="h-8 w-8 rounded-full bg-card border border-border flex items-center justify-center text-text-secondary">
              <UserIcon className="h-4 w-4" />
            </div>
            <Button
              variant="ghost"
              onClick={logout}
              className="hidden md:inline-flex"
            >
              Logout
            </Button>
          </div>
        </motion.div>
      </div>
    </header>
  );
};

export default AppNavbar;

