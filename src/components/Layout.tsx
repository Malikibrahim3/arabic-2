import React from 'react';
import { TopNav } from './TopNav';
import './Layout.css';

interface LayoutProps {
    children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <div className="app-container">
            <TopNav />
            <main className="main-content">
                {children}
            </main>
        </div>
    );
};
