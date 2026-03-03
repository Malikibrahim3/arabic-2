import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import type { Exercise } from '../../data/types';

interface SyntaxHighlightProps {
    exercise: Exercise;
    onComplete: (isCorrect: boolean) => void;
}

// In this exercise:
// prompt: The full Arabic sentence (e.g. "أكل الولد التفاحة")
// hint: What to find (e.g. "Find the Verb", "Find the Object")
// correctAnswer: The specific word (e.g. "أكل")

export const SyntaxHighlight: React.FC<SyntaxHighlightProps> = ({ exercise, onComplete }) => {
    // Split the sentence into clickable words
    const words = exercise.prompt.split(' ');
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);

    useEffect(() => {
        if (feedback === 'correct') {
            const timer = setTimeout(() => {
                onComplete(true);
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [feedback, onComplete]);

    const handleSelect = (index: number) => {
        if (feedback) return;
        setSelectedIndex(index);
    };

    const handleCheck = () => {
        if (selectedIndex === null) return;

        const selectedWord = words[selectedIndex];
        // Clean off punctuation and harakat for safe matching
        const cleanSelected = selectedWord.replace(/[.,!?؟ًٌٍَُِّْ]/g, '');
        const cleanCorrect = exercise.correctAnswer.replace(/[.,!?؟ًٌٍَُِّْ]/g, '');

        if (cleanSelected === cleanCorrect) {
            setFeedback('correct');
        } else {
            setFeedback('incorrect');
        }
    };

    return (
        <div className="exercise-area" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div className="exercise-prompt">
                <strong>Syntax Parse:</strong> {exercise.hint || "Highlight the correct structural element"}
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '48px' }}>
                <div style={{
                    display: 'flex',
                    direction: 'rtl',
                    gap: '12px',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                    padding: '32px',
                    background: 'var(--color-bg-secondary)',
                    borderRadius: '16px',
                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)'
                }}>
                    {words.map((word, i) => {
                        const isSelected = selectedIndex === i;
                        return (
                            <button
                                key={i}
                                onClick={() => handleSelect(i)}
                                disabled={feedback !== null}
                                style={{
                                    fontSize: '42px',
                                    fontWeight: 'bold',
                                    fontFamily: 'Arabic Typesetting, Traditional Arabic, serif',
                                    color: isSelected ? 'white' : 'var(--color-text-main)',
                                    background: isSelected ? 'var(--color-primary)' : 'transparent',
                                    border: isSelected ? '2px solid var(--color-primary)' : '2px dashed #CBD5E1',
                                    borderRadius: '8px',
                                    padding: '8px 16px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    transform: isSelected ? 'scale(1.05)' : 'none'
                                }}
                            >
                                {word}
                            </button>
                        );
                    })}
                </div>
            </div>

            {feedback === null && (
                <button
                    className="intro-continue-btn"
                    onClick={handleCheck}
                    disabled={selectedIndex === null}
                    style={{ opacity: selectedIndex === null ? 0.5 : 1, marginTop: '24px' }}
                >
                    Verify Parser
                </button>
            )}

            {feedback && (
                <div className={`feedback-banner ${feedback}`} style={{ position: 'absolute' }}>
                    <div className="feedback-title">
                        {feedback === 'correct' ? <><CheckCircle size={24} /> Structural Match!</> : <><XCircle size={24} /> Parsing Error</>}
                    </div>
                    {feedback === 'incorrect' && (
                        <>
                            <div className="feedback-detail">The correct structural element is: <strong>{exercise.correctAnswer}</strong></div>
                            <button className="feedback-continue-btn" onClick={() => {
                                setSelectedIndex(null);
                                setFeedback(null);
                                onComplete(false);
                            }}>
                                Continue
                            </button>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};
