
import { courseData } from './src/data/course';

const counts = {};
let totalExercises = 0;

courseData.units.forEach(unit => {
    unit.nodes.forEach(node => {
        if (node.lessons) {
            node.lessons.forEach(lesson => {
                lesson.exercises.forEach(ex => {
                    counts[ex.type] = (counts[ex.type] || 0) + 1;
                    totalExercises++;
                });
            });
        }
    });
});

console.log('TOTAL EXERCISES:', totalExercises);
console.log(JSON.stringify(counts, null, 2));
