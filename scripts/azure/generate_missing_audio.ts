/**
 * Generate MISSING word audio files using Azure TTS REST API
 * Only generates files that don't already exist in public/audio/words/
 */

import fs from 'fs';
import path from 'path';
import https from 'https';

const AZURE_SPEECH_KEY = 'YOUR_AZURE_KEY';
const AZURE_REGION = 'uksouth';
const VOICE_NAME = 'ar-SA-ZariyahNeural';
const SPEAKING_RATE = '0.85';
const OUTPUT_DIR = './public/audio/words';

async function generateAudioREST(text: string, outputFile: string): Promise<void> {
    const ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="ar-SA"><voice name="${VOICE_NAME}"><prosody rate="${SPEAKING_RATE}">${text}</prosody></voice></speak>`;

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

// All missing words from UNIT4, UNIT4B, UNIT4C
const MISSING_WORDS = [
    // Family
    { id: 'fam_father', text: 'أَبٌ' },
    { id: 'fam_mother', text: 'أُمٌّ' },
    { id: 'fam_brother', text: 'أَخٌ' },
    { id: 'fam_sister', text: 'أُخْتٌ' },
    // Food & Drink
    { id: 'food_apple', text: 'تُفَّاحٌ' },
    { id: 'drink_milk', text: 'حَلِيبٌ' },
    // Places
    { id: 'place_school', text: 'مَدْرَسَةٌ' },
    { id: 'place_mosque', text: 'مَسْجِدٌ' },
    { id: 'place_hospital', text: 'مُسْتَشْفَى' },
    { id: 'place_market', text: 'سُوقٌ' },
    // Time & Numbers
    { id: 'time_day', text: 'يَوْمٌ' },
    { id: 'time_night', text: 'لَيْلَةٌ' },
    { id: 'time_hour', text: 'سَاعَةٌ' },
    { id: 'time_week', text: 'أُسْبُوعٌ' },
    { id: 'time_month', text: 'شَهْرٌ' },
    { id: 'time_year', text: 'سَنَةٌ' },
    { id: 'num_one', text: 'وَاحِدٌ' },
    { id: 'num_two', text: 'اِثْنَانِ' },
    // Verbs
    { id: 'verb_went', text: 'ذَهَبَ' },
    { id: 'verb_came', text: 'جَاءَ' },
    { id: 'verb_ate', text: 'أَكَلَ' },
    { id: 'verb_drank', text: 'شَرِبَ' },
    { id: 'verb_wrote', text: 'كَتَبَ' },
    { id: 'verb_read', text: 'قَرَأَ' },
    { id: 'verb_slept', text: 'نَامَ' },
    { id: 'verb_said', text: 'قَالَ' },
    // Adjectives
    { id: 'adj_beautiful', text: 'جَمِيلٌ' },
    { id: 'adj_ugly', text: 'قَبِيحٌ' },
    { id: 'adj_tall', text: 'طَوِيلٌ' },
    { id: 'adj_short', text: 'قَصِيرٌ' },
    { id: 'adj_fast', text: 'سَرِيعٌ' },
    { id: 'adj_slow', text: 'بَطِيءٌ' },
    { id: 'adj_easy', text: 'سَهْلٌ' },
    { id: 'adj_difficult', text: 'صَعْبٌ' },
    // Body Parts Extended
    { id: 'body_ear', text: 'أُذُنٌ' },
    { id: 'body_nose', text: 'أَنْفٌ' },
    { id: 'body_mouth', text: 'فَمٌ' },
    { id: 'body_tongue', text: 'لِسَانٌ' },
    { id: 'body_tooth', text: 'سِنٌّ' },
    { id: 'body_hair', text: 'شَعْرٌ' },
    { id: 'body_leg', text: 'رِجْلٌ' },
    { id: 'body_finger', text: 'إِصْبَعٌ' },
    { id: 'body_heart', text: 'قَلْبٌ' },
    { id: 'body_back', text: 'ظَهْرٌ' },
    // Colors
    { id: 'color_white', text: 'أَبْيَضُ' },
    { id: 'color_black', text: 'أَسْوَدُ' },
    { id: 'color_red', text: 'أَحْمَرُ' },
    { id: 'color_green', text: 'أَخْضَرُ' },
    { id: 'color_blue', text: 'أَزْرَقُ' },
    { id: 'color_yellow', text: 'أَصْفَرُ' },
    { id: 'color_brown', text: 'بُنِّيٌّ' },
    { id: 'color_gray', text: 'رَمَادِيٌّ' },
    { id: 'color_orange', text: 'بُرْتُقَالِيٌّ' },
    { id: 'color_pink', text: 'وَرْدِيٌّ' },
    // Nature & Weather
    { id: 'nature_sky', text: 'سَمَاءٌ' },
    { id: 'nature_earth', text: 'أَرْضٌ' },
    { id: 'nature_mountain', text: 'جَبَلٌ' },
    { id: 'nature_sea', text: 'بَحْرٌ' },
    { id: 'nature_river', text: 'نَهْرٌ' },
    { id: 'nature_tree', text: 'شَجَرَةٌ' },
    { id: 'nature_flower', text: 'زَهْرَةٌ' },
    { id: 'weather_rain', text: 'مَطَرٌ' },
    { id: 'weather_wind', text: 'رِيحٌ' },
    { id: 'weather_cloud', text: 'غَيْمٌ' },
    // Common Objects
    { id: 'obj_pen', text: 'قَلَمٌ' },
    { id: 'obj_paper', text: 'وَرَقَةٌ' },
    { id: 'obj_table', text: 'طَاوِلَةٌ' },
    { id: 'obj_chair', text: 'كُرْسِيٌّ' },
    { id: 'obj_window', text: 'نَافِذَةٌ' },
    { id: 'obj_clock', text: 'سَاعَةٌ' },
    { id: 'obj_key', text: 'مِفْتَاحٌ' },
    { id: 'obj_phone', text: 'هَاتِفٌ' },
    { id: 'obj_bag', text: 'حَقِيبَةٌ' },
    { id: 'obj_car', text: 'سَيَّارَةٌ' },
    // Directions
    { id: 'dir_right', text: 'يَمِينٌ' },
    { id: 'dir_left', text: 'يَسَارٌ' },
    { id: 'dir_above', text: 'فَوْقَ' },
    { id: 'dir_below', text: 'تَحْتَ' },
    { id: 'dir_front', text: 'أَمَامَ' },
    { id: 'dir_behind', text: 'خَلْفَ' },
    { id: 'dir_inside', text: 'دَاخِلَ' },
    { id: 'dir_outside', text: 'خَارِجَ' },
    { id: 'dir_near', text: 'قَرِيبٌ' },
    { id: 'dir_far', text: 'بَعِيدٌ' },
    // People
    { id: 'people_woman', text: 'اِمْرَأَةٌ' },
    { id: 'people_child', text: 'طِفْلٌ' },
    { id: 'people_friend', text: 'صَدِيقٌ' },
    { id: 'people_teacher', text: 'مُعَلِّمٌ' },
    { id: 'people_student', text: 'طَالِبٌ' },
    { id: 'people_doctor', text: 'طَبِيبٌ' },
    { id: 'people_neighbor', text: 'جَارٌ' },
    { id: 'people_guest', text: 'ضَيْفٌ' },
    // Actions Extended
    { id: 'verb_opened', text: 'فَتَحَ' },
    { id: 'verb_closed', text: 'أَغْلَقَ' },
    { id: 'verb_sat', text: 'جَلَسَ' },
    { id: 'verb_stood', text: 'وَقَفَ' },
    { id: 'verb_walked', text: 'مَشَى' },
    { id: 'verb_ran', text: 'رَكَضَ' },
    { id: 'verb_heard', text: 'سَمِعَ' },
    { id: 'verb_saw', text: 'رَأَى' },
    { id: 'verb_understood', text: 'فَهِمَ' },
    { id: 'verb_knew', text: 'عَرَفَ' },
    // Expressions
    { id: 'expr_yes', text: 'نَعَمْ' },
    { id: 'expr_no', text: 'لَا' },
    { id: 'expr_please', text: 'مِنْ فَضْلِكَ' },
    { id: 'expr_thanks', text: 'شُكْرًا' },
    { id: 'expr_welcome', text: 'عَفْوًا' },
    { id: 'expr_sorry', text: 'آسِفٌ' },
    { id: 'expr_with', text: 'مَعَ' },
    { id: 'expr_without', text: 'بِدُونِ' },
    { id: 'expr_also', text: 'أَيْضًا' },
    { id: 'expr_but', text: 'لَكِنْ' },
];

// Also generate missing sentence audio
const MISSING_SENTENCES = [
    { id: 'sent_ma_ismuka', text: 'مَا اسْمُكَ' },
    { id: 'sent_ayna_taskun', text: 'أَيْنَ تَسْكُنُ' },
    { id: 'sent_kam_umruk', text: 'كَمْ عُمْرُكَ' },
    { id: 'sent_madha_tamal', text: 'مَاذَا تَعْمَلُ' },
    { id: 'sent_hal_tatakallam', text: 'هَلْ تَتَكَلَّمُ العَرَبِيَّةَ' },
    { id: 'sent_la_afham', text: 'لَا أَفْهَمُ' },
    { id: 'sent_laysa_indi', text: 'لَيْسَ عِنْدِي' },
    { id: 'sent_lam_adhhab', text: 'لَمْ أَذْهَبْ' },
    { id: 'sent_la_arif', text: 'لَا أَعْرِفُ' },
    { id: 'sent_laysa_huna', text: 'لَيْسَ هُنَا' },
    { id: 'sent_taal_huna', text: 'تَعَالَ هُنَا' },
    { id: 'sent_ijlis', text: 'اِجْلِسْ' },
    { id: 'sent_intadhir', text: 'اِنْتَظِرْ' },
    { id: 'sent_idhhab', text: 'اِذْهَبْ' },
    { id: 'sent_isma', text: 'اِسْمَعْ' },
    { id: 'sent_taqs_jamil', text: 'الطَّقْسُ جَمِيلٌ' },
    { id: 'sent_kitab_kabir', text: 'الكِتَابُ كَبِيرٌ' },
    { id: 'sent_bayt_nadhif', text: 'البَيْتُ نَظِيفٌ' },
    { id: 'sent_taam_ladhidh', text: 'الطَّعَامُ لَذِيذٌ' },
    { id: 'sent_madrasa_qariba', text: 'المَدْرَسَةُ قَرِيبَةٌ' },
];

async function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
    let generated = 0;
    let skipped = 0;

    console.log('=== Generating Missing Word Audio ===\n');

    for (const word of MISSING_WORDS) {
        const outFile = path.join(OUTPUT_DIR, `${word.id}.mp3`);
        if (fs.existsSync(outFile)) {
            console.log(`  SKIP (exists): ${word.id}`);
            skipped++;
            continue;
        }
        try {
            console.log(`  GEN: ${word.id} → "${word.text}"`);
            await generateAudioREST(word.text, outFile);
            generated++;
            await sleep(200); // Rate limiting
        } catch (err: any) {
            console.error(`  FAIL: ${word.id} - ${err.message}`);
        }
    }

    console.log('\n=== Generating Missing Sentence Audio ===\n');

    const sentDir = './public/audio/sentences';
    for (const sent of MISSING_SENTENCES) {
        const outFile = path.join(sentDir, `${sent.id}.mp3`);
        if (fs.existsSync(outFile)) {
            console.log(`  SKIP (exists): ${sent.id}`);
            skipped++;
            continue;
        }
        try {
            console.log(`  GEN: ${sent.id} → "${sent.text}"`);
            await generateAudioREST(sent.text, outFile);
            generated++;
            await sleep(200);
        } catch (err: any) {
            console.error(`  FAIL: ${sent.id} - ${err.message}`);
        }
    }

    console.log(`\n✅ Done! Generated: ${generated}, Skipped: ${skipped}`);

    // Update vocabulary.json with new entries
    const vocabPath = './public/audio/vocabulary.json';
    const vocab = JSON.parse(fs.readFileSync(vocabPath, 'utf-8'));

    for (const word of MISSING_WORDS) {
        if (!vocab[word.id]) {
            vocab[word.id] = {
                text: word.text,
                path: `/audio/words/${word.id}.mp3`
            };
        }
    }
    for (const sent of MISSING_SENTENCES) {
        if (!vocab[sent.id]) {
            vocab[sent.id] = {
                text: sent.text,
                path: `/audio/sentences/${sent.id}.mp3`
            };
        }
    }

    fs.writeFileSync(vocabPath, JSON.stringify(vocab, null, 2) + '\n');
    console.log('📝 Updated vocabulary.json');
}

run().catch(console.error);
