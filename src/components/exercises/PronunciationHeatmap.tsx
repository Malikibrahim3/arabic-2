import React from 'react';
import { motion } from 'framer-motion';

interface PhonemeResult {
    phoneme: string;
    matched: boolean;
}

interface PronunciationHeatmapProps {
    expected: string;
    spoken: string;
    phonemeResults: PhonemeResult[];
    score: number;
}

/**
 * Visual phoneme-by-phoneme pronunciation heatmap.
 * Shows each word/phoneme color-coded:
 * - Green: matched correctly
 * - Red: missed or wrong
 * - Amber: partial match
 */
export const PronunciationHeatmap: React.FC<PronunciationHeatmapProps> = ({
    expected,
    spoken,
    phonemeResults,
    score,
}) => {
    if (phonemeResults.length === 0) return null;

    const getColor = (matched: boolean) => matched ? '#4ADE80' : '#F87171';
    const getBg = (matched: boolean) => matched ? 'rgba(74,222,128,0.12)' : 'rgba(248,113,113,0.12)';

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            style={{
                padding: '16px',
                borderRadius: '16px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                marginTop: '12px',
            }}
        >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>
                    Pronunciation Breakdown
                </span>
                <span style={{
                    fontSize: '13px',
                    fontWeight: 700,
                    color: score >= 85 ? '#4ADE80' : score >= 60 ? '#FBBF24' : '#F87171',
                }}>
                    {score}%
                </span>
            </div>

            {/* Phoneme Grid */}
            <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '6px',
                justifyContent: 'center',
                marginBottom: '12px',
            }}>
                {phonemeResults.map((p, i) => (
                    <motion.div
                        key={i}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: i * 0.05, type: 'spring', damping: 15 }}
                        style={{
                            padding: '6px 12px',
                            borderRadius: '10px',
                            background: getBg(p.matched),
                            border: `1.5px solid ${getColor(p.matched)}40`,
                            color: getColor(p.matched),
                            fontFamily: "'Noto Naskh Arabic', 'Amiri', serif",
                            fontSize: '18px',
                            fontWeight: 600,
                            direction: 'rtl',
                            minWidth: '36px',
                            textAlign: 'center',
                            position: 'relative',
                        }}
                    >
                        {p.phoneme}
                        <div style={{
                            position: 'absolute',
                            bottom: '-2px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: '60%',
                            height: '3px',
                            borderRadius: '2px',
                            background: getColor(p.matched),
                            opacity: 0.6,
                        }} />
                    </motion.div>
                ))}
            </div>

            {/* Score Bar */}
            <div style={{
                height: '6px',
                borderRadius: '3px',
                background: 'rgba(255,255,255,0.06)',
                overflow: 'hidden',
            }}>
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${score}%` }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    style={{
                        height: '100%',
                        borderRadius: '3px',
                        background: score >= 85
                            ? 'linear-gradient(90deg, #4ADE80, #22D3EE)'
                            : score >= 60
                                ? 'linear-gradient(90deg, #FBBF24, #F59E0B)'
                                : 'linear-gradient(90deg, #F87171, #EF4444)',
                    }}
                />
            </div>

            {/* Comparison */}
            <div style={{ marginTop: '10px', display: 'flex', gap: '8px', fontSize: '12px' }}>
                <div style={{ flex: 1 }}>
                    <div style={{ color: 'rgba(255,255,255,0.4)', marginBottom: '2px' }}>Expected</div>
                    <div dir="rtl" style={{ color: 'rgba(255,255,255,0.7)', fontFamily: "'Noto Naskh Arabic', 'Amiri', serif", fontSize: '14px' }}>
                        {expected}
                    </div>
                </div>
                <div style={{ flex: 1 }}>
                    <div style={{ color: 'rgba(255,255,255,0.4)', marginBottom: '2px' }}>You said</div>
                    <div dir="rtl" style={{ color: 'rgba(255,255,255,0.7)', fontFamily: "'Noto Naskh Arabic', 'Amiri', serif", fontSize: '14px' }}>
                        {spoken || '—'}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

/**
 * Build phoneme results from expected and spoken text.
 * Splits by word and compares.
 */
export function buildPhonemeResults(expected: string, spoken: string): PhonemeResult[] {
    const normalize = (s: string) => s.replace(/[\u064B-\u065F\u0670]/g, '').trim();
    const expectedWords = normalize(expected).split(/\s+/);
    const spokenWords = normalize(spoken).split(/\s+/);

    return expectedWords.map((word) => ({
        phoneme: word,
        matched: spokenWords.some(sw =>
            sw === word ||
            sw.includes(word) ||
            word.includes(sw) ||
            levenshteinSimilarity(sw, word) > 0.6
        ),
    }));
}

/** Simple Levenshtein similarity ratio */
function levenshteinSimilarity(a: string, b: string): number {
    if (a === b) return 1;
    const longer = a.length > b.length ? a : b;
    const shorter = a.length > b.length ? b : a;
    if (longer.length === 0) return 1;

    const costs: number[] = [];
    for (let i = 0; i <= longer.length; i++) {
        let lastValue = i;
        for (let j = 0; j <= shorter.length; j++) {
            if (i === 0) {
                costs[j] = j;
            } else if (j > 0) {
                let newValue = costs[j - 1];
                if (longer.charAt(i - 1) !== shorter.charAt(j - 1)) {
                    newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
                }
                costs[j - 1] = lastValue;
                lastValue = newValue;
            }
        }
        if (i > 0) costs[shorter.length] = lastValue;
    }
    return (longer.length - costs[shorter.length]) / longer.length;
}
