import type { Course, CourseNode, Lesson, Exercise } from './types';

// ─── Letter Data ───────────────────────────────────────────

interface LetterInfo {
    letter: string;
    name: string;
    sound: string;
}

const ALL_LETTERS: LetterInfo[] = [
    { letter: 'ا', name: 'Alif', sound: '/a/' },
    { letter: 'ب', name: 'Baa', sound: '/b/' },
    { letter: 'ت', name: 'Taa', sound: '/t/' },
    { letter: 'ث', name: 'Thaa', sound: '/th/' },
    { letter: 'ج', name: 'Jeem', sound: '/j/' },
    { letter: 'ح', name: 'Haa', sound: '/ħ/' },
    { letter: 'خ', name: 'Khaa', sound: '/kh/' },
    { letter: 'د', name: 'Daal', sound: '/d/' },
    { letter: 'ذ', name: 'Dhaal', sound: '/dh/' },
    { letter: 'ر', name: 'Raa', sound: '/r/' },
    { letter: 'ز', name: 'Zaay', sound: '/z/' },
    { letter: 'س', name: 'Seen', sound: '/s/' },
    { letter: 'ش', name: 'Sheen', sound: '/sh/' },
    { letter: 'ص', name: 'Saad', sound: '/sˤ/' },
    { letter: 'ض', name: 'Daad', sound: '/dˤ/' },
    { letter: 'ط', name: 'Taa\u02BE', sound: '/tˤ/' },
    { letter: 'ظ', name: 'Dhaa\u02BE', sound: '/ðˤ/' },
    { letter: 'ع', name: 'Ayn', sound: '/ʕ/' },
    { letter: 'غ', name: 'Ghayn', sound: '/ɣ/' },
    { letter: 'ف', name: 'Faa', sound: '/f/' },
    { letter: 'ق', name: 'Qaaf', sound: '/q/' },
    { letter: 'ك', name: 'Kaaf', sound: '/k/' },
    { letter: 'ل', name: 'Laam', sound: '/l/' },
    { letter: 'م', name: 'Meem', sound: '/m/' },
    { letter: 'ن', name: 'Noon', sound: '/n/' },
    { letter: 'ه', name: 'Haa\u02BE', sound: '/h/' },
    { letter: 'و', name: 'Waaw', sound: '/w/' },
    { letter: 'ي', name: 'Yaa', sound: '/y/' },
];

// ─── CONFUSABLE / TRAP GROUPS ──────────────────────────────
// Letters that look similar (same base shape, different dots)
// or sound similar — used to create "traps" as distractors

const VISUAL_TRAPS: Record<string, string[]> = {
    'ب': ['ت', 'ث', 'ن', 'ي'],   // dots-below vs dots-above
    'ت': ['ب', 'ث', 'ن'],
    'ث': ['ب', 'ت', 'ن'],
    'ج': ['ح', 'خ'],
    'ح': ['ج', 'خ'],
    'خ': ['ج', 'ح'],
    'د': ['ذ'],
    'ذ': ['د'],
    'ر': ['ز', 'و'],
    'ز': ['ر', 'و'],
    'س': ['ش'],
    'ش': ['س'],
    'ص': ['ض'],
    'ض': ['ص'],
    'ط': ['ظ'],
    'ظ': ['ط'],
    'ع': ['غ'],
    'غ': ['ع'],
    'ف': ['ق'],
    'ق': ['ف'],
};

const SOUND_TRAPS: Record<string, string[]> = {
    'ت': ['ط'],       // both /t/-like
    'ط': ['ت'],
    'ث': ['ذ', 'ظ'],  // all th-like
    'ذ': ['ث', 'ظ'],
    'ظ': ['ث', 'ذ'],
    'ح': ['ه'],       // both h-like
    'ه': ['ح'],
    'س': ['ص'],       // both s-like
    'ص': ['س'],
    'د': ['ض'],       // both d-like
    'ض': ['د'],
    'ك': ['ق'],       // both k-like
    'ق': ['ك'],
};

// 7 groups × 4 letters = 28. Grouped by visual similarity for max trap potential.
const NODE_GROUPS: LetterInfo[][] = [
    ALL_LETTERS.filter(l => ['ا', 'ب', 'ت', 'ث'].includes(l.letter)),  // dotted trio + alif
    ALL_LETTERS.filter(l => ['ج', 'ح', 'خ', 'د'].includes(l.letter)),  // ج-family + د
    ALL_LETTERS.filter(l => ['ذ', 'ر', 'ز', 'س'].includes(l.letter)),  // ذ + ر/ز pair + س
    ALL_LETTERS.filter(l => ['ش', 'ص', 'ض', 'ط'].includes(l.letter)),  // ش + ص/ض pair + ط
    ALL_LETTERS.filter(l => ['ظ', 'ع', 'غ', 'ف'].includes(l.letter)),  // ظ + ع/غ pair + ف
    ALL_LETTERS.filter(l => ['ق', 'ك', 'ل', 'م'].includes(l.letter)),  // ق/ف-like + ل/م
    ALL_LETTERS.filter(l => ['ن', 'ه', 'و', 'ي'].includes(l.letter)),  // remaining 4
];

const LETTER_DESCRIPTIONS: Record<string, string> = {
    'ب': '1 dot BELOW',
    'ت': '2 dots ABOVE',
    'ث': '3 dots ABOVE',
    'ن': '1 dot ABOVE',
    'ي': '2 dots BELOW',
    'ج': '1 dot inside/below',
    'ح': 'NO dots',
    'خ': '1 dot ABOVE',
    'د': 'NO dots',
    'ذ': '1 dot ABOVE',
    'ر': 'NO dots',
    'ز': '1 dot ABOVE',
    'س': 'NO dots',
    'ش': '3 dots ABOVE',
    'ص': 'NO dots',
    'ض': '1 dot ABOVE',
    'ط': 'NO dots',
    'ظ': '1 dot ABOVE',
    'ع': 'NO dots',
    'غ': '1 dot ABOVE',
    'ف': '1 dot ABOVE',
    'ق': '2 dots ABOVE',
    'ك': 'an S-shape inside',
    'ل': 'a hook dipping below the line',
    'م': 'a circle with a tail',
    'ه': 'circles inside',
    'و': 'a loop on the line',
    'ا': 'a straight vertical line',
};

// ─── Helpers ───────────────────────────────────────────────

function getPreviousLetters(nodeIndex: number): LetterInfo[] {
    const prev: LetterInfo[] = [];
    for (let i = 0; i < nodeIndex && i < NODE_GROUPS.length; i++) {
        prev.push(...NODE_GROUPS[i]);
    }
    return prev;
}

function shuffle<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function pick<T>(arr: T[], n: number): T[] {
    return shuffle(arr).slice(0, n);
}

// ═══════════════════════════════════════════════════════════
// DUOLINGO-STYLE REPETITION SYSTEM
// ═══════════════════════════════════════════════════════════

/**
 * Global storage for learned content to enable cross-unit repetition
 */
const LEARNED_CONTENT = {
    letters: [] as LetterInfo[],
    vowels: [] as any[],
    words: [] as any[],
    sentences: [] as any[],
};

/**
 * Generate letter refresher exercises from previously learned letters
 * Used to inject old content into new lessons (Duolingo-style)
 */
function makeLetterRefreshers(count: number, nodeId: string): Exercise[] {
    if (LEARNED_CONTENT.letters.length === 0) return [];
    
    const refreshers: Exercise[] = [];
    const oldLetters = pick(LEARNED_CONTENT.letters, Math.min(count, LEARNED_CONTENT.letters.length));
    const letterPool = ALL_LETTERS.map(l => l.letter);
    
    for (const l of oldLetters) {
        // Alternate between different exercise types
        if (Math.random() > 0.5) {
            refreshers.push({
                id: nextId(`${nodeId}-letter-refresh`),
                type: 'tap_letter',
                prompt: `Refresher: Tap "${l.name}"`,
                correctAnswer: l.letter,
                choices: makeChoices(l.letter, letterPool),
            });
        } else {
            refreshers.push({
                id: nextId(`${nodeId}-letter-refresh`),
                type: 'hear_choose',
                prompt: `Refresher: Listen and select`,
                promptAudio: l.letter + 'َ',
                correctAnswer: l.letter,
                choices: makeChoices(l.letter, letterPool),
            });
        }
    }
    
    return refreshers;
}

/**
 * Generate vowel refresher exercises
 */
function makeVowelRefreshers(count: number, nodeId: string, letters: any[]): Exercise[] {
    if (LEARNED_CONTENT.vowels.length === 0 || letters.length === 0) return [];
    
    const refreshers: Exercise[] = [];
    const oldVowels = pick(LEARNED_CONTENT.vowels, Math.min(count, LEARNED_CONTENT.vowels.length));
    
    for (const v of oldVowels) {
        const l = letters[Math.floor(Math.random() * letters.length)];
        const combo = l.letter + v.mark;
        const syllable = l.name.toLowerCase().slice(0, 2) + v.translit;
        
        refreshers.push({
            id: nextId(`${nodeId}-vowel-refresh`),
            type: 'multiple_choice',
            prompt: `Refresher: What sound?`,
            correctAnswer: syllable,
            choices: shuffle([syllable, ...LEARNED_CONTENT.vowels.filter(vv => vv.name !== v.name).map(vv => l.name.toLowerCase().slice(0, 2) + vv.translit)]),
            hint: combo,
        });
    }
    
    return refreshers;
}

/**
 * Generate word refresher exercises
 */
function makeWordRefreshers(count: number, nodeId: string): Exercise[] {
    if (LEARNED_CONTENT.words.length === 0) return [];
    
    const refreshers: Exercise[] = [];
    const oldWords = pick(LEARNED_CONTENT.words, Math.min(count, LEARNED_CONTENT.words.length));
    
    for (const w of oldWords) {
        // Alternate between hearing and meaning exercises
        if (Math.random() > 0.5) {
            refreshers.push({
                id: nextId(`${nodeId}-word-refresh`),
                type: 'hear_choose',
                prompt: `Refresher: Listen and select`,
                promptAudio: w.audio,
                correctAnswer: w.arabic,
                choices: shuffle([w.arabic, ...pick(LEARNED_CONTENT.words.filter(ww => ww.arabic !== w.arabic).map(ww => ww.arabic), 3)]),
            });
        } else {
            refreshers.push({
                id: nextId(`${nodeId}-word-refresh`),
                type: 'multiple_choice',
                prompt: `Refresher: What does this mean?`,
                correctAnswer: w.english,
                choices: shuffle([w.english, ...pick(LEARNED_CONTENT.words.filter(ww => ww.english !== w.english).map(ww => ww.english), 3)]),
                hint: w.arabic,
            });
        }
    }
    
    return refreshers;
}

/**
 * Generate sentence refresher exercises
 */
function makeSentenceRefreshers(count: number, nodeId: string): Exercise[] {
    if (LEARNED_CONTENT.sentences.length === 0) return [];
    
    const refreshers: Exercise[] = [];
    const oldSentences = pick(LEARNED_CONTENT.sentences, Math.min(count, LEARNED_CONTENT.sentences.length));
    
    for (const s of oldSentences) {
        refreshers.push({
            id: nextId(`${nodeId}-sent-refresh`),
            type: 'multiple_choice',
            prompt: `Refresher: What does this mean?`,
            correctAnswer: s.english,
            choices: shuffle([s.english, ...pick(LEARNED_CONTENT.sentences.filter(ss => ss.english !== s.english).map(ss => ss.english), 3)]),
            hint: s.arabic,
            promptAudio: s.audio,
        });
    }
    
    return refreshers;
}

/**
 * Build 6+ choices with TRAP letters prioritised as distractors.
 * 1. Always include confusable (visual + sound) lookalikes first.
 * 2. Fill remaining slots from the pool, then from ALL_LETTERS.
 */
function makeChoices(correct: string, pool: string[], minCount: number = 6): string[] {
    const traps = new Set<string>();
    // Add visual traps
    (VISUAL_TRAPS[correct] || []).forEach(t => { if (t !== correct) traps.add(t); });
    // Add sound traps
    (SOUND_TRAPS[correct] || []).forEach(t => { if (t !== correct) traps.add(t); });

    const trapList = [...traps].filter(t => t !== correct);
    const chosen = trapList.slice(0, Math.min(trapList.length, 3)); // up to 3 traps

    // Fill from pool
    const remaining = pool.filter(x => x !== correct && !chosen.includes(x));
    chosen.push(...pick(remaining, Math.min(remaining.length, minCount - 1 - chosen.length)));

    // Fill from ALL_LETTERS if still short
    if (chosen.length < minCount - 1) {
        const allExtras = ALL_LETTERS.map(l => l.letter).filter(x => x !== correct && !chosen.includes(x));
        chosen.push(...pick(allExtras, minCount - 1 - chosen.length));
    }

    return shuffle([correct, ...chosen.slice(0, minCount - 1)]);
}

function makeNameChoices(correct: string, pool: string[], minCount: number = 6): string[] {
    // Find the letter for this name to get traps
    const letterInfo = ALL_LETTERS.find(l => l.name === correct);
    const trapNames: string[] = [];
    if (letterInfo) {
        const vTraps = VISUAL_TRAPS[letterInfo.letter] || [];
        const sTraps = SOUND_TRAPS[letterInfo.letter] || [];
        [...vTraps, ...sTraps].forEach(t => {
            const info = ALL_LETTERS.find(l => l.letter === t);
            if (info && info.name !== correct && !trapNames.includes(info.name)) {
                trapNames.push(info.name);
            }
        });
    }

    const chosen = trapNames.slice(0, Math.min(trapNames.length, 3));
    const others = pool.filter(x => x !== correct && !chosen.includes(x));
    chosen.push(...pick(others, Math.min(others.length, minCount - 1 - chosen.length)));

    if (chosen.length < minCount - 1) {
        const allExtras = ALL_LETTERS.map(l => l.name).filter(x => x !== correct && !chosen.includes(x));
        chosen.push(...pick(allExtras, minCount - 1 - chosen.length));
    }

    return shuffle([correct, ...chosen.slice(0, minCount - 1)]);
}

let exId = 0;
function nextId(prefix: string) { return `${prefix}-${++exId}`; }

// ═══════════════════════════════════════════════════════════
// TRAP EXERCISE GENERATORS
// ═══════════════════════════════════════════════════════════

function makeTrapExercise(correctInfo: LetterInfo, nodeId: string, isAudio: boolean = false): Exercise | null {
    const vTraps = VISUAL_TRAPS[correctInfo.letter] || [];
    const sTraps = SOUND_TRAPS[correctInfo.letter] || [];
    const traps = Array.from(new Set([...vTraps, ...sTraps]));

    if (traps.length === 0) return null; // No major traps to test

    const choices = shuffle([correctInfo.letter, ...traps]).slice(0, 3);
    if (!choices.includes(correctInfo.letter)) {
        choices.pop();
        choices.push(correctInfo.letter);
    }

    const trapExplanations = choices
        .filter(c => c !== correctInfo.letter)
        .map(c => {
            const isSoundTrap = sTraps.includes(c) && !vTraps.includes(c);
            if (isSoundTrap) return `<strong class="arabic-text">${c}</strong> sounds similar, but is different.`;
            return `<strong class="arabic-text">${c}</strong> has ${LETTER_DESCRIPTIONS[c] || 'a different shape'}`;
        })
        .join('<br/><br/>');

    const desc = LETTER_DESCRIPTIONS[correctInfo.letter];
    const explanationMain = desc
        ? `<strong class="arabic-text">${correctInfo.letter}</strong> (${correctInfo.name}) has <span style="color:var(--color-primary-shadow)">${desc}</span>.`
        : `<strong class="arabic-text">${correctInfo.letter}</strong> (${correctInfo.name}) has its own unique shape.`;

    return {
        id: nextId(`${nodeId}-trap`),
        type: 'trap_select',
        prompt: isAudio ? `Listen carefully! Find the correct letter.` : `Careful! Which letter is "${correctInfo.name}"?`,
        promptAudio: isAudio ? correctInfo.letter + 'َ' : undefined,
        correctAnswer: correctInfo.letter,
        choices: shuffle(choices),
        trapExplanation: `${explanationMain}<br/><br/><div style="font-size:18px; color:#666">Watch out for:<br/><br/>${trapExplanations}</div>`,
    };
}

/**
 * VOWEL CONFUSION TRAP - Tests vowel mark discrimination
 * Critical for preventing Fatha/Kasra/Damma confusion
 */
function makeVowelTrapExercise(letter: LetterInfo, correctVowel: any, allVowels: any[], nodeId: string, isAudio: boolean = false): Exercise {
    const wrongVowels = allVowels.filter(v => v.name !== correctVowel.name);
    const correctCombo = letter.letter + correctVowel.mark;
    const wrongCombos = wrongVowels.map(v => letter.letter + v.mark);
    
    const trapExplanations = wrongVowels.map(v => 
        `<strong class="arabic-text">${v.mark}</strong> (${v.name}) makes "${v.sound}" - not "${correctVowel.sound}"`
    ).join('<br/>');
    
    return {
        id: nextId(`${nodeId}-vowel-trap`),
        type: 'trap_select',
        prompt: isAudio 
            ? `Listen carefully! Which syllable?`
            : `Careful! Which syllable makes "${letter.name.toLowerCase().slice(0, 2)}${correctVowel.translit}"?`,
        promptAudio: isAudio ? correctCombo : undefined,
        correctAnswer: correctCombo,
        choices: shuffle([correctCombo, ...wrongCombos]),
        trapExplanation: `<strong class="arabic-text">${correctVowel.mark}</strong> (${correctVowel.name}) makes the "${correctVowel.sound}" sound.<br/><br/><div style="font-size:18px; color:#666">Watch out for:<br/><br/>${trapExplanations}</div>`,
    };
}

/**
 * WORD CONFUSION TRAP - Tests similar-looking or similar-sounding words
 * Critical for preventing vocabulary confusion
 */
function makeWordConfusionTrap(correctWord: any, confusableWords: any[], nodeId: string, isAudio: boolean = false): Exercise {
    const trapExplanations = confusableWords.map(w => 
        `<strong class="arabic-text">${w.arabic}</strong> means "${w.english}" - not "${correctWord.english}"`
    ).join('<br/>');
    
    return {
        id: nextId(`${nodeId}-word-trap`),
        type: 'trap_select',
        prompt: isAudio
            ? `Listen carefully! Which word?`
            : `Careful! Which word means "${correctWord.english}"?`,
        promptAudio: isAudio ? correctWord.audio : undefined,
        correctAnswer: correctWord.arabic,
        choices: shuffle([correctWord.arabic, ...confusableWords.map(w => w.arabic)]),
        trapExplanation: `<strong class="arabic-text">${correctWord.arabic}</strong> (${correctWord.translit}) means "${correctWord.english}".<br/><br/><div style="font-size:18px; color:#666">Watch out for:<br/><br/>${trapExplanations}</div>`,
    };
}

/**
 * SENTENCE CONFUSION TRAP - Tests similar sentences
 * Critical for preventing sentence confusion
 */
function makeSentenceConfusionTrap(correctSent: any, confusableSents: any[], nodeId: string, isAudio: boolean = false): Exercise {
    const trapExplanations = confusableSents.map(s => 
        `<strong class="arabic-text">${s.arabic}</strong> means "${s.english}" - not "${correctSent.english}"`
    ).join('<br/>');
    
    return {
        id: nextId(`${nodeId}-sent-trap`),
        type: 'trap_select',
        prompt: isAudio
            ? `Listen carefully! Which sentence?`
            : `Careful! Which sentence means "${correctSent.english}"?`,
        promptAudio: isAudio ? correctSent.audio : undefined,
        correctAnswer: correctSent.arabic,
        choices: shuffle([correctSent.arabic, ...confusableSents.map(s => s.arabic)]),
        trapExplanation: `<strong class="arabic-text">${correctSent.arabic}</strong> means "${correctSent.english}".<br/><br/><div style="font-size:18px; color:#666">Watch out for:<br/><br/>${trapExplanations}</div>`,
    };
}

/**
 * CONVERSATION LINE TRAP - Tests speaker/context confusion
 * Critical for conversation comprehension
 */
function makeConversationLineTrap(correctLine: any, confusableLines: any[], nodeId: string, context: string): Exercise {
    const trapExplanations = confusableLines.map(l => 
        `<strong class="arabic-text">${l.arabic}</strong> - "${l.english}" (different line)`
    ).join('<br/>');
    
    return {
        id: nextId(`${nodeId}-conv-trap`),
        type: 'trap_select',
        prompt: `Careful! ${context}`,
        promptAudio: correctLine.audio,
        correctAnswer: correctLine.arabic,
        choices: shuffle([correctLine.arabic, ...confusableLines.map(l => l.arabic)]),
        trapExplanation: `<strong class="arabic-text">${correctLine.arabic}</strong> means "${correctLine.english}".<br/><br/><div style="font-size:18px; color:#666">Watch out for:<br/><br/>${trapExplanations}</div>`,
    };
}

// ═══════════════════════════════════════════════════════════
// ROUND 1: INTRODUCTION — Intro cards + basic exercises (6 choices, traps)
// ═══════════════════════════════════════════════════════════

function makeRound1(letters: LetterInfo[], nodeId: string): Lesson {
    const exercises: Exercise[] = [];
    const letterPool = ALL_LETTERS.map(l => l.letter);
    const namePool = ALL_LETTERS.map(l => l.name);

    // Intro cards
    for (const l of letters) {
        exercises.push({
            id: nextId(`${nodeId}-r1-intro`),
            type: 'introduction',
            prompt: `This is **${l.letter}** (${l.name})`,
            correctAnswer: l.letter,
            choices: [],
            hint: `Name: ${l.name}\nSound: ${l.sound}\nThis letter is called "${l.name}" and makes the ${l.sound} sound.`,
        });
    }

    // Graded exercises — shuffled across letters
    const graded: Exercise[] = [];
    for (const l of letters) {
        graded.push({
            id: nextId(`${nodeId}-r1`),
            type: 'tap_letter',
            prompt: `Which letter is "${l.name}"?`,
            correctAnswer: l.letter,
            choices: makeChoices(l.letter, letterPool),
            hint: l.letter,
        });

        graded.push({
            id: nextId(`${nodeId}-r1`),
            type: 'multiple_choice',
            prompt: `What is this letter called?`,
            correctAnswer: l.name,
            choices: makeNameChoices(l.name, namePool),
            hint: l.letter,
        });
    }

    exercises.push(...shuffle(graded));

    return {
        id: `${nodeId}-lesson1`,
        title: 'Round 1: Learn the Letters',
        description: 'Meet each letter and learn its name',
        exercises,
    };
}

// ═══════════════════════════════════════════════════════════
// ROUND 2: SOUNDS — Audio exercises (6 choices, traps) + LETTER REFRESHERS
// ═══════════════════════════════════════════════════════════

function makeRound2(letters: LetterInfo[], nodeId: string): Lesson {
    const letterPool = ALL_LETTERS.map(l => l.letter);
    const namePool = ALL_LETTERS.map(l => l.name);

    const exercises: Exercise[] = [];
    
    // Add letter refreshers from previous nodes (DUOLINGO-STYLE)
    exercises.push(...makeLetterRefreshers(4, nodeId));
    
    for (const l of letters) {
        exercises.push({
            id: nextId(`${nodeId}-r2`),
            type: 'hear_choose',
            prompt: `Which letter makes the ${l.sound} sound?`,
            promptAudio: l.letter + 'َ',
            correctAnswer: l.letter,
            choices: makeChoices(l.letter, letterPool),
        });

        exercises.push({
            id: nextId(`${nodeId}-r2`),
            type: 'multiple_choice',
            prompt: `What is this letter called?`,
            correctAnswer: l.name,
            choices: makeNameChoices(l.name, namePool),
            hint: l.letter,
        });

        exercises.push({
            id: nextId(`${nodeId}-r2`),
            type: 'tap_letter',
            prompt: `Tap the letter "${l.name}"`,
            correctAnswer: l.letter,
            choices: makeChoices(l.letter, letterPool),
        });
    }

    // Match sound-to-letter pairs
    exercises.push({
        id: nextId(`${nodeId}-r2-mp-sound`),
        type: 'match_pairs',
        prompt: 'Match each letter to its sound',
        correctAnswer: '',
        choices: [],
        pairs: letters.map(l => ({ left: l.letter, right: l.sound })),
    });

    // Add simple word assembly using letter combinations
    const simpleWord = letters.slice(0, 2).map(l => l.letter).join('');
    const letterNames = letters.slice(0, 2).map(l => l.name).join(' + ');
    exercises.push({
        id: nextId(`${nodeId}-r2-word-asm`),
        type: 'word_assembly',
        prompt: `Practice: Tap to combine ${letterNames}`,
        correctAnswer: simpleWord,
        choices: shuffle([...letters.slice(0, 2).map(l => l.letter), letters[2]?.letter || 'م']),
        hint: `Tap the letters in order to see how they connect`,
    });

    return {
        id: `${nodeId}-lesson2`,
        title: 'Round 2: Learn the Sounds',
        description: 'Connect letters to their sounds',
        exercises: [...shuffle(exercises.slice(0, exercises.length - 2)), exercises[exercises.length - 2], exercises[exercises.length - 1]],
    };
}

// ═══════════════════════════════════════════════════════════
// ROUND 3: DISCRIMINATION — Mixed with OLD letters (refresher + traps) + MORE REFRESHERS
// ═══════════════════════════════════════════════════════════

