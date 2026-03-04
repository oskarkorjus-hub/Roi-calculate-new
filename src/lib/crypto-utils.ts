/**
 * Crypto Utilities — Password strength checking
 */

// ============================================================================
// Password Strength Checking
// ============================================================================

export interface PasswordStrength {
  score: number; // 0-7
  level: 'weak' | 'fair' | 'good' | 'strong';
  feedback: string[];
}

/**
 * Check password strength and provide feedback
 */
export function checkPasswordStrength(password: string): PasswordStrength {
  const feedback: string[] = [];
  let score = 0;

  // Length checks
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (password.length >= 16) score += 1;
  if (password.length < 8) feedback.push('Use at least 8 characters');

  // Character type checks
  if (/[a-z]/.test(password)) score += 1;
  else feedback.push('Add lowercase letters');

  if (/[A-Z]/.test(password)) score += 1;
  else feedback.push('Add uppercase letters');

  if (/[0-9]/.test(password)) score += 1;
  else feedback.push('Add numbers');

  if (/[^a-zA-Z0-9]/.test(password)) score += 1;
  else feedback.push('Add special characters');

  // Penalty for common patterns
  if (/(.)\1{2,}/.test(password)) {
    score -= 1;
    feedback.push('Avoid repeated characters');
  }

  if (/^[a-zA-Z]+$/.test(password)) {
    score -= 1;
  }

  if (/^[0-9]+$/.test(password)) {
    score -= 2;
    feedback.push('Don\'t use only numbers');
  }

  const finalScore = Math.max(0, Math.min(7, score));

  let level: PasswordStrength['level'];
  if (finalScore <= 2) level = 'weak';
  else if (finalScore <= 4) level = 'fair';
  else if (finalScore <= 5) level = 'good';
  else level = 'strong';

  return { score: finalScore, level, feedback };
}
