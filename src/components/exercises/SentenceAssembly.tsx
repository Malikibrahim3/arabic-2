import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import type { Exercise } from '../../data/types';

interface SentenceAssemblyProps {
    exercise: Exercise;
    shuffledWords: string[]; // These are the word tiles
    onComplete: (isCorrect: boolean) => void;
}

export const SentenceAssembly: React.FC<SentenceAssemblyProps> = ({ exercise, shuffledWords, onComplete }) => {
    const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
    const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);

    // Reset state when exercise changes
    useEffect(() => {
        setSelectedIndices([]);
        setFeedback(null);
    }, [exercise.id]);

    // Auto-advance when correct
    useEffect(() => {
        if (feedback === 'correct') {
            const timer = setTimeout(() => {
                onComplete(true);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [feedback, onComplete]);

    const handleSelect = (index: number) => {
        if (feedback) return;
        if (!selectedIndices.includes(index)) {
            setSelectedIndices([...selectedIndices, index]);
        }
    };

    const handleUndo = (indexToRemove: number) => {
        if (feedback) return;
        setSelectedIndices(selectedIndices.filter(idx => idx !== indexToRemove));
    };

    const handleCheck = () => {
        const assembledSentence = selectedIndices.map(idx => shuffledWords[idx]).join(' ');
        // Normalize both strings to handle Arabic Unicode variations
        const normalizedAssembled = assembledSentence.trim().normalize('NFC');
        const normalizedCorrect = exercise.correctAnswer.trim().normalize('NFC');
        
        if (normalizedAssembled === normalizedCorrect) {
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
                    minHeight: '120px',
                    width: '100%',
                    borderBottom: '2px solid var(--color-border)',
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: '16px',
                    gap: '8px',
                    cursor: 'pointer',
                    direction: 'rtl'
                }} onClick={() => {
                    if (selectedIndices.length > 0) handleUndo(selectedIndices[selectedIndices.length - 1]);
                }}>
                    {selectedIndices.length > 0 ? (
                        selectedIndices.map((idx, i) => (
                            <span
                                key={i}
                                className="assembled-word-tile"
                                style={{
                                    fontSize: '28px',
                                    fontWeight: 'bold',
                                    color: 'var(--color-text-main)',
                                    background: 'var(--color-surface)',
                                    padding: '4px 12px',
                                    borderRadius: '8px',
                                    border: '1px solid var(--color-border)'
                                }}
                            >
                                {shuffledWords[idx]}
                            </span>
                        ))
                    ) : (
                        <span style={{ color: 'var(--color-primary)', opacity: 0.3, fontSize: '20px' }}>Tap words to build the sentence</span>
                    )}
                </div>

                {/* Pool Area */}
                <div className="parts-pool" style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center', direction: 'rtl' }}>
                    {shuffledWords.map((word, i) => {
                        const isSelected = selectedIndices.includes(i);
                        return (
                            <button
                                key={i}
                                className={`choice-btn ${isSelected ? 'selected' : ''}`}
                                style={{
                                    opacity: isSelected ? 0.2 : 1,
                                    padding: '12px 20px',
                                    minWidth: 'auto',
                                    fontSize: '20px',
                                    pointerEvents: isSelected ? 'none' : 'auto'
                                }}
                                onClick={() => handleSelect(i)}
                                disabled={isSelected || feedback !== null}
                            >
                                {word}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Check Button */}
            {feedback === null && (
                <button
                    className="intro-continue-btn"
                    onClick={handleCheck}
                    disabled={selectedIndices.length === 0}
                    style={{ opacity: selectedIndices.length === 0 ? 0.5 : 1, marginTop: '24px' }}
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
                        <>
                            <div className="feedback-detail">Correct: <strong>{exercise.correctAnswer}</strong></div>
                            <button className="feedback-continue-btn" onClick={() => onComplete(false)}>
                                Continue
                            </button>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};
