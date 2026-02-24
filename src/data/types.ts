export type NodeStatus = 'locked' | 'active' | 'completed';
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
    | 'sentence_assembly';  // Tap words to assemble a sentence

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
    skillLetters?: string[];
    totalRounds: number;       // Total rounds (e.g. 5)
    completedRounds: number;   // How many completed (0-5)
    lessons: Lesson[];         // Each lesson = one round
}

export interface Unit {
    id: number;
    title: string;
    description: string;
    color: string;
    nodes: CourseNode[];
}

export interface Course {
    id: string;
    title: string;
    description: string;
    units: Unit[];
}
