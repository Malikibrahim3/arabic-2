import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { useAudio } from '../../hooks/useAudio';
import type { Exercise } from '../../data/types';
import { useDialect } from '../../context/DialectContext';
import { LLMService } from '../../services/llmService';
import { grammarTracker } from '../../data/grammarTracker';
import { normalizeArabic, isSingleLetter } from '../../utils/arabicUtils';
import { PronunciationHeatmap, buildPhonemeResults } from './PronunciationHeatmap';
import './SpeakingExercise.css';

interface SpeakingExerciseProps {
    exercise: Exercise;
    onComplete: () => void;
    onWrong?: () => void;
}


/**
 * Map of Arabic letters → all accepted Google STT outputs.
 * Google STT often returns the letter name, a syllable, or a variant
 * when the user says a short letter sound.
 */
const LETTER_ACCEPTED_VARIANTS: Record<string, string[]> = {
    'ا': ['ا', 'الف', 'أ', 'آ', 'إ', 'اا', 'أأ', 'اه', 'آه', 'ااه'],
    'ب': ['ب', 'با', 'باء', 'بي', 'بو', 'به', 'بأ', 'بَ'],
    'ت': ['ت', 'تا', 'تاء', 'تي', 'تو', 'ته', 'تَ'],
    'ث': ['ث', 'ثا', 'ثاء', 'ثي', 'ثو', 'ثه', 'ثَ'],
    'ج': ['ج', 'جا', 'جيم', 'جي', 'جو', 'جه', 'جَ'],
    'ح': ['ح', 'حا', 'حاء', 'حي', 'حو', 'حه', 'حَ'],
    'خ': ['خ', 'خا', 'خاء', 'خي', 'خو', 'خه', 'خَ'],
    'د': ['د', 'دا', 'دال', 'دي', 'دو', 'ده', 'دَ'],
    'ذ': ['ذ', 'ذا', 'ذال', 'ذي', 'ذو', 'ذه', 'ذَ'],
    'ر': ['ر', 'را', 'راء', 'ري', 'رو', 'ره', 'رَ'],
    'ز': ['ز', 'زا', 'زاي', 'زي', 'زو', 'زه', 'زَ'],
    'س': ['س', 'سا', 'سين', 'سي', 'سو', 'سه', 'سَ'],
    'ش': ['ش', 'شا', 'شين', 'شي', 'شو', 'شه', 'شَ'],
    'ص': ['ص', 'صا', 'صاد', 'صي', 'صو', 'صه', 'صَ'],
    'ض': ['ض', 'ضا', 'ضاد', 'ضي', 'ضو', 'ضه', 'ضَ'],
    'ط': ['ط', 'طا', 'طاء', 'طي', 'طو', 'طه', 'طَ'],
    'ظ': ['ظ', 'ظا', 'ظاء', 'ظي', 'ظو', 'ظه', 'ظَ'],
    'ع': ['ع', 'عا', 'عين', 'عي', 'عو', 'عه', 'عَ', 'أ', 'اع'],
    'غ': ['غ', 'غا', 'غين', 'غي', 'غو', 'غه', 'غَ'],
    'ف': ['ف', 'فا', 'فاء', 'في', 'فو', 'فه', 'فَ'],
    'ق': ['ق', 'قا', 'قاف', 'قي', 'قو', 'قه', 'قَ'],
    'ك': ['ك', 'كا', 'كاف', 'كي', 'كو', 'كه', 'كَ'],
    'ل': ['ل', 'لا', 'لام', 'لي', 'لو', 'له', 'لَ'],
    'م': ['م', 'ما', 'ميم', 'مي', 'مو', 'مه', 'مَ'],
    'ن': ['ن', 'نا', 'نون', 'ني', 'نو', 'نه', 'نَ'],
    'ه': ['ه', 'ها', 'هاء', 'هي', 'هو', 'هه', 'هَ', 'اه'],
    'و': ['و', 'وا', 'واو', 'وي', 'وو', 'وه', 'وَ'],
    'ي': ['ي', 'يا', 'ياء', 'يي', 'يو', 'يه', 'يَ'],
};

/**
 * Lenient check: is the spoken text correct?
 * For single letters, checks against a wide range of accepted Google STT outputs.
 * For words/sentences, does a fuzzy word-level comparison.
 */
