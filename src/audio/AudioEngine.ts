/**
 * AudioEngine — plays pre-generated MP3 files with Web Audio API fallback to SpeechSynthesis.
 *
 * Flow:
 * 1. Try to load MP3 from /audio/{letters|syllables|words|sentences}/
 * 2. If valid → decode and play via Web Audio API (precise speed control)
 * 3. If missing → fall back to browser window.speechSynthesis (ar-SA)
 */

export const PlaybackSpeed = {
    Normal: 1.0,
    Slow: 0.75,
    Segmented: 0.9,
} as const;

export type PlaybackSpeed = typeof PlaybackSpeed[keyof typeof PlaybackSpeed];

// ─── Letter/Syllable ID Mappings ───────────────────────────
// Maps Arabic characters (with diacritics) to audio file IDs

const LETTER_SOUND_MAP: Record<string, string> = {
    'أَ': 'letter_alif_fatha', 'ا': 'letter_alif_fatha',
    'بَ': 'letter_baa_fatha', 'ب': 'letter_baa_fatha',
    'تَ': 'letter_taa_fatha', 'ت': 'letter_taa_fatha',
    'ثَ': 'letter_thaa_fatha', 'ث': 'letter_thaa_fatha',
    'جَ': 'letter_jeem_fatha', 'ج': 'letter_jeem_fatha',
    'حَ': 'letter_haa_fatha', 'ح': 'letter_haa_fatha',
    'خَ': 'letter_khaa_fatha', 'خ': 'letter_khaa_fatha',
    'دَ': 'letter_daal_fatha', 'د': 'letter_daal_fatha',
    'ذَ': 'letter_dhaal_fatha', 'ذ': 'letter_dhaal_fatha',
    'رَ': 'letter_raa_fatha', 'ر': 'letter_raa_fatha',
    'زَ': 'letter_zaay_fatha', 'ز': 'letter_zaay_fatha',
    'سَ': 'letter_seen_fatha', 'س': 'letter_seen_fatha',
    'شَ': 'letter_sheen_fatha', 'ش': 'letter_sheen_fatha',
    'صَ': 'letter_saad_fatha', 'ص': 'letter_saad_fatha',
    'ضَ': 'letter_daad_fatha', 'ض': 'letter_daad_fatha',
    'طَ': 'letter_taa2_fatha', 'ط': 'letter_taa2_fatha',
    'ظَ': 'letter_dhaa2_fatha', 'ظ': 'letter_dhaa2_fatha',
    'عَ': 'letter_ayn_fatha', 'ع': 'letter_ayn_fatha',
    'غَ': 'letter_ghayn_fatha', 'غ': 'letter_ghayn_fatha',
    'فَ': 'letter_faa_fatha', 'ف': 'letter_faa_fatha',
    'قَ': 'letter_qaaf_fatha', 'ق': 'letter_qaaf_fatha',
    'كَ': 'letter_kaaf_fatha', 'ك': 'letter_kaaf_fatha',
    'لَ': 'letter_laam_fatha', 'ل': 'letter_laam_fatha',
    'مَ': 'letter_meem_fatha', 'م': 'letter_meem_fatha',
    'نَ': 'letter_noon_fatha', 'ن': 'letter_noon_fatha',
    'هَ': 'letter_haa2_fatha', 'ه': 'letter_haa2_fatha',
    'وَ': 'letter_waaw_fatha', 'و': 'letter_waaw_fatha',
    'يَ': 'letter_yaa_fatha', 'ي': 'letter_yaa_fatha',
};

const LETTER_NAME_MAP: Record<string, string> = {
    'ا': 'letter_alif_name', 'ب': 'letter_baa_name',
    'ت': 'letter_taa_name', 'ث': 'letter_thaa_name',
    'ج': 'letter_jeem_name', 'ح': 'letter_haa_name',
    'خ': 'letter_khaa_name', 'د': 'letter_daal_name',
    'ذ': 'letter_dhaal_name', 'ر': 'letter_raa_name',
    'ز': 'letter_zaay_name', 'س': 'letter_seen_name',
    'ش': 'letter_sheen_name', 'ص': 'letter_saad_name',
    'ض': 'letter_daad_name', 'ط': 'letter_taa2_name',
    'ظ': 'letter_dhaa2_name', 'ع': 'letter_ayn_name',
    'غ': 'letter_ghayn_name', 'ف': 'letter_faa_name',
    'ق': 'letter_qaaf_name', 'ك': 'letter_kaaf_name',
    'ل': 'letter_laam_name', 'م': 'letter_meem_name',
    'ن': 'letter_noon_name', 'ه': 'letter_haa2_name',
    'و': 'letter_waaw_name', 'ي': 'letter_yaa_name',
};

