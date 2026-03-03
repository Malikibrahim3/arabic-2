import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import type { Exercise } from '../../data/types';

interface RootExtractionProps {
    exercise: Exercise;
    onComplete: (isCorrect: boolean) => void;
}

// In this exercise, choices array must contain exactly English letters that map to the visual Arabic word,
// or we can just pass an array of Arabic letters. The word is the prompt, the correct answer is the 3 letters joined.
// Example: word = مَكْتَب, correctAnswer = كتب

export const RootExtraction: React.FC<RootExtractionProps> = ({ exercise, onComplete }) => {
    const letters = exercise.prompt.split(''); // Splitting the word into characters to make them clickable
    const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
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

        let newSelection;
        if (selectedIndices.includes(index)) {
            newSelection = selectedIndices.filter(i => i !== index);
        } else {
            if (selectedIndices.length >= 3) return; // Only 3 root letters
            newSelection = [...selectedIndices, index].sort((a, b) => a - b);
        }
        setSelectedIndices(newSelection);
    };

    const handleCheck = () => {
        // Build the selected root
        const extractedRoot = selectedIndices.map(idx => letters[idx]).join('');
        // Clean off any harakat from the extracted root just in case
        const cleanExtracted = extractedRoot.replace(/[\u064B-\u065F]/g, '');
        const cleanCorrect = exercise.correctAnswer.replace(/[\u064B-\u065F]/g, '');

        if (cleanExtracted === cleanCorrect) {
            setFeedback('correct');
        } else {
            setFeedback('incorrect');
        }
    };

    return (
        <div className="exercise-area" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div className="exercise-prompt">Find the 3-letter Core Root of this word</div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyItems: 'center', marginTop: '48px', gap: '48px' }}>
                <div style={{ display: 'flex', direction: 'rtl', gap: '4px' }}>
                    {letters.map((char, i) => {
                        const isSelected = selectedIndices.includes(i);
                        return (
                            <button
                                key={i}
                                onClick={() => handleSelect(i)}
                                disabled={feedback !== null}
                                style={{
                                    fontSize: '64px',
                                    fontWeight: 'bold',
                                    color: isSelected ? 'var(--color-primary)' : 'var(--color-text-main)',
                                    background: isSelected ? 'rgba(88, 204, 2, 0.1)' : 'transparent',
                                    border: isSelected ? '2px solid var(--color-primary)' : '2px solid transparent',
                                    borderRadius: '8px',
                                    padding: '0 8px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    transform: isSelected ? 'translateY(-8px)' : 'none'
                                }}
                            >
                                {char}
                            </button>
                        );
                    })}
                </div>

                <div style={{ color: 'var(--color-text-muted)', fontSize: '18px' }}>
                    Selected: {selectedIndices.length}/3
                </div>
            </div>

            {feedback === null && (
                <button
                    className="intro-continue-btn"
                    onClick={handleCheck}
                    disabled={selectedIndices.length !== 3}
                    style={{ opacity: selectedIndices.length !== 3 ? 0.5 : 1, marginTop: '24px' }}
                >
                    Extract Root
                </button>
            )}

            {feedback && (
                <div className={`feedback-banner ${feedback}`} style={{ position: 'absolute' }}>
                    <div className="feedback-title">
                        {feedback === 'correct' ? <><CheckCircle size={24} /> Perfect Execution!</> : <><XCircle size={24} /> Incorrect Root</>}
                    </div>
                    {feedback === 'incorrect' && (
                        <>
                            <div className="feedback-detail">The root is: <strong>{exercise.correctAnswer}</strong></div>
                            <button className="feedback-continue-btn" onClick={() => {
                                setSelectedIndices([]);
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