function makeRound3(letters: LetterInfo[], nodeId: string, prevLetters: LetterInfo[]): Lesson {
    // AGGRESSIVE refresher: pull up to 6 old letters (not just the recent ones)
    const oldReview = pick(prevLetters, Math.min(prevLetters.length, 6));
    const allPool = [...letters, ...oldReview];
    const letterPool = allPool.map(x => x.letter);
    const namePool = allPool.map(x => x.name);

    const exercises: Exercise[] = [];
    
    // Add MORE letter refreshers (DUOLINGO-STYLE)
    exercises.push(...makeLetterRefreshers(6, nodeId));

    // The Philosophy Intro
    exercises.push({
        id: nextId(`${nodeId}-r3-philosophy`),
        type: 'intro-trap-philosophy' as any,
        prompt: '',
        correctAnswer: '',
        choices: [],
    });

    // Test current letters with trap distractors
    for (const l of letters) {
        exercises.push({
            id: nextId(`${nodeId}-r3`),
            type: 'tap_letter',
            prompt: `Which letter is "${l.name}"?`,
            correctAnswer: l.letter,
            choices: makeChoices(l.letter, letterPool),
        });

        exercises.push({
            id: nextId(`${nodeId}-r3`),
            type: 'multiple_choice',
            prompt: `What is this letter called?`,
            correctAnswer: l.name,
            choices: makeNameChoices(l.name, namePool),
            hint: l.letter,
        });

        exercises.push({
            id: nextId(`${nodeId}-r3`),
            type: 'hear_choose',
            prompt: `Listen and tap the correct letter`,
            promptAudio: l.letter + 'َ',
            correctAnswer: l.letter,
            choices: makeChoices(l.letter, letterPool),
        });

        // Add explicit Trap Exercise!
        const trapEx = makeTrapExercise(l, nodeId, false);
        if (trapEx) exercises.push(trapEx);
    }

    // === REFRESHER: re-test OLD letters the user already learned ===
    for (const l of oldReview) {
        exercises.push({
            id: nextId(`${nodeId}-r3-old`),
            type: 'tap_letter',
            prompt: `Quick! Which letter is "${l.name}"?`,
            correctAnswer: l.letter,
            choices: makeChoices(l.letter, letterPool),
        });

        exercises.push({
            id: nextId(`${nodeId}-r3-old`),
            type: 'multiple_choice',
            prompt: `Remember this letter?`,
            correctAnswer: l.name,
            choices: makeNameChoices(l.name, namePool),
            hint: l.letter,
        });
    }

    // Match sound-to-letter (includes old + new)
    const pairLetters = pick(allPool, Math.min(allPool.length, 6));
    exercises.push({
        id: nextId(`${nodeId}-r3-mp-sound`),
        type: 'match_pairs',
        prompt: 'Match each letter to its sound',
        correctAnswer: '',
        choices: [],
        pairs: pairLetters.map(l => ({ left: l.letter, right: l.sound })),
    });

    return {
        id: `${nodeId}-lesson3`,
        title: 'Round 3: Discrimination + Refresh',
        description: 'Tricky lookalikes + old letters mixed in',
        exercises: shuffle(exercises),
    };
}

// ═══════════════════════════════════════════════════════════
// ROUND 4: REVIEW — Heavy mix of old + new (6 choices, traps) + EVEN MORE REFRESHERS
// ═══════════════════════════════════════════════════════════

function makeRound4(letters: LetterInfo[], nodeId: string, prevLetters: LetterInfo[]): Lesson {
    // Even MORE old letters — up to 8 for heavy review
    const reviewLetters = pick(prevLetters, Math.min(prevLetters.length, 8));
    const allLetters = [...letters, ...reviewLetters];
    const bigPool = allLetters.map(x => x.letter);
    const bigNamePool = allLetters.map(x => x.name);

    const exercises: Exercise[] = [];
    
    // Add EVEN MORE letter refreshers (DUOLINGO-STYLE)
    exercises.push(...makeLetterRefreshers(8, nodeId));

    // Test ALL letters (current + old) — no distinction
    for (const l of allLetters) {
        exercises.push({
            id: nextId(`${nodeId}-r4`),
            type: 'tap_letter',
            prompt: `Which letter is "${l.name}"?`,
            correctAnswer: l.letter,
            choices: makeChoices(l.letter, bigPool),
        });

        exercises.push({
            id: nextId(`${nodeId}-r4`),
            type: 'multiple_choice',
            prompt: `What is this letter called?`,
            correctAnswer: l.name,
            choices: makeNameChoices(l.name, bigNamePool),
            hint: l.letter,
        });
    }

    // Audio for a mixed subset
    for (const l of pick(allLetters, Math.min(allLetters.length, 6))) {
        exercises.push({
            id: nextId(`${nodeId}-r4`),
            type: 'hear_choose',
            prompt: `Listen and select the correct letter`,
            promptAudio: l.letter + 'َ',
            correctAnswer: l.letter,
            choices: makeChoices(l.letter, bigPool),
        });

        // Mix in Audio Trap Exercises
        const trapEx = makeTrapExercise(l, nodeId, true);
        if (trapEx) exercises.push(trapEx);
    }

    // Match name-to-letter
    const pairSet = pick(allLetters, Math.min(allLetters.length, 6));
    exercises.push({
        id: nextId(`${nodeId}-r4-mp`),
        type: 'match_pairs',
        prompt: 'Match each letter to its name',
        correctAnswer: '',
        choices: [],
        pairs: pairSet.map(l => ({ left: l.letter, right: l.name })),
    });

    // Match sound-to-letter
    exercises.push({
        id: nextId(`${nodeId}-r4-mp-sound`),
        type: 'match_pairs',
        prompt: 'Match each letter to its sound',
        correctAnswer: '',
        choices: [],
        pairs: pairSet.map(l => ({ left: l.letter, right: l.sound })),
    });
    
    // Add sentence assembly with letters
    const sentLetters = pick(allLetters, 3);
    const sentLetterNames = sentLetters.map(l => l.name).join(', ');
    exercises.push({
        id: nextId(`${nodeId}-r4-sent`),
        type: 'sentence_assembly',
        prompt: `Practice: Arrange ${sentLetterNames} in alphabetical order`,
        correctAnswer: sentLetters.map(l => l.letter).join(' '),
        choices: shuffle([...sentLetters.map(l => l.letter), allLetters[0].letter]),
        hint: `Tap the letters to put them in sequence`,
    });

    return {
        id: `${nodeId}-lesson4`,
        title: 'Round 4: Full Review',
        description: 'Everything mixed — old and new',
        exercises: shuffle(exercises),
    };
}

// ═══════════════════════════════════════════════════════════
// ROUND 5: MASTERY PRACTICE — Match pairs + rapid recall (traps + refresher) + MAXIMUM REFRESHERS
// ═══════════════════════════════════════════════════════════

function makeRound5(letters: LetterInfo[], nodeId: string, prevLetters: LetterInfo[]): Lesson {
    const allForTest = [...letters, ...pick(prevLetters, Math.min(prevLetters.length, 6))];
    const bigPool = allForTest.map(x => x.letter);
    const namePool = allForTest.map(x => x.name);

    const exercises: Exercise[] = [];
    
    // Add MAXIMUM letter refreshers (DUOLINGO-STYLE)
    exercises.push(...makeLetterRefreshers(10, nodeId));

    // Match pairs: letter ↔ name
    const mpLetters = pick(allForTest, Math.min(allForTest.length, 6));
    exercises.push({
        id: nextId(`${nodeId}-r5-mp`),
        type: 'match_pairs',
        prompt: 'Match each letter to its name',
        correctAnswer: '',
        choices: [],
        pairs: mpLetters.map(l => ({ left: l.letter, right: l.name })),
    });

    // Match pairs: letter ↔ sound
    exercises.push({
        id: nextId(`${nodeId}-r5-mp-sound`),
        type: 'match_pairs',
        prompt: 'Match each letter to its sound',
        correctAnswer: '',
        choices: [],
        pairs: mpLetters.map(l => ({ left: l.letter, right: l.sound })),
    });

    // Rapid recall — ALL letters including old ones
    for (const l of allForTest) {
        exercises.push({
            id: nextId(`${nodeId}-r5`),
            type: 'tap_letter',
            prompt: `Tap "${l.name}"`,
            correctAnswer: l.letter,
            choices: makeChoices(l.letter, bigPool),
        });
    }

    // Name from letter
    for (const l of allForTest) {
        exercises.push({
            id: nextId(`${nodeId}-r5`),
            type: 'multiple_choice',
            prompt: `Name this letter:`,
            correctAnswer: l.name,
            choices: makeNameChoices(l.name, namePool),
            hint: l.letter,
        });
    }

    // Audio identification
    for (const l of pick(allForTest, Math.min(allForTest.length, 4))) {
        exercises.push({
            id: nextId(`${nodeId}-r5`),
            type: 'hear_choose',
            prompt: 'Listen and select',
            promptAudio: l.letter + 'َ',
            correctAnswer: l.letter,
            choices: makeChoices(l.letter, bigPool),
        });
    }

    return {
        id: `${nodeId}-lesson5`,
        title: 'Round 5: Mastery Practice',
        description: 'Practice everything you learned!',
        exercises: shuffle(exercises),
    };
}

// ─── Build Nodes ───────────────────────────────────────────

function makeLetterGroupNode(
    id: string,
    letters: LetterInfo[],
    nodeIndex: number,
    completedRounds: number = 0,
): CourseNode {
    const prevLetters = getPreviousLetters(nodeIndex);
    const letterLabels = letters.map(l => l.letter).join(' ');
    const nameLabels = letters.map(l => l.name).join(', ');
    
    // Register these letters as learned (DUOLINGO-STYLE)
    letters.forEach(l => {
        if (!LEARNED_CONTENT.letters.find(ll => ll.letter === l.letter)) {
            LEARNED_CONTENT.letters.push(l);
        }
    });

    return {
        id,
        title: letterLabels,
        description: nameLabels,
        type: 'lesson',
        status: 'active',
        totalRounds: 5,
        completedRounds,
        skillLetters: letters.map(l => l.letter),
        lessons: [
            makeRound1(letters, id),
            makeRound2(letters, id),
            makeRound3(letters, id, prevLetters),
            makeRound4(letters, id, prevLetters),
            makeRound5(letters, id, prevLetters),
        ],
    };
}

// ─── Unit Test ─────────────────────────────────────────────

function makeUnitTest(): CourseNode {
    const exercises: Exercise[] = [];
    const allLetterPool = ALL_LETTERS.map(l => l.letter);
    const allNamePool = ALL_LETTERS.map(l => l.name);

    // 5 match-pairs sets (mix of name + sound matching)
    for (let i = 0; i < ALL_LETTERS.length; i += 6) {
        const group = ALL_LETTERS.slice(i, Math.min(i + 6, ALL_LETTERS.length));
        if (group.length >= 3) {
            exercises.push({
                id: nextId('ut-mp-name'),
                type: 'match_pairs',
                prompt: `Match letters to names`,
                correctAnswer: '',
                choices: [],
                pairs: group.map(l => ({ left: l.letter, right: l.name })),
            });
            exercises.push({
                id: nextId('ut-mp-sound'),
                type: 'match_pairs',
                prompt: `Match letters to sounds`,
                correctAnswer: '',
                choices: [],
                pairs: group.map(l => ({ left: l.letter, right: l.sound })),
            });
        }
    }

    // 28 rapid-fire name questions with trap distractors
    for (const l of shuffle(ALL_LETTERS)) {
        exercises.push({
            id: nextId('ut'),
            type: 'multiple_choice',
            prompt: 'What is this letter called?',
            correctAnswer: l.name,
            choices: makeNameChoices(l.name, allNamePool),
            hint: l.letter,
        });

        // 50% chance to add a visual trap exercise for this letter
        if (Math.random() > 0.5) {
            const trapEx = makeTrapExercise(l, 'ut', false);
            if (trapEx) exercises.push(trapEx);
        }
    }

    // 14 audio questions
    for (const l of pick(ALL_LETTERS, 14)) {
        exercises.push({
            id: nextId('ut-audio'),
            type: 'hear_choose',
            prompt: 'Listen and select the correct letter',
            promptAudio: l.letter + 'َ',
            correctAnswer: l.letter,
            choices: makeChoices(l.letter, allLetterPool),
        });

        // 50% chance to add an audio trap exercise for this letter
        if (Math.random() > 0.5) {
            const trapEx = makeTrapExercise(l, 'ut', true);
            if (trapEx) exercises.push(trapEx);
        }
    }

    return {
        id: 'u1-test',
        title: '📝 Unit Test',
        description: 'Test all 28 letters!',
        type: 'test',
        status: 'active',
        totalRounds: 1,
        completedRounds: 0,
        skillLetters: ALL_LETTERS.map(l => l.letter),
        lessons: [{
            id: 'u1-test-lesson',
            title: 'Unit 1 Test',
            description: 'Prove you know all 28 letters',
            exercises,
        }],
    };
}

// ═══════════════════════════════════════════════════════════
// UNIT 2: SHORT VOWELS — ALL 3 MIXED FROM THE START
// ═══════════════════════════════════════════════════════════

interface VowelInfo {
    name: string;
    arabic: string;
    mark: string;
    sound: string;
    translit: string;
}

const VOWELS: VowelInfo[] = [
    { name: 'Fatha', arabic: 'فَتحة', mark: 'َ', sound: '/a/', translit: 'a' },
    { name: 'Kasra', arabic: 'كَسرة', mark: 'ِ', sound: '/i/', translit: 'i' },
    { name: 'Damma', arabic: 'ضَمّة', mark: 'ُ', sound: '/u/', translit: 'u' },
];

const PRACTICE_LETTERS = ALL_LETTERS.filter(l =>
    ['ب', 'ت', 'س', 'م', 'ن', 'ك', 'ل', 'د'].includes(l.letter)
);

function vowelCombo(letter: string, vowel: VowelInfo): string {
    return letter + vowel.mark;
}

function vowelSyllable(letter: LetterInfo, vowel: VowelInfo): string {
    const consonant = letter.name.toLowerCase().replace(/aa$/, '').replace(/aal$/, '');
    return consonant.slice(0, consonant.length > 2 ? 2 : consonant.length) + vowel.translit;
}

/** Build wrong-answer choices for vowel exercises */
function vowelDistractors(letter: LetterInfo, correctV: VowelInfo, letters: LetterInfo[]): string[] {
    const wrongVowels = VOWELS.filter(v => v.name !== correctV.name).map(v => vowelCombo(letter.letter, v));
    const otherLetters = pick(letters.filter(x => x.letter !== letter.letter), 3).map(x => vowelCombo(x.letter, correctV));
    return shuffle([...wrongVowels, ...otherLetters]);
}

function syllableDistractors(letter: LetterInfo, correctV: VowelInfo, letters: LetterInfo[]): string[] {
    const wrongVowels = VOWELS.filter(v => v.name !== correctV.name).map(v => vowelSyllable(letter, v));
    const otherLetters = pick(letters.filter(x => x.letter !== letter.letter), 3).map(x => vowelSyllable(x, correctV));
    return shuffle([...wrongVowels, ...otherLetters]);
}

// ─── PROGRESSIVE VOWEL NODES ─────────────────────────────

function makeSingleVowelNode(vowelIndex: number, nodeId: string): CourseNode {
    const vowel = VOWELS[vowelIndex];
    const prevVowels = VOWELS.slice(0, vowelIndex);
    const letters = pick(PRACTICE_LETTERS, 8);

    // Divide letters into batches for progressive rounds
    const batch1 = letters.slice(0, 3);
    const batch2 = letters.slice(3, 6);
    const batch3 = letters.slice(6, 8);

    // Helpers to inject old material (Duolingo-style random refreshers)
    const getRefresher = (rPrefix: string): Exercise[] => {
        if (prevVowels.length === 0) return [];
        const res: Exercise[] = [];
        // Add 2 random refresher questions
        for (let i = 0; i < 2; i++) {
            const pv = prevVowels[Math.floor(Math.random() * prevVowels.length)];
            const l = letters[Math.floor(Math.random() * letters.length)];
            if (Math.random() > 0.5) {
                res.push({
                    id: nextId(`${nodeId}-${rPrefix}-refresh`),
                    type: 'multiple_choice',
                    prompt: 'Refresher! What sound does this make?',
                    correctAnswer: vowelSyllable(l, pv),
                    choices: shuffle([vowelSyllable(l, pv), ...syllableDistractors(l, pv, letters)]),
                    hint: vowelCombo(l.letter, pv),
                });
            } else {
                res.push({
                    id: nextId(`${nodeId}-${rPrefix}-refresh-audio`),
                    type: 'hear_choose',
                    prompt: 'Refresher! Listen — what sound?',
                    promptAudio: vowelCombo(l.letter, pv),
                    correctAnswer: vowelCombo(l.letter, pv),
                    choices: shuffle([vowelCombo(l.letter, pv), ...vowelDistractors(l, pv, letters)]),
                });
            }
        }
        return res;
    };

    // ── Round 1: Intro vowel + batch 1 ──
    const r1: Exercise[] = [];
    
    // Add letter refreshers (DUOLINGO-STYLE)
    r1.push(...makeLetterRefreshers(3, nodeId));
    
    r1.push({
        id: nextId(`${nodeId}-r1-intro`),
        type: 'introduction',
        prompt: `Meet the **${vowel.name}**!`,
        correctAnswer: '',
        choices: [],
        hint: `The ${vowel.name} (${vowel.mark}) makes the "${vowel.sound}" sound.\nLet's add it to some letters!`,
    });
    for (const l of batch1) {
        r1.push({
            id: nextId(`${nodeId}-r1-link`),
            type: 'introduction',
            prompt: `**${l.letter}** + **${vowel.name}** (${vowel.mark}) = **${vowelCombo(l.letter, vowel)}**`,
            correctAnswer: vowelCombo(l.letter, vowel),
            choices: [],
            hint: `Makes the sound "${vowelSyllable(l, vowel)}"`,
        });
        r1.push({
            id: nextId(`${nodeId}-r1`),
            type: 'multiple_choice',
            prompt: 'What sound does this make?',
            correctAnswer: vowelSyllable(l, vowel),
            choices: shuffle([vowelSyllable(l, vowel), ...syllableDistractors(l, vowel, letters)]),
            hint: vowelCombo(l.letter, vowel),
        });
        r1.push({
            id: nextId(`${nodeId}-r1-tap`),
            type: 'tap_letter',
            prompt: `Tap "${vowelSyllable(l, vowel)}"`,
            correctAnswer: vowelCombo(l.letter, vowel),
            choices: shuffle([vowelCombo(l.letter, vowel), ...vowelDistractors(l, vowel, letters)]),
        });
    }
    r1.push(...getRefresher('r1'));
    
    // Add trap select for vowel confusion
    if (prevVowels.length > 0) {
        const l = batch1[0];
        const trapVowel = prevVowels[0];
        r1.push({
            id: nextId(`${nodeId}-r1-trap`),
            type: 'trap_select',
            prompt: `Careful! Which one has ${vowel.name}?`,
            correctAnswer: vowelCombo(l.letter, vowel),
            choices: shuffle([vowelCombo(l.letter, vowel), vowelCombo(l.letter, trapVowel), vowelCombo(letters[1].letter, vowel)]),
            trapExplanation: `<strong class="arabic-text">${vowel.name}</strong> (${vowel.mark}) makes the "${vowel.sound}" sound, not "${trapVowel.sound}".`,
        });
    }
    
    // Add MORE vowel confusion traps (AGGRESSIVE)
    for (const l of pick(batch1, 2)) {
        r1.push(makeVowelTrapExercise(l, vowel, VOWELS, nodeId, false));
    }
    
    const round1: Lesson = { id: `${nodeId}-l1`, title: `Round 1: Meet ${vowel.name}`, description: `Introduction to ${vowel.name}`, exercises: shuffle(r1) };

    // ── Round 2: Intro batch 2 ──
    const r2: Exercise[] = [];
    
    // Add letter refreshers (DUOLINGO-STYLE)
    r2.push(...makeLetterRefreshers(3, nodeId));
    
    for (const l of batch2) {
        r2.push({
            id: nextId(`${nodeId}-r2-link`),
            type: 'introduction',
            prompt: `**${l.letter}** + **${vowel.name}** = **${vowelCombo(l.letter, vowel)}**`,
            correctAnswer: vowelCombo(l.letter, vowel),
            choices: [],
            hint: `Makes the sound "${vowelSyllable(l, vowel)}"`,
        });
        r2.push({
            id: nextId(`${nodeId}-r2`),
            type: 'multiple_choice',
            prompt: 'What sound does this make?',
            correctAnswer: vowelSyllable(l, vowel),
            choices: shuffle([vowelSyllable(l, vowel), ...syllableDistractors(l, vowel, letters)]),
            hint: vowelCombo(l.letter, vowel),
        });
    }
    // review batch1
    for (const l of batch1) {
        r2.push({
            id: nextId(`${nodeId}-r2-tap`),
            type: 'tap_letter',
            prompt: `Tap "${vowelSyllable(l, vowel)}"`,
            correctAnswer: vowelCombo(l.letter, vowel),
            choices: shuffle([vowelCombo(l.letter, vowel), ...vowelDistractors(l, vowel, letters)]),
        });
    }
    r2.push(...getRefresher('r2'));
    
    // Add vowel confusion traps (AGGRESSIVE)
    for (const l of pick([...batch1, ...batch2], 3)) {
        r2.push(makeVowelTrapExercise(l, vowel, VOWELS, nodeId, false));
    }
    
    const round2: Lesson = { id: `${nodeId}-l2`, title: `Round 2: More Letters`, description: `Practice ${vowel.name} with new letters`, exercises: shuffle(r2) };

    // ── Round 3: batch 3 + audio ──
    const r3: Exercise[] = [];
    
    // Add letter refreshers (DUOLINGO-STYLE)
    r3.push(...makeLetterRefreshers(4, nodeId));
    
    for (const l of batch3) {
        r3.push({
            id: nextId(`${nodeId}-r3-link`),
            type: 'introduction',
            prompt: `**${l.letter}** + **${vowel.name}** = **${vowelCombo(l.letter, vowel)}** = "${vowelSyllable(l, vowel)}"`,
            correctAnswer: vowelCombo(l.letter, vowel),
            choices: [],
        });
        r3.push({
            id: nextId(`${nodeId}-r3`),
            type: 'hear_choose',
            prompt: 'Listen — which syllable?',
            promptAudio: vowelCombo(l.letter, vowel),
            correctAnswer: vowelCombo(l.letter, vowel),
            choices: shuffle([vowelCombo(l.letter, vowel), ...vowelDistractors(l, vowel, letters)]),
        });
    }
    // Review batch1 and batch2 with audio
    for (const l of pick([...batch1, ...batch2], 4)) {
        r3.push({
            id: nextId(`${nodeId}-r3-audio-tap`),
            type: 'hear_choose',
            prompt: 'Listen — which syllable?',
            promptAudio: vowelCombo(l.letter, vowel),
            correctAnswer: vowelCombo(l.letter, vowel),
            choices: shuffle([vowelCombo(l.letter, vowel), ...vowelDistractors(l, vowel, letters)]),
        });
    }
    r3.push(...getRefresher('r3'));
    
    // Add AUDIO vowel confusion traps (AGGRESSIVE)
    for (const l of pick(letters, 3)) {
        r3.push(makeVowelTrapExercise(l, vowel, VOWELS, nodeId, true));
    }
    
    const round3: Lesson = { id: `${nodeId}-l3`, title: `Round 3: Audio Mastery`, description: `Hear and identify ${vowel.name}`, exercises: shuffle(r3) };

    // ── Round 4: Speed Quiz ──
    const r4: Exercise[] = [];
    
    // Add letter refreshers (DUOLINGO-STYLE)
    r4.push(...makeLetterRefreshers(5, nodeId));
    
    for (const l of letters) {
        if (Math.random() > 0.5) {
            r4.push({
                id: nextId(`${nodeId}-r4`),
                type: 'multiple_choice',
                prompt: 'What sound does this make?',
                correctAnswer: vowelSyllable(l, vowel),
                choices: shuffle([vowelSyllable(l, vowel), ...syllableDistractors(l, vowel, letters)]),
                hint: vowelCombo(l.letter, vowel),
            });
        } else {
            r4.push({
                id: nextId(`${nodeId}-r4-tap`),
                type: 'tap_letter',
                prompt: `Tap "${vowelSyllable(l, vowel)}"`,
                correctAnswer: vowelCombo(l.letter, vowel),
                choices: shuffle([vowelCombo(l.letter, vowel), ...vowelDistractors(l, vowel, letters)]),
            });
        }
    }
    r4.push(...getRefresher('r4'));
    r4.push(...getRefresher('r4')); // Add even more review here
    
    // Add MORE vowel confusion traps (AGGRESSIVE)
    for (const l of pick(letters, 4)) {
        r4.push(makeVowelTrapExercise(l, vowel, VOWELS, nodeId, Math.random() > 0.5));
    }
    
    const round4: Lesson = { id: `${nodeId}-l4`, title: `Round 4: Speed Review`, description: `All letters with ${vowel.name}`, exercises: shuffle(r4) };

    // ── Round 5: Mastery Practice + Match Pairs ──
    const r5: Exercise[] = [];
    
    // Add letter refreshers (DUOLINGO-STYLE)
    r5.push(...makeLetterRefreshers(6, nodeId));
    
    r5.push({
        id: nextId(`${nodeId}-r5-mp`),
        type: 'match_pairs',
        prompt: `Match ${vowel.name} syllables to sounds`,
        correctAnswer: '',
        choices: [],
        pairs: pick(letters, 6).map(l => ({ left: vowelCombo(l.letter, vowel), right: vowelSyllable(l, vowel) })),
    });
    for (const l of pick(letters, 6)) {
        r5.push({
            id: nextId(`${nodeId}-r5-audio`),
            type: 'hear_choose',
            prompt: 'Listen — what sound?',
            promptAudio: vowelCombo(l.letter, vowel),
            correctAnswer: vowelSyllable(l, vowel),
            choices: shuffle([vowelSyllable(l, vowel), ...syllableDistractors(l, vowel, letters)]),
        });
    }
    r5.push(...getRefresher('r5'));
    
    // Add FINAL vowel confusion traps (AGGRESSIVE)
    for (const l of pick(letters, 5)) {
        r5.push(makeVowelTrapExercise(l, vowel, VOWELS, nodeId, Math.random() > 0.5));
    }
    
    // Add word assembly with vowels
    const vowelWord = pick(letters, 2).map(l => vowelCombo(l.letter, vowel)).join('');
    const vowelLetterNames = pick(letters, 2).map(l => l.name).join(' + ');
    r5.push({
        id: nextId(`${nodeId}-r5-word-asm`),
        type: 'word_assembly',
        prompt: `Combine ${vowelLetterNames} with ${vowel.name}`,
        correctAnswer: vowelWord,
        choices: shuffle([...pick(letters, 2).map(l => vowelCombo(l.letter, vowel)), vowelCombo(letters[0].letter, VOWELS[(vowel === VOWELS[0] ? 1 : 0)])]),
        hint: `Tap the syllables to build the word`,
    });
    
    // Add sentence assembly with simple vowel combinations
    const sentenceParts = pick(letters, 3).map(l => vowelCombo(l.letter, vowel));
    r5.push({
        id: nextId(`${nodeId}-r5-sent-asm`),
        type: 'sentence_assembly',
        prompt: `Practice: Arrange these ${vowel.name} syllables`,
        correctAnswer: sentenceParts.join(' '),
        choices: shuffle([...sentenceParts, vowelCombo(letters[0].letter, VOWELS[(vowel === VOWELS[0] ? 1 : 0)])]),
        hint: `Tap to put the syllables in sequence`,
    });
    
    const round5: Lesson = { id: `${nodeId}-l5`, title: `Round 5: Mastery Practice`, description: `Prove your ${vowel.name} fluency!`, exercises: shuffle(r5) };

    const title = batch1.map(l => vowelCombo(l.letter, vowel)).join(' ');
    
    // Register this vowel as learned (DUOLINGO-STYLE)
    if (!LEARNED_CONTENT.vowels.find(v => v.name === vowel.name)) {
        LEARNED_CONTENT.vowels.push(vowel);
    }

    return {
        id: nodeId,
        title,
        description: `Learn the ${vowel.name} (${vowel.translit})`,
        type: 'lesson',
        status: 'active',
        totalRounds: 5,
        completedRounds: 0,
        lessons: [round1, round2, round3, round4, round5],
    };
}

