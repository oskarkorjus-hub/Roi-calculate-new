import { AdvancedSection } from '../../../components/AdvancedSection';
import { InputField } from '../../../components/ui/InputField';
import { SelectField } from '../../../components/ui/SelectField';
import { SectionHeader } from '../../../components/ui/SectionHeader';
import { getFieldHelper } from '../../../utils/fieldHelpers';

interface CashFlowInputs {
  monthlyRentalIncome: number;
  monthlyMaintenance: number;
  monthlyPropertyTax: number;
  monthlyInsurance: number;
  monthlyUtilities: number;
  monthlyOtherExpenses: number;
  vacancyRate: number;
  projectionYears: number;
  currency: 'IDR' | 'USD' | 'AUD' | 'EUR';
  showAdvanced: boolean;
  annualGrowthRate: number;
  expenseGrowthRate: number;
  fixedExpensePercent: number;
  variableExpensePercent: number;
  seasonalMultiplier: number;
}

interface CashFlowInputsProps {
  inputs: CashFlowInputs;
  onInputChange: (field: keyof CashFlowInputs, value: string | number | boolean) => void;
  symbol: string;
}

const currencyOptions = [
  { label: 'IDR (Indonesian Rupiah)', value: 'IDR' },
  { label: 'USD (US Dollar)', value: 'USD' },
  { label: 'AUD (Australian Dollar)', value: 'AUD' },
  { label: 'EUR (Euro)', value: 'EUR' },
];

export function CashFlowInputs({ inputs, onInputChange, symbol }: CashFlowInputsProps) {
  const monthlyExpenses =
    inputs.monthlyMaintenance + inputs.monthlyPropertyTax + inputs.monthlyInsurance + 
    inputs.monthlyUtilities + inputs.monthlyOtherExpenses;
  const monthlyNetCashFlow = inputs.monthlyRentalIncome * (1 - inputs.vacancyRate / 100) - monthlyExpenses;

  return (
    <div className="space-y-6">
      {/* BASIC SECTION */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
        <SectionHeader
          title="Cash Flow Projection"
          icon="💵"
          description="Enter rental income and monthly expenses"
        />
        
        <div className="space-y-4 mt-6">
          <InputField
            label="Monthly Rental Income"
            value={inputs.monthlyRentalIncome}
            onChange={v => onInputChange('monthlyRentalIncome', parseFloat(v as string) || 0)}
            type="number"
            unit={symbol}
            placeholder="5000000"
            helperText={getFieldHelper('monthlyRentalIncome')}
            icon="🏠"
            required
          />

          <InputField
            label="Vacancy Rate"
            value={inputs.vacancyRate}
            onChange={v => onInputChange('vacancyRate', parseFloat(v as string) || 0)}
            type="number"
            step={0.5}
            unit="%"
            placeholder="5"
            helperText={getFieldHelper('vacancyRate')}
            icon="📉"
            required
          />

          {/* Monthly Expenses */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <p className="text-sm font-semibold text-slate-900 mb-4">Monthly Expenses</p>
            <div className="space-y-3">
              <InputField
                label="Maintenance"
                value={inputs.monthlyMaintenance}
                onChange={v => onInputChange('monthlyMaintenance', parseFloat(v as string) || 0)}
                type="number"
                unit={symbol}
                placeholder="0"
                icon="🔧"
              />
              <InputField
                label="Property Tax"
                value={inputs.monthlyPropertyTax}
                onChange={v => onInputChange('monthlyPropertyTax', parseFloat(v as string) || 0)}
                type="number"
                unit={symbol}
                placeholder="0"
                icon="🏛️"
              />
              <InputField
                label="Insurance"
                value={inputs.monthlyInsurance}
                onChange={v => onInputChange('monthlyInsurance', parseFloat(v as string) || 0)}
                type="number"
                unit={symbol}
                placeholder="0"
                icon="🛡️"
              />
              <InputField
                label="Utilities"
                value={inputs.monthlyUtilities}
                onChange={v => onInputChange('monthlyUtilities', parseFloat(v as string) || 0)}
                type="number"
                unit={symbol}
                placeholder="0"
                icon="⚡"
              />
              <InputField
                label="Other Expenses"
                value={inputs.monthlyOtherExpenses}
                onChange={v => onInputChange('monthlyOtherExpenses', parseFloat(v as string) || 0)}
                type="number"
                unit={symbol}
                placeholder="0"
                icon="💸"
              />
              <div className="border-t border-slate-200 pt-3 mt-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-slate-900">Total Monthly Expenses</span>
                  <span className="text-lg font-bold text-slate-900">{symbol} {monthlyExpenses.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          <InputField
            label="Projection Years"
            value={inputs.projectionYears}
            onChange={v => onInputChange('projectionYears', Math.max(1, parseInt(v as string) || 1))}
            type="number"
            placeholder="10"
            helperText={getFieldHelper('projectionYears')}
            icon="📊"
            required
          />

          <SelectField
            label="Currency"
            value={inputs.currency}
            onChange={v => onInputChange('currency', v as 'IDR' | 'USD' | 'AUD' | 'EUR')}
            options={currencyOptions}
            helperText={getFieldHelper('currency')}
            icon="💵"
            required
          />

          {/* Monthly Net Cash Flow */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <p className="text-sm text-slate-600">Estimated Monthly Net Cash Flow</p>
            <p className="text-2xl font-bold text-green-600 mt-1">
              {symbol} {monthlyNetCashFlow.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* ADVANCED SECTION */}
      <AdvancedSection
        title="Advanced Growth & Seasonality"
        icon="📈"
        isOpen={inputs.showAdvanced}
        onToggle={() => onInputChange('showAdvanced', !inputs.showAdvanced)}
        description="Annual growth, expense growth, seasonal multipliers"
      >
        <div className="space-y-4">
          <InputField
            label="Annual Income Growth Rate"
            value={inputs.annualGrowthRate}
            onChange={v => onInputChange('annualGrowthRate', parseFloat(v as string) || 0)}
            type="number"
            step={0.1}
            unit="%"
            placeholder="3"
            helperText={getFieldHelper('growthRate')}
            icon="📈"
          />

          <InputField
            label="Annual Expense Growth Rate"
            value={inputs.expenseGrowthRate}
            onChange={v => onInputChange('expenseGrowthRate', parseFloat(v as string) || 0)}
            type="number"
            step={0.1}
            unit="%"
            placeholder="2"
            helperText="Expected annual increase in operating expenses"
            icon="📉"
          />

          <InputField
            label="Fixed Expense Percentage"
            value={inputs.fixedExpensePercent}
            onChange={v => onInputChange('fixedExpensePercent', parseFloat(v as string) || 0)}
            type="number"
            unit="%"
            placeholder="40"
            helperText="Expenses that don't change with income"
            icon="🔐"
          />

          <InputField
            label="Seasonal Multiplier"
            value={inputs.seasonalMultiplier}
            onChange={v => onInputChange('seasonalMultiplier', parseFloat(v as string) || 0)}
            type="number"
            step={0.1}
            placeholder="1.0"
            helperText="1.0 = baseline, <1.0 dip, >1.0 peak"
            icon="🔄"
          />
        </div>
      </AdvancedSection>
    </div>
  );
}
