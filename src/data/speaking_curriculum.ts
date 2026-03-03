/**
 * Speaking Curriculum — Progressive from zero to semi-fluent
 *
 * Stage S1: Arabic Sounds (individual letters)
 * Stage S2: Basic Greetings
 * Stage S3: Common Words (numbers, family, colors)
 * Stage S4: Daily Phrases
 * Stage S5: Simple Conversations
 * Stage S6: Intermediate Conversations
 * Stage S7: Advanced Dialogues
 */

import type { Exercise, Lesson, Unit, CourseNode } from './types';

export type SpeakingDialect = 'msa' | 'egyptian';

// ─── Egyptian Dialect Vocabulary Overrides ──────────────────
// When Egyptian is selected, these replace the MSA equivalents in S2/S4
const EGYPTIAN_OVERRIDES: Record<string, { ar: string; tr: string }> = {
    // Greetings (S2)
    'مرحبا': { ar: 'أهلاً', tr: 'AH-lan' },
    'صباح الخير': { ar: 'صباح الخير', tr: 'Sa-BAAH el-KHEIR' },
    'مساء الخير': { ar: 'مساء الخير', tr: 'me-SAA el-KHEIR' },
    'شكرا': { ar: 'شكراً', tr: 'SHUK-ran' },
    'عفوا': { ar: 'العفو', tr: 'el-AF-w' },
    'من فضلك': { ar: 'لو سمحت', tr: 'law sa-MAHT' },
    'كيف حالك': { ar: 'إزيك', tr: 'iz-ZAY-yak' },
    'الحمد لله': { ar: 'كويس الحمد لله', tr: 'KWAI-yes el-HAM-du lil-LAAH' },
    'مع السلامة': { ar: 'سلام', tr: 'sa-LAAM' },
    'إسمي': { ar: 'اسمي', tr: 'IS-mi' },
    // Daily Phrases (S4)
    'أريد ماء': { ar: 'عايز مَيَّة', tr: 'AA-yiz MAY-ya' },
    'أين الحمام': { ar: 'فين الحمام', tr: 'FEIN el-ham-MAAM' },
    'كم السعر': { ar: 'بكام ده', tr: 'be-KAAM da' },
    'لا أفهم': { ar: 'مش فاهم', tr: 'mish FAA-him' },
    'أتكلم عربي قليلا': { ar: 'باتكلم عربي شوية', tr: 'ba-at-KAL-lim a-ra-BI shu-WAY-ya' },
    'ماذا تريد': { ar: 'عايز إيه', tr: 'AA-yiz EIH' },
    'أين المطعم': { ar: 'فين المطعم', tr: 'FEIN el-MAT-am' },
    'هل تتكلم إنجليزي': { ar: 'بتتكلم إنجليزي', tr: 'be-tet-KAL-lim in-gli-ZI' },
    'أحتاج مساعدة': { ar: 'محتاج مساعدة', tr: 'meh-TAAG mu-SAA-da' },
    'هذا كثير': { ar: 'ده كتير', tr: 'DA ke-TEER' },
    'الحساب من فضلك': { ar: 'الحساب لو سمحت', tr: 'el-he-SAAB law sa-MAHT' },
    'أنا من': { ar: 'أنا من', tr: 'A-na min' },
};

function applyDialect(phrase: { ar: string; tr: string; en: string }, dialect: SpeakingDialect): { ar: string; tr: string; en: string } {
    if (dialect !== 'egyptian') return phrase;
    const override = EGYPTIAN_OVERRIDES[phrase.ar];
    if (override) {
        return { ...phrase, ar: override.ar, tr: override.tr };
    }
    return phrase;
}

// ─── Helpers ───────────────────────────────────────────────
let _exId = 8000;
function eid(prefix: string) { return `${prefix}-${++_exId}`; }

function makeListenRepeat(
    nodeId: string,
    arabic: string,
    transliteration: string,
    english: string,
    soundFocus?: string,
    explanation?: string
): Exercise {
    return {
        id: eid(nodeId),
        type: 'listen_repeat',
        prompt: 'Listen, then say it out loud',
        correctAnswer: arabic,
        expectedSpeech: arabic,
        transliteration,
        hint: english,
        choices: [],
        soundFocus,
        explanation,
    };
}

function makePronunciationDrill(
    nodeId: string,
    sound: string,
    arabic: string,
    transliteration: string,
    english: string,
    explanation: string
): Exercise {
    return {
        id: eid(nodeId),
        type: 'pronunciation_drill',
        prompt: `Focus on the ${sound} sound`,
        correctAnswer: arabic,
        expectedSpeech: arabic,
        transliteration,
        hint: english,
        choices: [],
        soundFocus: sound,
        explanation,
    };
}

function makeSpeakTranslation(
    nodeId: string,
    english: string,
    arabic: string,
    transliteration: string,
    explanation?: string
): Exercise {
    return {
        id: eid(nodeId),
        type: 'speak_translation',
        prompt: `Say this in Arabic:`,
        correctAnswer: arabic,
        expectedSpeech: arabic,
        transliteration,
        hint: english,
        choices: [],
        explanation,
    };
}

