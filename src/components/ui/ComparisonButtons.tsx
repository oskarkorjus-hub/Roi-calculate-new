import { useState } from 'react';
import { useComparison } from '../../lib/comparison-context';
import type { CalculatorType, ComparisonData } from '../../lib/comparison-types';
import { MAX_COMPARISONS, calculatorDisplayNames } from '../../lib/comparison-types';
import { ComparisonView } from './ComparisonView';
import { Toast } from './Toast';

interface ComparisonButtonsProps {
  calculatorType: CalculatorType;
  getComparisonData: () => Omit<ComparisonData, 'timestamp'>;
  disabled?: boolean;
}

export function ComparisonButtons({
  calculatorType,
  getComparisonData,
  disabled = false,
}: ComparisonButtonsProps) {
  const { addComparison, getCount } = useComparison();
  const [showComparison, setShowComparison] = useState(false);
  const [showLabelInput, setShowLabelInput] = useState(false);
  const [label, setLabel] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const count = getCount(calculatorType);
  const isFull = count >= MAX_COMPARISONS;

  const handleSaveToCompare = () => {
    if (isFull) {
      setToast({ message: `Maximum ${MAX_COMPARISONS} comparisons reached`, type: 'error' });
      return;
    }
    setShowLabelInput(true);
    setLabel(`Calc ${count + 1}`);
  };

  const handleConfirmSave = () => {
    const data = getComparisonData();
    const success = addComparison(calculatorType, {
      ...data,
      label: label || `Calc ${count + 1}`,
    });

    if (success) {
      setToast({ message: 'Saved to comparison', type: 'success' });
    } else {
      setToast({ message: 'Failed to save comparison', type: 'error' });
    }

    setShowLabelInput(false);
    setLabel('');
  };

  const handleCancelSave = () => {
    setShowLabelInput(false);
    setLabel('');
  };

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Save to Compare Button with inline label input */}
      <div className="mt-4 space-y-3">
        {showLabelInput ? (
          <div className="flex items-center gap-2 bg-zinc-800/50 rounded-lg p-2">
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Enter label..."
              className="flex-1 px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleConfirmSave();
                if (e.key === 'Escape') handleCancelSave();
              }}
            />
            <button
              onClick={handleConfirmSave}
              className="px-3 py-1.5 bg-emerald-600 text-white text-sm rounded hover:bg-emerald-700 transition"
            >
              Save
            </button>
            <button
              onClick={handleCancelSave}
              className="px-3 py-1.5 bg-zinc-700 text-white text-sm rounded hover:bg-zinc-600 transition"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={handleSaveToCompare}
            disabled={disabled || isFull}
            className={`w-full py-2.5 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2 ${
              disabled || isFull
                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                : 'bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 border border-emerald-600/30'
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {isFull ? `Max ${MAX_COMPARISONS} Saved` : 'Save to Compare'}
          </button>
        )}

        {/* View Comparisons Button */}
        <button
          onClick={() => setShowComparison(true)}
          className="w-full py-2.5 rounded-lg text-sm font-medium bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border border-zinc-700 transition flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          View Comparisons {count > 0 && `(${count})`}
        </button>
      </div>

      {/* Comparison Modal */}
      <ComparisonView
        isOpen={showComparison}
        onClose={() => setShowComparison(false)}
        calculatorType={calculatorType}
      />
    </>
  );
}
