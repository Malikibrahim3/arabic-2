#!/usr/bin/env node
/**
 * Regenerate ONLY the 28 letter sound files using Arabic phonetic spelling.
 * 
 * DISCOVERY: Azure's ar-SA voice IGNORES IPA <phoneme> tags entirely.
 * Instead, we use the natural Arabic text that the TTS engine already
 * pronounces correctly — the full letter names (e.g. "باء") and then
 * for sounds, we use short open syllables that are naturally clear.
 * 
 * Strategy: For each letter+fatha, we use a 2-letter open syllable
 * (consonant + alif) with prosody set very short, so it sounds like
 * just the letter sound "ba", "ta", "tha" etc.
 */

import * as https from 'https';
import * as fs from 'fs';
import * as path from 'path';

const AZURE_SPEECH_KEY = 'YOUR_AZURE_KEY';
const AZURE_REGION = 'uksouth';
const VOICE_NAME = 'ar-SA-ZariyahNeural';

// For each letter, the "phonetic text" is a short Arabic string that Azure
// naturally pronounces as JUST the letter sound. We use the consonant + 
// explicit short 'a' as a complete syllable that Azure handles correctly.
const LETTER_SOUNDS: Array<{ id: string; ssmlText: string }> = [
    // Alif is special - it's a glottal stop + fatha
    { id: 'letter_alif_fatha', ssmlText: 'أَ' },
    // For all other consonants, we spell them as open syllable + short break
    { id: 'letter_baa_fatha', ssmlText: 'بَا' },
    { id: 'letter_taa_fatha', ssmlText: 'تَا' },
    { id: 'letter_thaa_fatha', ssmlText: 'ثَا' },
    { id: 'letter_jeem_fatha', ssmlText: 'جَا' },
    { id: 'letter_haa_fatha', ssmlText: 'حَا' },
    { id: 'letter_khaa_fatha', ssmlText: 'خَا' },
    { id: 'letter_daal_fatha', ssmlText: 'دَا' },
    { id: 'letter_dhaal_fatha', ssmlText: 'ذَا' },
    { id: 'letter_raa_fatha', ssmlText: 'رَا' },
    { id: 'letter_zaay_fatha', ssmlText: 'زَا' },
    { id: 'letter_seen_fatha', ssmlText: 'سَا' },
    { id: 'letter_sheen_fatha', ssmlText: 'شَا' },
    { id: 'letter_saad_fatha', ssmlText: 'صَا' },
    { id: 'letter_daad_fatha', ssmlText: 'ضَا' },
    { id: 'letter_taa2_fatha', ssmlText: 'طَا' },
    { id: 'letter_dhaa2_fatha', ssmlText: 'ظَا' },
    { id: 'letter_ayn_fatha', ssmlText: 'عَا' },
    { id: 'letter_ghayn_fatha', ssmlText: 'غَا' },
    { id: 'letter_faa_fatha', ssmlText: 'فَا' },
    { id: 'letter_qaaf_fatha', ssmlText: 'قَا' },
    { id: 'letter_kaaf_fatha', ssmlText: 'كَا' },
    { id: 'letter_laam_fatha', ssmlText: 'لَا' },
    { id: 'letter_meem_fatha', ssmlText: 'مَا' },
    { id: 'letter_noon_fatha', ssmlText: 'نَا' },
    { id: 'letter_haa2_fatha', ssmlText: 'هَا' },
    { id: 'letter_waaw_fatha', ssmlText: 'وَا' },
    { id: 'letter_yaa_fatha', ssmlText: 'يَا' },
];

// Syllables: consonant + vowel as natural Arabic
const CONSONANTS = [
    { id: 'baa', ar: 'ب' }, { id: 'taa', ar: 'ت' }, { id: 'thaa', ar: 'ث' },
    { id: 'jeem', ar: 'ج' }, { id: 'haa', ar: 'ح' }, { id: 'khaa', ar: 'خ' },
    { id: 'daal', ar: 'د' }, { id: 'dhaal', ar: 'ذ' }, { id: 'raa', ar: 'ر' },
    { id: 'zaay', ar: 'ز' }, { id: 'seen', ar: 'س' }, { id: 'sheen', ar: 'ش' },
    { id: 'saad', ar: 'ص' }, { id: 'daad', ar: 'ض' }, { id: 'taa2', ar: 'ط' },
    { id: 'dhaa2', ar: 'ظ' }, { id: 'ayn', ar: 'ع' }, { id: 'ghayn', ar: 'غ' },
    { id: 'faa', ar: 'ف' }, { id: 'qaaf', ar: 'ق' }, { id: 'kaaf', ar: 'ك' },
    { id: 'laam', ar: 'ل' }, { id: 'meem', ar: 'م' }, { id: 'noon', ar: 'ن' },
    { id: 'haa2', ar: 'ه' }, { id: 'waaw', ar: 'و' }, { id: 'yaa', ar: 'ي' },
];

