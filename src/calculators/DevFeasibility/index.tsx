import { useState, useCallback } from 'react';
import { Toast } from '../../components/ui/Toast';
import { SaveToPortfolioButton } from '../../components/SaveToPortfolioButton';
import { formatCurrency } from '../../utils/numberParsing';

interface DevInputs {
  landSizeM2: number;
  landCost: number;
  costPerM2: number;
  avgVillaSize: number;
  avgSalePrice: number;
  avgAnnualRentalIncome: number;
  holdingPeriod: number;
  numVillas: number;
  currency: 'IDR' | 'USD' | 'AUD' | 'EUR';
  showSoftCosts: boolean;
  architectureFeePercent: number;
  engineeringLegalPercent: number;
  marketingSalesCommissionPercent: number;
  pmFeePercent: number;
  showPermits: boolean;
  permitsLicenses: number;
  infrastructureCost: number;
  showFinancing: boolean;
  loanPercent: number;
  interestRate: number;
  constructionMonths: number;
  showExitCosts: boolean;
  saleSalesCommissionPercent: number;
  capitalGainsTaxPercent: number;
}

interface VillaScenario {
  numVillas: number;
  totalConstructionArea: number;
  usableArea: number;
  constructionCost: number;
  softCosts: number;
  permitsCosts: number;
  financeCharges: number;
  totalProjectCost: number;
  revenueFromSale: number;
  exitCosts: number;
  grossProfit: number;
  roiFlip: number;
  rentalIncome10Year: number;
  rentalPlusResidual: number;
  roiHold: number;
}

const INITIAL_INPUTS: DevInputs = {
  landSizeM2: 5000,
  landCost: 2500000000,
  costPerM2: 8000000,
  avgVillaSize: 250,
  avgSalePrice: 3000000000,
  avgAnnualRentalIncome: 600000000,
  holdingPeriod: 10,
  numVillas: 5,
  currency: 'IDR',
  showSoftCosts: false,
  architectureFeePercent: 3,
  engineeringLegalPercent: 2,
  marketingSalesCommissionPercent: 2,
  pmFeePercent: 2,
  showPermits: false,
  permitsLicenses: 200000000,
  infrastructureCost: 500000000,
  showFinancing: false,
  loanPercent: 70,
  interestRate: 6,
  constructionMonths: 12,
  showExitCosts: false,
  saleSalesCommissionPercent: 3,
  capitalGainsTaxPercent: 15,
};

const symbols = { IDR: 'Rp', USD: '$', AUD: 'A$', EUR: '€' };

