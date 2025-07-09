// UUID util
// Expects 128-bit UUID known as the Device UUID (Bluetooth Mesh Protocol v1.1, 3.11.3 Device UUID)

export interface UuidInfo {
  valid: boolean;
  originalInput: string;
  standardFormat?: string;
  rawFormat?: string;
  version?: number;
  variant?: string;
  isRawFormat?: boolean;
  error?: string;
}

/**
 * Check if a string is a valid 32-character hexadecimal UUID (without hyphens)
 * @param uuidString - String to validate
 * @returns True if valid raw UUID, false otherwise
 */
export function isValidRawUuid(uuidString: string): boolean {
  if (typeof uuidString !== 'string') {
    return false;
  }

  // Check if it's exactly 32 characters and all hexadecimal
  if (uuidString.length !== 32) {
    return false;
  }

  // Check if all characters are valid hexadecimal (0-9, a-f, A-F)
  return /^[0-9a-fA-F]{32}$/.test(uuidString);
}

/**
 * Convert a 32-character raw UUID to standard UUID format with hyphens
 * Bluetooth Mesh Protocol v1.1, 8.11.1.1 Canonical string representation
 * @param rawUuid - 32-character hexadecimal string
 * @returns Standard UUID format (8-4-4-4-12) or null if invalid
 */
export function rawUuidToStandard(rawUuid: string): string | null {
  if (!isValidRawUuid(rawUuid)) {
    return null;
  }

  // Insert hyphens at appropriate positions: 8-4-4-4-12
  const formatted = [
    rawUuid.slice(0, 8),
    rawUuid.slice(8, 12),
    rawUuid.slice(12, 16),
    rawUuid.slice(16, 20),
    rawUuid.slice(20)
  ].join('-');

  return formatted;
}

/**
 * Check if a string is a valid standard UUID format
 * @param uuidString - String to validate
 * @returns True if valid standard UUID, false otherwise
 */
export function isValidStandardUuid(uuidString: string): boolean {
  if (typeof uuidString !== 'string') {
    return false;
  }

  // Standard UUID format: 8-4-4-4-12
  const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
  return uuidRegex.test(uuidString);
}

/**
 * Validate and normalize UUID from any format
 * @param uuidInput - UUID string in any format
 * @returns Standard UUID format or null if invalid
 */
export function validateAndNormalizeUuid(uuidInput: string): string | null {
  if (typeof uuidInput !== 'string') {
    return null;
  }

  // First try as standard UUID
  if (isValidStandardUuid(uuidInput)) {
    return uuidInput.toLowerCase();
  }

  // If that fails, try as raw UUID
  if (isValidRawUuid(uuidInput)) {
    return rawUuidToStandard(uuidInput.toLowerCase());
  }

  return null;
}

/**
 * Convert standard UUID to raw format
 * @param standardUuid - Standard UUID format
 * @returns Raw UUID format or null if invalid
 */
export function standardUuidToRaw(standardUuid: string): string | null {
  if (isValidRawUuid(standardUuid)){
    return standardUuid
  }
  if (!isValidStandardUuid(standardUuid)) {
    return null;
  }

  return standardUuid.replace(/-/g, '').toLowerCase();
}

/**
 * Get the UUID version from a UUID string
 * @param uuidString - UUID in any format
 * @returns UUID version (1-5) or null if invalid
 */
export function getUuidVersion(uuidString: string): number | null {
  const standardUuid = validateAndNormalizeUuid(uuidString);
  if (!standardUuid) {
    return null;
  }

  // Version is the first character of the third group (position 14)
  const versionChar = standardUuid.charAt(14);
  const version = parseInt(versionChar, 16);
  
  return version >= 1 && version <= 5 ? version : null;
}

/**
 * Get the UUID variant from a UUID string
 * @param uuidString - UUID in any format
 * @returns UUID variant description or null if invalid
 */
export function getUuidVariant(uuidString: string): string | null {
  const standardUuid = validateAndNormalizeUuid(uuidString);
  if (!standardUuid) {
    return null;
  }

  // Variant is determined by the first character of the fourth group (position 19)
  const variantChar = standardUuid.charAt(19);
  const variantBits = parseInt(variantChar, 16);

  if ((variantBits & 0x8) === 0) {
    return 'NCS backward compatibility';
  } else if ((variantBits & 0xC) === 0x8) {
    return 'RFC 4122';
  } else if ((variantBits & 0xE) === 0xC) {
    return 'Microsoft Corporation';
  } else {
    return 'Unknown';
  }
}

/**
 * Get comprehensive information about a UUID
 * @param uuidInput - UUID string in any format
 * @returns Object with UUID information
 */
export function getUuidInfo(uuidInput: string): UuidInfo {
  const isRawFormat = isValidRawUuid(uuidInput);
  const standardFormat = validateAndNormalizeUuid(uuidInput);

  if (!standardFormat) {
    return {
      valid: false,
      originalInput: uuidInput,
      error: 'Invalid UUID format'
    };
  }

  const rawFormat = standardUuidToRaw(standardFormat);
  const version = getUuidVersion(uuidInput);
  const variant = getUuidVariant(uuidInput);

  return {
    valid: true,
    originalInput: uuidInput,
    standardFormat,
    rawFormat: rawFormat || undefined,
    version: version || undefined,
    variant: variant || undefined,
    isRawFormat
  };
}

/**
 * Generate a random UUID v4 in standard format
 * @returns UUID v4 string
 */
export function generateUuidV4(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Generate a random UUID v4 in raw format
 * @returns Raw UUID v4 string
 */
export function generateRawUuidV4(): string {
  const standardUuid = generateUuidV4();
  return standardUuidToRaw(standardUuid) || '';
}