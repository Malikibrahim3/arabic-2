#!/usr/bin/env node
/**
 * Audio Generator
 * ---------------
 * Calls Azure TTS to generate WAV files for the corpus.
 * IMPORTANT: Uses Arabic Phonetic Spelling instead of IPA <phoneme>
 * because Azure's ar-SA models hallucinate English on IPA tags.
 */

import * as https from 'https';
import * as fs from 'fs';
import * as path from 'path';

const AZURE_SPEECH_KEY = 'YOUR_AZURE_KEY';
const AZURE_REGION = 'uksouth';
const VOICE_NAME = 'ar-SA-ZariyahNeural';

const corpus = JSON.parse(fs.readFileSync('./corpus.json', 'utf-8'));
const outDir = './audio_out';
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

function genAudio(text: string, filename: string): Promise<void> {
    const ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="ar-SA"><voice name="${VOICE_NAME}"><prosody rate="0.80">${text}</prosody></voice></speak>`;
    console.log(`Generating: ${text} -> ${filename} (Phonetic spelling, ignoring IPA)`);

    return new Promise((resolve, reject) => {
        const req = https.request({
            hostname: `${AZURE_REGION}.tts.speech.microsoft.com`,
            path: '/cognitiveservices/v1',
            method: 'POST',
            headers: {
                'Ocp-Apim-Subscription-Key': AZURE_SPEECH_KEY,
                'Content-Type': 'application/ssml+xml',
                'X-Microsoft-OutputFormat': 'riff-16khz-16bit-mono-pcm',
                'User-Agent': 'ArabicApp'
            }
        }, (res) => {
            const ws = fs.createWriteStream(path.join(outDir, filename));
            res.pipe(ws);
            ws.on('finish', () => resolve());
            ws.on('error', reject);
        });
        req.on('error', reject);
        req.write(ssml);
        req.end();
    });
}

async function run() {
    console.log("Generating Audio via Azure...");

    // Test a sample of words
    for (const [i, w] of corpus.words.entries()) {
        await genAudio(w, `word_${i}.wav`);
    }

    // Letters (using pseudo-words for deterministic pronunciation)
    // Run all 28 instead of slicing
    for (const [i, item] of corpus.letters.entries()) {
        await genAudio(item.pseudo, `letter_${i}.wav`);
    }

    console.log("✅ Audio generation complete. Output in audio_out/");
}

run().catch(console.error);
