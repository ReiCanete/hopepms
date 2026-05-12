/**
 * Creates an audit stamp string.
 * Format: "ACTION userId YYYY-MM-DD HH:MM"
 * Example: "ADD abc-123 2025-01-15 14:30"
 */
export function makeStamp(action, userId) {
  const now = new Date();
  const date = now.toISOString().slice(0, 10);
  const time = now.toTimeString().slice(0, 5);
  return `${action} ${userId} ${date} ${time}`;
}

/**
 * Parses an audit stamp string into its parts.
 * Returns { opType, opBy, opDate } or null if stamp is invalid.
 */
export function parseStamp(stamp) {
  if (!stamp || typeof stamp !== 'string') return null;
  const parts = stamp.trim().split(' ');
  // Expected: ["ACTION", "userId", "YYYY-MM-DD", "HH:MM"]
  if (parts.length < 4) return null;
  const [opType, opBy, date, time] = parts;
  return {
    opType,          // e.g. "ADD", "EDIT", "DEACTIVATE", "RECOVER"
    opBy,            // userId (UUID)
    opDate: `${date} ${time}`, // e.g. "2025-01-15 14:30"
  };
}