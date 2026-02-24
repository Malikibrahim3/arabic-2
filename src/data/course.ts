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
// ROUND 2: SOUNDS — Audio exercises (6 choices, traps)
// ═══════════════════════════════════════════════════════════

function makeRound2(letters: LetterInfo[], nodeId: string): Lesson {
    const letterPool = ALL_LETTERS.map(l => l.letter);
    const namePool = ALL_LETTERS.map(l => l.name);

    const exercises: Exercise[] = [];
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

    return {
        id: `${nodeId}-lesson2`,
        title: 'Round 2: Learn the Sounds',
        description: 'Connect letters to their sounds',
        exercises: [...shuffle(exercises.slice(0, exercises.length - 1)), exercises[exercises.length - 1]],
    };
}

// ═══════════════════════════════════════════════════════════
// ROUND 3: DISCRIMINATION — Mixed with OLD letters (refresher + traps)
// ═══════════════════════════════════════════════════════════

function makeRound3(letters: LetterInfo[], nodeId: string, prevLetters: LetterInfo[]): Lesson {
    // AGGRESSIVE refresher: pull up to 6 old letters (not just the recent ones)
    const oldReview = pick(prevLetters, Math.min(prevLetters.length, 6));
    const allPool = [...letters, ...oldReview];
    const letterPool = allPool.map(x => x.letter);
    const namePool = allPool.map(x => x.name);

    const exercises: Exercise[] = [];

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
// ROUND 4: REVIEW — Heavy mix of old + new (6 choices, traps)
// ═══════════════════════════════════════════════════════════

function makeRound4(letters: LetterInfo[], nodeId: string, prevLetters: LetterInfo[]): Lesson {
    // Even MORE old letters — up to 8 for heavy review
    const reviewLetters = pick(prevLetters, Math.min(prevLetters.length, 8));
    const allLetters = [...letters, ...reviewLetters];
    const bigPool = allLetters.map(x => x.letter);
    const bigNamePool = allLetters.map(x => x.name);

    const exercises: Exercise[] = [];

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

    return {
        id: `${nodeId}-lesson4`,
        title: 'Round 4: Full Review',
        description: 'Everything mixed — old and new',
        exercises: shuffle(exercises),
    };
}

// ═══════════════════════════════════════════════════════════
// ROUND 5: ASSESSMENT — Match pairs + rapid recall (traps + refresher)
// ═══════════════════════════════════════════════════════════

function makeRound5(letters: LetterInfo[], nodeId: string, prevLetters: LetterInfo[]): Lesson {
    const allForTest = [...letters, ...pick(prevLetters, Math.min(prevLetters.length, 6))];
    const bigPool = allForTest.map(x => x.letter);
    const namePool = allForTest.map(x => x.name);

    const exercises: Exercise[] = [];

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
        title: 'Round 5: Assessment',
        description: 'Prove you know these letters!',
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
    const round1: Lesson = { id: `${nodeId}-l1`, title: `Round 1: Meet ${vowel.name}`, description: `Introduction to ${vowel.name}`, exercises: shuffle(r1) };

    // ── Round 2: Intro batch 2 ──
    const r2: Exercise[] = [];
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
    const round2: Lesson = { id: `${nodeId}-l2`, title: `Round 2: More Letters`, description: `Practice ${vowel.name} with new letters`, exercises: shuffle(r2) };

    // ── Round 3: batch 3 + audio ──
    const r3: Exercise[] = [];
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
    const round3: Lesson = { id: `${nodeId}-l3`, title: `Round 3: Audio Mastery`, description: `Hear and identify ${vowel.name}`, exercises: shuffle(r3) };

    // ── Round 4: Speed Quiz ──
    const r4: Exercise[] = [];
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
    const round4: Lesson = { id: `${nodeId}-l4`, title: `Round 4: Speed Review`, description: `All letters with ${vowel.name}`, exercises: shuffle(r4) };

    // ── Round 5: Assessment + Match Pairs ──
    const r5: Exercise[] = [];
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
    const round5: Lesson = { id: `${nodeId}-l5`, title: `Round 5: Assessment`, description: `Prove your ${vowel.name} fluency!`, exercises: shuffle(r5) };

    const title = batch1.map(l => vowelCombo(l.letter, vowel)).join(' ');

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

    // Round 5: Assessment
    const r5: Exercise[] = [];
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
    const round5: Lesson = { id: `${nodeId}-l5`, title: `Round 5: Mixed Assessment`, description: `Show you've mastered them all!`, exercises: shuffle(r5) };

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
    { arabic: 'باب', translit: 'Baab', english: 'Door', audio: '/audio/words/word_bab.mp3' },
    { arabic: 'بيت', translit: 'Bayt', english: 'House', audio: '/audio/words/word_bayt.mp3' },
    { arabic: 'بنت', translit: 'Bint', english: 'Girl', audio: '/audio/words/word_bint.mp3' },
    { arabic: 'تمر', translit: 'Tamr', english: 'Dates', audio: '/audio/words/word_tamr.mp3' },

    // Node 2: Nature & Animals
    { arabic: 'كلب', translit: 'Kalb', english: 'Dog', audio: '/audio/words/word_kalb.mp3' },
    { arabic: 'شمس', translit: 'Shams', english: 'Sun', audio: '/audio/words/word_shams.mp3' },
    { arabic: 'قمر', translit: 'Qamar', english: 'Moon', audio: '/audio/words/word_qamar.mp3' },
    { arabic: 'ماء', translit: 'Maa', english: 'Water', audio: '/audio/words/word_maa.mp3' },

    // Node 3: People & Things
    { arabic: 'ولد', translit: 'Walad', english: 'Boy', audio: '/audio/words/word_walad.mp3' },
    { arabic: 'رجل', translit: 'Rajul', english: 'Man', audio: '/audio/words/word_rajul.mp3' },
    { arabic: 'كتاب', translit: 'Kitaab', english: 'Book', audio: '/audio/words/word_kitab.mp3' },
    { arabic: 'خبز', translit: 'Khubz', english: 'Bread', audio: '/audio/words/word_khubz.mp3' },

    // Node 4: Body Parts (Tricky Connections: ع, ه, أ)
    { arabic: 'عين', translit: 'Ayn', english: 'Eye', audio: '/audio/words/word_ayn.mp3' },     // Middle Ya, Initial Ayn
    { arabic: 'وجه', translit: 'Wajh', english: 'Face', audio: '/audio/words/word_wajh.mp3' },   // Final Haa
    { arabic: 'رأس', translit: 'Raas', english: 'Head', audio: '/audio/words/word_raas.mp3' },   // Non-connectors, Hamza on Alif
    { arabic: 'فم', translit: 'Fam', english: 'Mouth', audio: '/audio/words/word_fam.mp3' },     // Initial Fa, Final Mim
    { arabic: 'يد', translit: 'Yad', english: 'Hand', audio: '/audio/words/word_yad.mp3' },      // Initial Ya, Final Dal

    // Node 5: Common Adjectives (Tricky Medial Connections)
    { arabic: 'كبير', translit: 'Kabeer', english: 'Big', audio: '/audio/words/word_kabeer.mp3' },       // Initial Kaaf, Medial Baa
    { arabic: 'صغير', translit: 'Sagheer', english: 'Small', audio: '/audio/words/word_sagheer.mp3' },   // Medial Ghayn
    { arabic: 'جديد', translit: 'Jadeed', english: 'New', audio: '/audio/words/word_jadeed.mp3' },       // Medial Dal (non connector)
    { arabic: 'قديم', translit: 'Qadeem', english: 'Old', audio: '/audio/words/word_qadeem.mp3' },       // Medial Dal, Final Mim
    { arabic: 'جميل', translit: 'Jameel', english: 'Beautiful', audio: '/audio/words/word_jameel.mp3' }  // Medial Mim
];

// UNIT 4: CORE VOCABULARY (STAGE 4 EXPANSION)
const UNIT4_WORDS: WordData[] = [
    // Category 1: Home & Basics
    { arabic: 'بيت', translit: 'Bayt', english: 'House', audio: '/audio/words/word_bayt.mp3' },
    { arabic: 'باب', translit: 'Baab', english: 'Door', audio: '/audio/words/word_bab.mp3' },
    { arabic: 'كبير', translit: 'Kabeer', english: 'Big', audio: '/audio/words/word_kabeer.mp3' },
    { arabic: 'صغير', translit: 'Sagheer', english: 'Small', audio: '/audio/words/word_sagheer.mp3' },

    // Category 2: Family
    { arabic: 'أب', translit: 'Ab', english: 'Father', audio: '/audio/words/fam_father.mp3' },
    { arabic: 'أم', translit: 'Umm', english: 'Mother', audio: '/audio/words/fam_mother.mp3' },
    { arabic: 'أخ', translit: 'Akh', english: 'Brother', audio: '/audio/words/fam_brother.mp3' },
    { arabic: 'أخت', translit: 'Ukht', english: 'Sister', audio: '/audio/words/fam_sister.mp3' },

    // Category 3: Eat & Drink
    { arabic: 'ماء', translit: 'Maa', english: 'Water', audio: '/audio/words/word_maa.mp3' },
    { arabic: 'خبز', translit: 'Khubz', english: 'Bread', audio: '/audio/words/word_khubz.mp3' },
    { arabic: 'تفاح', translit: 'Tuffah', english: 'Apple', audio: '/audio/words/food_apple.mp3' },
    { arabic: 'حليب', translit: 'Haleeb', english: 'Milk', audio: '/audio/words/drink_milk.mp3' },

    // Category 4: Places
    { arabic: 'مدرسة', translit: 'Madrasa', english: 'School', audio: '/audio/words/place_school.mp3' },
    { arabic: 'مسجد', translit: 'Masjid', english: 'Mosque', audio: '/audio/words/place_mosque.mp3' },
    { arabic: 'مستشفى', translit: 'Mustashfa', english: 'Hospital', audio: '/audio/words/place_hospital.mp3' },
    { arabic: 'سوق', translit: 'Suq', english: 'Market', audio: '/audio/words/place_market.mp3' }
];

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

    const lessons: Lesson[] = [];

    // Grouping strictly to teach the words FIRST
    lessons.push({
        id: `${nodeId}-l1`,
        title: `Round 1: Meet the Words`,
        description: `Learn the connecting letters.`,
        exercises: [...intros, ...shuffle(assemblies)]
    });

    lessons.push({
        id: `${nodeId}-l2`,
        title: `Round 2: Hearing`,
        description: `Listen and select.`,
        exercises: [...shuffle(hears), ...shuffle(refreshers)]
    });

    lessons.push({
        id: `${nodeId}-l3`,
        title: `Round 3: Assembly Review`,
        description: `Build words from scratch.`,
        exercises: shuffle([...assemblies, ...hears])
    });

    lessons.push({
        id: `${nodeId}-l4`,
        title: `Round 4: More Assembly`,
        description: `Build and listen.`,
        exercises: shuffle([...assemblies, ...hears])
    });

    lessons.push({
        id: `${nodeId}-l5`,
        title: `Round 5: Full Mastery`,
        description: `Mix it all together.`,
        exercises: shuffle([...assemblies, ...hears])
    });

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

    const lessons: Lesson[] = [];
    lessons.push({
        id: `${nodeId}-l1`,
        title: `Round 1: Stripping Vowels`,
        description: `See the naked words.`,
        exercises: [...intros, ...shuffle(reads)]
    });
    lessons.push({
        id: `${nodeId}-l2`,
        title: `Round 2: Hearing Unvowelled`,
        description: `Match audio to plain text.`,
        exercises: shuffle(hears)
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
        }, ...shuffle(reads)]
    });
    lessons.push({
        id: `${nodeId}-l4`,
        title: `Round 4: More Practice`,
        description: `Repetition builds memory.`,
        exercises: shuffle([...reads, ...hears])
    });
    lessons.push({
        id: `${nodeId}-l5`,
        title: `Round 5: Mastery`,
        description: `You can read real Arabic!`,
        exercises: shuffle([...reads, ...hears])
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
        arabic: 'اَلسَّلامُ عَلَيكُم',
        english: 'Peace be upon you',
        audio: '/audio/sentences/sent_assalamu.mp3',
        words: ['اَلسَّلامُ', 'عَلَيكُم']
    },
    {
        arabic: 'بِسمِ اللّه',
        english: 'In the name of Allah',
        audio: '/audio/sentences/sent_bismillah.mp3',
        words: ['بِسمِ', 'اللّه']
    },
    {
        arabic: 'كَيفَ حالُك',
        english: 'How are you?',
        audio: '/audio/sentences/sent_kayf_halak.mp3',
        words: ['كَيفَ', 'حالُك']
    },
    {
        arabic: 'أَنا بِخَير',
        english: 'I am fine',
        audio: '/audio/sentences/sent_ana_bikhayr.mp3',
        words: ['أَنا', 'بِخَير']
    },
    {
        arabic: 'اِسمي',
        english: 'My name is...',
        audio: '/audio/sentences/sent_ismi.mp3',
        words: ['اِسمي']
    },
    {
        arabic: 'هذا كِتاب',
        english: 'This is a book',
        audio: '/audio/sentences/sent_hadha_kitab.mp3',
        words: ['هذا', 'كِتاب']
    },
    {
        arabic: 'هذِهِ مَدرَسة',
        english: 'This is a school',
        audio: '/audio/sentences/sent_hadhihi_madrasah.mp3',
        words: ['هذِهِ', 'مَدرَسة']
    },
    {
        arabic: 'مَعَ السَّلامة',
        english: 'Goodbye',
        audio: '/audio/sentences/sent_ma3a_salama.mp3',
        words: ['مَعَ', 'السَّلامة']
    },
    {
        arabic: 'صَباحُ الخَير',
        english: 'Good morning',
        audio: '/audio/sentences/sent_sabah_alkhayr.mp3',
        words: ['صَباحُ', 'الخَير']
    },
    {
        arabic: 'أَنا أُحِبُّ العَرَبيّة',
        english: 'I love Arabic',
        audio: '/audio/sentences/sent_ana_uhibb.mp3',
        words: ['أَنا', 'أُحِبُّ', 'العَرَبيّة']
    }
];