function makeMixedVowelNode(nodeId: string): CourseNode {
    const letters = pick(PRACTICE_LETTERS, 8);

    // Round 1: Mixing Fatha & Kasra
    const r1: Exercise[] = [];
    
    // Add letter refreshers (DUOLINGO-STYLE)
    r1.push(...makeLetterRefreshers(4, nodeId));
    
    r1.push({
        id: nextId(`${nodeId}-r1-intro`),
        type: 'introduction',
        prompt: `Let's mix **Fatha** and **Kasra**!`,
        correctAnswer: '',
        choices: [],
        hint: `Watch carefully if the line is ABOVE (Fatha) or BELOW (Kasra).`,
    });
    for (const l of pick(letters, 4)) {
        r1.push({
            id: nextId(`${nodeId}-r1`),
            type: 'multiple_choice',
            prompt: 'What sound does this make?',
            correctAnswer: vowelSyllable(l, VOWELS[0]),
            choices: shuffle([vowelSyllable(l, VOWELS[0]), vowelSyllable(l, VOWELS[1]), ...syllableDistractors(l, VOWELS[0], letters)]),
            hint: vowelCombo(l.letter, VOWELS[0]),
        });
        r1.push({
            id: nextId(`${nodeId}-r1`),
            type: 'multiple_choice',
            prompt: 'What sound does this make?',
            correctAnswer: vowelSyllable(l, VOWELS[1]),
            choices: shuffle([vowelSyllable(l, VOWELS[1]), vowelSyllable(l, VOWELS[0]), ...syllableDistractors(l, VOWELS[1], letters)]),
            hint: vowelCombo(l.letter, VOWELS[1]),
        });
    }
    const round1: Lesson = { id: `${nodeId}-l1`, title: `Round 1: Fatha vs Kasra`, description: `Top vs Bottom marks`, exercises: r1 };

    // Round 2: Mixing all 3
    const r2: Exercise[] = [];
    
    // Add letter + vowel refreshers (DUOLINGO-STYLE)
    r2.push(...makeLetterRefreshers(3, nodeId));
    r2.push(...makeVowelRefreshers(2, nodeId, letters));
    
    r2.push({
        id: nextId(`${nodeId}-r2-intro`),
        type: 'introduction',
        prompt: `Now adding **Damma** (ُ)!`,
        correctAnswer: '',
        choices: [],
        hint: `Watch out for the little loop shape for the "u" sound.`,
    });
    for (const l of pick(letters, 6)) {
        const v = VOWELS[Math.floor(Math.random() * 3)];
        r2.push({
            id: nextId(`${nodeId}-r2`),
            type: 'tap_letter',
            prompt: `Tap "${vowelSyllable(l, v)}"`,
            correctAnswer: vowelCombo(l.letter, v),
            choices: shuffle([vowelCombo(l.letter, v), ...vowelDistractors(l, v, letters)]),
        });
    }
    const round2: Lesson = { id: `${nodeId}-l2`, title: `Round 2: All 3 Vowels`, description: `Mix them up`, exercises: r2 };

    // Round 3: Audio discrimination
    const r3: Exercise[] = [];
    
    // Add letter + vowel refreshers (DUOLINGO-STYLE)
    r3.push(...makeLetterRefreshers(4, nodeId));
    r3.push(...makeVowelRefreshers(3, nodeId, letters));
    
    for (const l of letters) {
        const v = VOWELS[Math.floor(Math.random() * 3)];
        r3.push({
            id: nextId(`${nodeId}-r3`),
            type: 'hear_choose',
            prompt: 'Listen — which syllable?',
            promptAudio: vowelCombo(l.letter, v),
            correctAnswer: vowelCombo(l.letter, v),
            choices: shuffle([vowelCombo(l.letter, v), ...vowelDistractors(l, v, letters)]),
        });
    }
    const round3: Lesson = { id: `${nodeId}-l3`, title: `Round 3: Hear the Mix`, description: `Audio discrimination`, exercises: shuffle(r3) };

    // Round 4: Match Pairs
    const r4: Exercise[] = [];
    
    // Add letter + vowel refreshers (DUOLINGO-STYLE)
    r4.push(...makeLetterRefreshers(5, nodeId));
    r4.push(...makeVowelRefreshers(4, nodeId, letters));
    
    r4.push({
        id: nextId(`${nodeId}-r4-mp`),
        type: 'match_pairs',
        prompt: `Match mixed syllables to sounds`,
        correctAnswer: '',
        choices: [],
        pairs: pick(letters, 6).map(l => {
            const v = VOWELS[Math.floor(Math.random() * 3)];
            return { left: vowelCombo(l.letter, v), right: vowelSyllable(l, v) };
        }),
    });
    r4.push({
        id: nextId(`${nodeId}-r4-mp-2`),
        type: 'match_pairs',
        prompt: `Match mixed syllables to sounds`,
        correctAnswer: '',
        choices: [],
        pairs: pick(letters, 6).map(l => {
            const v = VOWELS[Math.floor(Math.random() * 3)];
            return { left: vowelCombo(l.letter, v), right: vowelSyllable(l, v) };
        }),
    });
    const round4: Lesson = { id: `${nodeId}-l4`, title: `Round 4: Matching Mix`, description: `Connect the shapes and sounds`, exercises: r4 };
    
    // Add trap select for mixed vowels
    const trapLetter = letters[0];
    r4.push({
        id: nextId(`${nodeId}-r4-trap`),
        type: 'trap_select',
        prompt: `Careful! Which syllable makes "ba"?`,
        correctAnswer: vowelCombo(trapLetter.letter, VOWELS[0]),
        choices: shuffle([vowelCombo(trapLetter.letter, VOWELS[0]), vowelCombo(trapLetter.letter, VOWELS[1]), vowelCombo(trapLetter.letter, VOWELS[2])]),
        trapExplanation: `Watch the vowel mark! <strong class="arabic-text">${VOWELS[0].mark}</strong> (Fatha) = "a", <strong class="arabic-text">${VOWELS[1].mark}</strong> (Kasra) = "i", <strong class="arabic-text">${VOWELS[2].mark}</strong> (Damma) = "u".`,
    });
    
    // Add MORE mixed vowel traps (AGGRESSIVE)
    for (const l of pick(letters, 4)) {
        const randomVowel = VOWELS[Math.floor(Math.random() * 3)];
        r4.push(makeVowelTrapExercise(l, randomVowel, VOWELS, nodeId, Math.random() > 0.5));
    }

    // Round 5: Mastery Practice
    const r5: Exercise[] = [];
    
    // Add letter + vowel refreshers (DUOLINGO-STYLE)
    r5.push(...makeLetterRefreshers(6, nodeId));
    r5.push(...makeVowelRefreshers(5, nodeId, letters));
    
    for (const l of pick(letters, 6)) {
        for (const v of VOWELS) {
            r5.push({
                id: nextId(`${nodeId}-r5`),
                type: 'multiple_choice',
                prompt: 'What sound does this make?',
                correctAnswer: vowelSyllable(l, v),
                choices: shuffle([vowelSyllable(l, v), ...syllableDistractors(l, v, letters)]),
                hint: vowelCombo(l.letter, v),
            });
        }
    }
    
    // Add FINAL mixed vowel traps (AGGRESSIVE)
    for (const l of pick(letters, 5)) {
        const randomVowel = VOWELS[Math.floor(Math.random() * 3)];
        r5.push(makeVowelTrapExercise(l, randomVowel, VOWELS, nodeId, Math.random() > 0.5));
    }
    
    const round5: Lesson = { id: `${nodeId}-l5`, title: `Round 5: Mastery Practice`, description: `Show you've mastered them all!`, exercises: shuffle(r5) };

    return {
        id: nodeId,
        title: 'بَ تِ سُ',
        description: `Vowel MIX Mastery`,
        type: 'lesson',
        status: 'active',
        totalRounds: 5,
        completedRounds: 0,
        lessons: [round1, round2, round3, round4, round5],
    };
}

function makeUnit2Test(): CourseNode {
    const letters = pick(PRACTICE_LETTERS, 8);
    const exercises: Exercise[] = [];

    // Match pairs for each vowel
    for (const v of VOWELS) {
        exercises.push({
            id: nextId('u2t-mp'),
            type: 'match_pairs',
            prompt: `Match ${v.name} syllables to sounds`,
            correctAnswer: '',
            choices: [],
            pairs: pick(letters, 5).map(l => ({ left: vowelCombo(l.letter, v), right: vowelSyllable(l, v) })),
        });
    }

    // Linking: all letters × all vowels → what sound?
    for (const l of letters) {
        for (const v of VOWELS) {
            exercises.push({
                id: nextId('u2t'),
                type: 'multiple_choice',
                prompt: 'What sound does this make?',
                correctAnswer: vowelSyllable(l, v),
                choices: shuffle([vowelSyllable(l, v), ...syllableDistractors(l, v, letters)]),
                hint: vowelCombo(l.letter, v),
            });
        }
    }

    // Audio identification
    for (const l of pick(letters, 6)) {
        const v = VOWELS[Math.floor(Math.random() * 3)];
        exercises.push({
            id: nextId('u2t-audio'),
            type: 'hear_choose',
            prompt: 'Listen — what sound?',
            promptAudio: vowelCombo(l.letter, v),
            correctAnswer: vowelSyllable(l, v),
            choices: shuffle([vowelSyllable(l, v), ...syllableDistractors(l, v, letters)]),
        });
    }

    // Vowel identification
    for (const l of pick(letters, 6)) {
        const v = VOWELS[Math.floor(Math.random() * 3)];
        exercises.push({
            id: nextId('u2t-vowel'),
            type: 'multiple_choice',
            prompt: 'Which vowel is on this letter?',
            correctAnswer: v.name,
            choices: shuffle(VOWELS.map(x => x.name)),
            hint: vowelCombo(l.letter, v),
        });
    }

    return {
        id: 'u2-test',
        title: '📝 Unit 2 Test',
        description: 'Test all short vowels!',
        type: 'test',
        status: 'active',
        totalRounds: 1,
        completedRounds: 0,
        lessons: [{
            id: 'u2-test-lesson',
            title: 'Unit 2 Test',
            description: 'Prove you know all three short vowels',
            exercises: shuffle(exercises),
        }],
    };
}

// ═══════════════════════════════════════════════════════════
// CUMULATIVE TESTS — Cross-unit retention checks
// ═══════════════════════════════════════════════════════════

/**
 * CUMULATIVE TEST 1: After Unit 3 (Before Unit 4)
 * Tests: Letters (Unit 1) + Vowels (Unit 2) + Words (Unit 3)
 * Purpose: Ensure foundation is solid before vocabulary expansion
 */
function makeCumulativeTest1(): CourseNode {
    const exercises: Exercise[] = [];
    const letterPool = ALL_LETTERS.map(l => l.letter);
    const practiceLetters = pick(PRACTICE_LETTERS, 6);

    // === LETTERS (Unit 1) - 10 questions ===
    for (const l of pick(ALL_LETTERS, 5)) {
        exercises.push({
            id: nextId('cum1-letter'),
            type: 'tap_letter',
            prompt: `Refresher: Tap "${l.name}"`,
            correctAnswer: l.letter,
            choices: makeChoices(l.letter, letterPool),
        });
        exercises.push({
            id: nextId('cum1-letter-audio'),
            type: 'hear_choose',
            prompt: `Refresher: Listen and select`,
            promptAudio: l.letter + 'َ',
            correctAnswer: l.letter,
            choices: makeChoices(l.letter, letterPool),
        });
    }

    // === VOWELS (Unit 2) - 10 questions ===
    for (const l of practiceLetters) {
        const v = VOWELS[Math.floor(Math.random() * 3)];
        exercises.push({
            id: nextId('cum1-vowel'),
            type: 'multiple_choice',
            prompt: 'Refresher: What sound?',
            correctAnswer: vowelSyllable(l, v),
            choices: shuffle([vowelSyllable(l, v), ...syllableDistractors(l, v, practiceLetters)]),
            hint: vowelCombo(l.letter, v),
        });
    }
    for (const l of pick(practiceLetters, 4)) {
        const v = VOWELS[Math.floor(Math.random() * 3)];
        exercises.push({
            id: nextId('cum1-vowel-audio'),
            type: 'hear_choose',
            prompt: 'Refresher: Listen — what sound?',
            promptAudio: vowelCombo(l.letter, v),
            correctAnswer: vowelCombo(l.letter, v),
            choices: shuffle([vowelCombo(l.letter, v), ...vowelDistractors(l, v, practiceLetters)]),
        });
    }

    // === WORDS (Unit 3) - 10 questions ===
    for (const w of pick(UNIT3_WORDS, 5)) {
        exercises.push({
            id: nextId('cum1-word'),
            type: 'multiple_choice',
            prompt: `Refresher: What does this mean?`,
            correctAnswer: w.english,
            choices: shuffle([w.english, ...pick(UNIT3_WORDS.filter(ww => ww.english !== w.english).map(ww => ww.english), 3)]),
            hint: w.arabic,
        });
        exercises.push({
            id: nextId('cum1-word-audio'),
            type: 'hear_choose',
            prompt: `Refresher: Listen and select`,
            promptAudio: w.audio,
            correctAnswer: w.arabic,
            choices: shuffle([w.arabic, ...pick(UNIT3_WORDS.filter(ww => ww.arabic !== w.arabic).map(ww => ww.arabic), 3)]),
        });
    }

    return {
        id: 'cumulative-test-1',
        title: '📝 Cumulative Test 1',
        description: 'Review: Letters + Vowels + Words',
        type: 'test',
        status: 'locked',
        totalRounds: 1,
        completedRounds: 0,
        lessons: [{
            id: 'cum1-lesson',
            title: 'Foundation Review',
            description: 'Make sure you remember everything!',
            exercises: shuffle(exercises),
        }],
    };
}

/**
 * CUMULATIVE TEST 2: After Unit 6 (Before Unit 7)
 * Tests: Letters + Vowels + Voweled Words + Unvowelled Words + Sentences
 * Purpose: Ensure reading fluency before conversations
 */
function makeCumulativeTest2(): CourseNode {
    const exercises: Exercise[] = [];
    const letterPool = ALL_LETTERS.map(l => l.letter);
    const practiceLetters = pick(PRACTICE_LETTERS, 4);

    // === LETTERS + VOWELS - 5 questions ===
    for (const l of pick(ALL_LETTERS, 3)) {
        exercises.push({
            id: nextId('cum2-letter'),
            type: 'hear_choose',
            prompt: `Quick review: Listen`,
            promptAudio: l.letter + 'َ',
            correctAnswer: l.letter,
            choices: makeChoices(l.letter, letterPool),
        });
    }
    for (const l of pick(practiceLetters, 2)) {
        const v = VOWELS[Math.floor(Math.random() * 3)];
        exercises.push({
            id: nextId('cum2-vowel'),
            type: 'hear_choose',
            prompt: 'Quick review: What sound?',
            promptAudio: vowelCombo(l.letter, v),
            correctAnswer: vowelCombo(l.letter, v),
            choices: shuffle([vowelCombo(l.letter, v), ...vowelDistractors(l, v, practiceLetters)]),
        });
    }

    // === VOWELED WORDS (Unit 4, 4B, 4C) - 15 questions ===
    const allVocab = [...UNIT4_WORDS, ...UNIT4B_WORDS, ...UNIT4C_WORDS];
    for (const w of pick(allVocab, 15)) {
        exercises.push({
            id: nextId('cum2-word'),
            type: 'multiple_choice',
            prompt: `Review: What does this mean?`,
            correctAnswer: w.english,
            choices: shuffle([w.english, ...pick(allVocab.filter(ww => ww.english !== w.english).map(ww => ww.english), 3)]),
            hint: w.arabic,
            promptAudio: w.audio,
        });
    }

    // === UNVOWELLED WORDS (Unit 5) - 15 questions ===
    for (const w of pick(allVocab, 15)) {
        exercises.push({
            id: nextId('cum2-unvowelled'),
            type: 'multiple_choice',
            prompt: `Review: What does this mean?`,
            correctAnswer: w.english,
            choices: shuffle([w.english, ...pick(allVocab.filter(ww => ww.english !== w.english).map(ww => ww.english), 3)]),
            hint: stripHarakat(w.arabic),
            promptAudio: w.audio,
        });
    }

    // === SENTENCES (Unit 6) - 15 questions ===
    for (const s of pick(UNIT6_SENTENCES, 15)) {
        exercises.push({
            id: nextId('cum2-sentence'),
            type: 'multiple_choice',
            prompt: `Review: What does this mean?`,
            correctAnswer: s.english,
            choices: shuffle([s.english, ...pick(UNIT6_SENTENCES.filter(ss => ss.english !== s.english).map(ss => ss.english), 3)]),
            hint: s.arabic,
            promptAudio: s.audio,
        });
    }

    return {
        id: 'cumulative-test-2',
        title: '📝 Cumulative Test 2',
        description: 'Review: Reading Mastery',
        type: 'test',
        status: 'locked',
        totalRounds: 1,
        completedRounds: 0,
        lessons: [{
            id: 'cum2-lesson',
            title: 'Reading Fluency Check',
            description: 'Prove you can read everything!',
            exercises: shuffle(exercises),
        }],
    };
}

/**
 * FINAL COMPREHENSIVE TEST: After Unit 9
 * Tests: Everything from all 9 units
 * Purpose: Certificate of completion
 */
function makeFinalComprehensiveTest(): CourseNode {
    const exercises: Exercise[] = [];
    const letterPool = ALL_LETTERS.map(l => l.letter);
    const practiceLetters = pick(PRACTICE_LETTERS, 3);

    // === LETTERS - 5 questions ===
    for (const l of pick(ALL_LETTERS, 5)) {
        exercises.push({
            id: nextId('final-letter'),
            type: 'hear_choose',
            prompt: `Final check: Listen`,
            promptAudio: l.letter + 'َ',
            correctAnswer: l.letter,
            choices: makeChoices(l.letter, letterPool),
        });
    }

    // === VOWELS - 5 questions ===
    for (const l of practiceLetters) {
        const v = VOWELS[Math.floor(Math.random() * 3)];
        exercises.push({
            id: nextId('final-vowel'),
            type: 'multiple_choice',
            prompt: 'Final check: What sound?',
            correctAnswer: vowelSyllable(l, v),
            choices: shuffle([vowelSyllable(l, v), ...syllableDistractors(l, v, practiceLetters)]),
            hint: vowelCombo(l.letter, v),
        });
    }
    for (const l of pick(practiceLetters, 2)) {
        const v = VOWELS[Math.floor(Math.random() * 3)];
        exercises.push({
            id: nextId('final-vowel-audio'),
            type: 'hear_choose',
            prompt: 'Final check: Listen',
            promptAudio: vowelCombo(l.letter, v),
            correctAnswer: vowelCombo(l.letter, v),
            choices: shuffle([vowelCombo(l.letter, v), ...vowelDistractors(l, v, practiceLetters)]),
        });
    }

    // === VOCABULARY - 20 questions ===
    const allVocab = [...UNIT3_WORDS, ...UNIT4_WORDS, ...UNIT4B_WORDS, ...UNIT4C_WORDS];
    for (const w of pick(allVocab, 20)) {
        exercises.push({
            id: nextId('final-vocab'),
            type: 'multiple_choice',
            prompt: `What does this mean?`,
            correctAnswer: w.english,
            choices: shuffle([w.english, ...pick(allVocab.filter(ww => ww.english !== w.english).map(ww => ww.english), 3)]),
            hint: stripHarakat(w.arabic),
            promptAudio: w.audio,
        });
    }

    // === SENTENCES - 15 questions ===
    for (const s of pick(UNIT6_SENTENCES, 15)) {
        exercises.push({
            id: nextId('final-sentence'),
            type: 'multiple_choice',
            prompt: `What does this mean?`,
            correctAnswer: s.english,
            choices: shuffle([s.english, ...pick(UNIT6_SENTENCES.filter(ss => ss.english !== s.english).map(ss => ss.english), 3)]),
            hint: s.arabic,
            promptAudio: s.audio,
        });
    }

    // === CONVERSATIONS - 10 questions ===
    const allConvLines = [...UNIT7_CONVERSATIONS, ...UNIT8_CONVERSATIONS].flatMap(c => c.lines);
    for (const line of pick(allConvLines, 10)) {
        exercises.push({
            id: nextId('final-conv'),
            type: 'multiple_choice',
            prompt: `What does this mean?`,
            correctAnswer: line.english,
            choices: shuffle([line.english, ...pick(allConvLines.filter(l => l.english !== line.english).map(l => l.english), 3)]),
            hint: line.arabic,
            promptAudio: line.audio,
        });
    }

    // === QURAN - 5 questions ===
    const allVerses = UNIT9_QURAN_VERSES.filter(v => [1, 103, 108, 112, 113, 114].includes(v.surahNumber));
    for (const verse of pick(allVerses, 5)) {
        exercises.push({
            id: nextId('final-quran'),
            type: 'multiple_choice',
            prompt: `What does this verse mean?`,
            correctAnswer: verse.translation,
            choices: shuffle([verse.translation, ...pick(allVerses.filter(v => v.translation !== verse.translation).map(v => v.translation), 3)]),
            hint: verse.arabic,
            promptAudio: verse.audio,
        });
    }

    return {
        id: 'final-comprehensive-test',
        title: '🏆 Final Comprehensive Test',
        description: 'Complete Mastery Assessment',
        type: 'test',
        status: 'locked',
        totalRounds: 1,
        completedRounds: 0,
        lessons: [{
            id: 'final-lesson',
            title: 'Certificate of Completion',
            description: 'Prove you have mastered Arabic reading!',
            exercises: shuffle(exercises),
        }],
    };
}

// ═══════════════════════════════════════════════════════════
// UNIT 3: LETTER CONNECTIONS & WORD ASSEMBLY
// ═══════════════════════════════════════════════════════════

interface WordData {
    arabic: string;
    translit: string;
    english: string;
    audio: string;
}

