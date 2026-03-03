import fs from 'fs';
import path from 'path';
import { getCourseData } from '../src/data/course';
import { Exercise } from '../src/data/types';

async function run() {
    console.log('Extracting DualText items for Azure Audio Generation...');

    // We pass 'egyptian' but the DualText will explicitly contain the text for each dialect.
    const course = getCourseData('egyptian');
    const items: Array<{ id: string; text: string; folder: string }> = [];

    course.units.forEach(unit => {
        unit.nodes.forEach(node => {
            if (node.lessons) {
                node.lessons.forEach(lesson => {
                    lesson.exercises.forEach((ex: Exercise) => {
                        if (ex.sentence) {
                            items.push({ id: `${ex.id}_msa`, text: ex.sentence.msa, folder: 'sentences_msa' });
                            items.push({ id: `${ex.id}_egy`, text: ex.sentence.egyptian, folder: 'sentences_egyptian' });
                        }
                        if (ex.conversationTurns) {
                            ex.conversationTurns.forEach((turn, idx) => {
                                items.push({ id: `${ex.id}_turn_${idx}_msa`, text: turn.text.msa, folder: 'conversations_msa' });
                                items.push({ id: `${ex.id}_turn_${idx}_egy`, text: turn.text.egyptian, folder: 'conversations_egyptian' });
                            });
                        }
                        if (ex.promptDual) {
                            items.push({ id: `${ex.id}_prompt_msa`, text: ex.promptDual.msa, folder: 'prompts_msa' });
                            items.push({ id: `${ex.id}_prompt_egy`, text: ex.promptDual.egyptian, folder: 'prompts_egyptian' });
                        }
                    });
                });
            }
        });
    });

    const outputPath = path.join(process.cwd(), 'scripts', 'vocabulary_dualtext_extracted.json');
    fs.writeFileSync(outputPath, JSON.stringify(items, null, 2));

    console.log(`\n✅ Extracted ${items.length} DualText audio tasks.`);
    console.log(`Saved to ${outputPath}`);
    console.log(`You can now pipe this into your generate_vocabulary_audio_azure.ts script by updating its source file.`);
}

run().catch(console.error);
