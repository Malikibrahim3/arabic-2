import { llmCache } from './llmCache';

const GEMINI_API_KEY = import.meta.env.VITE_GOOGLE_CLOUD_API_KEY;

// System instructions to ensure Gemini acts exactly as we want and returns parseable JSON.
const CORRECTION_SYSTEM_PROMPT = `
You are a ruthlessly efficient Arabic linguistics tutor.
You are given what the user was supposed to say, what they actually said, and the dialect they are targeting.
Your goal is to provide a single, punchy sentence explaining exactly what they got wrong.

Rules:
1. Return ONLY pure JSON. No markdown backticks, no markdown blocks.
2. The JSON must have exactly one key: "feedback" (string).
3. Do not be overly polite or conversational. Just state the error and correction clearly.
4. Keep the feedback under 20 words.
5. If the user said something completely unrelated, say so.
6. If it's a pronunciation (letter substitution) error, point out the letters mixed up.
`;

const ROLEPLAY_SYSTEM_PROMPT = `
You are a native Arabic speaker conversing in a roleplay scenario.
Your goal is to sustain a natural, immersive back-and-forth conversation.

Rules:
1. Return ONLY pure JSON. No markdown backticks.
2. The JSON must have exactly three keys: "replyArabic" (string, the Arabic response), "replyEnglish" (string, the English translation), and "correction" (string or null).
3. Keep your replies short and natural (1-2 sentences max).
4. If the user makes a grammar or vocabulary mistake, set "correction" to a brief, helpful note (e.g. "You said X, it should be Y"). Otherwise set "correction" to null.
5. Use the specified dialect exclusively. Do not mix MSA and Egyptian.
6. Keep the conversation flowing naturally — ask follow-up questions, react to what the user says.
`;

export class LLMService {

    /**
     * Generates a structural/pronunciation correction for a failed speaking exercise.
     * Uses the caching layer to prevent redundant API calls.
     */
    static async getCorrection(spoken: string, expected: string, dialect: string): Promise<string> {
        if (!GEMINI_API_KEY) {
            console.warn("LLM Service: No Gemini API Key defined.");
            return `You said "${spoken}" instead of "${expected}". Keep practicing!`;
        }

        // 1. Check cache FIRST
        const cachedFeedback = llmCache.getCorrection(spoken, expected, dialect);
        if (cachedFeedback) {
            return cachedFeedback;
        }

        // 2. Cache Miss: Call Gemini
        const prompt = `
Target Dialect: ${dialect}
Expected Phrase: "${expected}"
Actual User Input: "${spoken}"

Provide your feedback JSON.
`;

        try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    systemInstruction: {
                        parts: [{ text: CORRECTION_SYSTEM_PROMPT }]
                    },
                    contents: [{
                        parts: [{ text: prompt }]
                    }],
                    generationConfig: {
                        temperature: 0.2, // Low temp for deterministic corrections
                        responseMimeType: 'application/json'
                    }
                })
            });

            if (!response.ok) {
                const error = await response.text();
                throw new Error(`Gemini API Error: ${response.status} - ${error}`);
            }

            const data = await response.json();
            const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

            if (!textResponse) throw new Error("Empty response from Gemini");

            const parsed = JSON.parse(textResponse);

            if (!parsed.feedback) throw new Error("Invalid format from Gemini");

            // 3. Save to Cache
            llmCache.saveCorrection(spoken, expected, dialect, parsed.feedback);

            return parsed.feedback;

        } catch (e) {
            console.error("LLM Generation Failed:", e);
            return `You said "${spoken}" instead of "${expected}". Keep practicing!`; // Graceful fallback
        }
    }

    /**
     * Fully dynamic layer: Generates a roleplay reply. NEVER cached.
     */
    static async generateRoleplayReply(
        history: { role: 'user' | 'model', content: string }[],
        scenario: string,
        dialect: string
    ): Promise<{ replyArabic: string, replyEnglish: string, correction?: string | null }> {

        if (!GEMINI_API_KEY) {
            return {
                replyArabic: "عفواً، لا أستطيع التحدث الآن.",
                replyEnglish: "Sorry, I cannot speak right now."
            };
        }

        // Format history for Gemini API
        const contents = history.map(msg => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }]
        }));

        // Inject scenario context into the latest user message
        const lastMsg = contents[contents.length - 1];
        lastMsg.parts[0].text = `
[Context: The scenario is "${scenario}". 
The target dialect is ${dialect}.]

User says: ${lastMsg.parts[0].text}

Please provide your response JSON.
`;

        try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    systemInstruction: {
                        parts: [{ text: ROLEPLAY_SYSTEM_PROMPT }]
                    },
                    contents: contents,
                    generationConfig: {
                        temperature: 0.7, // Higher temp for natural conversation
                        responseMimeType: 'application/json'
                    }
                })
            });

            if (!response.ok) {
                const error = await response.text();
                throw new Error(`Gemini API Error: ${response.status} - ${error}`);
            }

            const data = await response.json();
            const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

            if (!textResponse) throw new Error("Empty response from Gemini");

            const parsed = JSON.parse(textResponse);

            if (!parsed.replyArabic || !parsed.replyEnglish) throw new Error("Invalid format from Gemini");

            return parsed;

        } catch (e) {
            console.error("LLM Chat Generation Failed:", e);
            return {
                replyArabic: "(حدث خطأ في الاتصال)",
                replyEnglish: "(Connection error occurred)"
            };
        }
    }
}
