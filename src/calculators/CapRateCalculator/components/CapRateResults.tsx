import { formatCurrency } from '../../../utils/numberParsing';

interface CapRateResult {
  capRate: number;
  monthlyNOI: number;
  yearlyNOI: number;
  pricePerNOI: number;
  grossAnnualIncome: number;
  vacancyLoss: number;
  effectiveGrossIncome: number;
  annualExpenses: number;
  adjustedAnnualNOI: number;
  adjustedCapRate: number;
  adjustedMonthlyNOI: number;
}

interface CapRateResultsProps {
  result: CapRateResult;
  showAdvanced: boolean;
}

export function CapRateResults({ result, showAdvanced }: CapRateResultsProps) {
  return (
    <div className="space-y-4">
      {/* Basic Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Cap Rate */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-sm text-gray-600 font-medium">Cap Rate</div>
          <div className={`text-3xl font-bold ${result.capRate >= 5 ? 'text-green-600' : 'text-orange-600'}`}>
            {result.capRate.toFixed(2)}%
          </div>
          <div className="text-xs text-gray-500 mt-2">
            {result.capRate >= 8 && 'Excellent yield'}
            {result.capRate >= 5 && result.capRate < 8 && 'Good yield'}
            {result.capRate >= 3 && result.capRate < 5 && 'Moderate yield'}
            {result.capRate < 3 && 'Low yield'}
          </div>
        </div>

        {/* Monthly NOI */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-sm text-gray-600 font-medium">Monthly NOI</div>
          <div className="text-3xl font-bold text-blue-600">
            {formatCurrency(result.monthlyNOI)}
          </div>
          <div className="text-xs text-gray-500 mt-2">Recurring monthly income</div>
        </div>

        {/* Yearly NOI */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-sm text-gray-600 font-medium">Yearly NOI</div>
          <div className="text-3xl font-bold text-green-600">
            {formatCurrency(result.yearlyNOI)}
          </div>
          <div className="text-xs text-gray-500 mt-2">Annual net income</div>
        </div>

        {/* Price per NOI */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-sm text-gray-600 font-medium">Price / NOI Ratio</div>
          <div className="text-3xl font-bold text-purple-600">
            {result.pricePerNOI.toFixed(1)}x
          </div>
          <div className="text-xs text-gray-500 mt-2">Lower is better (5-10x typical)</div>
        </div>
      </div>

      {/* Advanced Results */}
      {showAdvanced && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Adjusted Results (with Expenses)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="text-xs text-gray-600 font-medium">Gross Annual Income</div>
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(result.grossAnnualIncome)}
              </div>
            </div>

            <div className="bg-white rounded-lg border border-red-200 p-4">
              <div className="text-xs text-gray-600 font-medium">Vacancy Loss</div>
              <div className="text-2xl font-bold text-red-600">
                -{formatCurrency(result.vacancyLoss)}
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="text-xs text-gray-600 font-medium">Effective Gross Income</div>
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(result.effectiveGrossIncome)}
              </div>
            </div>

            <div className="bg-white rounded-lg border border-red-200 p-4">
              <div className="text-xs text-gray-600 font-medium">Annual Expenses</div>
              <div className="text-2xl font-bold text-red-600">
                -{formatCurrency(result.annualExpenses)}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Taxes + Insurance + Utilities + Maintenance
              </div>
            </div>

            <div className="bg-white rounded-lg border border-green-200 p-4">
              <div className="text-xs text-gray-600 font-medium">Adjusted Annual NOI</div>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(result.adjustedAnnualNOI)}
              </div>
            </div>

            <div className={`bg-white rounded-lg border p-4 ${result.adjustedCapRate >= 5 ? 'border-green-200' : 'border-orange-200'}`}>
              <div className="text-xs text-gray-600 font-medium">Adjusted Cap Rate</div>
              <div className={`text-2xl font-bold ${result.adjustedCapRate >= 5 ? 'text-green-600' : 'text-orange-600'}`}>
                {result.adjustedCapRate.toFixed(2)}%
              </div>
            </div>

            <div className="bg-white rounded-lg border border-blue-200 p-4">
              <div className="text-xs text-gray-600 font-medium">Adjusted Monthly NOI</div>
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(result.adjustedMonthlyNOI)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
