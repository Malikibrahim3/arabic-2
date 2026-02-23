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
    const [timeLeft, setTimeLeft] = React.useState(5000); // 5 seconds in ms
    const [isTimeout, setIsTimeout] = React.useState(false);

    React.useEffect(() => {
        if (feedback !== null || isTimeout) return;

        const interval = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 50) {
                    clearInterval(interval);
                    setIsTimeout(true);
                    onSelect(null); // special timeout payload
                    return 0;
                }
                return prev - 50;
            });
        }, 50);

        return () => clearInterval(interval);
    }, [feedback, isTimeout, onSelect]);

    const progressPercent = (timeLeft / 5000) * 100;

    // If incorrect or timeout, we show the trap explanation screen.
    if (feedback === 'incorrect' || isTimeout) {
        return (
            <div className="trap-explanation-overlay">
                <div className="trap-explanation-card">
                    <AlertTriangle size={64} className="trap-icon" />
                    <h2>{isTimeout ? "Time's Up!" : "Caught in a Trap!"}</h2>
                    <p className="trap-message">
                        {isTimeout ? (
                            <>You ran out of time! You have to be quick to spot the true <strong className="arabic-text" style={{ fontSize: '32px' }}>{exercise.correctAnswer}</strong>.</>
                        ) : (
                            <>You tapped <strong className="arabic-text" style={{ fontSize: '32px' }}>{selected}</strong>, but the correct answer is <strong className="arabic-text" style={{ fontSize: '32px' }}>{exercise.correctAnswer}</strong>.</>
                        )}
                    </p>
                    {exercise.trapExplanation && (
                        <div className="trap-detail-box" dangerouslySetInnerHTML={{ __html: exercise.trapExplanation }} />
                    )}
                    <button className="trap-continue-btn" onClick={onContinue}>Got it</button>
                </div>
            </div>
        );
    }

    // Otherwise, standard multiple choice UI (or correct UI)
    return (
        <div className="exercise-area" style={{ flex: 1, position: 'relative' }}>
            {feedback === null && !isTimeout && (
                <div className="timer-bar-container">
                    <div
                        className={`timer-bar-fill ${timeLeft < 2000 ? 'danger' : ''}`}
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>
            )}

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