function makeListenRespond(
    nodeId: string,
    _questionArabic: string,
    answerArabic: string,
    answerTransliteration: string,
    questionEnglish: string,
    answerEnglish: string
): Exercise {
    return {
        id: eid(nodeId),
        type: 'listen_respond',
        prompt: `Listen to the question and answer in Arabic. "${questionEnglish}"`,
        correctAnswer: answerArabic,
        expectedSpeech: answerArabic,
        transliteration: answerTransliteration,
        hint: `Answer: ${answerEnglish}`,
        choices: [],
    };
}

function makeIntro(nodeId: string, text: string): Exercise {
    return {
        id: eid(nodeId),
        type: 'introduction',
        prompt: text,
        correctAnswer: '',
        choices: [],
    };
}

function makeSpeakingNode(id: string, title: string, lessons: Lesson[]): CourseNode {
    return {
        id,
        title,
        description: `Speaking: ${title}`,
        type: 'lesson',
        status: 'locked',
        totalRounds: lessons.length,
        completedRounds: 0,
        lessons,
    };
}

// ═══════════════════════════════════════════════════════════
// STAGE S1: Arabic Sounds
// ═══════════════════════════════════════════════════════════

const S1_SOUNDS = [
    { letter: 'ا', name: 'Alif', sound: 'aa', tip: 'A long "aah" sound, like "father".' },
    { letter: 'ب', name: 'Baa', sound: 'ba', tip: 'Like English "b" in "baby".' },
    { letter: 'ت', name: 'Taa', sound: 'ta', tip: 'Like English "t" in "table".' },
    { letter: 'ث', name: 'Thaa', sound: 'tha', tip: 'Like "th" in "think" — tongue between teeth.' },
    { letter: 'ج', name: 'Jeem', sound: 'ja', tip: 'Like "j" in "job".' },
    { letter: 'ح', name: 'Haa', sound: 'Ha', tip: 'A deep, breathy "h" from the throat. NOT like English "h".' },
    { letter: 'خ', name: 'Khaa', sound: 'kha', tip: 'Like the "ch" in Scottish "loch" — back of throat.' },
    { letter: 'د', name: 'Daal', sound: 'da', tip: 'Like English "d" in "door".' },
    { letter: 'ذ', name: 'Dhaal', sound: 'dha', tip: 'Like "th" in "this" — voiced, tongue between teeth.' },
    { letter: 'ر', name: 'Raa', sound: 'ra', tip: 'A rolled/trilled "r" — tongue taps the roof of mouth.' },
    { letter: 'ز', name: 'Zaay', sound: 'za', tip: 'Like English "z" in "zoo".' },
    { letter: 'س', name: 'Seen', sound: 'sa', tip: 'Like English "s" in "sun".' },
    { letter: 'ش', name: 'Sheen', sound: 'sha', tip: 'Like English "sh" in "ship".' },
    { letter: 'ص', name: 'Saad', sound: 'Sa', tip: 'An emphatic "s" — tongue pressed down, heavy sound.' },
    { letter: 'ض', name: 'Daad', sound: 'Da', tip: 'An emphatic "d" — unique to Arabic! Heavy and deep.' },
    { letter: 'ط', name: 'Taa', sound: 'Ta', tip: 'An emphatic "t" — heavier and deeper than regular ت.' },
    { letter: 'ظ', name: 'Dhaa', sound: 'Dha', tip: 'An emphatic "th" — deep and heavy.' },
    { letter: 'ع', name: 'Ayn', sound: '\'a', tip: 'A constriction deep in the throat. No English equivalent — practice!' },
    { letter: 'غ', name: 'Ghayn', sound: 'gha', tip: 'Like gargling — voiced back of throat.' },
    { letter: 'ف', name: 'Faa', sound: 'fa', tip: 'Like English "f" in "fun".' },
    { letter: 'ق', name: 'Qaaf', sound: 'qa', tip: 'A "k" made deeper in throat — behind the uvula.' },
    { letter: 'ك', name: 'Kaaf', sound: 'ka', tip: 'Like English "k" in "kite".' },
    { letter: 'ل', name: 'Laam', sound: 'la', tip: 'Like English "l" in "lamp".' },
    { letter: 'م', name: 'Meem', sound: 'ma', tip: 'Like English "m" in "moon".' },
    { letter: 'ن', name: 'Noon', sound: 'na', tip: 'Like English "n" in "noon".' },
    { letter: 'ه', name: 'Haa', sound: 'ha', tip: 'A light "h" like English "h" in "hat".' },
    { letter: 'و', name: 'Waaw', sound: 'wa', tip: 'Like English "w" in "water".' },
    { letter: 'ي', name: 'Yaa', sound: 'ya', tip: 'Like English "y" in "yes".' },
];

