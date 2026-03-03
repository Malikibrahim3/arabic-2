/**
 * Adaptive Difficulty Engine
 * 
 * Dynamically scales exercise complexity based on user's rolling performance.
 * 
 * Three difficulty tiers:
 * - EASY:   Fewer distractors, simpler exercises, more hints
 * - NORMAL: Standard difficulty as designed
 * - HARD:   More distractors, trap-heavy, fewer hints, stricter timing
 * 
 * The engine tracks a rolling window of recent accuracy and adjusts
 * the difficulty tier accordingly. This ensures users who are struggling
 * get easier exercises (scaffolding), while strong users are challenged.
 */

export type DifficultyTier = 'easy' | 'normal' | 'hard';

interface DifficultyState {
    tier: DifficultyTier;
    rollingAccuracy: number[];   // Last N session accuracies (0-100)
    consecutiveHighScores: number;
    consecutiveLowScores: number;
    lastUpdated: number;
}

const STORAGE_KEY = 'arabic_app_difficulty';
const ROLLING_WINDOW = 5; // Track last 5 sessions

// Thresholds for tier transitions
const PROMOTE_THRESHOLD = 85;  // Avg accuracy above this → promote
const DEMOTE_THRESHOLD = 55;   // Avg accuracy below this → demote
const PROMOTE_STREAK = 3;      // Consecutive highs needed to promote
const DEMOTE_STREAK = 2;       // Consecutive lows needed to demote

class DifficultyEngine {
    private state: DifficultyState;

    constructor() {
        this.state = this.load();
    }

    private load(): DifficultyState {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) return JSON.parse(raw);
        } catch (e) {
            console.warn('Failed to load difficulty state:', e);
        }
        return {
            tier: 'normal',
            rollingAccuracy: [],
            consecutiveHighScores: 0,
            consecutiveLowScores: 0,
            lastUpdated: Date.now(),
        };
    }

    private save() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
        } catch (e) {
            console.warn('Failed to save difficulty state:', e);
        }
    }

    /** Record a session result and recalculate the difficulty tier */
    public recordSession(accuracy: number): DifficultyTier {
        // Add to rolling window
        this.state.rollingAccuracy.push(accuracy);
        if (this.state.rollingAccuracy.length > ROLLING_WINDOW) {
            this.state.rollingAccuracy = this.state.rollingAccuracy.slice(-ROLLING_WINDOW);
        }

        // Track streaks
        if (accuracy >= PROMOTE_THRESHOLD) {
            this.state.consecutiveHighScores++;
            this.state.consecutiveLowScores = 0;
        } else if (accuracy <= DEMOTE_THRESHOLD) {
            this.state.consecutiveLowScores++;
            this.state.consecutiveHighScores = 0;
        } else {
            // Middle ground — reset both streaks
            this.state.consecutiveHighScores = 0;
            this.state.consecutiveLowScores = 0;
        }

        // Calculate rolling average
        const avg = this.state.rollingAccuracy.reduce((a, b) => a + b, 0) / this.state.rollingAccuracy.length;

        // Tier promotion/demotion logic
        const prev = this.state.tier;

        if (avg >= PROMOTE_THRESHOLD && this.state.consecutiveHighScores >= PROMOTE_STREAK) {
            if (this.state.tier === 'easy') this.state.tier = 'normal';
            else if (this.state.tier === 'normal') this.state.tier = 'hard';
        } else if (avg <= DEMOTE_THRESHOLD && this.state.consecutiveLowScores >= DEMOTE_STREAK) {
            if (this.state.tier === 'hard') this.state.tier = 'normal';
            else if (this.state.tier === 'normal') this.state.tier = 'easy';
        }

        if (this.state.tier !== prev) {
            // Reset streaks on tier change
            this.state.consecutiveHighScores = 0;
            this.state.consecutiveLowScores = 0;
        }

        this.state.lastUpdated = Date.now();
        this.save();
        return this.state.tier;
    }

    /** Get current difficulty tier */
    public getTier(): DifficultyTier {
        return this.state.tier;
    }

    /** Get rolling average accuracy */
    public getRollingAccuracy(): number {
        if (this.state.rollingAccuracy.length === 0) return 75;
        return Math.round(
            this.state.rollingAccuracy.reduce((a, b) => a + b, 0) / this.state.rollingAccuracy.length
        );
    }

    /** Get difficulty modifiers for exercise generation */
    public getModifiers(): {
        distractorCount: number;
        showHints: boolean;
        trapFrequency: number;      // 0-1, higher = more traps
        choiceCount: number;
        timeBonus: number;     // multiplier on time limits (>1 = more time)
    } {
        switch (this.state.tier) {
            case 'easy':
                return {
                    distractorCount: 3,
                    showHints: true,
                    trapFrequency: 0.1,
                    choiceCount: 4,
                    timeBonus: 1.5,
                };
            case 'hard':
                return {
                    distractorCount: 7,
                    showHints: false,
                    trapFrequency: 0.5,
                    choiceCount: 8,
                    timeBonus: 0.75,
                };
            case 'normal':
            default:
                return {
                    distractorCount: 5,
                    showHints: true,
                    trapFrequency: 0.25,
                    choiceCount: 6,
                    timeBonus: 1.0,
                };
        }
    }

    /** Get full state for dashboard display */
    public getState(): DifficultyState {
        return { ...this.state };
    }

    /** Force a specific tier (for testing) */
    public setTier(tier: DifficultyTier) {
        this.state.tier = tier;
        this.save();
    }
}

export const difficultyEngine = new DifficultyEngine();
