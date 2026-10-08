// GridWorld profanity filter — Paul's rule 2026-10-08:
// "Cussing should show up as '!@#$%' everywhere there is a child account online."
//
// When a child (under 18) is present, profanity in user-generated content
// is masked with symbol characters. Adults see unfiltered text.

const PROFANITY = [
  // Core profanity (common variants)
  'fuck', 'shit', 'bitch', 'asshole', 'dick', 'pussy', 'cunt',
  'motherfucker', 'fucker', 'bastard', 'whore', 'slut',
  'damn', 'hell',
  // Slur-adjacent / hateful — always filtered regardless of age setting
  // (kept minimal here; server-side list is authoritative)
];

const ALWAYS_FILTER: string[] = [
  // Hate slurs — never shown to anyone, any age
  // (full list lives server-side; client list is a fallback)
];

// Mask style: "!@#$%" pattern
const MASK_CHARS = ['!', '@', '#', '$', '%', '&', '*'];

function maskWord(word: string): string {
  let out = '';
  for (let i = 0; i < word.length; i++) {
    out += MASK_CHARS[i % MASK_CHARS.length];
  }
  return out;
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Filter profanity from text. Returns the filtered string.
 * @param text - the text to filter
 * @param isChildPresent - true if a child account is online/viewing
 */
export function filterProfanity(text: string, isChildPresent: boolean): string {
  if (!text) return text;

  let result = text;

  // Hate slurs: always filtered, everyone
  for (const word of ALWAYS_FILTER) {
    const re = new RegExp(`\\b${escapeRegex(word)}\\b`, 'gi');
    result = result.replace(re, (m) => maskWord(m));
  }

  // Regular profanity: only filtered when a child is present
  if (isChildPresent) {
    for (const word of PROFANITY) {
      const re = new RegExp(`\\b${escapeRegex(word)}\\b`, 'gi');
      result = result.replace(re, (m) => maskWord(m));
    }
  }

  return result;
}

/**
 * Check if a date of birth indicates a child account (under 18).
 */
export function isChildAccount(dob: string | null | undefined): boolean {
  if (!dob) return false;
  const birth = new Date(dob);
  if (isNaN(birth.getTime())) return false;
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
  return age < 18;
}

/**
 * Check if any participant in a list is a child.
 */
export function isChildPresent(dobs: (string | null | undefined)[]): boolean {
  return dobs.some(isChildAccount);
}
