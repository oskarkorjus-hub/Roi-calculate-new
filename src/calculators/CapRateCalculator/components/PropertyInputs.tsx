import { useState, useEffect } from 'react';
import { AdvancedSection } from '../../../components/AdvancedSection';
import { Tooltip } from '../../../components/ui/Tooltip';
import { parseDecimalInput } from '../../../utils/numberParsing';

interface CapRateInputs {
  propertyValue: number;
  annualNOI: number;
  showAdvanced: boolean;
  vacancyRatePercent: number;
  maintenanceReservePercent: number;
  annualPropertyTaxes: number;
  annualInsurance: number;
  annualUtilities: number;
}

interface PropertyInputsProps {
  inputs: CapRateInputs;
  onInputChange: (field: keyof CapRateInputs, value: string | number | boolean) => void;
  symbol: string;
}

export function PropertyInputs({ inputs, onInputChange, symbol }: PropertyInputsProps) {

  return (
    <div className="space-y-6">
      {/* BASIC SECTION */}
      <div>
        <div className="mb-6 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
          <h3 className="text-base font-semibold text-zinc-300">Property Information</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField
            label="Property Value"
            value={inputs.propertyValue}
            onChange={(v) => onInputChange('propertyValue', v)}
            prefix={symbol}
            tooltip="Total purchase price or current market value of the property"
          />

          <InputField
            label="Annual NOI"
            value={inputs.annualNOI}
            onChange={(v) => onInputChange('annualNOI', v)}
            prefix={symbol}
            tooltip="Net Operating Income - Gross income minus operating expenses"
          />
        </div>
      </div>

      {/* ADVANCED SECTION */}
      <AdvancedSection
        title="Advanced Expense Analysis"
                isOpen={inputs.showAdvanced}
        onToggle={() => onInputChange('showAdvanced', !inputs.showAdvanced)}
        description="Vacancy, reserves, and detailed expenses"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
          <InputField
            label="Vacancy Rate"
            value={inputs.vacancyRatePercent}
            onChange={(v) => onInputChange('vacancyRatePercent', v)}
            suffix="%"
            tooltip="Expected percentage of time property is vacant"
          />

          <InputField
            label="Maintenance Reserve"
            value={inputs.maintenanceReservePercent}
            onChange={(v) => onInputChange('maintenanceReservePercent', v)}
            suffix="%"
            tooltip="Percentage of income set aside for maintenance"
          />

          <InputField
            label="Annual Property Taxes"
            value={inputs.annualPropertyTaxes}
            onChange={(v) => onInputChange('annualPropertyTaxes', v)}
            prefix={symbol}
            tooltip="Annual property tax costs"
          />

          <InputField
            label="Annual Insurance"
            value={inputs.annualInsurance}
            onChange={(v) => onInputChange('annualInsurance', v)}
            prefix={symbol}
            tooltip="Annual insurance cost for property protection"
          />

          <InputField
            label="Annual Utilities"
            value={inputs.annualUtilities}
            onChange={(v) => onInputChange('annualUtilities', v)}
            prefix={symbol}
            tooltip="Expected annual utilities costs"
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
          className={`w-full bg-zinc-800 border border-zinc-700 rounded-2xl py-4 text-[16px] font-bold text-white placeholder:text-zinc-500 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all tabular-nums ${prefix ? 'pl-12 pr-6' : suffix ? 'pl-6 pr-12' : 'px-6'}`}
        />
        {suffix && (
          <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[13px] font-bold text-zinc-500">{suffix}</span>
        )}
      </div>
    </div>
  );
}