// Syllable mapping: consonant+diacritic → syl_xxx_vowel
const CONSONANT_IDS: Record<string, string> = {
    'ب': 'baa', 'ت': 'taa', 'ث': 'thaa', 'ج': 'jeem', 'ح': 'haa',
    'خ': 'khaa', 'د': 'daal', 'ذ': 'dhaal', 'ر': 'raa', 'ز': 'zaay',
    'س': 'seen', 'ش': 'sheen', 'ص': 'saad', 'ض': 'daad', 'ط': 'taa2',
    'ظ': 'dhaa2', 'ع': 'ayn', 'غ': 'ghayn', 'ف': 'faa', 'ق': 'qaaf',
    'ك': 'kaaf', 'ل': 'laam', 'م': 'meem', 'ن': 'noon', 'ه': 'haa2',
    'و': 'waaw', 'ي': 'yaa',
};

const VOWEL_IDS: Record<string, string> = {
    'َ': 'fatha', 'ِ': 'kasra', 'ُ': 'damma',
};

// Arabic letter names for TTS fallback
const ARABIC_NAMES: Record<string, string> = {
    'ا': 'أَلِف', 'ب': 'باء', 'ت': 'تاء', 'ث': 'ثاء',
    'ج': 'جيم', 'ح': 'حاء', 'خ': 'خاء', 'د': 'دال',
    'ذ': 'ذال', 'ر': 'راء', 'ز': 'زاي', 'س': 'سين',
    'ش': 'شين', 'ص': 'صاد', 'ض': 'ضاد', 'ط': 'طاء',
    'ظ': 'ظاء', 'ع': 'عين', 'غ': 'غين', 'ف': 'فاء',
    'ق': 'قاف', 'ك': 'كاف', 'ل': 'لام', 'م': 'ميم',
    'ن': 'نون', 'ه': 'هاء', 'و': 'واو', 'ي': 'ياء',
};

// ─── Audio context (shared, lazy) ──────────────────────────

let audioCtx: AudioContext | null = null;
let currentSource: AudioBufferSourceNode | null = null;
const audioCache = new Map<string, AudioBuffer>();
let vocabularyData: Record<string, { text: string; path: string }> | null = null;

function getAudioContext(): AudioContext {
    if (!audioCtx) {
        audioCtx = new AudioContext();
    }
    return audioCtx;
}

async function loadVocabulary(): Promise<Record<string, { text: string; path: string }>> {
    if (vocabularyData) return vocabularyData;
    try {
        const res = await fetch('/audio/vocabulary.json');
        if (res.ok) {
            vocabularyData = await res.json();
            return vocabularyData!;
        }
    } catch {
        // vocabulary.json not available
    }
    vocabularyData = {};
    return vocabularyData;
}

// ─── Resolve text/ID → audio file path ─────────────────────

function resolveAudioId(input: string): string | null {
    // If it's already a known audio ID (e.g., 'letter_baa_fatha')
    if (input.startsWith('letter_') || input.startsWith('syl_') || input.startsWith('word_') || input.startsWith('sent_')) {
        return input;
    }

    // Check letter sound map (Arabic char or char+diacritic)
    if (LETTER_SOUND_MAP[input]) return LETTER_SOUND_MAP[input];

    // Check syllable: consonant + vowel diacritic (2 chars)
    if (input.length === 2) {
        const consonant = input[0];
        const vowel = input[1];
        const cId = CONSONANT_IDS[consonant];
        const vId = VOWEL_IDS[vowel];
        if (cId && vId) return `syl_${cId}_${vId}`;
    }

    return null;
}

function audioIdToPath(audioId: string): string {
    // Determine directory from ID prefix
    if (audioId.startsWith('letter_')) return `/audio/letters/${audioId}.mp3`;
    if (audioId.startsWith('syl_')) return `/audio/syllables/${audioId}.mp3`;
    if (audioId.startsWith('word_')) return `/audio/words/${audioId}.mp3`;
    if (audioId.startsWith('sent_')) return `/audio/sentences/${audioId}.mp3`;
    return `/audio/letters/${audioId}.mp3`;
}

// ─── Playback ──────────────────────────────────────────────

/**
 * Stop any currently playing audio
 */
export function stopAudio(): void {
    if (currentSource) {
        try { currentSource.stop(); } catch { /* already stopped */ }
        currentSource = null;
    }
    window.speechSynthesis?.cancel();
}

/**
 * Play audio by ID or Arabic text.
 * Tries MP3 first, falls back to SpeechSynthesis.
 */
