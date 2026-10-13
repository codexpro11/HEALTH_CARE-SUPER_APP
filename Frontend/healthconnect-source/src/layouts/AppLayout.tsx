import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Activity,
  UserCheck,
  Calendar,
  FileText,
  Pill,
  Microscope,
  ShoppingBag,
  Package,
  Building2,
  Droplet,
  Siren,
  Bell,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  ShieldCheck,
  Search,
  Moon,
  Sun,
  MonitorSmartphone,
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { isDemoMode } from '../lib/demo';
import { useCartStore } from '../stores/cartStore';
import { useEmergencyStore } from '../stores/emergencyStore';
import { useThemeStore } from '../stores/themeStore';
import { EmergencyTriggerModal } from '../components/emergency/EmergencyTriggerModal';
import { CartDrawer } from '../components/pharmacy/CartDrawer';
import { UserRole } from '../types';

export const AppLayout: React.FC = () => {
  const { user, role, logout, switchRole } = useAuth();
  const { getItemCount, setIsDrawerOpen } = useCartStore();
  const { isActive } = useEmergencyStore();
  const { theme, toggleTheme } = useThemeStore();
  const navigate = useNavigate();
  const location = useLocation();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const cartCount = getItemCount();

  const navigationItems = [
    { name: 'Phases & Changes', path: '/app/progress', icon: FileText },
    { name: 'Dashboard', path: '/app/dashboard', icon: Activity },
    { name: 'Doctors', path: '/app/doctors', icon: UserCheck },
    { name: 'Appointments', path: '/app/appointments', icon: Calendar },
    { name: 'NFC Card', path: '/app/nfc', icon: MonitorSmartphone },
    { name: 'Medical Records', path: '/app/medical-records', icon: FileText },
    { name: 'Insurance', path: '/app/insurance', icon: ShieldCheck },
    { name: 'Consent', path: '/app/consent', icon: UserCheck },
    { name: 'Pharmacy', path: '/app/pharmacy', icon: ShoppingBag },
    { name: 'Diagnostics', path: '/app/diagnostics', icon: Microscope },
    { name: 'Prescriptions', path: '/app/prescriptions', icon: Pill },
    { name: 'Orders', path: '/app/orders', icon: Package },
    { name: 'Hospitals', path: '/app/hospitals', icon: Building2 },
    { name: 'Blood Banks', path: '/app/blood-banks', icon: Droplet },
    { name: 'Notifications', path: '/app/notifications', icon: Bell },
    { name: 'Profile', path: '/app/profile', icon: User },
    { name: 'Settings', path: '/app/settings', icon: Settings },
  ];

  const roles: UserRole[] = [
    'PATIENT',
    'DOCTOR',
    'HOSPITAL',
    'PHARMACY',
    'DIAGNOSTIC_CENTER',
    'AMBULANCE_PROVIDER',
    'BLOOD_BANK',
    'ADMIN',
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/app/doctors?search=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-50 flex flex-col antialiased transition-colors duration-200">
      {/* Active Emergency Global Banner if SOS triggered */}
      {isActive && (
        <div className="bg-red-600 text-white px-4 py-2 text-xs font-bold text-center flex items-center justify-center gap-2 shadow-sm sticky top-0 z-50 uppercase tracking-wider">
          <Siren className="w-4 h-4 animate-bounce" />
          <span>ACTIVE EMERGENCY BROADCAST IN PROGRESS - DISPATCH LOCATING</span>
          <button
            onClick={() => navigate('/app/emergency')}
            className="ml-2 underline hover:text-red-100 text-xs font-extrabold"
          >
            Open Dispatch Monitor
          </button>
        </div>
      )}

      <div className="flex flex-1 h-[calc(100vh-0px)] overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex flex-col w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shrink-0 select-none transition-colors duration-200">
          {/* Brand header */}
          <div className="p-6 flex items-center gap-3 border-b border-slate-100 dark:border-slate-800">
            <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center shadow-xs">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">HealthConnect</h1>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-4 py-3 space-y-1 overflow-y-auto">
            {navigationItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive: isItemActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                      isItemActive
                        ? 'bg-teal-50 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 font-medium'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 font-normal'
                    }`
                  }
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Emergency SOS & User / Role Controls in Sidebar Bottom */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-3 bg-white dark:bg-slate-900 transition-colors duration-200">
            <button
              onClick={() => navigate('/app/emergency')}
              className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-red-200 dark:shadow-red-900/20 transition-all uppercase text-sm tracking-widest active:scale-98"
            >
              <Siren className="w-5 h-5" />
              <span>Emergency SOS</span>
            </button>

            {/* Demo-only role switch */}
            {isDemoMode && <div className="relative">
              <button
                type="button"
                onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                  <span>Role: <strong>{role}</strong></span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
              </button>

              {isRoleDropdownOpen && (
                <div className="absolute bottom-full left-0 w-full mb-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg p-1.5 z-30 space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 px-2 py-1 block uppercase tracking-wider">
                    Switch Demo Persona
                  </span>
                  {roles.map((r) => (
                    <button
                      key={r}
                      onClick={() => {
                        switchRole(r);
                        setIsRoleDropdownOpen(false);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        role === r
                          ? 'bg-teal-50 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 font-bold'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              )}
            </div>

            }

            {/* Signout button */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign out</span>
            </button>
          </div>
        </aside>

        {/* Main Content Viewport */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
          {/* Top Bar matching Professional Polish */}
          <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 sm:px-8 flex-shrink-0 z-20 transition-colors duration-200">
            <div className="flex items-center gap-3">
              {/* Mobile menu trigger */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                aria-label="Toggle navigation menu"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

              {/* Brand icon for mobile */}
              <div className="lg:hidden flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white">
                  <Activity className="w-4 h-4" />
                </div>
                <span className="font-bold text-slate-800 dark:text-white text-base">HealthConnect</span>
              </div>

              {/* Search Bar matching theme */}
              <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center bg-slate-100 dark:bg-slate-800 rounded-full px-4 py-1.5 w-80 lg:w-96 border border-slate-200 dark:border-slate-700 transition-colors">
                <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 mr-2 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search doctors, clinics, medications..."
                  className="bg-transparent border-none text-sm w-full focus:outline-none text-slate-600 dark:text-slate-300 placeholder-slate-400 dark:placeholder-slate-500"
                />
              </form>
            </div>

            {/* Header Right Controls */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors rounded-full"
                aria-label="Toggle Theme"
              >
                {theme === 'dark' ? <Moon className="w-5 h-5" /> : theme === 'light' ? <Sun className="w-5 h-5" /> : <MonitorSmartphone className="w-5 h-5" />}
              </button>

              {/* Pharmacy Cart Button */}
              <button
                onClick={() => setIsDrawerOpen(true)}
                className="relative p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                aria-label="Open Pharmacy Cart"
              >
                <ShoppingBag className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-teal-600 dark:bg-teal-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* Notifications Icon with Red Indicator */}
              <NavLink
                to="/app/notifications"
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 relative transition-colors"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900" />
              </NavLink>

              {/* User Profile Chip matching theme */}
              <NavLink
                to="/app/profile"
                className="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-slate-700 ml-1"
              >
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-tight">
                    {user?.fullName || 'Sarah Jenkins'}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Patient ID: #HC-8829</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-900/50 flex items-center justify-center text-teal-700 dark:text-teal-300 font-bold border-2 border-white dark:border-slate-800 shadow-sm overflow-hidden shrink-0 transition-colors">
                  <img
                    src={user?.avatarUrl || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop'}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
              </NavLink>
            </div>
          </header>

          {/* Mobile Drawer Navigation (When hamburger tapped) */}
          {isMobileMenuOpen && (
            <div className="lg:hidden fixed inset-0 z-40 bg-slate-900/40 dark:bg-slate-900/60 backdrop-blur-xs flex">
              <div className="w-72 max-w-full bg-white dark:bg-slate-900 h-full flex flex-col shadow-2xl transition-colors">
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-teal-600 rounded-lg flex items-center justify-center text-white">
                      <Activity className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-slate-800 dark:text-white">HealthConnect</span>
                  </div>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-1 rounded-lg text-slate-400 dark:text-slate-500"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-4">
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      navigate('/app/emergency');
                    }}
                    className="w-full flex items-center justify-center gap-2 bg-red-600 text-white font-bold py-2.5 px-4 rounded-xl text-xs uppercase tracking-widest"
                  >
                    <Siren className="w-4 h-4" />
                    <span>Emergency SOS</span>
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
                  {navigationItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={({ isActive: isItemActive }) =>
                          `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm ${
                            isItemActive ? 'bg-teal-50 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 font-medium' : 'text-slate-600 dark:text-slate-400'
                          }`
                        }
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.name}</span>
                      </NavLink>
                    );
                  })}
                </div>

                <div className="p-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
              <div className="flex-1" onClick={() => setIsMobileMenuOpen(false)} />
            </div>
          )}

          {/* Routed Page Container */}
          <div className="flex-1 overflow-y-auto p-6 sm:p-8">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Global Modals & Drawers */}
      <EmergencyTriggerModal />
      <CartDrawer />
    </div>
  );
};
