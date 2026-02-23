/**
 * Arabic Audio Utility
 * Uses a Vite proxy to Google Translate TTS for reliable Arabic pronunciation.
 * The proxy avoids CORS/ORB blocks that prevent direct cross-origin audio.
 */

const LETTER_NAMES: Record<string, string> = {
    'ا': 'ألِف', 'ب': 'باء', 'ت': 'تاء', 'ث': 'ثاء',
    'ج': 'جيم', 'ح': 'حاء', 'خ': 'خاء', 'د': 'دال',
    'ذ': 'ذال', 'ر': 'راء', 'ز': 'زاي', 'س': 'سين',
    'ش': 'شين', 'ص': 'صاد', 'ض': 'ضاد', 'ط': 'طاء',
    'ظ': 'ظاء', 'ع': 'عين', 'غ': 'غين', 'ف': 'فاء',
    'ق': 'قاف', 'ك': 'كاف', 'ل': 'لام', 'م': 'ميم',
    'ن': 'نون', 'ه': 'هاء', 'و': 'واو', 'ي': 'ياء',
};

let currentAudio: HTMLAudioElement | null = null;

/**
 * Play Arabic text via the proxy to Google Translate TTS.
 * The proxy is configured in vite.config.ts to forward to translate.google.com.
 */
export async function speakArabic(text: string): Promise<void> {
    // Stop any currently playing audio
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        currentAudio = null;
    }

    return new Promise<void>((resolve) => {
        const audio = new Audio(`/api/tts?text=${encodeURIComponent(text)}`);
        currentAudio = audio;

        audio.onended = () => {
            currentAudio = null;
            resolve();
        };
        audio.onerror = (e) => {
            console.warn('Audio error:', e);
            currentAudio = null;
            resolve();
        };
        audio.play().catch((err) => {
            console.warn('Audio play error:', err);
            currentAudio = null;
            resolve();
        });
    });
}

/**
 * Speak the Arabic name of a letter (e.g., "باء" for ب)
 */
export async function speakLetterName(letter: string): Promise<void> {
    const name = LETTER_NAMES[letter];
    await speakArabic(name || letter);
}

/**
 * Speak just the sound of a letter with a short vowel
 */
export async function speakLetterSound(letter: string): Promise<void> {
    await speakArabic(letter + 'َ');
}

/** Warm up — no-op for proxy approach */
export function warmUpAudio(): void { }

/** Always supported via proxy */
export function isSpeechSupported(): boolean {
    return true;
}

export function getLetterArabicName(letter: string): string {
    return LETTER_NAMES[letter] || letter;
}
