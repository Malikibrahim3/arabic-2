import React from 'react';

const pageStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    padding: '24px',
    textAlign: 'center',
    color: 'var(--color-text-light)'
};

export const ProfilePage: React.FC = () => {
    return (
        <div style={pageStyle}>
            <h2>Profile</h2>
            <p>User stats and settings will go here.</p>
        </div>
    );
};
