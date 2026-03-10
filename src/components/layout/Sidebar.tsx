import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
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
  const { user } = useAuth();
  const { tier } = useTier();

  useEffect(() => {
    localStorage.setItem('sidebar_collapsed', String(collapsed));
  }, [collapsed]);

  const mainNavItems = [
    { id: 'home', label: 'Calculators', shortcut: '1' },
    { id: 'portfolio', label: 'Portfolio', shortcut: '2' },
    { id: 'comparison', label: 'Compare', shortcut: '3' },
  ];

  const accountNavItems = [
    { id: 'settings', label: 'Settings', href: '/settings' },
    { id: 'billing', label: 'Billing', href: '/settings?tab=billing' },
    { id: 'help', label: 'Help', href: '/contact' },
  ];

  const handleNavClick = (id: string) => {
    if (id === 'home' || id === 'portfolio' || id === 'comparison') {
      onViewChange(id as 'home' | 'portfolio' | 'comparison');
    }
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 64 : 240 }}
      transition={{ duration: 0.15 }}
      className="fixed left-0 top-0 bottom-0 z-40 bg-zinc-950 border-r border-zinc-800/60 flex flex-col"
    >
      {/* Logo */}
      <div className="h-14 flex items-center px-4 border-b border-zinc-800/60">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center flex-shrink-0">
            <img src="/logo.png" alt="ROI" className="h-5 w-auto" />
          </div>
          {!collapsed && (
            <span className="text-sm font-semibold text-zinc-100">ROI Calculate</span>
          )}
        </Link>
      </div>

      {/* Search */}
      <div className="p-2">
        <button
          onClick={onOpenCommandPalette}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-900/50 border border-zinc-800/60 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900 transition-colors ${
            collapsed ? 'justify-center' : ''
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          {!collapsed && (
            <div className="flex-1 flex items-center justify-between">
              <span className="text-xs">Search</span>
              <kbd className="px-1.5 py-0.5 text-[10px] bg-zinc-800 rounded text-zinc-500">
                /
              </kbd>
            </div>
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {mainNavItems.map((item) => {
          const isActive = activeView === item.id || (item.id === 'home' && activeView === 'calculator');
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group relative ${
                isActive
                  ? 'bg-zinc-800/80 text-white'
                  : 'text-zinc-400 hover:bg-zinc-800/40 hover:text-zinc-200'
              } ${collapsed ? 'justify-center' : ''}`}
            >
              <span className="text-sm">{item.label.charAt(0)}</span>

              {!collapsed && (
                <div className="flex-1 flex items-center justify-between">
                  <span className="text-sm">{item.label}</span>
                  <span className="text-[10px] text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.shortcut}
                  </span>
                </div>
              )}

              {collapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-zinc-800 text-zinc-200 text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
                  {item.label}
                </div>
              )}
            </button>
          );
        })}

        {/* Divider */}
        <div className="my-4 border-t border-zinc-800/60" />

        {accountNavItems.map((item) => (
          <Link
            key={item.id}
            to={item.href}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group relative text-zinc-500 hover:bg-zinc-800/40 hover:text-zinc-300 ${
              collapsed ? 'justify-center' : ''
            }`}
          >
            <span className="text-sm">{item.label.charAt(0)}</span>

            {!collapsed && (
              <span className="text-sm">{item.label}</span>
            )}

            {collapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-zinc-800 text-zinc-200 text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
                {item.label}
              </div>
            )}
          </Link>
        ))}
      </nav>

      {/* User */}
      {user && (
        <div className="p-2 border-t border-zinc-800/60">
          <Link
            to="/settings"
            className={`flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-800/40 transition-colors ${collapsed ? 'justify-center' : ''}`}
          >
            <div className="w-7 h-7 rounded-md bg-zinc-800 flex items-center justify-center flex-shrink-0">
              <span className="text-zinc-300 text-xs font-medium">
                {user.name?.charAt(0) || user.email?.charAt(0) || 'U'}
              </span>
            </div>

            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs text-zinc-300 truncate">
                  {user.name || user.email}
                </p>
                <p className="text-[10px] text-zinc-600 capitalize">{tier}</p>
              </div>
            )}
          </Link>
        </div>
      )}

      {/* Collapse */}
      <div className="p-2 border-t border-zinc-800/60">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-zinc-500 hover:bg-zinc-800/40 hover:text-zinc-300 transition-colors ${
            collapsed ? 'justify-center' : ''
          }`}
        >
          <svg
            className={`w-4 h-4 transition-transform ${collapsed ? '' : 'rotate-180'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
          </svg>
          {!collapsed && <span className="text-xs">Collapse</span>}
        </button>
      </div>
    </motion.aside>
  );
}
