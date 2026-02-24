const fs = require('fs');
const content = fs.readFileSync('src/data/course.ts', 'utf-8');
const lines = content.split('\n');
const wordsRaw = lines.slice(1172, 1269).join('\n'); // approx where UNIT4_WORDS is
// We just need to define stripHarakat and test it
function stripHarakat(text) {
    return text.replace(/[\u064B-\u0652\u0654-\u0655]/g, '');
}
console.log("School: ", stripHarakat("مَدْرَسَة"));
console.log("Length: ", stripHarakat("مَدْرَسَة").length);
