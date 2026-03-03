import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Share2, Trophy, Medal, Award, Loader2 } from 'lucide-react';
import { syncLeaderboard, fetchLeaderboard, getLocalUserId } from '../data/leaderboardApi';
import type { LeaderboardEntry } from '../data/leaderboardApi';
import './Leaderboard.css';

export const Leaderboard: React.FC<{ currentUserXp: number, currentStreak: number }> = ({ currentUserXp, currentStreak }) => {
    const [timeframe, setTimeframe] = useState<'weekly' | 'all-time'>('weekly');
    const [displayData, setDisplayData] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadLeaderboard = async () => {
            setLoading(true);
            const myUserId = getLocalUserId();

            // Sync local progress to DB
            await syncLeaderboard(currentUserXp, currentStreak);

            // Fetch the updated top global users
            const data = await fetchLeaderboard();

            // Map the current user explicitly to give them the highlight
            const mappedData = data.map(user => ({
                ...user,
                isCurrentUser: user.id === myUserId || user.id === 'user' // 'user' covers the fallback mock data scenario
            }));

            setDisplayData(mappedData);
            setLoading(false);
        };

        loadLeaderboard();
    }, [currentUserXp, currentStreak, timeframe]);

    const handleShare = async () => {
        const text = `I'm on a ${currentStreak}-day Arabic learning streak and ranked #${displayData.find(u => u.isCurrentUser)?.rank} this week! 🏆`;
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'My Arabic Progress',
                    text: text,
                    url: window.location.origin
                });
            } catch (err) {
                console.log('Share dismissed or failed', err);
            }
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(text);
            alert('Progress copied to clipboard!');
        }
    };

    const getRankIcon = (rank: number) => {
        switch (rank) {
            case 1: return <Trophy size={20} color="#FBBF24" />; // Gold
            case 2: return <Medal size={20} color="#9CA3AF" />;  // Silver
            case 3: return <Award size={20} color="#B45309" />;  // Bronze
            default: return <span className="rank-number">{rank}</span>;
        }
    };

    return (
        <div className="leaderboard-container">
            <div className="leaderboard-header">
                <div>
                    <h2 className="leaderboard-title">League Standings</h2>
                    <p className="leaderboard-subtitle">Compete with other learners</p>
                </div>
                <button className="share-btn" onClick={handleShare}>
                    <Share2 size={16} /> <span>Share</span>
                </button>
            </div>

            <div className="leaderboard-tabs">
                <button
                    className={`tab-btn ${timeframe === 'weekly' ? 'active' : ''}`}
                    onClick={() => setTimeframe('weekly')}
                >
                    Weekly
                </button>
                <button
                    className={`tab-btn ${timeframe === 'all-time' ? 'active' : ''}`}
                    onClick={() => setTimeframe('all-time')}
                >
                    All Time
                </button>
            </div>

            <div className="leaderboard-list">
                {loading ? (
                    <div style={{ padding: '40px', display: 'flex', justifyContent: 'center', opacity: 0.5 }}>
                        <Loader2 className="spinner" size={24} />
                    </div>
                ) : displayData.map((user, i) => (
                    <motion.div
                        key={user.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className={`leaderboard-row ${user.isCurrentUser ? 'current-user' : ''}`}
                    >
                        <div className="rank-col">{getRankIcon(user.rank)}</div>
                        <div className="avatar-col">{user.avatarUrl}</div>
                        <div className="name-col">
                            <span className="username">{user.username}</span>
                        </div>
                        <div className="stats-col">
                            <div className="xp-stat">{user.xp.toLocaleString()} XP</div>
                            <div className="streak-stat">🔥 {user.streak}</div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="leaderboard-footer">
                <p>Leagues reset every Sunday night. Keep learning to rank up!</p>
            </div>
        </div>
    );
};
