import { Tooltip } from './Tooltip';

export interface SelectOption {
  label: string;
  value: string | number;
}

export interface SelectFieldProps {
  label: string;
  value: string | number;
  onChange: (value: string | number) => void;
  options: SelectOption[];
  placeholder?: string;
  helperText?: string;
  icon?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
}

export function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder,
  helperText,
  icon,
  required = false,
  error,
  disabled = false,
}: SelectFieldProps) {
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

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`
          w-full px-4 py-3 rounded-lg border transition-all font-medium
          text-white
          ${
            error
              ? 'border-red-500 focus:border-red-400 focus:ring-2 focus:ring-red-500/20'
              : 'border-zinc-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
          }
          ${disabled ? 'bg-zinc-800/50 text-zinc-500 cursor-not-allowed' : 'bg-zinc-800'}
          outline-none appearance-none cursor-pointer
        `}
        style={{
          backgroundImage: !disabled
            ? 'url("data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2220%22 height=%2220%22 viewBox=%220 0 20 20%22 fill=%22none%22 stroke=%22%2371717a%22 stroke-width=%222%22%3E%3Cpath d=%22M6 8l4 4 4-4%22/%3E%3C/svg%3E")'
            : 'url("data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2220%22 height=%2220%22 viewBox=%220 0 20 20%22 fill=%22none%22 stroke=%22%2352525b%22 stroke-width=%222%22%3E%3Cpath d=%22M6 8l4 4 4-4%22/%3E%3C/svg%3E")',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 12px center',
          backgroundSize: '20px',
          paddingRight: '40px',
        }}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value} className="bg-zinc-800 text-white">
            {option.label}
          </option>
        ))}
      </select>

      {error && (
        <p className="text-sm text-red-400 font-medium">{error}</p>
      )}
    </div>
  );
}
