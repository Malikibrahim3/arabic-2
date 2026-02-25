/**
 * Azure Audio Asset Generation Script
 * 
 * Generates high-quality Arabic audio files using Azure Cognitive Services Speech.
 * 
 * PREREQUISITES:
 * 1. npm install microsoft-cognitiveservices-speech-sdk
 * 2. Azure Speech Service subscription (UK South region)
 * 
 * USAGE:
 * ts-node scripts/generate_audio_azure.ts
 */

import * as sdk from 'microsoft-cognitiveservices-speech-sdk';
import fs from 'fs';
import path from 'path';

// Azure Speech Configuration
const AZURE_SPEECH_KEY = '1D252Q6kJUTbATGMyJrtEEvEUnM78nQam2u8E6ghCfwamo4d7yUEuJQQJ99CBACmepeSXJ3w3AAAYACOGord';
const AZURE_REGION = 'uksouth';

// High-quality Arabic voice options:
// 'ar-SA-ZariyahNeural' - Female, Saudi Arabic
// 'ar-SA-HamedNeural' - Male, Saudi Arabic
const VOICE_NAME = 'ar-SA-ZariyahNeural';

// Speaking rate for language learners (0.85 = 15% slower)
const SPEAKING_RATE = '0.85';

// ==========================================
// CONFIGURATION: Content to generate
// ==========================================

const LETTERS = [
    // Letter sounds (with fatha)
    { id: 'letter_alif_fatha', text: 'أَ' },
    { id: 'letter_baa_fatha', text: 'بَ' },
    { id: 'letter_taa_fatha', text: 'تَ' },
    { id: 'letter_thaa_fatha', text: 'ثَ' },
    { id: 'letter_jeem_fatha', text: 'جَ' },
    { id: 'letter_haa_fatha', text: 'حَ' },
    { id: 'letter_khaa_fatha', text: 'خَ' },
    { id: 'letter_daal_fatha', text: 'دَ' },
    { id: 'letter_dhaal_fatha', text: 'ذَ' },
    { id: 'letter_raa_fatha', text: 'رَ' },
    { id: 'letter_zaay_fatha', text: 'زَ' },
    { id: 'letter_seen_fatha', text: 'سَ' },
    { id: 'letter_sheen_fatha', text: 'شَ' },
    { id: 'letter_saad_fatha', text: 'صَ' },
    { id: 'letter_daad_fatha', text: 'ضَ' },
    { id: 'letter_taa2_fatha', text: 'طَ' },
    { id: 'letter_dhaa2_fatha', text: 'ظَ' },
    { id: 'letter_ayn_fatha', text: 'عَ' },
    { id: 'letter_ghayn_fatha', text: 'غَ' },
    { id: 'letter_faa_fatha', text: 'فَ' },
    { id: 'letter_qaaf_fatha', text: 'قَ' },
    { id: 'letter_kaaf_fatha', text: 'كَ' },
    { id: 'letter_laam_fatha', text: 'لَ' },
    { id: 'letter_meem_fatha', text: 'مَ' },
    { id: 'letter_noon_fatha', text: 'نَ' },
    { id: 'letter_haa2_fatha', text: 'هَ' },
    { id: 'letter_waaw_fatha', text: 'وَ' },
    { id: 'letter_yaa_fatha', text: 'يَ' },

    // Letter names
    { id: 'letter_alif_name', text: 'أَلِف' },
    { id: 'letter_baa_name', text: 'باء' },
    { id: 'letter_taa_name', text: 'تاء' },
    { id: 'letter_thaa_name', text: 'ثاء' },
    { id: 'letter_jeem_name', text: 'جيم' },
    { id: 'letter_haa_name', text: 'حاء' },
    { id: 'letter_khaa_name', text: 'خاء' },
    { id: 'letter_daal_name', text: 'دال' },
    { id: 'letter_dhaal_name', text: 'ذال' },
    { id: 'letter_raa_name', text: 'راء' },
    { id: 'letter_zaay_name', text: 'زاي' },
    { id: 'letter_seen_name', text: 'سين' },
    { id: 'letter_sheen_name', text: 'شين' },
    { id: 'letter_saad_name', text: 'صاد' },
    { id: 'letter_daad_name', text: 'ضاد' },
    { id: 'letter_taa2_name', text: 'طاء' },
    { id: 'letter_dhaa2_name', text: 'ظاء' },
    { id: 'letter_ayn_name', text: 'عين' },
    { id: 'letter_ghayn_name', text: 'غين' },
    { id: 'letter_faa_name', text: 'فاء' },
    { id: 'letter_qaaf_name', text: 'قاف' },
    { id: 'letter_kaaf_name', text: 'كاف' },
    { id: 'letter_laam_name', text: 'لام' },
    { id: 'letter_meem_name', text: 'ميم' },
    { id: 'letter_noon_name', text: 'نون' },
    { id: 'letter_haa2_name', text: 'هاء' },
    { id: 'letter_waaw_name', text: 'واو' },
    { id: 'letter_yaa_name', text: 'ياء' },
];

