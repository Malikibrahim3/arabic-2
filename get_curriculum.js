const fs = require('fs');

const data = fs.readFileSync('/Users/malikibrahim/.gemini/antigravity/conversations/f0b426ea-2a7e-44a4-88e1-0a38e24a0d5c.pb', 'utf8');

// The file is a protocol buffer binary, but usually contains the raw text of the user prompt. 
// Let's try to extract readable text blocks.
const readableText = data.replace(/[^\x20-\x7E\n]/g, '');

const stage4Index = readableText.indexOf('Stage 4');
if (stage4Index !== -1) {
    console.log(readableText.substring(Math.max(0, stage4Index - 500), stage4Index + 2000));
} else {
    console.log("Stage 4 not found in extracted text.");
}
