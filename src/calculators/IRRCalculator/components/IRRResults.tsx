import { formatCurrency } from '../../../utils/numberParsing';

interface IRRResult {
  irr: number;
  npv: number;
  paybackPeriod: number;
  totalCashFlow: number;
  totalInvested: number;
  mirr?: number;
  profitabilityIndex?: number;
}

interface IRRResultsProps {
  result: IRRResult;
  discountRate: number;
  alternativeDiscountRate?: number;
  npvAlt?: number;
  showAdvanced: boolean;
  reinvestmentRate: number;
}

export function IRRResults({
  result,
  discountRate,
  alternativeDiscountRate,
  npvAlt,
  showAdvanced,
  reinvestmentRate,
}: IRRResultsProps) {
  return (
    <div className="space-y-6">
      {/* Basic Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* IRR */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-sm text-gray-600 font-medium">IRR</div>
          <div className={`text-3xl font-bold ${result.irr >= 15 ? 'text-green-600' : result.irr >= 10 ? 'text-blue-600' : 'text-orange-600'}`}>
            {result.irr.toFixed(2)}%
          </div>
          <div className="text-xs text-gray-500 mt-2">Annualized return</div>
        </div>

        {/* NPV */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-sm text-gray-600 font-medium">NPV @ {discountRate}%</div>
          <div className={`text-3xl font-bold ${result.npv >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(result.npv)}
          </div>
          <div className="text-xs text-gray-500 mt-2">Present value</div>
        </div>

        {/* Payback Period */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-sm text-gray-600 font-medium">Payback</div>
          <div className="text-3xl font-bold text-purple-600">
            {result.paybackPeriod.toFixed(1)}y
          </div>
          <div className="text-xs text-gray-500 mt-2">Years to break even</div>
        </div>

        {/* Total Return */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-sm text-gray-600 font-medium">Total Return</div>
          <div className="text-3xl font-bold text-blue-600">
            {formatCurrency(result.totalCashFlow)}
          </div>
          <div className="text-xs text-gray-500 mt-2">Sum of all flows</div>
        </div>
      </div>

      {/* Advanced Results */}
      {showAdvanced && result.mirr !== undefined && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div>
            <div className="text-sm text-gray-600 font-medium mb-2">MIRR @ {reinvestmentRate}%</div>
            <div className={`text-3xl font-bold ${result.mirr >= 15 ? 'text-green-600' : result.mirr >= 10 ? 'text-blue-600' : 'text-orange-600'}`}>
              {result.mirr.toFixed(2)}%
            </div>
            <div className="text-xs text-gray-500 mt-2">Realistic return rate</div>
          </div>

          <div>
            <div className="text-sm text-gray-600 font-medium mb-2">NPV @ {alternativeDiscountRate}%</div>
            <div className={`text-3xl font-bold ${npvAlt! >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(npvAlt!)}
            </div>
            <div className="text-xs text-gray-500 mt-2">Scenario analysis</div>
          </div>

          <div>
            <div className="text-sm text-gray-600 font-medium mb-2">Profitability Index</div>
            <div className={`text-3xl font-bold ${result.profitabilityIndex! >= 1 ? 'text-green-600' : 'text-red-600'}`}>
              {result.profitabilityIndex!.toFixed(2)}x
            </div>
            <div className="text-xs text-gray-500 mt-2">Value per dollar invested</div>
          </div>
        </div>
      )}

      {/* Interpretation */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <h3 className="font-semibold text-green-900 mb-3">Investment Analysis</h3>
        <ul className="space-y-2 text-sm text-green-800">
          <li>✓ <strong>IRR of {result.irr.toFixed(1)}%</strong>: {
            result.irr >= 20 ? 'Excellent - exceptional returns' :
            result.irr >= 15 ? 'Very Good - strong returns' :
            result.irr >= 10 ? 'Good - acceptable returns' :
            result.irr >= 5 ? 'Moderate - below average' :
            'Poor - consider alternatives'
          }</li>
          <li>✓ <strong>NPV: {formatCurrency(result.npv)}</strong> at {discountRate}% discount rate</li>
          <li>✓ <strong>Payback in {result.paybackPeriod.toFixed(1)} years</strong></li>
          <li>✓ {result.npv > 0 ? 'Project adds value' : 'Project destroys value'}</li>
        </ul>
      </div>
    </div>
  );
}
