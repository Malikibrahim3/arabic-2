import React from 'react';
import { Heart, BarChart3 } from 'lucide-react';
import { useDialect } from '../context/DialectContext';
import { Link, useLocation } from 'wouter';
import { loadStats } from '../data/progressStore';
import './TopNav.css';

export const TopNav: React.FC = () => {
    const { dialectInfo } = useDialect();
    const [location] = useLocation();
    const stats = loadStats();

    return (
        <div className="top-nav">
            <Link href="/select-dialect">
                <div className="top-nav-item dialect-selector" title="Change Dialect">
                    <div className="flag-icon">{dialectInfo?.flag || '🌍'}</div>
                    <span className="dialect-name-nav">{dialectInfo?.nameArabic}</span>
                </div>
            </Link>
            <div className="top-nav-item streak-container">
                <span className="streak-icon">🔥</span>
                <span className="streak-count">{stats.currentStreak}</span>
            </div>
            <Link href="/progress">
                <div className={`top-nav-item progress-btn ${location === '/progress' ? 'active' : ''}`} title="Progress Dashboard">
                    <BarChart3 className="icon-progress" size={20} />
                </div>
            </Link>
            <div className="top-nav-item hearts-container">
                <Heart className="icon-heart" fill="currentColor" />
                <span className="hearts-count">5</span>
            </div>
        </div>
    );
};
