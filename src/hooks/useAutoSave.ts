import { useEffect, useCallback } from 'react';

const AUTOSAVE_PREFIX = 'baliinvest_autosave_';

export interface AutoSaveData<T> {
  data: T;
  updatedAt: string;
  preview?: Record<string, string | number>;
}

/**
 * Auto-saves calculator inputs to localStorage
 */
export function useAutoSave<T>(
  calculatorId: string,
  data: T,
  getPreview?: (data: T) => Record<string, string | number>
) {
  useEffect(() => {
    const key = `${AUTOSAVE_PREFIX}${calculatorId}`;
    const autoSaveData: AutoSaveData<T> = {
      data,
      updatedAt: new Date().toISOString(),
      preview: getPreview ? getPreview(data) : undefined,
    };
    localStorage.setItem(key, JSON.stringify(autoSaveData));
  }, [calculatorId, data, getPreview]);
}

/**
 * Load auto-saved data for a calculator
 */
export function loadAutoSave<T>(calculatorId: string): AutoSaveData<T> | null {
  const key = `${AUTOSAVE_PREFIX}${calculatorId}`;
  try {
    const saved = localStorage.getItem(key);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error(`Failed to load autosave for ${calculatorId}:`, e);
  }
  return null;
}

/**
 * Clear auto-saved data for a calculator
 */
export function clearAutoSave(calculatorId: string) {
  const key = `${AUTOSAVE_PREFIX}${calculatorId}`;
  localStorage.removeItem(key);
}

/**
 * Get preview data for multiple calculators
 */
export function getAutoSavePreviews(calculatorIds: string[]): Record<string, AutoSaveData<unknown> | null> {
  const result: Record<string, AutoSaveData<unknown> | null> = {};
  for (const id of calculatorIds) {
    result[id] = loadAutoSave(id);
  }
  return result;
}
