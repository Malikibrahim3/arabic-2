/**
 * Premium / Monetization Layer
 * 
 * Manages premium features, subscription state, and paywall gates.
 * Currently operates in "soft paywall" mode — all features are accessible
 * but premium indicators show where value would be gated.
 * 
 * When Stripe is integrated, this becomes the central authority
 * for feature access control.
 */

export type PremiumFeature =
    | 'ai_conversations'
    | 'ai_corrections'
    | 'advanced_analytics'
    | 'unlimited_hearts'
    | 'offline_mode'
    | 'custom_goals';

interface PremiumState {
    isPremium: boolean;
    plan: 'free' | 'monthly' | 'yearly' | 'lifetime';
    expiresAt: string | null;
    conversationsToday: number;
    conversationLimit: number;  // Free tier limit
    lastConversationDate: string;
}

const STORAGE_KEY = 'arabic_app_premium';
const FREE_DAILY_CONVERSATIONS = 3;

class PremiumManager {
    private state: PremiumState;

    constructor() {
        this.state = this.load();
    }

    private load(): PremiumState {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                // Reset daily counter if new day
                const today = new Date().toISOString().slice(0, 10);
                if (parsed.lastConversationDate !== today) {
                    parsed.conversationsToday = 0;
                    parsed.lastConversationDate = today;
                }
                return parsed;
            }
        } catch (e) {
            console.warn('Failed to load premium state:', e);
        }
        return {
            isPremium: false,
            plan: 'free',
            expiresAt: null,
            conversationsToday: 0,
            conversationLimit: FREE_DAILY_CONVERSATIONS,
            lastConversationDate: new Date().toISOString().slice(0, 10),
        };
    }

    private save() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
        } catch (e) {
            console.warn('Failed to save premium state:', e);
        }
    }

    /** Check if a specific feature is available */
    public canAccess(feature: PremiumFeature): boolean {
        if (this.state.isPremium) return true;

        switch (feature) {
            case 'ai_conversations':
                return this.state.conversationsToday < this.state.conversationLimit;
            case 'ai_corrections':
                return true;  // Free for now
            case 'advanced_analytics':
                return false;
            case 'unlimited_hearts':
                return false;
            case 'offline_mode':
                return false;
            case 'custom_goals':
                return false;
            default:
                return false;
        }
    }

    /** Record a conversation usage */
    public useConversation(): boolean {
        const today = new Date().toISOString().slice(0, 10);
        if (this.state.lastConversationDate !== today) {
            this.state.conversationsToday = 0;
            this.state.lastConversationDate = today;
        }

        if (!this.canAccess('ai_conversations')) return false;

        this.state.conversationsToday++;
        this.save();
        return true;
    }

    /** Get remaining free conversations today */
    public getRemainingConversations(): number {
        if (this.state.isPremium) return Infinity;
        return Math.max(0, this.state.conversationLimit - this.state.conversationsToday);
    }

    /** Get premium status for UI display */
    public getStatus(): {
        isPremium: boolean;
        plan: string;
        remainingConversations: number;
        features: { name: string; available: boolean; premiumOnly: boolean }[];
    } {
        return {
            isPremium: this.state.isPremium,
            plan: this.state.plan,
            remainingConversations: this.getRemainingConversations(),
            features: [
                { name: 'AI Conversations', available: this.canAccess('ai_conversations'), premiumOnly: false },
                { name: 'AI Corrections', available: this.canAccess('ai_corrections'), premiumOnly: false },
                { name: 'Advanced Analytics', available: this.canAccess('advanced_analytics'), premiumOnly: true },
                { name: 'Unlimited Hearts', available: this.canAccess('unlimited_hearts'), premiumOnly: true },
                { name: 'Offline Mode', available: this.canAccess('offline_mode'), premiumOnly: true },
                { name: 'Custom Goals', available: this.canAccess('custom_goals'), premiumOnly: true },
            ],
        };
    }

    /** Upgrade to premium (will be replaced by Stripe integration) */
    public upgradeToPremium(plan: 'monthly' | 'yearly' | 'lifetime') {
        this.state.isPremium = true;
        this.state.plan = plan;
        this.state.expiresAt = plan === 'lifetime' ? null : new Date(Date.now() + (plan === 'monthly' ? 30 : 365) * 86400000).toISOString();
        this.save();
    }
}

export const premiumManager = new PremiumManager();
