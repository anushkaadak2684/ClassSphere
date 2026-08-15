import React, { useState } from 'react';
import { Menu, GraduationCap, Bell, Wifi, WifiOff } from 'lucide-react';
import Sidebar from './Sidebar';
import useAuth from '../../hooks/useAuth';
import useSocket from '../../hooks/useSocket';

export const AppLayout = ({ children, title, subtitle, actions }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, isTeacher } = useAuth();
  const { isConnected } = useSocket();

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200/80 h-16 sm:h-18 px-4 sm:px-8 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div>
              {title ? (
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-lg font-bold text-slate-900 truncate tracking-tight">
                    {title}
                  </h1>
                  {subtitle && (
                    <span className="hidden sm:inline-block text-xs text-slate-500 font-normal border-l border-slate-200 pl-2">
                      {subtitle}
                    </span>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2 lg:hidden">
                  <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center text-white text-xs font-bold">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-bold text-slate-900">ClassSphere</span>
                </div>
              )}
            </div>
          </div>

          {/* Topbar Actions & Indicators */}
          <div className="flex items-center gap-3 sm:gap-4">
            {actions}

            {/* Socket Live Sync Indicator */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 border border-slate-200 text-slate-600">
              {isConnected ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[11px] text-slate-600">Live Sync</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-slate-400" />
                  <span className="text-[11px] text-slate-500">Connected</span>
                </>
              )}
            </div>

            {/* User Quick Pill */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-bold border border-brand-200">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user?.name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  user?.name?.charAt(0).toUpperCase() || 'U'
                )}
              </div>
              <span className="hidden md:inline-block text-xs font-semibold text-slate-800 truncate max-w-[120px]">
                {user?.name}
              </span>
            </div>
          </div>
        </header>

        {/* Page Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
