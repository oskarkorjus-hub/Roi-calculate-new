import { useState, useEffect } from 'react';
import { AdvancedSection } from '../../../components/AdvancedSection';
import { Tooltip } from '../../../components/ui/Tooltip';
import { parseDecimalInput } from '../../../utils/numberParsing';

interface MortgageInputs {
  loanAmount: number;
  interestRate: number;
  loanTerm: number;
  showAdvanced: boolean;
  originationFeePercent: number;
  propertyTaxRate: number;
  homeInsuranceAnnual: number;
  pmiRequired: boolean;
  pmiRate: number;
  hoaFeesMonthly: number;
}

interface MortgageInputsProps {
  inputs: MortgageInputs;
  onInputChange: (field: keyof MortgageInputs, value: string | number | boolean) => void;
  symbol: string;
}

export function MortgageInputs({ inputs, onInputChange, symbol }: MortgageInputsProps) {
  return (
    <div className="space-y-6">
      {/* BASIC SECTION */}
      <div>
        <div className="mb-6 flex items-center border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-400">account_balance</span>
            <h2 className="text-xl font-bold text-white">Loan Details</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <InputField
            label="Loan Amount"
            value={inputs.loanAmount}
            onChange={(v) => onInputChange('loanAmount', v)}
            prefix={symbol}
            tooltip="Total amount being borrowed"
          />

          <InputField
            label="Annual Interest Rate"
            value={inputs.interestRate}
            onChange={(v) => onInputChange('interestRate', v)}
            suffix="%"
            tooltip="Annual interest rate for the loan"
          />

          <InputField
            label="Loan Term"
            value={inputs.loanTerm}
            onChange={(v) => onInputChange('loanTerm', v)}
            suffix="years"
            tooltip="Duration of the mortgage in years"
          />
        </div>
      </div>

      {/* ADVANCED SECTION */}
      <AdvancedSection
        title="Advanced Options"
                isOpen={inputs.showAdvanced}
        onToggle={() => onInputChange('showAdvanced', !inputs.showAdvanced)}
        description="Fees, taxes, insurance, PMI, HOA"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
          <InputField
            label="Origination Fee"
            value={inputs.originationFeePercent}
            onChange={(v) => onInputChange('originationFeePercent', v)}
            suffix="%"
            tooltip="Loan origination fee charged by lender"
          />

          <InputField
            label="Property Tax Rate"
            value={inputs.propertyTaxRate}
            onChange={(v) => onInputChange('propertyTaxRate', v)}
            suffix="%"
            tooltip="Annual property tax as percentage of loan"
          />

          <InputField
            label="Home Insurance (Annual)"
            value={inputs.homeInsuranceAnnual}
            onChange={(v) => onInputChange('homeInsuranceAnnual', v)}
            prefix={symbol}
            tooltip="Annual home insurance premium"
          />

          <div className="space-y-3">
            <label className="flex items-center gap-1.5 text-sm font-medium text-zinc-400">
              PMI Required
              <Tooltip text="Private Mortgage Insurance when down payment < 20%" />
            </label>
            <button
              type="button"
              onClick={() => onInputChange('pmiRequired', !inputs.pmiRequired)}
              className={`w-full rounded-2xl px-6 py-4 text-[16px] font-bold transition-all border ${
                inputs.pmiRequired
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                  : 'bg-zinc-800 border-zinc-700 text-zinc-400'
              }`}
            >
              {inputs.pmiRequired ? 'Yes - PMI Required' : 'No - PMI Not Required'}
            </button>
          </div>

          {inputs.pmiRequired && (
            <InputField
              label="PMI Rate"
              value={inputs.pmiRate}
              onChange={(v) => onInputChange('pmiRate', v)}
              suffix="%"
              tooltip="Private Mortgage Insurance rate"
            />
          )}

          <InputField
            label="HOA Fees (Monthly)"
            value={inputs.hoaFeesMonthly}
            onChange={(v) => onInputChange('hoaFeesMonthly', v)}
            prefix={symbol}
            tooltip="Monthly Homeowners Association fees"
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

  useEffect(() => {
    const currentParsed = parseDecimalInput(localValue);
    if (value !== currentParsed && !isNaN(value)) {
      setLocalValue(value === 0 ? '' : String(value));
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
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
          className={`w-full bg-zinc-800 border border-zinc-700 rounded-lg py-2.5 text-sm font-medium text-white placeholder:text-zinc-500 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all tabular-nums ${prefix ? 'pl-10 pr-4' : suffix ? 'pl-4 pr-12' : 'px-4'}`}
        />
        {suffix && (
          <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[13px] font-bold text-zinc-500">{suffix}</span>
        )}
      </div>
    </div>
  );
}
