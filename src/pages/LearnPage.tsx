import React, { useEffect, useState } from 'react';
import { Star, Check, Lock, Unlock } from 'lucide-react';
import { useLocation } from 'wouter';
import { courseData } from '../data/course';
import './LearnPage.css';

// SVG progress ring around each node
const ProgressRing: React.FC<{ completed: number; total: number; color: string; size?: number }> = ({
    completed, total, color, size = 96
}) => {
    const stroke = 4;
    const radius = (size - stroke) / 2;
    const segmentGap = 4; // gap between segments in degrees
    const segmentAngle = (360 - segmentGap * total) / total;

    return (
        <svg className="progress-ring" width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            {Array.from({ length: total }, (_, i) => {
                const startAngle = i * (segmentAngle + segmentGap) - 90;
                const endAngle = startAngle + segmentAngle;
                const isFilled = i < completed;

                const startRad = (startAngle * Math.PI) / 180;
                const endRad = (endAngle * Math.PI) / 180;
                const cx = size / 2;
                const cy = size / 2;

                const x1 = cx + radius * Math.cos(startRad);
                const y1 = cy + radius * Math.sin(startRad);
                const x2 = cx + radius * Math.cos(endRad);
                const y2 = cy + radius * Math.sin(endRad);
                const largeArc = segmentAngle > 180 ? 1 : 0;

                return (
                    <path
                        key={i}
                        d={`M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`}
                        stroke={isFilled ? color : '#E5E5E5'}
                        strokeWidth={stroke}
                        fill="none"
                        strokeLinecap="round"
                    />
                );
            })}
        </svg>
    );
};

