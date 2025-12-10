/**
 * Utility functions for managing para_no (paragraph number) generation in the logs table.
 *
 * Para_no format: Base number with optional hierarchical suffixes
 * - Original rows: "1.04", "1.04-A", "1.04-A-1", "1.04-A-1-B-2"
 * - Manually added rows: "1.04-a", "1.04-A-1-a", "1.04-a-aa" (lowercase suffix at the end)
 *
 * Suffix sequence: a, b, ..., z, aa, ab, ..., az, ba, bb, ..., zz, aaa, ...
 */

/**
 * Checks if a para_no represents a manually-added row.
 * Manually-added rows end with a lowercase letter suffix after a dash.
 *
 * @param {string} paraNo - The paragraph number to check
 * @returns {boolean} - True if the row was manually added
 */
export function isManuallyAddedParaNo(paraNo) {
  if (!paraNo || typeof paraNo !== 'string') {
    return false;
  }

  const lastDashIndex = paraNo.lastIndexOf('-');
  if (lastDashIndex === -1) {
    return false;
  }

  const suffix = paraNo.slice(lastDashIndex + 1);
  // A manually-added suffix is one or more lowercase letters
  return /^[a-z]+$/.test(suffix);
}

/**
 * Increments a lowercase letter suffix.
 * Handles wrapping: z -> aa, az -> ba, zz -> aaa
 *
 * @param {string} suffix - The current suffix (e.g., 'a', 'z', 'aa', 'az')
 * @returns {string} - The next suffix in sequence
 */
export function incrementSuffix(suffix) {
  if (!suffix) {
    return 'a';
  }

  const chars = suffix.split('');
  let carry = true;

  // Process from right to left
  for (let i = chars.length - 1; i >= 0 && carry; i--) {
    if (chars[i] === 'z') {
      chars[i] = 'a';
      // carry remains true
    } else {
      chars[i] = String.fromCharCode(chars[i].charCodeAt(0) + 1);
      carry = false;
    }
  }

  // If we still have carry, we need to add another 'a' at the front
  if (carry) {
    chars.unshift('a');
  }

  return chars.join('');
}

/**
 * Compares two suffixes and returns which is greater.
 * Single letters are less than multi-character suffixes.
 *
 * @param {string} a - First suffix
 * @param {string} b - Second suffix
 * @returns {number} - Negative if a < b, 0 if equal, positive if a > b
 */
function compareSuffixes(a, b) {
  // Different lengths: longer suffix is greater (a < aa < aaa)
  if (a.length !== b.length) {
    return a.length - b.length;
  }
  // Same length: compare lexicographically
  return a.localeCompare(b);
}

/**
 * Finds the maximum suffix from an array of suffixes.
 *
 * @param {string[]} suffixes - Array of suffixes
 * @returns {string|null} - The maximum suffix, or null if array is empty
 */
function findMaxSuffix(suffixes) {
  if (!suffixes || suffixes.length === 0) {
    return null;
  }

  return suffixes.reduce((max, current) => {
    return compareSuffixes(current, max) > 0 ? current : max;
  });
}

/**
 * Generates the next para_no when adding a new row.
 *
 * If the current row is manually-added (ends with lowercase suffix):
 *   - Add a SIBLING: same parent, next suffix
 * If the current row is an original row:
 *   - Add a CHILD: append -a (or next available suffix)
 *
 * @param {string} currentParaNo - The para_no of the row being added under
 * @param {string[]} existingParaNos - Array of all existing para_nos
 * @returns {string} - The new para_no for the added row
 */
export function getNextParaNo(currentParaNo, existingParaNos) {
  const paraNoList = existingParaNos || [];

  const isManuallyAdded = isManuallyAddedParaNo(currentParaNo);

  if (isManuallyAdded) {
    // Current row is manually added (e.g., "1.04-a" or "1.04-A-1-a")
    // Add a SIBLING (e.g., "1.04-b" or "1.04-A-1-b")
    const lastDashIndex = currentParaNo.lastIndexOf('-');
    const parent = currentParaNo.slice(0, lastDashIndex);

    // Find all siblings (items with same parent + dash + lowercase suffix)
    const siblingPattern = new RegExp(`^${escapeRegExp(parent)}-([a-z]+)$`);
    const siblings = paraNoList
      .map((paraNo) => {
        const match = paraNo.match(siblingPattern);
        return match ? match[1] : null;
      })
      .filter((suffix) => suffix !== null);

    const maxSuffix = findMaxSuffix(siblings);
    const nextSuffix = maxSuffix ? incrementSuffix(maxSuffix) : 'a';

    return `${parent}-${nextSuffix}`;
  } else {
    // Current row is NOT manually added (e.g., "1.04" or "1.04-A-1")
    // Add a CHILD (e.g., "1.04-a" or "1.04-A-1-a")

    // Find all children (items with current para_no + dash + lowercase suffix)
    const childPattern = new RegExp(`^${escapeRegExp(currentParaNo)}-([a-z]+)$`);
    const children = paraNoList
      .map((paraNo) => {
        const match = paraNo.match(childPattern);
        return match ? match[1] : null;
      })
      .filter((suffix) => suffix !== null);

    const maxSuffix = findMaxSuffix(children);
    const nextSuffix = maxSuffix ? incrementSuffix(maxSuffix) : 'a';

    return `${currentParaNo}-${nextSuffix}`;
  }
}

/**
 * Escapes special regex characters in a string.
 *
 * @param {string} string - The string to escape
 * @returns {string} - The escaped string
 */
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
