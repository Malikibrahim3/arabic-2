import React, { useState } from 'react';
import { useLocation, useRoute } from 'wouter';
import { getCourseData, getAllExercises } from '../data/course';
import { useDialect } from '../context/DialectContext';
import { ExerciseSession } from '../components/exercises/ExerciseSession';
import { srsEngine } from '../data/srsEngine';
import { saveNodeProgress, getNodeProgress, recordSessionResult, loadStats, loadProgress } from '../data/progressStore';
import { difficultyEngine } from '../data/difficultyEngine';
import { achievementEngine, type Achievement } from '../data/achievementEngine';
import { Modal, ModalButton } from '../components/Modal';
import './LessonPage.css';

export const LessonPage: React.FC = () => {
    const [, setLocation] = useLocation();
    const [, params] = useRoute('/lesson/:id');
    const nodeId = params?.id;
    const [currentRound, setCurrentRound] = useState<number | null>(null);
    const [modalState, setModalState] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        type: 'info' | 'warning' | 'error' | 'success';
        onClose?: () => void;
    }>({ isOpen: false, title: '', message: '', type: 'info' });

    const { currentDialect } = useDialect();
    const course = getCourseData(currentDialect || 'msa');

    // Find the node
    let foundNode = null;

    if (nodeId === 'warmup') {
        const dueItems = srsEngine.getDueItems();
        const allEx = getAllExercises(currentDialect || 'msa');
        const rawExercises = dueItems.map(item => allEx.find((e: any) => e.id === item.id)).filter(Boolean) as any[];
        const warmupExercises = [...rawExercises].sort(() => Math.random() - 0.5).slice(0, 10);

        foundNode = {
            id: 'warmup',
            title: 'Daily Warm-up',
            description: 'Review your unstable knowledge',
            type: 'lesson',
            status: 'active',
            isGate: false,
            totalRounds: 1,
            completedRounds: 0,
            lessons: [{
                id: 'warmup-1',
                title: 'Review Queue',
                description: 'Clear the queue to strengthen memory',
                exercises: warmupExercises
            }]
        } as any;
    } else {
        for (const unit of course.units) {
            for (const node of unit.nodes) {
                if (node.id === nodeId) {
                    foundNode = node;
                    break;
                }
            }
            if (foundNode) break;
        }
    }

    // Apply persisted progress to the found node
    if (foundNode && nodeId !== 'warmup') {
        const saved = getNodeProgress(foundNode.id);
        if (saved) {
            foundNode.completedRounds = Math.max(foundNode.completedRounds, saved.completedRounds);
            if (saved.status === 'completed') foundNode.status = 'completed';
            if (saved.masteryState) foundNode.masteryState = saved.masteryState;
            if (saved.masteryScore !== undefined) foundNode.masteryScore = saved.masteryScore;
        }
    }

    if (!foundNode) {
        return (
            <div className="lesson-page">
                <div className="lesson-not-found">
                    <h2>Lesson not found</h2>
                    <button className="btn btn-primary" onClick={() => setLocation('/')}>Go Back</button>
                </div>
            </div>
        );
    }

    const nextRound = foundNode.completedRounds;
    const totalRounds = foundNode.totalRounds;
    const hasLessons = foundNode.lessons.length > 0;

    // If a round is active, show that round's exercises
    if (currentRound !== null && hasLessons && currentRound < foundNode.lessons.length) {
        const roundLesson = foundNode.lessons[currentRound];
        let sessionExercises = [...roundLesson.exercises];

        // ─── Phase 5: Surprise Cross-Stage Review Injection ───
        if (nodeId !== 'warmup' && foundNode.type !== 'test') {
            const dueItems = srsEngine.getDueItems();
            if (dueItems.length > 0) {
                const allEx = getAllExercises(currentDialect || 'msa');
                const randomDue = dueItems[Math.floor(Math.random() * dueItems.length)];
                const surpriseEx = allEx.find((e: any) => e.id === randomDue.id);
                if (surpriseEx && !sessionExercises.some(e => e.id === surpriseEx.id)) {
                    sessionExercises.unshift({
                        ...surpriseEx,
                        id: surpriseEx.id + '-surprise',
                        prompt: '🧠 Surprise Review: ' + surpriseEx.prompt
                    });
                }
            }
        }

        // ─── Regression-triggered review injection ───
        // If this node was in regression, inject extra exercises from weak areas  
        if (foundNode.masteryState === 'regression') {
            const allEx = getAllExercises(currentDialect || 'msa');
            const stats = loadStats();
            const weakPhonemes = Object.entries(stats.phonemeStats)
                .filter(([_, data]) => {
                    const total = data.correct + data.wrong;
                    return total >= 2 && data.correct / total < 0.6;
                })
                .map(([phoneme]) => phoneme)
                .slice(0, 3);

            if (weakPhonemes.length > 0) {
                const weakExercises = allEx
                    .filter((e: any) => weakPhonemes.some(p =>
                        e.correctAnswer?.includes(p) || e.hint?.includes(p) || e.prompt?.includes(p)
                    ))
                    .slice(0, 3);

                weakExercises.forEach((ex: any, i: number) => {
                    if (!sessionExercises.some(e => e.id === ex.id)) {
                        sessionExercises.splice(
                            Math.min(2 + i * 3, sessionExercises.length),
                            0,
                            { ...ex, id: ex.id + '-regression-review', prompt: '🔄 Review: ' + ex.prompt }
                        );
                    }
                });
            }
        }

        return (
            <>
                <ExerciseSession
                    exercises={sessionExercises}
                    isTest={foundNode.type === 'test'}
                    onComplete={(results) => {
                        if (nodeId === 'warmup') {
                            recordSessionResult(results.correct, results.total);
                            setLocation('/');
                            return;
                        }

                        const accuracy = results.total > 0 ? Math.round((results.correct / results.total) * 100) : 100;

                        // Update mastery state metrics
                        foundNode!.masteryScore = accuracy;

                        if (accuracy >= 85) {
                            foundNode!.masteryState = 'mastered';
                        } else if (accuracy >= 70) {
                            foundNode!.masteryState = 'learning';
                        } else {
                            foundNode!.masteryState = 'regression';
                        }

                        // Mark round complete
                        foundNode!.completedRounds = currentRound + 1;

                        if (currentRound + 1 >= totalRounds) {
                            if (accuracy >= 85) {
                                foundNode!.status = 'completed';
                            } else {
                                foundNode!.status = 'active';
                                // Reset to replay the last round on regression
                                if (accuracy < 70) {
                                    foundNode!.completedRounds = Math.max(0, currentRound);
                                }
                                setModalState({
                                    isOpen: true,
                                    title: accuracy < 70 ? 'Regression Detected' : 'Keep Practicing',
                                    message: accuracy < 70
                                        ? `You scored ${accuracy}%. Performance dropped below 70%, so this round has been reset. Review the material and try again to master it.`
                                        : `You scored ${accuracy}%. You need 85% to master this lesson and unlock the next. Keep practicing!`,
                                    type: accuracy < 70 ? 'error' : 'warning',
                                });
                            }
                        }

                        // Persist progress to localStorage
                        saveNodeProgress(foundNode!.id, {
                            completedRounds: foundNode!.completedRounds,
                            status: foundNode!.status as any,
                            masteryState: foundNode!.masteryState,
                            masteryScore: accuracy,
                            lastAttemptDate: new Date().toISOString(),
                        });

                        recordSessionResult(results.correct, results.total);

                        // AF9: Check achievements
                        const stats = loadStats();
                        const newAch = achievementEngine.checkAndUnlock({
                            totalExercises: stats.totalExercisesCompleted,
                            totalLessons: Object.keys(loadProgress()).length,
                            currentStreak: stats.currentStreak,
                            hasPerfectPronunciation: accuracy === 100,
                            hasSpeaking: true,
                            hasConversation: false,
                            conversationCount: 0,
                            hasMastery: foundNode!.masteryState === 'mastered',
                            accuracy,
                            difficultyTier: difficultyEngine.getTier(),
                        });
                        if (newAch.length > 0) {
                            setModalState({
                                isOpen: true,
                                title: '🏆 Achievement Unlocked!',
                                message: newAch.map((a: Achievement) => `${a.icon} ${a.title} — ${a.description}`).join('\n'),
                                type: 'success',
                            });
                        }

                        setCurrentRound(null);
                    }}
                    onQuit={() => setLocation('/')}
                />
                <Modal
                    isOpen={modalState.isOpen}
                    onClose={() => {
                        setModalState(prev => ({ ...prev, isOpen: false }));
                        if (modalState.onClose) modalState.onClose();
                    }}
                    title={modalState.title}
                    type={modalState.type}
                    actions={
                        <ModalButton onClick={() => setModalState(prev => ({ ...prev, isOpen: false }))}>
                            Got It
                        </ModalButton>
                    }
                >
                    <p>{modalState.message}</p>
                </Modal>
            </>
        );
    }

    const letters = foundNode.skillLetters || [];

    // Show regression badge
    const isRegressed = foundNode.masteryState === 'regression';
    const masteryBadge = foundNode.masteryState === 'mastered' ? '✅ Mastered'
        : foundNode.masteryState === 'learning' ? '📝 Learning'
            : isRegressed ? '🔄 Needs Review' : null;

    // Intro screen with round selector
    return (
        <div className="lesson-page">
            <div className="lesson-content">
                <button className="lesson-back-btn" onClick={() => setLocation('/')}>
                    ← Back
                </button>

                <div className="lesson-intro">
                    <div className="lesson-letters-display">
                        {letters.map((l: string, i: number) => (
                            <span key={i} className="lesson-letter-char">{l}</span>
                        ))}
                    </div>
                    <h2 className="lesson-title">{foundNode.description}</h2>
                    <p className="lesson-subtitle">
                        {letters.length > 0 ? `${letters.length} letters · ` : ''}{totalRounds} rounds
                    </p>
                    {masteryBadge && (
                        <div style={{
                            marginTop: '8px',
                            padding: '6px 16px',
                            borderRadius: '20px',
                            fontSize: '13px',
                            fontWeight: 600,
                            display: 'inline-block',
                            background: isRegressed ? 'rgba(239, 68, 68, 0.15)' :
                                foundNode.masteryState === 'mastered' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                            color: isRegressed ? '#F87171' :
                                foundNode.masteryState === 'mastered' ? '#4ADE80' : '#FBBF24',
                            border: `1px solid ${isRegressed ? '#EF444440' : foundNode.masteryState === 'mastered' ? '#22C55E40' : '#F59E0B40'}`,
                        }}>
                            {masteryBadge}
                            {foundNode.masteryScore !== undefined && ` (${foundNode.masteryScore}%)`}
                        </div>
                    )}
                </div>

                {/* Round selector */}
                <div className="round-list">
                    {Array.from({ length: totalRounds }, (_, i) => {
                        const isComplete = i < nextRound;
                        const isCurrent = i === nextRound;

                        const isGodMode = localStorage.getItem('godMode') === 'true';
                        let isLocked = i > nextRound;
                        if (isGodMode) {
                            isLocked = false;
                        }

                        // Regression: force replay of last round
                        const isRegressionReplay = isRegressed && i === nextRound;

                        const roundTitle = foundNode!.lessons[i]?.title || `Round ${i + 1}`;
                        const roundStatus = isComplete ? 'Complete' : (isLocked ? 'Locked' : (isRegressionReplay ? '🔄 Review Required' : (isCurrent ? 'Start' : 'Available')));

                        return (
                            <button
                                key={i}
                                className={`round-item ${isComplete ? 'complete' : ''} ${isCurrent && !isGodMode ? 'current' : ''} ${isLocked ? 'locked' : ''} ${isRegressionReplay ? 'regression' : ''}`}
                                onClick={() => {
                                    if (!isLocked) {
                                        setCurrentRound(i);
                                    }
                                }}
                                disabled={isLocked}
                            >
                                <div className="round-number">{isComplete ? '✓' : i + 1}</div>
                                <div className="round-info">
                                    <span className="round-title">{roundTitle}</span>
                                    <span className={`round-status ${isRegressionReplay ? 'regression-status' : ''}`}>{roundStatus}</span>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
