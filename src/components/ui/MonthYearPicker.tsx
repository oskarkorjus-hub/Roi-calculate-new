import { useState, useRef, useEffect } from 'react';

interface MonthYearPickerProps {
  value: string; // YYYY-MM or YYYY-MM-DD format
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  helperText?: string;
  className?: string;
  showDay?: boolean; // If true, returns YYYY-MM-DD (with day = 01)
}

const MONTHS = [
  { short: 'Jan', full: 'January', num: '01' },
  { short: 'Feb', full: 'February', num: '02' },
  { short: 'Mar', full: 'March', num: '03' },
  { short: 'Apr', full: 'April', num: '04' },
  { short: 'May', full: 'May', num: '05' },
  { short: 'Jun', full: 'June', num: '06' },
  { short: 'Jul', full: 'July', num: '07' },
  { short: 'Aug', full: 'August', num: '08' },
  { short: 'Sep', full: 'September', num: '09' },
  { short: 'Oct', full: 'October', num: '10' },
  { short: 'Nov', full: 'November', num: '11' },
  { short: 'Dec', full: 'December', num: '12' },
];

export function MonthYearPicker({
  value,
  onChange,
  placeholder = 'Select date',
  className = '',
  showDay = true,
}: MonthYearPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewYear, setViewYear] = useState(() => {
    if (value) {
      const year = parseInt(value.slice(0, 4));
      return isNaN(year) ? new Date().getFullYear() : year;
    }
    return new Date().getFullYear();
  });

  const containerRef = useRef<HTMLDivElement>(null);

  // Parse current value
  const selectedYear = value ? parseInt(value.slice(0, 4)) : null;
  const selectedMonth = value ? value.slice(5, 7) : null;

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Update viewYear when value changes externally
  useEffect(() => {
    if (value) {
      const year = parseInt(value.slice(0, 4));
      if (!isNaN(year)) {
        setViewYear(year);
      }
    }
  }, [value]);

  const handleMonthSelect = (monthNum: string) => {
    const newValue = showDay
      ? `${viewYear}-${monthNum}-01`
      : `${viewYear}-${monthNum}`;
    onChange(newValue);
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange('');
    setIsOpen(false);
  };

  const handleThisMonth = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const newValue = showDay ? `${year}-${month}-01` : `${year}-${month}`;
    onChange(newValue);
    setViewYear(year);
    setIsOpen(false);
  };

  const formatDisplayValue = () => {
    if (!value || !selectedYear || !selectedMonth) return '';
    const monthObj = MONTHS.find(m => m.num === selectedMonth);
    return `${monthObj?.full || ''} ${selectedYear}`;
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full flex items-center justify-between gap-2
          rounded-lg border px-3 py-2
          bg-surface-alt text-left transition-all text-sm
          ${isOpen
            ? 'border-primary ring-2 ring-primary/20'
            : 'border-border hover:border-border-light'
          }
        `}
      >
        <div className="flex items-center gap-2">
          <svg
            className="w-4 h-4 text-text-muted"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span className={value ? 'text-text-primary' : 'text-text-muted'}>
            {formatDisplayValue() || placeholder}
          </span>
        </div>
        <svg
          className={`w-4 h-4 text-text-muted transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-2 w-full min-w-[280px] rounded-xl bg-surface border border-border shadow-xl overflow-hidden">
          {/* Year Navigation */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <button
              type="button"
              onClick={() => setViewYear(y => y - 1)}
              className="p-1 rounded-lg hover:bg-surface-alt text-text-muted hover:text-text-primary transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="text-lg font-semibold text-text-primary">{viewYear}</span>
            <button
              type="button"
              onClick={() => setViewYear(y => y + 1)}
              className="p-1 rounded-lg hover:bg-surface-alt text-text-muted hover:text-text-primary transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Month Grid */}
          <div className="grid grid-cols-4 gap-2 p-4">
            {MONTHS.map((month) => {
              const isSelected = selectedYear === viewYear && selectedMonth === month.num;
              const isCurrentMonth =
                new Date().getFullYear() === viewYear &&
                new Date().getMonth() + 1 === parseInt(month.num);

              return (
                <button
                  key={month.num}
                  type="button"
                  onClick={() => handleMonthSelect(month.num)}
                  className={`
                    py-2.5 px-2 rounded-lg text-sm font-medium transition-all
                    ${isSelected
                      ? 'bg-primary text-white'
                      : isCurrentMonth
                        ? 'bg-primary/20 text-primary hover:bg-primary/30'
                        : 'text-text-secondary hover:bg-surface-alt hover:text-text-primary'
                    }
                  `}
                >
                  {month.short}
                </button>
              );
            })}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-surface-alt/50">
            <button
              type="button"
              onClick={handleClear}
              className="text-sm text-text-muted hover:text-text-primary transition-colors"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={handleThisMonth}
              className="text-sm font-medium text-primary hover:text-primary-light transition-colors"
            >
              This month
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
