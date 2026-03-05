import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { PortfolioProject, EmailLog, ComparisonSnapshot } from '../types/portfolio';
import { useAuth } from './auth-context';
import {
  fetchUserDrafts,
  createDraft,
  updateDraft as updateDraftDb,
  deleteDraft as deleteDraftDb,
} from './drafts-service';

const PORTFOLIO_STORAGE_KEY = 'baliinvest_portfolio';
const EMAIL_LOG_STORAGE_KEY = 'baliinvest_email_log';
const COMPARISONS_STORAGE_KEY = 'baliinvest_comparisons';

interface PortfolioContextType {
  projects: PortfolioProject[];
  emailLog: EmailLog[];
  savedComparisons: ComparisonSnapshot[];
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  addProject: (project: Omit<PortfolioProject, 'id' | 'createdAt' | 'updatedAt'>) => Promise<PortfolioProject | null>;
  updateProject: (id: string, updates: Partial<PortfolioProject>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  getProjectById: (id: string) => PortfolioProject | undefined;
  getProjectsByCalculator: (calculatorId: string) => PortfolioProject[];
  calculatePortfolioMetrics: () => {
    totalProjects: number;
    totalInvestment: number;
    blendedROI: number;
    avgCashFlow: number;
    avgInvestmentScore: number;
  };
  logEmail: (email: string, name: string | undefined, propertyName: string, reportType: string) => void;
  getEmailLog: () => EmailLog[];
  canAddProject: (maxProjects: number) => boolean;
  getProjectCount: () => number;
  // Saved comparisons
  saveComparison: (name: string, projectIds: string[]) => ComparisonSnapshot | null;
  deleteComparison: (id: string) => void;
  getComparisonById: (id: string) => ComparisonSnapshot | undefined;
}

const PortfolioContext = createContext<PortfolioContextType | null>(null);

export function PortfolioProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const initialLoadDone = useRef(false);

