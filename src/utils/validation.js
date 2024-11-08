// src/utils/validation.js

/**
 * Validates email format
 * @param {string} email - Email to validate
 * @returns {boolean} Whether the email is valid
 */
export function validateEmail(email) {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

/**
 * Sanitizes user object for public exposure
 * @param {Object} user - User object from database
 * @returns {Object} Sanitized user object
 */
export function sanitizeUser(user) {
  const {
    password,
    passwordResetToken,
    passwordResetExpiresAt,
    failedLoginAttempts,
    lastFailedLoginAt,
    ...safeUser
  } = user;
  
  return safeUser;
}

/**
 * Validates password strength
 * @param {string} password - Password to validate
 * @returns {Object} Validation result and message
 */
export function validatePassword(password) {
  const minLength = 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const issues = [];
  if (password.length < minLength) issues.push(`be at least ${minLength} characters long`);
  if (!hasUppercase) issues.push('contain at least one uppercase letter');
  if (!hasLowercase) issues.push('contain at least one lowercase letter');
  if (!hasNumbers) issues.push('contain at least one number');
  if (!hasSpecialChar) issues.push('contain at least one special character');

  return {
    isValid: issues.length === 0,
    message: issues.length > 0 ? `Password must ${issues.join(', ')}` : '',
  };
}

/**
 * Validates username format
 * @param {string} username - Username to validate
 * @returns {Object} Validation result and message
 */
export function validateUsername(username) {
  const minLength = 3;
  const maxLength = 30;
  const validFormat = /^[a-zA-Z0-9_-]+$/.test(username);
  const length = username.length;

  if (length < minLength) {
    return {
      isValid: false,
      message: `Username must be at least ${minLength} characters long`,
    };
  }

  if (length > maxLength) {
    return {
      isValid: false,
      message: `Username must be no more than ${maxLength} characters long`,
    };
  }

  if (!validFormat) {
    return {
      isValid: false,
      message: 'Username may only contain letters, numbers, underscores, and hyphens',
    };
  }

  return { isValid: true, message: '' };
}