// Syllables: consonant + vowel combinations
const CONSONANTS = [
    { id: 'baa', letter: 'ب' },
    { id: 'taa', letter: 'ت' },
    { id: 'thaa', letter: 'ث' },
    { id: 'jeem', letter: 'ج' },
    { id: 'haa', letter: 'ح' },
    { id: 'khaa', letter: 'خ' },
    { id: 'daal', letter: 'د' },
    { id: 'dhaal', letter: 'ذ' },
    { id: 'raa', letter: 'ر' },
    { id: 'zaay', letter: 'ز' },
    { id: 'seen', letter: 'س' },
    { id: 'sheen', letter: 'ش' },
    { id: 'saad', letter: 'ص' },
    { id: 'daad', letter: 'ض' },
    { id: 'taa2', letter: 'ط' },
    { id: 'dhaa2', letter: 'ظ' },
    { id: 'ayn', letter: 'ع' },
    { id: 'ghayn', letter: 'غ' },
    { id: 'faa', letter: 'ف' },
    { id: 'qaaf', letter: 'ق' },
    { id: 'kaaf', letter: 'ك' },
    { id: 'laam', letter: 'ل' },
    { id: 'meem', letter: 'م' },
    { id: 'noon', letter: 'ن' },
    { id: 'haa2', letter: 'ه' },
    { id: 'waaw', letter: 'و' },
    { id: 'yaa', letter: 'ي' },
];

const VOWELS = [
    { id: 'fatha', diacritic: 'َ' },
    { id: 'kasra', diacritic: 'ِ' },
    { id: 'damma', diacritic: 'ُ' },
];

/**
 * Generate audio using Azure Speech Service
 */
async function generateAudio(text: string, outputFile: string): Promise<void> {
    const speechConfig = sdk.SpeechConfig.fromSubscription(AZURE_SPEECH_KEY, AZURE_REGION);
    speechConfig.speechSynthesisVoiceName = VOICE_NAME;
    
    // Create SSML for better control
    const ssml = `
        <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="ar-SA">
            <voice name="${VOICE_NAME}">
                <prosody rate="${SPEAKING_RATE}">
                    ${text}
                </prosody>
            </voice>
        </speak>
    `;

    // Ensure directory exists
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
                    console.log(`✅ Saved ${outputFile}`);
                    synthesizer.close();
                    resolve();
                } else {
                    console.error(`❌ Failed to generate audio for ${text}:`, result.errorDetails);
                    synthesizer.close();
                    reject(new Error(result.errorDetails));
                }
            },
            error => {
                console.error(`❌ Error generating audio for ${text}:`, error);
                synthesizer.close();
                reject(error);
            }
        );
    });
}

async function run() {
    console.log('Starting Azure Audio Generation...');
    console.log(`Voice: ${VOICE_NAME}`);
    console.log(`Region: ${AZURE_REGION}`);
    console.log(`Speaking Rate: ${SPEAKING_RATE}`);

    let totalGenerated = 0;

    // 1. Generate Letters
    console.log('\n📝 Generating letter sounds and names...');
    for (const letter of LETTERS) {
        const outputPath = `./public/audio/letters/${letter.id}.mp3`;
        await generateAudio(letter.text, outputPath);
        totalGenerated++;
        await new Promise(r => setTimeout(r, 100)); // Small delay
    }

    // 2. Generate Syllables
    console.log('\n🔤 Generating syllables...');
    for (const consonant of CONSONANTS) {
        for (const vowel of VOWELS) {
            const text = consonant.letter + vowel.diacritic;
            const id = `syl_${consonant.id}_${vowel.id}`;
            const outputPath = `./public/audio/syllables/${id}.mp3`;
            await generateAudio(text, outputPath);
            totalGenerated++;
            await new Promise(r => setTimeout(r, 100));
        }
    }

    console.log(`\n🎉 Azure Audio Generation Complete!`);
    console.log(`Total files generated: ${totalGenerated}`);
    console.log('\nNext steps:');
    console.log('1. Run: ts-node scripts/extract_vocabulary.ts');
    console.log('2. Run: ts-node scripts/generate_vocabulary_audio_azure.ts');
    console.log('3. Run: ts-node scripts/upload_to_supabase.ts');
}

run().catch(console.error);
