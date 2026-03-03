/**
 * Achievement System
 * 
 * Tracks user milestones and awards badges for meaningful accomplishments.
 * Badges are stored in localStorage and displayed in the Progress Dashboard.
 */

export interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: string;
    unlockedAt?: string;   // ISO date when unlocked, undefined = locked
    category: 'learning' | 'speaking' | 'streak' | 'mastery' | 'social';
}

const STORAGE_KEY = 'arabic_app_achievements';

// All possible achievements
const ACHIEVEMENT_DEFS: Omit<Achievement, 'unlockedAt'>[] = [
    // Learning milestones
    { id: 'first_lesson', title: 'First Steps', description: 'Complete your first lesson', icon: '🎓', category: 'learning' },
    { id: 'ten_lessons', title: 'Dedicated Learner', description: 'Complete 10 lessons', icon: '📚', category: 'learning' },
    { id: 'fifty_lessons', title: 'Scholar', description: 'Complete 50 lessons', icon: '🏛️', category: 'learning' },
    { id: 'hundred_exercises', title: 'Century Club', description: 'Complete 100 exercises', icon: '💯', category: 'learning' },
    { id: 'five_hundred_exercises', title: 'Marathon Runner', description: 'Complete 500 exercises', icon: '🏃', category: 'learning' },

    // Speaking milestones
    { id: 'first_speak', title: 'Finding Your Voice', description: 'Complete your first speaking exercise', icon: '🎤', category: 'speaking' },
    { id: 'perfect_pronunciation', title: 'Perfect Pronunciation', description: 'Score 100% on a speaking exercise', icon: '🎯', category: 'speaking' },
    { id: 'first_conversation', title: 'Conversationalist', description: 'Complete your first AI conversation', icon: '💬', category: 'speaking' },
    { id: 'five_conversations', title: 'Chatterbox', description: 'Complete 5 AI conversations', icon: '🗣️', category: 'speaking' },
    { id: 'all_letters', title: 'Alphabet Master', description: 'Pronounce all 28 Arabic letters correctly', icon: '🔤', category: 'speaking' },

    // Streak milestones
    { id: 'streak_3', title: 'Getting Consistent', description: '3-day learning streak', icon: '🔥', category: 'streak' },
    { id: 'streak_7', title: 'Week Warrior', description: '7-day learning streak', icon: '⚡', category: 'streak' },
    { id: 'streak_30', title: 'Monthly Master', description: '30-day learning streak', icon: '🌟', category: 'streak' },
    { id: 'streak_100', title: 'Unstoppable', description: '100-day learning streak', icon: '👑', category: 'streak' },

    // Mastery milestones
    { id: 'first_mastery', title: 'First Mastery', description: 'Master your first lesson node', icon: '⭐', category: 'mastery' },
    { id: 'no_regression', title: 'Iron Will', description: 'Complete 10 lessons without regression', icon: '🛡️', category: 'mastery' },
    { id: 'hard_mode', title: 'Challenge Accepted', description: 'Reach Hard difficulty tier', icon: '💪', category: 'mastery' },
    { id: 'accuracy_90', title: 'Sharpshooter', description: 'Maintain 90%+ accuracy over 10 sessions', icon: '🏹', category: 'mastery' },
    { id: 'night_owl', title: 'Night Owl', description: 'Study after 11 PM', icon: '🦉', category: 'mastery' },
    { id: 'early_bird', title: 'Early Bird', description: 'Study before 7 AM', icon: '🐦', category: 'mastery' },
];

class AchievementEngine {
    private achievements: Record<string, Achievement>;

    constructor() {
        this.achievements = this.load();
    }

    private load(): Record<string, Achievement> {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) return JSON.parse(raw);
        } catch (e) {
            console.warn('Failed to load achievements:', e);
        }

        // Initialize with all achievements in locked state
        const map: Record<string, Achievement> = {};
        ACHIEVEMENT_DEFS.forEach(def => {
            map[def.id] = { ...def };
        });
        return map;
    }

    private save() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.achievements));
        } catch (e) {
            console.warn('Failed to save achievements:', e);
        }
    }

    /** Unlock an achievement. Returns true if newly unlocked, false if already unlocked. */
    public unlock(id: string): boolean {
        const ach = this.achievements[id];
        if (!ach || ach.unlockedAt) return false;

        ach.unlockedAt = new Date().toISOString();
        this.save();
        return true;
    }

    /** Check a set of conditions and unlock any newly earned achievements. Returns newly unlocked list. */
    public checkAndUnlock(stats: {
        totalExercises: number;
        totalLessons: number;
        currentStreak: number;
        hasPerfectPronunciation: boolean;
        hasSpeaking: boolean;
        hasConversation: boolean;
        conversationCount: number;
        hasMastery: boolean;
        accuracy: number;
        difficultyTier: string;
    }): Achievement[] {
        const newlyUnlocked: Achievement[] = [];

        const tryUnlock = (id: string) => {
            if (this.unlock(id)) {
                newlyUnlocked.push(this.achievements[id]);
            }
        };

        // Learning milestones
        if (stats.totalLessons >= 1) tryUnlock('first_lesson');
        if (stats.totalLessons >= 10) tryUnlock('ten_lessons');
        if (stats.totalLessons >= 50) tryUnlock('fifty_lessons');
        if (stats.totalExercises >= 100) tryUnlock('hundred_exercises');
        if (stats.totalExercises >= 500) tryUnlock('five_hundred_exercises');

        // Speaking milestones
        if (stats.hasSpeaking) tryUnlock('first_speak');
        if (stats.hasPerfectPronunciation) tryUnlock('perfect_pronunciation');
        if (stats.hasConversation) tryUnlock('first_conversation');
        if (stats.conversationCount >= 5) tryUnlock('five_conversations');

        // Streak milestones
        if (stats.currentStreak >= 3) tryUnlock('streak_3');
        if (stats.currentStreak >= 7) tryUnlock('streak_7');
        if (stats.currentStreak >= 30) tryUnlock('streak_30');
        if (stats.currentStreak >= 100) tryUnlock('streak_100');

        // Mastery milestones
        if (stats.hasMastery) tryUnlock('first_mastery');
        if (stats.difficultyTier === 'hard') tryUnlock('hard_mode');
        if (stats.accuracy >= 90) tryUnlock('accuracy_90');

        // Time-based
        const hour = new Date().getHours();
        if (hour >= 23 || hour < 4) tryUnlock('night_owl');
        if (hour >= 4 && hour < 7) tryUnlock('early_bird');

        return newlyUnlocked;
    }

    /** Get all achievements with unlock status */
    public getAll(): Achievement[] {
        // Ensure any new achievement defs are included
        ACHIEVEMENT_DEFS.forEach(def => {
            if (!this.achievements[def.id]) {
                this.achievements[def.id] = { ...def };
            }
        });
        return Object.values(this.achievements);
    }

    /** Get only unlocked achievements */
    public getUnlocked(): Achievement[] {
        return this.getAll().filter(a => a.unlockedAt);
    }

    /** Get progress stats */
    public getStats(): { unlocked: number; total: number; percentage: number } {
        const all = this.getAll();
        const unlocked = all.filter(a => a.unlockedAt).length;
        return {
            unlocked,
            total: all.length,
            percentage: Math.round((unlocked / all.length) * 100),
        };
    }
}

export const achievementEngine = new AchievementEngine();