// Group sounds into nodes of 4-5 letters
function makeS1Nodes(): CourseNode[] {
    const groups = [
        { id: 's1-n1', title: 'Alif to Thaa', letters: S1_SOUNDS.slice(0, 4) },
        { id: 's1-n2', title: 'Jeem to Dhaal', letters: S1_SOUNDS.slice(4, 9) },
        { id: 's1-n3', title: 'Raa to Sheen', letters: S1_SOUNDS.slice(9, 13) },
        { id: 's1-n4', title: 'Saad to Ayn', letters: S1_SOUNDS.slice(13, 18) },
        { id: 's1-n5', title: 'Ghayn to Noon', letters: S1_SOUNDS.slice(18, 25) },
        { id: 's1-n6', title: 'Haa to Yaa', letters: S1_SOUNDS.slice(25, 28) },
    ];

    return groups.map(g => {
        const exercises: Exercise[] = [];

        // Intro
        exercises.push(makeIntro(g.id, `**🔊 Arabic Sounds:** ${g.title}\n\nListen to each sound carefully, then repeat it out loud. Focus on correct pronunciation.`));

        // Listen & Repeat for each letter — always in alphabet order
        for (const l of g.letters) {
            exercises.push(makeListenRepeat(g.id, l.letter, l.sound, l.name, l.letter, l.tip));
        }

        // Add pronunciation drills for tricky sounds ONLY if there are actual drills to show
        const trickyLetters = g.letters.filter(l => ['ح', 'خ', 'ص', 'ض', 'ط', 'ظ', 'ع', 'غ', 'ق'].includes(l.letter));
        if (trickyLetters.length > 0) {
            exercises.push(makeIntro(g.id, `**🎯 Sound Discrimination**\n\nNow practice the tricky sounds. Pay close attention to the subtle differences.`));
            for (const l of trickyLetters) {
                exercises.push(makePronunciationDrill(g.id, l.letter, l.letter, l.sound, l.name, l.tip));
            }
        }

        return makeSpeakingNode(g.id, g.title, [{ id: `${g.id}-l`, title: g.title, description: `Sounds: ${g.title}`, exercises }]);
    });
}

// ═══════════════════════════════════════════════════════════
// STAGE S2: Basic Greetings
// ═══════════════════════════════════════════════════════════

function makeS2Nodes(dialect: SpeakingDialect = 'msa'): CourseNode[] {
    const greetingsBase = [
        { ar: 'مرحبا', tr: 'mar-HA-ba', en: 'Hello' },
        { ar: 'السلام عليكم', tr: 'as-sa-LAA-mu a-LAY-kum', en: 'Peace be upon you' },
        { ar: 'وعليكم السلام', tr: 'wa a-LAY-kum as-sa-LAAM', en: 'And upon you peace' },
        { ar: 'صباح الخير', tr: 'Sa-BAAH al-KHAYR', en: 'Good morning' },
        { ar: 'مساء الخير', tr: 'ma-SAA al-KHAYR', en: 'Good evening' },
        { ar: 'شكرا', tr: 'SHUK-ran', en: 'Thank you' },
        { ar: 'عفوا', tr: 'AF-wan', en: "You're welcome" },
        { ar: 'نعم', tr: 'NA-am', en: 'Yes' },
        { ar: 'لا', tr: 'laa', en: 'No' },
        { ar: 'من فضلك', tr: 'min FAD-lak', en: 'Please' },
        { ar: 'كيف حالك', tr: 'KAY-fa HAA-lak', en: 'How are you?' },
        { ar: 'الحمد لله', tr: 'al-HAM-du lil-LAAH', en: 'Praise God (I\'m well)' },
        { ar: 'مع السلامة', tr: 'ma-a as-sa-LAA-ma', en: 'Goodbye' },
        { ar: 'إسمي', tr: 'IS-mi', en: 'My name is' },
    ];
    const greetings = greetingsBase.map(g => applyDialect(g, dialect));

    const nodes: CourseNode[] = [];

    // Node 1: Hello & Peace
    const n1ex: Exercise[] = [
        makeIntro('s2-n1', '**👋 Basic Greetings**\n\nLearn how to say hello and greet people in Arabic. Listen carefully and repeat.'),
    ];
    for (const g of greetings.slice(0, 5)) {
        n1ex.push(makeListenRepeat('s2-n1', g.ar, g.tr, g.en));
    }
    // Now translate
    for (const g of greetings.slice(0, 3)) {
        n1ex.push(makeSpeakTranslation('s2-n1', g.en, g.ar, g.tr));
    }
    nodes.push(makeSpeakingNode('s2-n1', 'Hello & Greetings', [{ id: 's2-n1-l', title: 'Hello & Greetings', description: 'Learn greetings', exercises: n1ex }]));

    // Node 2: Polite Words
    const n2ex: Exercise[] = [
        makeIntro('s2-n2', '**🙏 Polite Words**\n\nLearn the essential polite words: thank you, please, yes, no.'),
    ];
    for (const g of greetings.slice(5, 10)) {
        n2ex.push(makeListenRepeat('s2-n2', g.ar, g.tr, g.en));
    }
    for (const g of greetings.slice(5, 8)) {
        n2ex.push(makeSpeakTranslation('s2-n2', g.en, g.ar, g.tr));
    }
    nodes.push(makeSpeakingNode('s2-n2', 'Polite Words', [{ id: 's2-n2-l', title: 'Polite Words', description: 'Learn polite phrases', exercises: n2ex }]));

    // Node 3: How Are You & Goodbye
    const n3ex: Exercise[] = [
        makeIntro('s2-n3', '**💬 How Are You?**\n\nLearn to ask how someone is doing, and how to say goodbye.'),
    ];
    for (const g of greetings.slice(10, 14)) {
        n3ex.push(makeListenRepeat('s2-n3', g.ar, g.tr, g.en));
    }
    // Listen & respond: someone asks how you are → respond
    n3ex.push(makeListenRespond('s2-n3', 'كيف حالك', 'الحمد لله', 'al-HAM-du lil-LAAH', 'How are you?', 'Praise God (I\'m well)'));
    nodes.push(makeSpeakingNode('s2-n3', 'How Are You?', [{ id: 's2-n3-l', title: 'How Are You', description: 'Practice situational responses', exercises: n3ex }]));

    return nodes;
}