function isCorrectSpeech(spoken: string, expected: string): boolean {
    const s = normalizeArabic(spoken);
    const e = normalizeArabic(expected);

    if (!s || !e) return false;

    // Exact match
    if (s === e) return true;

    // For single letters: check against known variants
    if (isSingleLetter(e)) {
        const spokenClean = s.replace(/\s/g, '');

        // Direct character match
        if (spokenClean.length === 1 && spokenClean === e) return true;

        // Check against accepted variants for this letter
        const variants = LETTER_ACCEPTED_VARIANTS[e];
        if (variants) {
            const spokenNorm = normalizeArabic(spoken);
            if (variants.some(v => normalizeArabic(v) === spokenNorm)) return true;
        }

        // --- CAREFUL FALLBACKS FOR SHORT SOUNDS ---
        // STT struggles with isolated phonemes, so we still allow fuzzy matching
        // but ONLY against known variants — never a blanket accept.

        // Check if the spoken text contains any known variant of this letter
        if (variants && spokenClean.length <= 5) {
            if (variants.some(v => {
                const normV = normalizeArabic(v);
                return spokenClean === normV || spokenClean.includes(normV) || normV.includes(spokenClean);
            })) return true;
        }

        return false;
    }

    // For multi-word: check word-level match with fuzzy tolerance
    const spokenWords = s.split(' ');
    const expectedWords = e.split(' ');

    let matchCount = 0;
    for (const ew of expectedWords) {
        if (spokenWords.some(sw => sw === ew || sw.includes(ew) || ew.includes(sw))) {
            matchCount++;
        }
    }

    // Accept if at least 66% of expected words match (stricter than 50% but not 100%)
    const wordMatchRatio = expectedWords.length > 0 ? matchCount / expectedWords.length : 0;
    return wordMatchRatio >= 0.66;
}

/** Compute detailed pronunciation score */
function computePronunciationScore(spoken: string, expected: string): {
    score: number; // 0-100
    matchedWords: string[];
    missedWords: string[];
    feedback: string;
} {
    const s = normalizeArabic(spoken);
    const e = normalizeArabic(expected);

    if (!s || !e) return { score: 0, matchedWords: [], missedWords: [e], feedback: 'No speech detected' };

    // Single letter/short word
    if (e.length <= 3) {
        const isMatch = s === e || s.includes(e) || e.includes(s);
        return {
            score: isMatch ? 100 : 0,
            matchedWords: isMatch ? [e] : [],
            missedWords: isMatch ? [] : [e],
            feedback: isMatch ? 'Perfect!' : `Expected "${expected}" but heard "${spoken}"`
        };
    }

    const spokenWords = s.split(' ').filter(w => w.length > 0);
    const expectedWords = e.split(' ').filter(w => w.length > 0);

    const matchedWords: string[] = [];
    const missedWords: string[] = [];

    for (const ew of expectedWords) {
        if (spokenWords.some(sw => sw === ew || sw.includes(ew) || ew.includes(sw))) {
            matchedWords.push(ew);
        } else {
            missedWords.push(ew);
        }
    }

    const score = expectedWords.length > 0
        ? Math.round((matchedWords.length / expectedWords.length) * 100)
        : 0;

    let feedback = '';
    if (score === 100) {
        feedback = 'Excellent pronunciation! 🎯';
    } else if (score >= 80) {
        feedback = `Almost perfect! Missed: ${missedWords.join(', ')}`;
    } else if (score >= 50) {
        feedback = `Good try. Focus on: ${missedWords.join(', ')}`;
    } else {
        feedback = `Keep practicing. You missed: ${missedWords.join(', ')}`;
    }

    return { score, matchedWords, missedWords, feedback };
}

type FeedbackResult = 'correct' | 'wrong' | null;

