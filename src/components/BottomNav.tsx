import React from 'react';
import { Home, Target } from 'lucide-react';
import { useLocation } from 'wouter';
import './BottomNav.css';

export const BottomNav: React.FC = () => {
    const [location, setLocation] = useLocation();

    const navItems = [
        { path: '/', icon: Home, label: 'Learn' },
        { path: '/progress', icon: Target, label: 'Progress' }
    ];

    return (
        <nav className="bottom-nav">
            {navItems.map((item) => {
                const isActive = location === item.path;
                const Icon = item.icon;
                return (
                    <button
                        key={item.path}
                        className={`bottom-nav-item ${isActive ? 'active' : ''}`}
                        onClick={() => setLocation(item.path)}
                    >
                        <div className="icon-wrapper">
                            <Icon strokeWidth={isActive ? 2.5 : 2} />
                        </div>
                        <span className="label">{item.label}</span>
                    </button>
                );
            })}
        </nav>
    );
};
