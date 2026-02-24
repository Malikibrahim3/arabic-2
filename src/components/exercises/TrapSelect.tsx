import React from 'react';
import type { Exercise } from '../../data/types';
import { AlertTriangle, CheckCircle, Volume2 } from 'lucide-react';

interface TrapSelectProps {
    exercise: Exercise;
    shuffledChoices: string[];
    selected: string | null;
    feedback: 'correct' | 'incorrect' | null;
    onSelect: (choice: string | null) => void;
    onContinue: () => void;
    onPlayAudio?: () => void;
}

export const TrapSelect: React.FC<TrapSelectProps> = ({
    exercise,
    shuffledChoices,
    selected,
    feedback,
    onSelect,
    onContinue,
    onPlayAudio
}) => {
    // If incorrect, we show the trap explanation screen.
    if (feedback === 'incorrect') {
        return (
            <div className="trap-explanation-overlay">
                <div className="trap-explanation-card">
                    <AlertTriangle size={56} className="trap-icon" />
                    <h2>Caught in a Trap!</h2>

                    <div className="trap-comparison-board">
                        <div className="trap-side incorrect-side">
                            <span className="trap-label">You tapped</span>
                            <div className="trap-char-box">{selected}</div>
                        </div>
                        <div className="trap-vs">VS</div>
                        <div className="trap-side correct-side">
                            <span className="trap-label">Correct Answer</span>
                            <div className="trap-char-box">{exercise.correctAnswer}</div>
                        </div>
                    </div>

                    {exercise.trapExplanation && (
                        <div className="trap-detail-message" dangerouslySetInnerHTML={{ __html: exercise.trapExplanation }} />
                    )}

                    <button className="trap-continue-btn" onClick={onContinue}>Got it</button>
                </div>
            </div>
        );
    }

    // Otherwise, standard multiple choice UI (or correct UI)
    return (
        <div className="exercise-area" style={{ flex: 1, position: 'relative' }}>
            {exercise.promptAudio && onPlayAudio && (
                <button className="audio-play-btn" onClick={onPlayAudio} style={{ margin: '0 auto 24px' }}>
                    <Volume2 size={48} />
                </button>
            )}

            {exercise.hint && (
                <div className="exercise-letter-hero">{exercise.hint}</div>
            )}
            <div className="exercise-prompt">{exercise.prompt}</div>
            <div className={`choices-grid ${shuffledChoices.length === 3 ? 'three-choices' : ''} ${shuffledChoices.length === 2 ? 'two-choices' : ''}`}>
                {shuffledChoices.map((choice, i) => {
                    let cls = 'choice-btn';
                    if (feedback !== null && choice === selected) {
                        cls += feedback === 'correct' ? ' correct' : ' incorrect';
                    } else if (feedback !== null && choice === exercise.correctAnswer) {
                        cls += ' correct';
                    }
                    return (
                        <button
                            key={`${choice}-${i}`}
                            className={cls}
                            onClick={() => onSelect(choice)}
                            disabled={feedback !== null}
                        >
                            {choice}
                        </button>
                    );
                })}
            </div>
            {feedback === 'correct' && (
                <div className={`feedback-banner correct`}>
                    <div className="feedback-title">
                        <CheckCircle size={24} /> Correct!
                    </div>
                    <button className="feedback-continue-btn" onClick={onContinue}>Continue</button>
                </div>
            )}
        </div>
    );
};
