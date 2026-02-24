import React from 'react';
import { Heart, Diamond, LogOut } from 'lucide-react';
import './TopNav.css';

interface TopNavProps {
    onLogout?: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({ onLogout }) => {
    return (
        <div className="top-nav">
            <button className="logout-btn" onClick={onLogout} title="Logout">
                <LogOut size={20} />
            </button>
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
