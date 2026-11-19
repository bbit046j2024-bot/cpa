/**
 * Kenyan Mobile Phone Normalization & Validation Utility
 *
 * Supports Safaricom, Airtel, Telkom (07xx, 01xx prefixes)
 * Normalizes to standard E.164: +2547XXXXXXXX or +2541XXXXXXXX
 */

export interface PhoneValidationResult {
  isValid: boolean;
  normalized: string;
  formatted: string;
  error?: string;
  network?: string;
}

export function normalizeKenyanPhone(input: string): PhoneValidationResult {
  if (!input || typeof input !== 'string') {
    return {
      isValid: false,
      normalized: '',
      formatted: '',
      error: 'Phone number is required',
    };
  }

  // Remove whitespace, dashes, parens, dots
  let cleaned = input.trim().replace(/[\s\-\(\)\.]/g, '');

  // Handle + prefix
  if (cleaned.startsWith('+')) {
    cleaned = cleaned.substring(1);
  }

  // Handle 00254 prefix
  if (cleaned.startsWith('00254')) {
    cleaned = cleaned.substring(2);
  }

  // Now cleaned can start with:
  // 1) '254' followed by 9 digits
  // 2) '0' followed by 9 digits (07..., 01...)
  // 3) '7' or '1' followed by 8 digits (9 digits total)

  let localNineDigits = '';

  if (cleaned.startsWith('254') && cleaned.length === 12) {
    localNineDigits = cleaned.substring(3);
  } else if (cleaned.startsWith('0') && cleaned.length === 10) {
    localNineDigits = cleaned.substring(1);
  } else if ((cleaned.startsWith('7') || cleaned.startsWith('1')) && cleaned.length === 9) {
    localNineDigits = cleaned;
  } else {
    return {
      isValid: false,
      normalized: '',
      formatted: input,
      error: 'Invalid Kenyan phone number length. Expected 10 digits (e.g. 0712345678 or 0112345678)',
    };
  }

  // Must begin with 7 or 1
  if (!localNineDigits.startsWith('7') && !localNineDigits.startsWith('1')) {
    return {
      isValid: false,
      normalized: '',
      formatted: input,
      error: 'Kenyan mobile numbers must start with 07 or 01 prefix',
    };
  }

  // Validate only digits
  if (!/^\d{9}$/.test(localNineDigits)) {
    return {
      isValid: false,
      normalized: '',
      formatted: input,
      error: 'Phone number must contain only numeric digits',
    };
  }

  const normalized = `+254${localNineDigits}`;
  const formatted = `0${localNineDigits.substring(0, 3)} ${localNineDigits.substring(3, 6)} ${localNineDigits.substring(6)}`;

  // Detect network provider
  let network = 'Kenyan Mobile';
  const prefix2 = localNineDigits.substring(0, 2);
  if (['70', '71', '72', '74', '79', '11'].includes(prefix2)) {
    network = 'Safaricom';
  } else if (['73', '75', '78', '10'].includes(prefix2)) {
    network = 'Airtel';
  } else if (['77'].includes(prefix2)) {
    network = 'Telkom';
  }

  return {
    isValid: true,
    normalized,
    formatted,
    network,
  };
}

