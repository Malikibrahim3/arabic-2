/**
 * Grammar Weakness Tracker
 * 
 * Tracks grammar-specific weaknesses beyond phoneme-level accuracy.
 * Monitors patterns in:
 * - Verb conjugation errors (past/present/imperative)
 * - Pronoun agreement (gender, number)
 * - Sentence structure (VSO vs SVO)
 * - Definite article usage (ال)
 * - Preposition errors
 * - Negation patterns (ما/لا/مش)
 * 
 * Uses LLM corrections + exercise outcomes to build a grammar profile
 * that feeds back into the adaptive difficulty engine.
 */

export type GrammarCategory =
    | 'verb_conjugation'
    | 'pronoun_agreement'
    | 'sentence_structure'
    | 'definite_article'
    | 'prepositions'
    | 'negation'
    | 'possessives'
    | 'question_formation'
    | 'plural_forms'
    | 'adjective_agreement';

interface GrammarRecord {
    correct: number;
    wrong: number;
    lastSeen: string;
    examples: string[];  // Last 3 error examples for context
}

interface GrammarState {
    categories: Record<GrammarCategory, GrammarRecord>;
    totalInteractions: number;
    lastUpdated: number;
}

const STORAGE_KEY = 'arabic_app_grammar';

const ALL_CATEGORIES: GrammarCategory[] = [
    'verb_conjugation',
    'pronoun_agreement',
    'sentence_structure',
    'definite_article',
    'prepositions',
    'negation',
    'possessives',
    'question_formation',
    'plural_forms',
    'adjective_agreement',
];

// Detection patterns — map common error signals to grammar categories
const GRAMMAR_SIGNALS: Record<string, GrammarCategory> = {
    // Verb conjugation markers
    'conjugat': 'verb_conjugation',
    'verb form': 'verb_conjugation',
    'past tense': 'verb_conjugation',
    'present tense': 'verb_conjugation',
    'imperative': 'verb_conjugation',
    'يفعل': 'verb_conjugation',
    'فعل': 'verb_conjugation',

    // Pronoun agreement
    'pronoun': 'pronoun_agreement',
    'gender': 'pronoun_agreement',
    'masculine': 'pronoun_agreement',
    'feminine': 'pronoun_agreement',
    'هو': 'pronoun_agreement',
    'هي': 'pronoun_agreement',

    // Sentence structure
    'word order': 'sentence_structure',
    'sentence structure': 'sentence_structure',

    // Definite article
    'ال': 'definite_article',
    'al-': 'definite_article',
    'definite': 'definite_article',
    'the ': 'definite_article',

    // Prepositions
    'preposition': 'prepositions',
    'في': 'prepositions',
    'على': 'prepositions',
    'من': 'prepositions',
    'إلى': 'prepositions',

    // Negation
    'negat': 'negation',
    'ما': 'negation',
    'لا': 'negation',
    'مش': 'negation',
    'ليس': 'negation',

    // Possessives
    'possessi': 'possessives',
    'ي': 'possessives',

    // Question formation
    'question': 'question_formation',
    'هل': 'question_formation',
    'ماذا': 'question_formation',
    'أين': 'question_formation',

    // Plural forms
    'plural': 'plural_forms',
    'broken plural': 'plural_forms',

    // Adjective agreement
    'adjective': 'adjective_agreement',
    'agreement': 'adjective_agreement',
};

function defaultRecord(): GrammarRecord {
    return { correct: 0, wrong: 0, lastSeen: '', examples: [] };
}

function defaultState(): GrammarState {
    const categories: Record<string, GrammarRecord> = {};
    ALL_CATEGORIES.forEach(c => { categories[c] = defaultRecord(); });
    return {
        categories: categories as Record<GrammarCategory, GrammarRecord>,
        totalInteractions: 0,
        lastUpdated: Date.now(),
    };
}

class GrammarTracker {
    private state: GrammarState;

    constructor() {
        this.state = this.load();
    }