// ═══════════════════════════════════════════════════════════
// STAGE S3: Common Words
// ═══════════════════════════════════════════════════════════

function makeS3Nodes(): CourseNode[] {
    const numbers = [
        { ar: 'واحد', tr: 'WAA-hid', en: 'One (1)' },
        { ar: 'اثنان', tr: 'ith-NAAN', en: 'Two (2)' },
        { ar: 'ثلاثة', tr: 'tha-LAA-tha', en: 'Three (3)' },
        { ar: 'أربعة', tr: 'ar-BA-a', en: 'Four (4)' },
        { ar: 'خمسة', tr: 'KHAM-sa', en: 'Five (5)' },
        { ar: 'ستة', tr: 'SIT-ta', en: 'Six (6)' },
        { ar: 'سبعة', tr: 'SAB-a', en: 'Seven (7)' },
        { ar: 'ثمانية', tr: 'tha-MAA-ni-ya', en: 'Eight (8)' },
        { ar: 'تسعة', tr: 'TIS-a', en: 'Nine (9)' },
        { ar: 'عشرة', tr: 'A-sha-ra', en: 'Ten (10)' },
    ];

    const family = [
        { ar: 'أب', tr: 'ab', en: 'Father' },
        { ar: 'أم', tr: 'umm', en: 'Mother' },
        { ar: 'أخ', tr: 'akh', en: 'Brother' },
        { ar: 'أخت', tr: 'ukht', en: 'Sister' },
        { ar: 'جد', tr: 'jadd', en: 'Grandfather' },
        { ar: 'جدة', tr: 'JAD-da', en: 'Grandmother' },
        { ar: 'ابن', tr: 'ibn', en: 'Son' },
        { ar: 'بنت', tr: 'bint', en: 'Daughter' },
    ];

    const colors = [
        { ar: 'أحمر', tr: 'AH-mar', en: 'Red' },
        { ar: 'أزرق', tr: 'AZ-raq', en: 'Blue' },
        { ar: 'أخضر', tr: 'AKH-Dar', en: 'Green' },
        { ar: 'أبيض', tr: 'AB-yaD', en: 'White' },
        { ar: 'أسود', tr: 'AS-wad', en: 'Black' },
        { ar: 'أصفر', tr: 'AS-far', en: 'Yellow' },
    ];

    const nodes: CourseNode[] = [];

    // Numbers 1-5
    const n1ex: Exercise[] = [makeIntro('s3-n1', '**🔢 Numbers 1–5**\n\nLearn to count in Arabic. Listen and repeat each number.')];
    for (const n of numbers.slice(0, 5)) {
        n1ex.push(makeListenRepeat('s3-n1', n.ar, n.tr, n.en));
    }
    for (const n of numbers.slice(0, 5)) {
        n1ex.push(makeSpeakTranslation('s3-n1', n.en, n.ar, n.tr));
    }
    nodes.push(makeSpeakingNode('s3-n1', 'Numbers 1–5', [{ id: 's3-n1-l', title: 'Numbers 1-5', description: 'Count to 5', exercises: n1ex }]));

    // Numbers 6-10
    const n2ex: Exercise[] = [makeIntro('s3-n2', '**🔢 Numbers 6–10**\n\nContinue counting. Focus on the tricky ع sound in سبعة and عشرة.')];
    for (const n of numbers.slice(5, 10)) {
        n2ex.push(makeListenRepeat('s3-n2', n.ar, n.tr, n.en));
    }
    for (const n of numbers.slice(5, 10)) {
        n2ex.push(makeSpeakTranslation('s3-n2', n.en, n.ar, n.tr));
    }
    nodes.push(makeSpeakingNode('s3-n2', 'Numbers 6–10', [{ id: 's3-n2-l', title: 'Numbers 6-10', description: 'Count to 10', exercises: n2ex }]));

    // Family
    const n3ex: Exercise[] = [makeIntro('s3-n3', '**👨‍👩‍👧‍👦 Family Members**\n\nLearn to say family words in Arabic.')];
    for (const f of family) {
        n3ex.push(makeListenRepeat('s3-n3', f.ar, f.tr, f.en));
    }
    for (const f of family.slice(0, 4)) {
        n3ex.push(makeSpeakTranslation('s3-n3', f.en, f.ar, f.tr));
    }
    nodes.push(makeSpeakingNode('s3-n3', 'Family', [{ id: 's3-n3-l', title: 'Family', description: 'Family words', exercises: n3ex }]));

    // Colors
    const n4ex: Exercise[] = [makeIntro('s3-n4', '**🌈 Colors**\n\nLearn colors in Arabic. Pay attention to the emphatic sounds in some colors.')];
    for (const c of colors) {
        n4ex.push(makeListenRepeat('s3-n4', c.ar, c.tr, c.en));
    }
    for (const c of colors.slice(0, 4)) {
        n4ex.push(makeSpeakTranslation('s3-n4', c.en, c.ar, c.tr));
    }
    nodes.push(makeSpeakingNode('s3-n4', 'Colors', [{ id: 's3-n4-l', title: 'Colors', description: 'Color words', exercises: n4ex }]));

    return nodes;
}

