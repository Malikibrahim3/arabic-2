/**
 * Audio Asset Generation Script
 * 
 * This is a utility script to systematically generate high-quality, matched
 * Arabic audio files for the entire app using Google Cloud Text-to-Speech.
 * 
 * PREREQUISITES:
 * 1. \`npm install @google-cloud/text-to-speech\`
 * 2. Set up a Google Cloud Project with the TTS API enabled.
 * 3. Set your GOOGLE_APPLICATION_CREDENTIALS environment variable.
 * 
 * USAGE:
 * \`ts-node scripts/generate_audio.ts\`
 */

import textToSpeech from '@google-cloud/text-to-speech';
import fs from 'fs';
import util from 'util';
import path from 'path';

// Instantiate the Google TTS Client
// Make sure GOOGLE_APPLICATION_CREDENTIALS is set in your env!
const client = new textToSpeech.TextToSpeechClient();

// The premium, consistent Voice we want to use for the entire app.
// 'ar-XA-Wavenet-A' is a high-quality Arabic female voice.
// 'ar-XA-Wavenet-B' is a high-quality Arabic male voice.
const VOICE_NAME = 'ar-XA-Wavenet-B';

// ==========================================
// CONFIGURATION: What needs to be generated?
// ==========================================
const LETTERS = [
    // Core Alphabet
    { text: "أَلِف", filename: "alif.mp3" },
    { text: "بَاء", filename: "baa.mp3" },
    { text: "تَاء", filename: "taa.mp3" },
    { text: "ثَاء", filename: "thaa.mp3" },
    { text: "جِيم", filename: "jeem.mp3" },
    { text: "حَاء", filename: "haa.mp3" },
    { text: "خَاء", filename: "khaa.mp3" },
    { text: "دَال", filename: "daal.mp3" },
    { text: "ذَال", filename: "thaal.mp3" },
    { text: "رَاء", filename: "raa.mp3" },
    { text: "زَاي", filename: "zaay.mp3" },
    { text: "سِين", filename: "seen.mp3" },
    { text: "شِين", filename: "sheen.mp3" },
    { text: "صَاد", filename: "saad.mp3" },
    { text: "ضَاد", filename: "dhaad.mp3" },
    { text: "طَاء", filename: "taa_thick.mp3" },
    { text: "ظَاء", filename: "thaa_thick.mp3" },
    { text: "عَيْن", filename: "ayn.mp3" },
    { text: "غَيْن", filename: "ghayn.mp3" },
    { text: "فَاء", filename: "faa.mp3" },
    { text: "قَاف", filename: "qaaf.mp3" },
    { text: "كَاف", filename: "kaaf.mp3" },
    { text: "لَام", filename: "laam.mp3" },
    { text: "مِيم", filename: "meem.mp3" },
    { text: "نُون", filename: "noon.mp3" },
    { text: "هَاء", filename: "ha.mp3" },
    { text: "وَاو", filename: "waaw.mp3" },
    { text: "يَاء", filename: "yaa.mp3" },
    // Short Vowels
    { text: "فَتْحَة", filename: "fatha.mp3" },
    { text: "كَسْرَة", filename: "kasra.mp3" },
    { text: "ضَمَّة", filename: "damma.mp3" }
];

