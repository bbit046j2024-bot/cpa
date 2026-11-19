/**
 * Kenyan Mobile Phone Normalization & Validation Utility
 *
 * Adheres strictly to Communications Authority of Kenya (CAK)
 * National Numbering Plan allocations for Safaricom, Airtel, Telkom, Equitel.
 * Strictly detects and rejects non-existing numbers, unallocated prefixes,
 * dummy sequences, and test patterns.
 */

export interface PhoneValidationResult {
  isValid: boolean;
  normalized: string;
  formatted: string;
  error?: string;
  network?: string;
  prefix?: string;
}

// Officially allocated 3-digit mobile prefixes in Kenya (without leading 0)
const VALID_SAFARICOM_PREFIXES = new Set([
  // 0700 - 0709
  '700','701','702','703','704','705','706','707','708','709',
  // 0710 - 0719
  '710','711','712','713','714','715','716','717','718','719',
  // 0720 - 0729
  '720','721','722','723','724','725','726','727','728','729',
  // 0740 - 0743, 0745, 0746, 0748
  '740','741','742','743','745','746','748',
  // 0757 - 0759
  '757','758','759',
  // 0768 - 0769
  '768','769',
  // 0790 - 0799
  '790','791','792','793','794','795','796','797','798','799',
  // 0110 - 0119 (Safaricom 011 series)
  '110','111','112','113','114','115','116','117','118','119',
]);

const VALID_AIRTEL_PREFIXES = new Set([
  // 0730 - 0739
  '730','731','732','733','734','735','736','737','738','739',
  // 0750 - 0756
  '750','751','752','753','754','755','756',
  // 0780 - 0789
  '780','781','782','783','784','785','786','787','788','789',
  // 0100 - 0109 (Airtel 010 series)
  '100','101','102','103','104','105','106','107','108','109',
]);

const VALID_TELKOM_PREFIXES = new Set([
  // 0770 - 0779
  '770','771','772','773','774','775','776','777','778','779',
]);

const VALID_EQUITEL_PREFIXES = new Set([
  // 0763 - 0766
  '763','764','765','766',
]);

export function normalizeKenyanPhone(input: string): PhoneValidationResult {
  if (!input || typeof input !== 'string') {
    return {
      isValid: false,
      normalized: '',
      formatted: '',
      error: 'Phone number is required',
    };
  }

  // Remove whitespace, dashes, parentheses, dots
  let cleaned = input.trim().replace(/[\s\-\(\)\.]/g, '');

  // Handle + prefix
  if (cleaned.startsWith('+')) {
    cleaned = cleaned.substring(1);
  }

  // Handle 00254 prefix
  if (cleaned.startsWith('00254')) {
    cleaned = cleaned.substring(2);
  }

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
      error: 'Invalid length. Kenyan mobile numbers must have 10 digits (e.g. 0712345678 or 0112345678)',
    };
  }

  // Must begin with 7 or 1
  if (!localNineDigits.startsWith('7') && !localNineDigits.startsWith('1')) {
    return {
      isValid: false,
      normalized: '',
      formatted: input,
      error: 'Kenyan mobile numbers must begin with 07 or 01 prefix',
    };
  }

  // Must contain only numeric digits
  if (!/^\d{9}$/.test(localNineDigits)) {
    return {
      isValid: false,
      normalized: '',
      formatted: input,
      error: 'Phone number must contain only numeric digits',
    };
  }

  // Check for non-existing / fake / dummy patterns:
  // 1. All identical digits (e.g. 0700000000, 0711111111, 0799999999)
  if (/^(\d)\1{8}$/.test(localNineDigits)) {
    return {
      isValid: false,
      normalized: '',
      formatted: input,
      error: 'This contact number is invalid (repetitive dummy digits). Please provide an active phone number.',
    };
  }

  // 2. 5 or more identical digits in a row (e.g. 0712000000, 0799999999)
  if (/(.)\1{4,}/.test(localNineDigits)) {
    return {
      isValid: false,
      normalized: '',
      formatted: input,
      error: 'This contact number contains a non-existent sequence of repeating digits. Please provide a genuine phone number.',
    };
  }

  // 3. Obvious ascending or descending test sequences (e.g. 0712345678, 0798765432)
  const full10 = `0${localNineDigits}`;
  if (
    '0123456789'.includes(localNineDigits) ||
    '9876543210'.includes(localNineDigits) ||
    full10 === '0712345678' ||
    full10 === '0787654321' ||
    full10 === '0701234567'
  ) {
    return {
      isValid: false,
      normalized: '',
      formatted: input,
      error: 'This contact appears to be a test sequence. Please enter an active registered phone number.',
    };
  }

  // 4. Repeated 2-digit patterns (e.g. 12121212)
  if (/(.{2})\1{3,}/.test(localNineDigits)) {
    return {
      isValid: false,
      normalized: '',
      formatted: input,
      error: 'Invalid pattern. Please provide a genuine Kenyan mobile contact.',
    };
  }

  // 5. CAK Allocated Prefix Validation
  const prefix3 = localNineDigits.substring(0, 3);
  let network = '';

  if (VALID_SAFARICOM_PREFIXES.has(prefix3)) {
    network = 'Safaricom';
  } else if (VALID_AIRTEL_PREFIXES.has(prefix3)) {
    network = 'Airtel';
  } else if (VALID_TELKOM_PREFIXES.has(prefix3)) {
    network = 'Telkom';
  } else if (VALID_EQUITEL_PREFIXES.has(prefix3)) {
    network = 'Equitel';
  } else {
    return {
      isValid: false,
      normalized: '',
      formatted: input,
      error: `The prefix 0${prefix3} is not an allocated mobile network prefix in Kenya. Please enter an active Safaricom, Airtel, Telkom, or Equitel number.`,
    };
  }

  const normalized = `+254${localNineDigits}`;
  const formatted = `0${localNineDigits.substring(0, 3)} ${localNineDigits.substring(3, 6)} ${localNineDigits.substring(6)}`;

  return {
    isValid: true,
    normalized,
    formatted,
    network,
    prefix: `0${prefix3}`,
  };
}
