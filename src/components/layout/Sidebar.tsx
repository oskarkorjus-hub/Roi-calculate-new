import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../lib/auth-context';
import { useTier } from '../../lib/tier-context';

interface SidebarProps {
  activeView: 'home' | 'calculator' | 'portfolio' | 'comparison';
  onViewChange: (view: 'home' | 'calculator' | 'portfolio' | 'comparison') => void;
  onOpenCommandPalette: () => void;
}

export function Sidebar({ activeView, onViewChange, onOpenCommandPalette }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebar_collapsed');
    return saved === 'true';
  });
  const { user, signOut } = useAuth();
  const { tier } = useTier();
  const location = useLocation();

  // Save collapsed state
  useEffect(() => {
    localStorage.setItem('sidebar_collapsed', String(collapsed));
  }, [collapsed]);

  const mainNavItems = [
    {
      id: 'home',
      label: 'Calculators',
      icon: 'calculate',
      shortcut: '1',
    },
    {
      id: 'portfolio',
      label: 'Portfolio',
      icon: 'folder_special',
      shortcut: '2',
    },
    {
      id: 'comparison',
      label: 'Compare',
      icon: 'compare_arrows',
      shortcut: '3',
    },
  ];

  const accountNavItems = [
    {
      id: 'settings',
      label: 'Settings',
      icon: 'settings',
      href: '/settings',
    },
    {
      id: 'billing',
      label: 'Billing',
      icon: 'credit_card',
      href: '/settings?tab=billing',
    },
    {
      id: 'help',
      label: 'Help & Support',
      icon: 'help',
      href: '/contact',
    },
  ];

  const handleNavClick = (id: string) => {
    if (id === 'home' || id === 'portfolio' || id === 'comparison') {
      onViewChange(id as 'home' | 'portfolio' | 'comparison');
    }
  };

  const tierColors = {
    free: 'bg-zinc-700 text-zinc-300',
    pro: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
    enterprise: 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
      className="fixed left-0 top-0 bottom-0 z-40 bg-[#0c0c0c] border-r border-zinc-800/50 flex flex-col"
    >
      {/* Logo Section */}
      <div className="h-16 flex items-center px-4 border-b border-zinc-800/50">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
            <img src="/logo.png" alt="ROI" className="h-6 w-auto" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.15 }}
                className="font-bold text-white whitespace-nowrap"
              >
                ROI Calculate
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
      </div>

      {/* Search Button */}
      <div className="p-3">
        <button
          onClick={onOpenCommandPalette}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-300 transition-all ${
            collapsed ? 'justify-center' : ''
          }`}
        >
          <span className="material-symbols-outlined text-lg">search</span>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex items-center justify-between"
              >
                <span className="text-sm">Search...</span>
                <kbd className="px-1.5 py-0.5 text-xs bg-zinc-800 rounded border border-zinc-700 font-mono">
                  ⌘K
                </kbd>
              </motion.div>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {/* Section Label */}
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="px-3 py-2"
            >
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                Main
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {mainNavItems.map((item) => {
          const isActive = activeView === item.id || (item.id === 'home' && activeView === 'calculator');
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group relative ${
                isActive
                  ? 'bg-emerald-500/10 text-emerald-400'
                  : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-white'
              } ${collapsed ? 'justify-center' : ''}`}
            >
              {/* Active Indicator */}
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-emerald-500 rounded-r-full"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                />
              )}

              <span className={`material-symbols-outlined text-xl ${isActive ? 'text-emerald-400' : ''}`}>
                {item.icon}
              </span>

              <AnimatePresence>
                {!collapsed && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex-1 flex items-center justify-between"
                  >
                    <span className="font-medium text-sm">{item.label}</span>
                    <kbd className="px-1.5 py-0.5 text-xs bg-zinc-800/50 rounded text-zinc-500 font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.shortcut}
                    </kbd>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Tooltip for collapsed state */}
              {collapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-zinc-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
                  {item.label}
                </div>
              )}
            </button>
          );
        })}

        {/* Account Section */}
        <div className="pt-6">
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="px-3 py-2"
              >
                <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                  Account
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {accountNavItems.map((item) => (
            <Link
              key={item.id}
              to={item.href}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group relative text-zinc-400 hover:bg-zinc-800/50 hover:text-white ${
                collapsed ? 'justify-center' : ''
              }`}
            >
              <span className="material-symbols-outlined text-xl">{item.icon}</span>

              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="font-medium text-sm"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>

              {/* Tooltip for collapsed state */}
              {collapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-zinc-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
                  {item.label}
                </div>
              )}
            </Link>
          ))}
        </div>
      </nav>

      {/* User Section */}
      <div className="p-3 border-t border-zinc-800/50">
        {user && (
          <div className={`flex items-center gap-3 p-2 rounded-xl bg-zinc-900/50 ${collapsed ? 'justify-center' : ''}`}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
              <span className="text-emerald-400 font-semibold text-sm">
                {user.name?.charAt(0) || user.email?.charAt(0) || 'U'}
              </span>
            </div>

            <AnimatePresence>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 min-w-0"
                >
                  <p className="text-sm font-medium text-white truncate">
                    {user.name || 'User'}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className={`px-1.5 py-0.5 text-xs font-medium rounded ${tierColors[tier]}`}>
                      {tier.charAt(0).toUpperCase() + tier.slice(1)}
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Collapse Toggle */}
      <div className="p-3 border-t border-zinc-800/50">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-zinc-400 hover:bg-zinc-800/50 hover:text-white transition-all ${
            collapsed ? 'justify-center' : ''
          }`}
        >
          <motion.span
            animate={{ rotate: collapsed ? 0 : 180 }}
            transition={{ duration: 0.2 }}
            className="material-symbols-outlined text-xl"
          >
            chevron_right
          </motion.span>

          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-sm font-medium"
              >
                Collapse
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  );
}
