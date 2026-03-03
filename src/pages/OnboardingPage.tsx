import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import './OnboardingPage.css';

interface OnboardingPageProps {
    onComplete: () => void;
}

const SLIDES = [
    {
        icon: '🧠',
        title: 'Learn Arabic the Smart Way',
        subtitle: 'Powered by AI That Adapts to You',
        description: 'Our engine tracks your exact pronunciation weaknesses and adjusts exercises in real-time. No wasted time on things you already know.',
        accent: '#818CF8',
    },
    {
        icon: '🗣',
        title: 'Speak Like a Native',
        subtitle: 'Egyptian Arabic & Modern Standard Arabic',
        description: 'Practice with live AI conversations, get instant pronunciation feedback, and master the dialect that 100 million people actually speak.',
        accent: '#F59E0B',
    },
    {
        icon: '🚀',
        title: 'From Zero to Fluent',
        subtitle: 'Structured Mastery, Not Just Repetition',
        description: 'Every stage has clear outcomes. Every mistake makes you stronger. Regression logic ensures you truly master each skill before moving forward.',
        accent: '#10B981',
    },
];

export const OnboardingPage: React.FC<OnboardingPageProps> = ({ onComplete }) => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [showOptions, setShowOptions] = useState(false);
    const [, setLocation] = useLocation();

    const handleNext = () => {
        if (currentSlide < SLIDES.length - 1) {
            setCurrentSlide(s => s + 1);
        } else {
            setShowOptions(true);
        }
    };

    const handleSkip = () => {
        setShowOptions(true);
    };

    const handleStartFromBeginning = () => {
        localStorage.setItem('onboarding_completed', 'true');
        onComplete();
    };

    const handleSelectUnit = () => {
        localStorage.setItem('godMode', 'true');
        localStorage.setItem('onboarding_completed', 'true');
        onComplete();
    };

    const handleTakeTest = () => {
        localStorage.setItem('onboarding_completed', 'true');
        setLocation('/placement-test');
    };

    const slide = SLIDES[currentSlide];

    if (showOptions) {
        return (
            <div className="onboarding-page">
                <motion.div
                    className="onboarding-options"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ textAlign: 'center', maxWidth: '420px', width: '100%' }}
                >
                    <h1 className="onboarding-title">How would you like to start?</h1>
                    <p className="onboarding-description" style={{ marginBottom: '40px' }}>
                        Choose the path that best fits your current knowledge.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <button className="option-btn" onClick={handleStartFromBeginning}>
                            <div className="option-icon">🌱</div>
                            <div className="option-content">
                                <div className="option-title">Start from the Beginning</div>
                                <div className="option-desc">Best if you are new to Arabic</div>
                            </div>
                        </button>

                        <button className="option-btn" onClick={handleSelectUnit}>
                            <div className="option-icon">🎯</div>
                            <div className="option-content">
                                <div className="option-title">Select My Own Unit</div>
                                <div className="option-desc">Choose where you want to jump in</div>
                            </div>
                        </button>

                        <button className="option-btn" onClick={handleTakeTest}>
                            <div className="option-icon">🏆</div>
                            <div className="option-content">
                                <div className="option-title">Take the Placement Test</div>
                                <div className="option-desc">Let us find the right level for you</div>
                            </div>
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    const isLast = currentSlide === SLIDES.length - 1;

    return (
        <div className="onboarding-page">
            <button className="onboarding-skip" onClick={handleSkip}>
                Skip
            </button>

            <AnimatePresence mode="wait">
                <motion.div
                    key={currentSlide}
                    className="onboarding-slide"
                    initial={{ opacity: 0, x: 60 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -60 }}
                    transition={{ duration: 0.35 }}
                >
                    <motion.div
                        className="onboarding-icon"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', damping: 12, delay: 0.1 }}
                        style={{ background: `${slide.accent}22` }}
                    >
                        {slide.icon}
                    </motion.div>

                    <h1 className="onboarding-title">{slide.title}</h1>
                    <h2
                        className="onboarding-subtitle"
                        style={{ color: slide.accent }}
                    >
                        {slide.subtitle}
                    </h2>
                    <p className="onboarding-description">{slide.description}</p>
                </motion.div>
            </AnimatePresence>

            <div className="onboarding-footer">
                <div className="onboarding-dots">
                    {SLIDES.map((_, i) => (
                        <div
                            key={i}
                            className={`onboarding-dot ${i === currentSlide ? 'active' : ''}`}
                            style={i === currentSlide ? { background: slide.accent } : {}}
                        />
                    ))}
                </div>

                <motion.button
                    className="onboarding-next-btn"
                    onClick={handleNext}
                    whileTap={{ scale: 0.96 }}
                    style={{ background: slide.accent }}
                >
                    {isLast ? 'Get Started' : 'Next'}
                </motion.button>
            </div>
        </div>
    );
};
