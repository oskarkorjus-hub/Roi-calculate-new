import { formatCurrency } from '../../../utils/numberParsing';

interface MortgageResult {
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
  principal: number;
  originationFeeAmount: number;
  monthlyPropertyTax: number;
  monthlyInsurance: number;
  monthlyPMI: number;
  monthlyHOA: number;
  totalMonthlyPayment: number;
  totalMonthlyPaymentWithTax: number;
  totalCostOfBorrowing: number;
  amortizationSchedule: any[];
}

interface MortgageResultsProps {
  result: MortgageResult;
  currency: string;
  symbol: string;
  loanTerm: number;
  showAdvanced: boolean;
  pmiRequired: boolean;
  hoaFeesMonthly: number;
}

export function MortgageResults({
  result,
  currency,
  symbol,
  loanTerm,
  showAdvanced,
  pmiRequired,
  hoaFeesMonthly,
}: MortgageResultsProps) {
  return (
    <div className="space-y-4">
      {/* Basic Results */}
      <div className="bg-white rounded-lg p-4 border-l-4 border-indigo-500">
        <p className="text-sm text-gray-600">Monthly Payment (Principal + Interest)</p>
        <p className="text-3xl font-bold text-indigo-600">
          {symbol} {formatCurrency(result.monthlyPayment, currency)}
        </p>
      </div>

      {/* Total Payment */}
      <div className="bg-white rounded-lg p-4 border-l-4 border-green-500">
        <p className="text-sm text-gray-600">Total Payment (Over {loanTerm} Years)</p>
        <p className="text-2xl font-bold text-green-600">
          {symbol} {formatCurrency(result.totalPayment, currency)}
        </p>
      </div>

      {/* Total Interest */}
      <div className="bg-white rounded-lg p-4 border-l-4 border-red-500">
        <p className="text-sm text-gray-600">Total Interest Paid</p>
        <p className="text-2xl font-bold text-red-600">
          {symbol} {formatCurrency(result.totalInterest, currency)}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {((result.totalInterest / result.totalPayment) * 100).toFixed(1)}% of total payments
        </p>
      </div>

      {/* Principal */}
      <div className="bg-white rounded-lg p-4 border-l-4 border-blue-500">
        <p className="text-sm text-gray-600">Principal Borrowed</p>
        <p className="text-2xl font-bold text-blue-600">
          {symbol} {formatCurrency(result.principal, currency)}
        </p>
      </div>

      {/* Advanced Results */}
      {showAdvanced && (
        <>
          <div className="border-t pt-4 mt-4">
            <h4 className="font-semibold text-gray-900 mb-3">Advanced Breakdown</h4>
          </div>

          <div className="bg-white rounded-lg p-4 border-l-4 border-purple-500">
            <p className="text-sm text-gray-600">Total Monthly Payment (All Costs)</p>
            <p className="text-2xl font-bold text-purple-600">
              {symbol} {formatCurrency(result.totalMonthlyPayment, currency)}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              = Principal/Interest + Property Tax + Insurance {pmiRequired && '+ PMI'} {hoaFeesMonthly > 0 && '+ HOA'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <p className="text-gray-600">Monthly Property Tax</p>
              <p className="font-bold text-gray-900">{symbol} {formatCurrency(result.monthlyPropertyTax, currency)}</p>
            </div>
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <p className="text-gray-600">Monthly Insurance</p>
              <p className="font-bold text-gray-900">{symbol} {formatCurrency(result.monthlyInsurance, currency)}</p>
            </div>
            {pmiRequired && (
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <p className="text-gray-600">Monthly PMI</p>
                <p className="font-bold text-gray-900">{symbol} {formatCurrency(result.monthlyPMI, currency)}</p>
              </div>
            )}
            {hoaFeesMonthly > 0 && (
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <p className="text-gray-600">Monthly HOA</p>
                <p className="font-bold text-gray-900">{symbol} {formatCurrency(result.monthlyHOA, currency)}</p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg p-4 border-l-4 border-orange-500">
            <p className="text-sm text-gray-600">Origination Fee</p>
            <p className="text-xl font-bold text-orange-600">
              {symbol} {formatCurrency(result.originationFeeAmount, currency)}
            </p>
          </div>

          <div className="bg-white rounded-lg p-4 border-l-4 border-red-600">
            <p className="text-sm text-gray-600">Total Cost of Borrowing</p>
            <p className="text-2xl font-bold text-red-600">
              {symbol} {formatCurrency(result.totalCostOfBorrowing, currency)}
            </p>
            <p className="text-xs text-gray-500 mt-1">Interest + all fees & costs over loan term</p>
          </div>
        </>
      )}
    </div>
  );
}