// ═══════════════════════════════════════════════════════════
// STAGE S4: Daily Phrases
// ═══════════════════════════════════════════════════════════

function makeS4Nodes(dialect: SpeakingDialect = 'msa'): CourseNode[] {
    const phrasesBase = [
        { ar: 'أريد ماء', tr: 'u-REE-du MAA', en: 'I want water' },
        { ar: 'أين الحمام', tr: 'AY-na al-ham-MAAM', en: 'Where is the bathroom?' },
        { ar: 'كم السعر', tr: 'kam as-SI-r', en: 'How much is it?' },
        { ar: 'لا أفهم', tr: 'laa AF-ham', en: 'I don\'t understand' },
        { ar: 'أتكلم عربي قليلا', tr: 'a-ta-KAL-lam a-ra-BEE qa-LEE-lan', en: 'I speak a little Arabic' },
        { ar: 'ماذا تريد', tr: 'MAA-dha tu-REED', en: 'What do you want?' },
        { ar: 'أين المطعم', tr: 'AY-na al-MAT-am', en: 'Where is the restaurant?' },
        { ar: 'هل تتكلم إنجليزي', tr: 'hal ta-ta-KAL-lam in-gli-ZEE', en: 'Do you speak English?' },
        { ar: 'أحتاج مساعدة', tr: 'ah-TAAJ mu-SAA-a-da', en: 'I need help' },
        { ar: 'هذا كثير', tr: 'HAA-dha ka-THEER', en: 'That\'s a lot / too much' },
        { ar: 'الحساب من فضلك', tr: 'al-hi-SAAB min FAD-lak', en: 'The bill, please' },
        { ar: 'أنا من', tr: 'A-na min', en: 'I am from...' },
    ];
    const phrases = phrasesBase.map(p => applyDialect(p, dialect));

    const nodes: CourseNode[] = [];

    // Needs & Wants
    const n1ex: Exercise[] = [makeIntro('s4-n1', '**💬 Expressing Needs**\n\nLearn to say what you want and need. These phrases will get you through any situation.')];
    for (const p of phrases.slice(0, 4)) {
        n1ex.push(makeListenRepeat('s4-n1', p.ar, p.tr, p.en));
    }
    for (const p of phrases.slice(0, 4)) {
        n1ex.push(makeSpeakTranslation('s4-n1', p.en, p.ar, p.tr));
    }
    nodes.push(makeSpeakingNode('s4-n1', 'Expressing Needs', [{ id: 's4-n1-l', title: 'Needs', description: 'Say what you need', exercises: n1ex }]));

    // Questions
    const n2ex: Exercise[] = [makeIntro('s4-n2', '**❓ Asking Questions**\n\nLearn to ask common questions in Arabic.')];
    for (const p of phrases.slice(4, 8)) {
        n2ex.push(makeListenRepeat('s4-n2', p.ar, p.tr, p.en));
    }
    for (const p of phrases.slice(4, 8)) {
        n2ex.push(makeSpeakTranslation('s4-n2', p.en, p.ar, p.tr));
    }
    // Listen & respond practice
    n2ex.push(makeListenRespond('s4-n2', 'ماذا تريد', 'أريد ماء', 'u-REE-du MAA', 'What do you want?', 'I want water'));
    nodes.push(makeSpeakingNode('s4-n2', 'Asking Questions', [{ id: 's4-n2-l', title: 'Questions', description: 'Ask questions', exercises: n2ex }]));

    // Survival Phrases
    const n3ex: Exercise[] = [makeIntro('s4-n3', '**🆘 Survival Phrases**\n\nPhrases you must know for getting around.')];
    for (const p of phrases.slice(8, 12)) {
        n3ex.push(makeListenRepeat('s4-n3', p.ar, p.tr, p.en));
    }
    for (const p of phrases.slice(8, 12)) {
        n3ex.push(makeSpeakTranslation('s4-n3', p.en, p.ar, p.tr));
    }
    nodes.push(makeSpeakingNode('s4-n3', 'Survival Phrases', [{ id: 's4-n3-l', title: 'Survival', description: 'Essential phrases', exercises: n3ex }]));

    return nodes;
}