function makeSentenceExercises(sent: SentenceData, nodeId: string): Exercise[] {
    const distractors = pick(UNIT6_SENTENCES.map(s => s.english).filter(e => e !== sent.english), 3);
    
    // Add distractor words from other sentences to make assembly harder
    const allWords = UNIT6_SENTENCES.flatMap(s => s.words).filter(w => !sent.words.includes(w));
    const distractorWords = pick(allWords, Math.min(3, allWords.length));
    const assemblyChoices = shuffle([...sent.words, ...distractorWords]);

    return [
        {
            id: nextId(`${nodeId}-intro`),
            type: 'introduction',
            prompt: `Let's learn a full sentence!\n**${sent.arabic}**`,
            correctAnswer: sent.arabic,
            choices: [],
            hint: `Means: ${sent.english}`,
            promptAudio: sent.audio
        },
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
    const intros: Exercise[] = [];
    const graded: Exercise[] = [];

    sentences.forEach(s => {
        const exs = makeSentenceExercises(s, nodeId);
        intros.push(exs[0]);
        graded.push(...exs.slice(1));
    });

    return {
        id: nodeId,
        title: title,
        description: `Learn basic sentences`,
        type: 'lesson',
        status: 'locked',
        totalRounds: 3,
        completedRounds: 0,
        lessons: [
            { id: `${nodeId}-r1`, title: 'Introduction', description: 'Meet the sentences', exercises: [...intros, ...shuffle(graded).slice(0, 5)] },
            { id: `${nodeId}-r2`, title: 'Practice', description: 'Build your skills', exercises: shuffle(graded) },
            { id: `${nodeId}-r3`, title: 'Mastery', description: 'Assemble them all', exercises: shuffle(graded) }
        ]
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
                }
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
                {
                    id: 'u4-review1',
                    title: 'Home & Family Review',
                    description: 'Practice combining nodes',
                    type: 'lesson',
                    status: 'locked',
                    totalRounds: 2,
                    completedRounds: 0,
                    lessons: [
                        {
                            id: 'u4R1-l1',
                            title: 'Vocabulary Recall',
                            description: 'Listen and identify.',
                            exercises: shuffle(UNIT4_WORDS.slice(0, 8).flatMap(w => [
                                {
                                    id: nextId('u4r1-hear'),
                                    type: 'hear_choose',
                                    prompt: 'Hear and choose the correct word',
                                    promptAudio: w.audio,
                                    correctAnswer: w.arabic,
                                    choices: shuffle([w.arabic, ...pick(UNIT4_WORDS.map(ww => ww.arabic).filter(a => a !== w.arabic), 3)])
                                }
                            ]))
                        }
                    ]
                },
                makeWordAssemblyNode('u4-n3', 'Eat & Drink', UNIT4_WORDS.slice(8, 12), true),
                makeWordAssemblyNode('u4-n4', 'Places', UNIT4_WORDS.slice(12, 16), true),
                {
                    id: 'u4-test',
                    title: '📝 Stage 4A Checkpoint',
                    description: 'Prove your vocabulary knowledge',
                    type: 'test',
                    status: 'locked',
                    totalRounds: 1,
                    completedRounds: 0,
                    lessons: [{
                        id: 'u4-test-lesson',
                        title: 'Checkpoint Test',
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
            title: 'Unit 5',
            description: 'Unvowelled Reading (Stage 5)',
            color: '#F5A623', // Bright vibrant orange
            nodes: [
                makeUnvowelledNode('u5-n1', 'Naked Words 1', UNIT4_WORDS.slice(0, 4)),
                makeUnvowelledNode('u5-n2', 'Naked Words 2', UNIT4_WORDS.slice(4, 8)),
                makeUnvowelledNode('u5-n3', 'Naked Words 3', UNIT4_WORDS.slice(8, 12)),
                makeUnvowelledNode('u5-n4', 'Naked Words 4', UNIT4_WORDS.slice(12, 16)),
                {
                    id: 'u5-test',
                    title: '📝 Stage 5 Checkpoint',
                    description: 'Read without vowels',
                    type: 'test',
                    status: 'locked',
                    totalRounds: 1,
                    completedRounds: 0,
                    lessons: [{
                        id: 'u5-test-lesson',
                        title: 'Unvowelled Reading Test',
                        description: 'Translate unvowelled Arabic back to English.',
                        exercises: shuffle(UNIT4_WORDS.flatMap(w => [
                            {
                                id: nextId('u5t-mul'),
                                type: 'multiple_choice',
                                prompt: `What does this word mean?`,
                                correctAnswer: w.english,
                                choices: shuffle([w.english, ...pick(UNIT4_WORDS.map(ww => ww.english).filter(a => a !== w.english), 3)]),
                                hint: stripHarakat(w.arabic)
                            }
                        ])),
                    }],
                }
            ]
        },
        {
            id: 6,
            title: 'Unit 6',
            description: 'Full Sentences (Stage 6)',
            color: '#FFD700', // Gold color for Stage 6 mastery
            nodes: [
                makeSentenceNode('u6-n1', 'Greetings', UNIT6_SENTENCES.slice(0, 4)),
                makeSentenceNode('u6-n2', 'Common Phrases', UNIT6_SENTENCES.slice(4, 7)),
                makeSentenceNode('u6-n3', 'Sayings', UNIT6_SENTENCES.slice(7, 10)),
                {
                    id: 'u6-test',
                    title: '📝 Stage 6 Checkpoint',
                    description: 'Final Sentence Mastery',
                    type: 'test',
                    status: 'locked',
                    totalRounds: 1,
                    completedRounds: 0,
                    lessons: [{
                        id: 'u6-test-lesson',
                        title: 'Sentence Mastery Test',
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
                }
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