const UNIT3_WORDS: WordData[] = [
    // Node 1: First Words
    { arabic: 'بَابٌ', translit: 'Baabun', english: 'Door', audio: '/audio/words/word_bab.mp3' },
    { arabic: 'بَيْتٌ', translit: 'Baytun', english: 'House', audio: '/audio/words/word_bayt.mp3' },
    { arabic: 'بِنْتٌ', translit: 'Bintun', english: 'Girl', audio: '/audio/words/word_bint.mp3' },
    { arabic: 'تَمْرٌ', translit: 'Tamrun', english: 'Dates', audio: '/audio/words/word_tamr.mp3' },

    // Node 2: Nature & Animals
    { arabic: 'كَلْبٌ', translit: 'Kalbun', english: 'Dog', audio: '/audio/words/word_kalb.mp3' },
    { arabic: 'شَمْسٌ', translit: 'Shamsun', english: 'Sun', audio: '/audio/words/word_shams.mp3' },
    { arabic: 'قَمَرٌ', translit: 'Qamarun', english: 'Moon', audio: '/audio/words/word_qamar.mp3' },
    { arabic: 'مَاءٌ', translit: 'Maa\'un', english: 'Water', audio: '/audio/words/word_maa.mp3' },

    // Node 3: People & Things
    { arabic: 'وَلَدٌ', translit: 'Waladun', english: 'Boy', audio: '/audio/words/word_walad.mp3' },
    { arabic: 'رَجُلٌ', translit: 'Rajulun', english: 'Man', audio: '/audio/words/word_rajul.mp3' },
    { arabic: 'كِتَابٌ', translit: 'Kitaabun', english: 'Book', audio: '/audio/words/word_kitab.mp3' },
    { arabic: 'خُبْزٌ', translit: 'Khubzun', english: 'Bread', audio: '/audio/words/word_khubz.mp3' },

    // Node 4: Body Parts (Tricky Connections: ع, ه, أ)
    { arabic: 'عَيْنٌ', translit: 'Aynun', english: 'Eye', audio: '/audio/words/word_ayn.mp3' },     // Middle Ya, Initial Ayn
    { arabic: 'وَجْهٌ', translit: 'Wajhun', english: 'Face', audio: '/audio/words/word_wajh.mp3' },   // Final Haa
    { arabic: 'رَأْسٌ', translit: 'Ra\'sun', english: 'Head', audio: '/audio/words/word_raas.mp3' },   // Non-connectors, Hamza on Alif
    { arabic: 'فَمٌ', translit: 'Famun', english: 'Mouth', audio: '/audio/words/word_fam.mp3' },     // Initial Fa, Final Mim
    { arabic: 'يَدٌ', translit: 'Yadun', english: 'Hand', audio: '/audio/words/word_yad.mp3' },      // Initial Ya, Final Dal

    // Node 5: Common Adjectives (Tricky Medial Connections)
    { arabic: 'كَبِيرٌ', translit: 'Kabeerun', english: 'Big', audio: '/audio/words/word_kabeer.mp3' },       // Initial Kaaf, Medial Baa
    { arabic: 'صَغِيرٌ', translit: 'Sagheerun', english: 'Small', audio: '/audio/words/word_sagheer.mp3' },   // Medial Ghayn
    { arabic: 'جَدِيدٌ', translit: 'Jadeedun', english: 'New', audio: '/audio/words/word_jadeed.mp3' },       // Medial Dal (non connector)
    { arabic: 'قَدِيمٌ', translit: 'Qadeemun', english: 'Old', audio: '/audio/words/word_qadeem.mp3' },       // Medial Dal, Final Mim
    { arabic: 'جَمِيلٌ', translit: 'Jameelun', english: 'Beautiful', audio: '/audio/words/word_jameel.mp3' }  // Medial Mim
];

// UNIT 4: CORE VOCABULARY (STAGE 4 EXPANSION)
const UNIT4_WORDS: WordData[] = [
    // Category 1: Home & Basics
    { arabic: 'بَيْتٌ', translit: 'Baytun', english: 'House', audio: '/audio/words/word_bayt.mp3' },
    { arabic: 'بَابٌ', translit: 'Baabun', english: 'Door', audio: '/audio/words/word_bab.mp3' },
    { arabic: 'كَبِيرٌ', translit: 'Kabeerun', english: 'Big', audio: '/audio/words/word_kabeer.mp3' },
    { arabic: 'صَغِيرٌ', translit: 'Sagheerun', english: 'Small', audio: '/audio/words/word_sagheer.mp3' },

    // Category 2: Family
    { arabic: 'أَبٌ', translit: 'Abun', english: 'Father', audio: '/audio/words/fam_father.mp3' },
    { arabic: 'أُمٌّ', translit: 'Ummun', english: 'Mother', audio: '/audio/words/fam_mother.mp3' },
    { arabic: 'أَخٌ', translit: 'Akhun', english: 'Brother', audio: '/audio/words/fam_brother.mp3' },
    { arabic: 'أُخْتٌ', translit: 'Ukhtun', english: 'Sister', audio: '/audio/words/fam_sister.mp3' },

    // Category 3: Eat & Drink
    { arabic: 'مَاءٌ', translit: 'Maa\'un', english: 'Water', audio: '/audio/words/word_maa.mp3' },
    { arabic: 'خُبْزٌ', translit: 'Khubzun', english: 'Bread', audio: '/audio/words/word_khubz.mp3' },
    { arabic: 'تُفَّاحٌ', translit: 'Tuffahun', english: 'Apple', audio: '/audio/words/food_apple.mp3' },
    { arabic: 'حَلِيبٌ', translit: 'Haleebun', english: 'Milk', audio: '/audio/words/drink_milk.mp3' },

    // Category 4: Places
    { arabic: 'مَدْرَسَةٌ', translit: 'Madrasatun', english: 'School', audio: '/audio/words/place_school.mp3' },
    { arabic: 'مَسْجِدٌ', translit: 'Masjidun', english: 'Mosque', audio: '/audio/words/place_mosque.mp3' },
    { arabic: 'مُسْتَشْفَى', translit: 'Mustashfa', english: 'Hospital', audio: '/audio/words/place_hospital.mp3' },
    { arabic: 'سُوقٌ', translit: 'Suqun', english: 'Market', audio: '/audio/words/place_market.mp3' },

    // Category 5: Time & Numbers (NEW - 8 words)
    { arabic: 'يَوْمٌ', translit: 'Yawmun', english: 'Day', audio: '/audio/words/time_day.mp3' },
    { arabic: 'لَيْلَةٌ', translit: 'Laylatun', english: 'Night', audio: '/audio/words/time_night.mp3' },
    { arabic: 'سَاعَةٌ', translit: 'Saa\'atun', english: 'Hour', audio: '/audio/words/time_hour.mp3' },
    { arabic: 'أُسْبُوعٌ', translit: 'Usboo\'un', english: 'Week', audio: '/audio/words/time_week.mp3' },
    { arabic: 'شَهْرٌ', translit: 'Shahrun', english: 'Month', audio: '/audio/words/time_month.mp3' },
    { arabic: 'سَنَةٌ', translit: 'Sanatun', english: 'Year', audio: '/audio/words/time_year.mp3' },
    { arabic: 'وَاحِدٌ', translit: 'Waahidun', english: 'One', audio: '/audio/words/num_one.mp3' },
    { arabic: 'اِثْنَانِ', translit: 'Ithnaani', english: 'Two', audio: '/audio/words/num_two.mp3' },

    // Category 6: Actions/Verbs (NEW - 8 words)
    { arabic: 'ذَهَبَ', translit: 'Dhahaba', english: 'Went', audio: '/audio/words/verb_went.mp3' },
    { arabic: 'جَاءَ', translit: 'Jaa\'a', english: 'Came', audio: '/audio/words/verb_came.mp3' },
    { arabic: 'أَكَلَ', translit: 'Akala', english: 'Ate', audio: '/audio/words/verb_ate.mp3' },
    { arabic: 'شَرِبَ', translit: 'Shariba', english: 'Drank', audio: '/audio/words/verb_drank.mp3' },
    { arabic: 'كَتَبَ', translit: 'Kataba', english: 'Wrote', audio: '/audio/words/verb_wrote.mp3' },
    { arabic: 'قَرَأَ', translit: 'Qara\'a', english: 'Read', audio: '/audio/words/verb_read.mp3' },
    { arabic: 'نَامَ', translit: 'Naama', english: 'Slept', audio: '/audio/words/verb_slept.mp3' },
    { arabic: 'قَالَ', translit: 'Qaala', english: 'Said', audio: '/audio/words/verb_said.mp3' },

    // Category 7: Adjectives (NEW - 8 words)
    { arabic: 'جَمِيلٌ', translit: 'Jameelun', english: 'Beautiful', audio: '/audio/words/adj_beautiful.mp3' },
    { arabic: 'قَبِيحٌ', translit: 'Qabeehun', english: 'Ugly', audio: '/audio/words/adj_ugly.mp3' },
    { arabic: 'طَوِيلٌ', translit: 'Taweelun', english: 'Tall', audio: '/audio/words/adj_tall.mp3' },
    { arabic: 'قَصِيرٌ', translit: 'Qaseerun', english: 'Short', audio: '/audio/words/adj_short.mp3' },
    { arabic: 'سَرِيعٌ', translit: 'Saree\'un', english: 'Fast', audio: '/audio/words/adj_fast.mp3' },
    { arabic: 'بَطِيءٌ', translit: 'Batee\'un', english: 'Slow', audio: '/audio/words/adj_slow.mp3' },
    { arabic: 'سَهْلٌ', translit: 'Sahlun', english: 'Easy', audio: '/audio/words/adj_easy.mp3' },
    { arabic: 'صَعْبٌ', translit: 'Sa\'bun', english: 'Difficult', audio: '/audio/words/adj_difficult.mp3' }
];

// UNIT 4B: EXTENDED VOCABULARY (NEW UNIT - 40 words)
const UNIT4B_WORDS: WordData[] = [
    // Category 1: Body Parts Extended (10 words)
    { arabic: 'أُذُنٌ', translit: 'Udhunun', english: 'Ear', audio: '/audio/words/body_ear.mp3' },
    { arabic: 'أَنْفٌ', translit: 'Anfun', english: 'Nose', audio: '/audio/words/body_nose.mp3' },
    { arabic: 'فَمٌ', translit: 'Famun', english: 'Mouth', audio: '/audio/words/body_mouth.mp3' },
    { arabic: 'لِسَانٌ', translit: 'Lisaanun', english: 'Tongue', audio: '/audio/words/body_tongue.mp3' },
    { arabic: 'سِنٌّ', translit: 'Sinnun', english: 'Tooth', audio: '/audio/words/body_tooth.mp3' },
    { arabic: 'شَعْرٌ', translit: 'Sha\'run', english: 'Hair', audio: '/audio/words/body_hair.mp3' },
    { arabic: 'رِجْلٌ', translit: 'Rijlun', english: 'Leg', audio: '/audio/words/body_leg.mp3' },
    { arabic: 'إِصْبَعٌ', translit: 'Isba\'un', english: 'Finger', audio: '/audio/words/body_finger.mp3' },
    { arabic: 'قَلْبٌ', translit: 'Qalbun', english: 'Heart', audio: '/audio/words/body_heart.mp3' },
    { arabic: 'ظَهْرٌ', translit: 'Dhahrun', english: 'Back', audio: '/audio/words/body_back.mp3' },

    // Category 2: Colors (10 words)
    { arabic: 'أَبْيَضُ', translit: 'Abyadu', english: 'White', audio: '/audio/words/color_white.mp3' },
    { arabic: 'أَسْوَدُ', translit: 'Aswadu', english: 'Black', audio: '/audio/words/color_black.mp3' },
    { arabic: 'أَحْمَرُ', translit: 'Ahmaru', english: 'Red', audio: '/audio/words/color_red.mp3' },
    { arabic: 'أَخْضَرُ', translit: 'Akhdaru', english: 'Green', audio: '/audio/words/color_green.mp3' },
    { arabic: 'أَزْرَقُ', translit: 'Azraqu', english: 'Blue', audio: '/audio/words/color_blue.mp3' },
    { arabic: 'أَصْفَرُ', translit: 'Asfaru', english: 'Yellow', audio: '/audio/words/color_yellow.mp3' },
    { arabic: 'بُنِّيٌّ', translit: 'Bunniyyun', english: 'Brown', audio: '/audio/words/color_brown.mp3' },
    { arabic: 'رَمَادِيٌّ', translit: 'Ramaadiyyun', english: 'Gray', audio: '/audio/words/color_gray.mp3' },
    { arabic: 'بُرْتُقَالِيٌّ', translit: 'Burtuqaaliyyun', english: 'Orange', audio: '/audio/words/color_orange.mp3' },
    { arabic: 'وَرْدِيٌّ', translit: 'Wardiyyun', english: 'Pink', audio: '/audio/words/color_pink.mp3' },

    // Category 3: Nature & Weather (10 words)
    { arabic: 'سَمَاءٌ', translit: 'Samaa\'un', english: 'Sky', audio: '/audio/words/nature_sky.mp3' },
    { arabic: 'أَرْضٌ', translit: 'Ardun', english: 'Earth', audio: '/audio/words/nature_earth.mp3' },
    { arabic: 'جَبَلٌ', translit: 'Jabalun', english: 'Mountain', audio: '/audio/words/nature_mountain.mp3' },
    { arabic: 'بَحْرٌ', translit: 'Bahrun', english: 'Sea', audio: '/audio/words/nature_sea.mp3' },
    { arabic: 'نَهْرٌ', translit: 'Nahrun', english: 'River', audio: '/audio/words/nature_river.mp3' },
    { arabic: 'شَجَرَةٌ', translit: 'Shajaratun', english: 'Tree', audio: '/audio/words/nature_tree.mp3' },
    { arabic: 'زَهْرَةٌ', translit: 'Zahratun', english: 'Flower', audio: '/audio/words/nature_flower.mp3' },
    { arabic: 'مَطَرٌ', translit: 'Matarun', english: 'Rain', audio: '/audio/words/weather_rain.mp3' },
    { arabic: 'رِيحٌ', translit: 'Reehun', english: 'Wind', audio: '/audio/words/weather_wind.mp3' },
    { arabic: 'غَيْمٌ', translit: 'Ghaymun', english: 'Cloud', audio: '/audio/words/weather_cloud.mp3' },

    // Category 4: Common Objects (10 words)
    { arabic: 'قَلَمٌ', translit: 'Qalamun', english: 'Pen', audio: '/audio/words/obj_pen.mp3' },
    { arabic: 'وَرَقَةٌ', translit: 'Waraqatun', english: 'Paper', audio: '/audio/words/obj_paper.mp3' },
    { arabic: 'طَاوِلَةٌ', translit: 'Taawilatun', english: 'Table', audio: '/audio/words/obj_table.mp3' },
    { arabic: 'كُرْسِيٌّ', translit: 'Kursiyyun', english: 'Chair', audio: '/audio/words/obj_chair.mp3' },
    { arabic: 'نَافِذَةٌ', translit: 'Naafidhatun', english: 'Window', audio: '/audio/words/obj_window.mp3' },
    { arabic: 'سَاعَةٌ', translit: 'Saa\'atun', english: 'Clock', audio: '/audio/words/obj_clock.mp3' },
    { arabic: 'مِفْتَاحٌ', translit: 'Miftaahun', english: 'Key', audio: '/audio/words/obj_key.mp3' },
    { arabic: 'هَاتِفٌ', translit: 'Haatifun', english: 'Phone', audio: '/audio/words/obj_phone.mp3' },
    { arabic: 'حَقِيبَةٌ', translit: 'Haqeebatun', english: 'Bag', audio: '/audio/words/obj_bag.mp3' },
    { arabic: 'سَيَّارَةٌ', translit: 'Sayyaaratun', english: 'Car', audio: '/audio/words/obj_car.mp3' }
];

// UNIT 4C: ADVANCED VOCABULARY (NEW UNIT - 40 words)
const UNIT4C_WORDS: WordData[] = [
    // Category 1: Directions & Places (10 words)
    { arabic: 'يَمِينٌ', translit: 'Yameenun', english: 'Right', audio: '/audio/words/dir_right.mp3' },
    { arabic: 'يَسَارٌ', translit: 'Yasaarun', english: 'Left', audio: '/audio/words/dir_left.mp3' },
    { arabic: 'فَوْقَ', translit: 'Fawqa', english: 'Above', audio: '/audio/words/dir_above.mp3' },
    { arabic: 'تَحْتَ', translit: 'Tahta', english: 'Below', audio: '/audio/words/dir_below.mp3' },
    { arabic: 'أَمَامَ', translit: 'Amaama', english: 'Front', audio: '/audio/words/dir_front.mp3' },
    { arabic: 'خَلْفَ', translit: 'Khalfa', english: 'Behind', audio: '/audio/words/dir_behind.mp3' },
    { arabic: 'دَاخِلَ', translit: 'Daakhila', english: 'Inside', audio: '/audio/words/dir_inside.mp3' },
    { arabic: 'خَارِجَ', translit: 'Khaarija', english: 'Outside', audio: '/audio/words/dir_outside.mp3' },
    { arabic: 'قَرِيبٌ', translit: 'Qareebun', english: 'Near', audio: '/audio/words/dir_near.mp3' },
    { arabic: 'بَعِيدٌ', translit: 'Ba\'eedun', english: 'Far', audio: '/audio/words/dir_far.mp3' },

    // Category 2: People & Relationships (10 words)
    { arabic: 'رَجُلٌ', translit: 'Rajulun', english: 'Man', audio: '/audio/words/word_rajul.mp3' },
    { arabic: 'اِمْرَأَةٌ', translit: 'Imra\'atun', english: 'Woman', audio: '/audio/words/people_woman.mp3' },
    { arabic: 'وَلَدٌ', translit: 'Waladun', english: 'Boy', audio: '/audio/words/word_walad.mp3' },
    { arabic: 'طِفْلٌ', translit: 'Tiflun', english: 'Child', audio: '/audio/words/people_child.mp3' },
    { arabic: 'صَدِيقٌ', translit: 'Sadeequn', english: 'Friend', audio: '/audio/words/people_friend.mp3' },
    { arabic: 'مُعَلِّمٌ', translit: 'Mu\'allimun', english: 'Teacher', audio: '/audio/words/people_teacher.mp3' },
    { arabic: 'طَالِبٌ', translit: 'Taalibun', english: 'Student', audio: '/audio/words/people_student.mp3' },
    { arabic: 'طَبِيبٌ', translit: 'Tabeebun', english: 'Doctor', audio: '/audio/words/people_doctor.mp3' },
    { arabic: 'جَارٌ', translit: 'Jaarun', english: 'Neighbor', audio: '/audio/words/people_neighbor.mp3' },
    { arabic: 'ضَيْفٌ', translit: 'Dayfun', english: 'Guest', audio: '/audio/words/people_guest.mp3' },

    // Category 3: Actions Extended (10 words)
    { arabic: 'فَتَحَ', translit: 'Fataha', english: 'Opened', audio: '/audio/words/verb_opened.mp3' },
    { arabic: 'أَغْلَقَ', translit: 'Aghlaqa', english: 'Closed', audio: '/audio/words/verb_closed.mp3' },
    { arabic: 'جَلَسَ', translit: 'Jalasa', english: 'Sat', audio: '/audio/words/verb_sat.mp3' },
    { arabic: 'وَقَفَ', translit: 'Waqafa', english: 'Stood', audio: '/audio/words/verb_stood.mp3' },
    { arabic: 'مَشَى', translit: 'Mashaa', english: 'Walked', audio: '/audio/words/verb_walked.mp3' },
    { arabic: 'رَكَضَ', translit: 'Rakada', english: 'Ran', audio: '/audio/words/verb_ran.mp3' },
    { arabic: 'سَمِعَ', translit: 'Sami\'a', english: 'Heard', audio: '/audio/words/verb_heard.mp3' },
    { arabic: 'رَأَى', translit: 'Ra\'aa', english: 'Saw', audio: '/audio/words/verb_saw.mp3' },
    { arabic: 'فَهِمَ', translit: 'Fahima', english: 'Understood', audio: '/audio/words/verb_understood.mp3' },
    { arabic: 'عَرَفَ', translit: 'Arafa', english: 'Knew', audio: '/audio/words/verb_knew.mp3' },

    // Category 4: Common Expressions (10 words)
    { arabic: 'نَعَمْ', translit: 'Na\'am', english: 'Yes', audio: '/audio/words/expr_yes.mp3' },
    { arabic: 'لَا', translit: 'Laa', english: 'No', audio: '/audio/words/expr_no.mp3' },
    { arabic: 'مِنْ فَضْلِكَ', translit: 'Min fadlika', english: 'Please', audio: '/audio/words/expr_please.mp3' },
    { arabic: 'شُكْرًا', translit: 'Shukran', english: 'Thanks', audio: '/audio/words/expr_thanks.mp3' },
    { arabic: 'عَفْوًا', translit: '\'Afwan', english: 'Welcome', audio: '/audio/words/expr_welcome.mp3' },
    { arabic: 'آسِفٌ', translit: 'Aasifun', english: 'Sorry', audio: '/audio/words/expr_sorry.mp3' },
    { arabic: 'مَعَ', translit: 'Ma\'a', english: 'With', audio: '/audio/words/expr_with.mp3' },
    { arabic: 'بِدُونِ', translit: 'Bidooni', english: 'Without', audio: '/audio/words/expr_without.mp3' },
    { arabic: 'أَيْضًا', translit: 'Aydan', english: 'Also', audio: '/audio/words/expr_also.mp3' },
    { arabic: 'لَكِنْ', translit: 'Laakin', english: 'But', audio: '/audio/words/expr_but.mp3' }
];

// ═══════════════════════════════════════════════════════════
// WORD CONFUSION PAIRS - For trap exercises
// ═══════════════════════════════════════════════════════════

const WORD_CONFUSION_GROUPS: Record<string, string[]> = {
    // Similar letters
    'باب': ['بيت', 'بنت'],  // door vs house vs girl (all start with ب)
    'بيت': ['باب', 'بنت'],  // house vs door vs girl
    'بنت': ['باب', 'بيت'],  // girl vs door vs house
    
    // Similar shapes
    'كلب': ['كتب', 'قلب'],  // dog vs books vs heart (ك/ق confusion)
    'شمس': ['شهر', 'سمك'],  // sun vs month vs fish (س/ش confusion)
    'قمر': ['قلب', 'كلب'],  // moon vs heart vs dog (ق/ك confusion)
    
    // Similar sounds
    'تمر': ['تمن', 'ثمر'],  // dates vs price vs fruit (ت/ث confusion)
    'ولد': ['والد', 'ولد'],  // boy vs father (vowel confusion)
    'رجل': ['رجال', 'رحل'],  // man vs men vs departed
    
    // Body parts (similar structure)
    'عين': ['أذن', 'يد'],   // eye vs ear vs hand
    'وجه': ['فم', 'رأس'],   // face vs mouth vs head
    'يد': ['رجل', 'عين'],   // hand vs leg vs eye
    
    // Adjectives (similar patterns)
    'كبير': ['صغير', 'كثير'],  // big vs small vs many
    'صغير': ['كبير', 'قصير'],  // small vs big vs short
    'جديد': ['قديم', 'بعيد'],  // new vs old vs far
    'قديم': ['جديد', 'كريم'],  // old vs new vs generous
    'جميل': ['جليل', 'قليل'],  // beautiful vs great vs few
    
    // Family (similar structure)
    'أب': ['أم', 'أخ'],      // father vs mother vs brother
    'أم': ['أب', 'أخت'],     // mother vs father vs sister
    'أخ': ['أب', 'أخت'],     // brother vs father vs sister
    'أخت': ['أم', 'أخ'],     // sister vs mother vs brother
    
    // Food (similar structure)
    'ماء': ['حليب', 'خبز'],  // water vs milk vs bread
    'خبز': ['ماء', 'تمر'],   // bread vs water vs dates
    'تفاح': ['تمر', 'خبز'],  // apple vs dates vs bread
    'حليب': ['ماء', 'خبز'],  // milk vs water vs bread
    
    // Places (all start with م)
    'مدرسة': ['مسجد', 'مستشفى'],  // school vs mosque vs hospital
    'مسجد': ['مدرسة', 'سوق'],     // mosque vs school vs market
    'مستشفى': ['مدرسة', 'مسجد'],  // hospital vs school vs mosque
    'سوق': ['مسجد', 'مدرسة'],     // market vs mosque vs school
};

function makeWordAssemblyExercises(word: WordData, nodeId: string): Exercise[] {
    const letters = word.arabic.split(''); // Breaks into char array
    // Add one distractor letter
    const distractorLetters = ['ا', 'ب', 'ت', 'ث', 'ج', 'ح', 'خ', 'د', 'ر', 'س', 'ش', 'م', 'ن', 'ه', 'و', 'ي'];
    const distactor = distractorLetters.find(l => !letters.includes(l)) || 'م';
    const choices = shuffle([...letters, distactor]);

    return [
        {
            id: nextId(`${nodeId}-intro`),
            type: 'introduction',
            prompt: `Assemble: **${word.english}** (${word.translit})`,
            correctAnswer: word.arabic,
            choices: [],
            hint: `Notice how the letters connect:\n${letters.join(' + ')} = ${word.arabic}`,
        },
        {
            id: nextId(`${nodeId}-assembly`),
            type: 'word_assembly',
            prompt: `Tap the letters to spell: **${word.english}**`,
            correctAnswer: word.arabic,
            choices: choices,
        },
        {
            id: nextId(`${nodeId}-hear`),
            type: 'hear_choose',
            prompt: `Listen and select the word`,
            promptAudio: word.audio,
            correctAnswer: word.arabic,
            choices: shuffle([word.arabic, ...pick(UNIT3_WORDS.map(w => w.arabic).filter(w => w !== word.arabic), 3)]),
        }
    ];
}