export const LearnPage: React.FC = () => {
    const [, setLocation] = useLocation();
    const [isGodMode, setIsGodMode] = useState(() => localStorage.getItem('godMode') === 'true');

    useEffect(() => {
        localStorage.setItem('godMode', String(isGodMode));
    }, [isGodMode]);

    useEffect(() => {
        const activeNode = document.querySelector('.node.active');
        if (activeNode) {
            activeNode.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, []);

    const getPathOffset = (index: number) => {
        const offsets = [0, 40, 70, 40, 0, -40, -70, -40];
        return offsets[index % 8];
    };

    const handleNodeClick = (node: any, isLocked: boolean) => {
        if (!isLocked) {
            setLocation(`/lesson/${node.id}`);
            return;
        }

        // If clicking a locked node when God Mode is OFF, prompt to jump ahead
        if (!isGodMode) {
            const confirmed = window.confirm(
                "Are you sure you want to jump ahead? This will permanently unlock all previous content."
            );

            if (confirmed) {
                // God Mode: Mark all previous nodes as completed for testing
                // This allows testers to access any lesson without completing prerequisites
                // We iterate through courseData, mark everything before this node as 'completed'
                // and mark this node as 'active'.
                let foundTarget = false;
                courseData.units.forEach(u => {
                    u.nodes.forEach(n => {
                        if (!foundTarget) {
                            if (n.id === node.id) {
                                n.status = 'active';
                                n.completedRounds = n.totalRounds;
                                foundTarget = true;
                            } else {
                                n.status = 'completed';
                                n.completedRounds = n.totalRounds;
                            }
                        }
                    });
                });

                // Force a re-render so they see the unlock (or just navigate straight in)
                setLocation(`/lesson/${node.id}`);
            }
        }
    };

    const getIcon = (status: string) => {
        if (status === 'completed') return Check;
        if (status === 'locked') return Lock;
        return Star;
    };

    // Pre-compute linear progression locks
    const allNodes = courseData.units.flatMap(u => u.nodes);
    const computedStatus = new Map<string, string>();
    let isPreviousCompleted = true; // First node is always unlocked

    allNodes.forEach((node) => {
        let derivedStatus = node.status;
        if (isGodMode) {
            derivedStatus = derivedStatus === 'completed' ? 'completed' : 'active';
        } else {
            if (isPreviousCompleted) {
                if (derivedStatus !== 'completed') derivedStatus = 'active';
            } else {
                derivedStatus = 'locked';
            }
        }
        computedStatus.set(node.id, derivedStatus);

        // A node only unlocks the next one if it is fully completed in memory
        isPreviousCompleted = (node.status === 'completed');
    });

    return (
        <div className="learn-page">
            <div className="learn-page-header">
                <button
                    className={`god-mode-toggle ${isGodMode ? 'active' : ''}`}
                    onClick={() => setIsGodMode(!isGodMode)}
                    title="Unlock all levels"
                >
                    {isGodMode ? <Unlock size={18} /> : <Lock size={18} />}
                    <span>{isGodMode ? 'All Unlocked' : 'Jump Ahead'}</span>
                </button>
            </div>

            {courseData.units.map((unit) => {
                // A unit is fully locked if its very first node is locked
                const firstNodeId = unit.nodes.length > 0 ? unit.nodes[0].id : null;
                const isUnitLocked = firstNodeId && computedStatus.get(firstNodeId) === 'locked';

                return (
                    <div key={unit.id} className={`unit-container ${isUnitLocked ? 'unit-locked' : ''}`}>
                        <header className="unit-header" style={{ backgroundColor: unit.color }}>
                            <div className="unit-header-content">
                                <h2 className="unit-title">{unit.title}</h2>
                                <p className="unit-desc">{unit.description}</p>
                            </div>
                            <button className="unit-guide-btn">Guide</button>
                        </header>

                        <div className="path-container" style={{ '--path-color': unit.color } as React.CSSProperties}>
                            {unit.nodes.map((node, index) => {
                                const derivedStatus = computedStatus.get(node.id) || 'locked';
                                const Icon = getIcon(derivedStatus);
                                const isLocked = derivedStatus === 'locked';
                                const isActive = derivedStatus === 'active';
                                const isCompleted = derivedStatus === 'completed';
                                const offsetX = getPathOffset(index);

                                let buttonClass = 'node-btn ';
                                if (isCompleted && !isActive) buttonClass += 'completed ';
                                else if (isLocked) buttonClass += 'locked ';
                                else if (isActive) buttonClass += 'active ';

                                const isDisabled = isLocked && !isGodMode;

                                return (
                                    <div
                                        key={node.id}
                                        className={`node ${derivedStatus}`}
                                        style={{
                                            transform: `translateX(${offsetX}px)`,
                                            pointerEvents: isDisabled ? 'none' : 'auto'
                                        }}
                                        onClick={() => {
                                            if (!isDisabled) {
                                                handleNodeClick(node, isLocked);
                                            }
                                        }}
                                    >
                                        <div className="node-ring-wrapper">
                                            {/* Progress ring showing round completion */}
                                            {!isLocked && (
                                                <ProgressRing
                                                    completed={node.completedRounds}
                                                    total={node.totalRounds}
                                                    color={unit.color}
                                                />
                                            )}
                                            <button
                                                className={buttonClass}
                                                disabled={isDisabled}
                                                style={{
                                                    backgroundColor: isLocked ? 'var(--color-surface)' : unit.color,
                                                    boxShadow: isLocked ? 'none' : `0 4px 16px ${unit.color}60`,
                                                    border: isLocked ? '1px solid var(--color-border)' : '1px solid rgba(255,255,255,0.2)',
                                                    opacity: isLocked ? 0.4 : 1,
                                                    cursor: isLocked ? 'not-allowed' : 'pointer',
                                                    pointerEvents: isDisabled ? 'none' : 'auto'
                                                }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (!isDisabled) handleNodeClick(node, isLocked);
                                                }}
                                            >
                                                <div className="node-icon-wrapper" style={{ opacity: isLocked ? 0.5 : 1 }}>
                                                    <Icon size={32} strokeWidth={2.5} />
                                                </div>
                                            </button>
                                        </div>

                                        <div className={`node-label ${isLocked ? 'locked' : ''}`}>
                                            {node.title}
                                            {!isLocked && node.totalRounds > 0 && (
                                                <div style={{ 
                                                    fontSize: '11px', 
                                                    opacity: 0.7, 
                                                    marginTop: '2px',
                                                    fontWeight: 500
                                                }}>
                                                    {node.completedRounds}/{node.totalRounds}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )
            })}
        </div>
    );
};
