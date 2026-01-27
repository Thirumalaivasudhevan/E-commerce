import { useNavigate, useLocation, Outlet, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  LayoutGrid, Folder, ShoppingCart, Mail, MessageSquare,
  Users, Bookmark, Phone, Search, Bell, Moon, Star, Maximize,
  ChevronRight, Menu, Grid
} from 'lucide-react';
import clsx from 'clsx';
import { useState, useEffect } from 'react';

const SidebarItem = ({ icon: Icon, label, path, active, hasSubmenu, disabled }) => {
  // ... existing SidebarItem code ... (no change needed here, just skipping context which is tricky with replace)
  // Better to just target the specific lines inside Shell component.
  // I will target the imports and then the component body separately.
  if (disabled) {
    return (
      <div className="flex items-center justify-between px-6 py-3 border-l-4 border-transparent text-gray-700 cursor-not-allowed opacity-50 select-none">
        <div className="flex items-center gap-3">
          <Icon size={18} />
          <span className="text-sm font-medium">{label}</span>
        </div>
      </div>
    );
  }

  return (
    <Link to={path}>
      <div className={clsx(
        "flex items-center justify-between px-6 py-3 transition-all duration-200 group cursor-pointer border-l-4",
        active
          ? "border-primary bg-primary/10 text-primary"
          : "border-transparent text-text-muted hover:text-text-main hover:bg-surface-highlight"
      )}>
        <div className="flex items-center gap-3">
          <Icon size={18} className={clsx(active ? "text-primary" : "group-hover:text-text-main")} />
          <span className="text-sm font-medium">{label}</span>
        </div>
        {(hasSubmenu || active) && <ChevronRight size={14} className={clsx("transition-transform", active ? "rotate-90 text-text-main" : "opacity-0 group-hover:opacity-50")} />}
      </div>
    </Link>
  );
};

