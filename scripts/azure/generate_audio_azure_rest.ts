/**
 * Azure Audio Generation using REST API
 * More reliable than the SDK on some platforms
 */

import fs from 'fs';
import path from 'path';
import https from 'https';

const AZURE_SPEECH_KEY = 'YOUR_AZURE_KEY';
const AZURE_REGION = 'uksouth';
const VOICE_NAME = 'ar-SA-ZariyahNeural';
const SPEAKING_RATE = '0.85';

async function generateAudioREST(text: string, outputFile: string): Promise<void> {
    const ssml = `
        <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="ar-SA">
            <voice name="${VOICE_NAME}">
                <prosody rate="${SPEAKING_RATE}">
                    ${text}
                </prosody>
            </voice>
        </speak>
    `.trim();

    const dir = path.dirname(outputFile);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    return new Promise((resolve, reject) => {
        const options = {
            hostname: `${AZURE_REGION}.tts.speech.microsoft.com`,
            path: '/cognitiveservices/v1',
            method: 'POST',
            headers: {
                'Ocp-Apim-Subscription-Key': AZURE_SPEECH_KEY,
                'Content-Type': 'application/ssml+xml',
                'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3',
                'User-Agent': 'ArabicApp'
            }
        };

        const req = https.request(options, (res) => {
            if (res.statusCode !== 200) {
                let errorData = '';
                res.on('data', chunk => errorData += chunk);
                res.on('end', () => {
                    reject(new Error(`HTTP ${res.statusCode}: ${errorData}`));
                });
                return;
            }

            const fileStream = fs.createWriteStream(outputFile);
            res.pipe(fileStream);

            fileStream.on('finish', () => {
                fileStream.close();
                resolve();
            });

            fileStream.on('error', (err) => {
                fs.unlinkSync(outputFile);
                reject(err);
            });
        });

        req.on('error', reject);
        req.write(ssml);
        req.end();
    });
}

// Test with one file
async function test() {
    console.log('Testing Azure REST API...');
    try {
        await generateAudioREST('مرحبا', './test_rest.mp3');
        const stats = fs.statSync('./test_rest.mp3');
        console.log(`✅ Success! File size: ${stats.size} bytes`);
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

test();
