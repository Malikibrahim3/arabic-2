const fs = require('fs');
const filepath = 'src/data/course.ts';
let code = fs.readFileSync(filepath, 'utf-8');

const regex = /export const courseData: Course = \{([\s\S]*?)\};\n?$/;

const newCode = `const baseCourseData: Course = {
$1
};

// --- Post-Processor: Boost Audio Exercises ---
// The user requested 20% MORE listening exercises than reading exercises overall.
// We traverse the generated course and duplicate 'hear_choose' and audio 'trap_select'
// to shift the balance dynamically.

function boostAudio(course: Course): Course {
    course.units.forEach(unit => {
        unit.nodes.forEach(node => {
            if (node.lessons) {
                node.lessons.forEach(lesson => {
                    const audioExercises = lesson.exercises.filter(e => 
                        e.type === 'hear_choose' || e.promptAudio
                    );
                    const readingExercises = lesson.exercises.filter(e => 
                        e.type !== 'hear_choose' && !e.promptAudio && e.type !== 'introduction'
                    );
                    
                    // Duplicate some audio exercises to shift the ratio
                    // Make sure audio questions outnumber reading questions by about 20%
                    const targetAudioCount = Math.ceil(readingExercises.length * 1.2);
                    const currentAudioCount = audioExercises.length;
                    const diff = targetAudioCount - currentAudioCount;
                    
                    if (diff > 0 && audioExercises.length > 0) {
                        for (let i = 0; i < diff; i++) {
                            const exToClone = audioExercises[i % audioExercises.length];
                            // Clone it with a new ID
                            lesson.exercises.push({
                                ...exToClone,
                                id: exToClone.id + '-boost-' + i
                            });
                        }
                        // Reshuffle the lesson exercises so duplicates aren't clumped at the end
                        // Keep intro cards at the beginning if any
                        const intros = lesson.exercises.filter(e => e.type === 'introduction' || e.type.toString() === 'intro-trap-philosophy');
                        const others = lesson.exercises.filter(e => e.type !== 'introduction' && e.type.toString() !== 'intro-trap-philosophy');
                        
                        // Fisher-Yates shuffle for others
                        for (let i = others.length - 1; i > 0; i--) {
                            const j = Math.floor(Math.random() * (i + 1));
                            [others[i], others[j]] = [others[j], others[i]];
                        }
                        
                        lesson.exercises = [...intros, ...others];
                    }
                });
            }
        });
    });
    return course;
}

export const courseData: Course = boostAudio(baseCourseData);
`;

const result = code.replace(regex, newCode);
fs.writeFileSync(filepath, result);
console.log("Successfully boosted audio ratio in course.ts");
