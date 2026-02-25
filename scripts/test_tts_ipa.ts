import fs from 'fs';
import path from 'path';
import https from 'https';

const AZURE_SPEECH_KEY = 'YOUR_AZURE_KEY';
const AZURE_REGION = 'uksouth';
const VOICE_NAME = 'ar-SA-ZariyahNeural';

async function testTTS(ssml: string, outputFile: string): Promise<void> {
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
                res.on('end', () => reject(new Error(`HTTP ${res.statusCode}: ${errorData}`)));
                return;
            }
            const fileStream = fs.createWriteStream(outputFile);
            res.pipe(fileStream);
            fileStream.on('finish', () => { fileStream.close(); resolve(); });
        });
        req.on('error', reject);
        req.write(ssml);
        req.end();
    });
}

(async () => {
    // 1. Original Alif Fatha
    await testTTS(
        '<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="ar-SA"><voice name="ar-SA-ZariyahNeural">أَ</voice></speak>',
        'test_alif_orig.mp3'
    );
    // 2. Original Thaa Fatha
    await testTTS(
        '<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="ar-SA"><voice name="ar-SA-ZariyahNeural">ثَ</voice></speak>',
        'test_thaa_orig.mp3'
    );

    // 3. IPA Alif Fatha
    await testTTS(
        '<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="ar-SA"><voice name="ar-SA-ZariyahNeural"><phoneme alphabet="ipa" ph="ʔa">أَ</phoneme></voice></speak>',
        'test_alif_ipa.mp3'
    );
    // 4. IPA Thaa Fatha
    await testTTS(
        '<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="ar-SA"><voice name="ar-SA-ZariyahNeural"><phoneme alphabet="ipa" ph="θa">ثَ</phoneme></voice></speak>',
        'test_thaa_ipa.mp3'
    );
    console.log("Done");
})();
