/**
 * Security Utilities
 * Comprehensive security functions for input validation, sanitization, and protection
 */

// ============================================================================
// INPUT SANITIZATION
// ============================================================================

/**
 * Sanitize user input to prevent XSS attacks
 * Escapes HTML special characters
 */
export function sanitizeHtml(input: string): string {
  const htmlEntities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;',
  };

  return input.replace(/[&<>"'`=/]/g, (char) => htmlEntities[char] || char);
}

/**
 * Remove all HTML tags from input
 */
export function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, '');
}

/**
 * Sanitize input for safe database storage
 * Removes null bytes and normalizes whitespace
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/\0/g, '') // Remove null bytes
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove control characters
    .trim();
}

// ============================================================================
// ID VALIDATION (SQL Injection Prevention)
// ============================================================================

// Dangerous characters that should never appear in IDs
const DANGEROUS_ID_CHARS = /['"\\;`()<>{}[\]|&$!*?\s%@#^~]/;
const PATH_TRAVERSAL = /\.\.|\.\/|\/\./;

/**
 * Valid ID formats:
 * - CUID v1: starts with 'c', 25 chars, lowercase alphanumeric
 * - CUID v2: 24-32 chars, lowercase alphanumeric
 * - UUID v4: 36 chars with dashes
 * - Safe alphanumeric: 1-50 chars, alphanumeric with underscores/dashes
 */
const VALID_ID_PATTERNS = [
  /^c[a-z0-9]{24}$/, // CUID v1
  /^[a-z0-9]{24,32}$/, // CUID v2
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i, // UUID v4
  /^[a-zA-Z0-9_-]{1,50}$/, // Safe alphanumeric
];

export interface IdValidationResult {
  valid: boolean;
  error?: string;
  sanitizedId?: string;
}

/**
 * Validate and sanitize an ID parameter
 * Prevents SQL injection and path traversal attacks
 */
export function validateId(id: unknown, fieldName = 'ID'): IdValidationResult {
  // Type check
  if (typeof id !== 'string') {
    return { valid: false, error: `${fieldName} must be a string` };
  }

  // Empty check
  if (!id || id.trim().length === 0) {
    return { valid: false, error: `${fieldName} is required` };
  }

  const trimmedId = id.trim();

  // Length check
  if (trimmedId.length > 50) {
    return { valid: false, error: `${fieldName} is too long` };
  }

  // Dangerous characters check
  if (DANGEROUS_ID_CHARS.test(trimmedId)) {
    return { valid: false, error: `${fieldName} contains invalid characters` };
  }

  // Path traversal check
  if (PATH_TRAVERSAL.test(trimmedId)) {
    return { valid: false, error: `${fieldName} contains invalid pattern` };
  }

  // Format validation
  const isValidFormat = VALID_ID_PATTERNS.some((pattern) => pattern.test(trimmedId));
  if (!isValidFormat) {
    return { valid: false, error: `${fieldName} has invalid format` };
  }

  return { valid: true, sanitizedId: trimmedId };
}

// ============================================================================
// PASSWORD STRENGTH
// ============================================================================

export interface PasswordStrengthResult {
  score: number; // 0-5
  level: 'very-weak' | 'weak' | 'fair' | 'strong' | 'very-strong';
  feedback: string[];
  isValid: boolean;
}

export interface PasswordRequirements {
  minLength?: number;
  requireUppercase?: boolean;
  requireLowercase?: boolean;
  requireNumbers?: boolean;
  requireSpecialChars?: boolean;
}

const DEFAULT_PASSWORD_REQUIREMENTS: PasswordRequirements = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: false, // Optional but adds to score
};

/**
 * Check password strength and provide feedback
 */
