// ============================================================
// errorMessages.js - Converts technical API errors into
// friendly, human-readable messages for the user.
// ============================================================

/**
 * Map of technical error patterns to friendly messages.
 * Order matters — more specific patterns first.
 */
const ERROR_MAP = [
  // Route/endpoint errors
  { match: /cannot find route/i,         msg: 'This action is not available right now. Please contact support.' },
  { match: /route.*not found/i,          msg: 'Something went wrong on our end. Please try again.' },
  { match: /not found/i,                 msg: 'The requested record was not found.' },

  // Auth errors
  { match: /invalid.*credentials/i,      msg: 'Incorrect email or password. Please try again.' },
  { match: /invalid.*token/i,            msg: 'Your session has expired. Please log in again.' },
  { match: /jwt.*expired/i,              msg: 'Your session has expired. Please log in again.' },
  { match: /unauthorized/i,             msg: 'You are not authorised to perform this action.' },
  { match: /forbidden/i,                 msg: 'Access denied. You do not have permission for this.' },

  // Duplicate / conflict errors
  { match: /duplicate.*email/i,          msg: 'This email address is already registered.' },
  { match: /duplicate.*code/i,           msg: 'This employee code already exists. Please use a different one.' },
  { match: /already.*checked.*in/i,      msg: 'You have already checked in for today.' },
  { match: /already.*checked.*out/i,     msg: 'You have already checked out for today.' },
  { match: /E11000/i,                    msg: 'A record with this information already exists.' },

  // Leave errors
  { match: /insufficient.*leave/i,       msg: 'Not enough leave balance available for this request.' },
  { match: /leave.*balance/i,            msg: 'Your leave balance is insufficient for this request.' },
  { match: /check.*in.*first/i,          msg: 'You need to check in before you can check out.' },

  // Validation errors
  { match: /required/i,                  msg: 'Please fill in all required fields.' },
  { match: /validation.*failed/i,        msg: 'Some fields have invalid values. Please review and try again.' },
  { match: /password.*short/i,           msg: 'Password must be at least 6 characters long.' },
  { match: /invalid.*email/i,            msg: 'Please enter a valid email address.' },

  // Network / server errors
  { match: /network.*error/i,            msg: 'Cannot connect to the server. Please check your internet connection.' },
  { match: /500/,                        msg: 'Server error. Please try again in a moment.' },
  { match: /503/,                        msg: 'Service temporarily unavailable. Please try again later.' },
  { match: /timeout/i,                   msg: 'The request took too long. Please try again.' },
];

/**
 * getFriendlyError(rawError)
 * Takes a raw error string from the API and returns a clean,
 * user-friendly message.
 *
 * @param {string} rawError - Error message from API or axios
 * @param {string} fallback - Fallback message if no pattern matches
 * @returns {string} Human-readable error message
 */
export const getFriendlyError = (rawError, fallback = 'Something went wrong. Please try again.') => {
  if (!rawError) return fallback;

  const raw = typeof rawError === 'string' ? rawError : JSON.stringify(rawError);

  for (const { match, msg } of ERROR_MAP) {
    if (match.test(raw)) return msg;
  }

  // If message is short and readable enough (no slashes, no colons, no IDs), show it as-is
  if (raw.length < 80 && !/[\/\\:{}\[\]]/.test(raw) && !/[0-9a-f]{24}/i.test(raw)) {
    return raw;
  }

  return fallback;
};