  const [emailLog, setEmailLog] = useState<EmailLog[]>(() => {
    const saved = localStorage.getItem(EMAIL_LOG_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  const [savedComparisons, setSavedComparisons] = useState<ComparisonSnapshot[]>(() => {
    const saved = localStorage.getItem(COMPARISONS_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  // Load projects based on auth state
  useEffect(() => {
    async function loadProjects() {
      setLoading(true);
      setError(null);

      if (user) {
        // Logged in - fetch from Supabase
        const { data, error } = await fetchUserDrafts(user.id);
        if (error) {
          console.error('Error fetching drafts:', error);
          setError(error.message);
          // Fall back to localStorage
          const saved = localStorage.getItem(PORTFOLIO_STORAGE_KEY);
          setProjects(saved ? JSON.parse(saved) : []);
        } else {
          setProjects(data || []);
        }
      } else {
        // Not logged in - use localStorage
        const saved = localStorage.getItem(PORTFOLIO_STORAGE_KEY);
        setProjects(saved ? JSON.parse(saved) : []);
      }

      setLoading(false);
      initialLoadDone.current = true;
    }

    loadProjects();
  }, [user]);

  // Persist to localStorage only for guests (not logged in)
  useEffect(() => {
    if (!user && initialLoadDone.current) {
      localStorage.setItem(PORTFOLIO_STORAGE_KEY, JSON.stringify(projects));
    }
  }, [projects, user]);

  useEffect(() => {
    localStorage.setItem(EMAIL_LOG_STORAGE_KEY, JSON.stringify(emailLog));
  }, [emailLog]);

  useEffect(() => {
    localStorage.setItem(COMPARISONS_STORAGE_KEY, JSON.stringify(savedComparisons));
  }, [savedComparisons]);

  const addProject = useCallback(async (project: Omit<PortfolioProject, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (user) {
      // Save to Supabase
      const { data, error } = await createDraft(project, user.id);
      if (error) {
        console.error('Error creating draft:', error);
        setError(error.message);
        return null;
      }
      if (data) {
        setProjects(prev => [data, ...prev]);
        return data;
      }
      return null;
    } else {
      // Save to localStorage
      const newProject: PortfolioProject = {
        ...project,
        id: uuidv4(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setProjects(prev => [newProject, ...prev]);
      return newProject;
    }
  }, [user]);

  const updateProject = useCallback(async (id: string, updates: Partial<PortfolioProject>) => {
    if (user) {
      // Update in Supabase
      const { data, error } = await updateDraftDb(id, updates, user.id);
      if (error) {
        console.error('Error updating draft:', error);
        setError(error.message);
        return;
      }
      if (data) {
        setProjects(prev =>
          prev.map(p => p.id === id ? data : p)
        );
      }
    } else {
      // Update in localStorage
      setProjects(prev =>
        prev.map(p =>
          p.id === id
            ? {
                ...p,
                ...updates,
                updatedAt: new Date().toISOString(),
                scenarios: updates.scenarios !== undefined ? updates.scenarios : p.scenarios
              }
            : p
        )
      );
    }
  }, [user]);

  const deleteProject = useCallback(async (id: string) => {
    if (user) {
      // Delete from Supabase
      const { error } = await deleteDraftDb(id, user.id);
      if (error) {
        console.error('Error deleting draft:', error);
        setError(error.message);
        return;
      }
    }
    // Remove from local state (works for both logged in and guest)
    setProjects(prev => prev.filter(p => p.id !== id));
  }, [user]);

  const getProjectById = useCallback((id: string) => {
    return projects.find(p => p.id === id);
  }, [projects]);

  const getProjectsByCalculator = useCallback((calculatorId: string) => {
    return projects.filter(p => p.calculatorId === calculatorId);
  }, [projects]);

  const calculatePortfolioMetrics = useCallback(() => {
    if (projects.length === 0) {
      return {
        totalProjects: 0,
        totalInvestment: 0,
        blendedROI: 0,
        avgCashFlow: 0,
        avgInvestmentScore: 0,
      };
    }

    const totalInvestment = projects.reduce((sum, p) => sum + (Number(p.totalInvestment) || 0), 0);
    const blendedROI = totalInvestment > 0
      ? projects.reduce((sum, p) => sum + ((Number(p.roi) || 0) * ((Number(p.totalInvestment) || 0) / totalInvestment)), 0)
      : 0;
    const avgCashFlow = projects.reduce((sum, p) => sum + (Number(p.avgCashFlow) || 0), 0) / projects.length;
    const avgInvestmentScore = projects.reduce((sum, p) => sum + (Number(p.investmentScore) || 0), 0) / projects.length;

    return {
      totalProjects: projects.length,
      totalInvestment,
      blendedROI: isNaN(blendedROI) ? 0 : blendedROI,
      avgCashFlow,
      avgInvestmentScore: isNaN(avgInvestmentScore) ? 0 : avgInvestmentScore,
    };
  }, [projects]);

  const logEmail = useCallback((email: string, name: string | undefined, propertyName: string, reportType: string) => {
    const log: EmailLog = {
      email,
      name,
      propertyName,
      reportType,
      sentAt: new Date().toISOString(),
    };
    setEmailLog(prev => [log, ...prev]);
  }, []);

  const getEmailLog = useCallback(() => {
    return emailLog;
  }, [emailLog]);

  const canAddProject = useCallback((maxProjects: number): boolean => {
    if (maxProjects === Infinity) return true;
    return projects.length < maxProjects;
  }, [projects.length]);

  const getProjectCount = useCallback((): number => {
    return projects.length;
  }, [projects.length]);

  const saveComparison = useCallback((name: string, projectIds: string[]): ComparisonSnapshot | null => {
    if (!name.trim() || projectIds.length < 2) return null;

    const comparisonProjects = projects.filter(p => projectIds.includes(p.id));
    if (comparisonProjects.length < 2) return null;

    const newComparison: ComparisonSnapshot = {
      id: uuidv4(),
      name: name.trim(),
      projects: comparisonProjects,
      createdAt: new Date().toISOString(),
    };

    setSavedComparisons(prev => [newComparison, ...prev]);
    return newComparison;
  }, [projects]);

  const deleteComparison = useCallback((id: string) => {
    setSavedComparisons(prev => prev.filter(c => c.id !== id));
  }, []);

  const getComparisonById = useCallback((id: string) => {
    return savedComparisons.find(c => c.id === id);
  }, [savedComparisons]);

  return (
    <PortfolioContext.Provider value={{
      projects,
      emailLog,
      savedComparisons,
      loading,
      error,
      isAuthenticated: !!user,
      addProject,
      updateProject,
      deleteProject,
      getProjectById,
      getProjectsByCalculator,
      calculatePortfolioMetrics,
      logEmail,
      getEmailLog,
      canAddProject,
      getProjectCount,
      saveComparison,
      deleteComparison,
      getComparisonById,
    }}>
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolio(): PortfolioContextType {
  const context = useContext(PortfolioContext);
  if (!context) {
    throw new Error('usePortfolio must be used within PortfolioProvider');
  }
  return context;
}
