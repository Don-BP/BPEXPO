// Must match the lowercase `id` values in TangoSetupScreen CATEGORIES and pronunciation_vocab.js
export const FREE_CATEGORIES = ['numbers', 'colors', 'fruit', 'animals', 'body'];

/** Extracts the Tango category name from a deck key like "Tango: Animals" → "Animals".
 *  Returns null for custom/non-Tango sets. */
export function getTangoCategoryName(deckKey: string): string | null {
  return deckKey.startsWith('Tango: ') ? deckKey.slice(7) : null;
}

/** Returns true if the given deck key is a Tango category that requires an ad unlock. */
export function isTangoCategoryLocked(
  deckKey: string,
  isPro: boolean,
  isUnlocked: (featureId: string) => boolean
): boolean {
  const catName = getTangoCategoryName(deckKey);
  if (!catName) return false;
  if (isPro || FREE_CATEGORIES.includes(catName)) return false;
  return !isUnlocked(`tango_cat_${catName}`);
}
