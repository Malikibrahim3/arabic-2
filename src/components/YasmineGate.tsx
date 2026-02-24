import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import './YasmineGate.css';

export function YasmineGate({ onUnlock }: { onUnlock: () => void }) {
    const [noPosition, setNoPosition] = useState({ x: 0, y: 0 });
    const [isMoving, setIsMoving] = useState(false);
    const [clickCount, setClickCount] = useState(0);
    const yesHoldTimerRef = useRef<number | null>(null);
    const [isYesHeld, setIsYesHeld] = useState(false);
    const [yesHoldProgress, setYesHoldProgress] = useState(0);
    const progressIntervalRef = useRef<number | null>(null);

    const noMessages = [
        "No absolutely not",
        "Nice try! 😉",
        "Are you sure?",
        "Still nope!",
        "Stop tapping me!",
        "Just click yes...",
        "Catch me if you can!",
        "I have all day...",
        "Okay seriously...",
        "You literally can't",
        "Fine, try again",
    ];

    const moveNoButton = () => {
        setIsMoving(true);
        setClickCount(c => c + 1);

        const element = document.querySelector('.yasmine-no') as HTMLElement;
        if (!element) return;
        const buttonWidth = element.offsetWidth || 250;
        const buttonHeight = element.offsetHeight || 60;

        const padding = 20;
        const maxX = window.innerWidth - buttonWidth - padding;
        const maxY = window.innerHeight - buttonHeight - padding;

        const randomX = Math.max(padding, Math.floor(Math.random() * maxX));
        const randomY = Math.max(padding, Math.floor(Math.random() * maxY));

        setNoPosition({ x: randomX, y: randomY });
    };

    // YES button - press and hold to unlock with smooth progress
    const handleYesPressStart = () => {
        setIsYesHeld(true);
        setYesHoldProgress(0);
        
        const duration = 1500; // 1.5 seconds
        const steps = 60; // 60 steps for smooth animation
        const stepDuration = duration / steps;
        const progressPerStep = 100 / steps;
        
        let currentProgress = 0;
        
        progressIntervalRef.current = setInterval(() => {
            currentProgress += progressPerStep;
            if (currentProgress >= 100) {
                currentProgress = 100;
                if (progressIntervalRef.current) {
                    clearInterval(progressIntervalRef.current);
                }
                onUnlock();
            }
            setYesHoldProgress(currentProgress);
        }, stepDuration);
    };

    const handleYesPressEnd = () => {
        setIsYesHeld(false);
        setYesHoldProgress(0);
        if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
            progressIntervalRef.current = null;
        }
        if (yesHoldTimerRef.current) {
            clearTimeout(yesHoldTimerRef.current);
            yesHoldTimerRef.current = null;
        }
    };

    // NO button - moves once per tap
    const handleNoPress = (e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault();
        moveNoButton();
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (progressIntervalRef.current) {
                clearInterval(progressIntervalRef.current);
            }
            if (yesHoldTimerRef.current) {
                clearTimeout(yesHoldTimerRef.current);
            }
        };
    }, []);

    const movingButton = (
        <button
            className="yasmine-no"
            onMouseDown={handleNoPress}
            onTouchStart={handleNoPress}
            style={isMoving ? {
                position: 'fixed',
                left: `${noPosition.x}px`,
                top: `${noPosition.y}px`,
                zIndex: 999999,
                width: 'auto',
                transition: 'left 0.3s ease-out, top 0.3s ease-out',
            } : { width: '100%' }}
        >
            {noMessages[clickCount % noMessages.length]}
        </button>
    );

    return (
        <div className="yasmine-container">
            <div className="yasmine-bg-shape shape1"></div>
            <div className="yasmine-bg-shape shape2"></div>

            <div className="yasmine-content">
                <p className="yasmine-subtitle">Hi Yasmine, to enter the app you need to answer this question:</p>
                <h1 className="yasmine-title">Do you love me?</h1>
                <p className="yasmine-instruction">Press and hold to answer</p>

                <div className="yasmine-buttons">
                    <div style={{ position: 'relative', width: '100%' }}>
                        <button
                            className={`yasmine-yes ${isYesHeld ? 'held' : ''}`}
                            onMouseDown={handleYesPressStart}
                            onMouseUp={handleYesPressEnd}
                            onMouseLeave={handleYesPressEnd}
                            onTouchStart={handleYesPressStart}
                            onTouchEnd={handleYesPressEnd}
                        >
                            <span className="yasmine-yes-text">Yes absolutely</span>
                            <div 
                                className="yasmine-yes-progress" 
                                style={{ width: `${yesHoldProgress}%` }}
                            />
                        </button>
                    </div>

                    <div style={{ position: 'relative', width: '100%' }}>
                        {clickCount === 0 && (
                            <div className="yasmine-dare-bubble">
                                I dare you to press no!
                            </div>
                        )}
                        {!isMoving ? (
                            movingButton
                        ) : (
                            createPortal(movingButton, document.body)
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
