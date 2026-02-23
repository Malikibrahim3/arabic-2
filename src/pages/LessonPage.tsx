import React, { useState } from 'react';
import { useLocation, useRoute } from 'wouter';
import { courseData } from '../data/course';
import { ExerciseSession } from '../components/exercises/ExerciseSession';
import { warmUpAudio } from '../utils/audio';
import './LessonPage.css';

export const LessonPage: React.FC = () => {
    const [, setLocation] = useLocation();
    const [, params] = useRoute('/lesson/:id');
    const nodeId = params?.id;
    const [currentRound, setCurrentRound] = useState<number | null>(null);

    // Find the node
    let foundNode = null;
    for (const unit of courseData.units) {
        for (const node of unit.nodes) {
            if (node.id === nodeId) {
                foundNode = node;
                break;
            }
        }
        if (foundNode) break;
    }

    if (!foundNode) {
        return (
            <div className="lesson-page">
                <div className="lesson-not-found">
                    <h2>Lesson not found</h2>
                    <button className="btn btn-primary" onClick={() => setLocation('/')}>Go Back</button>
                </div>
            </div>
        );
    }

    const nextRound = foundNode.completedRounds;
    const totalRounds = foundNode.totalRounds;
    const hasLessons = foundNode.lessons.length > 0;

    // If a round is active, show that round's exercises
    if (currentRound !== null && hasLessons && currentRound < foundNode.lessons.length) {
        const roundLesson = foundNode.lessons[currentRound];
        return (
            <ExerciseSession
                exercises={roundLesson.exercises}
                onComplete={() => {
                    // Mark round complete (in-memory for now)
                    foundNode!.completedRounds = currentRound + 1;
                    if (currentRound + 1 >= totalRounds) {
                        foundNode!.status = 'completed';
                    }
                    setCurrentRound(null); // Return to lesson page
                }}
                onQuit={() => setLocation('/')}
            />
        );
    }

    const letters = foundNode.skillLetters || [];

    // Intro screen with round selector
    return (
        <div className="lesson-page">
            <div className="lesson-content">
                <button className="lesson-back-btn" onClick={() => setLocation('/')}>
                    ← Back
                </button>

                <div className="lesson-intro">
                    <div className="lesson-letters-display">
                        {letters.map((l, i) => (
                            <span key={i} className="lesson-letter-char">{l}</span>
                        ))}
                    </div>
                    <h2 className="lesson-title">{foundNode.description}</h2>
                    <p className="lesson-subtitle">
                        {letters.length} letters · {totalRounds} rounds
                    </p>
                </div>

                {/* Round selector */}
                <div className="round-list">
                    {Array.from({ length: totalRounds }, (_, i) => {
                        const isComplete = i < nextRound;
                        const isCurrent = i === nextRound;
                        const isLocked = i > nextRound;
                        const roundTitle = foundNode!.lessons[i]?.title || `Round ${i + 1}`;

                        return (
                            <button
                                key={i}
                                className={`round-item ${isComplete ? 'complete' : ''} ${isCurrent ? 'current' : ''} ${isLocked ? 'locked' : ''}`}
                                onClick={() => {
                                    if (!isLocked) {
                                        warmUpAudio();
                                        setCurrentRound(i);
                                    }
                                }}
                                disabled={isLocked}
                            >
                                <div className="round-number">{isComplete ? '✓' : i + 1}</div>
                                <div className="round-info">
                                    <span className="round-title">{roundTitle}</span>
                                    <span className="round-status">
                                        {isComplete ? 'Complete' : isCurrent ? 'Start' : 'Locked'}
                                    </span>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
