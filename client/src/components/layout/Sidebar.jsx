import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  FileCheck2,
  BarChart3,
  User,
  LogOut,
  GraduationCap,
  Sparkles,
  X,
  Radio,
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';

export const Sidebar = ({ isOpen, onClose }) => {
  const { user, isTeacher, isStudent, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const currentTab = searchParams.get('tab') || 'overview';

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const navItems = isTeacher
    ? [
        {
          label: 'Dashboard',
          to: '/dashboard',
          icon: LayoutDashboard,
          active: location.pathname === '/dashboard' && (!currentTab || currentTab === 'overview'),
        },
        {
          label: 'My Classrooms',
          to: '/dashboard?tab=classrooms',
          icon: BookOpen,
          active: location.pathname === '/dashboard' && currentTab === 'classrooms',
        },
        {
          label: 'Assignments',
          to: '/dashboard?tab=assignments',
          icon: FileCheck2,
          active: location.pathname === '/dashboard' && currentTab === 'assignments',
        },
        {
          label: 'Students & Progress',
          to: '/dashboard?tab=progress',
          icon: BarChart3,
          active: location.pathname === '/dashboard' && currentTab === 'progress',
        },
        {
          label: 'My Profile',
          to: '/profile',
          icon: User,
          active: location.pathname === '/profile',
        },
      ]
    : [
        {
          label: 'Dashboard',
          to: '/dashboard',
          icon: LayoutDashboard,
          active: location.pathname === '/dashboard' && (!currentTab || currentTab === 'overview'),
        },
        {
          label: 'My Classes',
          to: '/dashboard?tab=classrooms',
          icon: BookOpen,
          active: location.pathname === '/dashboard' && currentTab === 'classrooms',
        },
        {
          label: 'Assignments',
          to: '/dashboard?tab=assignments',
          icon: FileCheck2,
          active: location.pathname === '/dashboard' && currentTab === 'assignments',
        },
        {
          label: 'My Progress',
          to: '/dashboard?tab=progress',
          icon: BarChart3,
          active: location.pathname === '/dashboard' && currentTab === 'progress',
        },
        {
          label: 'My Profile',
          to: '/profile',
          icon: User,
          active: location.pathname === '/profile',
        },
      ];

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between bg-white border-r border-slate-200">
      {/* Brand Header */}
      <div>
        <div className="h-16 sm:h-20 px-6 flex items-center justify-between border-b border-slate-100">
          <NavLink to="/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-600 to-indigo-700 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-slate-900">
                Class<span className="text-brand-600">Sphere</span>
              </span>
              <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-600">
                {isTeacher ? 'Teacher Portal' : 'Student Portal'}
              </span>
            </div>
          </NavLink>

          {/* Close button on mobile */}
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-1">
          <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-600">
            Navigation
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.label}
                to={item.to}
                onClick={onClose}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  item.active
                    ? 'bg-brand-50 text-brand-700 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-4 h-4 ${item.active ? 'text-brand-600' : 'text-slate-600'}`} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* User Card & Logout Footer */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-xs mb-3 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-sm shrink-0 border border-brand-200">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt={user?.name} className="w-full h-full rounded-full object-cover" />
              ) : (
                user?.name?.charAt(0).toUpperCase() || 'U'
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">{user?.name || 'User'}</p>
              <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider bg-slate-100 text-slate-600">
                {user?.role || (isTeacher ? 'Teacher' : 'Student')}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-100"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:block fixed inset-y-0 left-0 w-64 z-30 shadow-xs">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs" onClick={onClose} />
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
