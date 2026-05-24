import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useUiStore } from '../store/uiStore';
import { useAuthStore } from '../store/authStore';
import Sidebar from '../components/shared/Sidebar';
import Sidedrawer from '../components/shared/Sidedrawer';
import ToolsDrawer from '../components/shared/ToolsDrawer';
import ToastHost from '../components/shared/ToastHost';
import MediaDrawer from '../components/shared/MediaDrawer';
import {
  Menu,
  Settings,
  Search,
  Bell,
  Sun,
  Moon,
  LayoutDashboard,
  Users,
  FolderLock,
  Building,
  History,
  ShieldCheck,
  Wrench,
  Upload,
  LogOut,
  LayoutTemplate
} from 'lucide-react';
import { cn } from '../lib/utils';

export default function MainLayout() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const mobileOpen = useUiStore((s) => s.mobileSidebarOpen);
  const setMobileOpen = useUiStore((s) => s.setMobileSidebarOpen);

  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };
  
  const setSettingsOpen = useUiStore((s) => s.setSettingsOpen);
  const isSettingsOpen = useUiStore((s) => s.isSettingsOpen);

  const setToolsOpen = useUiStore((s) => s.setToolsOpen);
  const isToolsOpen = useUiStore((s) => s.isToolsOpen);

  const setMediaOpen = useUiStore((s) => s.setMediaOpen);
  const isMediaOpen = useUiStore((s) => s.isMediaOpen);
  
  const theme = useUiStore((s) => s.theme);
  const toggleTheme = useUiStore((s) => s.toggleTheme);
  
  const addToast = useUiStore((s) => s.addToast);
  const location = useLocation();

  // Dynamic navigation config inside component context
  const NAV_SECTIONS = [
    {
      title: 'Workspace',
      items: [
        { to: '/dashboard', label: 'Overview', icon: LayoutDashboard, end: true },
        { to: '/clients', label: 'Clients Module', icon: Users },
        { to: '/pages', label: 'Client Pages', icon: LayoutTemplate },
        { to: '/projects', label: 'Secure Vaults', icon: FolderLock }
      ]
    },
    {
      title: 'Tools',
      items: [
        { label: 'PNG to JPG Converter', icon: Wrench, onClick: () => setToolsOpen(true) }
      ]
    },
    {
      title: 'System Management',
      items: [
        { to: '/companies', label: 'Organizations', icon: Building },
        { to: '/audit', label: 'Audit Logs', icon: History }
      ]
    }
  ];

  // Notification Bell Click Handler
  const handleBellClick = () => {
    addToast({
      type: 'info',
      title: 'Notifications',
      message: 'You have no unread notifications.'
    });
  };

  return (
    <div className={cn("app-shell", collapsed ? "sidebar-collapsed" : "")}>
      
      {/* Dynamic Floating Sidebar */}
      <Sidebar
        sections={NAV_SECTIONS}
        role="Super Administrator"
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      {/* Main Page Layout Wrapper */}
      <main className="admin-main flex flex-col min-h-screen">
        
        {/* Topbar Header */}
        <header className="flex items-center justify-between gap-4 h-16 mb-6 px-1 md:px-0 shrink-0 select-none">
          {/* Left section: toggles & search */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* Mobile Sidebar Hamburger */}
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden flex items-center justify-center w-11 h-11 rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] text-[color:var(--secondary)] hover:text-[color:var(--text)] transition-colors cursor-pointer"
              aria-label="Open sidebar menu"
            >
              <Menu size={19} />
            </button>

            {/* Desktop Search Bar (soft panel) */}
            <div className="hidden sm:flex items-center gap-2 px-3.5 h-11 w-full max-w-[280px] rounded-full border border-[color:var(--border)] soft-panel">
              <Search size={15} className="text-[color:var(--muted)] shrink-0" />
              <input
                type="text"
                placeholder="Quick search Vaults..."
                className="bg-transparent border-none outline-none text-xs text-[color:var(--text)] w-full placeholder-[color:var(--muted)]"
              />
            </div>
            
            {/* System Status badge */}
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100/50 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30">
              <ShieldCheck size={13} />
              <span>API Secure</span>
            </div>
          </div>

          {/* Right section: theme, settings, notifications */}
          <div className="flex items-center gap-2 shrink-0">
            
            {/* Manage Media Button */}
            <button
              onClick={() => setMediaOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 h-11 rounded-full border border-[color:var(--border)] bg-[color:var(--card)] text-xs font-bold text-[color:var(--secondary)] hover:text-[color:var(--text)] hover:bg-[color:var(--surface-strong)] transition-all cursor-pointer shadow-sm mr-1"
              title="Manage Media Assets"
            >
              <Upload size={14} />
              <span className="hidden sm:inline">Manage Media</span>
            </button>

            {/* Light / Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="theme-icon-button"
              aria-label="Toggle visual theme"
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>

            {/* Notification Bell */}
            <button
              onClick={handleBellClick}
              className="theme-icon-button relative"
              aria-label="View notifications"
            >
              <Bell size={18} />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            </button>

            {/* System Customizer Settings button */}
            <button
              onClick={() => setSettingsOpen(!isSettingsOpen)}
              className="theme-icon-button"
              aria-label="Theme settings panel"
            >
              <Settings size={18} />
            </button>

            {/* User chip + Logout */}
            {user && (
              <div className="flex items-center gap-2 pl-2 border-l border-[color:var(--border)]">
                <div className="hidden sm:flex flex-col items-end leading-none">
                  <span className="text-xs font-bold text-[color:var(--text)]">{user.name || user.email}</span>
                  <span className="text-[10px] text-[color:var(--muted)] capitalize">{user.role?.replace('_', ' ')}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="theme-icon-button"
                  title="Sign out"
                  aria-label="Sign out"
                >
                  <LogOut size={16} />
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Content Outlet Zone */}
        <div key={location.pathname} className="fade-page flex-1 flex flex-col">
          <Outlet />
        </div>
      </main>

      {/* Floating Settings Drawer, Tools Drawer, Media Drawer & Toast Host elements */}
      <Sidedrawer />
      <ToolsDrawer />
      <MediaDrawer />
      <ToastHost />
    </div>
  );
}