const WORDS = [
    // Unit 3 Node 1: First Words
    { text: "باب", filename: "word_bab.mp3" },
    { text: "بيت", filename: "word_bayt.mp3" },
    { text: "بنت", filename: "word_bint.mp3" },
    { text: "تمر", filename: "word_tamr.mp3" },

    // Unit 3 Node 2: Nature & Animals
    { text: "كلب", filename: "word_kalb.mp3" },
    { text: "شمس", filename: "word_shams.mp3" },
    { text: "قمر", filename: "word_qamar.mp3" },
    { text: "ماء", filename: "word_maa.mp3" },

    // Unit 3 Node 3: People & Things
    { text: "ولد", filename: "word_walad.mp3" },
    { text: "رجل", filename: "word_rajul.mp3" },
    { text: "كتاب", filename: "word_kitab.mp3" },
    { text: "خبز", filename: "word_khubz.mp3" },

    // Unit 3 Node 4: Body Parts
    { text: "عين", filename: "word_ayn.mp3" },
    { text: "وجه", filename: "word_wajh.mp3" },
    { text: "رأس", filename: "word_raas.mp3" },
    { text: "فم", filename: "word_fam.mp3" },
    { text: "يد", filename: "word_yad.mp3" },

    // Unit 3 Node 5: Adjectives
    { text: "كبير", filename: "word_kabeer.mp3" },
    { text: "صغير", filename: "word_sagheer.mp3" },
    { text: "جديد", filename: "word_jadeed.mp3" },
    { text: "قديم", filename: "word_qadeem.mp3" },
    { text: "جميل", filename: "word_jameel.mp3" },

    // ---- MASSIVE VOCABULARY EXPANSION ----
    // Numbers (1-20)
    { text: "واحد", filename: "num_1.mp3" },
    { text: "اثنان", filename: "num_2.mp3" },
    { text: "ثلاثة", filename: "num_3.mp3" },
    { text: "أربعة", filename: "num_4.mp3" },
    { text: "خمسة", filename: "num_5.mp3" },
    { text: "ستة", filename: "num_6.mp3" },
    { text: "سبعة", filename: "num_7.mp3" },
    { text: "ثمانية", filename: "num_8.mp3" },
    { text: "تسعة", filename: "num_9.mp3" },
    { text: "عشرة", filename: "num_10.mp3" },
    { text: "أحد عشر", filename: "num_11.mp3" },
    { text: "اثنا عشر", filename: "num_12.mp3" },
    { text: "ثلاثة عشر", filename: "num_13.mp3" },
    { text: "أربعة عشر", filename: "num_14.mp3" },
    { text: "خمسة عشر", filename: "num_15.mp3" },
    { text: "ستة عشر", filename: "num_16.mp3" },
    { text: "سبعة عشر", filename: "num_17.mp3" },
    { text: "ثمانية عشر", filename: "num_18.mp3" },
    { text: "تسعة عشر", filename: "num_19.mp3" },
    { text: "عشرون", filename: "num_20.mp3" },

    // Family
    { text: "أب", filename: "fam_father.mp3" },
    { text: "أم", filename: "fam_mother.mp3" },
    { text: "أخ", filename: "fam_brother.mp3" },
    { text: "أخت", filename: "fam_sister.mp3" },
    { text: "ابن", filename: "fam_son.mp3" },
    { text: "ابنة", filename: "fam_daughter.mp3" },
    { text: "جد", filename: "fam_grandfather.mp3" },
    { text: "جدة", filename: "fam_grandmother.mp3" },

    // Colors
    { text: "أحمر", filename: "col_red.mp3" },
    { text: "أزرق", filename: "col_blue.mp3" },
    { text: "أخضر", filename: "col_green.mp3" },
    { text: "أصفر", filename: "col_yellow.mp3" },
    { text: "أسود", filename: "col_black.mp3" },
    { text: "أبيض", filename: "col_white.mp3" },

    // Food & Drink (Extensions)
    { text: "تفاح", filename: "food_apple.mp3" },
    { text: "قهوة", filename: "drink_coffee.mp3" },
    { text: "شاي", filename: "drink_tea.mp3" },
    { text: "حليب", filename: "drink_milk.mp3" },
    { text: "لحم", filename: "food_meat.mp3" },
    { text: "دجاج", filename: "food_chicken.mp3" },

    // Common Verbs
    { text: "ذهب", filename: "verb_went.mp3" },
    { text: "أكل", filename: "verb_ate.mp3" },
    { text: "شرب", filename: "verb_drank.mp3" },
    { text: "قرأ", filename: "verb_read.mp3" },
    { text: "كتب", filename: "verb_wrote.mp3" },
    { text: "جلس", filename: "verb_sat.mp3" },
    { text: "نام", filename: "verb_slept.mp3" },

    // Places
    { text: "مدرسة", filename: "place_school.mp3" },
    { text: "مسجد", filename: "place_mosque.mp3" },
    { text: "مستشفى", filename: "place_hospital.mp3" },
    { text: "سوق", filename: "place_market.mp3" },
    { text: "مطار", filename: "place_airport.mp3" },

    // ==== FUTURE EXPANSIONS ====
    // Days of the Week
    { text: "الأحد", filename: "day_sunday.mp3" },
    { text: "الإثنين", filename: "day_monday.mp3" },
    { text: "الثلاثاء", filename: "day_tuesday.mp3" },
    { text: "الأربعاء", filename: "day_wednesday.mp3" },
    { text: "الخميس", filename: "day_thursday.mp3" },
    { text: "الجمعة", filename: "day_friday.mp3" },
    { text: "السبت", filename: "day_saturday.mp3" },

    // Months
    { text: "يناير", filename: "month_january.mp3" },
    { text: "فبراير", filename: "month_february.mp3" },
    { text: "مارس", filename: "month_march.mp3" },
    { text: "أبريل", filename: "month_april.mp3" },
    { text: "مايو", filename: "month_may.mp3" },
    { text: "يونيو", filename: "month_june.mp3" },
    { text: "يوليو", filename: "month_july.mp3" },
    { text: "أغسطس", filename: "month_august.mp3" },
    { text: "سبتمبر", filename: "month_september.mp3" },
    { text: "أكتوبر", filename: "month_october.mp3" },
    { text: "نوفمبر", filename: "month_november.mp3" },
    { text: "ديسمبر", filename: "month_december.mp3" },

    // Professions
    { text: "طبيب", filename: "prof_doctor.mp3" },
    { text: "معلم", filename: "prof_teacher.mp3" },
    { text: "مهندس", filename: "prof_engineer.mp3" },
    { text: "طالب", filename: "prof_student.mp3" },
    { text: "طباخ", filename: "prof_chef.mp3" },

    // Extended Animals
    { text: "قطة", filename: "anim_cat.mp3" },
    { text: "حصان", filename: "anim_horse.mp3" },
    { text: "بقرة", filename: "anim_cow.mp3" },
    { text: "طائر", filename: "anim_bird.mp3" },
    { text: "سمكة", filename: "anim_fish.mp3" },

    // Transportation
    { text: "سيارة", filename: "trans_car.mp3" },
    { text: "طائرة", filename: "trans_plane.mp3" },
    { text: "قطار", filename: "trans_train.mp3" },
    { text: "دراجة", filename: "trans_bike.mp3" },
    { text: "حافلة", filename: "trans_bus.mp3" },

    // Weather
    { text: "مطر", filename: "wea_rain.mp3" },
    { text: "ثلج", filename: "wea_snow.mp3" },
    { text: "رياح", filename: "wea_wind.mp3" },
    { text: "سحابة", filename: "wea_cloud.mp3" },

    // Emotions
    { text: "سعيد", filename: "emo_happy.mp3" },
    { text: "حزين", filename: "emo_sad.mp3" },
    { text: "غاضب", filename: "emo_angry.mp3" },
    { text: "خائف", filename: "emo_scared.mp3" },
    { text: "متعب", filename: "emo_tired.mp3" }
];