// ═══════════════════════════════════════════════════════════
// STAGE S5: Simple Conversations
// ═══════════════════════════════════════════════════════════

function makeS5Nodes(): CourseNode[] {
    const nodes: CourseNode[] = [];

    // Coffee shop conversation with mic input
    const n1ex: Exercise[] = [
        makeIntro('s5-n1', '**☕ At the Café**\n\nPractice ordering at a café. You\'ll hear the waiter and speak your responses.'),
        makeListenRepeat('s5-n1', 'أريد فنجان قهوة من فضلك', 'u-REE-du fin-JAAN QAH-wa min FAD-lak', 'I want a cup of coffee, please'),
        makeListenRepeat('s5-n1', 'هل تريد سكر', 'hal tu-REED SUK-kar', 'Do you want sugar?'),
        makeListenRepeat('s5-n1', 'نعم قليلا من فضلك', 'NA-am qa-LEE-lan min FAD-lak', 'Yes, a little please'),
        makeListenRespond('s5-n1', 'ماذا تريد أن تشرب', 'أريد شاي من فضلك', 'u-REE-du SHAAY min FAD-lak', 'What would you like to drink?', 'I want tea, please'),
        makeListenRespond('s5-n1', 'هل تريد سكر', 'لا شكرا', 'laa SHUK-ran', 'Do you want sugar?', 'No thank you'),
        makeSpeakTranslation('s5-n1', 'The bill, please', 'الحساب من فضلك', 'al-hi-SAAB min FAD-lak'),
    ];
    nodes.push(makeSpeakingNode('s5-n1', 'At the Café', [{ id: 's5-n1-l', title: 'At the Café', description: 'Practice café conversation', exercises: n1ex }]));

    // Taxi
    const n2ex: Exercise[] = [
        makeIntro('s5-n2', '**🚕 Taking a Taxi**\n\nLearn to give directions and negotiate fares.'),
        makeListenRepeat('s5-n2', 'أريد أن أذهب إلى المطار', 'u-REE-du an ADH-hab i-la al-ma-TAAR', 'I want to go to the airport'),
        makeListenRepeat('s5-n2', 'كم الأجرة', 'kam al-UJ-ra', 'How much is the fare?'),
        makeListenRepeat('s5-n2', 'هنا من فضلك', 'HU-na min FAD-lak', 'Here, please (stop here)'),
        makeListenRespond('s5-n2', 'إلى أين', 'إلى الفندق', 'i-la al-FUN-duq', 'Where to?', 'To the hotel'),
        makeSpeakTranslation('s5-n2', 'I want to go to the airport', 'أريد أن أذهب إلى المطار', 'u-REE-du an ADH-hab i-la al-ma-TAAR'),
    ];
    nodes.push(makeSpeakingNode('s5-n2', 'Taking a Taxi', [{ id: 's5-n2-l', title: 'Taxi', description: 'Taxi conversation', exercises: n2ex }]));

    // Shopping
    const n3ex: Exercise[] = [
        makeIntro('s5-n3', '**🛍 Shopping**\n\nLearn to shop and negotiate prices in Arabic.'),
        makeListenRepeat('s5-n3', 'كم هذا', 'kam HAA-dha', 'How much is this?'),
        makeListenRepeat('s5-n3', 'غالي جدا', 'GHAA-li JID-dan', 'Too expensive!'),
        makeListenRepeat('s5-n3', 'هل عندك خصم', 'hal IN-dak KHASM', 'Do you have a discount?'),
        makeListenRepeat('s5-n3', 'سآخذ هذا', 'sa-AA-khudh HAA-dha', 'I\'ll take this'),
        makeListenRespond('s5-n3', 'هل تريد شيء آخر', 'لا شكرا هذا فقط', 'laa SHUK-ran HAA-dha FA-qaT', 'Do you want anything else?', 'No thanks, just this'),
        makeSpeakTranslation('s5-n3', 'How much is this?', 'كم هذا', 'kam HAA-dha'),
    ];
    nodes.push(makeSpeakingNode('s5-n3', 'Shopping', [{ id: 's5-n3-l', title: 'Shopping', description: 'Shopping phrases', exercises: n3ex }]));

    return nodes;
}

// ═══════════════════════════════════════════════════════════
// STAGE S6: Intermediate Conversations
// ═══════════════════════════════════════════════════════════

