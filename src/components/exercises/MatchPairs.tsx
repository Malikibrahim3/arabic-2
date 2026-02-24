import React, { useState, useCallback, useMemo } from 'react';
import './MatchPairs.css';

interface Pair {
    left: string;
    right: string;
}

interface MatchPairsProps {
    prompt: string;
    pairs: Pair[];
    onComplete: (allCorrect: boolean) => void;
}

function shuffle<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

export const MatchPairs: React.FC<MatchPairsProps> = ({ prompt, pairs, onComplete }) => {
    const [shuffledLeft] = useState(() => shuffle(pairs.map(p => p.left)));
    const [shuffledRight] = useState(() => shuffle(pairs.map(p => p.right)));
    const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
    const [selectedRight, setSelectedRight] = useState<string | null>(null);
    const [matched, setMatched] = useState<Set<string>>(new Set());
    const [wrongPair, setWrongPair] = useState<{ left: string; right: string } | null>(null);

    // Wrap pairMap in useMemo to prevent recreation on every render
    const pairMap = useMemo(() => new Map(pairs.map(p => [p.left, p.right])), [pairs]);

    const handleLeftClick = useCallback((left: string) => {
        if (matched.has(left) || wrongPair) return;
        setSelectedLeft(left);

        if (selectedRight !== null) {
            // Check if this pair is correct
            if (pairMap.get(left) === selectedRight) {
                const newMatched = new Set(matched);
                newMatched.add(left);
                setMatched(newMatched);
                setSelectedLeft(null);
                setSelectedRight(null);
                if (newMatched.size === pairs.length) {
                    setTimeout(() => onComplete(true), 600);
                }
            } else {
                setWrongPair({ left, right: selectedRight });
                setTimeout(() => {
                    setWrongPair(null);
                    setSelectedLeft(null);
                    setSelectedRight(null);
                }, 800);
            }
        }
    }, [matched, selectedRight, pairMap, pairs.length, onComplete, wrongPair]);

    const handleRightClick = useCallback((right: string) => {
        // Find which left this right belongs to
        const matchedLeftForRight = pairs.find(p => p.right === right && matched.has(p.left));
        if (matchedLeftForRight || wrongPair) return;
        setSelectedRight(right);

        if (selectedLeft !== null) {
            if (pairMap.get(selectedLeft) === right) {
                const newMatched = new Set(matched);
                newMatched.add(selectedLeft);
                setMatched(newMatched);
                setSelectedLeft(null);
                setSelectedRight(null);
                if (newMatched.size === pairs.length) {
                    setTimeout(() => onComplete(true), 600);
                }
            } else {
                setWrongPair({ left: selectedLeft, right });
                setTimeout(() => {
                    setWrongPair(null);
                    setSelectedLeft(null);
                    setSelectedRight(null);
                }, 800);
            }
        }
    }, [matched, selectedLeft, pairMap, pairs, onComplete, wrongPair]);

    return (
        <div className="match-pairs">
            <div className="match-prompt">{prompt}</div>
            <div className="match-columns">
                <div className="match-column">
                    {shuffledLeft.map(left => {
                        const isMatched = matched.has(left);
                        const isSelected = selectedLeft === left;
                        const isWrong = wrongPair?.left === left;
                        return (
                            <button
                                key={left}
                                className={`match-item match-left ${isMatched ? 'matched' : ''} ${isSelected ? 'selected' : ''} ${isWrong ? 'wrong' : ''}`}
                                onClick={() => handleLeftClick(left)}
                                disabled={isMatched}
                            >
                                {left}
                            </button>
                        );
                    })}
                </div>
                <div className="match-column">
                    {shuffledRight.map(right => {
                        const matchingLeft = pairs.find(p => p.right === right);
                        const isMatched = matchingLeft ? matched.has(matchingLeft.left) : false;
                        const isSelected = selectedRight === right;
                        const isWrong = wrongPair?.right === right;
                        return (
                            <button
                                key={right}
                                className={`match-item match-right ${isMatched ? 'matched' : ''} ${isSelected ? 'selected' : ''} ${isWrong ? 'wrong' : ''}`}
                                onClick={() => handleRightClick(right)}
                                disabled={isMatched}
                            >
                                {right}
                            </button>
                        );
                    })}
                </div>
            </div>
            <div className="match-progress">
                {matched.size} / {pairs.length} matched
            </div>
        </div>
    );
};
