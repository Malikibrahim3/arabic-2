import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { loadStats, loadProgress } from '../data/progressStore';
import { srsEngine } from '../data/srsEngine';
import { grammarTracker } from '../data/grammarTracker';
import { achievementEngine } from '../data/achievementEngine';
import { difficultyEngine } from '../data/difficultyEngine';
import { cefrEngine } from '../data/cefrEngine';
import { Leaderboard } from '../components/Leaderboard';
import { motion } from 'framer-motion';
import './ProgressDashboard.css';

// Helper to format grammar category names
const formatGrammarCategory = (cat: string): string => {
    const labels: Record<string, string> = {
        verb_conjugation: 'Verb Conjugation',
        pronoun_agreement: 'Pronoun Agreement',
        sentence_structure: 'Sentence Structure',
        definite_article: 'Definite Article (ال)',
        prepositions: 'Prepositions',
        negation: 'Negation',
        possessives: 'Possessives',
        question_formation: 'Question Formation',
        plural_forms: 'Plural Forms',
        adjective_agreement: 'Adjective Agreement',
    };
    return labels[cat] || cat;
};

export const ProgressDashboard: React.FC = () => {
    const [, setLocation] = useLocation();
    const [stats, setStats] = useState(loadStats());
    const [srsStats, setSrsStats] = useState(srsEngine.getStats());

    useEffect(() => {
        setStats(loadStats());
        setSrsStats(srsEngine.getStats());
    }, []);

    const progress = loadProgress();
    const completedNodes = Object.values(progress).filter(p => p.status === 'completed').length;
    const totalNodes = Object.keys(progress).length || 1;
    const overallAccuracy = stats.totalExercisesCompleted > 0
        ? Math.round((stats.totalCorrect / stats.totalExercisesCompleted) * 100)
        : 0;
    const hoursSpent = Math.round(stats.totalTimeSpentMs / 3600000 * 10) / 10;

    const weakPhonemes = Object.entries(stats.phonemeStats)
        .map(([phoneme, data]) => ({
            phoneme,
            accuracy: data.correct + data.wrong > 0 ? Math.round((data.correct / (data.correct + data.wrong)) * 100) : 0,
            total: data.correct + data.wrong,
        }))
        .filter(p => p.total >= 3)
        .sort((a, b) => a.accuracy - b.accuracy)
        .slice(0, 10);

    const recentAccuracy = stats.accuracyHistory.slice(-7);
    const weakGrammar = grammarTracker.getWeakCategories(5);
    const achievements = achievementEngine.getAll();
    const achStats = achievementEngine.getStats();
    const diffTier = difficultyEngine.getTier();
    const cefr = cefrEngine.getCurrentLevel();

    return (
        <div className="dashboard-page">
            <div className="dashboard-header">
                <button className="path-back-btn" onClick={() => setLocation('/')}>← Back</button>
                <h1 className="dashboard-title">📊 Progress</h1>
            </div>

            {/* Overview Cards */}
            <div className="dashboard-cards">
                <motion.div className="dash-card streak-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <span className="dash-card-icon">🔥</span>
                    <span className="dash-card-value">{stats.currentStreak}</span>
                    <span className="dash-card-label">Day Streak</span>
                    <span className="dash-card-sub">Best: {stats.longestStreak}</span>
                </motion.div>
                <motion.div className="dash-card accuracy-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <span className="dash-card-icon">🎯</span>
                    <span className="dash-card-value">{overallAccuracy}%</span>
                    <span className="dash-card-label">Accuracy</span>
                    <span className="dash-card-sub">{stats.totalCorrect}/{stats.totalExercisesCompleted}</span>
                </motion.div>
                <motion.div className="dash-card time-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <span className="dash-card-icon">⏱️</span>
                    <span className="dash-card-value">{hoursSpent}h</span>
                    <span className="dash-card-label">Time Spent</span>
                    <span className="dash-card-sub">{stats.totalExercisesCompleted} exercises</span>
                </motion.div>
                <motion.div className="dash-card nodes-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                    <span className="dash-card-icon">📚</span>
                    <span className="dash-card-value">{completedNodes}</span>
                    <span className="dash-card-label">Lessons Done</span>
                    <span className="dash-card-sub">{totalNodes} started</span>
                </motion.div>
            </div>

            {/* Difficulty Tier */}
            <motion.div className="dashboard-section" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} style={{ textAlign: 'center' }}>
                <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: '8px',
                    padding: '8px 20px', borderRadius: '20px',
                    background: diffTier === 'hard' ? 'rgba(239,68,68,0.15)' : diffTier === 'easy' ? 'rgba(16,185,129,0.15)' : 'rgba(129,140,248,0.15)',
                    color: diffTier === 'hard' ? '#F87171' : diffTier === 'easy' ? '#6EE7B7' : '#A5B4FC',
                    fontWeight: 600, fontSize: '14px',
                }}>
                    {diffTier === 'hard' ? '🔥' : diffTier === 'easy' ? '🌱' : '⚖️'} Difficulty: {diffTier.charAt(0).toUpperCase() + diffTier.slice(1)}
                    <span style={{ opacity: 0.7, fontSize: '12px' }}>({difficultyEngine.getRollingAccuracy()}% avg)</span>
                </div>
            </motion.div>

            {/* AF15: CEFR Assessment */}
            <motion.div className="dashboard-section" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}>
                <h2 className="section-title">🌍 Fluency Level (CEFR)</h2>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <div>
                            <div style={{ fontSize: '28px', fontWeight: 800, color: '#22D3EE', lineHeight: 1 }}>{cefr.level}</div>
                            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>Estimated Level</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '18px', fontWeight: 600, color: '#E0E7FF' }}>{cefr.estimatedVocabularySize.toLocaleString()}</div>
                            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>Words Recognized</div>
                        </div>
                    </div>

                    {cefr.nextLevel && (
                        <div style={{ marginBottom: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px', color: 'rgba(255,255,255,0.6)' }}>
                                <span>Progress to {cefr.nextLevel}</span>
                                <span>{cefr.progressToNext}%</span>
                            </div>
                            <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${cefr.progressToNext}%` }}
                                    transition={{ duration: 1, delay: 0.8 }}
                                    style={{ height: '100%', background: 'linear-gradient(90deg, #22D3EE, #818CF8)' }}
                                />
                            </div>
                        </div>
                    )}

                    <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)' }}>
                        <strong style={{ display: 'block', marginBottom: '6px', color: '#A5B4FC' }}>What you can do:</strong>
                        <ul style={{ margin: 0, paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {cefr.unlockedSkills.map((skill, i) => (
                                <li key={i}>{skill}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            </motion.div>

            {/* Achievements */}
            <motion.div className="dashboard-section" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                <h2 className="section-title">🏆 Achievements ({achStats.unlocked}/{achStats.total})</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '12px' }}>
                    {achievements.map(ach => (
                        <div key={ach.id} style={{
                            textAlign: 'center', padding: '12px 4px', borderRadius: '12px',
                            background: ach.unlockedAt ? 'rgba(74,222,128,0.1)' : 'rgba(255,255,255,0.03)',
                            opacity: ach.unlockedAt ? 1 : 0.35,
                        }}>
                            <div style={{ fontSize: '28px' }}>{ach.icon}</div>
                            <div style={{ fontSize: '10px', marginTop: '4px', color: 'var(--color-text-light)', lineHeight: 1.3 }}>{ach.title}</div>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Accuracy Trend */}
            {recentAccuracy.length > 0 && (
                <motion.div className="dashboard-section" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                    <h2 className="section-title">📈 Recent Performance</h2>
                    <div className="accuracy-bars">
                        {recentAccuracy.map((entry, i) => (
                            <div key={i} className="accuracy-bar-item">
                                <div className="accuracy-bar-track">
                                    <motion.div className="accuracy-bar-fill" initial={{ height: 0 }} animate={{ height: `${entry.accuracy}%` }}
                                        transition={{ delay: 0.7 + i * 0.1, duration: 0.5 }}
                                        style={{ background: entry.accuracy >= 85 ? '#4ADE80' : entry.accuracy >= 70 ? '#FBBF24' : '#F87171' }}
                                    />
                                </div>
                                <span className="accuracy-bar-value">{entry.accuracy}%</span>
                                <span className="accuracy-bar-date">{entry.date.slice(5)}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* SRS Status */}
            <motion.div className="dashboard-section" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
                <h2 className="section-title">🧠 Memory Strength</h2>
                <div className="srs-breakdown">
                    {[
                        { tag: 'automatic', label: 'Mastered', color: '#4ADE80', icon: '💎' },
                        { tag: 'stable', label: 'Stable', color: '#60A5FA', icon: '✅' },
                        { tag: 'unstable', label: 'Unstable', color: '#FBBF24', icon: '⚠️' },
                        { tag: 'learning', label: 'Learning', color: '#F472B6', icon: '📝' },
                    ].map(({ tag, label, color, icon }) => (
                        <div key={tag} className="srs-tag-row">
                            <span className="srs-tag-icon">{icon}</span>
                            <span className="srs-tag-label">{label}</span>
                            <div className="srs-tag-bar-track">
                                <motion.div className="srs-tag-bar-fill" initial={{ width: 0 }}
                                    animate={{ width: srsStats.total > 0 ? `${((srsStats.byTag[tag as keyof typeof srsStats.byTag] || 0) / srsStats.total) * 100}%` : '0%' }}
                                    transition={{ delay: 0.8, duration: 0.6 }} style={{ background: color }}
                                />
                            </div>
                            <span className="srs-tag-count" style={{ color }}>{srsStats.byTag[tag as keyof typeof srsStats.byTag] || 0}</span>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Grammar Weaknesses */}
            {weakGrammar.length > 0 && (
                <motion.div className="dashboard-section" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.85 }}>
                    <h2 className="section-title">📝 Grammar Weaknesses</h2>
                    <div className="weak-phonemes">
                        {weakGrammar.map(({ category, accuracy, total }) => (
                            <div key={category} className="weak-phoneme-item">
                                <span className="weak-phoneme-char" style={{ fontSize: '13px', fontFamily: 'Outfit, sans-serif' }}>
                                    {formatGrammarCategory(category)}
                                </span>
                                <div className="weak-phoneme-bar-track">
                                    <div className="weak-phoneme-bar-fill" style={{ width: `${accuracy}%`, background: accuracy >= 70 ? '#FBBF24' : '#F87171' }} />
                                </div>
                                <span className="weak-phoneme-pct">{accuracy}%</span>
                                <span className="weak-phoneme-count">({total})</span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Weak Phonemes */}
            {weakPhonemes.length > 0 && (
                <motion.div className="dashboard-section" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}>
                    <h2 className="section-title">🎯 Weakest Sounds</h2>
                    <div className="weak-phonemes">
                        {weakPhonemes.map(({ phoneme, accuracy, total }) => (
                            <div key={phoneme} className="weak-phoneme-item">
                                <span className="weak-phoneme-char" dir="rtl">{phoneme}</span>
                                <div className="weak-phoneme-bar-track">
                                    <div className="weak-phoneme-bar-fill" style={{ width: `${accuracy}%`, background: accuracy >= 70 ? '#FBBF24' : '#F87171' }} />
                                </div>
                                <span className="weak-phoneme-pct">{accuracy}%</span>
                                <span className="weak-phoneme-count">({total})</span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* AF13: Social Features Scaffold (Leaderboard) */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.0 }}>
                <Leaderboard currentUserXp={stats.totalCorrect * 15} currentStreak={stats.currentStreak} />
            </motion.div>
        </div>
    );
};