const AdvancedSection = ({
  title,
  show,
  onToggle,
  children,
}: {
  title: string;
  show: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) => (
  <div className="border rounded-lg overflow-hidden">
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between px-4 py-3 bg-gray-100 hover:bg-gray-200 transition"
    >
      <h3 className="font-semibold text-gray-900">{title}</h3>
      <span className={`text-xl transition-transform ${show ? 'rotate-180' : ''}`}>▼</span>
    </button>
    {show && <div className="p-4 space-y-3 bg-gray-50 border-t">{children}</div>}
  </div>
);

export function DevFeasibilityCalculator() {
  const [inputs, setInputs] = useState<DevInputs>(INITIAL_INPUTS);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const calculateScenarios = useCallback((): VillaScenario[] => {
    const {
      landSizeM2,
      landCost,
      costPerM2,
      avgVillaSize,
      avgSalePrice,
      avgAnnualRentalIncome,
      holdingPeriod,
      numVillas,
      showSoftCosts,
      architectureFeePercent,
      engineeringLegalPercent,
      marketingSalesCommissionPercent,
      pmFeePercent,
      showPermits,
      permitsLicenses,
      infrastructureCost,
      showFinancing,
      loanPercent,
      interestRate,
      constructionMonths,
      showExitCosts,
      saleSalesCommissionPercent,
      capitalGainsTaxPercent,
    } = inputs;

    const scenarios: VillaScenario[] = [];
    const maxVillas = Math.floor((landSizeM2 * 0.4) / avgVillaSize);
    const showAllScenarios = numVillas === 0;
    const villasToShow = showAllScenarios ? Math.min(maxVillas, 10) : Math.min(numVillas, maxVillas);
    const startVilla = showAllScenarios ? 1 : Math.max(1, numVillas - 1);
    const endVilla = showAllScenarios ? villasToShow : Math.min(villasToShow, numVillas + 2);

    for (let villas = startVilla; villas <= endVilla; villas++) {
      const totalConstructionArea = villas * avgVillaSize;
      const usableArea = landSizeM2 * 0.4;
      const constructionCost = totalConstructionArea * costPerM2;

      const softCosts = showSoftCosts
        ? constructionCost * ((architectureFeePercent + engineeringLegalPercent + marketingSalesCommissionPercent + pmFeePercent) / 100)
        : 0;

      const permitsCosts = showPermits ? permitsLicenses + infrastructureCost : 0;

      let financeCharges = 0;
      if (showFinancing && loanPercent > 0) {
        const loanAmount = (landCost + permitsCosts + constructionCost + softCosts) * (loanPercent / 100);
        const monthlyRate = interestRate / 100 / 12;
        financeCharges = loanAmount * monthlyRate * constructionMonths;
      }

      const totalProjectCost = landCost + permitsCosts + constructionCost + softCosts + financeCharges;
      const revenueFromSale = villas * avgSalePrice;

      let exitCosts = 0;
      if (showExitCosts) {
        const salesCommission = revenueFromSale * (saleSalesCommissionPercent / 100);
        const gainOnSale = Math.max(0, revenueFromSale - totalProjectCost);
        const capitalGainsTax = gainOnSale * (capitalGainsTaxPercent / 100);
        exitCosts = salesCommission + capitalGainsTax;
      }

      const grossProfit = revenueFromSale - totalProjectCost - exitCosts;
      const roiFlip = (grossProfit / totalProjectCost) * 100;

      const rentalIncome10Year = villas * avgAnnualRentalIncome * holdingPeriod;
      const residualValue = revenueFromSale * 0.85;
      const rentalPlusResidual = rentalIncome10Year + residualValue;
      const netReturn = rentalPlusResidual - totalProjectCost;
      const roiHold = (netReturn / totalProjectCost) * 100;

      scenarios.push({
        numVillas: villas,
        totalConstructionArea,
        usableArea,
        constructionCost,
        softCosts,
        permitsCosts,
        financeCharges,
        totalProjectCost,
        revenueFromSale,
        exitCosts,
        grossProfit,
        roiFlip,
        rentalIncome10Year,
        rentalPlusResidual,
        roiHold,
      });
    }

    return scenarios;
  }, [inputs]);

  const scenarios = calculateScenarios();
  const bestFlipScenario = scenarios.reduce((best, current) => (current.roiFlip > best.roiFlip ? current : best));
  const bestHoldScenario = scenarios.reduce((best, current) => (current.roiHold > best.roiHold ? current : best));

  const handleInputChange = (field: keyof DevInputs, value: string | number | boolean) => {
    setInputs(prev => ({
      ...prev,
      [field]: typeof value === 'string' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleReset = useCallback(() => {
    if (showResetConfirm) {
      setInputs(INITIAL_INPUTS);
      setShowResetConfirm(false);
      setToast({ message: 'All values reset', type: 'success' });
    } else {
      setShowResetConfirm(true);
      setTimeout(() => setShowResetConfirm(false), 3000);
    }
  }, [showResetConfirm]);

  const handleSaveDraft = useCallback(() => {
    setToast({ message: 'Draft saved successfully!', type: 'success' });
  }, []);

  const symbol = symbols[inputs.currency];

  return (
    <div className="min-h-screen bg-background text-text-primary selection:bg-primary-light selection:text-primary -mx-4 md:-mx-10 lg:-mx-20 -my-8 px-6 py-8">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="max-w-[100%] mx-auto">
        {/* Header */}
        <header className="mb-8 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="bg-primary p-2.5 rounded-lg shadow-sm">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text-primary tracking-tight">Dev Feasibility</h1>
              <p className="text-text-muted text-xs mt-1 max-w-md">
                Analyze property development scenarios for flip and hold strategies
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <button
              onClick={handleReset}
              className={`px-5 py-2 rounded-lg text-xs font-bold shadow-sm transition-all active:scale-95 ${
                showResetConfirm
                  ? 'bg-red-600 text-white animate-pulse'
                  : 'bg-red-500 text-white hover:bg-red-600'
              }`}
            >
              {showResetConfirm ? 'Click to Confirm' : 'Reset Values'}
            </button>

            <button
              onClick={handleSaveDraft}
              className="bg-primary text-white px-5 py-2 rounded-lg text-xs font-bold shadow-sm hover:bg-primary-dark transition-all active:scale-95"
            >
              Save Draft
            </button>

            <SaveToPortfolioButton
              calculatorType="dev-feasibility"
              projectData={{
                ...inputs,
                scenarios,
              }}
              defaultProjectName="Development Feasibility"
            />
          </div>
        </header>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 h-fit sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Inputs</h2>

              <div className="space-y-4 text-sm">
                {/* BASIC SECTION */}
                <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                  <h3 className="font-semibold text-gray-900 mb-2">Land</h3>
                  <div className="space-y-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-700">Size (m²)</label>
                      <input
                        type="number"
                        value={inputs.landSizeM2}
                        onChange={e => handleInputChange('landSizeM2', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700">Cost ({inputs.currency})</label>
                      <input
                        type="number"
                        value={inputs.landCost}
                        onChange={e => handleInputChange('landCost', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                  <h3 className="font-semibold text-gray-900 mb-2">Construction</h3>
                  <div className="space-y-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-700">Cost/m² ({inputs.currency})</label>
                      <input
                        type="number"
                        value={inputs.costPerM2}
                        onChange={e => handleInputChange('costPerM2', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                  <h3 className="font-semibold text-gray-900 mb-2">Villas</h3>
                  <div className="space-y-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-700">Number</label>
                      <input
                        type="number"
                        value={inputs.numVillas}
                        onChange={e => handleInputChange('numVillas', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700">Avg Size (m²)</label>
                      <input
                        type="number"
                        value={inputs.avgVillaSize}
                        onChange={e => handleInputChange('avgVillaSize', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700">Sale Price ({inputs.currency})</label>
                      <input
                        type="number"
                        value={inputs.avgSalePrice}
                        onChange={e => handleInputChange('avgSalePrice', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700">Annual Rental ({inputs.currency})</label>
                      <input
                        type="number"
                        value={inputs.avgAnnualRentalIncome}
                        onChange={e => handleInputChange('avgAnnualRentalIncome', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Hold Period (years)</label>
                  <input
                    type="number"
                    value={inputs.holdingPeriod}
                    onChange={e => handleInputChange('holdingPeriod', e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                  />
                </div>

                {/* ADVANCED SECTIONS */}
                <div className="space-y-3 pt-4 border-t">
                  <AdvancedSection
                    title="📋 Permits & Infrastructure"
                    show={inputs.showPermits}
                    onToggle={() => handleInputChange('showPermits', !inputs.showPermits)}
                  >
                    <div>
                      <label className="block text-xs font-medium text-gray-700">Permits ({inputs.currency})</label>
                      <input
                        type="number"
                        value={inputs.permitsLicenses}
                        onChange={e => handleInputChange('permitsLicenses', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700">Infrastructure ({inputs.currency})</label>
                      <input
                        type="number"
                        value={inputs.infrastructureCost}
                        onChange={e => handleInputChange('infrastructureCost', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                      />
                    </div>
                  </AdvancedSection>

                  <AdvancedSection
                    title="💰 Soft Costs"
                    show={inputs.showSoftCosts}
                    onToggle={() => handleInputChange('showSoftCosts', !inputs.showSoftCosts)}
                  >
                    <div>
                      <label className="block text-xs font-medium text-gray-700">Architecture (%)</label>
                      <input
                        type="number"
                        step={0.1}
                        value={inputs.architectureFeePercent}
                        onChange={e => handleInputChange('architectureFeePercent', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700">Engineering/Legal (%)</label>
                      <input
                        type="number"
                        step={0.1}
                        value={inputs.engineeringLegalPercent}
                        onChange={e => handleInputChange('engineeringLegalPercent', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700">Marketing/Sales (%)</label>
                      <input
                        type="number"
                        step={0.1}
                        value={inputs.marketingSalesCommissionPercent}
                        onChange={e => handleInputChange('marketingSalesCommissionPercent', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700">Project Mgmt (%)</label>
                      <input
                        type="number"
                        step={0.1}
                        value={inputs.pmFeePercent}
                        onChange={e => handleInputChange('pmFeePercent', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                      />
                    </div>
                  </AdvancedSection>

                  <AdvancedSection
                    title="🏦 Financing"
                    show={inputs.showFinancing}
                    onToggle={() => handleInputChange('showFinancing', !inputs.showFinancing)}
                  >
                    <div>
                      <label className="block text-xs font-medium text-gray-700">Loan % of Project</label>
                      <input
                        type="number"
                        value={inputs.loanPercent}
                        onChange={e => handleInputChange('loanPercent', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700">Interest Rate (%)</label>
                      <input
                        type="number"
                        step={0.1}
                        value={inputs.interestRate}
                        onChange={e => handleInputChange('interestRate', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700">Construction Months</label>
                      <input
                        type="number"
                        value={inputs.constructionMonths}
                        onChange={e => handleInputChange('constructionMonths', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                      />
                    </div>
                  </AdvancedSection>

                  <AdvancedSection
                    title="📊 Exit Costs"
                    show={inputs.showExitCosts}
                    onToggle={() => handleInputChange('showExitCosts', !inputs.showExitCosts)}
                  >
                    <div>
                      <label className="block text-xs font-medium text-gray-700">Sales Commission (%)</label>
                      <input
                        type="number"
                        step={0.1}
                        value={inputs.saleSalesCommissionPercent}
                        onChange={e => handleInputChange('saleSalesCommissionPercent', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700">Capital Gains Tax (%)</label>
                      <input
                        type="number"
                        step={0.1}
                        value={inputs.capitalGainsTaxPercent}
                        onChange={e => handleInputChange('capitalGainsTaxPercent', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                      />
                    </div>
                  </AdvancedSection>
                </div>
              </div>
            </div>
          </div>

          {/* Results Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-indigo-50 rounded-lg shadow-sm p-4 border border-indigo-200">
                <p className="text-xs text-gray-600 mb-1">Best Flip ROI</p>
                <p className="text-3xl font-bold text-indigo-600 mb-2">{bestFlipScenario.roiFlip.toFixed(1)}%</p>
                <p className="text-xs text-gray-600">{bestFlipScenario.numVillas} villas</p>
                <p className="text-xs font-medium text-gray-700 mt-1">
                  Profit: {symbol} {formatCurrency(bestFlipScenario.grossProfit, inputs.currency)}
                </p>
              </div>

              <div className="bg-emerald-50 rounded-lg shadow-sm p-4 border border-emerald-200">
                <p className="text-xs text-gray-600 mb-1">Best Hold ROI ({inputs.holdingPeriod}yr)</p>
                <p className="text-3xl font-bold text-emerald-600 mb-2">{bestHoldScenario.roiHold.toFixed(1)}%</p>
                <p className="text-xs text-gray-600">{bestHoldScenario.numVillas} villas</p>
                <p className="text-xs font-medium text-gray-700 mt-1">
                  Return: {symbol} {formatCurrency(bestHoldScenario.rentalPlusResidual - bestHoldScenario.totalProjectCost, inputs.currency)}
                </p>
              </div>
            </div>

            {/* Detailed Scenarios Table */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Development Scenarios</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-gray-100 border-b border-gray-300">
                    <tr>
                      <th className="px-3 py-2 text-left font-semibold">Villas</th>
                      <th className="px-3 py-2 text-right font-semibold">Build Cost</th>
                      <th className="px-3 py-2 text-right font-semibold">Soft Costs</th>
                      <th className="px-3 py-2 text-right font-semibold">Permits</th>
                      <th className="px-3 py-2 text-right font-semibold">Finance</th>
                      <th className="px-3 py-2 text-right font-semibold">Total Cost</th>
                      <th className="px-3 py-2 text-right font-semibold">Sale Revenue</th>
                      <th className="px-3 py-2 text-right font-semibold">Exit Cost</th>
                      <th className="px-3 py-2 text-right font-semibold">Flip Profit</th>
                      <th className="px-3 py-2 text-right font-semibold">Flip ROI</th>
                      <th className="px-3 py-2 text-right font-semibold">Hold ROI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scenarios.map(scenario => (
                      <tr
                        key={scenario.numVillas}
                        className={`border-b border-gray-200 hover:bg-gray-50 ${
                          scenario.numVillas === bestFlipScenario.numVillas || scenario.numVillas === bestHoldScenario.numVillas
                            ? 'bg-yellow-50'
                            : ''
                        }`}
                      >
                        <td className="px-3 py-2 font-medium text-gray-900">{scenario.numVillas}</td>
                        <td className="px-3 py-2 text-right text-gray-700">
                          {symbol} {formatCurrency(scenario.constructionCost, inputs.currency)}
                        </td>
                        <td className="px-3 py-2 text-right text-gray-700">
                          {symbol} {formatCurrency(scenario.softCosts, inputs.currency)}
                        </td>
                        <td className="px-3 py-2 text-right text-gray-700">
                          {symbol} {formatCurrency(scenario.permitsCosts, inputs.currency)}
                        </td>
                        <td className="px-3 py-2 text-right text-gray-700">
                          {symbol} {formatCurrency(scenario.financeCharges, inputs.currency)}
                        </td>
                        <td className="px-3 py-2 text-right font-medium text-gray-900">
                          {symbol} {formatCurrency(scenario.totalProjectCost, inputs.currency)}
                        </td>
                        <td className="px-3 py-2 text-right text-green-600">
                          {symbol} {formatCurrency(scenario.revenueFromSale, inputs.currency)}
                        </td>
                        <td className="px-3 py-2 text-right text-red-600">
                          {symbol} {formatCurrency(scenario.exitCosts, inputs.currency)}
                        </td>
                        <td className="px-3 py-2 text-right font-medium text-gray-900">
                          {symbol} {formatCurrency(scenario.grossProfit, inputs.currency)}
                        </td>
                        <td className="px-3 py-2 text-right font-bold text-indigo-600">
                          {scenario.roiFlip.toFixed(1)}%
                        </td>
                        <td className="px-3 py-2 text-right font-bold text-emerald-600">
                          {scenario.roiHold.toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DevFeasibilityCalculator;
