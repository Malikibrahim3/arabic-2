#!/usr/bin/env node

/**
 * Verify course data by importing and checking the structure
 */

import { readFileSync } from 'fs';

console.log('🔍 Verifying Course Data Structure...\n');

// Read the compiled JavaScript bundle
const bundlePath = './dist/assets/index-7kjeFLQC.js';

try {
    const bundle = readFileSync(bundlePath, 'utf-8');
    
    // Check for unit titles
    const unitTitles = [
        'Unit 1',
        'Unit 2',
        'Unit 3',
        'Unit 4',
        'Unit 4B',
        'Unit 4C',
        'Unit 5',
        'Unit 6',
        'Unit 7',
        'Unit 8',
        'Unit 9'
    ];
    
    console.log('📚 Checking for unit titles in bundle:');
    unitTitles.forEach(title => {
        const found = bundle.includes(`title:"${title}"`) || bundle.includes(`title:'${title}'`);
        console.log(`  ${found ? '✅' : '❌'} ${title}`);
    });
    
    // Check for new vocabulary words (sample)
    console.log('\n📝 Checking for new vocabulary (sample):');
    const sampleWords = [
        'يَوْمٌ', // day (Unit 4 expansion)
        'يَدٌ', // hand (Unit 4B)
        'أَحْمَرُ', // red (Unit 4B)
        'يَمِينٌ', // right (Unit 4C)
    ];
    
    sampleWords.forEach(word => {
        const found = bundle.includes(word);
        console.log(`  ${found ? '✅' : '❌'} ${word}`);
    });
    
    // Check for new sentences (sample)
    console.log('\n💬 Checking for new sentences (sample):');
    const sampleSentences = [
        'What is your name?',
        'I do not understand',
        'Come here',
        'The weather is beautiful'
    ];
    
    sampleSentences.forEach(sentence => {
        const found = bundle.includes(sentence);
        console.log(`  ${found ? '✅' : '❌'} ${sentence}`);
    });
    
    console.log('\n✨ Verification complete!\n');
    
} catch (error) {
    console.error('❌ Error reading bundle:', error.message);
    process.exit(1);
}
