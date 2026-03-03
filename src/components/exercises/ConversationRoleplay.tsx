import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './ConversationRoleplay.css';
import type { Exercise } from '../../data/types';
import { DualTextDisplay } from './DualTextDisplay';
import { useAudio } from '../../hooks/useAudio';

interface ConversationRoleplayProps {
    exercise: Exercise;
    onComplete: () => void;
}

type Phase =
    | { type: 'scene-intro' }                          // Animated scene introduction
    | { type: 'chat'; turnIndex: number }               // Show a chat bubble
    | { type: 'comprehension-check'; turnIndex: number }// Quiz after a turn
    | { type: 'translation-check'; turnIndex: number }  // Translate check
    | { type: 'word-order'; turnIndex: number }         // Reorder the words
    | { type: 'summary' };                              // Summary / score

function shuffleArray<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

export const ConversationRoleplay: React.FC<ConversationRoleplayProps> = ({ exercise, onComplete }) => {
    const { play, playCorrectSound, playWrongSound } = useAudio();
    const turns = exercise.conversationTurns || [];
    const scrollRef = useRef<HTMLDivElement>(null);

    // ─── State ─────────────────────────────────────────────
    const [phase, setPhase] = useState<Phase>({ type: 'scene-intro' });
    const [revealedTurns, setRevealedTurns] = useState<number[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const [score, setScore] = useState(0);
    const [totalChecks, setTotalChecks] = useState(0);
    const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
    const [feedbackCorrect, setFeedbackCorrect] = useState(false);

    // For comprehension / translation checks
    const [quizChoices, setQuizChoices] = useState<string[]>([]);
    const [quizAnswer, setQuizAnswer] = useState('');
    const [quizPrompt, setQuizPrompt] = useState('');
    const [selectedChoice, setSelectedChoice] = useState<string | null>(null);

    // For word-order challenges
    const [wordOrderTiles, setWordOrderTiles] = useState<string[]>([]);
    const [wordOrderSelected, setWordOrderSelected] = useState<string[]>([]);
    const [wordOrderCorrect, setWordOrderCorrect] = useState<string[]>([]);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            setTimeout(() => {
                scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
            }, 100);
        }
    }, [revealedTurns, isTyping, phase]);

    const advanceTurn = useCallback((turnIdx: number) => {
        const turn = turns[turnIdx];

        // Play audio if available
        const audioUrl = turn.audioUrl || turn.text.audioUrl;
        if (audioUrl) play(audioUrl);

        // Add to revealed turns
        setRevealedTurns(prev => [...prev, turnIdx]);

        // After every 2–3 turns, insert an interactive challenge
        const shouldChallenge = turnIdx > 0 && turnIdx % 2 === 1 && turnIdx < turns.length - 1;

        if (shouldChallenge) {
            const challengeType = Math.random();
            if (challengeType < 0.4) {
                // Comprehension: What did the speaker just say?
                setupComprehensionCheck(turnIdx);
            } else if (challengeType < 0.7) {
                // Translation: What does this mean?
                setupTranslationCheck(turnIdx);
            } else {
                // Word order: Rearrange the sentence
                setupWordOrder(turnIdx);
            }
        } else if (turnIdx >= turns.length - 1) {
            // Last turn — show summary after a delay
            setTimeout(() => setPhase({ type: 'summary' }), 2000);
        } else {
            // Continue to next turn after a pause
            setTimeout(() => startChatTurn(turnIdx + 1), 1200);
        }
    }, [turns, play]);

    const startChatTurn = useCallback((turnIdx: number) => {
        setPhase({ type: 'chat', turnIndex: turnIdx });
        setSelectedChoice(null);
        setFeedbackMsg(null);
        setIsTyping(true);

        // Simulate typing for a realistic feel
        const typingDuration = turns[turnIdx]?.speaker === 'ai' ? 1400 : 900;
        setTimeout(() => {
            setIsTyping(false);
            advanceTurn(turnIdx);
        }, typingDuration);
    }, [turns, advanceTurn]);

    const setupComprehensionCheck = (turnIdx: number) => {
        const turn = turns[turnIdx];
        const correct = turn.text.english;
        // Grab 2 wrong answers from other turns
        const wrongs = turns
            .filter((_, i) => i !== turnIdx)
            .map(t => t.text.english);
        const distractors = shuffleArray(wrongs).slice(0, 2);
        const choices = shuffleArray([correct, ...distractors]);

        setQuizPrompt(`What did ${turn.speaker === 'ai' ? 'the speaker' : 'you'} just say?`);
        setQuizAnswer(correct);
        setQuizChoices(choices);
        setSelectedChoice(null);
        setFeedbackMsg(null);
        setTotalChecks(c => c + 1);
        setPhase({ type: 'comprehension-check', turnIndex: turnIdx });
    };

    const setupTranslationCheck = (turnIdx: number) => {
        const turn = turns[turnIdx];
        const correct = turn.text.msa;
        const wrongs = turns
            .filter((_, i) => i !== turnIdx)
            .map(t => t.text.msa);
        const distractors = shuffleArray(wrongs).slice(0, 2);
        const choices = shuffleArray([correct, ...distractors]);

        setQuizPrompt(`Which Arabic line means: "${turn.text.english}"?`);
        setQuizAnswer(correct);
        setQuizChoices(choices);
        setSelectedChoice(null);
        setFeedbackMsg(null);
        setTotalChecks(c => c + 1);
        setPhase({ type: 'translation-check', turnIndex: turnIdx });
    };

    const setupWordOrder = (turnIdx: number) => {
        const turn = turns[turnIdx];
        const words = turn.text.msa.split(' ');
        if (words.length < 3) {
            // Too short for word order, do comprehension instead
            setupComprehensionCheck(turnIdx);
            return;
        }
        const correctOrder = [...words];
        const shuffled = shuffleArray(words);

        setWordOrderCorrect(correctOrder);
        setWordOrderTiles(shuffled);
        setWordOrderSelected([]);
        setFeedbackMsg(null);
        setTotalChecks(c => c + 1);
        setPhase({ type: 'word-order', turnIndex: turnIdx });
    };

    const handleQuizSelect = (choice: string) => {
        if (selectedChoice) return; // Already answered
        setSelectedChoice(choice);
        if (choice === quizAnswer) {
            setFeedbackCorrect(true);
            setFeedbackMsg('✅ Correct!');
            setScore(s => s + 1);
            playCorrectSound();
        } else {
            setFeedbackCorrect(false);
            setFeedbackMsg(`❌ The answer was: ${quizAnswer}`);
            playWrongSound();
        }
    };

    const handleWordTileTap = (word: string, index: number) => {
        // Add word to selected
        const newSelected = [...wordOrderSelected, word];
        const newTiles = [...wordOrderTiles];
        newTiles.splice(index, 1);
        setWordOrderSelected(newSelected);
        setWordOrderTiles(newTiles);

        // Check if complete
        if (newSelected.length === wordOrderCorrect.length) {
            const isCorrect = newSelected.join(' ') === wordOrderCorrect.join(' ');
            if (isCorrect) {
                setFeedbackCorrect(true);
                setFeedbackMsg('✅ Perfect word order!');
                setScore(s => s + 1);
                playCorrectSound();
            } else {
                setFeedbackCorrect(false);
                setFeedbackMsg('❌ Not quite — check the word order');
                playWrongSound();
            }
        }
    };

    const handleWordSelectedTap = (word: string, index: number) => {
        // Move word back from selected to tiles
        if (feedbackMsg) return; // Don't allow after answer
        const newSelected = [...wordOrderSelected];
        newSelected.splice(index, 1);
        setWordOrderSelected(newSelected);
        setWordOrderTiles([...wordOrderTiles, word]);
    };

    const handleContinueAfterChallenge = () => {
        const currentPhase = phase;
        if (currentPhase.type === 'comprehension-check' || currentPhase.type === 'translation-check' || currentPhase.type === 'word-order') {
            const nextTurnIdx = currentPhase.turnIndex + 1;
            if (nextTurnIdx < turns.length) {
                startChatTurn(nextTurnIdx);
            } else {
                setPhase({ type: 'summary' });
            }
        }
    };

    // Start the experience
    const handleStartConversation = () => {
        if (turns.length > 0) {
            startChatTurn(0);
        }
    };

    // ─── RENDER: Scene Intro ───────────────────────────────────
    if (phase.type === 'scene-intro') {
        const title = exercise.prompt?.replace('Roleplay: ', '') || 'Conversation';
        return (
            <div className="cr-scene-intro">
                <motion.div
                    className="cr-scene-card"
                    initial={{ opacity: 0, scale: 0.9, y: 30 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ type: 'spring', damping: 20, stiffness: 200 }}
                >
                    <div className="cr-scene-icon">🎭</div>
                    <h2 className="cr-scene-title">{title}</h2>
                    <p className="cr-scene-desc">
                        Follow along and interact with this conversation. You'll be quizzed on comprehension, translation, and word order as you go!
                    </p>
                    <div className="cr-scene-stats">
                        <span>💬 {turns.length} messages</span>
                        <span>🧠 Interactive quizzes</span>
                        <span>⭐ Earn points</span>
                    </div>
                    <motion.button
                        className="cr-start-btn"
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={handleStartConversation}
                    >
                        Start Conversation
                    </motion.button>
                </motion.div>
            </div>
        );
    }

    // ─── RENDER: Summary ───────────────────────────────────────
    if (phase.type === 'summary') {
        const pct = totalChecks > 0 ? Math.round((score / totalChecks) * 100) : 100;
        const emoji = pct >= 80 ? '🎉' : pct >= 50 ? '👍' : '💪';
        return (
            <div className="cr-summary">
                <motion.div
                    className="cr-summary-card"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'spring', damping: 18 }}
                >
                    <div className="cr-summary-emoji">{emoji}</div>
                    <h2 className="cr-summary-title">Conversation Complete!</h2>
                    {totalChecks > 0 && (
                        <div className="cr-summary-score">
                            <div className="cr-score-ring">
                                <svg viewBox="0 0 100 100">
                                    <circle cx="50" cy="50" r="42" stroke="#2a2a3e" strokeWidth="8" fill="none" />
                                    <circle cx="50" cy="50" r="42" stroke={pct >= 80 ? '#4ADE80' : pct >= 50 ? '#FBBF24' : '#F87171'} strokeWidth="8" fill="none"
                                        strokeDasharray={`${pct * 2.64} 264`}
                                        strokeLinecap="round"
                                        transform="rotate(-90 50 50)" />
                                </svg>
                                <span className="cr-score-pct">{pct}%</span>
                            </div>
                            <p className="cr-score-detail">{score}/{totalChecks} challenges correct</p>
                        </div>
                    )}
                    <motion.button
                        className="cr-finish-btn"
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={onComplete}
                    >
                        Continue 🎯
                    </motion.button>
                </motion.div>
            </div>
        );
    }

    // ─── RENDER: Interactive Quiz (Comprehension or Translation) ─────
    if (phase.type === 'comprehension-check' || phase.type === 'translation-check') {
        return (
            <div className="cr-container">
                {renderChatHistory()}
                {/* Quiz overlay */}
                <motion.div
                    className="cr-quiz-panel"
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: 'spring', damping: 20 }}
                >
                    <div className="cr-quiz-badge">
                        {phase.type === 'comprehension-check' ? '🧠 Comprehension Check' : '🌐 Translation Challenge'}
                    </div>
                    <p className="cr-quiz-prompt">{quizPrompt}</p>
                    <div className="cr-quiz-choices">
                        {quizChoices.map((choice, i) => {
                            const isSelected = selectedChoice === choice;
                            const isCorrectChoice = choice === quizAnswer;
                            let cls = 'cr-quiz-choice';
                            if (selectedChoice) {
                                if (isCorrectChoice) cls += ' correct';
                                else if (isSelected) cls += ' wrong';
                            }
                            return (
                                <motion.button
                                    key={i}
                                    className={cls}
                                    whileHover={!selectedChoice ? { scale: 1.02 } : {}}
                                    whileTap={!selectedChoice ? { scale: 0.98 } : {}}
                                    onClick={() => handleQuizSelect(choice)}
                                    disabled={!!selectedChoice}
                                >
                                    {phase.type === 'translation-check' ? (
                                        <span dir="rtl" className="cr-rtl-choice">{choice}</span>
                                    ) : choice}
                                </motion.button>
                            );
                        })}
                    </div>
                    <AnimatePresence>
                        {feedbackMsg && (
                            <motion.div
                                className={`cr-feedback ${feedbackCorrect ? 'correct' : 'wrong'}`}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                            >
                                {feedbackMsg}
                            </motion.div>
                        )}
                    </AnimatePresence>
                    {selectedChoice && (
                        <motion.button
                            className="cr-continue-btn"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            onClick={handleContinueAfterChallenge}
                        >
                            Continue →
                        </motion.button>
                    )}
                </motion.div>
            </div>
        );
    }

    // ─── RENDER: Word Order Challenge ─────────────────────────
    if (phase.type === 'word-order') {
        const currentTurn = turns[phase.turnIndex];
        return (
            <div className="cr-container">
                {renderChatHistory()}
                <motion.div
                    className="cr-quiz-panel"
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: 'spring', damping: 20 }}
                >
                    <div className="cr-quiz-badge">📝 Word Order Challenge</div>
                    <p className="cr-quiz-prompt">
                        Arrange the words to say: <em>"{currentTurn?.text.english}"</em>
                    </p>

                    {/* Selected words area */}
                    <div className="cr-word-order-answer" dir="rtl">
                        {wordOrderSelected.map((word, i) => (
                            <motion.button
                                key={`sel-${i}`}
                                className="cr-word-tile selected"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                onClick={() => handleWordSelectedTap(word, i)}
                            >
                                {word}
                            </motion.button>
                        ))}
                        {wordOrderSelected.length === 0 && (
                            <span className="cr-word-placeholder">Tap words below ↓</span>
                        )}
                    </div>

                    {/* Available words */}
                    <div className="cr-word-order-tiles" dir="rtl">
                        {wordOrderTiles.map((word, i) => (
                            <motion.button
                                key={`tile-${i}-${word}`}
                                className="cr-word-tile"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleWordTileTap(word, i)}
                            >
                                {word}
                            </motion.button>
                        ))}
                    </div>

                    <AnimatePresence>
                        {feedbackMsg && (
                            <motion.div
                                className={`cr-feedback ${feedbackCorrect ? 'correct' : 'wrong'}`}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                            >
                                {feedbackMsg}
                            </motion.div>
                        )}
                    </AnimatePresence>
                    {feedbackMsg && (
                        <motion.button
                            className="cr-continue-btn"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            onClick={handleContinueAfterChallenge}
                        >
                            Continue →
                        </motion.button>
                    )}
                </motion.div>
            </div>
        );
    }

    // ─── RENDER: Chat Phase (default) ──────────────────────────
    return (
        <div className="cr-container">
            {renderChatHistory()}
            <div className="cr-input-area">
                <AnimatePresence mode="popLayout">
                    {isTyping ? (
                        <motion.div
                            key="typing"
                            className="cr-typing-label"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            {turns[phase.type === 'chat' ? phase.turnIndex : 0]?.speaker === 'ai' ? 'Listening...' : 'Speaking...'}
                        </motion.div>
                    ) : null}
                </AnimatePresence>
            </div>
        </div>
    );

    // ─── Shared: Chat History ──────────────────────────────────
    function renderChatHistory() {
        return (
            <div className="cr-chat-area" ref={scrollRef}>
                <AnimatePresence initial={false}>
                    {revealedTurns.map((turnIdx) => {
                        const turn = turns[turnIdx];
                        if (!turn) return null;
                        const isUser = turn.speaker === 'user';

                        return (
                            <motion.div
                                key={`turn-${turnIdx}`}
                                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                                className={`cr-bubble-row ${isUser ? 'user' : 'ai'}`}
                            >
                                <div className={`cr-avatar ${isUser ? 'user' : 'ai'}`}>
                                    {isUser ? '👤' : '🤖'}
                                </div>
                                <div className={`cr-bubble ${isUser ? 'user' : 'ai'}`}>
                                    <DualTextDisplay text={turn.text} showLabels={false} />

                                    {/* Correction */}
                                    {turn.correction && (
                                        <motion.div
                                            className="cr-correction"
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            transition={{ delay: 0.8 }}
                                        >
                                            <div className="cr-correction-header">⚠️ Correction</div>
                                            <div className="cr-correction-wrong">
                                                You said: <span dir="rtl">{turn.correction.userSaid}</span>
                                            </div>
                                            <div className="cr-correction-right">
                                                Better: <span dir="rtl">{turn.correction.correctEgyptian}</span>
                                            </div>
                                            <div className="cr-correction-explain">{turn.correction.explanation}</div>
                                        </motion.div>
                                    )}

                                    {/* Pronunciation tip */}
                                    {turn.pronunciationTip && (
                                        <motion.div
                                            className="cr-tip"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: 1.2 }}
                                        >
                                            💡 {turn.pronunciationTip}
                                        </motion.div>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}

                    {/* Typing indicator */}
                    {isTyping && phase.type === 'chat' && (
                        <motion.div
                            key="typing-indicator"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className={`cr-bubble-row ${turns[phase.turnIndex]?.speaker === 'user' ? 'user' : 'ai'}`}
                        >
                            <div className={`cr-avatar ${turns[phase.turnIndex]?.speaker === 'user' ? 'user' : 'ai'}`}>
                                {turns[phase.turnIndex]?.speaker === 'user' ? '👤' : '🤖'}
                            </div>
                            <div className={`cr-bubble ${turns[phase.turnIndex]?.speaker === 'user' ? 'user' : 'ai'} typing`}>
                                <div className="cr-typing-dots">
                                    <motion.span animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 0.5, delay: 0 }} />
                                    <motion.span animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 0.5, delay: 0.15 }} />
                                    <motion.span animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 0.5, delay: 0.3 }} />
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    }
};
