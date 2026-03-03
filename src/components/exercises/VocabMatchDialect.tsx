import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import type { Exercise } from '../../data/types';
import { useAudio } from '../../hooks/useAudio';

interface VocabMatchDialectProps {
    exercise: Exercise;
    shuffledChoices: string[];
    onComplete: (isCorrect: boolean) => void;
}

export const VocabMatchDialect: React.FC<VocabMatchDialectProps> = ({ exercise, shuffledChoices, onComplete }) => {
    const [selected, setSelected] = useState<string | null>(null);
    const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
    const { play } = useAudio();

    useEffect(() => {
        if (feedback === 'correct') {
            const timer = setTimeout(() => {
                onComplete(true);
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [feedback, onComplete]);

    const handleSelect = (choice: string) => {
        if (feedback) return;
        setSelected(choice);

        const isCorrect = choice === exercise.correctAnswer;
        if (isCorrect) {
            setFeedback('correct');
            if (exercise.promptAudio) {
                play(exercise.promptAudio);
            }
        } else {
            setFeedback('incorrect');
        }
    };

    return (
        <div className="exercise-area" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div className="exercise-prompt">
                <strong>Dialect Contrast:</strong> Match the MSA word to its Egyptian spoken equivalent.
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '48px' }}>
                <div style={{
                    fontSize: '48px',
                    fontWeight: 'bold',
                    fontFamily: 'Arabic Typesetting, Traditional Arabic, serif',
                    color: '#3B82F6', // MSA Blue
                    background: 'rgba(59, 130, 246, 0.1)',
                    border: '2px solid #3B82F6',
                    padding: '24px 48px',
                    borderRadius: '16px',
                    direction: 'rtl',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}>
                    <div style={{ fontSize: '14px', textTransform: 'uppercase', color: '#64748B', fontWeight: 'bold', letterSpacing: '2px', textAlign: 'center', marginBottom: '8px' }}>Formal (MSA)</div>
                    {exercise.prompt}
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center', direction: 'rtl' }}>
                    {shuffledChoices.map((choice, i) => {
                        const isSelected = selected === choice;
                        const bgColor = isSelected ? (feedback === 'correct' ? '#10B981' : '#EF4444') : 'white';
                        const color = isSelected ? 'white' : '#F97316'; // Egyptian Orange font
                        const borderColor = isSelected ? bgColor : '#F97316';

                        return (
                            <button
                                key={i}
                                onClick={() => handleSelect(choice)}
                                disabled={feedback !== null}
                                style={{
                                    fontSize: '32px',
                                    fontWeight: 'bold',
                                    fontFamily: 'Arabic Typesetting, Traditional Arabic, serif',
                                    color,
                                    backgroundColor: bgColor,
                                    border: `2px solid ${borderColor}`,
                                    borderRadius: '12px',
                                    padding: '16px 32px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    transform: isSelected && feedback === 'incorrect' ? 'scale(0.95)' : 'scale(1)',
                                    boxShadow: '0 2px 4px -1px rgba(0, 0, 0, 0.05)'
                                }}
                            >
                                {choice}
                            </button>
                        );
                    })}
                </div>
            </div>

            {feedback && (
                <div className={`feedback-banner ${feedback}`} style={{ position: 'absolute' }}>
                    <div className="feedback-title">
                        {feedback === 'correct' ? <><CheckCircle size={24} /> Perfect Match!</> : <><XCircle size={24} /> Dialect Mismatch</>}
                    </div>
                    {feedback === 'incorrect' && (
                        <>
                            <div className="feedback-detail">The correct Egyptian spoken equivalent is: <strong>{exercise.correctAnswer}</strong></div>
                            <button className="feedback-continue-btn" onClick={() => {
                                setSelected(null);
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
