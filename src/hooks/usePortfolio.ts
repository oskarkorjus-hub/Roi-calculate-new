import { useState, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { PortfolioProject, EmailLog } from '../types/portfolio';

const PORTFOLIO_STORAGE_KEY = 'baliinvest_portfolio';
const EMAIL_LOG_STORAGE_KEY = 'baliinvest_email_log';

export function usePortfolio() {
  const [projects, setProjects] = useState<PortfolioProject[]>(() => {
    const saved = localStorage.getItem(PORTFOLIO_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  const [emailLog, setEmailLog] = useState<EmailLog[]>(() => {
    const saved = localStorage.getItem(EMAIL_LOG_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(PORTFOLIO_STORAGE_KEY, JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem(EMAIL_LOG_STORAGE_KEY, JSON.stringify(emailLog));
  }, [emailLog]);

  const addProject = useCallback((project: Omit<PortfolioProject, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newProject: PortfolioProject = {
      ...project,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setProjects(prev => [newProject, ...prev]);
    return newProject;
  }, []);

  const updateProject = useCallback((id: string, updates: Partial<PortfolioProject>) => {
    setProjects(prev =>
      prev.map(p =>
        p.id === id
          ? { 
              ...p, 
              ...updates, 
              updatedAt: new Date().toISOString(),
              // Preserve scenarios if not explicitly updated
              scenarios: updates.scenarios !== undefined ? updates.scenarios : p.scenarios
            }
          : p
      )
    );
  }, []);

  const deleteProject = useCallback((id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
  }, []);

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

  return {
    projects,
    emailLog,
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
  };
}
