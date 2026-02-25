/**
 * Generate audio for all vocabulary items using Azure Speech
 * Reads from vocabulary_extracted.json (created by extract_vocabulary.ts)
 */

import * as sdk from 'microsoft-cognitiveservices-speech-sdk';
import fs from 'fs';
import path from 'path';

const AZURE_SPEECH_KEY = '1D252Q6kJUTbATGMyJrtEEvEUnM78nQam2u8E6ghCfwamo4d7yUEuJQQJ99CBACmepeSXJ3w3AAAYACOGord';
const AZURE_REGION = 'uksouth';
const VOICE_NAME = 'ar-SA-ZariyahNeural';
const SPEAKING_RATE = '0.85';

interface VocabItem {
    id: string;
    text: string;
    folder: string;
}

async function generateAudio(text: string, outputFile: string): Promise<void> {
    const speechConfig = sdk.SpeechConfig.fromSubscription(AZURE_SPEECH_KEY, AZURE_REGION);
    speechConfig.speechSynthesisVoiceName = VOICE_NAME;
    
    const ssml = `
        <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="ar-SA">
            <voice name="${VOICE_NAME}">
                <prosody rate="${SPEAKING_RATE}">
                    ${text}
                </prosody>
            </voice>
        </speak>
    `;

    const dir = path.dirname(outputFile);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    const audioConfig = sdk.AudioConfig.fromAudioFileOutput(outputFile);
    const synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig);

    return new Promise((resolve, reject) => {
        synthesizer.speakSsmlAsync(
            ssml,
            result => {
                if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
                    synthesizer.close();
                    resolve();
                } else {
                    synthesizer.close();
                    reject(new Error(result.errorDetails));
                }
            },
            error => {
                synthesizer.close();
                reject(error);
            }
        );
    });
}

async function run() {
    const vocabPath = path.join(process.cwd(), 'scripts', 'vocabulary_extracted.json');
    
    if (!fs.existsSync(vocabPath)) {
        console.error('❌ vocabulary_extracted.json not found. Run extract_vocabulary.ts first.');
        process.exit(1);
    }

    const vocabulary: VocabItem[] = JSON.parse(fs.readFileSync(vocabPath, 'utf-8'));
    
    console.log(`\nGenerating audio for ${vocabulary.length} vocabulary items...`);
    console.log(`Voice: ${VOICE_NAME}`);
    console.log(`Speaking Rate: ${SPEAKING_RATE}\n`);
    
    let completed = 0;
    let failed = 0;
    let skipped = 0;

    for (const item of vocabulary) {
        const outputPath = `./public/audio/${item.folder}/${item.id}.mp3`;
        
        // Skip if file already exists
        if (fs.existsSync(outputPath)) {
            skipped++;
            continue;
        }
        
        try {
            await generateAudio(item.text, outputPath);
            completed++;
            if (completed % 10 === 0) {
                console.log(`Progress: ${completed}/${vocabulary.length - skipped} (${skipped} skipped)`);
            }
            await new Promise(r => setTimeout(r, 100));
        } catch (error) {
            console.error(`❌ Failed: ${item.id} - ${item.text}`);
            failed++;
        }
    }

    console.log(`\n✅ Complete:`);
    console.log(`   Generated: ${completed}`);
    console.log(`   Skipped (already exist): ${skipped}`);
    console.log(`   Failed: ${failed}`);
    console.log(`   Total: ${vocabulary.length}`);
}

run().catch(console.error);
