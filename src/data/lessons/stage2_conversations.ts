import type { Lesson, Exercise } from '../types';

let exId = 0;
function nextId(prefix: string) { return `${prefix}-${++exId}`; }

export function makeStage2Conversations(nodeId: string): Lesson {
    const exercises: Exercise[] = [];

    // Introduction to ordering coffee
    exercises.push({
        id: nextId(`${nodeId}-intro`),
        type: 'introduction',
        prompt: `**Vocabulary:** Ordering Coffee`,
        correctAnswer: '',
        choices: [],
        hint: `MSA: أريد فنجان قهوة، من فضلك\nEgyptian: ممكن كباية قهوة، من فضلك؟\nEnglish: Can I have a cup of coffee, please?`
    });

    // Fill in the blank
    exercises.push({
        id: nextId(`${nodeId}-fib`),
        type: 'fill_in_blank_dialect',
        prompt: 'Fill in the blank with the correct Egyptian word',
        sentence: {
            msa: 'أنا ساكن في القاهرة',
            egyptian: 'أنا ___ في القاهرة.',
            english: 'I live in Cairo',
        },
        correctAnswer: 'ساكن',
        choices: ['ساكن', 'ساكنة', 'سكنت', 'أسكن'],
        explanation: 'ساكن = "I live" (masculine speaker)'
    });

    // Interactive Conversation Simulation
    exercises.push({
        id: nextId(`${nodeId}-chat`),
        type: 'roleplay_chat',
        prompt: 'Roleplay: Ordering Coffee',
        correctAnswer: '',
        choices: [],
        conversationTurns: [
            {
                speaker: 'ai',
                text: {
                    msa: 'أهلاً بك، ماذا تشرب؟',
                    egyptian: 'أهلاً بيك، تشرب إيه؟',
                    english: 'Welcome, what would you like to drink?'
                }
            },
            {
                speaker: 'user',
                text: {
                    msa: 'أريد فنجان قهوة، من فضلك',
                    egyptian: 'ممكن كباية قهوة، من فضلك؟',
                    english: 'Can I have a cup of coffee, please?'
                },
                userSaid: 'ممكن قهوة؟',
                correction: {
                    userSaid: 'ممكن قهوة؟',
                    correctEgyptian: 'ممكن كباية قهوة؟',
                    explanation: "Use 'كباية' to indicate 'a cup of' for clarity."
                },
                pronunciationTip: 'Focus on the ق sound in "قهوة", pronouncing it deep in the throat.'
            },
            {
                speaker: 'ai',
                text: {
                    msa: 'تفضل القهوة',
                    egyptian: 'اتفضل القهوة',
                    english: 'Here is your coffee.'
                }
            }
        ]
    });

    return {
        id: `${nodeId}-lesson1`,
        title: 'Conversations: Ordering Coffee',
        description: 'Learn how to order in Egyptian Arabic',
        exercises
    };
}
