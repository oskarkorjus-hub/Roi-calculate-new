/**
 * Parse a decimal number from user input, supporting both period (.) and comma (,)
 * as decimal separators, AND commas as thousand separators for large numbers.
 *
 * Logic:
 * - "5,5" or "5,25" → 5.5 or 5.25 (comma as decimal separator)
 * - "15,087,472,000" → 15087472000 (commas as thousand separators)
 * - "1,234.56" → 1234.56 (mixed: comma thousand sep, period decimal)
 *
 * @param value - The input string to parse
 * @returns The parsed number, or NaN if invalid
 */
export function parseDecimalInput(value: string): number {
  // Remove any whitespace
  const trimmed = value.trim();

  if (!trimmed) return NaN;

  // Count commas and periods
  const commaCount = (trimmed.match(/,/g) || []).length;
  const periodCount = (trimmed.match(/\./g) || []).length;

  let normalized = trimmed;

  // Determine if commas are thousand separators or decimal separator
  if (commaCount > 1) {
    // Multiple commas = thousand separators, remove them
    normalized = trimmed.replace(/,/g, '');
  } else if (commaCount === 1) {
    // Single comma - check if it's a decimal separator or thousand separator
    const commaIndex = trimmed.indexOf(',');
    const afterComma = trimmed.slice(commaIndex + 1).replace(/[^0-9]/g, '');

    if (periodCount > 0) {
      // Has both comma and period - comma is thousand separator
      normalized = trimmed.replace(/,/g, '');
    } else if (afterComma.length === 3 && commaIndex > 0) {
      // Pattern like "1,234" or "15,087" - comma is thousand separator
      // But also check if there's more after (like "15,087,472,000" already handled above)
      // Single comma with exactly 3 digits after = thousand separator
      normalized = trimmed.replace(/,/g, '');
    } else {
      // Comma is decimal separator (e.g., "5,5" or "5,25")
      normalized = trimmed.replace(',', '.');
    }
  }

  // Remove any remaining characters except digits and period
  const cleaned = normalized.replace(/[^0-9.]/g, '');

  return parseFloat(cleaned);
}

/**
 * Sanitize decimal input to only allow valid characters (digits, period, comma).
 * Used for controlled inputs that need to show the user's input while typing.
 *
 * @param value - The input string to sanitize
 * @returns The sanitized string with only valid decimal characters
 */
export function sanitizeDecimalInput(value: string): string {
  // Allow digits, period, and comma
  return value.replace(/[^0-9.,]/g, '');
}

/**
 * Format a number as currency with thousand separators
 * @param value - The number to format
 * @param _currency - The currency code (IDR, USD, AUD, EUR) - kept for API consistency
 * @returns Formatted number string without symbol
 */
export function formatCurrency(value: number, _currency?: string): string {
  if (!isFinite(value)) return '0';
  
  const formatter = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  
  return formatter.format(Math.abs(value));
}
