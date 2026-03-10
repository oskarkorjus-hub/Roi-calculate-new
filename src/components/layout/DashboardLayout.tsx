import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { CommandPalette } from './CommandPalette';
import { useAuth } from '../../lib/auth-context';

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeView: 'home' | 'calculator' | 'portfolio' | 'comparison';
  onViewChange: (view: 'home' | 'calculator' | 'portfolio' | 'comparison') => void;
  onSelectCalculator: (id: string) => void;
}

export function DashboardLayout({
  children,
  activeView,
  onViewChange,
  onSelectCalculator,
}: DashboardLayoutProps) {
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebar_collapsed');
    return saved === 'true';
  });
  const { user, signOut } = useAuth();

  // Listen for sidebar collapse state changes
  useEffect(() => {
    const checkCollapsed = () => {
      const saved = localStorage.getItem('sidebar_collapsed');
      setSidebarCollapsed(saved === 'true');
    };

    // Check periodically for changes
    const interval = setInterval(checkCollapsed, 100);
    return () => clearInterval(interval);
  }, []);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Command palette: Cmd+K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }

      // Number shortcuts for navigation (only when not in input)
      if (!commandPaletteOpen && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
        switch (e.key) {
          case '1':
            onViewChange('home');
            break;
          case '2':
            onViewChange('portfolio');
            break;
          case '3':
            onViewChange('comparison');
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [commandPaletteOpen, onViewChange]);

  const handleSelectCalculatorFromPalette = useCallback((id: string) => {
    onSelectCalculator(id);
  }, [onSelectCalculator]);

  const getViewTitle = () => {
    switch (activeView) {
      case 'home':
        return 'Calculators';
      case 'calculator':
        return 'Calculator';
      case 'portfolio':
        return 'Portfolio';
      case 'comparison':
        return 'Compare';
      default:
        return 'Dashboard';
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Sidebar */}
      <Sidebar
        activeView={activeView}
        onViewChange={onViewChange}
        onOpenCommandPalette={() => setCommandPaletteOpen(true)}
      />

      {/* Command Palette */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onSelectCalculator={handleSelectCalculatorFromPalette}
        onViewChange={onViewChange}
      />

      {/* Main Content Area */}
      <motion.div
        initial={false}
        animate={{ marginLeft: sidebarCollapsed ? 72 : 260 }}
        transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
        className="min-h-screen"
      >
        {/* Top Bar */}
        <header className="sticky top-0 z-30 h-16 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-zinc-800/50">
          <div className="h-full px-6 flex items-center justify-between">
            {/* Breadcrumb / Title */}
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-semibold text-white">{getViewTitle()}</h1>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-3">
              {/* Search Button (Mobile) */}
              <button
                onClick={() => setCommandPaletteOpen(true)}
                className="md:hidden w-10 h-10 rounded-xl bg-zinc-800/50 border border-zinc-700/50 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all"
              >
                <span className="material-symbols-outlined text-xl">search</span>
              </button>

              {/* Search Button (Desktop) */}
              <button
                onClick={() => setCommandPaletteOpen(true)}
                className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-800/50 border border-zinc-700/50 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all"
              >
                <span className="material-symbols-outlined text-lg">search</span>
                <span className="text-sm">Search</span>
                <kbd className="ml-2 px-1.5 py-0.5 text-xs bg-zinc-900 rounded border border-zinc-700 font-mono">
                  ⌘K
                </kbd>
              </button>

              {/* Notifications (placeholder) */}
              <button className="w-10 h-10 rounded-xl bg-zinc-800/50 border border-zinc-700/50 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all relative">
                <span className="material-symbols-outlined text-xl">notifications</span>
                {/* Notification dot */}
                <span className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full" />
              </button>

              {/* User Menu */}
              {user && (
                <div className="flex items-center gap-3 pl-3 border-l border-zinc-800">
                  <Link
                    to="/settings"
                    className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-zinc-800/50 transition-all"
                  >
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 flex items-center justify-center">
                      <span className="text-emerald-400 font-semibold text-sm">
                        {user.name?.charAt(0) || user.email?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <div className="hidden lg:block">
                      <p className="text-sm font-medium text-white">{user.name || 'User'}</p>
                    </div>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </motion.div>
    </div>
  );
}