const SENTENCES = [
    // Greetings & Pleasantries
    { text: "السَّلَامُ عَلَيْكُمْ", filename: "greet_salam.mp3" },
    { text: "وَعَلَيْكُمُ السَّلَام", filename: "greet_reply.mp3" },
    { text: "كَيْفَ حَالُكَ؟", filename: "greet_how_are_you.mp3" },
    { text: "أَنَا بِخَيْر، شُكْراً", filename: "greet_fine_thanks.mp3" },
    { text: "صَبَاحُ الْخَيْر", filename: "greet_good_morning.mp3" },
    { text: "مَسَاءُ الْخَيْر", filename: "greet_good_evening.mp3" },

    // Practical Questions
    { text: "أَيْنَ الْحَمَّام؟", filename: "phrase_where_bathroom.mp3" },
    { text: "كَمْ هَذَا؟", filename: "phrase_how_much.mp3" },
    { text: "مَا اسْمُكَ؟", filename: "phrase_whats_your_name.mp3" },
    { text: "مِنْ أَيْنَ أَنْتَ؟", filename: "phrase_where_from.mp3" },

    // Survival Phrases
    { text: "لَا أَفْهَم", filename: "phrase_dont_understand.mp3" },
    { text: "تَحَدَّثْ بِبُطْءٍ مِنْ فَضْلِك", filename: "phrase_speak_slowly.mp3" },
    { text: "هَلْ تَتَحَدَّثُ الْإِنْجِلِيزِيَّة؟", filename: "phrase_do_you_speak_english.mp3" },
    { text: "أُرِيدُ مُسَاعَدَة", filename: "phrase_need_help.mp3" }
];

async function generateAudio(text: string, outputFile: string) {
    console.log(`Generating audio for: ${text} -> ${outputFile}`);

    const request = {
        input: { text: text },
        // Select the language and SSML voice gender (optional)
        voice: { languageCode: 'ar-XA', name: VOICE_NAME },
        // select the type of audio encoding
        audioConfig: {
            audioEncoding: 'MP3' as const,
            speakingRate: 0.85, // Slightly slower for language learners!
            pitch: 0.0
        },
    };

    try {
        // Performs the text-to-speech request
        const [response] = await client.synthesizeSpeech(request);

        // Write the binary audio content to a local file
        const writeFile = util.promisify(fs.writeFile);

        // Ensure directory exists
        const dir = path.dirname(outputFile);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        await writeFile(outputFile, response.audioContent!, 'binary');
        console.log(`✅ Saved ${outputFile}`);
    } catch (error) {
        console.error(`❌ Failed to generate audio for ${text}:`, error);
    }
}

async function run() {
    console.log("Starting Audio Generation Batch...");

    // 1. Generate Letters
    for (const letter of LETTERS) {
        await generateAudio(letter.text, `./public/audio/letters/${letter.filename}`);
        // Add a small delay to avoid rate limiting
        await new Promise(r => setTimeout(r, 500));
    }

    // 2. Generate Words
    for (const word of WORDS) {
        await generateAudio(word.text, `./public/audio/words/${word.filename}`);
        await new Promise(r => setTimeout(r, 500));
    }

    // 3. Generate Sentences
    for (const sentence of SENTENCES) {
        // Output sentences to a dedicated cache folder
        await generateAudio(sentence.text, `./public/audio/cache/sentences/${sentence.filename}`);
        await new Promise(r => setTimeout(r, 500));
    }

    console.log("Audio Generation Complete!");
}

// Execute the script
run();