export default function Shell() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);


  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(err => console.error(err));
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(err => console.error(err));
    }
  };

  // Listen for fullscreen change (ESC key)
  useEffect(() => {
    const handleChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleChange);
    return () => document.removeEventListener('fullscreenchange', handleChange);
  }, []);

  const navGroups = [
    {
      title: 'GENERAL',
      items: [
        { label: 'Dashboards', icon: LayoutGrid, path: '/' },
        { label: 'Widgets', icon: Grid, path: '/widgets', disabled: true },
        { label: 'Page Layout', icon: LayoutGrid, path: '/layout', disabled: true },
      ]
    },
    {
      title: 'APPLICATIONS',
      items: [
        { label: 'Project', icon: LayoutGrid, path: '/projects' },
        { label: 'File Manager', icon: Folder, path: '/files' },
        { label: 'Ecommerce', icon: ShoppingCart, path: '/ecommerce' },
        { label: 'Letter Box', icon: Mail, path: '/email' },
        { label: 'Chat', icon: MessageSquare, path: '/chat' },
        { label: 'Users', icon: Users, path: '/social' },
        { label: 'Bookmark', icon: Bookmark, path: '/bookmarks', disabled: true },
        { label: 'Contact', icon: Phone, path: '/contacts', disabled: true },
      ]
    },
    {
      title: 'SETTINGS',
      items: [
        { label: 'Profile', icon: Users, path: '/profile' },
        { label: 'Settings', icon: Moon, path: '/settings' },
      ]
    }
  ];

  return (
    <div className="flex h-screen bg-background font-sans overflow-hidden text-text-main">

      {/* SIDEBAR */}
      <aside className={clsx(
        "fixed inset-y-0 left-0 z-50 w-72 bg-background border-r border-border transform transition-transform duration-300 lg:relative lg:translate-x-0 flex flex-col",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Logo */}
        {/* Logo Removed */}
        <div className="h-20 flex items-center px-6 border-b border-border">
          {/* Spacer if needed or just empty container to keep height */}
          <div className="flex-1"></div>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="lg:hidden ml-auto text-text-main"
          >
            <Menu size={24} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto no-scrollbar py-6">
          {navGroups.map((group) => (
            <div key={group.title} className="mb-6">
              <div className="px-6 mb-3 text-xs font-bold text-text-muted uppercase tracking-wider">
                {group.title}
              </div>
              <div className="space-y-0.5">
                {group.items.map((item) => (
                  <SidebarItem
                    key={item.path}
                    {...item}
                    active={location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path))}
                  />
                ))}
              </div>
            </div>
          ))}
        </nav>
      </aside>

      {/* MOBILE OVERLAY */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-background/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* MAIN CONTENT WRAPPER */}
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300 bg-background">

        {/* HEADER */}
        <header className="h-20 bg-background border-b border-border flex items-center justify-between px-8 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 hover:bg-surface-highlight rounded-lg text-text-main"
            >
              <Menu size={24} />
            </button>
            <div className="hidden md:block">
              <h1 className="text-xl font-bold text-text-main flex items-center gap-2">
                Welcome {user.name.split(' ')[0]} <span className="text-2xl">👋</span>
              </h1>
              <p className="text-xs text-text-muted">Here's what's happening today.</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="hidden md:flex items-center bg-surface border border-border rounded-lg px-4 py-2.5 w-96 focus-within:border-primary transition-colors">
              <Search size={18} className="text-text-muted mr-3" />
              <input
                type="text"
                placeholder="Search..."
                className="bg-transparent border-none outline-none text-sm w-full text-text-main placeholder-text-muted"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button className="p-2.5 hover:bg-surface-highlight text-text-muted hover:text-text-main rounded-lg transition-colors hidden sm:block">
                <span className="text-lg">🇺🇸</span>
              </button>

              <button
                onClick={toggleFullscreen}
                className="p-2.5 hover:bg-surface-highlight text-text-muted hover:text-text-main rounded-lg transition-colors hidden sm:block"
                title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
              >
                <Maximize size={20} className={clsx(isFullscreen && "text-primary")} />
              </button>

              <button className="p-2.5 hover:bg-surface-highlight text-text-muted hover:text-text-main rounded-lg transition-colors hidden sm:block">
                <Star size={20} />
              </button>

              <button
                onClick={toggleTheme}
                className="p-2.5 hover:bg-surface-highlight text-text-muted hover:text-text-main rounded-lg transition-colors"
                title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                <Moon size={20} className={clsx(theme === 'light' && "fill-current")} />
              </button>

              <div className="relative">
                <button
                  onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                  className="p-2.5 hover:bg-surface text-text-muted hover:text-text-main rounded-lg transition-colors relative"
                >
                  <Bell size={20} className={clsx(isNotificationOpen && "text-primary")} />
                  <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border border-black"></span>
                </button>

                {isNotificationOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsNotificationOpen(false)}></div>
                    <div className="absolute right-0 top-12 w-80 bg-surface border border-border rounded-xl shadow-xl z-50 flex flex-col animate-in fade-in slide-in-from-top-2 overflow-hidden ring-1 ring-border">
                      <div className="p-4 border-b border-border flex justify-between items-center bg-background/20">
                        <h3 className="font-bold text-text-main text-sm">Notifications</h3>
                        <button className="text-xs text-primary hover:text-primary-highlight transition-colors">Mark all read</button>
                      </div>
                      <div className="max-h-80 overflow-y-auto custom-scrollbar">
                        <div className="p-4 border-b border-border/50 hover:bg-primary/10 cursor-pointer transition-colors group">
                          <div className="flex gap-3">
                            <div className="mt-1 w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                            <div>
                              <p className="text-sm text-text-main font-medium group-hover:text-primary transition-colors">New project assigned</p>
                              <p className="text-xs text-text-muted mb-1 line-clamp-2">You have been added to the "Nexus Dashboard Redesign" project by Sarah.</p>
                              <span className="text-[10px] text-text-muted font-mono">2 mins ago</span>
                            </div>
                          </div>
                        </div>
                        <div className="p-4 hover:bg-primary/10 cursor-pointer transition-colors group">
                          <div className="flex gap-3">
                            <div className="mt-1 w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                            <div>
                              <p className="text-sm text-text-main font-medium group-hover:text-blue-400 transition-colors">System Update</p>
                              <p className="text-xs text-text-muted mb-1">Nexus v2.0 is now live! Check out the new features including dark mode and settings.</p>
                              <span className="text-[10px] text-text-muted font-mono">1 hour ago</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="p-2 border-t border-border bg-background/20 text-center">
                        <button className="text-xs text-text-muted hover:text-text-main transition-colors w-full py-1">View all notifications</button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="pl-2 relative">
                <div
                  className="flex items-center gap-3 cursor-pointer"
                  onClick={() => setIsMobileMenuOpen(prev => !prev ? false : prev) || setIsProfileMenuOpen(!isProfileMenuOpen)}
                  title="Profile Menu"
                >
                  <img
                    src={user.avatar || 'https://github.com/shadcn.png'}
                    className="w-10 h-10 rounded-full bg-surface border border-border object-cover hover:border-primary transition-colors"
                    alt="Profile"
                  />
                </div>

                {/* Profile Dropdown */}
                {isProfileMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsProfileMenuOpen(false)}></div>
                    <div className="absolute right-0 top-12 w-48 bg-surface border border-border rounded-xl shadow-xl z-50 flex flex-col p-2 animate-in fade-in slide-in-from-top-2">
                      <Link
                        to="/profile"
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-text-muted hover:text-text-main hover:bg-surface-highlight rounded-lg transition-colors"
                      >
                        <Users size={16} /> Profile
                      </Link>
                      <Link
                        to="/settings"
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-text-muted hover:text-text-main hover:bg-surface-highlight rounded-lg transition-colors"
                      >
                        <Moon size={16} /> Settings
                      </Link>
                      <div className="h-px bg-border my-1" />
                      <button
                        onClick={logout}
                        className="flex items-center gap-3 px-4 py-2 text-sm font-bold text-red-500 hover:bg-red-500/10 rounded-lg transition-colors w-full text-left"
                      >
                        <div className="w-4 flex justify-center"><div className="w-1.5 h-1.5 rounded-full bg-red-500" /></div> Logout
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* PAGE */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 bg-background">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
