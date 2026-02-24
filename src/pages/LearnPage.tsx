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
    const [isGodMode, setIsGodMode] = useState(false);

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

        // If clicking a locked test/checkpoint when God Mode is OFF, prompt to jump ahead
        if (!isGodMode && node.type === 'test') {
            const confirmed = window.confirm(
                "Are you sure you want to jump ahead to this checkpoint? This will permanently unlock all previous content."
            );

            if (confirmed) {
                // Hacky local-state override for demo purposes:
                // We iterate through courseData, mark everything before this node as 'completed'
                // and mark this node as 'active'.
                let foundTarget = false;
                courseData.units.forEach(u => {
                    u.nodes.forEach(n => {
                        if (!foundTarget) {
                            if (n.id === node.id) {
                                n.status = 'active';
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
                // A unit is fully locked if it has no completed nodes AND no active nodes (i.e. all nodes are locked)
                // We simplify this by checking if the very first node is locked.
                const isUnitLocked = unit.nodes.length > 0 && unit.nodes[0].status === 'locked' && !isGodMode;

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
                                const Icon = getIcon(node.status);
                                let isLocked = node.status === 'locked';
                                const isActive = node.status === 'active';
                                const isCompleted = node.status === 'completed';
                                const offsetX = getPathOffset(index);

                                // God mode overrides locked visual status for navigation
                                if (isGodMode && isLocked) {
                                    isLocked = false;
                                }

                                let buttonClass = 'node-btn ';
                                if (isCompleted && !isActive) buttonClass += 'completed ';
                                else if (isLocked) buttonClass += 'locked ';
                                else if (isActive || (isGodMode && (node.status === 'locked' || node.status === 'active'))) buttonClass += 'active ';

                                const isDisabled = isLocked && !isGodMode;

                                return (
                                    <div
                                        key={node.id}
                                        className={`node ${node.status}`}
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