export const SpeakingExercise: React.FC<SpeakingExerciseProps> = ({ exercise, onComplete, onWrong }) => {
    const [pronunciationScore, setPronunciationScore] = useState<{
        score: number;
        matchedWords: string[];
        missedWords: string[];
        feedback: string;
    } | null>(null);
    const {
        isSupported,
        isListening,
        isProcessing,
        transcript,
        error,
        startListening,
        stopListening,
        reset,
        isHighAccuracy
    } = useSpeechRecognition();
    const { play, playLetterSound, playCorrectSound, playWrongSound } = useAudio();
    const { currentDialect } = useDialect();

    const [showResult, setShowResult] = useState(false);
    const [feedback, setFeedback] = useState<FeedbackResult>(null);
    const [attempts, setAttempts] = useState(0);
    const [llmFeedback, setLlmFeedback] = useState<string | null>(null);
    const [isLlmGenerating, setIsLlmGenerating] = useState(false);
    const [hasListened, setHasListened] = useState(false);
    const [isPlayingAudio, setIsPlayingAudio] = useState(false);

    // Track whether we've already evaluated after mic stops
    const hasEvaluatedRef = useRef(false);
    const prevListeningRef = useRef(false);

    const expectedText = exercise.expectedSpeech || exercise.correctAnswer;
    const isLetterExercise = isSingleLetter(expectedText);

    // Reset everything when exercise changes
    useEffect(() => {
        setShowResult(false);
        setFeedback(null);
        setAttempts(0);
        setHasListened(false);
        setIsPlayingAudio(false);
        setPronunciationScore(null);
        setLlmFeedback(null);
        setIsLlmGenerating(false);
        hasEvaluatedRef.current = false;
        prevListeningRef.current = false;
        reset();
    }, [exercise.id]);

    // ─── Auto-play audio when exercise loads ──────────────────
    useEffect(() => {
        const timer = setTimeout(() => {
            // Pass true to auto-start the mic after playback
            handlePlayAudio(true);
        }, 600);
        return () => clearTimeout(timer);
    }, [exercise.id]);

    // ─── Evaluate when listening stops and we have a transcript ───
    useEffect(() => {
        // Only evaluate if we were listening, now stopped, NOT processing, and have a transcript
        if (prevListeningRef.current && !isListening && !isProcessing && transcript && !hasEvaluatedRef.current) {
            hasEvaluatedRef.current = true;

            const correct = isCorrectSpeech(transcript, expectedText);
            const scoreResult = computePronunciationScore(transcript, expectedText);
            setPronunciationScore(scoreResult);

            if (correct) {
                setFeedback('correct');
                playCorrectSound();
                setShowResult(true);
                setAttempts(a => a + 1);
            } else {
                setFeedback('wrong');
                playWrongSound();
                if (onWrong) onWrong();

                setShowResult(true);
                setAttempts(a => a + 1);

                // Fetch smart AI feedback asynchronously if it's not just a single letter error
                if (!isLetterExercise) {
                    setIsLlmGenerating(true);
                    LLMService.getCorrection(transcript, expectedText, currentDialect || 'msa')
                        .then((fb: string) => {
                            setLlmFeedback(fb);
                            setIsLlmGenerating(false);
                            // AF7: Track grammar weaknesses from LLM correction
                            grammarTracker.recordFromCorrection(fb, `${transcript} → ${expectedText}`);
                        })
                        .catch((err: Error) => {
                            console.error("Failed to get LLM feedback:", err);
                            setIsLlmGenerating(false);
                        });
                }
            }
        }

        // Only update prevListeningRef if we aren't in the middle of processing
        // This ensures the transition from Listening -> Processing -> Done is captured correctly
        if (!isProcessing) {
            prevListeningRef.current = isListening;
        }
    }, [isListening, isProcessing, transcript, expectedText, playCorrectSound, playWrongSound, onWrong]);

    // ─── Play the sound for this exercise ─────────────────────
    const handlePlayAudio = useCallback(async (autoStartMic: boolean = false) => {
        if (isPlayingAudio) return;
        setIsPlayingAudio(true);
        setHasListened(true);

        try {
            if (isLetterExercise) {
                await playLetterSound(expectedText);
            } else if (exercise.promptAudio) {
                await play(exercise.promptAudio);
            } else {
                await play(expectedText);
            }
        } catch (e) {
            console.warn('Audio playback failed:', e);
        }
        setIsPlayingAudio(false);

        // If requested, start the microphone immediately after audio finishes
        if (autoStartMic) {
            handleStartRecording();
        }
    }, [isLetterExercise, expectedText, exercise.promptAudio, play, playLetterSound, isPlayingAudio, currentDialect, startListening, reset]);

    const handleStartRecording = useCallback(() => {
        setHasListened(true);
        setShowResult(false);
        setFeedback(null);
        hasEvaluatedRef.current = false;
        reset();
        startListening(currentDialect as any, expectedText);
    }, [startListening, reset, currentDialect, expectedText]);

    const handleStopRecording = useCallback(() => {
        stopListening();
    }, [stopListening]);

    const handleContinue = () => {
        onComplete();
    };

    const handleTryAgain = () => {
        setShowResult(false);
        setFeedback(null);
        hasEvaluatedRef.current = false;
        reset();
    };

    const handleSkip = () => {
        onComplete();
    };

    // For single letters, provide a "I said it correctly" self-check button
    const handleSelfCheck = () => {
        playCorrectSound();
        setFeedback('correct');
        setShowResult(true);
        setAttempts(a => a + 1);
    };

    // ─── Not Supported ────────────────────────────────────────
    if (!isSupported) {
        return (
            <div className="speaking-exercise">
                <div className="se-unsupported">
                    <div className="se-unsupported-icon">🎤</div>
                    <h3>Speech Recognition Not Available</h3>
                    <p>Please use <strong>Google Chrome</strong> or <strong>Microsoft Edge</strong> for speaking exercises.</p>
                    <p style={{ fontSize: '12px', marginTop: '8px', opacity: 0.7 }}>
                        You can still practice by listening and repeating out loud.
                    </p>
                    <div className="se-no-mic-actions">
                        <button className="se-listen-btn-alt" onClick={() => handlePlayAudio()}>
                            🔊 Listen to the Sound
                        </button>
                        <button className="se-self-check-btn" onClick={handleSelfCheck}>
                            ✅ I Said It — Continue
                        </button>
                        <button className="se-skip-link" onClick={handleSkip}>
                            Skip this exercise →
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ─── Render ───────────────────────────────────────────────
    const typeLabelMap: Record<string, string> = {
        'listen_repeat': '🔊 Listen & Repeat',
        'pronunciation_drill': '🎯 Pronunciation Drill',
        'speak_translation': '🌐 Speak the Translation',
        'listen_respond': '💬 Listen & Respond',
        'shadowing': '🏃 Shadowing',
    };
    const typeLabel = typeLabelMap[exercise.type] || '🎤 Speaking';

    return (
        <div className="speaking-exercise">
            {/* Header badge */}
            <motion.div
                className="se-type-badge"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
            >
                {typeLabel}
            </motion.div>

            {/* Prompt */}
            <motion.div
                className="se-prompt-area"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <p className="se-prompt">{exercise.prompt}</p>

                {exercise.soundFocus && (
                    <div className="se-sound-focus">
                        <span className="se-focus-letter">{exercise.soundFocus}</span>
                        <span className="se-focus-label">Focus Sound</span>
                    </div>
                )}

                <div className="se-target-text">
                    <div className={`se-arabic ${isLetterExercise ? 'se-arabic-large' : ''}`} dir="rtl">
                        {expectedText}
                    </div>
                    {exercise.transliteration && (
                        <div className="se-transliteration">{exercise.transliteration}</div>
                    )}
                    {exercise.hint && (
                        <div className="se-english">{exercise.hint}</div>
                    )}
                </div>
            </motion.div>

            {/* Listen button */}
            <motion.button
                className={`se-listen-btn ${isPlayingAudio ? 'playing' : ''} ${hasListened ? 'listened' : ''}`}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handlePlayAudio()}
                disabled={isPlayingAudio}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
            >
                <span className="se-listen-icon">{isPlayingAudio ? '🔉' : '🔊'}</span>
                <span>{isPlayingAudio ? 'Playing...' : hasListened ? 'Listen Again' : '🔊 Listen First'}</span>
            </motion.button>

            {/* Mic + Self-check area */}
            <motion.div
                className="se-mic-area"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
            >
                {!showResult && !isProcessing && (
                    <div className="se-action-buttons">
                        {/* Mic button */}
                        <motion.button
                            className={`se-mic-btn ${isListening ? 'recording' : ''}`}
                            whileHover={!isListening ? { scale: 1.08 } : {}}
                            whileTap={!isListening ? { scale: 0.95 } : {}}
                            onClick={isListening ? handleStopRecording : handleStartRecording}
                        >
                            <div className="se-mic-icon-wrapper">
                                {isListening ? (
                                    <>
                                        <motion.div
                                            className="se-mic-pulse"
                                            animate={{ scale: [1, 1.5, 1], opacity: [0.6, 0, 0.6] }}
                                            transition={{ repeat: Infinity, duration: 1.5 }}
                                        />
                                        <motion.div
                                            className="se-mic-pulse-2"
                                            animate={{ scale: [1, 2, 1], opacity: [0.4, 0, 0.4] }}
                                            transition={{ repeat: Infinity, duration: 1.5, delay: 0.3 }}
                                        />
                                        <span className="se-mic-icon recording-icon">🎤</span>
                                    </>
                                ) : (
                                    <span className="se-mic-icon">🎤</span>
                                )}
                            </div>
                        </motion.button>

                        <p className="se-mic-label">
                            {isListening
                                ? 'Listening... speak now! (auto-stops)'
                                : isHighAccuracy
                                    ? 'Tap to speak (AI Enhanced 🤖)'
                                    : 'Tap to speak'}
                        </p>

                        {/* Self-check button */}
                        {!isListening && (
                            <motion.button
                                className="se-self-check-btn"
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={handleSelfCheck}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                            >
                                ✅ I Said It Correctly
                            </motion.button>
                        )}
                    </div>
                )}

                {/* Processing state — Google STT analyzing */}
                {isProcessing && (
                    <div className="se-processing-area">
                        <motion.div
                            className="se-spinner"
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                        />
                        <p className="se-mic-label processing">Analyzing with AI... 🤖</p>
                    </div>
                )}

                {/* Live transcript */}
                <AnimatePresence>
                    {isListening && transcript && (
                        <motion.div
                            className="se-live-transcript"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0 }}
                            dir="rtl"
                        >
                            {transcript}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Skip link */}
                {!showResult && !isListening && !isProcessing && (
                    <button className="se-skip-link" onClick={handleSkip}>
                        Skip this exercise →
                    </button>
                )}
            </motion.div>

            {/* Error */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        className="se-error"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                    >
                        {error}
                        {isLetterExercise && (
                            <span style={{ display: 'block', marginTop: 4, fontSize: '12px', opacity: 0.8 }}>
                                Speech recognition struggles with single letters. Use "I Said It Correctly" instead.
                            </span>
                        )}
                        <button className="se-error-skip" onClick={handleSelfCheck}>✅ I Said It</button>
                        <button className="se-error-skip" onClick={handleSkip}>Skip →</button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Results — Binary: Correct or Wrong */}
            <AnimatePresence>
                {showResult && feedback && (
                    <motion.div
                        className={`se-result ${feedback}`}
                        initial={{ opacity: 0, y: 30, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ type: 'spring', damping: 18 }}
                    >
                        {feedback === 'correct' ? (
                            /* ── CORRECT ── */
                            <div className="se-result-correct">
                                <div className="se-result-header">
                                    <span className="se-result-emoji">✅</span>
                                    <span className="se-result-label">Correct!</span>
                                    {pronunciationScore && (
                                        <span style={{
                                            marginLeft: '12px',
                                            padding: '4px 12px',
                                            borderRadius: '12px',
                                            fontSize: '13px',
                                            fontWeight: 700,
                                            background: pronunciationScore.score >= 80 ? 'rgba(34, 197, 94, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                                            color: pronunciationScore.score >= 80 ? '#4ADE80' : '#FBBF24',
                                        }}>
                                            {pronunciationScore.score}% Match
                                        </span>
                                    )}
                                </div>

                                {pronunciationScore && pronunciationScore.feedback && (
                                    <div className="se-tip" style={{ marginTop: '8px' }}>
                                        🎯 {pronunciationScore.feedback}
                                    </div>
                                )}

                                {exercise.explanation && (
                                    <div className="se-tip">
                                        💡 {exercise.explanation}
                                    </div>
                                )}

                                {/* AF12: Pronunciation Heatmap */}
                                {!isLetterExercise && pronunciationScore && (
                                    <PronunciationHeatmap
                                        expected={expectedText}
                                        spoken={transcript}
                                        phonemeResults={buildPhonemeResults(expectedText, transcript)}
                                        score={pronunciationScore.score}
                                    />
                                )}
                            </div>
                        ) : (
                            /* ── WRONG ── */
                            <div className="se-result-wrong">
                                <div className="se-result-header">
                                    <span className="se-result-emoji">❌</span>
                                    <span className="se-result-label">Not quite right</span>
                                    {pronunciationScore && (
                                        <span style={{
                                            marginLeft: '12px',
                                            padding: '4px 12px',
                                            borderRadius: '12px',
                                            fontSize: '13px',
                                            fontWeight: 700,
                                            background: pronunciationScore.score >= 50 ? 'rgba(245, 158, 11, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                                            color: pronunciationScore.score >= 50 ? '#FBBF24' : '#F87171',
                                        }}>
                                            {pronunciationScore.score}% Match
                                        </span>
                                    )}
                                </div>

                                {pronunciationScore && pronunciationScore.feedback && !llmFeedback && !isLlmGenerating && (
                                    <div className="se-tip" style={{ marginTop: '8px', color: '#FBBF24' }}>
                                        🎯 {pronunciationScore.feedback}
                                    </div>
                                )}

                                {/* LLM Smart Feedback Layer */}
                                {(isLlmGenerating || llmFeedback) && (
                                    <div className="se-tip llm-feedback-box" style={{ marginTop: '12px', background: 'rgba(99, 102, 241, 0.1)', borderColor: 'rgba(99, 102, 241, 0.3)', color: '#E0E7FF' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', fontWeight: 600, color: '#818CF8', fontSize: '13px' }}>
                                            <span>✨ AI Tutor Feedback</span>
                                        </div>
                                        {isLlmGenerating ? (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.8 }}>
                                                <motion.div
                                                    animate={{ rotate: 360 }}
                                                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                                                    style={{ width: 14, height: 14, border: '2px solid #818CF8', borderTopColor: 'transparent', borderRadius: '50%' }}
                                                />
                                                Analyzing your pronunciation...
                                            </div>
                                        ) : (
                                            <div>{llmFeedback}</div>
                                        )}
                                    </div>
                                )}

                                {/* Show what they said vs what was expected */}
                                {transcript && (
                                    <div className="se-comparison">
                                        <div className="se-comp-row wrong">
                                            <span className="se-comp-label">You said:</span>
                                            <span className="se-comp-arabic" dir="rtl">{transcript}</span>
                                        </div>
                                    </div>
                                )}

                                <div className="se-correction">
                                    <div className="se-correction-label">Correct answer:</div>
                                    <div className="se-correction-arabic" dir="rtl">{expectedText}</div>
                                    {exercise.transliteration && (
                                        <div className="se-correction-translit">{exercise.transliteration}</div>
                                    )}
                                </div>

                                {exercise.explanation && (
                                    <div className="se-tip">
                                        💡 {exercise.explanation}
                                    </div>
                                )}

                                {/* AF12: Pronunciation Heatmap */}
                                {!isLetterExercise && pronunciationScore && (
                                    <PronunciationHeatmap
                                        expected={expectedText}
                                        spoken={transcript}
                                        phonemeResults={buildPhonemeResults(expectedText, transcript)}
                                        score={pronunciationScore.score}
                                    />
                                )}
                            </div>
                        )}

                        <div className="se-result-actions">
                            {feedback === 'wrong' && attempts < 3 && (
                                <div className="se-retry-row">
                                    <motion.button
                                        className="se-retry-btn"
                                        whileHover={{ scale: 1.03 }}
                                        whileTap={{ scale: 0.97 }}
                                        onClick={handleTryAgain}
                                    >
                                        🔄 Try Again
                                    </motion.button>
                                    <motion.button
                                        className="se-listen-again-btn"
                                        whileHover={{ scale: 1.03 }}
                                        whileTap={{ scale: 0.97 }}
                                        onClick={() => handlePlayAudio()}
                                    >
                                        🔊 Listen Again
                                    </motion.button>
                                </div>
                            )}
                            <motion.button
                                className={`se-continue-btn ${feedback === 'correct' ? 'correct' : ''}`}
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={handleContinue}
                            >
                                Continue →
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
