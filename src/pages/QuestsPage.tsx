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

export const QuestsPage: React.FC = () => {
    return (
        <div style={pageStyle}>
            <h2>Quests</h2>
            <p>Daily quests and challenges will go here.</p>
        </div>
    );
};
