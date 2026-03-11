import { useState, useEffect } from 'react';
import { Tooltip } from '../../../components/ui/Tooltip';
import { parseDecimalInput } from '../../../utils/numberParsing';
import type { BRRRRInputState } from '../index';

interface BRRRRInputsProps {
  inputs: BRRRRInputState;
  onInputChange: (field: keyof BRRRRInputState, value: number | string) => void;
  symbol: string;
}

export function BRRRRInputs({ inputs, onInputChange, symbol }: BRRRRInputsProps) {
  return (
    <div className="space-y-6">
      {/* Purchase & Rehab Section */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
        <div className="mb-6 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-amber-400"></div>
          <h3 className="text-base font-semibold text-zinc-300">Purchase & Rehab</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <InputField
            label="Purchase Price"
            value={inputs.purchasePrice}
            onChange={(v) => onInputChange('purchasePrice', v)}
            prefix={symbol}
            tooltip="Original purchase price of the property"
          />

          <InputField
            label="Rehab Costs"
            value={inputs.rehabCost}
            onChange={(v) => onInputChange('rehabCost', v)}
            prefix={symbol}
            tooltip="Total renovation and repair costs"
          />

          <InputField
            label="Holding Costs"
            value={inputs.holdingCosts}
            onChange={(v) => onInputChange('holdingCosts', v)}
            prefix={symbol}
            tooltip="Costs during rehab (utilities, taxes, insurance, interest)"
          />
        </div>
      </div>

      {/* After Repair Value Section */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
        <div className="mb-6 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
          <h3 className="text-base font-semibold text-zinc-300">After Repair Value</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-1 gap-6 max-w-md">
          <InputField
            label="ARV (After Repair Value)"
            value={inputs.afterRepairValue}
            onChange={(v) => onInputChange('afterRepairValue', v)}
            prefix={symbol}
            tooltip="Estimated market value after all repairs are completed"
          />
        </div>
      </div>

      {/* Refinance Terms Section */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
        <div className="mb-6 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-400"></div>
          <h3 className="text-base font-semibold text-zinc-300">Refinance Terms</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <InputField
            label="Loan-to-Value (LTV)"
            value={inputs.refinanceLTV}
            onChange={(v) => onInputChange('refinanceLTV', v)}
            suffix="%"
            tooltip="Percentage of ARV the lender will loan (typically 70-80%)"
          />

          <InputField
            label="Interest Rate"
            value={inputs.refinanceRate}
            onChange={(v) => onInputChange('refinanceRate', v)}
            suffix="%"
            tooltip="Annual interest rate on the refinance loan"
          />

          <InputField
            label="Loan Term"
            value={inputs.loanTerm}
            onChange={(v) => onInputChange('loanTerm', v)}
            suffix="years"
            tooltip="Length of the refinance loan"
          />
        </div>
      </div>

      {/* Rental Income Section */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
        <div className="mb-6 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
          <h3 className="text-base font-semibold text-zinc-300">Rental Income</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField
            label="Monthly Rent"
            value={inputs.monthlyRent}
            onChange={(v) => onInputChange('monthlyRent', v)}
            prefix={symbol}
            tooltip="Expected monthly rental income"
          />

          <InputField
            label="Operating Expenses"
            value={inputs.operatingExpensesPct}
            onChange={(v) => onInputChange('operatingExpensesPct', v)}
            suffix="%"
            tooltip="Percentage of rent for expenses (vacancy, repairs, management, taxes, insurance)"
          />
        </div>
      </div>
    </div>
  );
}

interface InputFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  prefix?: string;
  suffix?: string;
  tooltip?: string;
}

function InputField({ label, value, onChange, prefix, suffix, tooltip }: InputFieldProps) {
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
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[13px] font-bold text-zinc-500">{prefix}</span>
        )}
        <input
          type="text"
          inputMode="decimal"
          value={localValue}
          onChange={handleChange}
          placeholder="0"
          className={`w-full bg-zinc-800 border border-zinc-700 rounded-lg py-2.5 text-sm font-medium text-white placeholder:text-zinc-500 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all tabular-nums ${prefix ? 'pl-10 pr-4' : suffix ? 'pl-4 pr-14' : 'px-4'}`}
        />
        {suffix && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[13px] font-bold text-zinc-500">{suffix}</span>
        )}
      </div>
    </div>
  );
}