export async function play(input: string, speed: PlaybackSpeed = PlaybackSpeed.Normal): Promise<void> {
    stopAudio();

    const audioId = resolveAudioId(input);
    if (audioId) {
        const played = await tryPlayMP3(audioId, speed);
        if (played) return;
    }

    // Also try vocabulary lookup
    const vocab = await loadVocabulary();
    if (audioId && vocab[audioId]) {
        const played = await tryPlayMP3Path(vocab[audioId].path, speed);
        if (played) return;
    }

    // Fallback to browser TTS
    await speakWithTTS(input, speed);
}

/**
 * Play a letter name (e.g., pass 'ب' → plays "باء")
 */
export async function playLetterName(letter: string, speed: PlaybackSpeed = PlaybackSpeed.Normal): Promise<void> {
    stopAudio();

    // Strip any diacritics to get base letter
    const baseLetter = letter.replace(/[\u064E\u064F\u0650\u0651\u0652\u064B\u064C\u064D]/g, '');
    const nameId = LETTER_NAME_MAP[baseLetter];

    if (nameId) {
        const played = await tryPlayMP3(nameId, speed);
        if (played) return;
    }

    // Fallback: speak the Arabic name
    const arabicName = ARABIC_NAMES[baseLetter] || letter;
    await speakWithTTS(arabicName, speed);
}

/**
 * Play a letter sound (e.g., pass 'ب' → plays "بَ")
 */
export async function playLetterSound(letter: string, speed: PlaybackSpeed = PlaybackSpeed.Normal): Promise<void> {
    stopAudio();

    const soundId = LETTER_SOUND_MAP[letter] || LETTER_SOUND_MAP[letter + 'َ'];
    if (soundId) {
        const played = await tryPlayMP3(soundId, speed);
        if (played) return;
    }

    await speakWithTTS(letter + 'َ', speed);
}

// ─── Internal: MP3 via Web Audio API ───────────────────────

async function tryPlayMP3(audioId: string, speed: PlaybackSpeed): Promise<boolean> {
    return tryPlayMP3Path(audioIdToPath(audioId), speed);
}

async function tryPlayMP3Path(filePath: string, speed: PlaybackSpeed): Promise<boolean> {
    try {
        // Check cache first
        let buffer = audioCache.get(filePath);

        if (!buffer) {
            const response = await fetch(filePath);
            if (!response.ok) return false;

            const arrayBuffer = await response.arrayBuffer();
            const ctx = getAudioContext();
            buffer = await ctx.decodeAudioData(arrayBuffer);
            audioCache.set(filePath, buffer);
        }

        const ctx = getAudioContext();
        if (ctx.state === 'suspended') await ctx.resume();

        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.playbackRate.value = speed;
        source.connect(ctx.destination);

        currentSource = source;
        return new Promise((resolve) => {
            source.onended = () => {
                currentSource = null;
                resolve(true);
            };
            source.start();
        });
    } catch {
        return false;
    }
}

// ─── Internal: Browser SpeechSynthesis fallback ────────────

async function speakWithTTS(text: string, speed: PlaybackSpeed): Promise<void> {
    if (!window.speechSynthesis) return;

    return new Promise<void>((resolve) => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'ar-SA';
        utterance.rate = speed === PlaybackSpeed.Slow ? 0.6 : 0.8;

        utterance.onend = () => resolve();
        utterance.onerror = () => resolve();

        window.speechSynthesis.speak(utterance);
    });
}

// ─── UI Feedback Sounds (synthesised tones) ────────────────

export function playCorrectSound(): void {
    try {
        const ctx = getAudioContext();
        if (ctx.state === 'suspended') ctx.resume();

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.frequency.value = 523.25; // C5
        gain.gain.value = 0.15;
        osc.start();

        setTimeout(() => { osc.frequency.value = 659.25; }, 100); // E5
        setTimeout(() => { osc.frequency.value = 783.99; }, 200); // G5
        setTimeout(() => {
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
            setTimeout(() => osc.stop(), 300);
        }, 300);
    } catch { /* audio not available */ }
}

export function playWrongSound(): void {
    try {
        const ctx = getAudioContext();
        if (ctx.state === 'suspended') ctx.resume();

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.type = 'sawtooth';
        osc.frequency.value = 200;
        gain.gain.value = 0.1;
        osc.start();

        setTimeout(() => {
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
            setTimeout(() => osc.stop(), 200);
        }, 200);
    } catch { /* audio not available */ }
}

export function playCompletionSound(): void {
    try {
        const ctx = getAudioContext();
        if (ctx.state === 'suspended') ctx.resume();

        const notes = [523.25, 659.25, 783.99, 1046.5]; // C5 E5 G5 C6
        notes.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.value = freq;
            gain.gain.value = 0.12;
            osc.start(ctx.currentTime + i * 0.15);
            osc.stop(ctx.currentTime + i * 0.15 + 0.3);
        });
    } catch { /* audio not available */ }
}
