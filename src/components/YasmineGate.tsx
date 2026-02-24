import { useState } from 'react';
import { createPortal } from 'react-dom';
import './YasmineGate.css';

export function YasmineGate({ onUnlock }: { onUnlock: () => void }) {
    const [noPosition, setNoPosition] = useState({ x: 0, y: 0 });
    const [isMoving, setIsMoving] = useState(false);
    const [clickCount, setClickCount] = useState(0);

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

    const handleNoClick = (e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault();
        setIsMoving(true);
        setClickCount(c => c + 1);

        // Measure actual size based on current text to prevent off-screen jumps
        const element = e.currentTarget as HTMLElement;
        const buttonWidth = element.offsetWidth || 250;
        const buttonHeight = element.offsetHeight || 60;

        const padding = 20;

        const maxX = window.innerWidth - buttonWidth - padding;
        const maxY = window.innerHeight - buttonHeight - padding;

        const randomX = Math.max(padding, Math.floor(Math.random() * maxX));
        const randomY = Math.max(padding, Math.floor(Math.random() * maxY));

        setNoPosition({ x: randomX, y: randomY });
    };

    const movingButton = (
        <button
            className="yasmine-no"
            onMouseEnter={handleNoClick}
            onTouchStart={handleNoClick}
            onClick={handleNoClick}
            style={isMoving ? {
                position: 'fixed',
                left: `${noPosition.x}px`,
                top: `${noPosition.y}px`,
                zIndex: 999999,
                width: 'auto',
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
                <h1 className="yasmine-title">Hi Yasmine, do you love me?</h1>

                <div className="yasmine-buttons">
                    <button className="yasmine-yes" onClick={onUnlock}>
                        Yes absolutely
                    </button>

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
