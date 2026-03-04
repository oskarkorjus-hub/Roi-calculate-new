import { AdvancedSection } from '../../../components/AdvancedSection';
import { InputField } from '../../../components/ui/InputField';
import { SelectField } from '../../../components/ui/SelectField';
import { SectionHeader } from '../../../components/ui/SectionHeader';
import { getFieldHelper } from '../../../utils/fieldHelpers';

interface CapRateInputs {
  propertyValue: number;
  annualNOI: number;
  currency: 'IDR' | 'USD' | 'AUD' | 'EUR';
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
}

const currencyOptions = [
  { label: 'USD (US Dollar)', value: 'USD' },
  { label: 'IDR (Indonesian Rupiah)', value: 'IDR' },
  { label: 'AUD (Australian Dollar)', value: 'AUD' },
  { label: 'EUR (Euro)', value: 'EUR' },
];

const currencySymbols = { IDR: 'Rp', USD: '$', AUD: 'A$', EUR: '€' };

export function PropertyInputs({ inputs, onInputChange }: PropertyInputsProps) {
  const symbol = currencySymbols[inputs.currency];

  return (
    <div className="space-y-6">
      {/* BASIC SECTION */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
        <SectionHeader
          title="Property Information"
          icon="🏢"
          description="Enter property value and annual NOI"
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <InputField
            label="Property Value"
            value={inputs.propertyValue}
            onChange={(v) => onInputChange('propertyValue', parseFloat(v as string) || 0)}
            type="number"
            unit={symbol}
            placeholder="1000000000"
            helperText={getFieldHelper('propertyValue')}
            icon="🏠"
            required
          />

          <InputField
            label="Annual NOI"
            value={inputs.annualNOI}
            onChange={(v) => onInputChange('annualNOI', parseFloat(v as string) || 0)}
            type="number"
            unit={symbol}
            placeholder="100000000"
            helperText={getFieldHelper('annualNOI')}
            icon="📈"
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
        title="Advanced Expense Analysis"
        icon="📊"
        isOpen={inputs.showAdvanced}
        onToggle={() => onInputChange('showAdvanced', !inputs.showAdvanced)}
        description="Vacancy, reserves, and detailed expenses"
      >
        <div className="space-y-4">
          <InputField
            label="Vacancy Rate"
            value={inputs.vacancyRatePercent}
            onChange={(v) => onInputChange('vacancyRatePercent', parseFloat(v as string) || 0)}
            type="number"
            step={0.1}
            unit="%"
            placeholder="5"
            helperText={getFieldHelper('vacancyRate')}
            icon="📉"
          />

          <InputField
            label="Maintenance Reserve"
            value={inputs.maintenanceReservePercent}
            onChange={(v) => onInputChange('maintenanceReservePercent', parseFloat(v as string) || 0)}
            type="number"
            step={0.1}
            unit="%"
            placeholder="10"
            helperText={getFieldHelper('maintenanceReserve')}
            icon="🔧"
          />

          <InputField
            label="Annual Property Taxes"
            value={inputs.annualPropertyTaxes}
            onChange={(v) => onInputChange('annualPropertyTaxes', parseInt(v as string) || 0)}
            type="number"
            unit={symbol}
            placeholder="0"
            helperText="Annual property tax costs"
            icon="🏛️"
          />

          <InputField
            label="Annual Insurance"
            value={inputs.annualInsurance}
            onChange={(v) => onInputChange('annualInsurance', parseInt(v as string) || 0)}
            type="number"
            unit={symbol}
            placeholder="0"
            helperText="Annual insurance cost for property protection"
            icon="🛡️"
          />

          <InputField
            label="Annual Utilities"
            value={inputs.annualUtilities}
            onChange={(v) => onInputChange('annualUtilities', parseInt(v as string) || 0)}
            type="number"
            unit={symbol}
            placeholder="0"
            helperText="Expected annual utilities costs (electricity, water, gas)"
            icon="⚡"
          />
        </div>
      </AdvancedSection>
    </div>
  );
}
