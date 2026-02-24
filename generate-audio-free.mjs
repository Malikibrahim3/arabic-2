#!/usr/bin/env node
/**
 * generate-audio-free.mjs
 *
 * Downloads Arabic audio files from Google Translate TTS (no API key needed).
 * Voice: ar (Arabic)
 * Format: MP3
 *
 * Usage: node generate-audio-free.mjs
 *
 * Output structure:
 *   public/audio/letters/   — individual letter sounds (with fatha) + letter names
 *   public/audio/syllables/ — consonant+vowel combinations
 *   public/audio/words/     — common words and phrases
 *   public/audio/sentences/ — full sentences
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_BASE = path.join(__dirname, 'public', 'audio');

// ─── Comprehensive Content Lists ───────────────────────────

const LETTERS = [
    // Letter sounds (with fatha — the SOUND, not the name)
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

    // Letter names (how the letter is called)
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

// Syllables: consonant + all 3 short vowels
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

const VOWEL_MARKS = [
    { id: 'fatha', mark: '\u064E' },
    { id: 'kasra', mark: '\u0650' },
    { id: 'damma', mark: '\u064F' },
];

const SYLLABLES = [];
for (const c of CONSONANTS) {
    for (const v of VOWEL_MARKS) {
        SYLLABLES.push({
            id: `syl_${c.id}_${v.id}`,
            text: c.letter + v.mark,
            dir: 'syllables',
        });
    }
}

// Common words
const WORDS = [
    { id: 'word_salam', text: 'سَلام' },
    { id: 'word_marhaba', text: 'مَرحَبا' },
    { id: 'word_shukran', text: 'شُكرًا' },
    { id: 'word_afwan', text: 'عَفوًا' },
    { id: 'word_naam', text: 'نَعَم' },
    { id: 'word_laa', text: 'لا' },
    { id: 'word_min_fadlak', text: 'مِن فَضلِك' },
    { id: 'word_ab', text: 'أَب' },
    { id: 'word_umm', text: 'أُمّ' },
    { id: 'word_ibn', text: 'اِبن' },
    { id: 'word_bint', text: 'بِنت' },
    { id: 'word_akh', text: 'أَخ' },
    { id: 'word_ukht', text: 'أُخت' },
    { id: 'word_bayt', text: 'بَيت' },
    { id: 'word_kitab', text: 'كِتاب' },
    { id: 'word_qalam', text: 'قَلَم' },
    { id: 'word_bab', text: 'باب' },
    { id: 'word_maa', text: 'ماء' },
    { id: 'word_tamr', text: 'تَمر' },
    { id: 'word_shams', text: 'شَمس' },
    { id: 'word_qamar', text: 'قَمَر' },
    { id: 'word_nahr', text: 'نَهر' },
    { id: 'word_jabal', text: 'جَبَل' },
    { id: 'word_madrasah', text: 'مَدرَسة' },
    { id: 'word_walad', text: 'وَلَد' },
    { id: 'word_rajul', text: 'رَجُل' },
    { id: 'word_samak', text: 'سَمَك' },
    { id: 'word_tuffah', text: 'تُفّاح' },
    { id: 'word_kalb', text: 'كَلب' },
    { id: 'word_qitt', text: 'قِطّ' },
    { id: 'word_ahmar', text: 'أَحمَر' },
    { id: 'word_azraq', text: 'أَزرَق' },
    { id: 'word_akhdar', text: 'أَخضَر' },
    { id: 'word_abyad', text: 'أَبيَض' },
    { id: 'word_aswad', text: 'أَسوَد' },
    { id: 'word_wahid', text: 'واحِد' },
    { id: 'word_ithnan', text: 'اِثنان' },
    { id: 'word_thalathah', text: 'ثَلاثة' },
    { id: 'word_arba3ah', text: 'أَربَعة' },
    { id: 'word_khamsah', text: 'خَمسة' },
    { id: 'word_sittah', text: 'سِتّة' },
    { id: 'word_sab3ah', text: 'سَبعة' },
    { id: 'word_thamaniyah', text: 'ثَمانية' },
    { id: 'word_tis3ah', text: 'تِسعة' },
    { id: 'word_3asharah', text: 'عَشَرة' },
    { id: 'word_yad', text: 'يَد' },
    { id: 'word_ayn_body', text: 'عَين' },
    { id: 'word_rass', text: 'رَأس' },
    { id: 'word_qalb', text: 'قَلب' },
    { id: 'word_khubz', text: 'خُبز' },
    { id: 'word_haleb', text: 'حَليب' },
    { id: 'word_chai', text: 'شاي' },
    { id: 'word_qahwah', text: 'قَهوة' },
];

const SENTENCES = [
    { id: 'sent_assalamu', text: 'اَلسَّلامُ عَلَيكُم' },
    { id: 'sent_bismillah', text: 'بِسمِ اللّه' },
    { id: 'sent_kayf_halak', text: 'كَيفَ حالُك' },
    { id: 'sent_ana_bikhayr', text: 'أَنا بِخَير' },
    { id: 'sent_ismi', text: 'اِسمي' },
    { id: 'sent_hadha_kitab', text: 'هذا كِتاب' },
    { id: 'sent_hadhihi_madrasah', text: 'هذِهِ مَدرَسة' },
    { id: 'sent_ana_uhibb', text: 'أَنا أُحِبُّ العَرَبيّة' },
    { id: 'sent_ma3a_salama', text: 'مَعَ السَّلامة' },
    { id: 'sent_sabah_alkhayr', text: 'صَباحُ الخَير' },
    { id: 'sent_masaa_alkhayr', text: 'مَساءُ الخَير' },
    { id: 'sent_jazak_allah', text: 'جَزاكَ اللّه خَيرًا' },
];

// ─── Build all items with directory info ───────────────────

function addDir(items, dir) {
    return items.map(i => ({ ...i, dir }));
}

const ALL_ITEMS = [
    ...addDir(LETTERS, 'letters'),
    ...SYLLABLES,
    ...addDir(WORDS, 'words'),
    ...addDir(SENTENCES, 'sentences'),
];

// ─── Download from Google Translate TTS ────────────────────

function ensureDir(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

function downloadAudio(item) {
    return new Promise((resolve) => {
        const outDir = path.join(OUTPUT_BASE, item.dir);
        ensureDir(outDir);
        const outFile = path.join(outDir, `${item.id}.mp3`);

        if (fs.existsSync(outFile)) {
            resolve('skip');
            return;
        }

        const googleUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=ar&client=tw-ob&q=${encodeURIComponent(item.text)}`;

        https.get(googleUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
                'Referer': 'https://translate.google.com/',
            }
        }, (res) => {
            if (res.statusCode !== 200) {
                console.error(`  ✗ ${item.id} — HTTP ${res.statusCode}`);
                resolve('error');
                return;
            }

            const file = fs.createWriteStream(outFile);
            res.pipe(file);
            file.on('finish', () => {
                file.close();
                console.log(`  ✓ ${item.id}`);
                resolve('ok');
            });
        }).on('error', (err) => {
            console.error(`  ✗ ${item.id} — ${err.message}`);
            resolve('error');
        });
    });
}

async function downloadAll() {
    console.log(`\n🎤 Arabic Audio Generator (Google Translate TTS)`);
    console.log(`   Total items: ${ALL_ITEMS.length}`);
    console.log(`   Letters: ${LETTERS.length}`);
    console.log(`   Syllables: ${SYLLABLES.length}`);
    console.log(`   Words: ${WORDS.length}`);
    console.log(`   Sentences: ${SENTENCES.length}`);
    console.log(`   Output: ${OUTPUT_BASE}\n`);

    ensureDir(OUTPUT_BASE);

    let downloaded = 0;
    let skipped = 0;
    let errors = 0;

    for (const item of ALL_ITEMS) {
        const result = await downloadAudio(item);
        if (result === 'skip') skipped++;
        else if (result === 'ok') downloaded++;
        else errors++;

        // Rate limit: 400ms between requests to be polite
        if (result !== 'skip') {
            await new Promise(r => setTimeout(r, 400));
        }
    }

    console.log(`\n✅ Done!`);
    console.log(`   Downloaded: ${downloaded}`);
    console.log(`   Skipped: ${skipped}`);
    console.log(`   Errors: ${errors}`);
    console.log(`   Total: ${ALL_ITEMS.length}\n`);
}

// Write vocabulary.json for AudioEngine
function writeVocabulary() {
    const vocab = {};
    for (const item of ALL_ITEMS) {
        vocab[item.id] = {
            text: item.text,
            path: `/audio/${item.dir}/${item.id}.mp3`,
        };
    }
    const outFile = path.join(OUTPUT_BASE, 'vocabulary.json');
    ensureDir(path.dirname(outFile));
    fs.writeFileSync(outFile, JSON.stringify(vocab, null, 2));
    console.log(`📖 Vocabulary written to ${outFile}`);
}

writeVocabulary();
downloadAll().catch(console.error);
