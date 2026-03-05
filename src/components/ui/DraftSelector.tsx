import { useState, useRef, useEffect } from 'react';
import type { ArchivedDraft } from '../../hooks/useArchivedDrafts';

interface DraftSelectorProps<T> {
  drafts: ArchivedDraft<T>[];
  onSelect: (draft: ArchivedDraft<T>) => void;
  onSave: (name: string) => void;
  onDelete: (id: string) => void;
  currentName?: string;
}

export function DraftSelector<T>({
  drafts,
  onSelect,
  onSave,
  onDelete,
  currentName,
}: DraftSelectorProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [draftName, setDraftName] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setDeleteConfirm(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSave = () => {
    if (draftName.trim()) {
      onSave(draftName.trim());
      setDraftName('');
      setShowSaveModal(false);
    }
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (deleteConfirm === id) {
      onDelete(id);
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(id);
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button - Dark Theme */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          group relative flex items-center gap-3 px-4 py-2.5
          bg-zinc-800/80 backdrop-blur-sm
          border border-zinc-700/60
          rounded-xl
          shadow-[0_1px_2px_rgba(0,0,0,0.2)]
          hover:bg-zinc-700/80
          hover:border-zinc-600/60
          hover:shadow-[0_2px_8px_rgba(0,0,0,0.3)]
          active:scale-[0.99]
          transition-all duration-200 ease-out
          ${isOpen ? 'ring-2 ring-emerald-500/30 border-emerald-500/50' : ''}
        `}
      >
        {/* Folder Icon */}
        <div className="relative flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/30">
          <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
        </div>

        <span className="text-sm font-semibold text-zinc-200 tracking-tight">
          {currentName || 'Saved Drafts'}
        </span>

        {/* Chevron with rotation animation */}
        <svg
          className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>

        {/* Count Badge */}
        {drafts.length > 0 && (
          <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[10px] font-bold text-white bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full shadow-sm ring-2 ring-zinc-900">
            {drafts.length}
          </span>
        )}
      </button>

      {/* Dropdown Menu - Dark Theme */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-zinc-900/95 backdrop-blur-xl rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.4),0_12px_48px_rgba(0,0,0,0.3)] border border-zinc-700/60 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="px-4 py-3.5 bg-zinc-800/50 border-b border-zinc-700/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
              <span className="text-sm font-semibold text-zinc-200 tracking-tight">Saved Calculations</span>
            </div>
            <button
              onClick={() => {
                setShowSaveModal(true);
                setIsOpen(false);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 rounded-lg transition-all duration-150"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Save Current
            </button>
          </div>

          {/* Drafts List */}
          <div className="max-h-64 overflow-y-auto">
            {drafts.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-zinc-800 border border-zinc-700 mb-3">
                  <svg className="w-6 h-6 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-zinc-400">No saved calculations yet</p>
                <p className="text-xs text-zinc-500 mt-1">Click "Save Current" to save your first draft</p>
              </div>
            ) : (
              <ul className="divide-y divide-zinc-800">
                {drafts.map((draft) => (
                  <li
                    key={draft.id}
                    className="px-4 py-3.5 hover:bg-zinc-800/80 cursor-pointer transition-all duration-150 group"
                    onClick={() => {
                      onSelect(draft);
                      setIsOpen(false);
                    }}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-zinc-200 truncate group-hover:text-emerald-400 transition-colors">
                          {draft.name}
                        </p>
                        <p className="text-xs text-zinc-500 mt-0.5">
                          {formatDate(draft.updatedAt)}
                        </p>
                      </div>
                      <button
                        onClick={(e) => handleDelete(draft.id, e)}
                        className={`p-1.5 rounded-lg transition-all duration-150 ${
                          deleteConfirm === draft.id
                            ? 'bg-red-500/20 text-red-400'
                            : 'opacity-0 group-hover:opacity-100 hover:bg-red-500/10 text-zinc-500 hover:text-red-400'
                        }`}
                        title={deleteConfirm === draft.id ? 'Click again to confirm' : 'Delete'}
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* Save Modal - Dark Theme */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="bg-zinc-900/95 backdrop-blur-xl rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.4),0_20px_80px_rgba(0,0,0,0.3)] w-full max-w-md mx-4 overflow-hidden border border-zinc-700/60 animate-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-zinc-800 bg-zinc-800/50">
              <div className="flex items-center gap-3 mb-1">
                <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30">
                  <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-white tracking-tight">Save Calculation</h3>
              </div>
              <p className="text-sm text-zinc-400 pl-11">
                Give your calculation a name to easily find it later
              </p>
            </div>
            <div className="px-6 py-5">
              <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                Draft Name
              </label>
              <input
                type="text"
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                placeholder="e.g., Villa Canggu 3BR, Investment Option A..."
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder:text-zinc-500 focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 outline-none transition-all duration-200"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSave();
                  if (e.key === 'Escape') setShowSaveModal(false);
                }}
              />
            </div>
            <div className="px-6 py-4 bg-zinc-800/30 flex justify-end gap-3 border-t border-zinc-800">
              <button
                onClick={() => setShowSaveModal(false)}
                className="px-5 py-2.5 text-sm font-semibold text-zinc-400 hover:text-white hover:bg-zinc-700/50 rounded-xl transition-all duration-150"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!draftName.trim()}
                className="px-5 py-2.5 bg-gradient-to-b from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white text-sm font-semibold rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.2),0_2px_8px_rgba(16,185,129,0.25)] hover:shadow-[0_2px_4px_rgba(0,0,0,0.2),0_4px_12px_rgba(16,185,129,0.35)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none transition-all duration-200"
              >
                Save Draft
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
