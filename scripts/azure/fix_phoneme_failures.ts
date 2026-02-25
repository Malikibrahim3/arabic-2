#!/usr/bin/env node
/**
 * Fix the 5 words that failed phoneme alignment.
 * Uses slower speech rate and clearer Arabic text for Azure TTS.
 */
import * as https from 'https';
import * as fs from 'fs';
import * as path from 'path';

const AZURE_SPEECH_KEY = 'YOUR_AZURE_KEY';
const AZURE_REGION = 'uksouth';
const VOICE_NAME = 'ar-SA-ZariyahNeural';

function gen(text: string, outputFile: string, rate: string = '0.80'): Promise<void> {
    const ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="ar-SA"><voice name="${VOICE_NAME}"><prosody rate="${rate}">${text}</prosody></voice></speak>`;
    const dir = path.dirname(outputFile);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    return new Promise((resolve, reject) => {
        const req = https.request({
            hostname: `${AZURE_REGION}.tts.speech.microsoft.com`,
            path: '/cognitiveservices/v1',
            method: 'POST',
            headers: {
                'Ocp-Apim-Subscription-Key': AZURE_SPEECH_KEY,
                'Content-Type': 'application/ssml+xml',
                'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3',
                'User-Agent': 'ArabicApp'
            }
        }, (res) => {
            if (res.statusCode !== 200) {
                let err = ''; res.on('data', c => err += c);
                res.on('end', () => reject(new Error(`HTTP ${res.statusCode}: ${err}`)));
                return;
            }
            const ws = fs.createWriteStream(outputFile);
            res.pipe(ws);
            ws.on('finish', () => { ws.close(); resolve(); });
        });
        req.on('error', reject);
        req.write(ssml);
        req.end();
    });
}

async function run() {
    console.log('🔧 Fixing 5 words flagged by phoneme alignment...\n');

    const fixes = [
        // word_umm: shadda_meem — use clearer form
        { id: 'word_umm', text: 'أُمِّي', file: './public/audio/words/word_umm.mp3', note: 'shadda meem — using أُمِّي for clarity' },
        // word_qitt: emphatic drift — use full form with alif lam
        { id: 'word_qitt', text: 'قِطَّةٌ', file: './public/audio/words/word_qitt.mp3', note: 'emphatic shadda taa' },
        // word_qamar: uvular q poorly recognized
        { id: 'word_qamar', text: 'قَمَرٌ', file: './public/audio/words/word_qamar.mp3', note: 'uvular q' },
        // word_maa: heard as ميت
        { id: 'word_maa', text: 'مَاءٌ', file: './public/audio/words/word_maa.mp3', note: 'long a + hamza' },
        // word_khubz: velar fricative خ misheard
        { id: 'word_khubz', text: 'خُبْزٌ', file: './public/audio/words/word_khubz.mp3', note: 'velar fricative khaa' },
        // fam_mother: same issue as word_umm
        { id: 'fam_mother', text: 'أُمِّي', file: './public/audio/words/fam_mother.mp3', note: 'shadda meem — using أُمِّي for clarity' },
    ];

    for (const fix of fixes) {
        try {
            await gen(fix.text, fix.file, '0.75');  // Extra slow for clarity
            console.log(`  ✅ ${fix.id}: "${fix.text}" — ${fix.note}`);
        } catch (e: any) {
            console.error(`  ❌ ${fix.id}: ${e.message}`);
        }
        await new Promise(r => setTimeout(r, 100));
    }

    console.log('\n🎉 Done!');
}

run().catch(console.error);
