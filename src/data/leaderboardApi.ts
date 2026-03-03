import { supabase } from './supabaseClient';

export interface LeaderboardEntry {
    id: string; // uuid from local storage or actual auth
    rank: number;
    username: string;
    xp: number;
    streak: number;
    isCurrentUser?: boolean;
    avatarUrl?: string;
}

// Fallback Mock Data
export const MOCK_LEADERBOARD: LeaderboardEntry[] = [
    { id: '1', rank: 1, username: 'Amira_99', xp: 12450, streak: 45, avatarUrl: '👩🏽' },
    { id: '2', rank: 2, username: 'Tarek_egy', xp: 11200, streak: 32, avatarUrl: '👨🏽' },
    { id: '3', rank: 3, username: 'SarahLearn', xp: 10850, streak: 12, avatarUrl: '👩🏼' },
    { id: '4', rank: 5, username: 'Youssef22', xp: 9100, streak: 5, avatarUrl: '👨🏻' },
    { id: '5', rank: 6, username: 'Nour_stars', xp: 8750, streak: 21, avatarUrl: '👧🏽' },
    { id: '6', rank: 7, username: 'Ahmed_L', xp: 8200, streak: 3, avatarUrl: '👦🏽' },
];

/**
 * Returns a consistent UUID for the local user session.
 * Used to identify the anonymous user on the Supabase leaderboard.
 */
export function getLocalUserId(): string {
    let id = localStorage.getItem('local_user_id');
    if (!id) {
        id = crypto.randomUUID ? crypto.randomUUID() : 'user_' + Date.now() + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('local_user_id', id);
    }
    return id;
}

/**
 * Syncs the current user's XP and Streak to Supabase.
 */
export async function syncLeaderboard(xp: number, streak: number): Promise<void> {
    if (!supabase) return; // Fallback to local only

    const userId = getLocalUserId();
    const username = localStorage.getItem('local_username') || 'Learner_' + userId.substring(0, 4);

    try {
        await supabase
            .from('leaderboard')
            .upsert({
                id: userId,
                username,
                xp,
                streak,
                avatarUrl: '👤',
                last_updated: new Date().toISOString()
            });
    } catch (error) {
        console.warn('Failed to sync leaderboard to Supabase. Table likely does not exist yet.', error);
    }
}

/**
 * Fetches top 50 users from the leaderboard, injecting the mock users if the DB is empty or fails.
 */
export async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
    if (!supabase) return MOCK_LEADERBOARD;

    try {
        const { data, error } = await supabase
            .from('leaderboard')
            .select('*')
            .order('xp', { ascending: false })
            .limit(50);

        if (error) throw error;

        let entries = data as LeaderboardEntry[];

        // If DB is totally empty (fresh setup), seed it with mocks so UI doesn't look broken
        if (entries.length === 0) {
            entries = [...MOCK_LEADERBOARD];
        }

        return entries.map((entry, index) => ({
            ...entry,
            rank: index + 1
        }));
    } catch (error) {
        console.warn('Fallback to mock leaderboard due to error:', error);
        return MOCK_LEADERBOARD;
    }
}
