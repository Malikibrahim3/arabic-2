import React, { useEffect, useState } from 'react';
import { Star, Check, Lock, Unlock } from 'lucide-react';
import { useLocation } from 'wouter';
import { getCourseData } from '../data/course';
import { useDialect } from '../context/DialectContext';
import { srsEngine } from '../data/srsEngine';
import { loadProgress, loadStats } from '../data/progressStore';
import { difficultyEngine } from '../data/difficultyEngine';
import { Modal, ModalButton } from '../components/Modal';
import type { CourseNode, Unit } from '../data/types';
import './LearnPage.css';

// SVG progress ring around each node
const ProgressRing: React.FC<{ completed: number; total: number; color: string; size?: number }> = ({
    completed, total, color, size = 96
}) => {
    const stroke = 4;
    const radius = (size - stroke) / 2;
    const segmentGap = 4;
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

interface LearnPageProps {
    pathType: 'reading' | 'speaking' | 'hybrid';
}

// Dev mode: only show God Mode in development
const IS_DEV = import.meta.env.DEV;

// AF4: Stage fluency outcomes
const STAGE_OUTCOMES: Record<string, string> = {
    '1': 'After this stage: Read individual Arabic letters',
    '2': 'After this stage: Read short vowels and letter forms',
    '3': 'After this stage: Read and write simple syllables',
    '4': 'After this stage: Read basic Arabic words',
    '5': 'After this stage: Read complete Arabic sentences',
    '6': 'After this stage: Write from dictation',
    '7': 'After this stage: Read newspaper-level paragraphs',
    '9': 'After this stage: Read Quranic verses',
    '101': 'After this stage: Pronounce all 28 Arabic letters',
    '102': 'After this stage: Use greetings and introduce yourself',
    '103': 'After this stage: Count, name colors, describe family',
    '201': 'After this stage: Switch between Dialect and MSA script',
};

export const LearnPage: React.FC<LearnPageProps> = ({ pathType }) => {
    const { currentDialect } = useDialect();
    const course = getCourseData(currentDialect || 'msa');
    const [, setLocation] = useLocation();
    const [isGodMode, setIsGodMode] = useState(() => IS_DEV && localStorage.getItem('godMode') === 'true');
    const [jumpModal, setJumpModal] = useState<{ isOpen: boolean; nodeId: string | null }>({ isOpen: false, nodeId: null });

    // Force re-render when coming back from a lesson
    const [, setRefreshKey] = useState(0);
    useEffect(() => {
        setRefreshKey(k => k + 1);
    }, [pathType]);

    useEffect(() => {
        if (IS_DEV) {
            localStorage.setItem('godMode', String(isGodMode));
        }
    }, [isGodMode]);

    useEffect(() => {
        const activeNode = document.querySelector('.node.active');
        if (activeNode) {
            activeNode.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [pathType]);

    // Apply persisted progress to all nodes
    const savedProgress = loadProgress();
    course.units.forEach((unit: Unit) => {
        unit.nodes.forEach((node: CourseNode) => {
            const saved = savedProgress[node.id];
            if (saved) {
                node.completedRounds = Math.max(node.completedRounds, saved.completedRounds);
                if (saved.status === 'completed') node.status = 'completed';
                if (saved.masteryState) node.masteryState = saved.masteryState;
                if (saved.masteryScore !== undefined) node.masteryScore = saved.masteryScore;
            }
        });
    });

    // Filter units based on the URL path
    const visibleUnits = course.units.filter((u: Unit) => u.path === pathType || u.path === 'both');

    const [dueItems, setDueItems] = useState(srsEngine.getDueItems());
    useEffect(() => {
        setDueItems(srsEngine.getDueItems());
    }, []);

    const getPathOffset = (index: number) => {
        const offsets = [0, 40, 70, 40, 0, -40, -70, -40];
        return offsets[index % 8];
    };

    const handleNodeClick = (node: CourseNode, isLocked: boolean) => {
        if (!isLocked) {
            setLocation(`/lesson/${node.id}`);
            return;
        }

        // Locked node: show modal
        if (!isGodMode) {
            setJumpModal({ isOpen: true, nodeId: node.id });
        }
    };

    const handleJumpConfirm = () => {
        const targetNodeId = jumpModal.nodeId;
        setJumpModal({ isOpen: false, nodeId: null });
        if (!targetNodeId) return;

        // Mark all previous nodes as completed
        let foundTarget = false;
        course.units.forEach((u: Unit) => {
            u.nodes.forEach((n: CourseNode) => {
                if (!foundTarget) {
                    if (n.id === targetNodeId) {
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

        setLocation(`/lesson/${targetNodeId}`);
    };

    const getIcon = (status: string) => {
        if (status === 'completed') return Check;
        if (status === 'locked') return Lock;
        return Star;
    };

    // Pre-compute linear progression locks
    const allNodes = visibleUnits.flatMap((u: Unit) => u.nodes);
    const computedStatus = new Map<string, string>();
    let isPreviousCompleted = true;

    allNodes.forEach((node: CourseNode) => {
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
        isPreviousCompleted = (node.status === 'completed');
    });

    // Load stats for the dashboard
    const stats = loadStats();

    return (
        <div className="learn-page">
            <div className="learn-page-header">
                <button className="path-back-btn" onClick={() => setLocation('/')}>
                    ← Switch Path
                </button>
                <span className="current-path-label">
                    {pathType === 'reading' ? '📖 Reading & Writing' : '🗣️ Speaking & Listening'}
                </span>
                {IS_DEV && (
                    <button
                        className={`god-mode-toggle ${isGodMode ? 'active' : ''}`}
                        onClick={() => setIsGodMode(!isGodMode)}
                        title="[DEV] Unlock all levels"
                    >
                        {isGodMode ? <Unlock size={18} /> : <Lock size={18} />}
                        <span>{isGodMode ? 'Dev Mode' : 'Jump'}</span>
                    </button>
                )}
            </div>

            {/* Stats Dashboard */}
            {stats.totalExercisesCompleted > 0 && (
                <div className="learn-stats-bar">
                    <div className="learn-stat-item">
                        <span className="learn-stat-icon">🔥</span>
                        <span className="learn-stat-value">{stats.currentStreak}</span>
                        <span className="learn-stat-label">Streak</span>
                    </div>
                    <div className="learn-stat-item">
                        <span className="learn-stat-icon">✅</span>
                        <span className="learn-stat-value">{stats.totalExercisesCompleted}</span>
                        <span className="learn-stat-label">Exercises</span>
                    </div>
                    <div className="learn-stat-item">
                        <span className="learn-stat-icon">🎯</span>
                        <span className="learn-stat-value">
                            {stats.totalExercisesCompleted > 0
                                ? Math.round((stats.totalCorrect / stats.totalExercisesCompleted) * 100)
                                : 0}%
                        </span>
                        <span className="learn-stat-label">Accuracy</span>
                    </div>
                    <div className="learn-stat-item">
                        <span className="learn-stat-icon">⏱️</span>
                        <span className="learn-stat-value">
                            {Math.round(stats.totalTimeSpentMs / 60000)}m
                        </span>
                        <span className="learn-stat-label">Time</span>
                    </div>
                </div>
            )}

            {dueItems.length > 0 && (
                <div style={{
                    margin: '0 24px 24px 24px',
                    padding: '24px',
                    background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)',
                    borderRadius: '16px',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: '0 8px 16px rgba(255, 107, 107, 0.2)'
                }}>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            🔥 Daily Warm-Up
                        </h3>
                        <p style={{ margin: '4px 0 0 0', opacity: 0.9, fontSize: '14px' }}>
                            You have {dueItems.length} unstable items to review before continuing.
                        </p>
                    </div>
                    <button
                        onClick={() => setLocation('/lesson/warmup')}
                        style={{
                            background: 'white',
                            color: '#FF6B6B',
                            border: 'none',
                            padding: '12px 24px',
                            borderRadius: '24px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}
                    >
                        Start Queue
                    </button>
                </div>
            )}

            {/* AF5: Continue Button — auto-navigate to next incomplete node */}
            {(() => {
                const nextNode = allNodes.find(n => computedStatus.get(n.id) === 'active');
                if (nextNode) {
                    return (
                        <div style={{
                            margin: '0 24px 24px 24px',
                            padding: '16px 24px',
                            background: 'linear-gradient(135deg, #818CF8 0%, #6366F1 100%)',
                            borderRadius: '16px',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            boxShadow: '0 8px 16px rgba(99, 102, 241, 0.3)',
                            cursor: 'pointer',
                        }} onClick={() => setLocation(`/lesson/${nextNode.id}`)}>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '18px' }}>▶ Continue Learning</h3>
                                <p style={{ margin: '4px 0 0 0', opacity: 0.85, fontSize: '13px' }}>
                                    {nextNode.title}
                                    {difficultyEngine.getTier() !== 'normal' && (
                                        <span style={{ marginLeft: 8, opacity: 0.7 }}>
                                            ({difficultyEngine.getTier() === 'hard' ? '🔥 Hard Mode' : '🌱 Easy Mode'})
                                        </span>
                                    )}
                                </p>
                            </div>
                            <span style={{ fontSize: '24px' }}>→</span>
                        </div>
                    );
                }
                return null;
            })()}

            {visibleUnits.map((unit: Unit) => {
                const firstNodeId = unit.nodes.length > 0 ? unit.nodes[0].id : null;
                const isUnitLocked = firstNodeId && computedStatus.get(firstNodeId) === 'locked';

                return (
                    <div key={unit.id} className={`unit-container ${isUnitLocked ? 'unit-locked' : ''}`}>
                        <header className="unit-header" style={{ backgroundColor: unit.color }}>
                            <div className="unit-header-content">
                                <h2 className="unit-title">{unit.title}</h2>
                                <p className="unit-desc">{unit.description}</p>
                                {STAGE_OUTCOMES[String(unit.id)] && (
                                    <p style={{ margin: '4px 0 0 0', fontSize: '12px', opacity: 0.85, fontStyle: 'italic' }}>
                                        {STAGE_OUTCOMES[String(unit.id)]}
                                    </p>
                                )}
                            </div>
                            <button className="unit-guide-btn">Guide</button>
                        </header>

                        <div className="path-container" style={{ '--path-color': unit.color } as React.CSSProperties}>
                            {unit.nodes.map((node: CourseNode, index: number) => {
                                const derivedStatus = computedStatus.get(node.id) || 'locked';
                                const Icon = getIcon(derivedStatus);
                                const isLocked = derivedStatus === 'locked';
                                const isActive = derivedStatus === 'active';
                                const isCompleted = derivedStatus === 'completed';
                                const isRegressed = node.masteryState === 'regression';
                                const offsetX = getPathOffset(index);

                                let buttonClass = 'node-btn ';
                                if (isCompleted && !isActive) buttonClass += 'completed ';
                                else if (isLocked) buttonClass += 'locked ';
                                else if (isActive) buttonClass += 'active ';
                                if (isRegressed) buttonClass += 'regression ';

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
                                            {!isLocked && (
                                                <ProgressRing
                                                    completed={node.completedRounds}
                                                    total={node.totalRounds}
                                                    color={isRegressed ? '#EF4444' : unit.color}
                                                />
                                            )}
                                            <button
                                                className={buttonClass}
                                                disabled={isDisabled}
                                                style={{
                                                    backgroundColor: isRegressed ? '#7F1D1D' : isLocked ? 'var(--color-surface)' : unit.color,
                                                    boxShadow: isLocked ? 'none' : isRegressed ? '0 4px 16px rgba(239, 68, 68, 0.4)' : `0 4px 16px ${unit.color}60`,
                                                    border: isRegressed ? '2px solid #EF4444' : isLocked ? '1px solid var(--color-border)' : '1px solid rgba(255,255,255,0.2)',
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
                                            {isRegressed && <span style={{ color: '#F87171', fontSize: '11px', display: 'block' }}>🔄 Review</span>}
                                            {!isLocked && node.totalRounds > 0 && !isRegressed && (
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
                );
            })}

            {/* Jump Ahead Modal (replaces window.confirm) */}
            <Modal
                isOpen={jumpModal.isOpen}
                onClose={() => setJumpModal({ isOpen: false, nodeId: null })}
                title="Jump Ahead?"
                type="warning"
                actions={
                    <>
                        <ModalButton variant="secondary" onClick={() => setJumpModal({ isOpen: false, nodeId: null })}>
                            Cancel
                        </ModalButton>
                        <ModalButton variant="danger" onClick={handleJumpConfirm}>
                            Yes, Jump Ahead
                        </ModalButton>
                    </>
                }
            >
                <p style={{ margin: 0 }}>
                    This will permanently unlock all previous content. Are you sure you want to skip ahead?
                </p>
                <p style={{ margin: '12px 0 0 0', fontSize: '13px', opacity: 0.7 }}>
                    ⚠️ You may miss important foundational material.
                </p>
            </Modal>
        </div>
    );
};