function makeWordAssemblyNode(nodeId: string, title: string, words: WordData[], requireReview: boolean = false): CourseNode {
    const intros: Exercise[] = [];
    const assemblies: Exercise[] = [];
    const hears: Exercise[] = [];

    words.forEach(w => {
        const exs = makeWordAssemblyExercises(w, nodeId);
        intros.push(exs[0]);
        assemblies.push(exs[1]);
        hears.push(exs[2]);
    });

    const refreshers: Exercise[] = [];
    
    // ALWAYS add letter and vowel refreshers (DUOLINGO-STYLE)
    refreshers.push(...makeLetterRefreshers(3, nodeId));
    refreshers.push(...makeVowelRefreshers(2, nodeId, PRACTICE_LETTERS));
    
    // Add word refreshers from PREVIOUS nodes (CRITICAL FOR RETENTION)
    refreshers.push(...makeWordRefreshers(4, nodeId));
    
    if (requireReview) {
        // Add some basic letter/vowel refreshers
        const reviewLetters = pick(ALL_LETTERS, 3);
        reviewLetters.forEach(l => {
            refreshers.push({
                id: nextId(`${nodeId}-ref`),
                type: 'tap_letter',
                prompt: `Refresher: Tap "${l.name}"`,
                correctAnswer: l.letter,
                choices: makeChoices(l.letter, ALL_LETTERS.map(x => x.letter)),
            });
        });
    }
    
    // Register these words as learned (DUOLINGO-STYLE)
    words.forEach(w => {
        if (!LEARNED_CONTENT.words.find(ww => ww.arabic === w.arabic)) {
            LEARNED_CONTENT.words.push(w);
        }
    });

    const lessons: Lesson[] = [];

    // Grouping strictly to teach the words FIRST
    lessons.push({
        id: `${nodeId}-l1`,
        title: `Round 1: Meet the Words`,
        description: `Learn the connecting letters.`,
        exercises: [...intros, ...shuffle([...assemblies, ...refreshers.slice(0, 3)])]
    });

    lessons.push({
        id: `${nodeId}-l2`,
        title: `Round 2: Hearing`,
        description: `Listen and select.`,
        exercises: [...shuffle([...hears, ...refreshers.slice(3, 7)])]
    });

    lessons.push({
        id: `${nodeId}-l3`,
        title: `Round 3: Assembly Review`,
        description: `Build words from scratch.`,
        exercises: shuffle([...assemblies, ...assemblies, ...hears, ...refreshers.slice(7, 10)])
    });

    lessons.push({
        id: `${nodeId}-l4`,
        title: `Round 4: More Assembly`,
        description: `Build and listen.`,
        exercises: shuffle([...assemblies, ...assemblies, ...hears, ...refreshers.slice(10)])
    });

    // Add match pairs for word meanings
    const matchPairsEx: Exercise = {
        id: nextId(`${nodeId}-l5-mp`),
        type: 'match_pairs',
        prompt: `Match Arabic words to English meanings`,
        correctAnswer: '',
        choices: [],
        pairs: words.map(w => ({ left: w.arabic, right: w.english })),
    };
    
    // Add trap select for similar words
    if (words.length >= 2) {
        const trapEx: Exercise = {
            id: nextId(`${nodeId}-l5-trap`),
            type: 'trap_select',
            prompt: `Careful! Which word means "${words[0].english}"?`,
            correctAnswer: words[0].arabic,
            choices: shuffle([words[0].arabic, words[1].arabic, words[2]?.arabic || words[1].arabic]),
            trapExplanation: `<strong class="arabic-text">${words[0].arabic}</strong> means "${words[0].english}", not "${words[1].english}".`,
        };
        
        // Add MORE word confusion traps (AGGRESSIVE)
        const wordTraps: Exercise[] = [trapEx];
        for (const w of words) {
            // Find confusable words from the confusion groups
            const confusables = WORD_CONFUSION_GROUPS[w.arabic.replace(/[ًٌٍَُِّْ]/g, '')];
            if (confusables) {
                const confusableWords = words.filter(ww => 
                    confusables.some(c => ww.arabic.replace(/[ًٌٍَُِّْ]/g, '').includes(c))
                );
                if (confusableWords.length > 0) {
                    wordTraps.push(makeWordConfusionTrap(w, confusableWords.slice(0, 2), nodeId, Math.random() > 0.5));
                }
            }
        }
        
        lessons.push({
            id: `${nodeId}-l5`,
            title: `Round 5: Full Mastery`,
            description: `Mix it all together.`,
            exercises: shuffle([matchPairsEx, ...wordTraps, ...assemblies, ...hears, ...makeWordRefreshers(6, nodeId)])
        });
    } else {
        lessons.push({
            id: `${nodeId}-l5`,
            title: `Round 5: Full Mastery`,
            description: `Mix it all together.`,
            exercises: shuffle([matchPairsEx, ...assemblies, ...hears, ...makeWordRefreshers(6, nodeId)])
        });
    }

    return {
        id: nodeId,
        title: title,
        description: `Vocabulary and word assembly`,
        type: 'lesson',
        status: 'active',
        totalRounds: 5,
        completedRounds: 0,
        lessons: lessons,
    };
}

// ═══════════════════════════════════════════════════════════
// UNIT 5: UNVOWELLED READING (STAGE 5)
// ═══════════════════════════════════════════════════════════

/** Removes common vowel marks (Fatha, Kasra, Damma, Sukun, Shadda, Tanween) */
function stripHarakat(text: string): string {
    return text.replace(/[\u064B-\u0652\u0654-\u0655]/g, '');
}

function makeUnvowelledExercises(word: WordData, nodeId: string): Exercise[] {
    const unvowelled = stripHarakat(word.arabic);
    const englishDistractors = pick(UNIT4_WORDS.map(w => w.english).filter(w => w !== word.english), 3);

    return [
        {
            id: nextId(`${nodeId}-intro`),
            type: 'introduction',
            prompt: `Training wheels off!`,
            promptAudio: word.audio,
            correctAnswer: unvowelled,
            choices: [],
            hint: `${word.arabic} → ${unvowelled}\nMeans: ${word.english}`
        },
        {
            id: nextId(`${nodeId}-read`),
            type: 'multiple_choice',
            prompt: `What does this word mean?`,
            correctAnswer: word.english,
            choices: shuffle([word.english, ...englishDistractors]),
            hint: unvowelled,
            promptAudio: word.audio,
        },
        {
            id: nextId(`${nodeId}-hear`),
            type: 'hear_choose',
            prompt: `Listen and select the word`,
            promptAudio: word.audio,
            correctAnswer: unvowelled,
            choices: shuffle([unvowelled, ...pick(UNIT4_WORDS.map(w => stripHarakat(w.arabic)).filter(w => w !== unvowelled), 3)]),
        }
    ];
}

function makeUnvowelledNode(nodeId: string, title: string, words: WordData[]): CourseNode {
    const intros: Exercise[] = [];
    const reads: Exercise[] = [];
    const hears: Exercise[] = [];

    words.forEach(w => {
        const exs = makeUnvowelledExercises(w, nodeId);
        intros.push(exs[0]);
        reads.push(exs[1]);
        hears.push(exs[2]);
    });
    
    // Register these words as learned (DUOLINGO-STYLE)
    words.forEach(w => {
        if (!LEARNED_CONTENT.words.find(ww => ww.arabic === w.arabic)) {
            LEARNED_CONTENT.words.push(w);
        }
    });

    const lessons: Lesson[] = [];
    
    lessons.push({
        id: `${nodeId}-l1`,
        title: `Round 1: Stripping Vowels`,
        description: `See the naked words.`,
        exercises: [...intros, ...shuffle([...reads, ...makeLetterRefreshers(3, nodeId), ...makeWordRefreshers(3, nodeId)])]
    });
    
    lessons.push({
        id: `${nodeId}-l2`,
        title: `Round 2: Hearing Unvowelled`,
        description: `Match audio to plain text.`,
        exercises: shuffle([...hears, ...makeLetterRefreshers(3, nodeId), ...makeWordRefreshers(4, nodeId)])
    });
    
    lessons.push({
        id: `${nodeId}-l3`,
        title: `Round 3: Match Pairs`,
        description: `Connect meaning to words.`,
        exercises: [{
            id: nextId(`${nodeId}-mp`),
            type: 'match_pairs',
            prompt: `Match the unvowelled words to English.`,
            correctAnswer: '',
            choices: [],
            pairs: pick(words, 4).map(w => ({ left: stripHarakat(w.arabic), right: w.english }))
        }, ...shuffle([...reads, ...reads, ...makeWordRefreshers(5, nodeId)])]
    });
    
    lessons.push({
        id: `${nodeId}-l4`,
        title: `Round 4: More Practice`,
        description: `Repetition builds memory.`,
        exercises: shuffle([...reads, ...reads, ...hears, ...makeLetterRefreshers(4, nodeId), ...makeWordRefreshers(5, nodeId)])
    });
    // Add word assembly for unvowelled words
    const asmWord = words[0];
    const asmEx: Exercise = {
        id: nextId(`${nodeId}-l5-asm`),
        type: 'word_assembly',
        prompt: `Build the word: "${asmWord.english}" (${asmWord.translit})`,
        correctAnswer: stripHarakat(asmWord.arabic),
        choices: shuffle([...stripHarakat(asmWord.arabic).split(''), 'م']),
        hint: `Tap the letters in order to spell ${asmWord.translit}`,
    };
    
    // Add trap select for similar unvowelled words
    const trapEx: Exercise = {
        id: nextId(`${nodeId}-l5-trap`),
        type: 'trap_select',
        prompt: `Careful! Which word means "${words[0].english}"?`,
        correctAnswer: stripHarakat(words[0].arabic),
        choices: shuffle([stripHarakat(words[0].arabic), stripHarakat(words[1].arabic), stripHarakat(words[2]?.arabic || words[1].arabic)]),
        trapExplanation: `Without vowels, <strong class="arabic-text">${stripHarakat(words[0].arabic)}</strong> means "${words[0].english}".`,
    };
    
    // Add MORE unvowelled word traps (AGGRESSIVE)
    const unvowelledTraps: Exercise[] = [trapEx];
    for (const w of pick(words, 3)) {
        const confusables = words.filter(ww => ww.arabic !== w.arabic);
        if (confusables.length >= 2) {
            unvowelledTraps.push(makeWordConfusionTrap(
                { ...w, arabic: stripHarakat(w.arabic) },
                confusables.slice(0, 2).map(ww => ({ ...ww, arabic: stripHarakat(ww.arabic) })),
                nodeId,
                Math.random() > 0.5
            ));
        }
    }
    
    // Add sentence assembly with unvowelled words
    const sentWords = pick(words, 2);
    const sentWordsEnglish = sentWords.map(w => w.english).join(' + ');
    const sentEx: Exercise = {
        id: nextId(`${nodeId}-l5-sent`),
        type: 'sentence_assembly',
        prompt: `Arrange: ${sentWordsEnglish}`,
        correctAnswer: sentWords.map(w => stripHarakat(w.arabic)).join(' '),
        choices: shuffle([...sentWords.map(w => stripHarakat(w.arabic)), stripHarakat(words[2]?.arabic || words[0].arabic)]),
        hint: `Tap the words to put them in the right order`,
    };
    
    lessons.push({
        id: `${nodeId}-l5`,
        title: `Round 5: Mastery`,
        description: `You can read real Arabic!`,
        exercises: shuffle([asmEx, ...unvowelledTraps, sentEx, ...reads, ...hears])
    });

    return {
        id: nodeId,
        title: title,
        description: `Read without vowels`,
        type: 'lesson',
        status: 'locked',
        totalRounds: 5,
        completedRounds: 0,
        lessons: lessons,
    };
}

// ═══════════════════════════════════════════════════════════
// UNIT 6: FULL SENTENCES (STAGE 6)
// ═══════════════════════════════════════════════════════════

interface SentenceData {
    arabic: string;
    english: string;
    audio: string;
    words: string[]; // For assembly
}

const UNIT6_SENTENCES: SentenceData[] = [
    {
        arabic: 'اَلسَّلامُ عَلَيْكُم',
        english: 'Peace be upon you',
        audio: '/audio/sentences/sent_assalamu.mp3',
        words: ['اَلسَّلامُ', 'عَلَيكُم']
    },
    {
        arabic: 'بِسْمِ اللّهِ',
        english: 'In the name of Allah',
        audio: '/audio/sentences/sent_bismillah.mp3',
        words: ['بِسْمِ', 'اللّهِ']
    },
    {
        arabic: 'كَيْفَ حَالُكَ',
        english: 'How are you?',
        audio: '/audio/sentences/sent_kayf_halak.mp3',
        words: ['كَيْفَ', 'حَالُكَ']
    },
    {
        arabic: 'أَنَا بِخَيْرٍ',
        english: 'I am fine',
        audio: '/audio/sentences/sent_ana_bikhayr.mp3',
        words: ['أَنَا', 'بِخَيْرٍ']
    },
    {
        arabic: 'اِسمي',
        english: 'My name is...',
        audio: '/audio/sentences/sent_ismi.mp3',
        words: ['اِسْمِي']
    },
    {
        arabic: 'هَذَا كِتَابٌ',
        english: 'This is a book',
        audio: '/audio/sentences/sent_hadha_kitab.mp3',
        words: ['هَذَا', 'كِتَابٌ']
    },
    {
        arabic: 'هَذِهِ مَدْرَسَةٌ',
        english: 'This is a school',
        audio: '/audio/sentences/sent_hadhihi_madrasah.mp3',
        words: ['هَذِهِ', 'مَدْرَسَةٌ']
    },
    {
        arabic: 'مَعَ السَّلامَةِ',
        english: 'Goodbye',
        audio: '/audio/sentences/sent_ma3a_salama.mp3',
        words: ['مَعَ', 'السَّلامة']
    },
    {
        arabic: 'صَبَاحُ الخَيْرِ',
        english: 'Good morning',
        audio: '/audio/sentences/sent_sabah_alkhayr.mp3',
        words: ['صَبَاحُ', 'الخَيْرِ']
    },
    {
        arabic: 'أَنا أُحِبُّ العَرَبيّة',
        english: 'I love Arabic',
        audio: '/audio/sentences/sent_ana_uhibb.mp3',
        words: ['أَنا', 'أُحِبُّ', 'العَرَبيّة']
    }
,
    // NEW SENTENCES - Questions (5)
    {
        arabic: 'مَا اسْمُكَ',
        english: 'What is your name?',
        audio: '/audio/sentences/sent_ma_ismuka.mp3',
        words: ['مَا', 'اسْمُكَ']
    },
    {
        arabic: 'أَيْنَ تَسْكُنُ',
        english: 'Where do you live?',
        audio: '/audio/sentences/sent_ayna_taskun.mp3',
        words: ['أَيْنَ', 'تَسْكُنُ']
    },
    {
        arabic: 'كَمْ عُمْرُكَ',
        english: 'How old are you?',
        audio: '/audio/sentences/sent_kam_umruk.mp3',
        words: ['كَمْ', 'عُمْرُكَ']
    },
    {
        arabic: 'مَاذَا تَعْمَلُ',
        english: 'What do you do?',
        audio: '/audio/sentences/sent_madha_tamal.mp3',
        words: ['مَاذَا', 'تَعْمَلُ']
    },
    {
        arabic: 'هَلْ تَتَكَلَّمُ العَرَبِيَّةَ',
        english: 'Do you speak Arabic?',
        audio: '/audio/sentences/sent_hal_tatakallam.mp3',
        words: ['هَلْ', 'تَتَكَلَّمُ', 'العَرَبِيَّةَ']
    },
    // NEW SENTENCES - Negations (5)
    {
        arabic: 'لَا أَفْهَمُ',
        english: 'I do not understand',
        audio: '/audio/sentences/sent_la_afham.mp3',
        words: ['لَا', 'أَفْهَمُ']
    },
    {
        arabic: 'لَيْسَ عِنْدِي',
        english: 'I do not have',
        audio: '/audio/sentences/sent_laysa_indi.mp3',
        words: ['لَيْسَ', 'عِنْدِي']
    },
    {
        arabic: 'لَمْ أَذْهَبْ',
        english: 'I did not go',
        audio: '/audio/sentences/sent_lam_adhhab.mp3',
        words: ['لَمْ', 'أَذْهَبْ']
    },
    {
        arabic: 'لَا أَعْرِفُ',
        english: 'I do not know',
        audio: '/audio/sentences/sent_la_arif.mp3',
        words: ['لَا', 'أَعْرِفُ']
    },
    {
        arabic: 'لَيْسَ هُنَا',
        english: 'It is not here',
        audio: '/audio/sentences/sent_laysa_huna.mp3',
        words: ['لَيْسَ', 'هُنَا']
    },
    // NEW SENTENCES - Commands (5)
    {
        arabic: 'تَعَالَ هُنَا',
        english: 'Come here',
        audio: '/audio/sentences/sent_taal_huna.mp3',
        words: ['تَعَالَ', 'هُنَا']
    },
    {
        arabic: 'اِجْلِسْ',
        english: 'Sit down',
        audio: '/audio/sentences/sent_ijlis.mp3',
        words: ['اِجْلِسْ']
    },
    {
        arabic: 'اِنْتَظِرْ',
        english: 'Wait',
        audio: '/audio/sentences/sent_intadhir.mp3',
        words: ['اِنْتَظِرْ']
    },
    {
        arabic: 'اِذْهَبْ',
        english: 'Go',
        audio: '/audio/sentences/sent_idhhab.mp3',
        words: ['اِذْهَبْ']
    },
    {
        arabic: 'اِسْمَعْ',
        english: 'Listen',
        audio: '/audio/sentences/sent_isma.mp3',
        words: ['اِسْمَعْ']
    },
    // NEW SENTENCES - Descriptions (5)
    {
        arabic: 'الطَّقْسُ جَمِيلٌ',
        english: 'The weather is beautiful',
        audio: '/audio/sentences/sent_taqs_jamil.mp3',
        words: ['الطَّقْسُ', 'جَمِيلٌ']
    },
    {
        arabic: 'الكِتَابُ كَبِيرٌ',
        english: 'The book is big',
        audio: '/audio/sentences/sent_kitab_kabir.mp3',
        words: ['الكِتَابُ', 'كَبِيرٌ']
    },
    {
        arabic: 'البَيْتُ نَظِيفٌ',
        english: 'The house is clean',
        audio: '/audio/sentences/sent_bayt_nadhif.mp3',
        words: ['البَيْتُ', 'نَظِيفٌ']
    },
    {
        arabic: 'الطَّعَامُ لَذِيذٌ',
        english: 'The food is delicious',
        audio: '/audio/sentences/sent_taam_ladhidh.mp3',
        words: ['الطَّعَامُ', 'لَذِيذٌ']
    },
    {
        arabic: 'المَدْرَسَةُ قَرِيبَةٌ',
        english: 'The school is near',
        audio: '/audio/sentences/sent_madrasa_qariba.mp3',
        words: ['المَدْرَسَةُ', 'قَرِيبَةٌ']
    }

];

function makeSentenceExercises(sent: SentenceData, nodeId: string): Exercise[] {
    const distractors = pick(UNIT6_SENTENCES.map(s => s.english).filter(e => e !== sent.english), 3);
    
    // Add distractor words from other sentences to make assembly harder
    const allWords = UNIT6_SENTENCES.flatMap(s => s.words).filter(w => !sent.words.includes(w));
    const distractorWords = pick(allWords, Math.min(3, allWords.length));
    const assemblyChoices = shuffle([...sent.words, ...distractorWords]);

    return [
        // REMOVED: Introduction card - learners must figure out meaning themselves!
        {
            id: nextId(`${nodeId}-mc`),
            type: 'multiple_choice',
            prompt: `What does this sentence mean?`,
            correctAnswer: sent.english,
            choices: shuffle([sent.english, ...distractors]),
            hint: sent.arabic,
            promptAudio: sent.audio
        },
        {
            id: nextId(`${nodeId}-asm`),
            type: 'sentence_assembly',
            prompt: `Assemble the sentence: "${sent.english}"`,
            correctAnswer: sent.arabic,
            choices: assemblyChoices, // Now includes distractors!
            promptAudio: sent.audio
        }
    ];
}

function makeSentenceNode(nodeId: string, title: string, sentences: SentenceData[]): CourseNode {
    const graded: Exercise[] = [];

    sentences.forEach(s => {
        const exs = makeSentenceExercises(s, nodeId);
        graded.push(...exs); // No more separate intros array!
    });
    
    // Register these sentences as learned (DUOLINGO-STYLE)
    sentences.forEach(s => {
        if (!LEARNED_CONTENT.sentences.find(ss => ss.arabic === s.arabic)) {
            LEARNED_CONTENT.sentences.push(s);
        }
    });
    
    // Add match pairs for sentence meanings
    const matchEx: Exercise = {
        id: nextId(`${nodeId}-mp`),
        type: 'match_pairs',
        prompt: `Match sentences to meanings`,
        correctAnswer: '',
        choices: [],
        pairs: pick(sentences, Math.min(4, sentences.length)).map(s => ({ left: s.arabic, right: s.english })),
    };
    
    // Add trap select for similar sentences
    const trapEx: Exercise = {
        id: nextId(`${nodeId}-trap`),
        type: 'trap_select',
        prompt: `Careful! Which sentence means "${sentences[0].english}"?`,
        correctAnswer: sentences[0].arabic,
        choices: shuffle([sentences[0].arabic, sentences[1].arabic, sentences[2]?.arabic || sentences[1].arabic]),
        trapExplanation: `<strong class="arabic-text">${sentences[0].arabic}</strong> means "${sentences[0].english}".`,
    };
    
    // Add word assembly from sentence words
    const wordAsmEx: Exercise = {
        id: nextId(`${nodeId}-word-asm`),
        type: 'word_assembly',
        prompt: `Assemble the word: ${sentences[0].words[0]}`,
        correctAnswer: sentences[0].words[0],
        choices: shuffle([...sentences[0].words[0].split(''), 'م']),
    };
    
    // Add MORE sentence confusion traps (AGGRESSIVE)
    const sentenceTraps: Exercise[] = [trapEx];
    for (const s of pick(sentences, Math.min(3, sentences.length))) {
        const confusables = sentences.filter(ss => ss.arabic !== s.arabic);
        if (confusables.length >= 2) {
            sentenceTraps.push(makeSentenceConfusionTrap(
                s,
                confusables.slice(0, 2),
                nodeId,
                Math.random() > 0.5
            ));
        }
    }

    return {
        id: nodeId,
        title: title,
        description: `Read and understand sentences`,
        type: 'lesson',
        status: 'locked',
        totalRounds: 5,
        completedRounds: 0,
        lessons: [
            { 
                id: `${nodeId}-r1`, 
                title: 'Round 1: Comprehension', 
                description: 'Figure out what they mean', 
                exercises: shuffle([...graded.slice(0, 6), matchEx, ...makeLetterRefreshers(3, nodeId), ...makeWordRefreshers(3, nodeId)]) 
            },
            { 
                id: `${nodeId}-r2`, 
                title: 'Round 2: Practice', 
                description: 'Build your skills', 
                exercises: shuffle([...graded, ...graded.filter(e => e.type === 'sentence_assembly'), ...sentenceTraps.slice(0, 2), wordAsmEx, ...makeLetterRefreshers(4, nodeId), ...makeWordRefreshers(4, nodeId)]) 
            },
            { 
                id: `${nodeId}-r3`, 
                title: 'Round 3: More Practice', 
                description: 'Keep building', 
                exercises: shuffle([...graded, ...graded.filter(e => e.type === 'sentence_assembly'), matchEx, ...sentenceTraps.slice(2, 4), ...makeWordRefreshers(5, nodeId), ...makeSentenceRefreshers(3, nodeId)]) 
            },
            { 
                id: `${nodeId}-r4`, 
                title: 'Round 4: Assembly', 
                description: 'Assemble them all', 
                exercises: shuffle([...graded, ...graded.filter(e => e.type === 'sentence_assembly'), ...sentenceTraps.slice(4), ...makeWordRefreshers(5, nodeId), ...makeSentenceRefreshers(4, nodeId)]) 
            },
            { 
                id: `${nodeId}-r5`, 
                title: 'Round 5: Mastery', 
                description: 'Final review', 
                exercises: shuffle([...graded, matchEx, ...sentenceTraps, ...makeWordRefreshers(6, nodeId), ...makeSentenceRefreshers(5, nodeId)]) 
            }
        ]
    };
}



// ═══════════════════════════════════════════════════════════
// UNIT 7: CONVERSATIONS (STAGE 7)
// ═══════════════════════════════════════════════════════════

interface ConversationData {
    id: string;
    title: string;
    context: string;
    lines: Array<{
        speaker: string;
        arabic: string;
        english: string;
        audio: string;
    }>;
}