// For syllable vowels, use the long vowel form to avoid Azure confusion
const VOWEL_EXTENSIONS: Record<string, { diacritic: string; longVowel: string }> = {
    'fatha': { diacritic: 'َ', longVowel: 'ا' },  // consonant + fatha + alif = "Xaa"
    'kasra': { diacritic: 'ِ', longVowel: 'ي' },  // consonant + kasra + yaa = "Xii"
    'damma': { diacritic: 'ُ', longVowel: 'و' },  // consonant + damma + waw = "Xuu"
};

// Letter names that need fixing (from test results - 4 failures)  
const LETTER_NAME_FIXES: Array<{ id: string; ssmlText: string }> = [
    { id: 'letter_alif_name', ssmlText: 'أَلِف' },
    { id: 'letter_khaa_name', ssmlText: 'خَاء' },
    { id: 'letter_laam_name', ssmlText: 'لَام' },
    { id: 'letter_yaa_name', ssmlText: 'يَاء' },
];

// Word fixes (9 failures from test)
const WORD_FIXES: Array<{ id: string; ssmlText: string; dir: string }> = [
    { id: 'word_walad', ssmlText: 'وَلَد', dir: 'words' },
    { id: 'word_ab', ssmlText: 'أَبٌ', dir: 'words' },
    { id: 'word_umm', ssmlText: 'أُمٌّ', dir: 'words' },
    { id: 'word_akh', ssmlText: 'أَخٌ', dir: 'words' },
    { id: 'word_qitt', ssmlText: 'قِطَّة', dir: 'words' },  // Use full form قطة for clarity
    { id: 'fam_father', ssmlText: 'أَبٌ', dir: 'words' },
    { id: 'fam_mother', ssmlText: 'أُمٌّ', dir: 'words' },
    { id: 'fam_brother', ssmlText: 'أَخٌ', dir: 'words' },
    { id: 'body_mouth', ssmlText: 'فَمٌ', dir: 'words' },
];

function generateAudio(text: string, outputFile: string, rate: string = '0.85'): Promise<void> {
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
                let err = '';
                res.on('data', c => err += c);
                res.on('end', () => reject(new Error(`HTTP ${res.statusCode}: ${err}`)));
                return;
            }
            const ws = fs.createWriteStream(outputFile);
            res.pipe(ws);
            ws.on('finish', () => { ws.close(); resolve(); });
            ws.on('error', (e) => { fs.unlinkSync(outputFile); reject(e); });
        });
        req.on('error', reject);
        req.write(ssml);
        req.end();
    });
}

async function run() {
    console.log('🔊 Regenerating Letter Sounds with Phonetic Spelling...\n');
    let total = 0, failed = 0;

    // 1. Letter sounds (28) - use open syllable spelling
    console.log('📝 Letter sounds (28 files)...');
    for (const letter of LETTER_SOUNDS) {
        try {
            // Use slower rate (0.7) so the short syllable is clearly audible
            await generateAudio(letter.ssmlText, `./public/audio/letters/${letter.id}.mp3`, '0.70');
            total++;
            console.log(`  ✅ ${letter.id}: "${letter.ssmlText}"`);
            await new Promise(r => setTimeout(r, 50));
        } catch (e: any) {
            failed++;
            console.error(`  ❌ ${letter.id}: ${e.message}`);
        }
    }

    // 2. Syllables (81) - use open syllable with long vowel
    console.log('\n🔤 Syllables (81 files)...');
    for (const cons of CONSONANTS) {
        for (const [vowelId, vowelInfo] of Object.entries(VOWEL_EXTENSIONS)) {
            const id = `syl_${cons.id}_${vowelId}`;
            const text = cons.ar + vowelInfo.diacritic + vowelInfo.longVowel;
            try {
                await generateAudio(text, `./public/audio/syllables/${id}.mp3`, '0.70');
                total++;
                await new Promise(r => setTimeout(r, 50));
            } catch (e: any) {
                failed++;
                console.error(`  ❌ ${id}: ${e.message}`);
            }
        }
    }
    console.log(`  ✅ Syllables complete`);

    // 3. Fix letter name failures (4)
    console.log('\n📛 Fixing letter names (4 files)...');
    for (const fix of LETTER_NAME_FIXES) {
        try {
            await generateAudio(fix.ssmlText, `./public/audio/letters/${fix.id}.mp3`, '0.85');
            total++;
            console.log(`  ✅ ${fix.id}: "${fix.ssmlText}"`);
            await new Promise(r => setTimeout(r, 50));
        } catch (e: any) {
            failed++;
            console.error(`  ❌ ${fix.id}: ${e.message}`);
        }
    }

    // 4. Fix word failures (9)
    console.log('\n📖 Fixing word pronunciation (9 files)...');
    for (const fix of WORD_FIXES) {
        try {
            await generateAudio(fix.ssmlText, `./public/audio/${fix.dir}/${fix.id}.mp3`, '0.85');
            total++;
            console.log(`  ✅ ${fix.id}: "${fix.ssmlText}"`);
            await new Promise(r => setTimeout(r, 50));
        } catch (e: any) {
            failed++;
            console.error(`  ❌ ${fix.id}: ${e.message}`);
        }
    }

    console.log(`\n🎉 Done! Generated: ${total}, Failed: ${failed}`);
}

run().catch(console.error);
