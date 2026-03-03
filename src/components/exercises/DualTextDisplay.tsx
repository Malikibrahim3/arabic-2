import React from 'react';
import './DualTextDisplay.css';
import type { DualText } from '../../data/types';
import { Volume2 } from 'lucide-react';
import { useAudio } from '../../hooks/useAudio';

interface DualTextDisplayProps {
    text: DualText;
    showLabels?: boolean;
}

export const DualTextDisplay: React.FC<DualTextDisplayProps> = ({ text, showLabels = true }) => {
    const { play } = useAudio();

    return (
        <div className="dual-text-container">
            <div className="dual-text-row">
                <div className="dual-text-content egyptian" dir="rtl">
                    {showLabels && <span className="dialect-label">Egyptian</span>}
                    <div className="text-display-group">
                        {text.audioUrl && (
                            <button className="audio-btn" onClick={() => play(text.audioUrl!)}>
                                <Volume2 size={18} />
                            </button>
                        )}
                        <span className="arabic-text primary">{text.egyptian}</span>
                    </div>
                </div>
            </div>
            <div className="dual-text-divider" />
            <div className="dual-text-row">
                <div className="dual-text-content msa" dir="rtl">
                    {showLabels && <span className="dialect-label">Reading (MSA)</span>}
                    <span className="arabic-text secondary">{text.msa}</span>
                </div>
            </div>
            <div className="dual-text-divider" />
            <div className="dual-text-row">
                <div className="dual-text-content english" dir="ltr">
                    {showLabels && <span className="dialect-label">Meaning</span>}
                    <span className="english-text">{text.english}</span>
                </div>
            </div>
        </div>
    );
};
