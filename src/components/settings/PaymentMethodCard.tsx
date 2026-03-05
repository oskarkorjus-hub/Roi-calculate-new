import type { PaymentMethod } from '../../types/billing';
import { getCardBrandInfo } from '../../lib/billing-service';

interface PaymentMethodCardProps {
  paymentMethod: PaymentMethod;
  onSetDefault?: () => void;
  onRemove?: () => void;
}

export function PaymentMethodCard({
  paymentMethod,
  onSetDefault,
  onRemove,
}: PaymentMethodCardProps) {
  const brandInfo = getCardBrandInfo(paymentMethod.brand);

  return (
    <div className={`bg-zinc-800/50 border rounded-xl p-4 ${
      paymentMethod.isDefault ? 'border-emerald-500/50' : 'border-zinc-700'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          {/* Card Icon */}
          <div className="w-12 h-8 bg-zinc-700 rounded-md flex items-center justify-center">
            <CardBrandIcon brand={paymentMethod.brand} />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className={`font-medium ${brandInfo.color}`}>
                {brandInfo.name}
              </span>
              <span className="text-white">•••• {paymentMethod.last4}</span>
              {paymentMethod.isDefault && (
                <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded">
                  Default
                </span>
              )}
            </div>
            <p className="text-sm text-zinc-500 mt-1">
              Expires {String(paymentMethod.expiryMonth).padStart(2, '0')}/{paymentMethod.expiryYear}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!paymentMethod.isDefault && onSetDefault && (
            <button
              onClick={onSetDefault}
              className="text-sm text-zinc-400 hover:text-white transition-colors"
            >
              Set Default
            </button>
          )}
          {onRemove && (
            <button
              onClick={onRemove}
              className="text-sm text-red-400 hover:text-red-300 transition-colors"
            >
              Remove
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function CardBrandIcon({ brand }: { brand: string }) {
  switch (brand) {
    case 'visa':
      return (
        <svg className="w-8 h-5" viewBox="0 0 32 20" fill="none">
          <rect width="32" height="20" rx="2" fill="#1A1F71" />
          <path
            d="M13.5 14L15 6H17L15.5 14H13.5ZM11.5 6L9.5 11.5L9.2 10L8.5 6.5C8.5 6.5 8.3 6 7.5 6H4.5L4.4 6.2C4.4 6.2 5.3 6.4 6.3 7L8 14H10.5L13.5 6H11.5ZM25 14L25.5 12H22.5L22 14H19.5L23 6H25.5L27.5 14H25ZM23 10H25L24 7L23 10ZM19 9.5C19 8.5 18 8 17 8C16 8 14.5 8.5 14.5 9.5C14.5 11 17.5 11 17.5 12C17.5 12.5 17 13 16 13C15 13 14 12.5 14 12.5L13.5 14C13.5 14 14.5 14.5 16 14.5C17.5 14.5 19.5 13.5 19.5 12C19.5 10.5 16.5 10.5 16.5 9.5C16.5 9 17 8.5 17.5 8.5C18 8.5 18.5 8.7 18.5 8.7L19 9.5Z"
            fill="white"
          />
        </svg>
      );
    case 'mastercard':
      return (
        <svg className="w-8 h-5" viewBox="0 0 32 20" fill="none">
          <rect width="32" height="20" rx="2" fill="#252525" />
          <circle cx="12" cy="10" r="6" fill="#EB001B" />
          <circle cx="20" cy="10" r="6" fill="#F79E1B" />
          <path
            d="M16 5.5C17.5 6.8 18.5 8.3 18.5 10C18.5 11.7 17.5 13.2 16 14.5C14.5 13.2 13.5 11.7 13.5 10C13.5 8.3 14.5 6.8 16 5.5Z"
            fill="#FF5F00"
          />
        </svg>
      );
    case 'amex':
      return (
        <svg className="w-8 h-5" viewBox="0 0 32 20" fill="none">
          <rect width="32" height="20" rx="2" fill="#006FCF" />
          <text x="4" y="13" fill="white" fontSize="6" fontWeight="bold">
            AMEX
          </text>
        </svg>
      );
    default:
      return (
        <svg className="w-6 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      );
  }
}
