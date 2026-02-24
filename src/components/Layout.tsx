import React from 'react';
import { TopNav } from './TopNav';
import './Layout.css';

interface LayoutProps {
    children: React.ReactNode;
    onLogout?: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, onLogout }) => {
    return (
        <div className="app-container">
            <TopNav onLogout={onLogout} />
            <main className="main-content">
                {children}
            </main>
        </div>
    );
};
