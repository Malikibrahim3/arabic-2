/**
 * Normalize Arabic text for comparison:
 * Remove diacritics, normalize alef variants, remove punctuation.
 */
export function normalizeArabic(text: string): string {
    return text
        .replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7\u06E8\u06EA-\u06ED]/g, '')
        .replace(/[إأآا]/g, 'ا')
        .replace(/ة/g, 'ه')
        .replace(/[؟،.!?,:;"\']/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

/** Check if text is a single Arabic letter (possibly with diacritics) */
export function isSingleLetter(text: string): boolean {
    const stripped = normalizeArabic(text);
    return stripped.length === 1 && /[\u0600-\u06FF]/.test(stripped);
}
