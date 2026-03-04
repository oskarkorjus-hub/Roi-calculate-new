import { Tooltip } from './Tooltip';

export interface InputFieldProps {
  label: string;
  value: string | number;
  onChange: (value: string | number) => void;
  type?: 'text' | 'number' | 'email' | 'tel';
  unit?: string; // "$", "%", "years", "m²", etc.
  placeholder?: string;
  helperText?: string; // Tooltip text explaining field
  icon?: string; // emoji or icon
  required?: boolean;
  error?: string;
  disabled?: boolean;
  step?: number;
  min?: number;
  max?: number;
  inputMode?: 'decimal' | 'numeric' | 'text';
}

export function InputField({
  label,
  value,
  onChange,
  type = 'number',
  unit,
  placeholder,
  helperText,
  icon,
  required = false,
  error,
  disabled = false,
  step,
  min,
  max,
  inputMode,
}: InputFieldProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <label className="block text-sm font-semibold text-slate-900">
          {icon && <span className="mr-1">{icon}</span>}
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>
        {helperText && <Tooltip text={helperText} />}
      </div>
      
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          step={step}
          min={min}
          max={max}
          inputMode={inputMode}
          className={`
            w-full px-4 py-3 rounded-xl border-2 transition-all font-medium
            text-slate-900 placeholder-slate-400
            ${
              error
                ? 'border-red-500 focus:border-red-600 focus:ring-4 focus:ring-red-500/10'
                : 'border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10'
            }
            ${disabled ? 'bg-slate-50 text-slate-500 cursor-not-allowed' : 'bg-white'}
            outline-none
          `}
        />
        {unit && !disabled && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400 pointer-events-none">
            {unit}
          </span>
        )}
        {unit && disabled && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-300 pointer-events-none">
            {unit}
          </span>
        )}
      </div>
      
      {error && (
        <p className="text-sm text-red-600 font-medium">{error}</p>
      )}
    </div>
  );
}
