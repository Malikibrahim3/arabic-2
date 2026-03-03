/**
 * Progress Persistence Store
 * 
 * Persists all user progress to localStorage:
 * - Completed rounds per node
 * - Node mastery state & score
 * - Node completion status
 * - SRS engine data
 * - Streak and stats
 */

const STORAGE_KEY = 'arabic_app_progress';
const STATS_KEY = 'arabic_app_stats';

// ─── Types ─────────────────────────────────────────────────

export interface NodeProgress {
    completedRounds: number;
    status: 'active' | 'completed' | 'locked';
    masteryState?: 'learning' | 'mastered' | 'regression';
    masteryScore?: number;
    lastAttemptDate?: string;
}

export interface UserStats {
    totalWordsLearned: number;
    totalExercisesCompleted: number;
    totalCorrect: number;
    totalWrong: number;
    currentStreak: number;
    longestStreak: number;
    lastActiveDate: string;
    totalTimeSpentMs: number;
    sessionStartTime?: number;
    accuracyHistory: { date: string; accuracy: number }[];
    // Per-phoneme weakness tracking
    phonemeStats: Record<string, { correct: number; wrong: number; lastSeen: string }>;
}

export type ProgressMap = Record<string, NodeProgress>;

// ─── Default Stats ─────────────────────────────────────────

function defaultStats(): UserStats {
    return {
        totalWordsLearned: 0,
        totalExercisesCompleted: 0,
        totalCorrect: 0,
        totalWrong: 0,
        currentStreak: 0,
        longestStreak: 0,
        lastActiveDate: '',
        totalTimeSpentMs: 0,
        accuracyHistory: [],
        phonemeStats: {},
    };
}

// ─── Load / Save ───────────────────────────────────────────

export function loadProgress(): ProgressMap {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) return JSON.parse(raw);
    } catch (e) {
        console.warn('Failed to load progress:', e);
    }
    return {};
}

export function saveProgress(progress: ProgressMap): void {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch (e) {
        console.warn('Failed to save progress:', e);
    }
}

export function getNodeProgress(nodeId: string): NodeProgress | null {
    const progress = loadProgress();
    return progress[nodeId] || null;
}

export function saveNodeProgress(nodeId: string, data: Partial<NodeProgress>): void {
    const progress = loadProgress();
    const existing = progress[nodeId] || { completedRounds: 0, status: 'active' as const };
    progress[nodeId] = { ...existing, ...data };
    saveProgress(progress);
}

// ─── Stats ─────────────────────────────────────────────────

export function loadStats(): UserStats {
    try {
        const raw = localStorage.getItem(STATS_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            return { ...defaultStats(), ...parsed };
        }
    } catch (e) {
        console.warn('Failed to load stats:', e);
    }
    return defaultStats();
}

export function saveStats(stats: UserStats): void {
    try {
        localStorage.setItem(STATS_KEY, JSON.stringify(stats));
    } catch (e) {
        console.warn('Failed to save stats:', e);
    }
}

export function recordSessionResult(correct: number, total: number): void {
    const stats = loadStats();
    stats.totalExercisesCompleted += total;
    stats.totalCorrect += correct;
    stats.totalWrong += (total - correct);

    const today = new Date().toISOString().split('T')[0];
    const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

    // Update accuracy history (keep last 30 days)
    stats.accuracyHistory.push({ date: today, accuracy });
    if (stats.accuracyHistory.length > 30) {
        stats.accuracyHistory = stats.accuracyHistory.slice(-30);
    }

    // Streak logic
    if (stats.lastActiveDate !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        if (stats.lastActiveDate === yesterdayStr) {
            stats.currentStreak += 1;
        } else if (stats.lastActiveDate !== today) {
            stats.currentStreak = 1;
        }
        stats.longestStreak = Math.max(stats.longestStreak, stats.currentStreak);
        stats.lastActiveDate = today;
    }

    saveStats(stats);
}

export function recordPhonemeAttempt(phoneme: string, correct: boolean): void {
    const stats = loadStats();
    if (!stats.phonemeStats[phoneme]) {
        stats.phonemeStats[phoneme] = { correct: 0, wrong: 0, lastSeen: '' };
    }
    if (correct) {
        stats.phonemeStats[phoneme].correct += 1;
    } else {
        stats.phonemeStats[phoneme].wrong += 1;
    }
    stats.phonemeStats[phoneme].lastSeen = new Date().toISOString();
    saveStats(stats);
}

export function getWeakPhonemes(threshold: number = 0.5): string[] {
    const stats = loadStats();
    const weak: string[] = [];
    for (const [phoneme, data] of Object.entries(stats.phonemeStats)) {
        const total = data.correct + data.wrong;
        if (total >= 3 && data.correct / total < threshold) {
            weak.push(phoneme);
        }
    }
    return weak.sort((a, b) => {
        const aRate = stats.phonemeStats[a].correct / (stats.phonemeStats[a].correct + stats.phonemeStats[a].wrong);
        const bRate = stats.phonemeStats[b].correct / (stats.phonemeStats[b].correct + stats.phonemeStats[b].wrong);
        return aRate - bRate;
    });
}

export function startSession(): void {
    const stats = loadStats();
    stats.sessionStartTime = Date.now();
    saveStats(stats);
}

export function endSession(): void {
    const stats = loadStats();
    if (stats.sessionStartTime) {
        stats.totalTimeSpentMs += Date.now() - stats.sessionStartTime;
        stats.sessionStartTime = undefined;
        saveStats(stats);
    }
}