function makeS6Nodes(): CourseNode[] {
    const nodes: CourseNode[] = [];

    // Directions
    const n1ex: Exercise[] = [
        makeIntro('s6-n1', '**🧭 Giving Directions**\n\nLearn to ask for and give directions.'),
        makeListenRepeat('s6-n1', 'اذهب إلى اليمين', 'IDH-hab i-la al-ya-MEEN', 'Go right'),
        makeListenRepeat('s6-n1', 'اذهب إلى اليسار', 'IDH-hab i-la al-ya-SAAR', 'Go left'),
        makeListenRepeat('s6-n1', 'أكمل على طول', 'AK-mil a-la TOOL', 'Go straight'),
        makeListenRepeat('s6-n1', 'أين أقرب صيدلية', 'AY-na AQ-rab Say-da-LEE-ya', 'Where is the nearest pharmacy?'),
        makeListenRespond('s6-n1', 'أين المحطة', 'اذهب إلى اليمين ثم على طول', 'IDH-hab i-la al-ya-MEEN thum-ma a-la TOOL', 'Where is the station?', 'Go right then straight'),
    ];
    nodes.push(makeSpeakingNode('s6-n1', 'Directions', [{ id: 's6-n1-l', title: 'Directions', description: 'Direction vocabulary', exercises: n1ex }]));

    // Restaurant
    const n2ex: Exercise[] = [
        makeIntro('s6-n2', '**🍽 At the Restaurant**\n\nOrder food and interact with waiters confidently.'),
        makeListenRepeat('s6-n2', 'طاولة لشخصين من فضلك', 'TAA-wi-la li-shakh-SAYN min FAD-lak', 'A table for two, please'),
        makeListenRepeat('s6-n2', 'القائمة من فضلك', 'al-QAA-i-ma min FAD-lak', 'The menu, please'),
        makeListenRepeat('s6-n2', 'أريد دجاج مشوي', 'u-REE-du da-JAAJ mash-WEE', 'I want grilled chicken'),
        makeListenRepeat('s6-n2', 'هل عندكم أكل حلال', 'hal IN-da-kum AKL ha-LAAL', 'Do you have halal food?'),
        makeListenRespond('s6-n2', 'ماذا تريد أن تأكل', 'أريد سمك مشوي', 'u-REE-du SA-mak mash-WEE', 'What would you like to eat?', 'I want grilled fish'),
        makeSpeakTranslation('s6-n2', 'The bill, please', 'الحساب من فضلك', 'al-hi-SAAB min FAD-lak'),
    ];
    nodes.push(makeSpeakingNode('s6-n2', 'At the Restaurant', [{ id: 's6-n2-l', title: 'Restaurant', description: 'Restaurant conversation', exercises: n2ex }]));

    // Hotel
    const n3ex: Exercise[] = [
        makeIntro('s6-n3', '**🏨 At the Hotel**\n\nCheck in, ask about rooms, and handle hotel situations.'),
        makeListenRepeat('s6-n3', 'عندي حجز', 'IN-di HAJZ', 'I have a reservation'),
        makeListenRepeat('s6-n3', 'أريد غرفة لليلتين', 'u-REE-du GHUR-fa li-lay-LA-tayn', 'I want a room for two nights'),
        makeListenRepeat('s6-n3', 'هل يوجد واي فاي', 'hal yoo-JAD waay faay', 'Is there WiFi?'),
        makeListenRepeat('s6-n3', 'الفطور في أي ساعة', 'al-fu-TOOR fee AY SAA-a', 'What time is breakfast?'),
        makeListenRespond('s6-n3', 'هل تريد غرفة مفردة أو مزدوجة', 'غرفة مزدوجة من فضلك', 'GHUR-fa muz-DAW-ja min FAD-lak', 'Single or double room?', 'Double room please'),
    ];
    nodes.push(makeSpeakingNode('s6-n3', 'At the Hotel', [{ id: 's6-n3-l', title: 'Hotel', description: 'Hotel interactions', exercises: n3ex }]));

    return nodes;
}

// ═══════════════════════════════════════════════════════════
// NEW AI GATES (STAGE BOTTLENECKS)
// ═══════════════════════════════════════════════════════════

function makeYasmineArrivalGate(): CourseNode {
    return {
        id: 's1-gate',
        title: 'Arrival Gate (AI Check)',
        description: 'Prove you can survive arrival at Cairo Airport.',
        type: 'test',
        status: 'locked',
        isGate: true,
        totalRounds: 1,
        completedRounds: 0,
        lessons: [{
            id: 's1-gate-l1',
            title: 'Airport Customs',
            description: 'Can you greet the agent, say yes/no, and depart?',
            exercises: [
                makeIntro('s1-gate', '**🛂 Customs Check (AI Test)**\n\nWelcome to Egypt. Answer the border agent\'s questions using only your Arabic survival phrases to pass into Stage 2.'),
                {
                    id: eid('s1-gate-chat'),
                    type: 'roleplay_chat',
                    prompt: 'Complete the interaction block without using English.',
                    correctAnswer: '',
                    choices: [],
                    conversationTurns: [
                        { speaker: 'ai', text: { msa: 'مرحبا', egyptian: 'أهلاً بيك، إنت من فين؟', english: 'Welcome, where are you from?' } },
                        { speaker: 'user', text: { msa: 'أنا من', egyptian: 'أنا من أمريكا', english: 'I am from America' } },
                        { speaker: 'ai', text: { msa: 'هل تتكلم عربي', egyptian: 'تتكلم عربي؟', english: 'Do you speak Arabic?' } },
                        { speaker: 'user', text: { msa: 'نعم', egyptian: 'نعم قليلا', english: 'Yes, a little' } },
                        { speaker: 'ai', text: { msa: 'شكرا', egyptian: 'شكرا، مع السلامة', english: 'Thank you, goodbye' } },
                        { speaker: 'user', text: { msa: 'مع السلامة', egyptian: 'مع السلامة', english: 'Goodbye' } },
                    ]
                }
            ]
        }]
    };
}

