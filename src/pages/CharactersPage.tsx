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

export const CharactersPage: React.FC = () => {
    return (
        <div style={pageStyle}>
            <h2>Characters</h2>
            <p>The Arabic alphabet section will go here.</p>
        </div>
    );
};