const UNIT7_CONVERSATIONS: ConversationData[] = [
    {
        id: 'conv1',
        title: 'Meeting a Friend',
        context: 'Two friends greet each other and ask how they are',
        lines: [
            { speaker: 'أَحْمَد', arabic: 'اَلسَّلامُ عَلَيْكُم', english: 'Peace be upon you', audio: '/audio/conversations/conv1_line1.mp3' },
            { speaker: 'فَاطِمَة', arabic: 'وَعَلَيْكُمُ السَّلامُ', english: 'And upon you peace', audio: '/audio/conversations/conv1_line2.mp3' },
            { speaker: 'أَحْمَد', arabic: 'كَيْفَ حَالُكِ؟', english: 'How are you?', audio: '/audio/conversations/conv1_line3.mp3' },
            { speaker: 'فَاطِمَة', arabic: 'أَنَا بِخَيْرٍ، شُكْرًا', english: 'I am fine, thank you', audio: '/audio/conversations/conv1_line4.mp3' },
            { speaker: 'أَحْمَد', arabic: 'أَنَا بِخَيْرٍ أَيْضًا', english: 'I am also fine', audio: '/audio/conversations/conv1_line5.mp3' },
            { speaker: 'فَاطِمَة', arabic: 'مَعَ السَّلامَةِ', english: 'Goodbye', audio: '/audio/conversations/conv1_line6.mp3' }
        ]
    },
    {
        id: 'conv2',
        title: 'Good Morning at School',
        context: 'Students greet each other in the morning at school',
        lines: [
            { speaker: 'عَلِي', arabic: 'صَبَاحُ الخَيْرِ', english: 'Good morning', audio: '/audio/conversations/conv2_line1.mp3' },
            { speaker: 'مَرْيَم', arabic: 'صَبَاحُ النُّورِ', english: 'Morning of light', audio: '/audio/conversations/conv2_line2.mp3' },
            { speaker: 'عَلِي', arabic: 'هَذِهِ مَدْرَسَةٌ', english: 'This is a school', audio: '/audio/conversations/conv2_line3.mp3' },
            { speaker: 'مَرْيَم', arabic: 'نَعَمْ، هَذِهِ مَدْرَسَةٌ جَمِيلَةٌ', english: 'Yes, this is a beautiful school', audio: '/audio/conversations/conv2_line4.mp3' },
            { speaker: 'عَلِي', arabic: 'أَنَا أُحِبُّ العَرَبِيَّةَ', english: 'I love Arabic', audio: '/audio/conversations/conv2_line5.mp3' },
            { speaker: 'مَرْيَم', arabic: 'أَنَا أُحِبُّ العَرَبِيَّةَ أَيْضًا', english: 'I also love Arabic', audio: '/audio/conversations/conv2_line6.mp3' }
        ]
    },
    {
        id: 'conv3',
        title: 'Showing a Book',
        context: 'One person shows a book to another',
        lines: [
            { speaker: 'خَالِد', arabic: 'هَذَا كِتَابٌ', english: 'This is a book', audio: '/audio/conversations/conv3_line1.mp3' },
            { speaker: 'سَارَة', arabic: 'كِتَابٌ جَمِيلٌ', english: 'A beautiful book', audio: '/audio/conversations/conv3_line2.mp3' },
            { speaker: 'خَالِد', arabic: 'شُكْرًا', english: 'Thank you', audio: '/audio/conversations/conv3_line3.mp3' },
            { speaker: 'سَارَة', arabic: 'عَفْوًا', english: 'You\'re welcome', audio: '/audio/conversations/conv3_line4.mp3' },
            { speaker: 'خَالِد', arabic: 'مَعَ السَّلامَةِ', english: 'Goodbye', audio: '/audio/conversations/conv3_line5.mp3' },
            { speaker: 'سَارَة', arabic: 'مَعَ السَّلامَةِ', english: 'Goodbye', audio: '/audio/conversations/conv3_line6.mp3' }
        ]
    },
    {
        id: 'conv4',
        title: 'Starting Class',
        context: 'A teacher starts the class with students',
        lines: [
            { speaker: 'أُسْتَاذ', arabic: 'بِسْمِ اللّهِ', english: 'In the name of Allah', audio: '/audio/conversations/conv4_line1.mp3' },
            { speaker: 'طُلَّاب', arabic: 'بِسْمِ اللّهِ', english: 'In the name of Allah', audio: '/audio/conversations/conv4_line2.mp3' },
            { speaker: 'أُسْتَاذ', arabic: 'اَلسَّلامُ عَلَيْكُم', english: 'Peace be upon you', audio: '/audio/conversations/conv4_line3.mp3' },
            { speaker: 'طُلَّاب', arabic: 'وَعَلَيْكُمُ السَّلامُ', english: 'And upon you peace', audio: '/audio/conversations/conv4_line4.mp3' },
            { speaker: 'أُسْتَاذ', arabic: 'كَيْفَ حَالُكُم؟', english: 'How are you all?', audio: '/audio/conversations/conv4_line5.mp3' },
            { speaker: 'طُلَّاب', arabic: 'نَحْنُ بِخَيْرٍ', english: 'We are fine', audio: '/audio/conversations/conv4_line6.mp3' }
        ]
    },
    {
        id: 'conv5',
        title: 'Meeting Someone New',
        context: 'Two people introduce themselves for the first time',
        lines: [
            { speaker: 'أَحْمَد', arabic: 'اَلسَّلامُ عَلَيْكُم', english: 'Peace be upon you', audio: '/audio/conversations/conv5_line1.mp3' },
            { speaker: 'فَاطِمَة', arabic: 'وَعَلَيْكُمُ السَّلامُ', english: 'And upon you peace', audio: '/audio/conversations/conv5_line2.mp3' },
            { speaker: 'أَحْمَد', arabic: 'مَا اسْمُكِ؟', english: 'What is your name?', audio: '/audio/conversations/conv5_line3.mp3' },
            { speaker: 'فَاطِمَة', arabic: 'اِسْمِي أَحْمَد', english: 'My name is Ahmad', audio: '/audio/conversations/conv5_line4.mp3' },
            { speaker: 'أَحْمَد', arabic: 'اِسْمِي فَاطِمَة', english: 'My name is Fatima', audio: '/audio/conversations/conv5_line5.mp3' },
            { speaker: 'فَاطِمَة', arabic: 'تَشَرَّفْنَا', english: 'Nice to meet you', audio: '/audio/conversations/conv5_line6.mp3' }
        ]
    },
    {
        id: 'conv6',
        title: 'Evening Greeting',
        context: 'Friends meet in the evening and greet each other',
        lines: [
            { speaker: 'يُوسُف', arabic: 'مَسَاءُ الخَيْرِ', english: 'Good evening', audio: '/audio/conversations/conv6_line1.mp3' },
            { speaker: 'لَيْلَى', arabic: 'مَسَاءُ النُّورِ', english: 'Evening of light', audio: '/audio/conversations/conv6_line2.mp3' },
            { speaker: 'يُوسُف', arabic: 'كَيْفَ حَالُكِ؟', english: 'How are you?', audio: '/audio/conversations/conv6_line3.mp3' },
            { speaker: 'لَيْلَى', arabic: 'أَنَا بِخَيْرٍ، الحَمْدُ لِلّهِ', english: 'I am fine, praise be to God', audio: '/audio/conversations/conv6_line4.mp3' },
            { speaker: 'يُوسُف', arabic: 'جَيِّدٌ', english: 'Good', audio: '/audio/conversations/conv6_line5.mp3' },
            { speaker: 'لَيْلَى', arabic: 'مَعَ السَّلامَةِ', english: 'Goodbye', audio: '/audio/conversations/conv6_line6.mp3' }
        ]
    }
];

// ═══════════════════════════════════════════════════════════
// UNIT 8: ADVANCED CONVERSATIONS (STAGE 8)
// ═══════════════════════════════════════════════════════════

const UNIT8_CONVERSATIONS: ConversationData[] = [
    {
        id: 'conv8_1',
        title: 'At the Restaurant',
        context: 'A detailed conversation about ordering food, discussing preferences, and paying',
        lines: [
            { speaker: 'نَادِل', arabic: 'أَهْلًا وَسَهْلًا بِكَ فِي مَطْعَمِنَا', english: 'Welcome to our restaurant', audio: '/audio/conversations/conv8_1_line1.mp3' },
            { speaker: 'زَبُون', arabic: 'شُكْرًا، هَذَا الْمَكَانُ جَمِيلٌ جِدًّا', english: 'Thank you, this place is very beautiful', audio: '/audio/conversations/conv8_1_line2.mp3' },
            { speaker: 'نَادِل', arabic: 'نَحْنُ سُعَدَاءُ بِزِيَارَتِكَ، مَا الَّذِي تُفَضِّلُهُ الْيَوْمَ؟', english: 'We are happy with your visit, what do you prefer today?', audio: '/audio/conversations/conv8_1_line3.mp3' },
            { speaker: 'زَبُون', arabic: 'مَا هُوَ أَشْهَرُ طَبَقٍ عِنْدَكُمْ؟', english: 'What is your most famous dish?', audio: '/audio/conversations/conv8_1_line4.mp3' },
            { speaker: 'نَادِل', arabic: 'الْكَبْسَةُ بِاللَّحْمِ هِيَ الأَشْهَرُ وَالأَلَذُّ', english: 'Kabsa with meat is the most famous and most delicious', audio: '/audio/conversations/conv8_1_line5.mp3' },
            { speaker: 'زَبُون', arabic: 'مُمْتَازٌ، سَآخُذُ الْكَبْسَةَ مَعَ سَلَطَةٍ وَعَصِيرِ بُرْتُقَالٍ', english: 'Excellent, I will take kabsa with salad and orange juice', audio: '/audio/conversations/conv8_1_line6.mp3' },
            { speaker: 'نَادِل', arabic: 'اخْتِيَارٌ رَائِعٌ، هَلْ تُرِيدُ الطَّبَقَ حَارًّا أَمْ مُتَوَسِّطًا؟', english: 'Wonderful choice, do you want the dish hot or medium?', audio: '/audio/conversations/conv8_1_line7.mp3' },
            { speaker: 'زَبُون', arabic: 'مُتَوَسِّطًا مِنْ فَضْلِكَ، وَكَمْ يَسْتَغْرِقُ التَّحْضِيرُ؟', english: 'Medium please, and how long does preparation take?', audio: '/audio/conversations/conv8_1_line8.mp3' },
            { speaker: 'نَادِل', arabic: 'حَوَالَيْ عِشْرِينَ دَقِيقَةً، هَلْ تُرِيدُ مُقَبِّلَاتٍ أَثْنَاءَ الانْتِظَارِ؟', english: 'About twenty minutes, do you want appetizers while waiting?', audio: '/audio/conversations/conv8_1_line9.mp3' },
            { speaker: 'زَبُون', arabic: 'نَعَمْ، أَحْضِرْ لِي حُمُّصًا وَخُبْزًا طَازَجًا', english: 'Yes, bring me hummus and fresh bread', audio: '/audio/conversations/conv8_1_line10.mp3' },
            { speaker: 'نَادِل', arabic: 'حَاضِرٌ، سَأُحْضِرُهَا فَوْرًا، بِالْهَنَاءِ وَالشِّفَاءِ', english: 'Right away, I will bring it immediately, enjoy your meal', audio: '/audio/conversations/conv8_1_line11.mp3' },
            { speaker: 'زَبُون', arabic: 'شُكْرًا جَزِيلًا، اللهُ يُبَارِكُ فِيكَ', english: 'Thank you very much, may God bless you', audio: '/audio/conversations/conv8_1_line12.mp3' }
        ]
    },
    {
        id: 'conv8_2',
        title: 'Job Interview',
        context: 'A formal job interview with detailed questions about experience and qualifications',
        lines: [
            { speaker: 'مُدِير', arabic: 'صَبَاحُ الْخَيْرِ، تَفَضَّلْ بِالْجُلُوسِ', english: 'Good morning, please have a seat', audio: '/audio/conversations/conv8_2_line1.mp3' },
            { speaker: 'مُتَقَدِّم', arabic: 'صَبَاحُ النُّورِ، شُكْرًا لِإِتَاحَةِ هَذِهِ الْفُرْصَةِ', english: 'Morning of light, thank you for this opportunity', audio: '/audio/conversations/conv8_2_line2.mp3' },
            { speaker: 'مُدِير', arabic: 'أَخْبِرْنِي عَنْ خِبْرَتِكَ الْعَمَلِيَّةِ السَّابِقَةِ', english: 'Tell me about your previous work experience', audio: '/audio/conversations/conv8_2_line3.mp3' },
            { speaker: 'مُتَقَدِّم', arabic: 'عَمِلْتُ خَمْسَ سَنَوَاتٍ فِي شَرِكَةٍ كَبِيرَةٍ كَمُهَنْدِسٍ', english: 'I worked five years in a large company as an engineer', audio: '/audio/conversations/conv8_2_line4.mp3' },
            { speaker: 'مُدِير', arabic: 'مُمْتَازٌ، وَمَا هِيَ أَهَمُّ إِنْجَازَاتِكَ هُنَاكَ؟', english: 'Excellent, and what are your most important achievements there?', audio: '/audio/conversations/conv8_2_line5.mp3' },
            { speaker: 'مُتَقَدِّم', arabic: 'قُدْتُ فَرِيقًا نَجَحَ فِي تَطْوِيرِ نِظَامٍ جَدِيدٍ', english: 'I led a team that succeeded in developing a new system', audio: '/audio/conversations/conv8_2_line6.mp3' },
            { speaker: 'مُدِير', arabic: 'رَائِعٌ، لِمَاذَا تُرِيدُ الْعَمَلَ مَعَنَا بِالتَّحْدِيدِ؟', english: 'Wonderful, why do you want to work with us specifically?', audio: '/audio/conversations/conv8_2_line7.mp3' },
            { speaker: 'مُتَقَدِّم', arabic: 'لِأَنَّ شَرِكَتَكُمْ رَائِدَةٌ فِي الْمَجَالِ وَلَدَيْهَا سُمْعَةٌ مُمْتَازَةٌ', english: 'Because your company is a leader in the field and has an excellent reputation', audio: '/audio/conversations/conv8_2_line8.mp3' },
            { speaker: 'مُدِير', arabic: 'مَا هِيَ نِقَاطُ قُوَّتِكَ وَضَعْفِكَ؟', english: 'What are your strengths and weaknesses?', audio: '/audio/conversations/conv8_2_line9.mp3' },
            { speaker: 'مُتَقَدِّم', arabic: 'أَنَا مُجْتَهِدٌ وَمُنَظَّمٌ، لَكِنِّي أَحْيَانًا أَكُونُ مُتَطَلِّبًا جِدًّا', english: 'I am hardworking and organized, but sometimes I am too demanding', audio: '/audio/conversations/conv8_2_line10.mp3' },
            { speaker: 'مُدِير', arabic: 'جَيِّدٌ، سَنَتَّصِلُ بِكَ خِلَالَ أُسْبُوعٍ بِإِذْنِ اللهِ', english: 'Good, we will contact you within a week God willing', audio: '/audio/conversations/conv8_2_line11.mp3' },
            { speaker: 'مُتَقَدِّم', arabic: 'شُكْرًا جَزِيلًا، فِي انْتِظَارِ رَدِّكُمْ', english: 'Thank you very much, awaiting your response', audio: '/audio/conversations/conv8_2_line12.mp3' }
        ]
    },
    {
        id: 'conv8_3',
        title: 'Discussing Travel Plans',
        context: 'Friends planning a detailed vacation with budget and activities',
        lines: [
            { speaker: 'أَحْمَد', arabic: 'أُفَكِّرُ فِي السَّفَرِ إِلَى تُرْكِيَا الشَّهْرَ الْقَادِمَ', english: 'I am thinking of traveling to Turkey next month', audio: '/audio/conversations/conv8_3_line1.mp3' },
            { speaker: 'فَاطِمَة', arabic: 'فِكْرَةٌ رَائِعَةٌ، كَمْ يَوْمًا سَتَبْقَى هُنَاكَ؟', english: 'Wonderful idea, how many days will you stay there?', audio: '/audio/conversations/conv8_3_line2.mp3' },
            { speaker: 'أَحْمَد', arabic: 'أُخَطِّطُ لِلْبَقَاءِ عَشَرَةَ أَيَّامٍ لِزِيَارَةِ إِسْطَنْبُولَ وَأَنْطَالْيَا', english: 'I plan to stay ten days to visit Istanbul and Antalya', audio: '/audio/conversations/conv8_3_line3.mp3' },
            { speaker: 'فَاطِمَة', arabic: 'هَلْ حَجَزْتَ الْفُنْدُقَ وَالطَّيَرَانَ بِالْفِعْلِ؟', english: 'Have you already booked the hotel and flight?', audio: '/audio/conversations/conv8_3_line4.mp3' },
            { speaker: 'أَحْمَد', arabic: 'لَا بَعْدُ، أَبْحَثُ عَنْ أَفْضَلِ الْعُرُوضِ الآنَ', english: 'Not yet, I am searching for the best offers now', audio: '/audio/conversations/conv8_3_line5.mp3' },
            { speaker: 'فَاطِمَة', arabic: 'أَنْصَحُكَ بِالْحَجْزِ مُبَكِّرًا لِأَنَّ الأَسْعَارَ تَرْتَفِعُ', english: 'I advise you to book early because prices rise', audio: '/audio/conversations/conv8_3_line6.mp3' },
            { speaker: 'أَحْمَد', arabic: 'نَصِيحَةٌ جَيِّدَةٌ، مَا هِيَ الْمِيزَانِيَّةُ الْمُنَاسِبَةُ بِرَأْيِكِ؟', english: 'Good advice, what is the appropriate budget in your opinion?', audio: '/audio/conversations/conv8_3_line7.mp3' },
            { speaker: 'فَاطِمَة', arabic: 'أَعْتَقِدُ أَنَّ أَلْفَيْ دُولَارٍ كَافِيَةٌ لِرِحْلَةٍ مُرِيحَةٍ', english: 'I think two thousand dollars is enough for a comfortable trip', audio: '/audio/conversations/conv8_3_line8.mp3' },
            { speaker: 'أَحْمَد', arabic: 'وَمَاذَا عَنِ الأَمَاكِنِ الَّتِي يَجِبُ زِيَارَتُهَا؟', english: 'And what about the places that must be visited?', audio: '/audio/conversations/conv8_3_line9.mp3' },
            { speaker: 'فَاطِمَة', arabic: 'لَا تَفُوتْ آيَا صُوفْيَا وَالْبَازَارَ الْكَبِيرَ وَالْبُوسْفُورَ', english: 'Do not miss Hagia Sophia, the Grand Bazaar, and the Bosphorus', audio: '/audio/conversations/conv8_3_line10.mp3' },
            { speaker: 'أَحْمَد', arabic: 'شُكْرًا عَلَى النَّصَائِحِ، هَلْ سَبَقَ أَنْ زُرْتِ تُرْكِيَا؟', english: 'Thank you for the advice, have you visited Turkey before?', audio: '/audio/conversations/conv8_3_line11.mp3' },
            { speaker: 'فَاطِمَة', arabic: 'نَعَمْ، زُرْتُهَا الْعَامَ الْمَاضِي وَكَانَتْ تَجْرِبَةً لَا تُنْسَى', english: 'Yes, I visited it last year and it was an unforgettable experience', audio: '/audio/conversations/conv8_3_line12.mp3' }
        ]
    },
    {
        id: 'conv8_4',
        title: 'At the Doctor - Detailed Consultation',
        context: 'A comprehensive medical consultation with symptoms, diagnosis, and treatment',
        lines: [
            { speaker: 'طَبِيب', arabic: 'أَهْلًا بِكَ، مَا الَّذِي يُزْعِجُكَ الْيَوْمَ؟', english: 'Welcome, what is bothering you today?', audio: '/audio/conversations/conv8_4_line1.mp3' },
            { speaker: 'مَرِيض', arabic: 'دُكْتُور، أَشْعُرُ بِأَلَمٍ شَدِيدٍ فِي الْمَعِدَةِ مُنْذُ ثَلَاثَةِ أَيَّامٍ', english: 'Doctor, I feel severe pain in my stomach for three days', audio: '/audio/conversations/conv8_4_line2.mp3' },
            { speaker: 'طَبِيب', arabic: 'هَلِ الأَلَمُ مُسْتَمِرٌّ أَمْ يَأْتِي وَيَذْهَبُ؟', english: 'Is the pain continuous or does it come and go?', audio: '/audio/conversations/conv8_4_line3.mp3' },
            { speaker: 'مَرِيض', arabic: 'يَأْتِي وَيَذْهَبُ، وَيَزْدَادُ بَعْدَ الأَكْلِ', english: 'It comes and goes, and increases after eating', audio: '/audio/conversations/conv8_4_line4.mp3' },
            { speaker: 'طَبِيب', arabic: 'هَلْ لَدَيْكَ أَعْرَاضٌ أُخْرَى مِثْلَ الْغَثَيَانِ أَوِ الْحُمَّى؟', english: 'Do you have other symptoms like nausea or fever?', audio: '/audio/conversations/conv8_4_line5.mp3' },
            { speaker: 'مَرِيض', arabic: 'نَعَمْ، أَشْعُرُ بِالْغَثَيَانِ أَحْيَانًا وَلَيْسَ لَدَيَّ شَهِيَّةٌ', english: 'Yes, I feel nauseous sometimes and I have no appetite', audio: '/audio/conversations/conv8_4_line6.mp3' },
            { speaker: 'طَبِيب', arabic: 'يَبْدُو أَنَّهَا الْتِهَابٌ فِي الْمَعِدَةِ، هَلْ أَكَلْتَ شَيْئًا غَيْرَ عَادِيٍّ؟', english: 'It seems to be stomach inflammation, did you eat something unusual?', audio: '/audio/conversations/conv8_4_line7.mp3' },
            { speaker: 'مَرِيض', arabic: 'رُبَّمَا، أَكَلْتُ طَعَامًا حَارًّا جِدًّا قَبْلَ أَرْبَعَةِ أَيَّامٍ', english: 'Perhaps, I ate very spicy food four days ago', audio: '/audio/conversations/conv8_4_line8.mp3' },
            { speaker: 'طَبِيب', arabic: 'هَذَا يُفَسِّرُ الأَمْرَ، سَأَصِفُ لَكَ دَوَاءً وَنِظَامًا غِذَائِيًّا', english: 'This explains it, I will prescribe medicine and a diet for you', audio: '/audio/conversations/conv8_4_line9.mp3' },
            { speaker: 'مَرِيض', arabic: 'شُكْرًا دُكْتُور، مَتَى سَأَشْعُرُ بِالتَّحَسُّنِ؟', english: 'Thank you doctor, when will I feel better?', audio: '/audio/conversations/conv8_4_line10.mp3' },
            { speaker: 'طَبِيب', arabic: 'خِلَالَ يَوْمَيْنِ إِنْ شَاءَ اللهُ، وَتَجَنَّبِ الطَّعَامَ الْحَارَّ', english: 'Within two days God willing, and avoid spicy food', audio: '/audio/conversations/conv8_4_line11.mp3' },
            { speaker: 'مَرِيض', arabic: 'حَاضِرٌ، جَزَاكَ اللهُ خَيْرًا', english: 'Understood, may God reward you with goodness', audio: '/audio/conversations/conv8_4_line12.mp3' }
        ]
    },
    {
        id: 'conv8_5',
        title: 'Discussing Education and Dreams',
        context: 'Students discussing their studies, future plans, and career aspirations',
        lines: [
            { speaker: 'لَيْلَى', arabic: 'مَا الَّذِي تَدْرُسُهُ فِي الْجَامِعَةِ يَا يُوسُفُ؟', english: 'What are you studying at university, Yusuf?', audio: '/audio/conversations/conv8_5_line1.mp3' },
            { speaker: 'يُوسُف', arabic: 'أَدْرُسُ الْهَنْدَسَةَ الْمَعْمَارِيَّةَ، وَأَنَا فِي السَّنَةِ الثَّالِثَةِ', english: 'I study architectural engineering, and I am in the third year', audio: '/audio/conversations/conv8_5_line2.mp3' },
            { speaker: 'لَيْلَى', arabic: 'رَائِعٌ، هَلْ تَسْتَمْتِعُ بِدِرَاسَتِكَ؟', english: 'Wonderful, do you enjoy your studies?', audio: '/audio/conversations/conv8_5_line3.mp3' },
            { speaker: 'يُوسُف', arabic: 'نَعَمْ كَثِيرًا، خَاصَّةً مَوَادَّ التَّصْمِيمِ وَالرَّسْمِ الْهَنْدَسِيِّ', english: 'Yes very much, especially design and engineering drawing subjects', audio: '/audio/conversations/conv8_5_line4.mp3' },
            { speaker: 'لَيْلَى', arabic: 'وَمَا هُوَ حُلْمُكَ بَعْدَ التَّخَرُّجِ؟', english: 'And what is your dream after graduation?', audio: '/audio/conversations/conv8_5_line5.mp3' },
            { speaker: 'يُوسُف', arabic: 'أَحْلُمُ بِتَصْمِيمِ مَبَانٍ صَدِيقَةٍ لِلْبِيئَةِ فِي الْعَالَمِ الْعَرَبِيِّ', english: 'I dream of designing environmentally friendly buildings in the Arab world', audio: '/audio/conversations/conv8_5_line6.mp3' },
            { speaker: 'لَيْلَى', arabic: 'هَدَفٌ نَبِيلٌ، أَنَا أَدْرُسُ الطِّبَّ وَأُرِيدُ أَنْ أُصْبِحَ جَرَّاحَةً', english: 'A noble goal, I study medicine and want to become a surgeon', audio: '/audio/conversations/conv8_5_line7.mp3' },
            { speaker: 'يُوسُف', arabic: 'مَا شَاءَ اللهُ، الطِّبُّ تَخَصُّصٌ صَعْبٌ وَلَكِنَّهُ مُهِمٌّ', english: 'God has willed it, medicine is a difficult but important specialization', audio: '/audio/conversations/conv8_5_line8.mp3' },
            { speaker: 'لَيْلَى', arabic: 'نَعَمْ، أَدْرُسُ كَثِيرًا وَأَحْيَانًا أَسْهَرُ اللَّيْلَ كُلَّهُ', english: 'Yes, I study a lot and sometimes stay up all night', audio: '/audio/conversations/conv8_5_line9.mp3' },
            { speaker: 'يُوسُف', arabic: 'اللهُ يُعِينُكِ، الْمُسْتَقْبَلُ سَيَكُونُ مُشْرِقًا بِإِذْنِ اللهِ', english: 'May God help you, the future will be bright God willing', audio: '/audio/conversations/conv8_5_line10.mp3' },
            { speaker: 'لَيْلَى', arabic: 'آمِينَ، هَلْ تُفَكِّرُ فِي إِكْمَالِ الدِّرَاسَاتِ الْعُلْيَا؟', english: 'Amen, are you thinking of completing graduate studies?', audio: '/audio/conversations/conv8_5_line11.mp3' },
            { speaker: 'يُوسُف', arabic: 'رُبَّمَا، أُفَكِّرُ فِي الْحُصُولِ عَلَى الْمَاجِسْتِيرِ فِي الْخَارِجِ', english: 'Perhaps, I am thinking of getting a master\'s degree abroad', audio: '/audio/conversations/conv8_5_line12.mp3' }
        ]
    },
    {
        id: 'conv8_6',
        title: 'Family Gathering Discussion',
        context: 'Extended family discussing memories, relationships, and planning a reunion',
        lines: [
            { speaker: 'سَارَة', arabic: 'كَمْ مَضَى مِنَ الْوَقْتِ مُنْذُ آخِرِ لِقَاءٍ عَائِلِيٍّ؟', english: 'How much time has passed since the last family gathering?', audio: '/audio/conversations/conv8_6_line1.mp3' },
            { speaker: 'أَحْمَد', arabic: 'تَقْرِيبًا سَنَةٌ كَامِلَةٌ، مُنْذُ عِيدِ الْفِطْرِ الْمَاضِي', english: 'About a full year, since last Eid al-Fitr', audio: '/audio/conversations/conv8_6_line2.mp3' },
            { speaker: 'سَارَة', arabic: 'اشْتَقْتُ لِلْجَمِيعِ كَثِيرًا، خَاصَّةً جَدَّتِي وَأَعْمَامِي', english: 'I missed everyone a lot, especially my grandmother and uncles', audio: '/audio/conversations/conv8_6_line3.mp3' },
            { speaker: 'أَحْمَد', arabic: 'أَنَا أَيْضًا، جَدَّتُنَا دَائِمًا تَسْأَلُ عَنْكِ وَعَنْ دِرَاسَتِكِ', english: 'Me too, our grandmother always asks about you and your studies', audio: '/audio/conversations/conv8_6_line4.mp3' },
            { speaker: 'سَارَة', arabic: 'اللهُ يَحْفَظُهَا، مَا رَأْيُكَ أَنْ نُنَظِّمَ لِقَاءً قَرِيبًا؟', english: 'May God protect her, what do you think about organizing a gathering soon?', audio: '/audio/conversations/conv8_6_line5.mp3' },
            { speaker: 'أَحْمَد', arabic: 'فِكْرَةٌ مُمْتَازَةٌ، رُبَّمَا فِي نِهَايَةِ هَذَا الشَّهْرِ', english: 'Excellent idea, perhaps at the end of this month', audio: '/audio/conversations/conv8_6_line6.mp3' },
            { speaker: 'سَارَة', arabic: 'أَيْنَ يُمْكِنُ أَنْ نَجْتَمِعَ؟ بَيْتُ جَدَّتِي أَمْ مَكَانٌ آخَرُ؟', english: 'Where can we gather? My grandmother\'s house or another place?', audio: '/audio/conversations/conv8_6_line7.mp3' },
            { speaker: 'أَحْمَد', arabic: 'بَيْتُ جَدَّتِنَا أَفْضَلُ، هُوَ كَبِيرٌ وَمُرِيحٌ لِلْجَمِيعِ', english: 'Our grandmother\'s house is better, it is large and comfortable for everyone', audio: '/audio/conversations/conv8_6_line8.mp3' },
            { speaker: 'سَارَة', arabic: 'حَسَنًا، سَأَتَّصِلُ بِالْعَائِلَةِ وَأُخْبِرُهُمْ بِالْمَوْعِدِ', english: 'Okay, I will call the family and inform them of the date', audio: '/audio/conversations/conv8_6_line9.mp3' },
            { speaker: 'أَحْمَد', arabic: 'وَأَنَا سَأُسَاعِدُ فِي تَحْضِيرِ الطَّعَامِ وَالتَّرْتِيبَاتِ', english: 'And I will help in preparing the food and arrangements', audio: '/audio/conversations/conv8_6_line10.mp3' },
            { speaker: 'سَارَة', arabic: 'رَائِعٌ، سَتَكُونُ أَمْسِيَةً جَمِيلَةً بِإِذْنِ اللهِ', english: 'Wonderful, it will be a beautiful evening God willing', audio: '/audio/conversations/conv8_6_line11.mp3' },
            { speaker: 'أَحْمَد', arabic: 'إِنْ شَاءَ اللهُ، الْعَائِلَةُ هِيَ أَغْلَى مَا نَمْلِكُ', english: 'God willing, family is the most precious thing we have', audio: '/audio/conversations/conv8_6_line12.mp3' }
        ]
    },
    {
        id: 'conv8_7',
        title: 'Discussing Current Events and Society',
        context: 'Friends discussing technology, social media, and modern life challenges',
        lines: [
            { speaker: 'خَالِد', arabic: 'هَلْ قَرَأْتَ الْخَبَرَ عَنِ التَّطَوُّرَاتِ التِّقْنِيَّةِ الْجَدِيدَةِ؟', english: 'Did you read the news about the new technological developments?', audio: '/audio/conversations/conv8_7_line1.mp3' },
            { speaker: 'عُمَر', arabic: 'نَعَمْ، التَّكْنُولُوجِيَا تَتَقَدَّمُ بِسُرْعَةٍ مُذْهِلَةٍ هَذِهِ الأَيَّامَ', english: 'Yes, technology is advancing at an amazing speed these days', audio: '/audio/conversations/conv8_7_line2.mp3' },
            { speaker: 'خَالِد', arabic: 'صَحِيحٌ، لَكِنْ أَشْعُرُ أَنَّ النَّاسَ أَصْبَحُوا مُدْمِنِينَ عَلَى هَوَاتِفِهِمْ', english: 'True, but I feel that people have become addicted to their phones', audio: '/audio/conversations/conv8_7_line3.mp3' },
            { speaker: 'عُمَر', arabic: 'أُوَافِقُكَ تَمَامًا، وَسَائِلُ التَّوَاصُلِ الاجْتِمَاعِيِّ لَهَا إِيجَابِيَّاتٌ وَسَلْبِيَّاتٌ', english: 'I completely agree with you, social media has positives and negatives', audio: '/audio/conversations/conv8_7_line4.mp3' },
            { speaker: 'خَالِد', arabic: 'مَا رَأْيُكَ فِي تَأْثِيرِهَا عَلَى الشَّبَابِ وَالأَطْفَالِ؟', english: 'What is your opinion on its effect on youth and children?', audio: '/audio/conversations/conv8_7_line5.mp3' },
            { speaker: 'عُمَر', arabic: 'أَعْتَقِدُ أَنَّهَا سِلَاحٌ ذُو حَدَّيْنِ، يَجِبُ اسْتِخْدَامُهَا بِحِكْمَةٍ', english: 'I think it is a double-edged sword, it must be used wisely', audio: '/audio/conversations/conv8_7_line6.mp3' },
            { speaker: 'خَالِد', arabic: 'كَلَامٌ سَلِيمٌ، الْمُشْكِلَةُ أَنَّ الْكَثِيرِينَ يُضَيِّعُونَ وَقْتَهُمْ فِيهَا', english: 'Sound words, the problem is that many waste their time on it', audio: '/audio/conversations/conv8_7_line7.mp3' },
            { speaker: 'عُمَر', arabic: 'نَعَمْ، وَيَنْسَوْنَ أَهَمِّيَّةَ التَّوَاصُلِ الْحَقِيقِيِّ وَجْهًا لِوَجْهٍ', english: 'Yes, and they forget the importance of real face-to-face communication', audio: '/audio/conversations/conv8_7_line8.mp3' },
            { speaker: 'خَالِد', arabic: 'بِالضَّبْطِ، يَجِبُ أَنْ نَجِدَ تَوَازُنًا بَيْنَ الْعَالَمَيْنِ', english: 'Exactly, we must find a balance between the two worlds', audio: '/audio/conversations/conv8_7_line9.mp3' },
            { speaker: 'عُمَر', arabic: 'وَأَيْضًا يَجِبُ تَعْلِيمُ الأَجْيَالِ الْجَدِيدَةِ الاسْتِخْدَامَ الصَّحِيحَ', english: 'And also we must teach new generations the correct usage', audio: '/audio/conversations/conv8_7_line10.mp3' },
            { speaker: 'خَالِد', arabic: 'أَتَّفِقُ مَعَكَ، التَّرْبِيَةُ الرَّقْمِيَّةُ أَصْبَحَتْ ضَرُورِيَّةً', english: 'I agree with you, digital education has become necessary', audio: '/audio/conversations/conv8_7_line11.mp3' },
            { speaker: 'عُمَر', arabic: 'تَمَامًا، هَذَا هُوَ تَحَدِّي عَصْرِنَا الْحَالِيِّ', english: 'Exactly, this is the challenge of our current era', audio: '/audio/conversations/conv8_7_line12.mp3' }
        ]
    },
    {
        id: 'conv8_8',
        title: 'Philosophical Discussion About Life',
        context: 'Deep conversation about happiness, success, and the meaning of life',
        lines: [
            { speaker: 'فَاطِمَة', arabic: 'مَا هُوَ مَفْهُومُكَ لِلسَّعَادَةِ الْحَقِيقِيَّةِ؟', english: 'What is your concept of true happiness?', audio: '/audio/conversations/conv8_8_line1.mp3' },
            { speaker: 'مَرْيَم', arabic: 'سُؤَالٌ عَمِيقٌ، أَعْتَقِدُ أَنَّ السَّعَادَةَ تَكْمُنُ فِي الرِّضَا وَالْقَنَاعَةِ', english: 'A deep question, I think happiness lies in contentment and satisfaction', audio: '/audio/conversations/conv8_8_line2.mp3' },
            { speaker: 'فَاطِمَة', arabic: 'أُوَافِقُكِ، لَكِنْ أَلَيْسَ الطُّمُوحُ مُهِمًّا أَيْضًا؟', english: 'I agree with you, but is not ambition also important?', audio: '/audio/conversations/conv8_8_line3.mp3' },
            { speaker: 'مَرْيَم', arabic: 'بَلَى، الْمُهِمُّ هُوَ التَّوَازُنُ بَيْنَ الطُّمُوحِ وَالرِّضَا', english: 'Yes, what is important is the balance between ambition and contentment', audio: '/audio/conversations/conv8_8_line4.mp3' },
            { speaker: 'فَاطِمَة', arabic: 'وَمَا رَأْيُكِ فِي مَعْنَى النَّجَاحِ فِي الْحَيَاةِ؟', english: 'And what is your opinion on the meaning of success in life?', audio: '/audio/conversations/conv8_8_line5.mp3' },
            { speaker: 'مَرْيَم', arabic: 'النَّجَاحُ لَيْسَ فَقَطْ فِي الْمَالِ وَالشُّهْرَةِ، بَلْ فِي التَّأْثِيرِ الإِيجَابِيِّ', english: 'Success is not only in money and fame, but in positive impact', audio: '/audio/conversations/conv8_8_line6.mp3' },
            { speaker: 'فَاطِمَة', arabic: 'كَلَامٌ جَمِيلٌ، إِذًا النَّجَاحُ يَرْتَبِطُ بِخِدْمَةِ الآخَرِينَ؟', english: 'Beautiful words, so success is connected to serving others?', audio: '/audio/conversations/conv8_8_line7.mp3' },
            { speaker: 'مَرْيَم', arabic: 'نَعَمْ بِالتَّأْكِيدِ، وَأَيْضًا فِي تَحْقِيقِ السَّلَامِ الدَّاخِلِيِّ', english: 'Yes certainly, and also in achieving inner peace', audio: '/audio/conversations/conv8_8_line8.mp3' },
            { speaker: 'فَاطِمَة', arabic: 'هَلْ تَعْتَقِدِينَ أَنَّ الْمَالَ يَجْلِبُ السَّعَادَةَ؟', english: 'Do you think money brings happiness?', audio: '/audio/conversations/conv8_8_line9.mp3' },
            { speaker: 'مَرْيَم', arabic: 'الْمَالُ وَسِيلَةٌ وَلَيْسَ غَايَةً، يُسَاعِدُ لَكِنَّهُ لَا يَضْمَنُ السَّعَادَةَ', english: 'Money is a means and not an end, it helps but does not guarantee happiness', audio: '/audio/conversations/conv8_8_line10.mp3' },
            { speaker: 'فَاطِمَة', arabic: 'حِكْمَةٌ بَالِغَةٌ، الصِّحَّةُ وَالْعَائِلَةُ أَهَمُّ مِنَ الْمَالِ', english: 'Great wisdom, health and family are more important than money', audio: '/audio/conversations/conv8_8_line11.mp3' },
            { speaker: 'مَرْيَم', arabic: 'تَمَامًا، هَذِهِ هِيَ الْكُنُوزُ الْحَقِيقِيَّةُ فِي الْحَيَاةِ', english: 'Exactly, these are the true treasures in life', audio: '/audio/conversations/conv8_8_line12.mp3' }
        ]
    }
];

