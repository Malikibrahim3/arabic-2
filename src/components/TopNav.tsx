import React from 'react';
import { Heart, Diamond } from 'lucide-react';
import './TopNav.css';

export const TopNav: React.FC = () => {
    return (
        <div className="top-nav">
            <div className="top-nav-item">
                {/* Placeholder Flag for Arabic */}
                <div className="flag-icon">🇸🇦</div>
            </div>
            <div className="top-nav-item streak-container">
                {/* Intentionally left blank or removed streaks based on requirements */}
            </div>
            <div className="top-nav-item gems-container">
                <Diamond className="icon-gem" fill="currentColor" />
                <span className="gems-count">500</span>
            </div>
            <div className="top-nav-item hearts-container">
                <Heart className="icon-heart" fill="currentColor" />
                <span className="hearts-count">5</span>
            </div>
        </div>
    );
};