export function checkPasswordStrength(
  password: string,
  requirements: PasswordRequirements = DEFAULT_PASSWORD_REQUIREMENTS
): PasswordStrengthResult {
  const feedback: string[] = [];
  let score = 0;

  const minLength = requirements.minLength ?? 8;

  // Length check
  if (password.length < minLength) {
    feedback.push(`Must be at least ${minLength} characters`);
  } else {
    score++;
    if (password.length >= 12) score++;
    if (password.length >= 16) score++;
  }

  // Uppercase check
  const hasUppercase = /[A-Z]/.test(password);
  if (requirements.requireUppercase && !hasUppercase) {
    feedback.push('Add uppercase letters');
  } else if (hasUppercase) {
    score++;
  }

  // Lowercase check
  const hasLowercase = /[a-z]/.test(password);
  if (requirements.requireLowercase && !hasLowercase) {
    feedback.push('Add lowercase letters');
  } else if (hasLowercase) {
    score++;
  }

  // Numbers check
  const hasNumbers = /[0-9]/.test(password);
  if (requirements.requireNumbers && !hasNumbers) {
    feedback.push('Add numbers');
  } else if (hasNumbers) {
    score++;
  }

  // Special characters check
  const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);
  if (requirements.requireSpecialChars && !hasSpecial) {
    feedback.push('Add special characters (!@#$%^&*...)');
  } else if (hasSpecial) {
    score++;
  }

  // Common patterns check (reduces score)
  const commonPatterns = [
    /^123456/,
    /^password/i,
    /^qwerty/i,
    /^admin/i,
    /^letmein/i,
    /^welcome/i,
    /(.)\1{2,}/, // Repeated characters (aaa, 111, etc.)
    /^[a-z]+$/i, // Only letters
    /^[0-9]+$/, // Only numbers
  ];

  for (const pattern of commonPatterns) {
    if (pattern.test(password)) {
      score = Math.max(0, score - 1);
      feedback.push('Avoid common patterns');
      break;
    }
  }

  // Normalize score to 0-5
  score = Math.min(5, Math.max(0, score));

  // Determine level
  const levels: PasswordStrengthResult['level'][] = [
    'very-weak',
    'weak',
    'fair',
    'fair',
    'strong',
    'very-strong',
  ];

  const isValid =
    password.length >= minLength &&
    (!requirements.requireUppercase || hasUppercase) &&
    (!requirements.requireLowercase || hasLowercase) &&
    (!requirements.requireNumbers || hasNumbers) &&
    (!requirements.requireSpecialChars || hasSpecial);

  return {
    score,
    level: levels[score],
    feedback: feedback.length > 0 ? feedback : ['Password is strong'],
    isValid,
  };
}

// ============================================================================
// EMAIL VALIDATION
// ============================================================================

/**
 * Comprehensive email validation
 * More strict than basic regex
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;

  // Basic format check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return false;

  // Length check
  if (email.length > 254) return false;

  // Local part check (before @)
  const [localPart, domain] = email.split('@');
  if (localPart.length > 64) return false;
  if (domain.length > 253) return false;

  // No consecutive dots
  if (/\.\./.test(email)) return false;

  // No leading/trailing dots in local part
  if (localPart.startsWith('.') || localPart.endsWith('.')) return false;

  return true;
}

// ============================================================================
// SECURE RANDOM
// ============================================================================

/**
 * Generate a cryptographically secure random string
 */
export function generateSecureToken(length = 32): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Generate a secure random password
 */
export function generateSecurePassword(length = 16): string {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const special = '!@#$%^&*';
  const allChars = lowercase + uppercase + numbers + special;

  const array = new Uint8Array(length);
  crypto.getRandomValues(array);

  // Ensure at least one of each type
  let password = '';
  password += lowercase[array[0] % lowercase.length];
  password += uppercase[array[1] % uppercase.length];
  password += numbers[array[2] % numbers.length];
  password += special[array[3] % special.length];

  // Fill the rest randomly
  for (let i = 4; i < length; i++) {
    password += allChars[array[i] % allChars.length];
  }

  // Shuffle the password
  return password
    .split('')
    .sort(() => Math.random() - 0.5)
    .join('');
}

// ============================================================================
// SESSION SECURITY
// ============================================================================

/**
 * Get client fingerprint for session binding
 * Helps detect session hijacking
 */
export function getClientFingerprint(): string {
  const components = [
    navigator.userAgent,
    navigator.language,
    new Date().getTimezoneOffset().toString(),
    screen.width + 'x' + screen.height,
    screen.colorDepth.toString(),
  ];

  return components.join('|');
}

/**
 * Hash a string using SHA-256
 */
export async function hashString(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

// ============================================================================
// TIMING ATTACK PREVENTION
// ============================================================================

/**
 * Constant-time string comparison
 * Prevents timing attacks on sensitive comparisons
 */
export function secureCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    // Still do the comparison to maintain constant time
    b = a;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0 && a.length === b.length;
}

// ============================================================================
// CONTENT SECURITY
// ============================================================================

/**
 * Check if a URL is safe (same-origin or allowed domains)
 */
export function isSafeUrl(url: string, allowedDomains: string[] = []): boolean {
  try {
    const parsed = new URL(url, window.location.origin);

    // Allow same-origin
    if (parsed.origin === window.location.origin) {
      return true;
    }

    // Check allowed domains
    return allowedDomains.some((domain) => parsed.hostname === domain || parsed.hostname.endsWith('.' + domain));
  } catch {
    return false;
  }
}

/**
 * Sanitize a URL to prevent javascript: and data: attacks
 */
export function sanitizeUrl(url: string): string {
  if (!url) return '';

  const trimmed = url.trim().toLowerCase();

  // Block dangerous protocols
  if (
    trimmed.startsWith('javascript:') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('vbscript:')
  ) {
    return '';
  }

  return url;
}
