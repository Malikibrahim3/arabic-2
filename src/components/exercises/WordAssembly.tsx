import React, { useState } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import type { Exercise } from '../../data/types';

interface WordAssemblyProps {
    exercise: Exercise;
    shuffledParts: string[]; // These are the pieces
    onComplete: (isCorrect: boolean) => void;
}

export const WordAssembly: React.FC<WordAssemblyProps> = ({ exercise, shuffledParts, onComplete }) => {
    const [selectedParts, setSelectedParts] = useState<number[]>([]);
    const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);

    const handleSelect = (index: number) => {
        if (feedback) return;
        if (!selectedParts.includes(index)) {
            setSelectedParts([...selectedParts, index]);
        }
    };

    const handleUndo = (indexToRemove: number) => {
        if (feedback) return;
        setSelectedParts(selectedParts.filter(idx => idx !== indexToRemove));
    };

    const handleCheck = () => {
        const assembledWord = selectedParts.map(idx => shuffledParts[idx]).join('');
        if (assembledWord === exercise.correctAnswer) {
            setFeedback('correct');
        } else {
            setFeedback('incorrect');
        }
    };

    return (
        <div className="exercise-area" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div className="exercise-prompt">{exercise.prompt}</div>

            {/* Assembly Area */}
            <div className="assembly-area" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '24px' }}>
                <div className="assembly-box" style={{
                    minHeight: '80px',
                    width: '100%',
                    borderBottom: '2px solid var(--color-border)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: '8px',
                    cursor: 'pointer'
                }} onClick={() => {
                    if (selectedParts.length > 0) handleUndo(selectedParts[selectedParts.length - 1]);
                }}>
                    {selectedParts.length > 0 ? (
                        <span style={{ fontSize: '48px', direction: 'rtl', fontWeight: 'bold', color: 'var(--color-text-main)' }}>
                            {selectedParts.map(idx => shuffledParts[idx]).join('')}
                        </span>
                    ) : (
                        <span style={{ color: 'var(--color-primary)', opacity: 0.3, fontSize: '24px' }}>Tap parts to assemble</span>
                    )}
                </div>

                {/* Pool Area */}
                <div className="parts-pool" style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center', flexDirection: 'row-reverse' }}>
                    {shuffledParts.map((part, i) => {
                        const isSelected = selectedParts.includes(i);
                        return (
                            <button
                                key={i}
                                className={`choice-btn ${isSelected ? 'selected' : ''}`}
                                style={{
                                    opacity: isSelected ? 0.2 : 1,
                                    padding: '16px 24px',
                                    minWidth: 'auto',
                                    pointerEvents: isSelected ? 'none' : 'auto'
                                }}
                                onClick={() => handleSelect(i)}
                                disabled={isSelected || feedback !== null}
                            >
                                {part}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Check Button (Only show if not yet checked) */}
            {feedback === null && (
                <button
                    className="intro-continue-btn"
                    onClick={handleCheck}
                    disabled={selectedParts.length === 0}
                    style={{ opacity: selectedParts.length === 0 ? 0.5 : 1, marginTop: '24px' }}
                >
                    Check
                </button>
            )}

            {/* Feedback Banner */}
            {feedback && (
                <div className={`feedback-banner ${feedback}`} style={{ position: 'absolute' }}>
                    <div className="feedback-title">
                        {feedback === 'correct' ? <><CheckCircle size={24} /> Correct!</> : <><XCircle size={24} /> Incorrect</>}
                    </div>
                    {feedback === 'incorrect' && (
                        <div className="feedback-detail">Correct answer: <strong>{exercise.correctAnswer}</strong></div>
                    )}
                    <button className="feedback-continue-btn" onClick={() => onComplete(feedback === 'correct')}>
                        Continue
                    </button>
                </div>
            )}
        </div>
    );
};
