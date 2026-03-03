// ─── Global System Architecture Types ────────────────────────

// The five phases of SRS (Spaced Repetition System) memory retention
export type SRSTag = 'new' | 'learning' | 'unstable' | 'stable' | 'automatic';

// The new mastery-based progression states for lessons and stages
export type MasteryState = 'locked' | 'learning' | 'mastered' | 'regression';

// Legacy NodeStatus (retained for backward compatibility during transition)
export type NodeStatus = 'locked' | 'active' | 'completed' | MasteryState;

export type NodeType = 'lesson' | 'chest' | 'review' | 'test';

export type ExerciseType =
    | 'introduction'        // Teach card — show letter, name, sound (no grading)
    | 'tap_letter'          // Tap the correct letter among distractors
    | 'hear_choose'         // Hear sound → choose correct letter
    | 'select_all'          // Select all instances of a letter
    | 'discrimination'      // Choose between similar letters
    | 'match_pairs'         // Match letters ↔ names/sounds (new!)
    | 'multiple_choice'     // Generic multiple choice
    | 'locate_in_syllable'  // Find letter in a syllable/word
    | 'build_syllable'      // Build a syllable from parts
    | 'read_word'           // Read the displayed word
    | 'hear_select_word'    // Hear word → select correct one
    | 'build_from_syllables' // Build a word from syllable tiles
    | 'trap_select'         // Pick among highly confusable options
    | 'intro-trap-philosophy' // Intro card for trap philosophy
    | 'word_assembly'        // Tap pieces to assemble a word
    | 'sentence_assembly'   // Tap words to assemble a sentence
    | 'roleplay_chat'       // Interactive conversation simulation
    | 'vocab_match_dialect' // Matching MSA to Egyptian
    | 'verb_drill'          // Verb conjugation drills
    | 'fill_in_blank_dialect' // Fill in the blank with dialect options
    | 'b_shift_drill'       // Transform MSA continuous verbs to Egyptian b-prefix
    // ─── Reading mechanics (MSA Phase 3) ───────────────────
    | 'dictation'           // Hear audio → build/type the word
    | 'root_extraction'     // See a word → identify the 3-letter root
    | 'syntax_highlight'    // Tag parts of a sentence (Verb, Subject, Object)
    // ─── Speaking exercises (with speech recognition) ──────
    | 'listen_repeat'        // Hear a word/phrase → say it back → check
    | 'pronunciation_drill'  // Focus on specific sounds with target words
    | 'speak_translation'    // See English → speak the Arabic
    | 'listen_respond'       // Hear a question → speak the answer
    | 'shadowing';           // Audio plays → user repeats along

export interface DualText {
    msa: string;
    egyptian: string;
    english: string;
    audioUrl?: string;
}

export interface ConversationTurn {
    speaker: 'ai' | 'user';
    text: DualText;
    audioUrl?: string;
    userSaid?: string; // Optional: To simulate what the user said wrong
    correction?: {
        userSaid: string;
        correctEgyptian: string;
        explanation: string;
    };
    pronunciationTip?: string;
}

export interface Exercise {
    id: string;
    type: ExerciseType;
    prompt: string;
    promptAudio?: string;     // Text to speak via TTS
    correctAnswer: string;
    choices: string[];
    hint?: string;
    // Match pairs specific fields
    pairs?: Array<{ left: string; right: string }>;
    // Trap specific fields
    trapExplanation?: string;
    // Dialect expansion stuff
    promptDual?: DualText;
    conversationTurns?: ConversationTurn[];
    sentence?: DualText; // For fill in the blank
    explanation?: string;
    // ─── Speaking exercise fields ──────────────────────
    transliteration?: string;   // Phonetic guide, e.g. "mar-HA-ba"
    soundFocus?: string;        // The specific sound being drilled, e.g. "ع"
    expectedSpeech?: string;    // What speech recognition should match
}

export interface Lesson {
    id: string;
    title: string;
    description: string;
    exercises: Exercise[];
}

export interface CourseNode {
    id: string;
    title: string;
    description: string;
    type: NodeType;
    status: NodeStatus;

    // Core mastery tracking
    masteryScore?: number;        // Current accuracy (0-100)
    masteryState?: MasteryState;  // Stable, Unstable, etc.
    isGate?: boolean;             // Is this an AI/testing bottleneck?

    // Legacy tracking
    skillLetters?: string[];
    totalRounds: number;       // Total rounds (e.g. 5)
    completedRounds: number;   // How many completed (0-5)
    lessons: Lesson[];         // Each lesson = one round
}

export interface Unit {
    id: string | number;
    title: string;
    description: string;
    color: string;
    path: 'reading' | 'speaking' | 'hybrid' | 'both';
    nodes: CourseNode[];
}

export interface Course {
    id: string;
    title: string;
    description: string;
    units: Unit[];
}

export type DialectId = 'msa' | 'egyptian';

export interface DialectInfo {
    id: string;
    name: string;
    nameArabic: string;
    description: string;
    flag: string;
    color: string;
    comingSoon?: boolean;
}
