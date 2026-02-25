/**
 * Complete Azure Audio Generation using REST API
 * Generates all letters, syllables, and vocabulary
 */

import fs from 'fs';
import path from 'path';
import https from 'https';

const AZURE_SPEECH_KEY = 'YOUR_AZURE_KEY';
const AZURE_REGION = 'uksouth';
const VOICE_NAME = 'ar-SA-ZariyahNeural';
const SPEAKING_RATE = '0.85';

async function generateAudioREST(text: string, outputFile: string, ipa?: string): Promise<void> {
    let content = text;
    if (ipa) {
        content = `<phoneme alphabet="ipa" ph="${ipa}">${text}</phoneme>`;
    }
    const ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="ar-SA"><voice name="${VOICE_NAME}"><prosody rate="${SPEAKING_RATE}">${content}</prosody></voice></speak>`;

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
                res.on('end', () => reject(new Error(`HTTP ${res.statusCode}: ${errorData}`)));
                return;
            }

            const fileStream = fs.createWriteStream(outputFile);
            res.pipe(fileStream);
            fileStream.on('finish', () => { fileStream.close(); resolve(); });
            fileStream.on('error', (err) => { fs.unlinkSync(outputFile); reject(err); });
        });

        req.on('error', reject);
        req.write(ssml);
        req.end();
    });
}

// IPA mapping for letters (Fatha)
const LETTER_IPA_MAP: Record<string, string> = {
    'letter_alif_fatha': 'ʔa', 'letter_baa_fatha': 'ba', 'letter_taa_fatha': 'ta', 'letter_thaa_fatha': 'θa',
    'letter_jeem_fatha': 'd͡ʒa', 'letter_haa_fatha': 'ħa', 'letter_khaa_fatha': 'xa', 'letter_daal_fatha': 'da',
    'letter_dhaal_fatha': 'ða', 'letter_raa_fatha': 'ra', 'letter_zaay_fatha': 'za', 'letter_seen_fatha': 'sa',
    'letter_sheen_fatha': 'ʃa', 'letter_saad_fatha': 'sˤa', 'letter_daad_fatha': 'dˤa', 'letter_taa2_fatha': 'tˤa',
    'letter_dhaa2_fatha': 'ðˤa', 'letter_ayn_fatha': 'ʕa', 'letter_ghayn_fatha': 'ɣa', 'letter_faa_fatha': 'fa',
    'letter_qaaf_fatha': 'qa', 'letter_kaaf_fatha': 'ka', 'letter_laam_fatha': 'la', 'letter_meem_fatha': 'ma',
    'letter_noon_fatha': 'na', 'letter_haa2_fatha': 'ha', 'letter_waaw_fatha': 'wa', 'letter_yaa_fatha': 'ja',
};

// IPA mapping for consonant bases
const CONS_IPA: Record<string, string> = {
    'baa': 'b', 'taa': 't', 'thaa': 'θ', 'jeem': 'd͡ʒ', 'haa': 'ħ', 'khaa': 'x',
    'daal': 'd', 'dhaal': 'ð', 'raa': 'r', 'zaay': 'z', 'seen': 's', 'sheen': 'ʃ',
    'saad': 'sˤ', 'daad': 'dˤ', 'taa2': 'tˤ', 'dhaa2': 'ðˤ', 'ayn': 'ʕ', 'ghayn': 'ɣ',
    'faa': 'f', 'qaaf': 'q', 'kaaf': 'k', 'laam': 'l', 'meem': 'm', 'noon': 'n',
    'haa2': 'h', 'waaw': 'w', 'yaa': 'j'
};

const VOWEL_IPA: Record<string, string> = {
    'fatha': 'a',
    'kasra': 'i',
    'damma': 'u'
};

const LETTERS = [
    { id: 'letter_alif_fatha', text: 'أَ' }, { id: 'letter_baa_fatha', text: 'بَ' },
    { id: 'letter_taa_fatha', text: 'تَ' }, { id: 'letter_thaa_fatha', text: 'ثَ' },
    { id: 'letter_jeem_fatha', text: 'جَ' }, { id: 'letter_haa_fatha', text: 'حَ' },
    { id: 'letter_khaa_fatha', text: 'خَ' }, { id: 'letter_daal_fatha', text: 'دَ' },
    { id: 'letter_dhaal_fatha', text: 'ذَ' }, { id: 'letter_raa_fatha', text: 'رَ' },
    { id: 'letter_zaay_fatha', text: 'زَ' }, { id: 'letter_seen_fatha', text: 'سَ' },
    { id: 'letter_sheen_fatha', text: 'شَ' }, { id: 'letter_saad_fatha', text: 'صَ' },
    { id: 'letter_daad_fatha', text: 'ضَ' }, { id: 'letter_taa2_fatha', text: 'طَ' },
    { id: 'letter_dhaa2_fatha', text: 'ظَ' }, { id: 'letter_ayn_fatha', text: 'عَ' },
    { id: 'letter_ghayn_fatha', text: 'غَ' }, { id: 'letter_faa_fatha', text: 'فَ' },
    { id: 'letter_qaaf_fatha', text: 'قَ' }, { id: 'letter_kaaf_fatha', text: 'كَ' },
    { id: 'letter_laam_fatha', text: 'لَ' }, { id: 'letter_meem_fatha', text: 'مَ' },
    { id: 'letter_noon_fatha', text: 'نَ' }, { id: 'letter_haa2_fatha', text: 'هَ' },
    { id: 'letter_waaw_fatha', text: 'وَ' }, { id: 'letter_yaa_fatha', text: 'يَ' },
    // Letter Names
    { id: 'letter_alif_name', text: 'أَلِف' }, { id: 'letter_baa_name', text: 'باء' },
    { id: 'letter_taa_name', text: 'تاء' }, { id: 'letter_thaa_name', text: 'ثاء' },
    { id: 'letter_jeem_name', text: 'جيم' }, { id: 'letter_haa_name', text: 'حاء' },
    { id: 'letter_khaa_name', text: 'خاء' }, { id: 'letter_daal_name', text: 'دال' },
    { id: 'letter_dhaal_name', text: 'ذال' }, { id: 'letter_raa_name', text: 'راء' },
    { id: 'letter_zaay_name', text: 'زاي' }, { id: 'letter_seen_name', text: 'سين' },
    { id: 'letter_sheen_name', text: 'شين' }, { id: 'letter_saad_name', text: 'صاد' },
    { id: 'letter_daad_name', text: 'ضاد' }, { id: 'letter_taa2_name', text: 'طاء' },
    { id: 'letter_dhaa2_name', text: 'ظاء' }, { id: 'letter_ayn_name', text: 'عين' },
    { id: 'letter_ghayn_name', text: 'غين' }, { id: 'letter_faa_name', text: 'فاء' },
    { id: 'letter_qaaf_name', text: 'قاف' }, { id: 'letter_kaaf_name', text: 'كاف' },
    { id: 'letter_laam_name', text: 'لام' }, { id: 'letter_meem_name', text: 'ميم' },
    { id: 'letter_noon_name', text: 'نون' }, { id: 'letter_haa2_name', text: 'هاء' },
    { id: 'letter_waaw_name', text: 'واو' }, { id: 'letter_yaa_name', text: 'ياء' },
];

const CONSONANTS = [
    { id: 'baa', letter: 'ب' }, { id: 'taa', letter: 'ت' }, { id: 'thaa', letter: 'ث' },
    { id: 'jeem', letter: 'ج' }, { id: 'haa', letter: 'ح' }, { id: 'khaa', letter: 'خ' },
    { id: 'daal', letter: 'د' }, { id: 'dhaal', letter: 'ذ' }, { id: 'raa', letter: 'ر' },
    { id: 'zaay', letter: 'ز' }, { id: 'seen', letter: 'س' }, { id: 'sheen', letter: 'ش' },
    { id: 'saad', letter: 'ص' }, { id: 'daad', letter: 'ض' }, { id: 'taa2', letter: 'ط' },
    { id: 'dhaa2', letter: 'ظ' }, { id: 'ayn', letter: 'ع' }, { id: 'ghayn', letter: 'غ' },
    { id: 'faa', letter: 'ف' }, { id: 'qaaf', letter: 'ق' }, { id: 'kaaf', letter: 'ك' },
    { id: 'laam', letter: 'ل' }, { id: 'meem', letter: 'م' }, { id: 'noon', letter: 'ن' },
    { id: 'haa2', letter: 'ه' }, { id: 'waaw', letter: 'و' }, { id: 'yaa', letter: 'ي' },
];

const VOWELS = [
    { id: 'fatha', diacritic: 'َ' },
    { id: 'kasra', diacritic: 'ِ' },
    { id: 'damma', diacritic: 'ُ' },
];

async function run() {
    console.log('🚀 Starting Complete Azure Audio Generation...');
    console.log(`Voice: ${VOICE_NAME}`);
    console.log(`Region: ${AZURE_REGION}\n`);

    let total = 0;
    let failed = 0;

    // Generate Letters
    console.log('📝 Generating letters (56 files)...');
    for (const letter of LETTERS) {
        try {
            const ipa = LETTER_IPA_MAP[letter.id]; // Only sounds (fatha) need IPA override, names can use raw text
            await generateAudioREST(letter.text, `./public/audio/letters/${letter.id}.mp3`, ipa);
            total++;
            process.stdout.write(`\r  Progress: ${total}/${LETTERS.length}`);
            await new Promise(r => setTimeout(r, 50));
        } catch (error) {
            failed++;
            console.error(`\n❌ Failed: ${letter.id}`);
        }
    }
    console.log('\n✅ Letters complete\n');

    // Generate Syllables
    console.log('🔤 Generating syllables (81 files)...');
    const syllableCount = CONSONANTS.length * VOWELS.length;
    let sylProgress = 0;
    for (const consonant of CONSONANTS) {
        for (const vowel of VOWELS) {
            try {
                const text = consonant.letter + vowel.diacritic;
                const id = `syl_${consonant.id}_${vowel.id}`;
                const ipa = `${CONS_IPA[consonant.id]}${VOWEL_IPA[vowel.id]}`;
                await generateAudioREST(text, `./public/audio/syllables/${id}.mp3`, ipa);
                total++;
                sylProgress++;
                process.stdout.write(`\r  Progress: ${sylProgress}/${syllableCount}`);
                await new Promise(r => setTimeout(r, 50));
            } catch (error) {
                failed++;
            }
        }
    }
    console.log('\n✅ Syllables complete\n');
    console.log('🎉 Generation Complete!');
    console.log(`✅ Generated: ${total} files`);
    if (failed > 0) console.log(`❌ Failed: ${failed} files`);
}

run().catch(console.error);
