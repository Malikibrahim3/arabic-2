// Test script to verify the mosque word generation

const word = { 
    arabic: 'مَسْجِدٌ', 
    translit: 'Masjidun', 
    english: 'Mosque',
    audio: '/audio/words/place_mosque.mp3'
};

const stripHarakatForDisplay = (text) => {
    return text.replace(/[\u064B-\u0652\u0654-\u0655]/g, '');
};

const baseWord = stripHarakatForDisplay(word.arabic);
const letters = baseWord.split('');

const exercise = {
    type: 'introduction',
    prompt: `Assemble: **${word.english}** (${word.translit})`,
    correctAnswer: word.arabic,
    choices: [],
    hint: `Notice how the letters connect:\n${letters.join(' + ')} = ${word.arabic}`,
};

console.log('=== MOSQUE WORD TEST ===');
console.log('Original word:', word.arabic);
console.log('Stripped word:', baseWord);
console.log('Letters array:', JSON.stringify(letters));
console.log('\n=== GENERATED EXERCISE ===');
console.log(JSON.stringify(exercise, null, 2));
console.log('\n=== HINT TEXT ===');
console.log(exercise.hint);
