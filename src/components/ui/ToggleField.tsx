import { Tooltip } from './Tooltip';

export interface ToggleFieldProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  helperText?: string;
  icon?: string;
  required?: boolean;
  disabled?: boolean;
  description?: string; // Additional text below the toggle
}

export function ToggleField({
  label,
  checked,
  onChange,
  helperText,
  icon,
  required = false,
  disabled = false,
  description,
}: ToggleFieldProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <label className="flex items-center gap-3 cursor-pointer flex-1">
          <div className="relative">
            <input
              type="checkbox"
              checked={checked}
              onChange={(e) => onChange(e.target.checked)}
              disabled={disabled}
              className="sr-only"
            />
            <div
              className={`
                w-11 h-6 rounded-full transition-colors
                ${checked ? 'bg-indigo-600' : 'bg-slate-300'}
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            />
            <div
              className={`
                absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full
                transition-transform duration-200
                ${checked ? 'translate-x-5' : 'translate-x-0'}
              `}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-900">
              {icon && <span className="mr-1">{icon}</span>}
              {label}
              {required && <span className="text-red-500">*</span>}
            </span>
            {helperText && <Tooltip text={helperText} />}
          </div>
        </label>
      </div>
      
      {description && (
        <p className="text-sm text-slate-600 ml-14">{description}</p>
      )}
    </div>
  );
}
