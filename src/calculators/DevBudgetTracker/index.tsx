import { useState, useCallback, useMemo } from 'react';
import { Toast } from '../../components/ui/Toast';
import { CalculatorToolbar } from '../../components/ui/CalculatorToolbar';
import { ReportPreviewModal } from '../../components/ui/ReportPreviewModal';
import { DraftSelector } from '../../components/ui/DraftSelector';
import { MonthYearPicker } from '../../components/ui/MonthYearPicker';
import { ComparisonButtons } from '../../components/ui/ComparisonButtons';
import { generateDevBudgetReport } from '../../hooks/useReportGenerator';
import { formatCurrency, parseDecimalInput } from '../../utils/numberParsing';
import { Tooltip } from '../../components/ui/Tooltip';
import { BudgetChart } from './components/BudgetChart';
import { TimelineGantt } from './components/TimelineGantt';
import { CostOverrunAnalysis } from './components/CostOverrunAnalysis';
import { useArchivedDrafts, type ArchivedDraft } from '../../hooks/useArchivedDrafts';
import { useAutoSave, loadAutoSave } from '../../hooks/useAutoSave';
import { useAuth } from '../../lib/auth-context';
import type { DevBudgetComparisonData } from '../../lib/comparison-types';

type CurrencyType = 'IDR' | 'USD' | 'AUD' | 'EUR' | 'GBP';

export interface BudgetLineItem {
  id: string;
  category: string;
  name: string;
  budgeted: number;
  actual: number;
  notes: string;
}

export interface ConstructionPhase {
  id: string;
  name: string;
  startMonth: number;
  duration: number;
  budgetPercent: number;
  status: 'not-started' | 'in-progress' | 'completed' | 'delayed';
  completionPercent: number;
}

interface TrackerInputs {
  projectName: string;
  currency: CurrencyType;
  projectStartDate: string;
  totalProjectDuration: number;
  currentMonth: number;

  // Budget Categories
  landCost: number;
  landActual: number;
  constructionHard: number;
  constructionHardActual: number;
  softCosts: number;
  softCostsActual: number;
  contingency: number;
  contingencyActual: number;
  financing: number;
  financingActual: number;
  marketing: number;
  marketingActual: number;

  // Line items for detailed tracking
  lineItems: BudgetLineItem[];

  // Construction phases
  phases: ConstructionPhase[];

  // Contingency settings
  contingencyPercent: number;
  contingencyUsed: number;
}

const DEFAULT_PHASES: ConstructionPhase[] = [
  { id: '1', name: 'Site Preparation', startMonth: 1, duration: 1, budgetPercent: 5, status: 'completed', completionPercent: 100 },
  { id: '2', name: 'Foundation', startMonth: 2, duration: 2, budgetPercent: 15, status: 'completed', completionPercent: 100 },
  { id: '3', name: 'Structure', startMonth: 4, duration: 3, budgetPercent: 25, status: 'in-progress', completionPercent: 60 },
  { id: '4', name: 'MEP Rough-in', startMonth: 6, duration: 2, budgetPercent: 15, status: 'not-started', completionPercent: 0 },
  { id: '5', name: 'Interior Finish', startMonth: 8, duration: 3, budgetPercent: 25, status: 'not-started', completionPercent: 0 },
  { id: '6', name: 'Landscaping & Final', startMonth: 10, duration: 2, budgetPercent: 15, status: 'not-started', completionPercent: 0 },
];

const INITIAL_INPUTS: TrackerInputs = {
  projectName: '',
  currency: 'IDR',
  projectStartDate: '',
  totalProjectDuration: 0,
  currentMonth: 0,

  landCost: 0,
  landActual: 0,
  constructionHard: 0,
  constructionHardActual: 0,
  softCosts: 0,
  softCostsActual: 0,
  contingency: 0,
  contingencyActual: 0,
  financing: 0,
  financingActual: 0,
  marketing: 0,
  marketingActual: 0,

  lineItems: [],
  phases: DEFAULT_PHASES,

  contingencyPercent: 0,
  contingencyUsed: 0,
};

const symbols: Record<CurrencyType, string> = {
  IDR: 'Rp',
  USD: '$',
  AUD: 'A$',
  EUR: '€',
  GBP: '£',
};