    private load(): GrammarState {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                // Ensure all categories exist (migration)
                const merged = defaultState();
                if (parsed.categories) {
                    for (const cat of ALL_CATEGORIES) {
                        if (parsed.categories[cat]) {
                            merged.categories[cat] = parsed.categories[cat];
                        }
                    }
                }
                merged.totalInteractions = parsed.totalInteractions || 0;
                merged.lastUpdated = parsed.lastUpdated || Date.now();
                return merged;
            }
        } catch (e) {
            console.warn('Failed to load grammar state:', e);
        }
        return defaultState();
    }

    private save() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
        } catch (e) {
            console.warn('Failed to save grammar state:', e);
        }
    }

    /**
     * Analyze an LLM correction string and extract grammar categories.
     * Called automatically when LLM feedback is received.
     */
    public analyzeCorrection(correction: string): GrammarCategory[] {
        const found: Set<GrammarCategory> = new Set();
        const lower = correction.toLowerCase();

        for (const [signal, category] of Object.entries(GRAMMAR_SIGNALS)) {
            if (lower.includes(signal.toLowerCase()) || correction.includes(signal)) {
                found.add(category);
            }
        }

        return Array.from(found);
    }

    /**
     * Record a grammar interaction.
     * - If categories detected from correction text → mark those as wrong
     * - If correct answer with no issues → mark relevant categories as correct
     */
    public recordFromCorrection(correction: string, errorExample?: string) {
        const categories = this.analyzeCorrection(correction);

        for (const cat of categories) {
            this.state.categories[cat].wrong++;
            this.state.categories[cat].lastSeen = new Date().toISOString();
            if (errorExample) {
                this.state.categories[cat].examples.push(errorExample);
                if (this.state.categories[cat].examples.length > 3) {
                    this.state.categories[cat].examples = this.state.categories[cat].examples.slice(-3);
                }
            }
        }

        this.state.totalInteractions++;
        this.state.lastUpdated = Date.now();
        this.save();
    }

    /** Record a correct grammar usage for a category */
    public recordCorrect(category: GrammarCategory) {
        this.state.categories[category].correct++;
        this.state.categories[category].lastSeen = new Date().toISOString();
        this.state.totalInteractions++;
        this.state.lastUpdated = Date.now();
        this.save();
    }

    /**
     * Get weakest grammar categories (sorted by error rate).
     * Only returns categories with at least 2 interactions.
     */
    public getWeakCategories(limit: number = 5): { category: GrammarCategory; accuracy: number; total: number; examples: string[] }[] {
        return ALL_CATEGORIES
            .map(cat => {
                const r = this.state.categories[cat];
                const total = r.correct + r.wrong;
                const accuracy = total > 0 ? Math.round((r.correct / total) * 100) : 100;
                return { category: cat, accuracy, total, examples: r.examples };
            })
            .filter(c => c.total >= 2)
            .sort((a, b) => a.accuracy - b.accuracy)
            .slice(0, limit);
    }

    /** Get all categories with their stats */
    public getAllStats(): { category: GrammarCategory; correct: number; wrong: number; accuracy: number }[] {
        return ALL_CATEGORIES.map(cat => {
            const r = this.state.categories[cat];
            const total = r.correct + r.wrong;
            return {
                category: cat,
                correct: r.correct,
                wrong: r.wrong,
                accuracy: total > 0 ? Math.round((r.correct / total) * 100) : -1,
            };
        });
    }

    /** Human-readable category name */
    public static formatCategory(cat: GrammarCategory): string {
        const labels: Record<GrammarCategory, string> = {
            verb_conjugation: 'Verb Conjugation',
            pronoun_agreement: 'Pronoun Agreement',
            sentence_structure: 'Sentence Structure',
            definite_article: 'Definite Article (ال)',
            prepositions: 'Prepositions',
            negation: 'Negation',
            possessives: 'Possessives',
            question_formation: 'Question Formation',
            plural_forms: 'Plural Forms',
            adjective_agreement: 'Adjective Agreement',
        };
        return labels[cat] || cat;
    }

    public getState(): GrammarState {
        return { ...this.state };
    }
}

export const grammarTracker = new GrammarTracker();
