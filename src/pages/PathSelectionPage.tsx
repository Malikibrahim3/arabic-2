import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { BookOpen, MessageCircle, GitMerge, Lock } from 'lucide-react';
import { getCourseData } from '../data/course';
import { useDialect } from '../context/DialectContext';
import { loadProgress } from '../data/progressStore';
import './PathSelectionPage.css';

export const PathSelectionPage: React.FC = () => {
    const [, setLocation] = useLocation();
    const { currentDialect } = useDialect();

    // Determine if Hybrid Track is unlocked based on Phase 4 rules:
    // Requires Stage 2 Speaking OR Stage 3 Reading
    const [isHybridUnlocked, setIsHybridUnlocked] = useState(false);

    useEffect(() => {
        const isGodMode = localStorage.getItem('godMode') === 'true';
        const course = getCourseData(currentDialect || 'msa');
        const savedProgress = loadProgress();

        // Apply progress to course nodes so status 'completed' is reflected
        course.units.forEach(unit => {
            unit.nodes.forEach(node => {
                const saved = savedProgress[node.id];
                if (saved && saved.status === 'completed') {
                    node.status = 'completed';
                }
            });
        });

        const speakingStage2 = course.units.find(u => u.id === '102'); // Action Core
        const readingStage3 = course.units.find(u => u.id === '3');    // Words & Connecting

        const isSpeakingEligible = speakingStage2?.nodes.every(n => n.status === 'completed') || false;
        const isReadingEligible = readingStage3?.nodes.every(n => n.status === 'completed') || false;

        setIsHybridUnlocked(isGodMode || isSpeakingEligible || isReadingEligible);
    }, [currentDialect]);

    return (
        <div className="path-selection-page">
            <div className="path-page-header">
                <h1 className="path-page-title">Choose Your Path</h1>
                <p className="path-page-subtitle">
                    Focus on what matters most to you. You can always switch between paths.
                </p>
            </div>

            <div className="path-cards">
                {/* Reading & Writing Path */}
                <div
                    className="path-card reading"
                    onClick={() => setLocation('/learn/reading')}
                >
                    <span className="path-card-icon">📖</span>
                    <h2 className="path-card-title">Reading & Writing</h2>
                    <p className="path-card-arabic">القراءة والكتابة</p>
                    <p className="path-card-desc">
                        Master the Arabic alphabet, vowels, word building, sentences, and unvowelled reading.
                    </p>
                    <div className="path-card-badge">
                        <BookOpen size={16} />
                        Start Reading
                    </div>
                    <div className="path-card-units">
                        <span>Alphabet</span>
                        <span>Vowels</span>
                        <span>Words</span>
                        <span>Sentences</span>
                    </div>
                </div>

                {/* Speaking & Listening Path */}
                <div
                    className="path-card speaking"
                    onClick={() => setLocation('/learn/speaking')}
                >
                    <span className="path-card-icon">🗣️</span>
                    <h2 className="path-card-title">Speaking & Listening</h2>
                    <p className="path-card-arabic">المحادثة والاستماع</p>
                    <p className="path-card-desc">
                        Immersive conversations, real-world dialogues, and interactive roleplay scenarios.
                    </p>
                    <div className="path-card-badge">
                        <MessageCircle size={16} />
                        Start Speaking
                    </div>
                    <div className="path-card-units">
                        <span>Greetings</span>
                        <span>Café</span>
                        <span>Shopping</span>
                        <span>Travel</span>
                    </div>
                </div>

                {/* Hybrid Integration Path */}
                <div
                    className={`path-card hybrid ${!isHybridUnlocked ? 'locked' : ''}`}
                    onClick={() => {
                        if (isHybridUnlocked) {
                            setLocation('/learn/hybrid');
                        } else {
                            alert("Hybrid Integration is locked. You must complete Stage 2 Speaking or Stage 3 Reading first.");
                        }
                    }}
                    style={{ opacity: isHybridUnlocked ? 1 : 0.6, position: 'relative' }}
                >
                    {!isHybridUnlocked && (
                        <div style={{ position: 'absolute', top: 16, right: 16, color: '#9CA3AF' }}>
                            <Lock size={24} />
                        </div>
                    )}
                    <span className="path-card-icon">🧠</span>
                    <h2 className="path-card-title">Hybrid Integration</h2>
                    <p className="path-card-arabic">الدمج</p>
                    <p className="path-card-desc">
                        Connect your spoken dialect with formal MSA script. Master context switching and side-by-side translation.
                    </p>
                    <div className="path-card-badge" style={{ background: isHybridUnlocked ? '#8B5CF6' : '#9CA3AF' }}>
                        <GitMerge size={16} />
                        {isHybridUnlocked ? 'Start Hybrid' : 'Locked'}
                    </div>
                    <div className="path-card-units">
                        <span>Contrast</span>
                        <span>B-Shift</span>
                        <span>Translation</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
