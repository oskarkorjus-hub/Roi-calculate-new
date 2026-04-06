import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { CALCULATORS } from '../../calculators/registry';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCalculator: (id: string) => void;
  onViewChange: (view: 'home' | 'portfolio' | 'comparison') => void;
}

type CommandCategory = 'navigation' | 'calculator' | 'action';

interface Command {
  id: string;
  label: string;
  description?: string;
  icon: string;
  category: CommandCategory;
  shortcut?: string;
  action: () => void;
}

export function CommandPalette({ isOpen, onClose, onSelectCalculator, onViewChange }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Build command list
  const commands = useMemo<Command[]>(() => {
    const navCommands: Command[] = [
      {
        id: 'nav-calculators',
        label: 'Go to Calculators',
        description: 'Browse all calculators',
        icon: 'calculate',
        category: 'navigation',
        shortcut: '1',
        action: () => onViewChange('home'),
      },
      {
        id: 'nav-portfolio',
        label: 'Go to Portfolio',
        description: 'View saved projects',
        icon: 'folder_special',
        category: 'navigation',
        shortcut: '2',
        action: () => onViewChange('portfolio'),
      },
      {
        id: 'nav-compare',
        label: 'Go to Compare',
        description: 'Compare scenarios',
        icon: 'compare_arrows',
        category: 'navigation',
        shortcut: '3',
        action: () => onViewChange('comparison'),
      },
      {
        id: 'nav-settings',
        label: 'Go to Settings',
        description: 'Account settings',
        icon: 'settings',
        category: 'navigation',
        action: () => navigate('/settings'),
      },
      {
        id: 'nav-billing',
        label: 'Go to Billing',
        description: 'Manage subscription',
        icon: 'credit_card',
        category: 'navigation',
        action: () => navigate('/settings?tab=billing'),
      },
    ];

    const calculatorCommands: Command[] = CALCULATORS.map((calc) => ({
      id: `calc-${calc.id}`,
      label: calc.name,
      description: calc.description,
      icon: calc.icon,
      category: 'calculator' as CommandCategory,
      action: () => onSelectCalculator(calc.id),
    }));

    const actionCommands: Command[] = [
      {
        id: 'action-home',
        label: 'Go to Login',
        icon: 'home',
        category: 'action',
        action: () => navigate('/login'),
      },
      {
        id: 'action-help',
        label: 'Get Help',
        icon: 'help',
        category: 'action',
        action: () => navigate('/contact'),
      },
    ];

    return [...navCommands, ...calculatorCommands, ...actionCommands];
  }, [onSelectCalculator, onViewChange, navigate]);

  // Filter commands based on query
  const filteredCommands = useMemo(() => {
    if (!query.trim()) return commands;

    const lowerQuery = query.toLowerCase();
    return commands.filter(
      (cmd) =>
        cmd.label.toLowerCase().includes(lowerQuery) ||
        cmd.description?.toLowerCase().includes(lowerQuery)
    );
  }, [commands, query]);

  // Group commands by category
  const groupedCommands = useMemo(() => {
    const groups: Record<CommandCategory, Command[]> = {
      navigation: [],
      calculator: [],
      action: [],
    };

    filteredCommands.forEach((cmd) => {
      groups[cmd.category].push(cmd);
    });

    return groups;
  }, [filteredCommands]);

  // Reset selection when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < filteredCommands.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev > 0 ? prev - 1 : filteredCommands.length - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredCommands[selectedIndex]) {
            filteredCommands[selectedIndex].action();
            onClose();
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex, onClose]);

  // Scroll selected item into view
  useEffect(() => {
    const selectedElement = listRef.current?.querySelector(`[data-index="${selectedIndex}"]`);
    selectedElement?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  const getCategoryLabel = (category: CommandCategory) => {
    switch (category) {
      case 'navigation':
        return 'Navigation';
      case 'calculator':
        return 'Calculators';
      case 'action':
        return 'Actions';
    }
  };

  let currentIndex = -1;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
            className="fixed top-[15%] left-1/2 -translate-x-1/2 w-full max-w-xl z-50"
          >
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden">
              {/* Search Input */}
              <div className="flex items-center gap-3 px-4 py-4 border-b border-zinc-800">
                <span className="material-symbols-outlined text-zinc-400">search</span>
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search commands, calculators..."
                  className="flex-1 bg-transparent text-white text-lg placeholder-zinc-500 focus:outline-none"
                />
                <kbd className="px-2 py-1 text-xs bg-zinc-800 text-zinc-400 rounded border border-zinc-700 font-mono">
                  ESC
                </kbd>
              </div>

              {/* Results */}
              <div ref={listRef} className="max-h-[400px] overflow-y-auto py-2">
                {filteredCommands.length === 0 ? (
                  <div className="px-4 py-8 text-center">
                    <span className="material-symbols-outlined text-4xl text-zinc-600 mb-2">search_off</span>
                    <p className="text-zinc-500">No results found</p>
                    <p className="text-zinc-600 text-sm mt-1">Try a different search term</p>
                  </div>
                ) : (
                  <>
                    {(['navigation', 'calculator', 'action'] as CommandCategory[]).map((category) => {
                      const categoryCommands = groupedCommands[category];
                      if (categoryCommands.length === 0) return null;

                      return (
                        <div key={category}>
                          <div className="px-4 py-2">
                            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                              {getCategoryLabel(category)}
                            </span>
                          </div>
                          {categoryCommands.map((cmd) => {
                            currentIndex++;
                            const index = currentIndex;
                            const isSelected = index === selectedIndex;

                            return (
                              <button
                                key={cmd.id}
                                data-index={index}
                                onClick={() => {
                                  cmd.action();
                                  onClose();
                                }}
                                onMouseEnter={() => setSelectedIndex(index)}
                                className={`w-full flex items-center gap-3 px-4 py-3 transition-colors ${
                                  isSelected ? 'bg-emerald-500/10' : 'hover:bg-zinc-800/50'
                                }`}
                              >
                                <div
                                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                    isSelected ? 'bg-emerald-500/20' : 'bg-zinc-800'
                                  }`}
                                >
                                  <span
                                    className={`material-symbols-outlined ${
                                      isSelected ? 'text-emerald-400' : 'text-zinc-400'
                                    }`}
                                  >
                                    {cmd.icon}
                                  </span>
                                </div>
                                <div className="flex-1 text-left">
                                  <p className={`font-medium ${isSelected ? 'text-emerald-400' : 'text-white'}`}>
                                    {cmd.label}
                                  </p>
                                  {cmd.description && (
                                    <p className="text-sm text-zinc-500 truncate">{cmd.description}</p>
                                  )}
                                </div>
                                {cmd.shortcut && (
                                  <kbd className="px-1.5 py-0.5 text-xs bg-zinc-800 text-zinc-400 rounded border border-zinc-700 font-mono">
                                    {cmd.shortcut}
                                  </kbd>
                                )}
                                {isSelected && (
                                  <span className="material-symbols-outlined text-emerald-400 text-sm">
                                    keyboard_return
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      );
                    })}
                  </>
                )}
              </div>

              {/* Footer */}
              <div className="px-4 py-3 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <kbd className="px-1 py-0.5 bg-zinc-800 rounded text-zinc-400">↑</kbd>
                    <kbd className="px-1 py-0.5 bg-zinc-800 rounded text-zinc-400">↓</kbd>
                    to navigate
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1 py-0.5 bg-zinc-800 rounded text-zinc-400">↵</kbd>
                    to select
                  </span>
                </div>
                <span className="text-zinc-600">{filteredCommands.length} commands</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
