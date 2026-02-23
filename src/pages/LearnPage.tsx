import React, { useEffect } from 'react';
import { Star, Check, Lock } from 'lucide-react';
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

    const getIcon = (status: string) => {
        if (status === 'completed') return Check;
        if (status === 'locked') return Lock;
        return Star;
    };

    return (
        <div className="learn-page">
            {courseData.units.map((unit) => (
                <div key={unit.id} className="unit-container">
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
                            const isLocked = node.status === 'locked';
                            const isActive = node.status === 'active';
                            const isCompleted = node.status === 'completed';
                            const offsetX = getPathOffset(index);

                            let buttonClass = 'node-btn ';
                            if (isLocked) buttonClass += 'locked';
                            else if (isActive) buttonClass += 'active';
                            else if (isCompleted) buttonClass += 'completed';

                            return (
                                <div
                                    key={node.id}
                                    className={`node ${node.status}`}
                                    style={{ transform: `translateX(${offsetX}px)` }}
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
                                            style={{
                                                backgroundColor: isLocked ? 'var(--color-surface)' : unit.color,
                                                boxShadow: isLocked ? 'none' : `0 4px 16px ${unit.color}60`,
                                                border: isLocked ? '1px solid var(--color-border)' : '1px solid rgba(255,255,255,0.2)',
                                            }}
                                            onClick={() => {
                                                if (!isLocked) setLocation(`/lesson/${node.id}`);
                                            }}
                                        >
                                            <div className="node-icon-wrapper">
                                                <Icon size={32} strokeWidth={2.5} />
                                            </div>
                                        </button>
                                    </div>

                                    <div className={`node-label ${isLocked ? 'locked' : ''}`}>
                                        {node.title}
                                    </div>

                                    {isActive && (
                                        <div className="start-tooltip" onClick={() => setLocation(`/lesson/${node.id}`)}>
                                            <div className="tooltip-content">START</div>
                                            <div className="tooltip-arrow"></div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
};
