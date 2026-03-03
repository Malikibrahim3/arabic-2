import { loadProgress, loadStats } from './progressStore';

/**
 * CEFR Mapping Engine (A1 - C2)
 * 
 * Maps the user's progress through the nodes, their grammar tracker proficiency,
 * and their overall accuracy to an estimated CEFR (Common European Framework of Reference) level.
 * 
 * This gives learners an internationally recognized benchmark for their fluency.
 */

export type CEFRLevel = 'A0' | 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export interface CEFRStatus {
    level: CEFRLevel;
    progressToNext: number; // 0-100%
    nextLevel: CEFRLevel | null;
    estimatedVocabularySize: number;
    unlockedSkills: string[];
}

const CEFR_THRESHOLDS = [
    { level: 'A1', minNodes: 5, minAccuracy: 60, vocab: 50 },
    { level: 'A2', minNodes: 15, minAccuracy: 70, vocab: 150 },
    { level: 'B1', minNodes: 35, minAccuracy: 75, vocab: 400 },
    { level: 'B2', minNodes: 60, minAccuracy: 80, vocab: 1000 },
    { level: 'C1', minNodes: 100, minAccuracy: 85, vocab: 2500 },
    { level: 'C2', minNodes: 200, minAccuracy: 90, vocab: 5000 },
] as const;

export const cefrEngine = {
    /**
     * Calculate current CEFR level based on node progress, stats, and grammar.
     */
    getCurrentLevel(): CEFRStatus {
        const progress = loadProgress();
        const stats = loadStats();

        const completedNodes = Object.values(progress).filter(p => p.status === 'completed').length;
        const accuracy = stats.totalExercisesCompleted > 0
            ? Math.round((stats.totalCorrect / stats.totalExercisesCompleted) * 100)
            : 0;

        // Base calculation on nodes completed
        let currentLevelIndex = -1;
        for (let i = 0; i < CEFR_THRESHOLDS.length; i++) {
            const threshold = CEFR_THRESHOLDS[i];
            if (completedNodes >= threshold.minNodes && accuracy >= (threshold.minAccuracy * 0.8)) { // 20% leniency on accuracy for level gating
                currentLevelIndex = i;
            } else {
                break;
            }
        }

        const currentLevelInfo = currentLevelIndex >= 0 ? CEFR_THRESHOLDS[currentLevelIndex] : null;
        const nextLevelInfo = currentLevelIndex + 1 < CEFR_THRESHOLDS.length ? CEFR_THRESHOLDS[currentLevelIndex + 1] : null;

        const level: CEFRLevel = currentLevelInfo ? currentLevelInfo.level : 'A0';
        const nextLevel: CEFRLevel | null = nextLevelInfo ? nextLevelInfo.level : null;

        // Calculate progress to next level
        let progressToNext = 0;
        if (nextLevelInfo) {
            const prevNodes = currentLevelInfo ? currentLevelInfo.minNodes : 0;
            const nodesNeeded = nextLevelInfo.minNodes - prevNodes;
            const nodesProgress = Math.max(0, completedNodes - prevNodes);
            progressToNext = Math.min(100, Math.round((nodesProgress / nodesNeeded) * 100));
        } else {
            progressToNext = 100; // Maxed out
        }

        // Estimate vocab based on node completion and grammar interactions
        const estimatedVocabularySize = currentLevelInfo
            ? currentLevelInfo.vocab + Math.floor(completedNodes * 1.5)
            : Math.floor(completedNodes * 2);

        // Derive unlocked real-world skills
        const unlockedSkills = this.getSkillsForLevel(level);

        return {
            level,
            progressToNext,
            nextLevel,
            estimatedVocabularySize,
            unlockedSkills
        };
    },

    getSkillsForLevel(level: CEFRLevel): string[] {
        switch (level) {
            case 'A0':
                return ['Can recognize basic Arabic alphabet', 'Can sound out simple words'];
            case 'A1':
                return [
                    'Can introduce themselves in the dialect',
                    'Can order food and drink',
                    'Can understand simple, very slow speech'
                ];
            case 'A2':
                return [
                    'Can handle short social exchanges',
                    'Can ask for directions or make purchases',
                    'Can communicate in routine tasks requiring simple info'
                ];
            case 'B1':
                return [
                    'Can deal with most situations while traveling',
                    'Can enter unprepared into common conversation topics',
                    'Can briefly give reasons and explanations for opinions'
                ];
            case 'B2':
                return [
                    'Can interact with a degree of fluency with native speakers',
                    'Can understand the main ideas of complex text/speech',
                    'Can explain a viewpoint on a topical issue'
                ];
            case 'C1':
                return ['Can express ideas fluently and spontaneously', 'Can use language flexibly for social purposes'];
            case 'C2':
                return ['Can summarize information from different spoken sources', 'Can express themselves very fluently and precisely'];
        }
    }
};
