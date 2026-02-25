/**
 * Test Azure Speech Service Connection
 * Quick script to verify Azure credentials and voice availability
 */

import * as sdk from 'microsoft-cognitiveservices-speech-sdk';
import fs from 'fs';
import path from 'path';

const AZURE_SPEECH_KEY = '1D252Q6kJUTbATGMyJrtEEvEUnM78nQam2u8E6ghCfwamo4d7yUEuJQQJ99CBACmepeSXJ3w3AAAYACOGord';
const AZURE_REGION = 'uksouth';
const VOICE_NAME = 'ar-SA-ZariyahNeural';

async function testConnection() {
    console.log('🔍 Testing Azure Speech Service Connection...\n');
    console.log(`Region: ${AZURE_REGION}`);
    console.log(`Voice: ${VOICE_NAME}\n`);

    const speechConfig = sdk.SpeechConfig.fromSubscription(AZURE_SPEECH_KEY, AZURE_REGION);
    speechConfig.speechSynthesisVoiceName = VOICE_NAME;

    // Test with a simple Arabic phrase
    const testText = 'مرحبا';
    const ssml = `
        <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="ar-SA">
            <voice name="${VOICE_NAME}">
                <prosody rate="0.85">
                    ${testText}
                </prosody>
            </voice>
        </speak>
    `;

    const outputPath = path.join(process.cwd(), 'test_azure_output.mp3');
    const audioConfig = sdk.AudioConfig.fromAudioFileOutput(outputPath);
    const synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig);

    return new Promise<void>((resolve, reject) => {
        console.log(`Generating test audio: "${testText}"...`);
        
        synthesizer.speakSsmlAsync(
            ssml,
            result => {
                synthesizer.close();
                
                if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
                    console.log('✅ SUCCESS! Azure connection working.');
                    console.log(`✅ Test file created: ${outputPath}`);
                    console.log(`✅ File size: ${fs.statSync(outputPath).size} bytes`);
                    console.log('\n🎉 Azure Speech Service is ready to use!');
                    console.log('\nYou can now run:');
                    console.log('  npm run audio:generate');
                    console.log('  npm run audio:vocabulary');
                    
                    // Clean up test file
                    fs.unlinkSync(outputPath);
                    console.log('\n🧹 Test file cleaned up.');
                    
                    resolve();
                } else {
                    console.error('❌ FAILED!');
                    console.error(`Reason: ${sdk.ResultReason[result.reason]}`);
                    console.error(`Error: ${result.errorDetails}`);
                    reject(new Error(result.errorDetails));
                }
            },
            error => {
                synthesizer.close();
                console.error('❌ FAILED!');
                console.error('Error:', error);
                reject(error);
            }
        );
    });
}

async function listAvailableVoices() {
    console.log('\n📋 Listing available Arabic voices...\n');
    
    const speechConfig = sdk.SpeechConfig.fromSubscription(AZURE_SPEECH_KEY, AZURE_REGION);
    const synthesizer = new sdk.SpeechSynthesizer(speechConfig);

    return new Promise<void>((resolve) => {
        synthesizer.getVoicesAsync(
            result => {
                if (result.reason === sdk.ResultReason.VoicesListRetrieved) {
                    const arabicVoices = result.voices.filter(v => v.locale.startsWith('ar-'));
                    
                    console.log(`Found ${arabicVoices.length} Arabic voices:\n`);
                    
                    arabicVoices.forEach(voice => {
                        const marker = voice.shortName === VOICE_NAME ? '👉' : '  ';
                        console.log(`${marker} ${voice.shortName}`);
                        console.log(`   Locale: ${voice.locale}`);
                        console.log(`   Gender: ${voice.gender === 1 ? 'Female' : 'Male'}`);
                        console.log(`   Type: ${voice.voiceType === 1 ? 'Neural' : 'Standard'}`);
                        console.log('');
                    });
                } else {
                    console.log('Could not retrieve voice list');
                }
                synthesizer.close();
                resolve();
            },
            error => {
                console.error('Error listing voices:', error);
                synthesizer.close();
                resolve();
            }
        );
    });
}

async function run() {
    try {
        await testConnection();
        await listAvailableVoices();
    } catch (error) {
        console.error('\n❌ Test failed:', error);
        console.error('\nTroubleshooting:');
        console.error('1. Verify AZURE_SPEECH_KEY is correct');
        console.error('2. Check region is set to "uksouth"');
        console.error('3. Ensure Azure subscription is active');
        console.error('4. Check internet connection');
        process.exit(1);
    }
}

run();
