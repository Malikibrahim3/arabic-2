import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { saveNodeProgress, saveStats, loadStats } from '../data/progressStore';
import { getCourseData } from '../data/course';
import { useDialect } from '../context/DialectContext';
import './OnboardingPage.css'; // Reuse styles

// ─── 10 Questions for Placement Test ─────────
const PLACEMENT_QUESTIONS = [
    {
        q: 'Which letter corresponds to the "B" sound?',
        options: ['ت', 'ب', 'ث', 'ن'],
        answer: 1
    },
    {
        q: 'Which letter corresponds to the "S" sound?',
        options: ['ش', 'ص', 'س', 'ث'],
        answer: 2
    },
    {
        q: 'How do you say "Hello" / "Welcome" in Arabic?',
        options: ['أهلاً', 'شكراً', 'سلام', 'مع السلامة'],
        answer: 0
    },
    {
        q: 'What is the literal meaning of "شكراً"?',
        options: ['Yes', 'Thank you', 'Please', 'Sorry'],
        answer: 1
    },
    {
        q: 'Which of the following means "House"?',
        options: ['باب', 'بنت', 'بيت', 'سيارة'],
        answer: 2
    },
    {
        q: 'How do you say "How are you?" (Egyptian or MSA)',
        options: ['كيف حالك؟ / إزيك؟', 'ما اسمك؟', 'من أين أنت؟', 'بكم هذا؟'],
        answer: 0
    },
    {
        q: 'Translate "I want coffee" into Arabic:',
        options: ['أنا أريد شاي', 'أنا أريد قهوة', 'أنا أحب الماء', 'ليس عندي قهوة'],
        answer: 1
    },
    {
        q: 'Which of the following contains the definite article "Al-" (ال)?',
        options: ['أحمد', 'الكتاب', 'مدرسة', 'صديق'],
        answer: 1
    },
    {
        q: 'What does "انا من مصر" mean?',
        options: ['I am going to Egypt', 'I am from Egypt', 'He is from Egypt', 'I love Egypt'],
        answer: 1
    },
    {
        q: 'Which phrase is used to say "God willing" / "Hopefully"?',
        options: ['ما شاء الله', 'إن شاء الله', 'الحمد لله', 'بسم الله'],
        answer: 1
    }
];

export const PlacementTestPage: React.FC = () => {
    const { currentDialect } = useDialect();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [finished, setFinished] = useState(false);

    const handleAnswer = (optionIdx: number) => {
        const correct = optionIdx === PLACEMENT_QUESTIONS[currentIndex].answer;
        if (correct) {
            setScore(s => s + 1);
        }

        if (currentIndex < PLACEMENT_QUESTIONS.length - 1) {
            setCurrentIndex(i => i + 1);
        } else {
            handleComplete(score + (correct ? 1 : 0));
        }
    };

    const handleComplete = (finalScore: number) => {
        setFinished(true);

        // Map score to CEFR unlocked nodes
        // 0-3  -> A0 (Start at Unit 1)
        // 4-6  -> A1 (Unlock Unit 1, start at Unit 2)
        // 7-10 -> A2 (Unlock Unit 1 & 2, start at Unit 3)

        const courseStr = getCourseData(currentDialect || 'msa');
        const unitsToUnlock: string[] = finalScore >= 7 ? ['1', '2'] : finalScore >= 4 ? ['1'] : [];

        // Unlock logic
        if (unitsToUnlock.length > 0) {
            const stats = loadStats();
            let nodesUnlocked = 0;

            for (const u of courseStr.units) {
                // If the unit ID maps to something we should unlock
                const isUnit1 = u.id === '1' || u.id === '10';
                const isUnit2 = u.id === '2' || u.id === '11';

                if ((unitsToUnlock.includes('1') && isUnit1) || (unitsToUnlock.includes('2') && isUnit2)) {
                    for (const n of u.nodes) {
                        saveNodeProgress(n.id, { status: 'completed', completedRounds: 3, masteryState: 'mastered', masteryScore: 2.5 });
                        nodesUnlocked++;
                    }
                }
            }
            stats.totalExercisesCompleted += nodesUnlocked * 10;
            stats.totalCorrect += nodesUnlocked * 9;
            saveStats(stats);
        }
    };

    const getPlacementResultTitle = () => {
        if (score >= 7) return 'Intermediate Level (A2/B1)';
        if (score >= 4) return 'Beginner Level (A1)';
        return 'Absolute Beginner (A0)';
    };

    const getPlacementResultDesc = () => {
        if (score >= 7) return 'Great job! You already know the alphabet, basic grammar, and common phrases. We\'ve unlocked the introductory units so you can jump right into more advanced vocabulary and grammar.';
        if (score >= 4) return 'Nice! You know the basics of the alphabet and some essential words. We\'ve skipped the first unit for you so you can move faster.';
        return 'Welcome! We\'ll start from the very beginning with the alphabet and sounds. You\'ll be reading and speaking in no time.';
    };

    if (finished) {
        return (
            <div className="onboarding-page" style={{ justifyContent: 'center' }}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{ textAlign: 'center', background: 'rgba(255,255,255,0.05)', padding: '40px', borderRadius: '24px', maxWidth: '400px' }}
                >
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏆</div>
                    <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px', color: '#fff' }}>
                        {getPlacementResultTitle()}
                    </h1>
                    <div style={{ color: '#4ADE80', fontWeight: 600, fontSize: '18px', marginBottom: '16px' }}>
                        Score: {score} / 10
                    </div>
                    <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '15px', lineHeight: 1.6, marginBottom: '32px' }}>
                        {getPlacementResultDesc()}
                    </p>
                    <button
                        onClick={() => window.location.href = '/'}
                        style={{
                            background: '#818CF8', padding: '16px 32px', border: 'none', borderRadius: '16px', color: 'white', fontWeight: 700, fontSize: '16px', cursor: 'pointer', width: '100%'
                        }}
                    >
                        Start Learning
                    </button>
                </motion.div>
            </div>
        );
    }

    const q = PLACEMENT_QUESTIONS[currentIndex];

    return (
        <div className="onboarding-page">
            <div style={{ position: 'absolute', top: '24px', left: '24px', right: '24px', display: 'flex', justifyContent: 'space-between', color: 'rgba(255,255,255,0.5)', fontSize: '14px', fontWeight: 600 }}>
                <span>Placement Test</span>
                <span>{currentIndex + 1} / {PLACEMENT_QUESTIONS.length}</span>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    style={{ width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '24px' }}
                >
                    <h2 style={{ fontSize: '24px', color: '#fff', fontWeight: 600, textAlign: 'center', lineHeight: 1.4 }}>
                        {q.q}
                    </h2>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {q.options.map((opt, i) => (
                            <button
                                key={i}
                                onClick={() => handleAnswer(i)}
                                style={{
                                    background: 'rgba(255,255,255,0.08)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '16px',
                                    padding: '20px',
                                    color: '#fff',
                                    fontSize: '18px',
                                    fontWeight: 500,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    textAlign: 'center'
                                }}
                                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
                                onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                            >
                                {opt}
                            </button>
                        ))}
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
};
