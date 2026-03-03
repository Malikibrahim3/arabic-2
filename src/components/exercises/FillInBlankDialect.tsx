import React, { useState } from 'react';
import './FillInBlankDialect.css';
import type { Exercise } from '../../data/types';
import { useAudio } from '../../hooks/useAudio';
import { DualTextDisplay } from './DualTextDisplay';

interface FillInBlankDialectProps {
    exercise: Exercise;
    onComplete: (isCorrect: boolean) => void;
}

export const FillInBlankDialect: React.FC<FillInBlankDialectProps> = ({ exercise, onComplete }) => {
    const { playCorrectSound, playWrongSound } = useAudio();
    const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
    const [isWrong, setIsWrong] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);

    const handleSelect = (choice: string) => {
        if (selectedChoice) return;

        setSelectedChoice(choice);

        if (choice === exercise.correctAnswer) {
            playCorrectSound();
            setIsCorrect(true);
            setTimeout(() => onComplete(true), 2500); // Wait longer so they can read explanation
        } else {
            playWrongSound();
            setIsWrong(true);
            setTimeout(() => {
                setSelectedChoice(null);
                setIsWrong(false);
            }, 1000);
        }
    };

    return (
        <div className="fill-in-blank flex flex-col h-full w-full">
            <h2 className="exercise-prompt text-xl font-semibold mb-6 text-center text-[var(--color-primary)]">
                {exercise.prompt}
            </h2>

            {exercise.sentence && (
                <div className="sentence-container mb-8">
                    <DualTextDisplay text={exercise.sentence} showLabels={true} />
                </div>
            )}

            <div className="choices-grid grid gap-4 grid-cols-1 md:grid-cols-2 mt-auto">
                {exercise.choices.map((choice, idx) => {
                    let className = "choice-card btn btn-ghost h-auto py-4 text-xl arabic-text ";
                    if (selectedChoice === choice) {
                        className += choice === exercise.correctAnswer ? "!bg-[var(--color-secondary)] !text-white border-[var(--color-secondary)]" : "!bg-[var(--color-danger)] !text-white border-[var(--color-danger)]";
                    } else if (isWrong && choice !== selectedChoice) {
                        className += "opacity-50 cursor-not-allowed";
                    }

                    return (
                        <button
                            key={idx}
                            className={className}
                            onClick={() => handleSelect(choice)}
                            disabled={!!selectedChoice && selectedChoice !== choice}
                            dir="rtl"
                        >
                            <span>{choice}</span>
                        </button>
                    );
                })}
            </div>

            {/* Explanation box shown on correct answer */}
            <div className={`explanation-box mt-6 p-4 bg-[rgba(15,90,62,0.1)] border border-[rgba(15,90,62,0.3)] border-l-4 border-l-[var(--color-secondary)] rounded-r-lg shadow-sm transition-opacity duration-300 ${isCorrect ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-[var(--color-secondary)] font-bold text-lg">✓ Perfect!</span>
                </div>
                {exercise.explanation && (
                    <p className="text-[var(--color-text-main)] italic">
                        {exercise.explanation}
                    </p>
                )}
            </div>
        </div>
    );
};
