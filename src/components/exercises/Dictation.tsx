import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Volume2, Delete } from 'lucide-react';
import type { Exercise } from '../../data/types';
import { useAudio } from '../../hooks/useAudio';

interface DictationProps {
    exercise: Exercise;
    onComplete: (isCorrect: boolean) => void;
}

const ARABIC_KEYBOARD = [
    ['ض', 'ص', 'ث', 'ق', 'ف', 'غ', 'ع', 'ه', 'خ', 'ح', 'ج'],
    ['ش', 'س', 'ي', 'ب', 'ل', 'ا', 'ت', 'ن', 'م', 'ك', 'ط'],
    ['ئ', 'ء', 'ؤ', 'ر', 'لا', 'ى', 'ة', 'و', 'ز', 'ظ', 'د', 'ذ']
];

export const Dictation: React.FC<DictationProps> = ({ exercise, onComplete }) => {
    const [typed, setTyped] = useState<string>('');
    const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
    const { play } = useAudio();

    // Auto-advance when correct
    useEffect(() => {
        if (feedback === 'correct') {
            const timer = setTimeout(() => {
                onComplete(true);
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [feedback, onComplete]);

    const handleKeyPress = (char: string) => {
        if (feedback) return;
        setTyped(prev => prev + char);
    };

    const handleDelete = () => {
        if (feedback) return;
        setTyped(prev => prev.slice(0, -1));
    };

    const handleCheck = () => {
        // Strip out some common normalizations if needed, for now exact match or NFC match
        const normalizedTyped = typed.normalize('NFC').replace(/لا/g, 'ل' + 'ا');
        const normalizedCorrect = exercise.correctAnswer.normalize('NFC');

        if (normalizedTyped === normalizedCorrect || typed === normalizedCorrect) {
            setFeedback('correct');
        } else {
            setFeedback('incorrect');
        }
    };

    const handlePlayAudio = () => {
        if (exercise.promptAudio) {
            play(exercise.promptAudio);
        }
    };

    return (
        <div className="exercise-area" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div className="exercise-prompt">{exercise.prompt || "Listen and type what you hear"}</div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '24px' }}>
                <button
                    className="audio-btn"
                    onClick={handlePlayAudio}
                    style={{
                        background: 'var(--color-primary)',
                        color: 'white',
                        padding: '16px',
                        borderRadius: '50%',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <Volume2 size={32} />
                </button>

                <div
                    className="typing-display"
                    style={{
                        minHeight: '80px',
                        width: '100%',
                        borderBottom: '2px solid var(--color-border)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        padding: '8px',
                        fontSize: '48px',
                        direction: 'rtl',
                        fontWeight: 'bold',
                        color: 'var(--color-text-main)'
                    }}
                >
                    {typed || <span style={{ opacity: 0.3 }}>...</span>}
                </div>

                <div className="virtual-keyboard" style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', maxWidth: '600px' }}>
                    {ARABIC_KEYBOARD.map((row, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                            {row.map(char => (
                                <button
                                    key={char}
                                    onClick={() => handleKeyPress(char)}
                                    disabled={feedback !== null}
                                    style={{
                                        padding: '12px',
                                        flex: 1,
                                        fontSize: '20px',
                                        background: 'var(--color-bg-secondary)',
                                        border: '1px solid var(--color-border)',
                                        borderRadius: '8px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {char}
                                </button>
                            ))}
                            {i === 2 && (
                                <button
                                    onClick={handleDelete}
                                    disabled={feedback !== null}
                                    style={{
                                        padding: '12px',
                                        flex: 1.5,
                                        background: '#E5E7EB',
                                        border: 'none',
                                        borderRadius: '8px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <Delete size={20} />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {feedback === null && (
                <button
                    className="intro-continue-btn"
                    onClick={handleCheck}
                    disabled={typed.length === 0}
                    style={{ opacity: typed.length === 0 ? 0.5 : 1, marginTop: '24px' }}
                >
                    Check
                </button>
            )}

            {feedback && (
                <div className={`feedback-banner ${feedback}`} style={{ position: 'absolute' }}>
                    <div className="feedback-title">
                        {feedback === 'correct' ? <><CheckCircle size={24} /> Correct!</> : <><XCircle size={24} /> Incorrect</>}
                    </div>
                    {feedback === 'incorrect' && (
                        <>
                            <div className="feedback-detail">Correct answer: <strong>{exercise.correctAnswer}</strong></div>
                            <button className="feedback-continue-btn" onClick={() => {
                                setTyped('');
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