const categoryColors: Record<string, { bg: string; border: string; text: string }> = {
  land: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400' },
  construction: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', text: 'text-cyan-400' },
  soft: { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400' },
  contingency: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400' },
  financing: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400' },
  marketing: { bg: 'bg-pink-500/10', border: 'border-pink-500/30', text: 'text-pink-400' },
};

export function DevBudgetTracker() {
  const [inputs, setInputs] = useState<TrackerInputs>(() => {
    const saved = loadAutoSave<TrackerInputs>('dev-budget');
    return saved?.data || INITIAL_INPUTS;
  });
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'budget' | 'timeline' | 'analysis'>('budget');
  const [currentDraftName, setCurrentDraftName] = useState<string | undefined>();

  const { user } = useAuth();
  const { drafts, saveDraft: saveArchivedDraft, deleteDraft } = useArchivedDrafts<TrackerInputs>('dev-budget', user?.id);

  // Auto-save for "Continue Where You Left Off"
  useAutoSave('dev-budget', inputs, (data) => ({
    projectName: data.projectName,
    totalBudget: data.landCost + data.constructionHard + data.softCosts + data.contingency + data.financing + data.marketing,
    currency: data.currency,
  }));

  const handleSelectDraft = useCallback((draft: ArchivedDraft<TrackerInputs>) => {
    setInputs(draft.data);
    setCurrentDraftName(draft.name);
    setToast({ message: `Loaded "${draft.name}"`, type: 'success' });
  }, []);

  const handleSaveArchive = useCallback((name: string) => {
    saveArchivedDraft(name, inputs);
    setCurrentDraftName(name);
    setToast({ message: `Saved "${name}"`, type: 'success' });
  }, [saveArchivedDraft, inputs]);

  const handleDeleteDraft = useCallback((id: string) => {
    deleteDraft(id);
    setToast({ message: 'Draft deleted', type: 'success' });
  }, [deleteDraft]);

  // Calculate totals
  const calculations = useMemo(() => {
    const totalBudgeted = inputs.landCost + inputs.constructionHard + inputs.softCosts +
      inputs.contingency + inputs.financing + inputs.marketing;
    const totalActual = inputs.landActual + inputs.constructionHardActual + inputs.softCostsActual +
      inputs.contingencyActual + inputs.financingActual + inputs.marketingActual;
    const variance = totalActual - totalBudgeted;
    const variancePercent = totalBudgeted > 0 ? (variance / totalBudgeted) * 100 : 0;

    // Expected spend based on timeline
    const timelineProgress = inputs.currentMonth / inputs.totalProjectDuration;
    const expectedSpend = totalBudgeted * timelineProgress;
    const spendVariance = totalActual - expectedSpend;

    // Phase completion
    const completedPhases = inputs.phases.filter(p => p.status === 'completed').length;
    const delayedPhases = inputs.phases.filter(p => p.status === 'delayed').length;
    const overallCompletion = inputs.phases.reduce((sum, p) =>
      sum + (p.completionPercent * p.budgetPercent / 100), 0);

    // Contingency analysis
    const contingencyRemaining = inputs.contingency - inputs.contingencyActual;
    const contingencyUsedPercent = inputs.contingency > 0
      ? (inputs.contingencyActual / inputs.contingency) * 100
      : 0;

    // Project health score
    let healthScore = 100;
    if (variancePercent > 0) healthScore -= Math.min(variancePercent * 2, 30);
    if (delayedPhases > 0) healthScore -= delayedPhases * 10;
    if (contingencyUsedPercent > 50) healthScore -= (contingencyUsedPercent - 50) / 2;
    healthScore = Math.max(0, Math.min(100, healthScore));

    return {
      totalBudgeted,
      totalActual,
      variance,
      variancePercent,
      expectedSpend,
      spendVariance,
      completedPhases,
      delayedPhases,
      overallCompletion,
      contingencyRemaining,
      contingencyUsedPercent,
      healthScore,
      timelineProgress: timelineProgress * 100,
    };
  }, [inputs]);

  const symbol = symbols[inputs.currency] || 'Rp';

  // Report data
  const reportData = useMemo(() => {
    return generateDevBudgetReport(
      {
        projectName: inputs.projectName,
        totalBudget: calculations.totalBudgeted,
        totalActual: calculations.totalActual,
        variance: calculations.variance,
        variancePercent: calculations.variancePercent,
      },
      [
        { name: 'Land', budgeted: inputs.landCost, actual: inputs.landActual },
        { name: 'Construction', budgeted: inputs.constructionHard, actual: inputs.constructionHardActual },
        { name: 'Soft Costs', budgeted: inputs.softCosts, actual: inputs.softCostsActual },
        { name: 'Contingency', budgeted: inputs.contingency, actual: inputs.contingencyActual },
        { name: 'Financing', budgeted: inputs.financing, actual: inputs.financingActual },
        { name: 'Marketing', budgeted: inputs.marketing, actual: inputs.marketingActual },
      ],
      {
        currentMonth: inputs.currentMonth,
        totalDuration: inputs.totalProjectDuration,
        completionPercent: calculations.overallCompletion,
        healthScore: calculations.healthScore,
      },
      symbol
    );
  }, [inputs, calculations, symbol]);

  const handleInputChange = (field: keyof TrackerInputs, value: string | number) => {
    setInputs(prev => ({
      ...prev,
      [field]: typeof value === 'string' && !['projectName', 'projectStartDate', 'currency'].includes(field)
        ? parseDecimalInput(value) || 0
        : value,
    }));
  };

  const handlePhaseChange = (phaseId: string, field: keyof ConstructionPhase, value: string | number) => {
    setInputs(prev => ({
      ...prev,
      phases: prev.phases.map(phase =>
        phase.id === phaseId
          ? { ...phase, [field]: typeof value === 'number' ? value : value }
          : phase
      ),
    }));
  };

  const handleReset = useCallback(() => {
    if (showResetConfirm) {
      setInputs(INITIAL_INPUTS);
      setCurrentDraftName(undefined);
      setShowResetConfirm(false);
      setToast({ message: 'All values reset', type: 'success' });
    } else {
      setShowResetConfirm(true);
      setTimeout(() => setShowResetConfirm(false), 3000);
    }
  }, [showResetConfirm]);

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-amber-400';
    return 'text-red-400';
  };

  const getHealthLabel = (score: number) => {
    if (score >= 80) return 'Healthy';
    if (score >= 60) return 'At Risk';
    return 'Critical';
  };

  return (
    <div className="text-white w-full overflow-hidden">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <ReportPreviewModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        reportData={reportData}
      />

      <div className="max-w-[100%] mx-auto">
        {/* Header */}
        <header className="mb-6 sm:mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center shadow-lg shadow-amber-900/30">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Development Budget Tracker</h1>
              <p className="text-zinc-500 text-sm mt-1">
                Track construction budgets, timelines, and cost overruns
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {user && (
              <DraftSelector
                drafts={drafts}
                onSelect={handleSelectDraft}
                onSave={handleSaveArchive}
                onDelete={handleDeleteDraft}
                currentName={currentDraftName}
              />
            )}
            <CalculatorToolbar
              currency={inputs.currency}
              onCurrencyChange={(c) => handleInputChange('currency', c)}
              onReset={handleReset}
              onOpenReport={() => setShowReportModal(true)}
              calculatorType="dev-budget"
              projectData={{ ...inputs, calculations }}
              projectName={inputs.projectName || "Development Budget"}
              showResetConfirm={showResetConfirm}
            />
            <ComparisonButtons
              calculatorType="dev-budget"
              inline
              getComparisonData={() => {
                const rating = calculations.healthScore >= 80
                  ? { grade: 'A+', label: 'Healthy' }
                  : calculations.healthScore >= 60
                  ? { grade: 'B+', label: 'At Risk' }
                  : { grade: 'C', label: 'Critical' };

                return {
                  calculatorType: 'dev-budget' as const,
                  label: inputs.projectName || 'Dev Budget',
                  currency: inputs.currency,
                  totalBudget: calculations.totalBudgeted,
                  totalActual: calculations.totalActual,
                  variance: calculations.variance,
                  variancePercent: calculations.variancePercent,
                  healthScore: calculations.healthScore,
                  contingencyUsedPercent: calculations.contingencyUsedPercent,
                  investmentRating: rating,
                } as Omit<DevBudgetComparisonData, 'timestamp'>;
              }}
            />
          </div>
        </header>

        {/* Project Health Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-zinc-400 uppercase">Project Health</p>
              <span className={`text-xs font-bold ${getHealthColor(calculations.healthScore)}`}>
                {getHealthLabel(calculations.healthScore)}
              </span>
            </div>
            <p className={`text-3xl font-bold ${getHealthColor(calculations.healthScore)}`}>
              {calculations.healthScore.toFixed(0)}%
            </p>
            <div className="mt-2 h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${
                  calculations.healthScore >= 80 ? 'bg-emerald-500' :
                  calculations.healthScore >= 60 ? 'bg-amber-500' : 'bg-red-500'
                }`}
                style={{ width: `${calculations.healthScore}%` }}
              />
            </div>
          </div>

          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-4">
            <p className="text-xs text-zinc-400 uppercase mb-2">Budget Variance</p>
            <p className={`text-3xl font-bold ${calculations.variance > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
              {calculations.variance > 0 ? '+' : ''}{calculations.variancePercent.toFixed(1)}%
            </p>
            <p className="text-xs text-zinc-500 mt-1">
              {symbol} {formatCurrency(Math.abs(calculations.variance), inputs.currency)} {calculations.variance > 0 ? 'over' : 'under'}
            </p>
          </div>

          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-4">
            <p className="text-xs text-zinc-400 uppercase mb-2">Overall Progress</p>
            <p className="text-3xl font-bold text-cyan-400">
              {calculations.overallCompletion.toFixed(0)}%
            </p>
            <p className="text-xs text-zinc-500 mt-1">
              Month {inputs.currentMonth} of {inputs.totalProjectDuration}
            </p>
          </div>

          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-4">
            <p className="text-xs text-zinc-400 uppercase mb-2">Contingency Used</p>
            <p className={`text-3xl font-bold ${calculations.contingencyUsedPercent > 75 ? 'text-red-400' : 'text-amber-400'}`}>
              {calculations.contingencyUsedPercent.toFixed(0)}%
            </p>
            <p className="text-xs text-zinc-500 mt-1">
              {symbol} {formatCurrency(calculations.contingencyRemaining, inputs.currency)} remaining
            </p>
          </div>
        </div>

        {/* Project Info */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 mb-8">
          <h2 className="text-lg font-bold text-white mb-4">Project Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-xs text-zinc-400 mb-1 block">Project Name</label>
              <input
                type="text"
                value={inputs.projectName}
                onChange={(e) => handleInputChange('projectName', e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-400 mb-1 block">Start Date</label>
              <MonthYearPicker
                value={inputs.projectStartDate}
                onChange={(value) => handleInputChange('projectStartDate', value)}
                placeholder="Select date"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-400 mb-1 block">Total Duration (months)</label>
              <input
                type="text"
                inputMode="decimal"
                value={inputs.totalProjectDuration === 0 ? '' : inputs.totalProjectDuration}
                onChange={(e) => handleInputChange('totalProjectDuration', e.target.value)}
                placeholder="0"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-400 mb-1 block">Current Month</label>
              <input
                type="text"
                inputMode="decimal"
                value={inputs.currentMonth === 0 ? '' : inputs.currentMonth}
                onChange={(e) => handleInputChange('currentMonth', e.target.value)}
                placeholder="0"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white"
              />
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-4 sm:mb-6">
          {(['budget', 'timeline', 'analysis'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 sm:px-4 py-3 min-h-[44px] rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === tab
                  ? 'bg-amber-600 text-white'
                  : 'bg-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              {tab === 'budget' && 'Budget'}
              {tab === 'timeline' && 'Timeline'}
              {tab === 'analysis' && 'Analysis'}
            </button>
          ))}
        </div>

        {/* Budget Tab */}
        {activeTab === 'budget' && (
          <div className="space-y-6">
            {/* Budget Categories */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden">
              <div className="p-4 border-b border-zinc-800">
                <h3 className="text-lg font-bold text-white">Budget vs Actual</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-zinc-800">
                    <tr>
                      <th className="text-left p-4 text-xs text-zinc-400 font-medium">Category</th>
                      <th className="text-right p-4 text-xs text-zinc-400 font-medium">Budgeted</th>
                      <th className="text-right p-4 text-xs text-zinc-400 font-medium">Actual</th>
                      <th className="text-right p-4 text-xs text-zinc-400 font-medium">Variance</th>
                      <th className="text-right p-4 text-xs text-zinc-400 font-medium">%</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    <BudgetRow
                      label="Land Acquisition"
                      budgeted={inputs.landCost}
                      actual={inputs.landActual}
                      onBudgetChange={(v) => handleInputChange('landCost', v)}
                      onActualChange={(v) => handleInputChange('landActual', v)}
                      symbol={symbol}
                      currency={inputs.currency}
                      color={categoryColors.land}
                    />
                    <BudgetRow
                      label="Construction (Hard Costs)"
                      budgeted={inputs.constructionHard}
                      actual={inputs.constructionHardActual}
                      onBudgetChange={(v) => handleInputChange('constructionHard', v)}
                      onActualChange={(v) => handleInputChange('constructionHardActual', v)}
                      symbol={symbol}
                      currency={inputs.currency}
                      color={categoryColors.construction}
                    />
                    <BudgetRow
                      label="Soft Costs (Permits, Design)"
                      budgeted={inputs.softCosts}
                      actual={inputs.softCostsActual}
                      onBudgetChange={(v) => handleInputChange('softCosts', v)}
                      onActualChange={(v) => handleInputChange('softCostsActual', v)}
                      symbol={symbol}
                      currency={inputs.currency}
                      color={categoryColors.soft}
                    />
                    <BudgetRow
                      label="Contingency Reserve"
                      budgeted={inputs.contingency}
                      actual={inputs.contingencyActual}
                      onBudgetChange={(v) => handleInputChange('contingency', v)}
                      onActualChange={(v) => handleInputChange('contingencyActual', v)}
                      symbol={symbol}
                      currency={inputs.currency}
                      color={categoryColors.contingency}
                    />
                    <BudgetRow
                      label="Financing Costs"
                      budgeted={inputs.financing}
                      actual={inputs.financingActual}
                      onBudgetChange={(v) => handleInputChange('financing', v)}
                      onActualChange={(v) => handleInputChange('financingActual', v)}
                      symbol={symbol}
                      currency={inputs.currency}
                      color={categoryColors.financing}
                    />
                    <BudgetRow
                      label="Marketing & Sales"
                      budgeted={inputs.marketing}
                      actual={inputs.marketingActual}
                      onBudgetChange={(v) => handleInputChange('marketing', v)}
                      onActualChange={(v) => handleInputChange('marketingActual', v)}
                      symbol={symbol}
                      currency={inputs.currency}
                      color={categoryColors.marketing}
                    />
                  </tbody>
                  <tfoot className="bg-zinc-800/50">
                    <tr>
                      <td className="p-4 font-bold text-white">Total</td>
                      <td className="p-4 text-right font-bold text-white">
                        {symbol} {formatCurrency(calculations.totalBudgeted, inputs.currency)}
                      </td>
                      <td className="p-4 text-right font-bold text-white">
                        {symbol} {formatCurrency(calculations.totalActual, inputs.currency)}
                      </td>
                      <td className={`p-4 text-right font-bold ${calculations.variance > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                        {calculations.variance > 0 ? '+' : ''}{symbol} {formatCurrency(calculations.variance, inputs.currency)}
                      </td>
                      <td className={`p-4 text-right font-bold ${calculations.variance > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                        {calculations.variance > 0 ? '+' : ''}{calculations.variancePercent.toFixed(1)}%
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Budget Chart */}
            <BudgetChart
              data={[
                { name: 'Land', budgeted: inputs.landCost, actual: inputs.landActual },
                { name: 'Construction', budgeted: inputs.constructionHard, actual: inputs.constructionHardActual },
                { name: 'Soft Costs', budgeted: inputs.softCosts, actual: inputs.softCostsActual },
                { name: 'Contingency', budgeted: inputs.contingency, actual: inputs.contingencyActual },
                { name: 'Financing', budgeted: inputs.financing, actual: inputs.financingActual },
                { name: 'Marketing', budgeted: inputs.marketing, actual: inputs.marketingActual },
              ]}
              symbol={symbol}
              currency={inputs.currency}
            />
          </div>
        )}

        {/* Timeline Tab */}
        {activeTab === 'timeline' && (
          <div className="space-y-6">
            <TimelineGantt
              phases={inputs.phases}
              currentMonth={inputs.currentMonth}
              totalDuration={inputs.totalProjectDuration}
              onPhaseChange={handlePhaseChange}
            />

            {/* Phase Details */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden">
              <div className="p-4 border-b border-zinc-800">
                <h3 className="text-lg font-bold text-white">Construction Phases</h3>
              </div>
              <div className="divide-y divide-zinc-800">
                {inputs.phases.map(phase => (
                  <div key={phase.id} className="p-4 flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`w-3 h-3 rounded-full ${
                          phase.status === 'completed' ? 'bg-emerald-500' :
                          phase.status === 'in-progress' ? 'bg-cyan-500' :
                          phase.status === 'delayed' ? 'bg-red-500' : 'bg-zinc-600'
                        }`} />
                        <p className="font-medium text-white">{phase.name}</p>
                      </div>
                      <p className="text-xs text-zinc-400">
                        Month {phase.startMonth} - {phase.startMonth + phase.duration - 1} • {phase.budgetPercent}% of budget
                      </p>
                    </div>
                    <div className="w-full sm:w-32">
                      <select
                        value={phase.status}
                        onChange={(e) => handlePhaseChange(phase.id, 'status', e.target.value)}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1 text-xs text-white"
                      >
                        <option value="not-started">Not Started</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="delayed">Delayed</option>
                      </select>
                    </div>
                    <div className="w-full sm:w-24">
                      <input
                        type="text"
                        inputMode="decimal"
                        value={phase.completionPercent === 0 ? '' : phase.completionPercent}
                        onChange={(e) => handlePhaseChange(phase.id, 'completionPercent', parseDecimalInput(e.target.value) || 0)}
                        placeholder="0"
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1 text-xs text-white text-center"
                      />
                      <p className="text-[10px] text-zinc-500 text-center mt-0.5">% complete</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Analysis Tab */}
        {activeTab === 'analysis' && (
          <CostOverrunAnalysis
            inputs={inputs}
            calculations={calculations}
            symbol={symbol}
            currency={inputs.currency}
          />
        )}
      </div>
    </div>
  );
}

// Budget Row Component
function BudgetRow({
  label,
  budgeted,
  actual,
  onBudgetChange,
  onActualChange,
  symbol,
  currency,
  color,
}: {
  label: string;
  budgeted: number;
  actual: number;
  onBudgetChange: (value: number) => void;
  onActualChange: (value: number) => void;
  symbol: string;
  currency: CurrencyType;
  color: { bg: string; border: string; text: string };
}) {
  const variance = actual - budgeted;
  const variancePercent = budgeted > 0 ? (variance / budgeted) * 100 : 0;

  return (
    <tr className="hover:bg-zinc-800/50">
      <td className="p-4">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${color.text.replace('text-', 'bg-')}`} />
          <span className="text-white text-sm">{label}</span>
        </div>
      </td>
      <td className="p-4">
        <input
          type="text"
          inputMode="decimal"
          value={budgeted === 0 ? '' : budgeted}
          onChange={(e) => {
            const val = e.target.value;
            if (val === '' || val === '-') {
              onBudgetChange(0);
            } else {
              const parsed = parseDecimalInput(val);
              if (!isNaN(parsed)) {
                onBudgetChange(parsed);
              }
            }
          }}
          placeholder="0"
          className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-sm text-white text-right"
        />
      </td>
      <td className="p-4">
        <input
          type="text"
          inputMode="decimal"
          value={actual === 0 ? '' : actual}
          onChange={(e) => {
            const val = e.target.value;
            if (val === '' || val === '-') {
              onActualChange(0);
            } else {
              const parsed = parseDecimalInput(val);
              if (!isNaN(parsed)) {
                onActualChange(parsed);
              }
            }
          }}
          placeholder="0"
          className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-sm text-white text-right"
        />
      </td>
      <td className={`p-4 text-right ${variance > 0 ? 'text-red-400' : variance < 0 ? 'text-emerald-400' : 'text-zinc-400'}`}>
        {variance > 0 ? '+' : ''}{symbol} {formatCurrency(variance, currency)}
      </td>
      <td className={`p-4 text-right ${variance > 0 ? 'text-red-400' : variance < 0 ? 'text-emerald-400' : 'text-zinc-400'}`}>
        {variance > 0 ? '+' : ''}{variancePercent.toFixed(1)}%
      </td>
    </tr>
  );
}

export default DevBudgetTracker;
