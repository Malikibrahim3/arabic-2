import React, { createContext, useContext, useState } from 'react';
import type { DialectId, DialectInfo } from '../data/types';
import { setDialect as setAudioDialect } from '../audio/AudioEngine';

export const DIALECTS: DialectInfo[] = [
    {
        id: 'msa',
        name: 'Modern Standard Arabic',
        nameArabic: 'الفصحى',
        description: 'The formal language of the Arab world, used in news, books, and official settings. Perfect for academic study and understanding media.',
        flag: '🇸🇦',
        color: '#00BFA5'
    },
    {
        id: 'egyptian',
        name: 'Egyptian Arabic',
        nameArabic: 'المصري',
        description: 'The most widely understood dialect across the Middle East. Essential for cinema, music, and everyday conversation in Egypt.',
        flag: '🇪🇬',
        color: '#FF7043'
    },
    {
        id: 'levantine',
        name: 'Levantine Arabic',
        nameArabic: 'الشامي',
        description: 'Spoken in Lebanon, Syria, Jordan, and Palestine. Known for its melodic tone and widely used in popular drama series.',
        flag: '🇱🇧',
        color: '#5C6BC0',
        comingSoon: true
    },
    {
        id: 'maghrebi',
        name: 'Maghrebi Arabic',
        nameArabic: 'المغربي',
        description: 'Commonly spoken in Morocco, Algeria, and Tunisia. A unique blend of Arabic with Berber and French influences.',
        flag: '🇲🇦',
        color: '#26A69A',
        comingSoon: true
    },
    {
        id: 'gulf',
        name: 'Gulf Arabic',
        nameArabic: 'الخليجي',
        description: 'Spoken in Saudi Arabia, UAE, Qatar, and Kuwait. Vital for business and personal travel in the Arabian Peninsula.',
        flag: '🇦🇪',
        color: '#66BB6A',
        comingSoon: true
    }
];

interface DialectContextType {
    currentDialect: DialectId | null;
    setDialect: (id: DialectId) => void;
    dialectInfo: DialectInfo | null;
}

const DialectContext = createContext<DialectContextType | undefined>(undefined);

export const DialectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentDialect, setCurrentDialectState] = useState<DialectId | null>(() => {
        let saved = localStorage.getItem('selectedDialect') as DialectId | null;
        if (saved && !['msa', 'egyptian'].includes(saved)) {
            saved = 'msa';
            localStorage.setItem('selectedDialect', 'msa');
        }
        if (saved) {
            setAudioDialect(saved);
        }
        return saved;
    });

    const setDialect = (id: DialectId) => {
        console.log('[DialectContext] Setting dialect to:', id);
        setCurrentDialectState(id);
        localStorage.setItem('selectedDialect', id);
        setAudioDialect(id);
    };

    const dialectInfo = currentDialect ? DIALECTS.find(d => d.id === currentDialect) || null : null;

    return (
        <DialectContext.Provider value={{ currentDialect, setDialect, dialectInfo }}>
            {children}
        </DialectContext.Provider>
    );
};

export const useDialect = () => {
    const context = useContext(DialectContext);
    if (context === undefined) {
        throw new Error('useDialect must be used within a DialectProvider');
    }
    return context;
};
