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
        <label className="block text-sm font-medium text-zinc-300">
          {icon && <span className="mr-1">{icon}</span>}
          {label}
          {required && <span className="text-red-400">*</span>}
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
            w-full px-4 py-3 min-h-[44px] rounded-lg border transition-all font-medium
            text-base sm:text-sm text-white placeholder-zinc-500
            ${
              error
                ? 'border-red-500 focus:border-red-400 focus:ring-2 focus:ring-red-500/20'
                : 'border-zinc-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
            }
            ${disabled ? 'bg-zinc-800/50 text-zinc-500 cursor-not-allowed' : 'bg-zinc-800'}
            outline-none
          `}
        />
        {unit && (
          <span className={`absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium pointer-events-none ${disabled ? 'text-zinc-600' : 'text-zinc-400'}`}>
            {unit}
          </span>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-400 font-medium">{error}</p>
      )}
    </div>
  );
}
