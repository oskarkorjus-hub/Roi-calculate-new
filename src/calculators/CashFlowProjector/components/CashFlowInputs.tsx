import { useState, useEffect } from 'react';
import { AdvancedSection } from '../../../components/AdvancedSection';
import { Tooltip } from '../../../components/ui/Tooltip';
import { parseDecimalInput } from '../../../utils/numberParsing';

interface CashFlowInputs {
  monthlyRentalIncome: number;
  monthlyMaintenance: number;
  monthlyPropertyTax: number;
  monthlyInsurance: number;
  monthlyUtilities: number;
  monthlyOtherExpenses: number;
  vacancyRate: number;
  projectionYears: number;
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

export function CashFlowInputs({ inputs, onInputChange, symbol }: CashFlowInputsProps) {
  const monthlyExpenses =
    inputs.monthlyMaintenance + inputs.monthlyPropertyTax + inputs.monthlyInsurance +
    inputs.monthlyUtilities + inputs.monthlyOtherExpenses;
  const monthlyNetCashFlow = inputs.monthlyRentalIncome * (1 - inputs.vacancyRate / 100) - monthlyExpenses;

  return (
    <div className="space-y-6">
      {/* BASIC SECTION */}
      <div>
        <div className="mb-6 flex items-center border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-400">payments</span>
            <h2 className="text-xl font-bold text-white">Cash Flow Projection</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <InputField
            label="Monthly Rental Income"
            value={inputs.monthlyRentalIncome}
            onChange={v => onInputChange('monthlyRentalIncome', v)}
            prefix={symbol}
            tooltip="Expected monthly income from rental property"
          />

          <InputField
            label="Vacancy Rate"
            value={inputs.vacancyRate}
            onChange={v => onInputChange('vacancyRate', v)}
            suffix="%"
            tooltip="Percentage of time property is expected to be vacant"
          />

          <InputField
            label="Projection Years"
            value={inputs.projectionYears}
            onChange={v => onInputChange('projectionYears', Math.max(1, v))}
            tooltip="Number of years to project cash flow"
          />
        </div>

        {/* Monthly Expenses */}
        <div className="mt-6 rounded-xl border border-zinc-700 bg-zinc-800/50 p-6">
          <div className="mb-4 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-400"></div>
            <h3 className="text-base font-semibold text-zinc-300">Monthly Expenses</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <InputField
              label="Maintenance"
              value={inputs.monthlyMaintenance}
              onChange={v => onInputChange('monthlyMaintenance', v)}
              prefix={symbol}
              tooltip="Monthly maintenance and repairs"
            />
            <InputField
              label="Property Tax"
              value={inputs.monthlyPropertyTax}
              onChange={v => onInputChange('monthlyPropertyTax', v)}
              prefix={symbol}
              tooltip="Monthly property tax"
            />
            <InputField
              label="Insurance"
              value={inputs.monthlyInsurance}
              onChange={v => onInputChange('monthlyInsurance', v)}
              prefix={symbol}
              tooltip="Monthly insurance premium"
            />
            <InputField
              label="Utilities"
              value={inputs.monthlyUtilities}
              onChange={v => onInputChange('monthlyUtilities', v)}
              prefix={symbol}
              tooltip="Monthly utilities if paid by owner"
            />
            <InputField
              label="Other Expenses"
              value={inputs.monthlyOtherExpenses}
              onChange={v => onInputChange('monthlyOtherExpenses', v)}
              prefix={symbol}
              tooltip="Other monthly expenses"
            />
          </div>
          <div className="border-t border-zinc-700 pt-4 mt-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-zinc-300">Total Monthly Expenses</span>
              <span className="text-lg font-bold text-red-400">{symbol} {monthlyExpenses.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Monthly Net Cash Flow */}
        <div className="mt-6 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">Estimated Monthly Net Cash Flow</p>
              <p className="text-2xl font-bold text-emerald-400 mt-1">
                {symbol} {monthlyNetCashFlow.toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-emerald-400 text-2xl">trending_up</span>
            </div>
          </div>
        </div>
      </div>

      {/* ADVANCED SECTION */}
      <AdvancedSection
        title="Advanced Growth & Seasonality"
                isOpen={inputs.showAdvanced}
        onToggle={() => onInputChange('showAdvanced', !inputs.showAdvanced)}
        description="Annual growth, expense growth, seasonal multipliers"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          <InputField
            label="Annual Income Growth Rate"
            value={inputs.annualGrowthRate}
            onChange={v => onInputChange('annualGrowthRate', v)}
            suffix="%"
            tooltip="Expected annual increase in rental income"
          />

          <InputField
            label="Annual Expense Growth Rate"
            value={inputs.expenseGrowthRate}
            onChange={v => onInputChange('expenseGrowthRate', v)}
            suffix="%"
            tooltip="Expected annual increase in operating expenses"
          />

          <InputField
            label="Fixed Expense Percentage"
            value={inputs.fixedExpensePercent}
            onChange={v => onInputChange('fixedExpensePercent', v)}
            suffix="%"
            tooltip="Expenses that don't change with income"
          />

          <InputField
            label="Seasonal Multiplier"
            value={inputs.seasonalMultiplier}
            onChange={v => onInputChange('seasonalMultiplier', v)}
            tooltip="1.0 = baseline, <1.0 dip, >1.0 peak"
          />
        </div>
      </AdvancedSection>
    </div>
  );
}

function InputField({ label, value, onChange, prefix, suffix, tooltip }: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  prefix?: string;
  suffix?: string;
  tooltip?: string;
}) {
  const [localValue, setLocalValue] = useState(value === 0 ? '' : String(value));

  // Sync from parent only when value changes externally
  useEffect(() => {
    const currentParsed = parseDecimalInput(localValue);
    if (value !== currentParsed && !isNaN(value)) {
      setLocalValue(value === 0 ? '' : String(value));
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // Allow empty, numbers, decimal points, commas, and minus
    if (val === '' || /^-?[0-9]*[.,]?[0-9]*$/.test(val)) {
      setLocalValue(val);
      if (val === '' || val === '-') {
        onChange(0);
      } else {
        const parsed = parseDecimalInput(val);
        if (!isNaN(parsed)) {
          onChange(parsed);
        }
      }
    }
  };

  return (
    <div className="space-y-3">
      <label className="flex items-center gap-1.5 text-sm font-medium text-zinc-400">
        {label}
        {tooltip && <Tooltip text={tooltip} />}
      </label>
      <div className="relative">
        {prefix && (
          <span className="absolute left-5 top-1/2 -translate-y-1/2 text-[13px] font-bold text-zinc-500">{prefix}</span>
        )}
        <input
          type="text"
          inputMode="decimal"
          value={localValue}
          onChange={handleChange}
          placeholder="0"
          className={`w-full bg-zinc-800 border border-zinc-700 rounded-2xl py-4 text-[16px] font-bold text-white placeholder:text-zinc-500 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all tabular-nums ${prefix ? 'pl-12 pr-6' : suffix ? 'pl-6 pr-12' : 'px-6'}`}
        />
        {suffix && (
          <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[13px] font-bold text-zinc-500">{suffix}</span>
        )}
      </div>
    </div>
  );
}
