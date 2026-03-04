
import { Assumptions, CurrencyConfig, CurrencyCode } from './types';

export const INITIAL_ASSUMPTIONS: Assumptions = {
  initialInvestment: 2375000000, 
  baseYear: 2026,
  keys: 1,
  
  y1Occupancy: 70,
  y1ADR: 1600000,
  y1FB: 12000000,
  y1Spa: 0,
  y1OODs: 0,
  y1Misc: 0,

  occupancyIncreases: [4, 3, 2, 1.5, 1.5, 1, 1, 1, 1],
  adrGrowth: 4,
  fbGrowth: 3,
  spaGrowth: 0,
  camGrowth: 2,
  baseFeeGrowth: 3,
  techFeeGrowth: 3,

  roomsCostPct: 20,
  fbCostPct: 85,
  spaCostPct: 0,
  otherCostPct: 0,
  miscCostPct: 0,
  utilitiesPct: 7,

  adminPct: 1,
  salesPct: 5,
  maintPct: 3,

  y1CAM: 15000000,       // 1.25M * 12
  y1BaseFee: 12000000,   // 1M * 12
  y1TechFee: 12000000,   // 1M * 12
  incentiveFeePct: 0
};

export const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  IDR: { code: 'IDR', symbol: 'Rp', locale: 'id-ID', rate: 1 },
  USD: { code: 'USD', symbol: '$', locale: 'en-US', rate: 16000 },
  EUR: { code: 'EUR', symbol: '€', locale: 'de-DE', rate: 17500 },
  AUD: { code: 'AUD', symbol: 'A$', locale: 'en-AU', rate: 10500 },
  INR: { code: 'INR', symbol: '₹', locale: 'en-IN', rate: 190 },
  CNY: { code: 'CNY', symbol: '¥', locale: 'zh-CN', rate: 2200 },
  AED: { code: 'AED', symbol: 'د.إ', locale: 'ar-AE', rate: 4350 },
  GBP: { code: 'GBP', symbol: '£', locale: 'en-GB', rate: 20500 },
  RUB: { code: 'RUB', symbol: '₽', locale: 'ru-RU', rate: 175 },
};

export const formatCurrency = (val: number, currency: CurrencyConfig) => {
  // Convert IDR value to target currency
  const converted = val / currency.rate;
  
  return new Intl.NumberFormat(currency.locale, {
    style: 'currency',
    currency: currency.code,
    maximumFractionDigits: converted > 1000 ? 0 : 2,
  }).format(converted);
};

export const FORMAT_PCT = new Intl.NumberFormat('en-US', {
  style: 'percent',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
