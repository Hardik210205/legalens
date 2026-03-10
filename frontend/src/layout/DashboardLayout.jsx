import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import AppSidebar from '../components/layout/AppSidebar';
import AppNavbar from '../components/layout/AppNavbar';

const DashboardLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background text-text-primary flex">
      <AppSidebar collapsed={sidebarCollapsed} />

      {/* Mobile sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 z-40 flex md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              className="w-64"
            >
              <AppSidebar collapsed={false} />
            </motion.div>
            <div
              className="flex-1 bg-black/40"
              onClick={() => setMobileOpen(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col min-w-0 overflow-visible">
        <AppNavbar
          onMobileMenuToggle={() => setMobileOpen((v) => !v)}
          onSidebarCollapseToggle={() => setSidebarCollapsed((v) => !v)}
        />
        <main className="flex-1 overflow-y-auto">
          <motion.div
            className="page-shell"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;

