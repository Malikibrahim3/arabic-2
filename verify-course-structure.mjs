#!/usr/bin/env node

/**
 * Quick verification script to check course structure
 */

import { readFileSync } from 'fs';

const courseFile = readFileSync('./src/data/course.ts', 'utf-8');

console.log('🔍 Verifying Course Structure...\n');

// Check unit IDs
const unitIdMatches = courseFile.matchAll(/{\s*id:\s*(\d+),\s*title:\s*'Unit (\d+)'/g);
const units = Array.from(unitIdMatches);

console.log('📚 Units found:');
units.forEach(match => {
    const [, id, title] = match;
    const status = id === title ? '✅' : '❌';
    console.log(`  ${status} Unit ${title} (id: ${id})`);
});

// Check vocabulary arrays
const vocabArrays = [
    { name: 'UNIT3_WORDS', expected: 16 },
    { name: 'UNIT4_WORDS', expected: 40 },
    { name: 'UNIT4B_WORDS', expected: 40 },
    { name: 'UNIT4C_WORDS', expected: 40 },
    { name: 'UNIT6_SENTENCES', expected: 30 }
];

console.log('\n📝 Vocabulary arrays:');
vocabArrays.forEach(({ name, expected }) => {
    const regex = new RegExp(`const ${name}.*?=\\s*\\[([\\s\\S]*?)\\];`, 'm');
    const match = courseFile.match(regex);
    if (match) {
        const items = match[1].match(/{\s*arabic:/g);
        const count = items ? items.length : 0;
        const status = count === expected ? '✅' : '❌';
        console.log(`  ${status} ${name}: ${count}/${expected} items`);
    } else {
        console.log(`  ❌ ${name}: NOT FOUND`);
    }
});

// Check for duplicate unit IDs
console.log('\n🔍 Checking for duplicate unit IDs...');
const allIds = units.map(m => m[1]);
const duplicates = allIds.filter((id, index) => allIds.indexOf(id) !== index);
if (duplicates.length > 0) {
    console.log(`  ❌ Duplicate IDs found: ${duplicates.join(', ')}`);
} else {
    console.log('  ✅ No duplicate unit IDs');
}

// Check cumulative tests
console.log('\n🧪 Checking cumulative tests...');
const cum1 = courseFile.includes('makeCumulativeTest1()');
const cum2 = courseFile.includes('makeCumulativeTest2()');
const final = courseFile.includes('makeFinalComprehensiveTest()');
console.log(`  ${cum1 ? '✅' : '❌'} Cumulative Test 1`);
console.log(`  ${cum2 ? '✅' : '❌'} Cumulative Test 2`);
console.log(`  ${final ? '✅' : '❌'} Final Comprehensive Test`);

// Check if tests use expanded vocabulary
console.log('\n🔬 Checking test vocabulary coverage...');
const unit5Test = courseFile.match(/id: 'u5-test'[\s\S]*?exercises: shuffle\((.*?)\)/);
if (unit5Test && unit5Test[1].includes('UNIT4B_WORDS') && unit5Test[1].includes('UNIT4C_WORDS')) {
    console.log('  ✅ Unit 5 test uses expanded vocabulary');
} else {
    console.log('  ❌ Unit 5 test missing expanded vocabulary');
}

const cum2Test = courseFile.match(/function makeCumulativeTest2[\s\S]*?const allVocab = \[(.*?)\]/);
if (cum2Test && cum2Test[1].includes('UNIT4B_WORDS') && cum2Test[1].includes('UNIT4C_WORDS')) {
    console.log('  ✅ Cumulative Test 2 uses expanded vocabulary');
} else {
    console.log('  ❌ Cumulative Test 2 missing expanded vocabulary');
}

const finalTest = courseFile.match(/function makeFinalComprehensiveTest[\s\S]*?const allVocab = \[(.*?)\]/);
if (finalTest && finalTest[1].includes('UNIT4B_WORDS') && finalTest[1].includes('UNIT4C_WORDS')) {
    console.log('  ✅ Final test uses expanded vocabulary');
} else {
    console.log('  ❌ Final test missing expanded vocabulary');
}

console.log('\n✨ Verification complete!\n');