function makeConversationExercises(conv: ConversationData, nodeId: string): Exercise[] {
    const exercises: Exercise[] = [];
    
    // REMOVED: Introduction cards - learners must figure out the conversation!
    
    // Comprehension: Match speaker to line
    conv.lines.forEach((line, idx) => {
        const otherLines = conv.lines.filter((_, i) => i !== idx);
        const distractors = pick(otherLines, Math.min(2, otherLines.length)).map(l => l.arabic);
        
        exercises.push({
            id: nextId(`${nodeId}-comp-${idx}`),
            type: 'multiple_choice',
            prompt: `What does ${line.speaker} say?`,
            correctAnswer: line.arabic,
            choices: shuffle([line.arabic, ...distractors]),
            promptAudio: line.audio
        });
    });
    
    // Translation: Arabic to English
    conv.lines.forEach((line, idx) => {
        const otherLines = conv.lines.filter((_, i) => i !== idx);
        const distractors = pick(otherLines, Math.min(2, otherLines.length)).map(l => l.english);
        
        exercises.push({
            id: nextId(`${nodeId}-trans-${idx}`),
            type: 'multiple_choice',
            prompt: `What does this mean?`,
            correctAnswer: line.english,
            choices: shuffle([line.english, ...distractors]),
            hint: line.arabic,
            promptAudio: line.audio
        });
    });
    
    // Sentence assembly: Build the conversation lines
    conv.lines.forEach((line, idx) => {
        const words = line.arabic.split(' ');
        if (words.length >= 2) {
            const otherWords = conv.lines
                .filter((_, i) => i !== idx)
                .flatMap(l => l.arabic.split(' '))
                .filter(w => !words.includes(w));
            const distractors = pick(otherWords, Math.min(2, otherWords.length));
            
            exercises.push({
                id: nextId(`${nodeId}-asm-${idx}`),
                type: 'sentence_assembly',
                prompt: `Assemble: "${line.english}"`,
                correctAnswer: line.arabic,
                choices: shuffle([...words, ...distractors]),
                promptAudio: line.audio,
                hint: `${line.speaker} says this`
            });
        }
    });
    
    // Match pairs: Speaker to line
    exercises.push({
        id: nextId(`${nodeId}-mp-speaker`),
        type: 'match_pairs',
        prompt: `Match each speaker to what they say`,
        correctAnswer: '',
        choices: [],
        pairs: pick(conv.lines, Math.min(4, conv.lines.length)).map(l => ({ 
            left: l.speaker, 
            right: l.arabic 
        }))
    });
    
    // Match pairs: Arabic to English
    exercises.push({
        id: nextId(`${nodeId}-mp-trans`),
        type: 'match_pairs',
        prompt: `Match Arabic to English`,
        correctAnswer: '',
        choices: [],
        pairs: pick(conv.lines, Math.min(4, conv.lines.length)).map(l => ({ 
            left: l.arabic, 
            right: l.english 
        }))
    });
    
    return exercises;
}

function makeConversationNode(conv: ConversationData): CourseNode {
    const exercises = makeConversationExercises(conv, conv.id);
    
    // Split into rounds (NO MORE INTROS!)
    const comprehension = exercises.filter(e => e.type === 'multiple_choice');
    const assembly = exercises.filter(e => e.type === 'sentence_assembly');
    const matching = exercises.filter(e => e.type === 'match_pairs');
    
    // Create conversation line traps (AGGRESSIVE)
    const conversationTraps: Exercise[] = [];
    for (const line of pick(conv.lines, Math.min(4, conv.lines.length))) {
        const otherLines = conv.lines.filter(l => l.arabic !== line.arabic);
        if (otherLines.length >= 2) {
            conversationTraps.push(makeConversationLineTrap(
                line,
                otherLines.slice(0, 2),
                conv.id,
                `What does ${line.speaker} say?`
            ));
        }
    }
    
    // Add speaker confusion traps
    for (const line of pick(conv.lines, Math.min(3, conv.lines.length))) {
        const otherLines = conv.lines.filter(l => l.speaker !== line.speaker);
        if (otherLines.length >= 2) {
            conversationTraps.push({
                id: nextId(`${conv.id}-speaker-trap`),
                type: 'trap_select',
                prompt: `Careful! Which line does ${line.speaker} say?`,
                promptAudio: line.audio,
                correctAnswer: line.arabic,
                choices: shuffle([line.arabic, ...otherLines.slice(0, 2).map(l => l.arabic)]),
                trapExplanation: `<strong>${line.speaker}</strong> says: <strong class="arabic-text">${line.arabic}</strong> - "${line.english}".`,
            });
        }
    }
    
    return {
        id: `u7-${conv.id}`,
        title: conv.title,
        description: conv.context,
        type: 'lesson',
        status: 'locked',
        totalRounds: 4,
        completedRounds: 0,
        lessons: [
            {
                id: `u7-${conv.id}-r1`,
                title: 'Round 1: Comprehension',
                description: 'Figure out what is said',
                exercises: shuffle([...comprehension.slice(0, Math.ceil(comprehension.length / 2)), ...conversationTraps.slice(0, 2), ...makeWordRefreshers(4, conv.id), ...makeSentenceRefreshers(3, conv.id)])
            },
            {
                id: `u7-${conv.id}-r2`,
                title: 'Round 2: Build Sentences',
                description: 'Assemble the conversation',
                exercises: shuffle([...assembly, ...assembly, ...comprehension.slice(Math.ceil(comprehension.length / 2)), ...conversationTraps.slice(2, 4), ...makeWordRefreshers(5, conv.id), ...makeSentenceRefreshers(4, conv.id)])
            },
            {
                id: `u7-${conv.id}-r3`,
                title: 'Round 3: Practice More',
                description: 'Keep practicing',
                exercises: shuffle([...matching, ...pick(comprehension, 3), ...pick(assembly, 2), ...pick(assembly, 2), ...conversationTraps.slice(4, 6), ...makeWordRefreshers(6, conv.id), ...makeSentenceRefreshers(5, conv.id)])
            },
            {
                id: `u7-${conv.id}-r4`,
                title: 'Round 4: Master the Dialogue',
                description: 'Put it all together',
                exercises: shuffle([...matching, ...pick(comprehension, 4), ...pick(assembly, 3), ...conversationTraps, ...makeLetterRefreshers(4, conv.id), ...makeWordRefreshers(6, conv.id), ...makeSentenceRefreshers(6, conv.id)])
            }
        ]
    };
}

function makeUnit7Test(): CourseNode {
    const exercises: Exercise[] = [];
    
    // Test all conversations
    UNIT7_CONVERSATIONS.forEach(conv => {
        // Translation questions
        conv.lines.forEach(line => {
            const otherLines = UNIT7_CONVERSATIONS
                .flatMap(c => c.lines)
                .filter(l => l.english !== line.english);
            const distractors = pick(otherLines, 3).map(l => l.english);
            
            exercises.push({
                id: nextId('u7t-trans'),
                type: 'multiple_choice',
                prompt: 'What does this mean?',
                correctAnswer: line.english,
                choices: shuffle([line.english, ...distractors]),
                hint: line.arabic,
                promptAudio: line.audio
            });
        });
        
        // Assembly questions
        conv.lines.forEach(line => {
            const words = line.arabic.split(' ');
            if (words.length >= 2) {
                const otherWords = UNIT7_CONVERSATIONS
                    .flatMap(c => c.lines)
                    .filter(l => l.arabic !== line.arabic)
                    .flatMap(l => l.arabic.split(' '))
                    .filter(w => !words.includes(w));
                const distractors = pick(otherWords, Math.min(3, otherWords.length));
                
                exercises.push({
                    id: nextId('u7t-asm'),
                    type: 'sentence_assembly',
                    prompt: `Assemble: "${line.english}"`,
                    correctAnswer: line.arabic,
                    choices: shuffle([...words, ...distractors]),
                    promptAudio: line.audio
                });
            }
        });
    });
    
    // Match pairs from different conversations
    const allLines = UNIT7_CONVERSATIONS.flatMap(c => c.lines);
    exercises.push({
        id: nextId('u7t-mp'),
        type: 'match_pairs',
        prompt: 'Match Arabic to English',
        correctAnswer: '',
        choices: [],
        pairs: pick(allLines, 6).map(l => ({ left: l.arabic, right: l.english }))
    });
    
    return {
        id: 'u7-test',
        title: '📝 Unit 7 Test',
        description: 'Test all conversations',
        type: 'test',
        status: 'locked',
        totalRounds: 1,
        completedRounds: 0,
        lessons: [{
            id: 'u7-test-lesson',
            title: 'Unit 7 Test',
            description: 'Show you can handle real conversations',
            exercises: shuffle(exercises)
        }]
    };
}

function makeUnit8Test(): CourseNode {
    const exercises: Exercise[] = [];
    
    // Test all advanced conversations
    UNIT8_CONVERSATIONS.forEach(conv => {
        // Translation questions
        conv.lines.forEach(line => {
            const otherLines = UNIT8_CONVERSATIONS
                .flatMap(c => c.lines)
                .filter(l => l.english !== line.english);
            const distractors = pick(otherLines, 3).map(l => l.english);
            
            exercises.push({
                id: nextId('u8t-trans'),
                type: 'multiple_choice',
                prompt: 'What does this mean?',
                correctAnswer: line.english,
                choices: shuffle([line.english, ...distractors]),
                hint: line.arabic,
                promptAudio: line.audio
            });
        });
        
        // Assembly questions for longer sentences
        conv.lines.forEach(line => {
            const words = line.arabic.split(' ');
            if (words.length >= 2) {
                const otherWords = UNIT8_CONVERSATIONS
                    .flatMap(c => c.lines)
                    .filter(l => l.arabic !== line.arabic)
                    .flatMap(l => l.arabic.split(' '))
                    .filter(w => !words.includes(w));
                const distractors = pick(otherWords, Math.min(4, otherWords.length));
                
                exercises.push({
                    id: nextId('u8t-asm'),
                    type: 'sentence_assembly',
                    prompt: `Assemble: "${line.english}"`,
                    correctAnswer: line.arabic,
                    choices: shuffle([...words, ...distractors]),
                    promptAudio: line.audio
                });
            }
        });
    });
    
    // Match pairs from different conversations
    const allLines = UNIT8_CONVERSATIONS.flatMap(c => c.lines);
    exercises.push({
        id: nextId('u8t-mp'),
        type: 'match_pairs',
        prompt: 'Match Arabic to English',
        correctAnswer: '',
        choices: [],
        pairs: pick(allLines, 8).map(l => ({ left: l.arabic, right: l.english }))
    });
    
    return {
        id: 'u8-test',
        title: '📝 Unit 8 Test',
        description: 'Test advanced conversations',
        type: 'test',
        status: 'locked',
        totalRounds: 1,
        completedRounds: 0,
        lessons: [{
            id: 'u8-test-lesson',
            title: 'Unit 8 Test',
            description: 'Show you can handle complex real-world conversations',
            exercises: shuffle(exercises)
        }]
    };
}

// ═══════════════════════════════════════════════════════════
// UNIT 9: QURANIC VERSES (STAGE 9)
// ═══════════════════════════════════════════════════════════

interface QuranVerse {
    id: string;
    surahNumber: number;
    surahName: string;
    surahNameArabic: string;
    verseNumber: number;
    arabic: string;
    transliteration: string;
    translation: string;
    audio: string;
    context?: string;
}

