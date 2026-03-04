import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { ProjectScenario, PortfolioProject } from '../types/portfolio';
import { usePortfolio } from './usePortfolio';
import { calculateInvestmentScore } from '../utils/investmentScoring';

export function useScenarios() {
  const { updateProject, getProjectById } = usePortfolio();
  const [selectedScenarios, setSelectedScenarios] = useState<string[]>([]);

  const createScenario = useCallback(
    (baseProject: PortfolioProject, scenarioName: string, newInputs: Record<string, any>) => {
      if (!baseProject.scenarios) {
        baseProject.scenarios = [];
      }

      // Calculate new results based on new inputs
      const newResults = calculateResultsFromInputs(newInputs, baseProject.calculatorId);

      const scenario: ProjectScenario = {
        id: uuidv4(),
        name: scenarioName,
        baseProjectId: baseProject.id,
        inputs: newInputs,
        results: newResults,
        createdAt: new Date().toISOString(),
        isBaseline: false,
      };

      const updatedProject = {
        ...baseProject,
        scenarios: [...baseProject.scenarios, scenario],
      };

      updateProject(baseProject.id, updatedProject);
      return scenario;
    },
    [updateProject]
  );

  const updateScenario = useCallback(
    (projectId: string, scenarioId: string, updates: Partial<ProjectScenario>) => {
      const project = getProjectById(projectId);
      if (!project || !project.scenarios) return;

      const updatedScenarios = project.scenarios.map(s =>
        s.id === scenarioId ? { ...s, ...updates } : s
      );

      updateProject(projectId, { scenarios: updatedScenarios });
    },
    [getProjectById, updateProject]
  );

  const deleteScenario = useCallback(
    (projectId: string, scenarioId: string) => {
      const project = getProjectById(projectId);
      if (!project || !project.scenarios) return;

      const updatedScenarios = project.scenarios.filter(s => s.id !== scenarioId);
      updateProject(projectId, { scenarios: updatedScenarios });
    },
    [getProjectById, updateProject]
  );

  const getScenarioComparison = useCallback(
    (project: PortfolioProject, scenarioIds: string[]) => {
      if (!project.scenarios) return [];

      return scenarioIds
        .map(id => project.scenarios?.find(s => s.id === id))
        .filter((s): s is ProjectScenario => s !== undefined);
    },
    []
  );

  const calculateWinner = useCallback((scenarios: ProjectScenario[]) => {
    if (scenarios.length === 0) return null;

    // Score based on ROI, cash flow, and break-even
    const scores = scenarios.map(s => ({
      id: s.id,
      name: s.name,
      score: (s.results.roi || 0) * 0.5 + (s.results.avgCashFlow || 0) * 0.3 - (s.results.breakEvenMonths || 0) * 0.2,
    }));

    return scores.reduce((a, b) => (a.score > b.score ? a : b));
  }, []);

  return {
    selectedScenarios,
    setSelectedScenarios,
    createScenario,
    updateScenario,
    deleteScenario,
    getScenarioComparison,
    calculateWinner,
  };
}

// Helper function to calculate results from inputs (will be customized per calculator type)
function calculateResultsFromInputs(inputs: Record<string, any>, calculatorType: string): Record<string, any> {
  // This is a placeholder - in a real implementation, you'd call the actual calculator logic
  // For now, we return the inputs as-is and let the parent component handle calculation

  return {
    roi: inputs.roi || 0,
    avgCashFlow: inputs.avgCashFlow || inputs.monthlyPayment || 0,
    breakEvenMonths: inputs.breakEvenMonths || 0,
    totalInvestment: inputs.totalInvestment || inputs.loanAmount || 0,
    currency: inputs.currency || 'IDR',
  };
}
