/**
 * SRS Engine v2 — SM-2 / FSRS-Inspired Algorithm
 * 
 * Key improvements over v1:
 * - Per-item difficulty factor (easiness factor from SM-2)
 * - Variable intervals that adapt to item difficulty
 * - Quality rating (0-5) instead of binary correct/wrong
 * - Graduated intervals: 1min → 10min → 1d → 3d → 7d → 14d → 30d+
 * - Lapse handling with re-learning steps
 */

import type { SRSTag } from './types';

export interface SRSItem {
    id: string;
    tag: SRSTag;
    nextReviewMs: number;
    consecutiveFailures: number;
    // SM-2 fields
    easeFactor: number;      // Difficulty multiplier (default 2.5, min 1.3)
    interval: number;        // Current interval in hours
    repetitions: number;     // Number of consecutive correct reviews
    lapses: number;          // Total times item went back to learning
    lastReviewMs: number;    // When last reviewed
}

const STORAGE_KEY = 'arabic_srs_state';

// SM-2 quality → tag mapping
function qualityToTag(quality: number, currentTag: SRSTag): SRSTag {
    if (quality < 3) return 'unstable'; // Failed
    if (currentTag === 'new') return 'learning';
    if (currentTag === 'learning') return 'unstable';
    if (currentTag === 'unstable') return 'stable';
    if (currentTag === 'stable') return 'automatic';
    return currentTag;
}

class SRSEngine {
    private state: Record<string, SRSItem> = {};

    constructor() {
        this.load();
    }

    private load() {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            if (data) {
                const parsed = JSON.parse(data);
                // Migrate old items that lack SM-2 fields
                for (const key of Object.keys(parsed)) {
                    const item = parsed[key];
                    if (item.easeFactor === undefined) {
                        item.easeFactor = 2.5;
                        item.interval = 0;
                        item.repetitions = 0;
                        item.lapses = 0;
                        item.lastReviewMs = Date.now();
                    }
                }
                this.state = parsed;
            }
        } catch (e) {
            console.error('Failed to load SRS state', e);
        }
    }

    private save() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
        } catch (e) {
            console.error('Failed to save SRS state', e);
        }
    }

    public registerItem(id: string) {
        if (!this.state[id]) {
            this.state[id] = {
                id,
                tag: 'new',
                nextReviewMs: Date.now(),
                consecutiveFailures: 0,
                easeFactor: 2.5,
                interval: 0,
                repetitions: 0,
                lapses: 0,
                lastReviewMs: Date.now(),
            };
            this.save();
        }
    }

    /**
     * Record performance using SM-2 quality rating:
     * 0 = Complete blackout
     * 1 = Wrong answer, but recognized after seeing correct
     * 2 = Wrong answer, but correct answer "felt" familiar
     * 3 = Correct with serious difficulty
     * 4 = Correct with some hesitation
     * 5 = Perfect, instant recall
     * 
     * For binary correct/wrong, use quality 4 (correct) or 1 (wrong)
     */
    public recordPerformance(id: string, isCorrect: boolean, quality?: number): SRSItem {
        if (!this.state[id]) {
            this.registerItem(id);
        }

        const item = this.state[id];
        const q = quality !== undefined ? quality : (isCorrect ? 4 : 1);
        const HOUR = 1000 * 60 * 60;

        if (q >= 3) {
            // ── Correct answer ──
            item.consecutiveFailures = 0;
            item.repetitions += 1;

            // SM-2 ease factor update
            item.easeFactor = Math.max(1.3,
                item.easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
            );

            // Calculate next interval
            if (item.repetitions === 1) {
                item.interval = 0.17; // ~10 minutes
            } else if (item.repetitions === 2) {
                item.interval = 24; // 1 day
            } else if (item.repetitions === 3) {
                item.interval = 72; // 3 days
            } else {
                item.interval = Math.round(item.interval * item.easeFactor);
            }

            // Cap at 180 days
            item.interval = Math.min(item.interval, 180 * 24);

            // Update tag
            item.tag = qualityToTag(q, item.tag);
            item.nextReviewMs = Date.now() + item.interval * HOUR;

        } else {
            // ── Wrong answer ──
            item.consecutiveFailures += 1;
            item.lapses += 1;
            item.repetitions = 0;

            // Reduce ease factor on failure (but not below 1.3)
            item.easeFactor = Math.max(1.3, item.easeFactor - 0.2);

            // Demote to unstable, short re-learn interval
            item.tag = 'unstable';
            item.interval = 0.017; // ~1 minute (immediate re-learn)
            item.nextReviewMs = Date.now() - 1000; // Due immediately
        }

        item.lastReviewMs = Date.now();
        this.save();
        return item;
    }

    /**
     * Get all items that need review right now (Warmup Queue)
     * Sorted by urgency (most overdue first)
     */
    public getDueItems(): SRSItem[] {
        const now = Date.now();
        return Object.values(this.state)
            .filter(item =>
                item.tag !== 'new'
                && item.tag !== 'automatic'
                && item.nextReviewMs <= now
            )
            .sort((a, b) => a.nextReviewMs - b.nextReviewMs);
    }

    /**
     * Get items that are weak (low ease factor or high lapses)
     */
    public getWeakItems(limit: number = 10): SRSItem[] {
        return Object.values(this.state)
            .filter(item => item.tag !== 'new')
            .sort((a, b) => {
                // Sort by weakness: low ease factor + high lapses
                const aScore = a.easeFactor - (a.lapses * 0.1);
                const bScore = b.easeFactor - (b.lapses * 0.1);
                return aScore - bScore;
            })
            .slice(0, limit);
    }

    public getItem(id: string): SRSItem | undefined {
        return this.state[id];
    }

    /**
     * Get overall SRS statistics
     */
    public getStats(): { total: number; byTag: Record<SRSTag, number>; avgEase: number } {
        const items = Object.values(this.state);
        const byTag: Record<SRSTag, number> = {
            new: 0, learning: 0, unstable: 0, stable: 0, automatic: 0
        };
        let totalEase = 0;
        for (const item of items) {
            byTag[item.tag] = (byTag[item.tag] || 0) + 1;
            totalEase += item.easeFactor;
        }
        return {
            total: items.length,
            byTag,
            avgEase: items.length > 0 ? totalEase / items.length : 2.5,
        };
    }
}

export const srsEngine = new SRSEngine();
