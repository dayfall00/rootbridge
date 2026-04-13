import { ROLES } from '../constants/appConstants';

/**
 * Trim and lowercase a string value.
 * Returns null if falsy (undefined, empty, null).
 */
export const normalizeString = (value) =>
  (typeof value === 'string' && value.trim()) ? value.trim().toLowerCase() : null;

/**
 * Normalize a city string for storage and comparison.
 * Logs a warning when city is missing.
 */
export const normalizeCity = (city) => {
  const result = normalizeString(city);
  if (!result) console.warn('[normalize] city is missing or empty');
  return result;
};

/**
 * Validate and normalize a role string.
 * Throws if the role is not in the ROLES enum.
 */
export const normalizeRole = (role) => {
  const normalized = normalizeString(role);
  if (!normalized) throw new Error('[normalizeRole] Role is required');
  if (!Object.values(ROLES).includes(normalized)) {
    throw new Error(`[normalizeRole] Invalid role: "${role}". Must be one of: ${Object.values(ROLES).join(', ')}`);
  }
  return normalized;
};

/**
 * Normalize a category string (trim + lowercase).
 * Returns null if falsy.
 */
export const normalizeCategory = (category) => normalizeString(category);
