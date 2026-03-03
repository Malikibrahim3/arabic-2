import { normalizeArabic } from '../utils/arabicUtils';

export interface LLMCacheEntry {
    spokenText: string;
    expectedText: string;
    dialect: string;
    feedback: string;
    timestamp: number;
}

const CACHE_KEY = 'arabic_app_llm_cache';

class LLMCache {
    private cache: Record<string, LLMCacheEntry> = {};

    constructor() {
        this.load();
    }

    private load() {
        try {
            const data = localStorage.getItem(CACHE_KEY);
            if (data) {
                this.cache = JSON.parse(data);
            }
        } catch (e) {
            console.error('Failed to load LLM cache', e);
        }
    }

    private save() {
        try {
            localStorage.setItem(CACHE_KEY, JSON.stringify(this.cache));
        } catch (e) {
            console.error('Failed to save LLM cache', e);
        }
    }

    private generateKey(spoken: string, expected: string, dialect: string): string {
        // Normalize to catch minor punctuation/spacing differences and prevent cache misses
        const normSpoken = normalizeArabic(spoken.trim().toLowerCase());
        const normExpected = normalizeArabic(expected.trim().toLowerCase());
        return `${dialect}_${normExpected}_${normSpoken}`;
    }

    public getCorrection(spoken: string, expected: string, dialect: string): string | null {
        const key = this.generateKey(spoken, expected, dialect);
        const entry = this.cache[key];
        if (entry) {
            console.log(`[LLM Cache Hit] Retrieved correction for "${spoken}" vs "${expected}" (${dialect})`);
            return entry.feedback;
        }
        return null;
    }

    public saveCorrection(spoken: string, expected: string, dialect: string, feedback: string) {
        const key = this.generateKey(spoken, expected, dialect);
        this.cache[key] = {
            spokenText: spoken,
            expectedText: expected,
            dialect,
            feedback,
            timestamp: Date.now(),
        };
        this.save();
        console.log(`[LLM Cache Miss] Saved new correction to cache for "${spoken}" vs "${expected}"`);
    }

    // Optional: Pre-populate cache with known common errors to save costs immediately
    public prePopulate(entries: { spoken: string; expected: string; dialect: string; feedback: string }[]) {
        let changed = false;
        for (const entry of entries) {
            const key = this.generateKey(entry.spoken, entry.expected, entry.dialect);
            if (!this.cache[key]) {
                this.cache[key] = {
                    spokenText: entry.spoken,
                    expectedText: entry.expected,
                    dialect: entry.dialect,
                    feedback: entry.feedback,
                    timestamp: Date.now(),
                };
                changed = true;
            }
        }
        if (changed) this.save();
    }

    // For debugging/dashboard
    public getStats() {
        return {
            totalEntries: Object.keys(this.cache).length,
            cacheKeySize: new Blob([localStorage.getItem(CACHE_KEY) || '']).size,
        };
    }
}

export const llmCache = new LLMCache();