function makeCafeGate(): CourseNode {
    return {
        id: 's2-gate',
        title: 'Cafe Scene (AI Check)',
        description: 'Prove you can order food and navigate transactions.',
        type: 'test',
        status: 'locked',
        isGate: true,
        totalRounds: 1,
        completedRounds: 0,
        lessons: [{
            id: 's2-gate-l1',
            title: 'Ordering Coffee',
            description: 'Use your verb conjugation to handle a waiter.',
            exercises: [
                makeIntro('s2-gate', '**☕ Cafe Stress Test**\n\nThe waiter doesn\'t speak English. Order your drink and handle the interaction.'),
                {
                    id: eid('s2-gate-chat'),
                    type: 'roleplay_chat',
                    prompt: 'Roleplay: Order coffee and ask for the bill.',
                    correctAnswer: '',
                    choices: [],
                    conversationTurns: [
                        { speaker: 'ai', text: { msa: 'ماذا تريد', egyptian: 'تطلب إيه؟', english: 'What would you like to order?' } },
                        { speaker: 'user', text: { msa: 'أريد قهوة', egyptian: 'أريد قهوة من فضلك', english: 'I want coffee, please' } },
                        { speaker: 'ai', text: { msa: 'تفضل', egyptian: 'حاضر، اتفضل', english: 'Sure, here you go' } },
                        { speaker: 'user', text: { msa: 'شكرا، الحساب', egyptian: 'شكرا، الحساب من فضلك', english: 'Thank you, the bill please' } }
                    ]
                }
            ]
        }]
    };
}

function makeInterrogationGate(): CourseNode {
    return {
        id: 's3-gate',
        title: 'Interrogation (AI Check)',
        description: 'Prove you can understand questions and give directions.',
        type: 'test',
        status: 'locked',
        isGate: true,
        totalRounds: 1,
        completedRounds: 0,
        lessons: [{
            id: 's3-gate-l1',
            title: 'Lost in Cairo',
            description: 'A local is asking you questions.',
            exercises: [
                makeIntro('s3-gate', '**🧭 Interrogation**\n\nHandle quick questions about yourself and where things are.'),
                {
                    id: eid('s3-gate-chat'),
                    type: 'roleplay_chat',
                    prompt: 'Roleplay: Give directions and answer questions.',
                    correctAnswer: '',
                    choices: [],
                    conversationTurns: [
                        { speaker: 'ai', text: { msa: 'أين المطعم', egyptian: 'المطعم فين؟', english: 'Where is the restaurant?' } },
                        { speaker: 'user', text: { msa: 'على اليمين', egyptian: 'على اليمين', english: 'On the right' } },
                        { speaker: 'ai', text: { msa: 'شكرا لك', egyptian: 'شكرا', english: 'Thank you' } },
                    ]
                }
            ]
        }]
    };
}


// ═══════════════════════════════════════════════════════════
// BUILD THE NEW MASTERY STAGES (PHASE 2 ARCHITECTURE)
// ═══════════════════════════════════════════════════════════

export function buildSpeakingUnits(dialect: SpeakingDialect = 'msa'): Unit[] {
    // Reset exercise IDs for deterministic generation
    _exId = 8000;
    return [
        {
            id: 101,
            title: 'Stage 1: Acoustic Foundation',
            description: 'Master Arabic Sounds & Survival Phrases',
            color: '#7C3AED',
            path: 'speaking' as const,
            nodes: [
                ...makeS1Nodes(), // Sounds (universal)
                ...makeS2Nodes(dialect), // Greetings (dialect-aware)
                ...makeS4Nodes(dialect), // Survival & Needs (dialect-aware)
                makeYasmineArrivalGate()
            ],
        },
        {
            id: 102,
            title: 'Stage 2: Action Core',
            description: 'Verbs, Transactions & Coffee Shops',
            color: '#0EA5E9',
            path: 'speaking' as const,
            nodes: [
                // We map S5 nodes into Action Core per the Phase 2 spec
                ...makeS5Nodes(),
                makeCafeGate()
            ],
        },
        {
            id: 103,
            title: 'Stage 3: Social Fabric',
            description: 'Family, Directions, & Moving through Time',
            color: '#10B981',
            path: 'speaking' as const,
            nodes: [
                ...makeS3Nodes(), // Family and Colors and Numbers
                ...makeS6Nodes(), // Directions and Hotels
                makeInterrogationGate()
            ],
        }
    ];
}
