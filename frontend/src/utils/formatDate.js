// ============================================================
// formatDate.js - Date formatting utilities using date-fns
// ============================================================

import { format, differenceInCalendarDays, parseISO, isValid } from 'date-fns';

/**
 * Safely parse a date string or Date object
 */
const safeParse = (date) => {
  if (!date) return null;
  if (date instanceof Date) return isValid(date) ? date : null;
  try {
    const parsed = typeof date === 'string' ? parseISO(date) : new Date(date);
    return isValid(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

/**
 * Formats a date to "dd MMM yyyy" (e.g., "15 Oct 2026")
 */
export const formatDate = (date, formatStr = 'dd MMM yyyy') => {
  const parsed = safeParse(date);
  if (!parsed) return 'N/A';
  try {
    return format(parsed, formatStr);
  } catch (err) {
    return 'N/A';
  }
};

/**
 * Formats a date & time to "dd MMM yyyy, hh:mm a"
 */
export const formatDateTime = (date, formatStr = 'dd MMM yyyy, hh:mm a') => {
  const parsed = safeParse(date);
  if (!parsed) return 'N/A';
  try {
    return format(parsed, formatStr);
  } catch (err) {
    return 'N/A';
  }
};

/**
 * Calculates number of days between two dates inclusive
 */
export const getDaysDifference = (start, end) => {
  const parsedStart = safeParse(start);
  const parsedEnd = safeParse(end);
  if (!parsedStart || !parsedEnd) return 0;
  const diff = differenceInCalendarDays(parsedEnd, parsedStart) + 1;
  return diff > 0 ? diff : 0;
};

/**
 * Formats date to Month & Year (e.g. "October 2026")
 */
export const getMonthYear = (date, formatStr = 'MMMM yyyy') => {
  const parsed = safeParse(date);
  if (!parsed) return 'N/A';
  try {
    return format(parsed, formatStr);
  } catch (err) {
    return 'N/A';
  }
};

/**
 * getFullName - Safely gets a person's full name.
 * Handles two cases:
 *   - Employee/Manager documents: have firstName + lastName fields
 *   - User documents: have a single name field
 * Usage: getFullName(employee) or getFullName(user)
 */
export const getFullName = (person) => {
  if (!person) return '—';
  if (person.firstName || person.lastName) {
    return `${person.firstName || ''} ${person.lastName || ''}`.trim();
  }
  return person.name || '—';
};

