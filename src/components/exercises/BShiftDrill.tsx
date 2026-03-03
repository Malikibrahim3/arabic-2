import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import type { Exercise } from '../../data/types';
import { useAudio } from '../../hooks/useAudio';

interface BShiftDrillProps {
    exercise: Exercise;
    shuffledChoices: string[];
    onComplete: (isCorrect: boolean) => void;
}

export const BShiftDrill: React.FC<BShiftDrillProps> = ({ exercise, shuffledChoices, onComplete }) => {
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
                <strong>The B-Shift:</strong> Transform the formal MSA verb into the continuous Egyptian form.
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '32px' }}>

                {/* Visual Equation */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    background: 'var(--color-bg-secondary)',
                    padding: '24px 48px',
                    borderRadius: '24px',
                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)',
                    direction: 'rtl'
                }}>
                    <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#3B82F6', fontFamily: 'Arabic Typesetting, Traditional Arabic, serif' }}>
                        {exercise.prompt}
                    </div>

                    <div style={{ color: '#9CA3AF', fontSize: '32px', fontWeight: 'bold' }}>
                        +
                    </div>

                    <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#F97316', fontFamily: 'Arabic Typesetting, Traditional Arabic, serif' }}>
                        بـ
                    </div>

                    <div style={{ margin: '0 16px', color: '#9CA3AF' }}>
                        <ArrowLeft size={32} />
                    </div>

                    <div style={{
                        minWidth: '120px',
                        height: '60px',
                        border: '3px dashed #CBD5E1',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '36px',
                        fontWeight: 'bold',
                        color: selected ? '#F97316' : 'transparent',
                        fontFamily: 'Arabic Typesetting, Traditional Arabic, serif',
                        backgroundColor: selected ? 'white' : 'transparent'
                    }}>
                        {selected || '?'}
                    </div>
                </div>

                {/* Choices */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center', direction: 'rtl', marginTop: '24px' }}>
                    {shuffledChoices.map((choice, i) => {
                        const isSelected = selected === choice;
                        const bgColor = isSelected ? (feedback === 'correct' ? '#10B981' : '#EF4444') : 'white';
                        const color = isSelected ? 'white' : 'var(--color-text-main)';
                        const borderColor = isSelected ? bgColor : 'var(--color-border)';

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
                        {feedback === 'correct' ? <><CheckCircle size={24} /> Perfect Execution!</> : <><XCircle size={24} /> Incorrect Shift</>}
                    </div>
                    {feedback === 'incorrect' && (
                        <>
                            <div className="feedback-detail">The correct transformation is: <strong>{exercise.correctAnswer}</strong></div>
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
