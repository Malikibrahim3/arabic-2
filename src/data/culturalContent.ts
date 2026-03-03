/**
 * Cultural Content Layer
 * 
 * Egyptian Arabic cultural content for immersive learning:
 * - Proverbs (أمثال شعبية)
 * - Common expressions and slang
 * - Cultural tips and context
 * 
 * Used as interstitial content between exercises and as
 * bonus material in conversation exercises.
 */

export interface CulturalItem {
    id: string;
    type: 'proverb' | 'expression' | 'slang' | 'cultural_tip';
    arabic: string;
    transliteration: string;
    english: string;
    context: string;        // When/how to use it
    difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export const CULTURAL_CONTENT: CulturalItem[] = [
    // ─── Proverbs (أمثال شعبية) ──────────────────────────────
    {
        id: 'prv-1',
        type: 'proverb',
        arabic: 'اللي فات مات',
        transliteration: 'illi faat maat',
        english: 'What\'s past is dead (let bygones be bygones)',
        context: 'Used when someone keeps bringing up old problems. Egyptians say this when they want to move on from the past.',
        difficulty: 'beginner',
    },
    {
        id: 'prv-2',
        type: 'proverb',
        arabic: 'الصبر مفتاح الفرج',
        transliteration: 'es-sabr muftaah el-farag',
        english: 'Patience is the key to relief',
        context: 'An extremely common saying in Egypt, used to comfort someone going through hardship.',
        difficulty: 'beginner',
    },
    {
        id: 'prv-3',
        type: 'proverb',
        arabic: 'العين ما تعلاش على الحاجب',
        transliteration: 'el-3ein ma te3laash 3ala el-haagib',
        english: 'The eye can\'t rise above the eyebrow (know your place)',
        context: 'Used when someone oversteps their boundaries, especially younger people with elders.',
        difficulty: 'intermediate',
    },
    {
        id: 'prv-4',
        type: 'proverb',
        arabic: 'يا بخت من بكّى وبكّاه',
        transliteration: 'ya bakht min bakka wi bakkaah',
        english: 'Lucky is the one who made you cry and you made them cry (love hurts)',
        context: 'A romantic proverb about intense, passionate love. Used when talking about relationships.',
        difficulty: 'advanced',
    },
    {
        id: 'prv-5',
        type: 'proverb',
        arabic: 'الجار قبل الدار',
        transliteration: 'el-gaar abl ed-daar',
        english: 'The neighbor before the house',
        context: 'Meaning: choose your neighbors carefully, they matter more than the house itself. Very Egyptian.',
        difficulty: 'beginner',
    },

    // ─── Common Expressions ──────────────────────────────────
    {
        id: 'exp-1',
        type: 'expression',
        arabic: 'إن شاء الله',
        transliteration: 'in shaa\' allaah',
        english: 'God willing / hopefully / maybe',
        context: 'Used constantly in daily life. Can mean genuine hope, a soft "no", or a polite "I\'ll try."',
        difficulty: 'beginner',
    },
    {
        id: 'exp-2',
        type: 'expression',
        arabic: 'ما شاء الله',
        transliteration: 'maa shaa\' allaah',
        english: 'What God has willed (wow, amazing)',
        context: 'Said when you see something beautiful or impressive—a baby, a car, food. It also protects from the evil eye.',
        difficulty: 'beginner',
    },
    {
        id: 'exp-3',
        type: 'expression',
        arabic: 'يا سلام',
        transliteration: 'ya salaam',
        english: 'Oh wonderful! / How amazing!',
        context: 'An exclamation of delight. Used when hearing good news or seeing something impressive.',
        difficulty: 'beginner',
    },
    {
        id: 'exp-4',
        type: 'expression',
        arabic: 'الله يخليك',
        transliteration: 'allaah yikhalllik',
        english: 'May God keep you (please)',
        context: 'A polite way to ask someone for help. More personal than a simple "please" — adds warmth.',
        difficulty: 'beginner',
    },
    {
        id: 'exp-5',
        type: 'expression',
        arabic: 'على كيفك',
        transliteration: '3ala keifak',
        english: 'As you wish / Take it easy',
        context: 'Used to tell someone to relax or do things at their own pace. Very laid-back Egyptian vibe.',
        difficulty: 'intermediate',
    },

    // ─── Slang ────────────────────────────────────────────────
    {
        id: 'slg-1',
        type: 'slang',
        arabic: 'يا عم',
        transliteration: 'ya 3amm',
        english: 'Dude / Bro / Man',
        context: 'Extremely common casual address. Can be used with strangers too. "يا عم ده مش كده" = "dude, it\'s not like that"',
        difficulty: 'beginner',
    },
    {
        id: 'slg-2',
        type: 'slang',
        arabic: 'تمام',
        transliteration: 'tamaam',
        english: 'Perfect / OK / Great',
        context: 'The most common way to say "OK" or signal agreement. Used dozens of times per day.',
        difficulty: 'beginner',
    },
    {
        id: 'slg-3',
        type: 'slang',
        arabic: 'خلاص',
        transliteration: 'khalaas',
        english: 'Enough / Done / That\'s it / Stop',
        context: 'Multi-purpose word. "خلاص مش عايز" = "enough, I don\'t want more." Also used as "it\'s settled."',
        difficulty: 'beginner',
    },
    {
        id: 'slg-4',
        type: 'slang',
        arabic: 'بجد',
        transliteration: 'begadd',
        english: 'Seriously / For real',
        context: '"بجد؟" = "seriously?" "أنا بتكلم بجد" = "I\'m being serious." Very common in conversations.',
        difficulty: 'beginner',
    },
    {
        id: 'slg-5',
        type: 'slang',
        arabic: 'يعني',
        transliteration: 'ya3ni',
        english: 'I mean / Like / Sort of',
        context: 'Used as a filler word, similar to "like" in English. "يعني مش كده ولا إيه" = "I mean, right?"',
        difficulty: 'beginner',
    },

    // ─── Cultural Tips ────────────────────────────────────────
    {
        id: 'tip-1',
        type: 'cultural_tip',
        arabic: 'الضيافة المصرية',
        transliteration: 'ed-diyaafa el-masriyya',
        english: 'Egyptian Hospitality',
        context: 'If an Egyptian offers you tea or coffee, they will insist 3 times. It\'s polite to accept after the first refusal. Saying "لا شكراً" once is not enough!',
        difficulty: 'beginner',
    },
    {
        id: 'tip-2',
        type: 'cultural_tip',
        arabic: 'البقشيش',
        transliteration: 'el-ba2sheesh',
        english: 'Tipping Culture',
        context: 'Tipping (بقشيش) is expected everywhere in Egypt—restaurants, parking attendants, doormen. Small amounts are fine but skipping it is rude.',
        difficulty: 'intermediate',
    },
    {
        id: 'tip-3',
        type: 'cultural_tip',
        arabic: 'المسا بالخير',
        transliteration: 'el-masa bil-kheir',
        english: 'Evening Greetings',
        context: 'Egyptians greet differently based on time of day. "صباح الخير" (morning) and "مسا الخير" (evening) are important to get right. Using the wrong one will get laughs.',
        difficulty: 'beginner',
    },
];

/**
 * Get a random cultural item appropriate for the user's level.
 * Used as interstitial content between exercise sessions.
 */
export function getRandomCulturalItem(difficulty?: 'beginner' | 'intermediate' | 'advanced'): CulturalItem {
    const filtered = difficulty
        ? CULTURAL_CONTENT.filter(item => item.difficulty === difficulty)
        : CULTURAL_CONTENT;

    return filtered[Math.floor(Math.random() * filtered.length)];
}

/**
 * Get cultural items by type.
 */
export function getCulturalByType(type: CulturalItem['type']): CulturalItem[] {
    return CULTURAL_CONTENT.filter(item => item.type === type);
}