const UNIT9_QURAN_VERSES: QuranVerse[] = [
    // Surah Al-Fatihah (The Opening) - Most important surah
    {
        id: 'quran_1_1',
        surahNumber: 1,
        surahName: 'Al-Fatihah',
        surahNameArabic: 'الفَاتِحَة',
        verseNumber: 1,
        arabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
        transliteration: 'Bismillāhi r-raḥmāni r-raḥīm',
        translation: 'In the name of Allah, the Most Gracious, the Most Merciful',
        audio: '/audio/quran/quran_1_1.mp3',
        context: 'The opening verse of every surah except one, recited before every action'
    },
    {
        id: 'quran_1_2',
        surahNumber: 1,
        surahName: 'Al-Fatihah',
        surahNameArabic: 'الفَاتِحَة',
        verseNumber: 2,
        arabic: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',
        transliteration: 'Al-ḥamdu lillāhi rabbi l-ʿālamīn',
        translation: 'All praise is due to Allah, Lord of all the worlds',
        audio: '/audio/quran/quran_1_2.mp3'
    },
    
    // Surah Al-Ikhlas (Sincerity) - Short and fundamental
    {
        id: 'quran_112_1',
        surahNumber: 112,
        surahName: 'Al-Ikhlas',
        surahNameArabic: 'الإِخْلَاص',
        verseNumber: 1,
        arabic: 'قُلْ هُوَ اللَّهُ أَحَدٌ',
        transliteration: 'Qul huwa Allāhu aḥad',
        translation: 'Say: He is Allah, the One',
        audio: '/audio/quran/quran_112_1.mp3',
        context: 'Describes the oneness of Allah, equals 1/3 of the Quran in reward'
    },
    {
        id: 'quran_112_2',
        surahNumber: 112,
        surahName: 'Al-Ikhlas',
        surahNameArabic: 'الإِخْلَاص',
        verseNumber: 2,
        arabic: 'اللَّهُ الصَّمَدُ',
        transliteration: 'Allāhu ṣ-ṣamad',
        translation: 'Allah, the Eternal Refuge',
        audio: '/audio/quran/quran_112_2.mp3'
    },
    {
        id: 'quran_112_3',
        surahNumber: 112,
        surahName: 'Al-Ikhlas',
        surahNameArabic: 'الإِخْلَاص',
        verseNumber: 3,
        arabic: 'لَمْ يَلِدْ وَلَمْ يُولَدْ',
        transliteration: 'Lam yalid wa lam yūlad',
        translation: 'He neither begets nor is born',
        audio: '/audio/quran/quran_112_3.mp3'
    },
    {
        id: 'quran_112_4',
        surahNumber: 112,
        surahName: 'Al-Ikhlas',
        surahNameArabic: 'الإِخْلَاص',
        verseNumber: 4,
        arabic: 'وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ',
        transliteration: 'Wa lam yakun lahu kufuwan aḥad',
        translation: 'Nor is there to Him any equivalent',
        audio: '/audio/quran/quran_112_4.mp3'
    },
    
    // Surah Al-Falaq (The Daybreak)
    {
        id: 'quran_113_1',
        surahNumber: 113,
        surahName: 'Al-Falaq',
        surahNameArabic: 'الفَلَق',
        verseNumber: 1,
        arabic: 'قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ',
        transliteration: 'Qul aʿūdhu bi-rabbi l-falaq',
        translation: 'Say: I seek refuge in the Lord of daybreak',
        audio: '/audio/quran/quran_113_1.mp3',
        context: 'Seeking protection from evil, recited for protection'
    },
    {
        id: 'quran_113_2',
        surahNumber: 113,
        surahName: 'Al-Falaq',
        surahNameArabic: 'الفَلَق',
        verseNumber: 2,
        arabic: 'مِن شَرِّ مَا خَلَقَ',
        transliteration: 'Min sharri mā khalaq',
        translation: 'From the evil of what He created',
        audio: '/audio/quran/quran_113_2.mp3'
    },
    
    // Surah An-Nas (Mankind)
    {
        id: 'quran_114_1',
        surahNumber: 114,
        surahName: 'An-Nas',
        surahNameArabic: 'النَّاس',
        verseNumber: 1,
        arabic: 'قُلْ أَعُوذُ بِرَبِّ النَّاسِ',
        transliteration: 'Qul aʿūdhu bi-rabbi n-nās',
        translation: 'Say: I seek refuge in the Lord of mankind',
        audio: '/audio/quran/quran_114_1.mp3',
        context: 'Seeking protection from evil whispers'
    },
    {
        id: 'quran_114_2',
        surahNumber: 114,
        surahName: 'An-Nas',
        surahNameArabic: 'النَّاس',
        verseNumber: 2,
        arabic: 'مَلِكِ النَّاسِ',
        transliteration: 'Maliki n-nās',
        translation: 'The Sovereign of mankind',
        audio: '/audio/quran/quran_114_2.mp3'
    },
    {
        id: 'quran_114_3',
        surahNumber: 114,
        surahName: 'An-Nas',
        surahNameArabic: 'النَّاس',
        verseNumber: 3,
        arabic: 'إِلَٰهِ النَّاسِ',
        transliteration: 'Ilāhi n-nās',
        translation: 'The God of mankind',
        audio: '/audio/quran/quran_114_3.mp3'
    },
    
    // Surah Al-Asr (The Time)
    {
        id: 'quran_103_1',
        surahNumber: 103,
        surahName: 'Al-Asr',
        surahNameArabic: 'العَصْر',
        verseNumber: 1,
        arabic: 'وَالْعَصْرِ',
        transliteration: 'Wa l-ʿaṣr',
        translation: 'By time',
        audio: '/audio/quran/quran_103_1.mp3',
        context: 'A complete philosophy of life in 3 verses'
    },
    {
        id: 'quran_103_2',
        surahNumber: 103,
        surahName: 'Al-Asr',
        surahNameArabic: 'العَصْر',
        verseNumber: 2,
        arabic: 'إِنَّ الْإِنسَانَ لَفِي خُسْرٍ',
        transliteration: 'Inna l-insāna la-fī khusr',
        translation: 'Indeed, mankind is in loss',
        audio: '/audio/quran/quran_103_2.mp3'
    },
    {
        id: 'quran_103_3',
        surahNumber: 103,
        surahName: 'Al-Asr',
        surahNameArabic: 'العَصْر',
        verseNumber: 3,
        arabic: 'إِلَّا الَّذِينَ آمَنُوا وَعَمِلُوا الصَّالِحَاتِ وَتَوَاصَوْا بِالْحَقِّ وَتَوَاصَوْا بِالصَّبْرِ',
        transliteration: 'Illā lladhīna āmanū wa ʿamilū ṣ-ṣāliḥāti wa tawāṣaw bi-l-ḥaqqi wa tawāṣaw bi-ṣ-ṣabr',
        translation: 'Except for those who believe and do righteous deeds and advise each other to truth and advise each other to patience',
        audio: '/audio/quran/quran_103_3.mp3'
    },
    
    // Surah Al-Kawthar (Abundance)
    {
        id: 'quran_108_1',
        surahNumber: 108,
        surahName: 'Al-Kawthar',
        surahNameArabic: 'الكَوْثَر',
        verseNumber: 1,
        arabic: 'إِنَّا أَعْطَيْنَاكَ الْكَوْثَرَ',
        transliteration: 'Innā aʿṭaynāka l-kawthar',
        translation: 'Indeed, We have granted you abundance',
        audio: '/audio/quran/quran_108_1.mp3',
        context: 'The shortest surah, about divine abundance'
    },
    {
        id: 'quran_108_2',
        surahNumber: 108,
        surahName: 'Al-Kawthar',
        surahNameArabic: 'الكَوْثَر',
        verseNumber: 2,
        arabic: 'فَصَلِّ لِرَبِّكَ وَانْحَرْ',
        transliteration: 'Fa-ṣalli li-rabbika wa nḥar',
        translation: 'So pray to your Lord and sacrifice',
        audio: '/audio/quran/quran_108_2.mp3'
    },
    {
        id: 'quran_108_3',
        surahNumber: 108,
        surahName: 'Al-Kawthar',
        surahNameArabic: 'الكَوْثَر',
        verseNumber: 3,
        arabic: 'إِنَّ شَانِئَكَ هُوَ الْأَبْتَرُ',
        transliteration: 'Inna shāniʾaka huwa l-abtar',
        translation: 'Indeed, your enemy is the one cut off',
        audio: '/audio/quran/quran_108_3.mp3'
    }
];

function makeQuranVerseExercises(verse: QuranVerse, nodeId: string): Exercise[] {
    const exercises: Exercise[] = [];
    
    // 1. Reading exercise with audio
    exercises.push({
        id: nextId(`${nodeId}-read`),
        type: 'hear_choose',
        prompt: 'Listen and identify the correct verse',
        promptAudio: verse.audio,
        correctAnswer: verse.arabic,
        choices: shuffle([
            verse.arabic,
            ...pick(UNIT9_QURAN_VERSES.filter(v => v.id !== verse.id).map(v => v.arabic), 3)
        ])
    });
    
    // 2. Translation matching
    exercises.push({
        id: nextId(`${nodeId}-trans`),
        type: 'multiple_choice',
        prompt: `What is the meaning of this verse?`,
        hint: verse.arabic,
        correctAnswer: verse.translation,
        choices: shuffle([
            verse.translation,
            ...pick(UNIT9_QURAN_VERSES.filter(v => v.id !== verse.id).map(v => v.translation), 3)
        ]),
        promptAudio: verse.audio
    });
    
    // 3. Transliteration matching (helps with pronunciation)
    exercises.push({
        id: nextId(`${nodeId}-translit`),
        type: 'multiple_choice',
        prompt: 'Choose the correct transliteration',
        hint: verse.arabic,
        correctAnswer: verse.transliteration,
        choices: shuffle([
            verse.transliteration,
            ...pick(UNIT9_QURAN_VERSES.filter(v => v.id !== verse.id).map(v => v.transliteration), 3)
        ])
    });
    
    return exercises;
}

function makeQuranSurahNode(surahNumber: number, nodeId: string): CourseNode {
    const surahVerses = UNIT9_QURAN_VERSES.filter(v => v.surahNumber === surahNumber);
    const firstVerse = surahVerses[0];
    
    return {
        id: nodeId,
        title: `${firstVerse.surahNameArabic} (${firstVerse.surahName})`,
        description: `Surah ${surahNumber}`,
        type: 'lesson',
        status: 'locked',
        totalRounds: 1,  // Fixed: Only 1 round exists
        completedRounds: 0,
        lessons: [
            {
                id: `${nodeId}-l1`,
                title: 'Reading Practice',
                description: 'Learn to read and understand the verses',
                exercises: shuffle(surahVerses.flatMap(v => makeQuranVerseExercises(v, nodeId)))
            }
        ]
    };
}

function makeUnit9Test(): CourseNode {
    const exercises: Exercise[] = [];
    
    // Test all verses
    UNIT9_QURAN_VERSES.forEach(verse => {
        // Translation test
        exercises.push({
            id: nextId('u9t-trans'),
            type: 'multiple_choice',
            prompt: 'What does this verse mean?',
            hint: verse.arabic,
            correctAnswer: verse.translation,
            choices: shuffle([
                verse.translation,
                ...pick(UNIT9_QURAN_VERSES.filter(v => v.id !== verse.id).map(v => v.translation), 3)
            ]),
            promptAudio: verse.audio
        });
        
        // Audio recognition test
        exercises.push({
            id: nextId('u9t-audio'),
            type: 'hear_choose',
            prompt: 'Listen and choose the correct verse',
            promptAudio: verse.audio,
            correctAnswer: verse.arabic,
            choices: shuffle([
                verse.arabic,
                ...pick(UNIT9_QURAN_VERSES.filter(v => v.id !== verse.id).map(v => v.arabic), 3)
            ])
        });
    });
    
    // Match pairs
    exercises.push({
        id: nextId('u9t-mp'),
        type: 'match_pairs',
        prompt: 'Match Arabic verses to their English translations',
        correctAnswer: '',
        choices: [],
        pairs: pick(UNIT9_QURAN_VERSES, 6).map(v => ({ left: v.arabic, right: v.translation }))
    });
    
    return {
        id: 'u9-test',
        title: '📝 Unit 9 Test',
        description: 'Test Quranic verses',
        type: 'test',
        status: 'locked',
        totalRounds: 1,
        completedRounds: 0,
        lessons: [{
            id: 'u9-test-lesson',
            title: 'Unit 9 Test',
            description: 'Show you can read and understand Quranic verses',
            exercises: shuffle(exercises)
        }]
    };
}

// ─── Course Data ───────────────────────────────────────────

const baseCourseData: Course = {
    id: 'stage-1',
    title: 'Stage 1',
    description: 'Script & Sound Decoding',
    units: [
        {
            id: 1,
            title: 'Unit 1',
            description: 'The Arabic Alphabet',
            color: '#58CC02',
            nodes: [
                makeLetterGroupNode('u1-n1', NODE_GROUPS[0], 0),
                makeLetterGroupNode('u1-n2', NODE_GROUPS[1], 1),
                makeLetterGroupNode('u1-n3', NODE_GROUPS[2], 2),
                makeLetterGroupNode('u1-n4', NODE_GROUPS[3], 3),
                makeLetterGroupNode('u1-n5', NODE_GROUPS[4], 4),
                makeLetterGroupNode('u1-n6', NODE_GROUPS[5], 5),
                makeLetterGroupNode('u1-n7', NODE_GROUPS[6], 6),
                makeUnitTest(),
            ],
        },
        {
            id: 2,
            title: 'Unit 2',
            description: 'Short Vowels (Harakat)',
            color: '#49C0F8',
            nodes: [
                makeSingleVowelNode(0, 'u2-n1'), // Fatha
                makeSingleVowelNode(1, 'u2-n2'), // Kasra
                makeSingleVowelNode(2, 'u2-n3'), // Damma
                makeMixedVowelNode('u2-n4'),
                makeUnit2Test(),
            ],
        },
        {
            id: 3,
            title: 'Unit 3',
            description: 'Words & Connecting',
            color: '#FF4B4B',
            nodes: [
                makeWordAssemblyNode('u3-n1', 'First Words', UNIT3_WORDS.slice(0, 4), true),
                makeWordAssemblyNode('u3-n2', 'Nature & Animals', UNIT3_WORDS.slice(4, 8), true),
                makeWordAssemblyNode('u3-n3', 'People & Things', UNIT3_WORDS.slice(8, 12), true),
                makeWordAssemblyNode('u3-n4', 'Body Parts', UNIT3_WORDS.slice(12, 17), true),
                makeWordAssemblyNode('u3-n5', 'Common Adjectives', UNIT3_WORDS.slice(17, 22), true),
                {
                    id: 'u3-test',
                    title: '📝 Unit 3 Test',
                    description: 'Test your vocabulary',
                    type: 'test',
                    status: 'active',
                    totalRounds: 1,
                    completedRounds: 0,
                    lessons: [{
                        id: 'u3-test-lesson',
                        title: 'Unit 3 Test',
                        description: 'Assemble all the words learned.',
                        exercises: shuffle(UNIT3_WORDS.flatMap(w => [
                            {
                                id: nextId('u3t-asm'),
                                type: 'word_assembly',
                                prompt: `Spell: ${w.english}`,
                                correctAnswer: w.arabic,
                                choices: shuffle([...w.arabic.split(''), 'م']),
                            }
                        ])),
                    }],
                },
                makeCumulativeTest1()
            ],
        },
        {
            id: 4,
            title: 'Unit 4',
            description: 'Core Vocabulary (Stage 4)',
            color: '#9C27B0', // A nice deep purple for Stage 4
            nodes: [
                makeWordAssemblyNode('u4-n1', 'Home Sweet Home', UNIT4_WORDS.slice(0, 4), true),
                makeWordAssemblyNode('u4-n2', 'Family Members', UNIT4_WORDS.slice(4, 8), true),
                makeWordAssemblyNode('u4-n3', 'Eat & Drink', UNIT4_WORDS.slice(8, 12), true),
                makeWordAssemblyNode('u4-n4', 'Places', UNIT4_WORDS.slice(12, 16), true),
                makeWordAssemblyNode('u4-n5', 'Time & Numbers', UNIT4_WORDS.slice(16, 24), true),
                makeWordAssemblyNode('u4-n6', 'Actions', UNIT4_WORDS.slice(24, 32), true),
                makeWordAssemblyNode('u4-n7', 'Adjectives', UNIT4_WORDS.slice(32, 40), true),
                {
                    id: 'u4-test',
                    title: '📝 Unit 4 Test',
                    description: 'Test all vocabulary',
                    type: 'test',
                    status: 'locked',
                    totalRounds: 1,
                    completedRounds: 0,
                    lessons: [{
                        id: 'u4-test-lesson',
                        title: 'Unit 4 Test',
                        description: 'Translate and assemble the core words.',
                        exercises: shuffle(UNIT4_WORDS.flatMap(w => [
                            {
                                id: nextId('u4t-mul'),
                                type: 'multiple_choice',
                                prompt: `What is the Arabic word for "${w.english}"?`,
                                correctAnswer: w.arabic,
                                choices: shuffle([w.arabic, ...pick(UNIT4_WORDS.map(ww => ww.arabic).filter(a => a !== w.arabic), 3)])
                            }
                        ])),
                    }],
                }
            ]
        },
        {
            id: 5,
            title: 'Unit 4B',
            description: 'Extended Vocabulary',
            color: '#7B1FA2', // Darker purple for Unit 4B
            nodes: [
                makeWordAssemblyNode('u4b-n1', 'Body Parts', UNIT4B_WORDS.slice(0, 10), true),
                makeWordAssemblyNode('u4b-n2', 'Colors', UNIT4B_WORDS.slice(10, 20), true),
                makeWordAssemblyNode('u4b-n3', 'Nature & Weather', UNIT4B_WORDS.slice(20, 30), true),
                makeWordAssemblyNode('u4b-n4', 'Common Objects', UNIT4B_WORDS.slice(30, 40), true),
                {
                    id: 'u4b-test',
                    title: '📝 Unit 4B Test',
                    description: 'Test extended vocabulary',
                    type: 'test',
                    status: 'locked',
                    totalRounds: 1,
                    completedRounds: 0,
                    lessons: [{
                        id: 'u4b-test-lesson',
                        title: 'Unit 4B Test',
                        description: 'Test your extended vocabulary.',
                        exercises: shuffle(UNIT4B_WORDS.flatMap(w => [
                            {
                                id: nextId('u4bt-mul'),
                                type: 'multiple_choice',
                                prompt: `What is the Arabic word for "${w.english}"?`,
                                correctAnswer: w.arabic,
                                choices: shuffle([w.arabic, ...pick(UNIT4B_WORDS.map(ww => ww.arabic).filter(a => a !== w.arabic), 3)])
                            }
                        ])),
                    }],
                }
            ]
        },
        {
            id: 6,
            title: 'Unit 4C',
            description: 'Advanced Vocabulary',
            color: '#6A1B9A', // Even darker purple for Unit 4C
            nodes: [
                makeWordAssemblyNode('u4c-n1', 'Directions', UNIT4C_WORDS.slice(0, 10), true),
                makeWordAssemblyNode('u4c-n2', 'People', UNIT4C_WORDS.slice(10, 20), true),
                makeWordAssemblyNode('u4c-n3', 'More Actions', UNIT4C_WORDS.slice(20, 30), true),
                makeWordAssemblyNode('u4c-n4', 'Expressions', UNIT4C_WORDS.slice(30, 40), true),
                {
                    id: 'u4c-test',
                    title: '📝 Unit 4C Test',
                    description: 'Test advanced vocabulary',
                    type: 'test',
                    status: 'locked',
                    totalRounds: 1,
                    completedRounds: 0,
                    lessons: [{
                        id: 'u4c-test-lesson',
                        title: 'Unit 4C Test',
                        description: 'Test your advanced vocabulary.',
                        exercises: shuffle(UNIT4C_WORDS.flatMap(w => [
                            {
                                id: nextId('u4ct-mul'),
                                type: 'multiple_choice',
                                prompt: `What is the Arabic word for "${w.english}"?`,
                                correctAnswer: w.arabic,
                                choices: shuffle([w.arabic, ...pick(UNIT4C_WORDS.map(ww => ww.arabic).filter(a => a !== w.arabic), 3)])
                            }
                        ])),
                    }],
                }
            ]
        },
        {
            id: 7,
            title: 'Unit 5',
            description: 'Unvowelled Reading (Stage 5)',
            color: '#F5A623', // Bright vibrant orange
            nodes: [
                makeUnvowelledNode('u5-n1', 'Naked Words 1', [...UNIT4_WORDS.slice(0, 10), ...UNIT4B_WORDS.slice(0, 5)]),
                makeUnvowelledNode('u5-n2', 'Naked Words 2', [...UNIT4_WORDS.slice(10, 20), ...UNIT4B_WORDS.slice(5, 10)]),
                makeUnvowelledNode('u5-n3', 'Naked Words 3', [...UNIT4_WORDS.slice(20, 30), ...UNIT4B_WORDS.slice(10, 15)]),
                makeUnvowelledNode('u5-n4', 'Naked Words 4', [...UNIT4_WORDS.slice(30, 40), ...UNIT4C_WORDS.slice(0, 5)]),
                makeUnvowelledNode('u5-n5', 'Naked Words 5', [...UNIT4C_WORDS.slice(5, 20)]),
                {
                    id: 'u5-test',
                    title: '📝 Unit 5 Test',
                    description: 'Test unvowelled reading',
                    type: 'test',
                    status: 'locked',
                    totalRounds: 1,
                    completedRounds: 0,
                    lessons: [{
                        id: 'u5-test-lesson',
                        title: 'Unit 5 Test',
                        description: 'Translate unvowelled Arabic back to English.',
                        exercises: shuffle([...UNIT4_WORDS, ...UNIT4B_WORDS, ...UNIT4C_WORDS].flatMap(w => [
                            {
                                id: nextId('u5t-mul'),
                                type: 'multiple_choice',
                                prompt: `What does this word mean?`,
                                correctAnswer: w.english,
                                choices: shuffle([w.english, ...pick([...UNIT4_WORDS, ...UNIT4B_WORDS, ...UNIT4C_WORDS].map(ww => ww.english).filter(a => a !== w.english), 3)]),
                                hint: stripHarakat(w.arabic)
                            }
                        ])),
                    }],
                }
            ]
        },
        {
            id: 8,
            title: 'Unit 6',
            description: 'Full Sentences (Stage 6)',
            color: '#FFD700', // Gold color for Stage 6 mastery
            nodes: [
                makeSentenceNode('u6-n1', 'Greetings', UNIT6_SENTENCES.slice(0, 6)),
                makeSentenceNode('u6-n2', 'Common Phrases', UNIT6_SENTENCES.slice(6, 12)),
                makeSentenceNode('u6-n3', 'Questions', UNIT6_SENTENCES.slice(12, 18)),
                makeSentenceNode('u6-n4', 'Negations', UNIT6_SENTENCES.slice(18, 24)),
                makeSentenceNode('u6-n5', 'Commands & Descriptions', UNIT6_SENTENCES.slice(24, 30)),
                {
                    id: 'u6-test',
                    title: '📝 Unit 6 Test',
                    description: 'Test sentence mastery',
                    type: 'test',
                    status: 'locked',
                    totalRounds: 1,
                    completedRounds: 0,
                    lessons: [{
                        id: 'u6-test-lesson',
                        title: 'Unit 6 Test',
                        description: 'Assemble and translate complex sentences.',
                        exercises: shuffle(UNIT6_SENTENCES.flatMap(s => [
                            {
                                id: nextId('u6t-asm'),
                                type: 'sentence_assembly',
                                prompt: `Assemble: "${s.english}"`,
                                correctAnswer: s.arabic,
                                choices: shuffle([...s.words]),
                                promptAudio: s.audio
                            }
                        ])),
                    }],
                },
                makeCumulativeTest2()
            ]
        },
        {
            id: 9,
            title: 'Unit 7',
            description: 'Real Conversations (Stage 7)',
            color: '#00BFA5', // Teal color for conversation mastery
            nodes: [
                makeConversationNode(UNIT7_CONVERSATIONS[0]), // Meeting Someone New
                makeConversationNode(UNIT7_CONVERSATIONS[1]), // How Are You?
                makeConversationNode(UNIT7_CONVERSATIONS[2]), // At Home
                makeConversationNode(UNIT7_CONVERSATIONS[3]), // At the Market
                makeConversationNode(UNIT7_CONVERSATIONS[4]), // Asking for Help
                makeConversationNode(UNIT7_CONVERSATIONS[5]), // Saying Goodbye
                makeUnit7Test()
            ]
        },
        {
            id: 10,
            title: 'Unit 8',
            description: 'Advanced Conversations (Stage 8)',
            color: '#E91E63', // Pink color for advanced mastery
            nodes: [
                makeConversationNode(UNIT8_CONVERSATIONS[0]), // At the Restaurant
                makeConversationNode(UNIT8_CONVERSATIONS[1]), // Asking for Directions
                makeConversationNode(UNIT8_CONVERSATIONS[2]), // At the Market
                makeConversationNode(UNIT8_CONVERSATIONS[3]), // Making Plans
                makeConversationNode(UNIT8_CONVERSATIONS[4]), // Talking About Hobbies
                makeConversationNode(UNIT8_CONVERSATIONS[5]), // At the Doctor
                makeConversationNode(UNIT8_CONVERSATIONS[6]), // Talking About Family
                makeConversationNode(UNIT8_CONVERSATIONS[7]), // Planning a Trip
                makeUnit8Test()
            ]
        },
        {
            id: 11,
            title: 'Unit 9',
            description: 'Quranic Verses (Stage 9)',
            color: '#4CAF50', // Green color for spiritual mastery
            nodes: [
                makeQuranSurahNode(1, 'u9-n1'),    // Al-Fatihah (2 verses)
                makeQuranSurahNode(112, 'u9-n2'),  // Al-Ikhlas (4 verses)
                makeQuranSurahNode(113, 'u9-n3'),  // Al-Falaq (2 verses)
                makeQuranSurahNode(114, 'u9-n4'),  // An-Nas (3 verses)
                makeQuranSurahNode(103, 'u9-n5'),  // Al-Asr (3 verses)
                makeQuranSurahNode(108, 'u9-n6'),  // Al-Kawthar (3 verses)
                makeUnit9Test(),
                makeFinalComprehensiveTest()
            ]
        }
    ],
};

// --- Post-Processor: Boost Audio Exercises ---
// The user requested 20% MORE listening exercises than reading exercises overall.
// We traverse the generated course and duplicate 'hear_choose' and audio 'trap_select'
// to shift the balance dynamically.

function postProcessCourse(course: Course): Course {
    course.units.forEach(unit => {
        unit.nodes.forEach(node => {
            if (node.lessons) {
                node.lessons.forEach(lesson => {
                    const audioExercises = lesson.exercises.filter(e =>
                        e.type === 'hear_choose' || e.promptAudio
                    );
                    const readingExercises = lesson.exercises.filter(e =>
                        e.type !== 'hear_choose' && !e.promptAudio && e.type !== 'introduction' && e.type.toString() !== 'intro-trap-philosophy'
                    );

                    // Duplicate some audio exercises to shift the ratio
                    // Make sure audio questions outnumber reading questions by about 20%
                    const targetAudioCount = Math.ceil(readingExercises.length * 1.2);
                    const currentAudioCount = audioExercises.length;
                    const diff = targetAudioCount - currentAudioCount;

                    if (diff > 0 && audioExercises.length > 0) {
                        for (let i = 0; i < diff; i++) {
                            const exToClone = audioExercises[i % audioExercises.length];
                            // Clone it with a new ID
                            lesson.exercises.push({
                                ...exToClone,
                                id: exToClone.id + '-boost-' + i
                            });
                        }
                    }

                    // ====== UNIVERSAL INTRO SORTING ======
                    // Ensure that ALL 'introduction' and 'intro-trap-philosophy' cards
                    // appear at the VERY START of the lesson array so they are never
                    // shuffled behind test exercises.
                    const intros = lesson.exercises.filter(e => e.type === 'introduction' || e.type.toString() === 'intro-trap-philosophy');
                    const others = lesson.exercises.filter(e => e.type !== 'introduction' && e.type.toString() !== 'intro-trap-philosophy');

                    // Fisher-Yates shuffle ONLY the graded/test exercises
                    for (let i = others.length - 1; i > 0; i--) {
                        const j = Math.floor(Math.random() * (i + 1));
                        [others[i], others[j]] = [others[j], others[i]];
                    }

                    // Reconstruct lesson with Intros safely locked at the front
                    lesson.exercises = [...intros, ...others];
                });
            }
        });
    });
    return course;
}

export const courseData: Course = postProcessCourse(baseCourseData);

