import React, { useState, useCallback, useEffect } from 'react';
import { X, Heart, CheckCircle, XCircle, Volume2 } from 'lucide-react';
import type { Exercise } from '../../data/types';
import { useAudio } from '../../hooks/useAudio';
import { MatchPairs } from './MatchPairs';
import { TrapSelect } from './TrapSelect';
import { WordAssembly } from './WordAssembly';
import { SentenceAssembly } from './SentenceAssembly';
import './ExerciseSession.css';

interface ExerciseSessionProps {
    exercises: Exercise[];
    isTest?: boolean;
    onComplete: (results: { correct: number; total: number }) => void;
    onQuit: () => void;
}

function shuffle<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

// Add distractor pieces to make assembly exercises more challenging
function addDistractors(choices: string[], correctAnswer: string, exerciseType: string): string[] {
    // For word assembly, if we have too few pieces (2 or less), add distractors
    if (exerciseType === 'word_assembly' && choices.length <= 2) {
        const distractors: string[] = [];
        const arabicLetters = ['ا', 'ب', 'ت', 'ث', 'ج', 'ح', 'خ', 'د', 'ذ', 'ر', 'ز', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ع', 'غ', 'ف', 'ق', 'ك', 'ل', 'م', 'ن', 'ه', 'و', 'ي'];
        
        // Add 2-3 distractor letters that aren't in the correct answer
        const needed = Math.max(0, 4 - choices.length); // Aim for 4-5 total pieces
        let attempts = 0;
        while (distractors.length < needed && attempts < 50) {
            const candidate = arabicLetters[Math.floor(Math.random() * arabicLetters.length)];
            if (!correctAnswer.includes(candidate) && !choices.includes(candidate) && !distractors.includes(candidate)) {
                distractors.push(candidate);
            }
            attempts++;
        }
        
        return shuffle([...choices, ...distractors]);
    }
    
    // For sentence assembly with 2 words, add a distractor word
    if (exerciseType === 'sentence_assembly' && choices.length === 2) {
        const distractorWords = ['في', 'من', 'إلى', 'على', 'هو', 'هي', 'أنا', 'أنت'];
        const distractors: string[] = [];
        
        for (const word of distractorWords) {
            if (!choices.includes(word) && !correctAnswer.includes(word)) {
                distractors.push(word);
                break; // Just add one distractor
            }
        }
        
        return shuffle([...choices, ...distractors]);
    }
    
    return choices;
}

type FeedbackState = null | 'correct' | 'incorrect';

export const ExerciseSession: React.FC<ExerciseSessionProps> = ({ exercises: initialExercises, isTest = false, onComplete, onQuit }) => {
    const [exerciseQueue, setExerciseQueue] = useState<Exercise[]>([...initialExercises]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [hearts, setHearts] = useState(5);
    const [correctCount, setCorrectCount] = useState(0);
    const [totalAnswered, setTotalAnswered] = useState(0);
    const [selected, setSelected] = useState<string | null>(null);
    const [feedback, setFeedback] = useState<FeedbackState>(null);
    const [shuffledChoices, setShuffledChoices] = useState<string[]>(() => {
        const choices = initialExercises[0]?.choices || [];
        const enhanced = addDistractors(choices, initialExercises[0]?.correctAnswer || '', initialExercises[0]?.type || '');
        return shuffle(enhanced);
    });
    const [sessionDone, setSessionDone] = useState(false);
    const [failedQueue, setFailedQueue] = useState<Exercise[]>([]);
    const [isReviewPhase, setIsReviewPhase] = useState(false);
    const [showMistakeInterstitial, setShowMistakeInterstitial] = useState(false);

    const { play } = useAudio();

    const exercise = exerciseQueue[currentIndex];
    const gradedExercises = exerciseQueue.filter(e => e.type !== 'introduction');
    const gradedSoFar = exerciseQueue.slice(0, currentIndex).filter(e => e.type !== 'introduction').length;
    let progress = gradedExercises.length > 0 ? (gradedSoFar / gradedExercises.length) * 100 : 0;
    if (isReviewPhase) {
        progress = (currentIndex / exerciseQueue.length) * 100;
    }

    // Auto-play audio for intro cards and hear_choose exercises
    useEffect(() => {
        if (!exercise) return;
        if (exercise.type === 'introduction' && (exercise.promptAudio || exercise.correctAnswer)) {
            const timer = setTimeout(() => play(exercise.promptAudio || exercise.correctAnswer), 500);
            return () => clearTimeout(timer);
        }
        if (exercise.promptAudio) {
            const timer = setTimeout(() => play(exercise.promptAudio!), 400);
            return () => clearTimeout(timer);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentIndex]);

    const playAudio = useCallback(() => {
        if (!exercise) return;
        if (exercise.promptAudio) play(exercise.promptAudio);
        else if (exercise.correctAnswer) play(exercise.correctAnswer);
    }, [exercise, play]);

    const advanceToNext = useCallback(() => {
        const nextIndex = currentIndex + 1;
        if (hearts <= 0) {
            setSessionDone(true);
            return;
        }
        if (nextIndex >= exerciseQueue.length) {
            if (failedQueue.length > 0) {
                setShowMistakeInterstitial(true);
                setExerciseQueue(shuffle([...failedQueue]));
                setFailedQueue([]);
                setCurrentIndex(0);
                setIsReviewPhase(true);
                return;
            }
            setSessionDone(true);
            return;
        }
        setCurrentIndex(nextIndex);
        setSelected(null);
        setFeedback(null);
        const nextChoices = exerciseQueue[nextIndex]?.choices || [];
        const nextAnswer = exerciseQueue[nextIndex]?.correctAnswer || '';
        const nextType = exerciseQueue[nextIndex]?.type || '';
        const enhanced = addDistractors(nextChoices, nextAnswer, nextType);
        setShuffledChoices(shuffle(enhanced));
    }, [currentIndex, hearts, exerciseQueue, failedQueue]);

    const handleSelect = useCallback((choice: string) => {
        if (feedback !== null || selected !== null) return;
        setSelected(choice);

        const isCorrect = choice === exercise.correctAnswer;
        if (isCorrect) {
            setFeedback('correct');
            setCorrectCount(c => c + 1);
        } else {
            setFeedback('incorrect');
            setHearts(h => h - 1);

            if (!isReviewPhase) {
                const baseId = exercise.id.replace(/-retry$/, '');
                setFailedQueue(prev => {
                    if (prev.some(e => e.id.startsWith(baseId))) return prev;
                    return [...prev, { ...exercise, id: baseId }];
                });

                // Immediate retry for spaced repetition
                setExerciseQueue(prev => {
                    const copy = [...prev];
                    const retry = { ...exercise, id: exercise.id + '-retry' };
                    const insertAt = Math.min(currentIndex + 4, copy.length);
                    copy.splice(insertAt, 0, retry);
                    return copy;
                });
            } else {
                // In review phase, push failed items to the end of the current queue
                setExerciseQueue(prev => [...prev, { ...exercise, id: exercise.id + '-review-retry' }]);
            }
        }
        setTotalAnswered(t => t + 1);
    }, [feedback, selected, exercise, currentIndex, isReviewPhase]);

    const handleMatchPairsComplete = useCallback(() => {
        setCorrectCount(c => c + 1);
        setTotalAnswered(t => t + 1);
        setTimeout(advanceToNext, 400);
    }, [advanceToNext]);

    const handleWordAssemblyComplete = useCallback((isCorrect: boolean) => {
        if (isCorrect) {
            setCorrectCount(c => c + 1);
        } else {
            setHearts(h => h - 1);
            if (!isReviewPhase) {
                const baseId = exercise.id.replace(/-retry$/, '');
                setFailedQueue(prev => {
                    if (prev.some(e => e.id.startsWith(baseId))) return prev;
                    return [...prev, { ...exercise, id: baseId }];
                });

                setExerciseQueue(prev => {
                    const copy = [...prev];
                    const retry = { ...exercise, id: exercise.id + '-retry' };
                    const insertAt = Math.min(currentIndex + 4, copy.length);
                    copy.splice(insertAt, 0, retry);
                    return copy;
                });
            } else {
                setExerciseQueue(prev => [...prev, { ...exercise, id: exercise.id + '-review-retry' }]);
            }
        }
        setTotalAnswered(t => t + 1);
        advanceToNext();
    }, [exercise, isReviewPhase, advanceToNext, currentIndex]);

    const handleSentenceAssemblyComplete = useCallback((isCorrect: boolean) => {
        if (isCorrect) {
            setCorrectCount(c => c + 1);
        } else {
            setHearts(h => h - 1);
            if (!isReviewPhase) {
                const baseId = exercise.id.replace(/-retry$/, '');
                setFailedQueue(prev => {
                    if (prev.some(e => e.id.startsWith(baseId))) return prev;
                    return [...prev, { ...exercise, id: baseId }];
                });

                setExerciseQueue(prev => {
                    const copy = [...prev];
                    const retry = { ...exercise, id: exercise.id + '-retry' };
                    const insertAt = Math.min(currentIndex + 4, copy.length);
                    copy.splice(insertAt, 0, retry);
                    return copy;
                });
            } else {
                setExerciseQueue(prev => [...prev, { ...exercise, id: exercise.id + '-review-retry' }]);
            }
        }
        setTotalAnswered(t => t + 1);
        advanceToNext();
    }, [exercise, isReviewPhase, advanceToNext, currentIndex]);

    // ─── Session Complete ───────────────────────────────────
    if (showMistakeInterstitial) {
        return (
            <div className="exercise-session">
                <div className="session-complete mistake-interstitial">
                    <div className="complete-emoji">🔄</div>
                    <h2 className="complete-title">Let's review the ones you missed!</h2>
                    <p style={{ color: '#aaa', fontSize: '18px', marginBottom: '32px' }}>
                        Practice makes perfect. Clear these to finish the round.
                    </p>
                    <button className="complete-continue-btn" onClick={() => {
                        setShowMistakeInterstitial(false);
                        const firstChoices = exerciseQueue[0]?.choices || [];
                        const firstAnswer = exerciseQueue[0]?.correctAnswer || '';
                        const firstType = exerciseQueue[0]?.type || '';
                        const enhanced = addDistractors(firstChoices, firstAnswer, firstType);
                        setShuffledChoices(shuffle(enhanced));
                    }}>
                        Let's Go
                    </button>
                </div>
            </div>
        );
    }

    if (sessionDone) {
        const total = totalAnswered;
        const accuracy = total > 0 ? Math.round((correctCount / total) * 100) : 0;

        // If it was a test and the user dropped to 0 hearts, force a strict quit
        if (isTest && hearts <= 0) {
            return (
                <div className="exercise-session">
                    <div className="session-complete">
                        <div className="complete-emoji">💔</div>
                        <h2 className="complete-title" style={{ color: 'var(--color-danger)' }}>
                            Test Failed!
                        </h2>
                        <p style={{ color: 'var(--color-text-light)', fontSize: '20px', marginBottom: '32px', textAlign: 'center' }}>
                            You ran out of hearts. You must complete the test with at least 1 heart to pass.
                        </p>
                        <button className="complete-continue-btn" style={{ background: 'var(--color-surface)', color: 'var(--color-text-main)', border: '2px solid var(--color-border)' }} onClick={onQuit}>
                            Try Again Later
                        </button>
                    </div>
                </div>
            );
        }

        return (
            <div className="exercise-session">
                <div className="session-complete">
                    <div className="complete-emoji">{hearts > 0 ? '🎉' : '💔'}</div>
                    <h2 className="complete-title">
                        {hearts > 0 ? 'Round Complete!' : 'Out of Hearts!'}
                    </h2>
                    <div className="complete-stats">
                        <div className="stat-item">
                            <span className="stat-value">{accuracy}%</span>
                            <span className="stat-label">Accuracy</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-value">{correctCount}/{total}</span>
                            <span className="stat-label">Correct</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-value">+{correctCount * 10}</span>
                            <span className="stat-label">XP</span>
                        </div>
                    </div>
                    <button className="complete-continue-btn" onClick={() => onComplete({ correct: correctCount, total })}>
                        Continue
                    </button>
                </div>
            </div>
        );
    }

    if (!exercise) return null;

    const headerBar = (
        <div className="session-header">
            <button className="session-close-btn" onClick={onQuit}><X size={24} /></button>
            <div className="session-progress-bar">
                <div className="session-progress-fill" style={{ width: `${progress}%` }}></div>
            </div>
            <div className="session-hearts">
                <Heart size={20} fill="#FF4B4B" color="#FF4B4B" />
                <span>{hearts}</span>
            </div>
        </div>
    );

    // ─── Match Pairs ────────────────────────────────────────
    if (exercise.type === 'match_pairs' && exercise.pairs) {
        return (
            <div className="exercise-session">
                {headerBar}
                <div className="exercise-area">
                    <MatchPairs
                        prompt={exercise.prompt}
                        pairs={exercise.pairs}
                        onComplete={handleMatchPairsComplete}
                    />
                </div>
            </div>
        );
    }

    // ─── Trap Select ────────────────────────────────────────
    if (exercise.type === 'trap_select') {
        const doSelect = (choice: string | null) => {
            if (feedback !== null || selected !== null) return;
            setSelected(choice || 'TIMEOUT');
            const isCorrect = choice === exercise.correctAnswer;
            if (isCorrect) {
                setFeedback('correct');
                setCorrectCount(c => c + 1);
                playAudio();
            } else {
                setFeedback('incorrect');
                setHearts(h => h - 1);
                if (!isReviewPhase) {
                    const baseId = exercise.id.replace(/-retry$/, '');
                    setFailedQueue(prev => {
                        if (prev.some(e => e.id.startsWith(baseId))) return prev;
                        return [...prev, { ...exercise, id: baseId }];
                    });
                } else {
                    setExerciseQueue(prev => [...prev, { ...exercise, id: exercise.id + '-review-retry' }]);
                }
            }
            setTotalAnswered(t => t + 1);
        };

        return (
            <div className="exercise-session">
                {headerBar}
                <TrapSelect
                    exercise={exercise}
                    shuffledChoices={shuffledChoices}
                    selected={selected}
                    feedback={feedback}
                    onSelect={doSelect}
                    onContinue={advanceToNext}
                    onPlayAudio={exercise.promptAudio ? playAudio : undefined}
                />
            </div>
        );
    }

    // ─── Word Assembly ────────────────────────────────────────
    if (exercise.type === 'word_assembly') {
        return (
            <div className="exercise-session">
                {headerBar}
                <WordAssembly
                    key={exercise.id}
                    exercise={exercise}
                    shuffledParts={shuffledChoices}
                    onComplete={handleWordAssemblyComplete}
                />
            </div>
        );
    }

    // ─── Sentence Assembly ────────────────────────────────────
    if (exercise.type === 'sentence_assembly') {
        return (
            <div className="exercise-session">
                {headerBar}
                <SentenceAssembly
                    key={exercise.id}
                    exercise={exercise}
                    shuffledWords={shuffledChoices}
                    onComplete={handleSentenceAssemblyComplete}
                />
            </div>
        );
    }

    // ─── Introduction Card & Philosophy ─────────────────────
    if (exercise.type === 'introduction' || exercise.type === 'intro-trap-philosophy' as any) {
        if (exercise.type === 'intro-trap-philosophy' as any) {
            return (
                <div className="exercise-session">
                    {headerBar}
                    <div className="exercise-area intro-card-area" style={{ maxWidth: '800px' }}>
                        <div className="intro-card" style={{ textAlign: 'left', padding: '40px' }}>
                            <div className="intro-new-badge" style={{ backgroundColor: '#FF4B4B' }}>🪤 THE PHILOSOPHY</div>
                            <h2 style={{ fontSize: '32px', marginBottom: '16px', color: 'var(--color-danger)' }}>
                                The Trapdoor Challenge
                            </h2>
                            <p style={{ fontSize: '18px', color: 'var(--color-text-main)', lineHeight: '1.6', marginBottom: '24px' }}>
                                Confusable traps are not designed to be cruel. They are designed to force conscious attention to the exact feature — a dot, a curve, a position — that distinguishes similar items.
                            </p>
                            <p style={{ fontSize: '18px', color: 'var(--color-text-main)', lineHeight: '1.6', marginBottom: '32px' }}>
                                A learner who passes a trap genuinely knows the difference. A learner who fails is caught immediately, shown the specific explanation for why they were wrong, and retested before the session ends.
                            </p>

                            <h3 style={{ fontSize: '24px', marginBottom: '16px', color: '#333' }}>The Three Types of Confusables</h3>
                            <ul style={{ listStyleType: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <li style={{ background: '#F8F9FA', padding: '16px', borderRadius: '12px', borderLeft: '4px solid #FF4B4B' }}>
                                    <strong style={{ fontSize: '20px' }}>🔴 Dot Variants:</strong> Same base shape, different dots. The entire meaning changes... only the dots differ.
                                </li>
                                <li style={{ background: '#F8F9FA', padding: '16px', borderRadius: '12px', borderLeft: '4px solid #FFC107' }}>
                                    <strong style={{ fontSize: '20px' }}>🟡 Similar Shapes:</strong> Same curved body. Easy to confuse when moving fast.
                                </li>
                                <li style={{ background: '#F8F9FA', padding: '16px', borderRadius: '12px', borderLeft: '4px solid #2196F3' }}>
                                    <strong style={{ fontSize: '20px' }}>🔵 Phonetic Pairs:</strong> Visually distinct entirely, but similar sounds.
                                </li>
                            </ul>

                            <button className="intro-continue-btn" style={{ marginTop: '32px', width: '100%', maxWidth: 'none', backgroundColor: 'var(--color-danger)', boxShadow: '0 6px 0 #cc3c3c' }} onClick={advanceToNext}>
                                I'm Ready
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        const parts = exercise.prompt.split(/\*\*(.*?)\*\*/);
        const hintLines = (exercise.hint || '').split('\n').filter(Boolean);
        return (
            <div className="exercise-session">
                {headerBar}
                <div className="exercise-area intro-card-area">
                    <div className="intro-card">
                        <div className="intro-new-badge">NEW</div>
                        {exercise.correctAnswer && (
                            <div className="intro-letter-display">{exercise.correctAnswer}</div>
                        )}
                        <div className="intro-prompt">
                            {parts.map((part, i) =>
                                i % 2 === 1 ? <strong key={i}>{part}</strong> : <span key={i}>{part}</span>
                            )}
                        </div>
                        <div className="intro-hint-lines">
                            {hintLines.map((line, i) => (
                                <p key={i} className="intro-hint-line">{line}</p>
                            ))}
                        </div>
                        {(exercise.promptAudio || exercise.correctAnswer) && (
                            <button className="intro-audio-btn" onClick={() => {
                                play(exercise.promptAudio || exercise.correctAnswer);
                            }}>
                                <Volume2 size={24} />
                                <span>Listen</span>
                            </button>
                        )}
                    </div>
                    <button className="intro-continue-btn" onClick={advanceToNext}>
                        Got it!
                    </button>
                </div>
            </div>
        );
    }

    // ─── Graded Exercise ────────────────────────────────────
    const showHero = exercise.hint && exercise.hint !== 'odd_one_out';
    const isAudioExercise = exercise.type === 'hear_choose';

    return (
        <div className="exercise-session">
            {headerBar}
            <div className="exercise-area">
                {isAudioExercise && (
                    <button className="audio-play-btn" onClick={playAudio}>
                        <Volume2 size={48} />
                    </button>
                )}
                {showHero && !isAudioExercise && (
                    <div className="exercise-letter-hero">{exercise.hint}</div>
                )}
                <div className="exercise-prompt">{exercise.prompt}</div>
                <div className={`choices-grid ${shuffledChoices.length === 3 ? 'three-choices' : ''} ${shuffledChoices.length === 2 ? 'two-choices' : ''}`}>
                    {shuffledChoices.map((choice, i) => {
                        let cls = 'choice-btn';
                        if (feedback !== null && choice === selected) {
                            cls += feedback === 'correct' ? ' correct' : ' incorrect';
                        } else if (feedback !== null && choice === exercise.correctAnswer) {
                            cls += ' correct';
                        }
                        return (
                            <button key={`${choice}-${i}`} className={cls} onClick={() => handleSelect(choice)} disabled={feedback !== null}>
                                {choice}
                            </button>
                        );
                    })}
                </div>
            </div>
            {feedback && (
                <div className={`feedback-banner ${feedback}`}>
                    <div className="feedback-title">
                        {feedback === 'correct' ? <><CheckCircle size={24} /> Correct!</> : <><XCircle size={24} /> Incorrect</>}
                    </div>
                    {feedback === 'incorrect' && (
                        <div className="feedback-detail">Correct answer: <strong>{exercise.correctAnswer}</strong></div>
                    )}
                    <button className="feedback-continue-btn" onClick={advanceToNext}>Continue</button>
                </div>
            )}
        </div>
    );
};
