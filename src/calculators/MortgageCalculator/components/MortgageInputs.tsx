import { AdvancedSection } from '../../../components/AdvancedSection';
import { InputField } from '../../../components/ui/InputField';
import { SelectField } from '../../../components/ui/SelectField';
import { ToggleField } from '../../../components/ui/ToggleField';
import { SectionHeader } from '../../../components/ui/SectionHeader';
import { getFieldHelper } from '../../../utils/fieldHelpers';

interface MortgageInputs {
  loanAmount: number;
  interestRate: number;
  loanTerm: number;
  currency: 'IDR' | 'USD' | 'AUD' | 'EUR';
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
  const currencyOptions = [
    { label: 'IDR (Indonesian Rupiah)', value: 'IDR' },
    { label: 'USD (US Dollar)', value: 'USD' },
    { label: 'AUD (Australian Dollar)', value: 'AUD' },
    { label: 'EUR (Euro)', value: 'EUR' },
  ];

  return (
    <div className="space-y-6">
      {/* BASIC SECTION */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
        <SectionHeader
          title="Loan Details"
          icon="🏦"
          description="Enter your mortgage information"
        />
        
        <div className="space-y-4 mt-6">
          <InputField
            label="Loan Amount"
            value={inputs.loanAmount}
            onChange={(v) => onInputChange('loanAmount', parseFloat(v as string) || 0)}
            type="number"
            unit={symbol}
            placeholder="500,000,000"
            helperText={getFieldHelper('loanAmount')}
            icon="💰"
            required
          />

          <InputField
            label="Annual Interest Rate"
            value={inputs.interestRate}
            onChange={(v) => onInputChange('interestRate', parseFloat(v as string) || 0)}
            type="number"
            step={0.1}
            unit="%"
            placeholder="6.5"
            helperText={getFieldHelper('interestRate')}
            icon="📊"
            required
          />

          <InputField
            label="Loan Term"
            value={inputs.loanTerm}
            onChange={(v) => onInputChange('loanTerm', parseFloat(v as string) || 0)}
            type="number"
            unit="years"
            placeholder="20"
            helperText={getFieldHelper('loanTerm')}
            icon="⏱️"
            required
          />

          <SelectField
            label="Currency"
            value={inputs.currency}
            onChange={(v) => onInputChange('currency', v as 'IDR' | 'USD' | 'AUD' | 'EUR')}
            options={currencyOptions}
            helperText={getFieldHelper('currency')}
            icon="💵"
            required
          />
        </div>
      </div>

      {/* ADVANCED SECTION */}
      <AdvancedSection
        title="Advanced Options"
        icon="⚙️"
        isOpen={inputs.showAdvanced}
        onToggle={() => onInputChange('showAdvanced', !inputs.showAdvanced)}
        description="Fees, taxes, insurance, PMI, HOA"
      >
        <div className="space-y-4">
          <InputField
            label="Origination Fee"
            value={inputs.originationFeePercent}
            onChange={(v) => onInputChange('originationFeePercent', parseFloat(v as string) || 0)}
            type="number"
            step={0.1}
            unit="%"
            placeholder="1"
            helperText={getFieldHelper('originationFeePercent')}
            icon="📋"
          />

          <InputField
            label="Property Tax Rate"
            value={inputs.propertyTaxRate}
            onChange={(v) => onInputChange('propertyTaxRate', parseFloat(v as string) || 0)}
            type="number"
            step={0.1}
            unit="%"
            placeholder="1.2"
            helperText={getFieldHelper('propertyTaxRate')}
            icon="🏛️"
          />

          <InputField
            label="Home Insurance (Annual)"
            value={inputs.homeInsuranceAnnual}
            onChange={(v) => onInputChange('homeInsuranceAnnual', parseFloat(v as string) || 0)}
            type="number"
            unit={symbol}
            placeholder="50000000"
            helperText={getFieldHelper('homeInsuranceAnnual')}
            icon="🛡️"
          />

          <ToggleField
            label="PMI Required"
            checked={inputs.pmiRequired}
            onChange={(v) => onInputChange('pmiRequired', v)}
            helperText={getFieldHelper('pmiRequired')}
            icon="✓"
            description="Private Mortgage Insurance when down payment < 20%"
          />

          {inputs.pmiRequired && (
            <InputField
              label="PMI Rate"
              value={inputs.pmiRate}
              onChange={(v) => onInputChange('pmiRate', parseFloat(v as string) || 0)}
              type="number"
              step={0.1}
              unit="%"
              placeholder="0.5"
              helperText={getFieldHelper('pmiRate')}
              icon="📌"
            />
          )}

          <InputField
            label="HOA Fees (Monthly)"
            value={inputs.hoaFeesMonthly}
            onChange={(v) => onInputChange('hoaFeesMonthly', parseFloat(v as string) || 0)}
            type="number"
            unit={symbol}
            placeholder="0"
            helperText={getFieldHelper('hoaFeesMonthly')}
            icon="🏘️"
          />
        </div>
      </AdvancedSection>
    </div>
  );
}
