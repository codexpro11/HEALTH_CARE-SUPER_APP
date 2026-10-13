import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  Activity,
  UserCheck,
  Calendar,
  FileText,
  Pill,
  ShieldCheck,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  Scan,
  Users
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { useThemeStore } from '../stores/themeStore';
import { isDemoMode } from '../lib/demo';

export const ProviderLayout: React.FC = () => {
  const { user, logout, switchRole } = useAuth();
  const { theme, toggleTheme } = useThemeStore();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationItems = [
    { name: 'Phases & Changes', path: '/provider/progress', icon: FileText },
    { name: 'Dashboard', path: '/provider/dashboard', icon: Activity },
    { name: 'Patients', path: '/provider/patients', icon: Users },
    { name: 'NFC Scanner', path: '/provider/nfc-scanner', icon: Scan },
    { name: 'Appointments', path: '/provider/appointments', icon: Calendar },
    { name: 'Medical Records', path: '/provider/medical-records', icon: FileText },
    { name: 'Prescriptions', path: '/provider/prescriptions', icon: Pill },
    { name: 'Insurance', path: '/provider/insurance', icon: ShieldCheck },
    { name: 'Profile', path: '/provider/profile', icon: User },
    { name: 'Settings', path: '/provider/settings', icon: Settings },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-50 flex flex-col antialiased transition-colors duration-200">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-xs h-16 transition-colors">
        <div className="flex items-center justify-between px-4 h-full">
          <div className="flex items-center gap-3">
            <button
              aria-label="Open provider menu"
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 -ml-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-teal-700 dark:text-teal-500">
              <Activity className="w-6 h-6 stroke-[2.5]" />
              <span className="text-xl font-black tracking-tight hidden sm:block">
                HealthConnect <span className="text-slate-400 dark:text-slate-500 font-medium text-sm ml-1">Provider</span>
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isDemoMode && <button onClick={() => switchRole('PATIENT')} className="text-xs font-bold text-teal-700 dark:text-teal-300 px-3 py-2 rounded-xl border border-teal-200">Return to Patient Demo</button>}
            <div className="hidden sm:flex items-center gap-3 mr-2">
              <div className="text-right">
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-none">{user?.fullName}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 capitalize font-medium">{user?.role.replace('_', ' ')}</p>
              </div>
              <img
                src={user?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || '')}&background=0D9488&color=fff`}
                alt="Profile"
                className="w-9 h-9 rounded-full ring-2 ring-slate-100 dark:ring-slate-800"
              />
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex w-64 flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-colors overflow-y-auto z-10">
          <nav className="flex-1 px-3 py-6 space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                      isActive
                        ? 'bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {item.name}
                </NavLink>
              );
            })}
          </nav>
          <div className="p-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 w-full transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </aside>

        {/* Mobile Sidebar Overlay */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
            <aside className="fixed top-0 left-0 bottom-0 w-72 bg-white dark:bg-slate-900 flex flex-col shadow-2xl transition-transform transform translate-x-0">
              <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 text-teal-700 dark:text-teal-500">
                  <Activity className="w-6 h-6 stroke-[2.5]" />
                  <span className="text-xl font-black tracking-tight">Provider</span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <img
                    src={user?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || '')}&background=0D9488&color=fff`}
                    alt="Profile"
                    className="w-10 h-10 rounded-full ring-2 ring-slate-100 dark:ring-slate-800"
                  />
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{user?.fullName}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium capitalize">{user?.role.replace('_', ' ')}</p>
                  </div>
                </div>
              </div>

              <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.name}
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                          isActive
                            ? 'bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
                        }`
                      }
                    >
                      <Icon className="w-5 h-5 shrink-0" />
                      {item.name}
                    </NavLink>
                  );
                })}
              </nav>
              
              <div className="p-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 w-full transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  Sign Out
                </button>
              </div>
            </aside>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 lg:p-8 transition-colors">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
