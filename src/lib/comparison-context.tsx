import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type {
  ComparisonState,
  ComparisonData,
  CalculatorType,
} from './comparison-types';
import { MAX_COMPARISONS, calculatorTypeToStateKey } from './comparison-types';

const STORAGE_KEY = 'roi-calculate-comparisons';

const INITIAL_STATE: ComparisonState = {
  rentalROI: [],
  xirr: [],
  mortgage: [],
  cashflow: [],
  devFeasibility: [],
  capRate: [],
  irr: [],
  npv: [],
  financing: [],
  rentalProjection: [],
  indonesiaTax: [],
  devBudget: [],
  riskAssessment: [],
  brrrr: [],
};

interface ComparisonContextType {
  comparisons: ComparisonState;
  addComparison: (type: CalculatorType, data: Omit<ComparisonData, 'timestamp'>) => boolean;
  removeComparison: (type: CalculatorType, timestamp: number) => void;
  updateLabel: (type: CalculatorType, timestamp: number, newLabel: string) => void;
  clearAll: (type: CalculatorType) => void;
  getCount: (type: CalculatorType) => number;
  getComparisons: (type: CalculatorType) => ComparisonData[];
}

const ComparisonContext = createContext<ComparisonContextType | null>(null);

const loadFromStorage = (): ComparisonState => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...INITIAL_STATE, ...parsed };
    }
  } catch (e) {
    console.error('Failed to load comparisons from localStorage:', e);
  }
  return INITIAL_STATE;
};

const saveToStorage = (state: ComparisonState) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save comparisons to localStorage:', e);
  }
};

export function ComparisonProvider({ children }: { children: ReactNode }) {
  const [comparisons, setComparisons] = useState<ComparisonState>(() => loadFromStorage());

  useEffect(() => {
    saveToStorage(comparisons);
  }, [comparisons]);

  const addComparison = useCallback((type: CalculatorType, data: Omit<ComparisonData, 'timestamp'>): boolean => {
    const stateKey = calculatorTypeToStateKey[type];
    const currentList = comparisons[stateKey] as ComparisonData[];

    if (currentList.length >= MAX_COMPARISONS) {
      return false;
    }

    const newEntry = {
      ...data,
      timestamp: Date.now(),
    } as ComparisonData;

    setComparisons(prev => ({
      ...prev,
      [stateKey]: [...(prev[stateKey] as ComparisonData[]), newEntry],
    }));

    return true;
  }, [comparisons]);

  const removeComparison = useCallback((type: CalculatorType, timestamp: number) => {
    const stateKey = calculatorTypeToStateKey[type];
    setComparisons(prev => ({
      ...prev,
      [stateKey]: (prev[stateKey] as ComparisonData[]).filter(c => c.timestamp !== timestamp),
    }));
  }, []);

  const updateLabel = useCallback((type: CalculatorType, timestamp: number, newLabel: string) => {
    const stateKey = calculatorTypeToStateKey[type];
    setComparisons(prev => ({
      ...prev,
      [stateKey]: (prev[stateKey] as ComparisonData[]).map(c =>
        c.timestamp === timestamp ? { ...c, label: newLabel } : c
      ),
    }));
  }, []);

  const clearAll = useCallback((type: CalculatorType) => {
    const stateKey = calculatorTypeToStateKey[type];
    setComparisons(prev => ({
      ...prev,
      [stateKey]: [],
    }));
  }, []);

  const getCount = useCallback((type: CalculatorType): number => {
    const stateKey = calculatorTypeToStateKey[type];
    return (comparisons[stateKey] as ComparisonData[]).length;
  }, [comparisons]);

  const getComparisons = useCallback((type: CalculatorType): ComparisonData[] => {
    const stateKey = calculatorTypeToStateKey[type];
    return comparisons[stateKey] as ComparisonData[];
  }, [comparisons]);

  return (
    <ComparisonContext.Provider value={{
      comparisons,
      addComparison,
      removeComparison,
      updateLabel,
      clearAll,
      getCount,
      getComparisons,
    }}>
      {children}
    </ComparisonContext.Provider>
  );
}

export function useComparison() {
  const context = useContext(ComparisonContext);
  if (!context) {
    throw new Error('useComparison must be used within ComparisonProvider');
  }
  return context;
}
