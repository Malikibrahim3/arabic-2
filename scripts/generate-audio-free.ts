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

import { DIALECT_OVERRIDES } from '../src/data/course';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_BASE = path.join(__dirname, '../public', 'audio');

// The dialects we explicitly support.
const DIALECTS = ['msa', 'egyptian', 'levantine', 'maghrebi', 'gulf'];

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
    // Question Words & Pronouns
    { id: 'word_madha', text: 'مَاذَا' },
    { id: 'word_kayfa', text: 'كَيْفَ' },
    { id: 'word_ayna', text: 'أَيْنَ' },
    { id: 'word_limadha', text: 'لِمَاذَا' },
    { id: 'word_hadha', text: 'هَذَا' },
    { id: 'word_hadhihi', text: 'هَذِهِ' },
    { id: 'word_ana', text: 'أَنَا' },
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

// Unit 7 Conversation Audio
const CONVERSATIONS = [
    // Conversation 1: Meeting a Friend
    { id: 'conv1_line1', text: 'اَلسَّلامُ عَلَيكُم' },
    { id: 'conv1_line2', text: 'وَعَلَيكُمُ السَّلامُ' },
    { id: 'conv1_line3', text: 'كَيفَ حالُكِ؟' },
    { id: 'conv1_line4', text: 'أَنا بِخَير، شُكرًا' },
    { id: 'conv1_line5', text: 'أَنا بِخَير أَيضًا' },
    { id: 'conv1_line6', text: 'مَعَ السَّلامة' },

    // Conversation 2: Good Morning at School
    { id: 'conv2_line1', text: 'صَباحُ الخَير' },
    { id: 'conv2_line2', text: 'صَباحُ النُّور' },
    { id: 'conv2_line3', text: 'هَذِهِ مَدرَسة' },
    { id: 'conv2_line4', text: 'نَعَم، هَذِهِ مَدرَسة جَميلة' },
    { id: 'conv2_line5', text: 'أَنا أُحِبُّ العَرَبيّة' },
    { id: 'conv2_line6', text: 'أَنا أُحِبُّ العَرَبيّة أَيضًا' },

    // Conversation 3: Showing a Book
    { id: 'conv3_line1', text: 'هَذا كِتاب' },
    { id: 'conv3_line2', text: 'كِتابٌ جَميل' },
    { id: 'conv3_line3', text: 'شُكرًا' },
    { id: 'conv3_line4', text: 'عَفوًا' },
    { id: 'conv3_line5', text: 'مَعَ السَّلامة' },
    { id: 'conv3_line6', text: 'مَعَ السَّلامة' },

    // Conversation 4: Starting Class
    { id: 'conv4_line1', text: 'بِسمِ اللّه' },
    { id: 'conv4_line2', text: 'بِسمِ اللّه' },
    { id: 'conv4_line3', text: 'اَلسَّلامُ عَلَيكُم' },
    { id: 'conv4_line4', text: 'وَعَلَيكُمُ السَّلامُ' },
    { id: 'conv4_line5', text: 'كَيفَ حالُكُم؟' },
    { id: 'conv4_line6', text: 'نَحنُ بِخَير' },

    // Conversation 5: Meeting Someone New
    { id: 'conv5_line1', text: 'اَلسَّلامُ عَلَيكُم' },
    { id: 'conv5_line2', text: 'وَعَلَيكُمُ السَّلامُ' },
    { id: 'conv5_line3', text: 'ما اسمُكَ؟' },
    { id: 'conv5_line4', text: 'اِسمي أَحمَد' },
    { id: 'conv5_line5', text: 'اِسمي فاطِمة' },
    { id: 'conv5_line6', text: 'تَشَرَّفنا' },

    // Conversation 6: Evening Greeting
    { id: 'conv6_line1', text: 'مَساءُ الخَير' },
    { id: 'conv6_line2', text: 'مَساءُ النُّور' },
    { id: 'conv6_line3', text: 'كَيفَ حالُكَ؟' },
    { id: 'conv6_line4', text: 'أَنا بِخَير، الحَمدُ لِلّه' },
    { id: 'conv6_line5', text: 'جَيِّد' },
    { id: 'conv6_line6', text: 'مَعَ السَّلامة' },

    // Unit 8 Advanced Conversations

    // Conversation 8.1: At the Restaurant (12 lines)
    { id: 'conv8_1_line1', text: 'أَهلًا وَسَهلًا بِكَ في مَطعَمِنا' },
    { id: 'conv8_1_line2', text: 'شُكرًا، هَذا المَكانُ جَميلٌ جِدًّا' },
    { id: 'conv8_1_line3', text: 'نَحنُ سُعَداءُ بِزِيارَتِكَ، ما الَّذي تُفَضِّلُهُ اليَومَ؟' },
    { id: 'conv8_1_line4', text: 'ما هُوَ أَشهَرُ طَبَقٍ عِندَكُم؟' },
    { id: 'conv8_1_line5', text: 'الكَبسَةُ بِاللَّحمِ هِيَ الأَشهَرُ وَالأَلَذّ' },
    { id: 'conv8_1_line6', text: 'مُمتازٌ، سَآخُذُ الكَبسَةَ مَعَ سَلَطَةٍ وَعَصيرِ بُرتُقال' },
    { id: 'conv8_1_line7', text: 'اختِيارٌ رائِعٌ، هَل تُريدُ الطَّبَقَ حارًّا أَم مُتَوَسِّطًا؟' },
    { id: 'conv8_1_line8', text: 'مُتَوَسِّطًا مِن فَضلِكَ، وَكَم يَستَغرِقُ التَّحضير؟' },
    { id: 'conv8_1_line9', text: 'حَوالَي عِشرينَ دَقيقَةً، هَل تُريدُ مُقَبِّلاتٍ أَثناءَ الانتِظار؟' },
    { id: 'conv8_1_line10', text: 'نَعَم، أَحضِر لي حُمُّصًا وَخُبزًا طازَجًا' },
    { id: 'conv8_1_line11', text: 'حاضِرٌ، سَأُحضِرُها فَورًا، بِالهَناءِ وَالشِّفاء' },
    { id: 'conv8_1_line12', text: 'شُكرًا جَزيلًا، اللهُ يُبارِكُ فيكَ' },

    // Conversation 8.2: Job Interview (12 lines)
    { id: 'conv8_2_line1', text: 'صَباحُ الخَيرِ، تَفَضَّل بِالجُلوس' },
    { id: 'conv8_2_line2', text: 'صَباحُ النُّورِ، شُكرًا لِإِتاحَةِ هَذِهِ الفُرصَة' },
    { id: 'conv8_2_line3', text: 'أَخبِرني عَن خِبرَتِكَ العَمَليَّةِ السّابِقَة' },
    { id: 'conv8_2_line4', text: 'عَمِلتُ خَمسَ سَنَواتٍ في شَرِكَةٍ كَبيرَةٍ كَمُهَندِس' },
    { id: 'conv8_2_line5', text: 'مُمتازٌ، وَما هِيَ أَهَمُّ إِنجازاتِكَ هُناكَ؟' },
    { id: 'conv8_2_line6', text: 'قُدتُ فَريقًا نَجَحَ في تَطويرِ نِظامٍ جَديد' },
    { id: 'conv8_2_line7', text: 'رائِعٌ، لِماذا تُريدُ العَمَلَ مَعَنا بِالتَّحديد؟' },
    { id: 'conv8_2_line8', text: 'لِأَنَّ شَرِكَتَكُم رائِدَةٌ في المَجالِ وَلَدَيها سُمعَةٌ مُمتازَة' },
    { id: 'conv8_2_line9', text: 'ما هِيَ نِقاطُ قُوَّتِكَ وَضَعفِك؟' },
    { id: 'conv8_2_line10', text: 'أَنا مُجتَهِدٌ وَمُنَظَّمٌ، لَكِنّي أَحيانًا أَكونُ مُتَطَلِّبًا جِدًّا' },
    { id: 'conv8_2_line11', text: 'جَيِّدٌ، سَنَتَّصِلُ بِكَ خِلالَ أُسبوعٍ بِإِذنِ الله' },
    { id: 'conv8_2_line12', text: 'شُكرًا جَزيلًا، في انتِظارِ رَدِّكُم' },

    // Conversation 8.3: Discussing Travel Plans (12 lines)
    { id: 'conv8_3_line1', text: 'أُفَكِّرُ في السَّفَرِ إِلى تُركِيا الشَّهرَ القادِم' },
    { id: 'conv8_3_line2', text: 'فِكرَةٌ رائِعَة، كَم يَومًا سَتَبقى هُناكَ؟' },
    { id: 'conv8_3_line3', text: 'أُخَطِّطُ لِلبَقاءِ عَشَرَةَ أَيّامٍ لِزِيارَةِ إِسطَنبولَ وَأَنطاليا' },
    { id: 'conv8_3_line4', text: 'هَل حَجَزتَ الفُندُقَ وَالطَّيَرانَ بِالفِعل؟' },
    { id: 'conv8_3_line5', text: 'لا بَعدُ، أَبحَثُ عَن أَفضَلِ العُروضِ الآن' },
    { id: 'conv8_3_line6', text: 'أَنصَحُكَ بِالحَجزِ مُبَكِّرًا لِأَنَّ الأَسعارَ تَرتَفِع' },
    { id: 'conv8_3_line7', text: 'نَصيحَةٌ جَيِّدَة، ما هِيَ الميزانيَّةُ المُناسِبَةُ بِرَأيِكَ؟' },
    { id: 'conv8_3_line8', text: 'أَعتَقِدُ أَنَّ أَلفَي دولارٍ كافِيَةٌ لِرِحلَةٍ مُريحَة' },
    { id: 'conv8_3_line9', text: 'وَماذا عَنِ الأَماكِنِ الَّتي يَجِبُ زِيارَتُها؟' },
    { id: 'conv8_3_line10', text: 'لا تَفوتْ آيا صوفيا وَالبازارَ الكَبيرَ وَالبوسفور' },
    { id: 'conv8_3_line11', text: 'شُكرًا عَلى النَّصائِح، هَل سَبَقَ أَن زُرتِ تُركِيا؟' },
    { id: 'conv8_3_line12', text: 'نَعَم، زُرتُها العامَ الماضي وَكانَت تَجرِبَةً لا تُنسى' },

    // Conversation 8.4: At the Doctor - Detailed Consultation (12 lines)
    { id: 'conv8_4_line1', text: 'أَهلًا بِكَ، ما الَّذي يُزعِجُكَ اليَوم؟' },
    { id: 'conv8_4_line2', text: 'دُكتور، أَشعُرُ بِأَلَمٍ شَديدٍ في المَعِدَةِ مُنذُ ثَلاثَةِ أَيّام' },
    { id: 'conv8_4_line3', text: 'هَلِ الأَلَمُ مُستَمِرٌّ أَم يَأتي وَيَذهَب؟' },
    { id: 'conv8_4_line4', text: 'يَأتي وَيَذهَب، وَيَزدادُ بَعدَ الأَكل' },
    { id: 'conv8_4_line5', text: 'هَل لَدَيكَ أَعراضٌ أُخرى مِثلَ الغَثَيانِ أَوِ الحُمّى؟' },
    { id: 'conv8_4_line6', text: 'نَعَم، أَشعُرُ بِالغَثَيانِ أَحيانًا وَلَيسَ لَدَيَّ شَهِيَّة' },
    { id: 'conv8_4_line7', text: 'يَبدو أَنَّها التِهابٌ في المَعِدَة، هَل أَكَلتَ شَيئًا غَيرَ عادِيّ؟' },
    { id: 'conv8_4_line8', text: 'رُبَّما، أَكَلتُ طَعامًا حارًّا جِدًّا قَبلَ أَربَعَةِ أَيّام' },
    { id: 'conv8_4_line9', text: 'هَذا يُفَسِّرُ الأَمرَ، سَأَصِفُ لَكَ دَواءً وَنِظامًا غِذائِيًّا' },
    { id: 'conv8_4_line10', text: 'شُكرًا دُكتور، مَتى سَأَشعُرُ بِالتَّحَسُّن؟' },
    { id: 'conv8_4_line11', text: 'خِلالَ يَومَينِ إِن شاءَ الله، وَتَجَنَّبِ الطَّعامَ الحارّ' },
    { id: 'conv8_4_line12', text: 'حاضِرٌ، جَزاكَ اللهُ خَيرًا' },

    // Conversation 8.5: Discussing Education and Dreams (12 lines)
    { id: 'conv8_5_line1', text: 'ما الَّذي تَدرُسُهُ في الجامِعَةِ يا يوسُف؟' },
    { id: 'conv8_5_line2', text: 'أَدرُسُ الهَندَسَةَ المَعماريَّةَ، وَأَنا في السَّنَةِ الثّالِثَة' },
    { id: 'conv8_5_line3', text: 'رائِعٌ، هَل تَستَمتِعُ بِدِراسَتِكَ؟' },
    { id: 'conv8_5_line4', text: 'نَعَم كَثيرًا، خاصَّةً مَوادَّ التَّصميمِ وَالرَّسمِ الهَندَسِيّ' },
    { id: 'conv8_5_line5', text: 'وَما هُوَ حُلمُكَ بَعدَ التَّخَرُّج؟' },
    { id: 'conv8_5_line6', text: 'أَحلُمُ بِتَصميمِ مَبانٍ صَديقَةٍ لِلبيئَةِ في العالَمِ العَرَبِيّ' },
    { id: 'conv8_5_line7', text: 'هَدَفٌ نَبيلٌ، أَنا أَدرُسُ الطِّبَّ وَأُريدُ أَن أُصبِحَ جَرّاحَة' },
    { id: 'conv8_5_line8', text: 'ما شاءَ الله، الطِّبُّ تَخَصُّصٌ صَعبٌ وَلَكِنَّهُ مُهِمّ' },
    { id: 'conv8_5_line9', text: 'نَعَم، أَدرُسُ كَثيرًا وَأَحيانًا أَسهَرُ اللَّيلَ كُلَّه' },
    { id: 'conv8_5_line10', text: 'اللهُ يُعينُكِ، المُستَقبَلُ سَيَكونُ مُشرِقًا بِإِذنِ الله' },
    { id: 'conv8_5_line11', text: 'آمين، هَل تُفَكِّرُ في إِكمالِ الدِّراساتِ العُليا؟' },
    { id: 'conv8_5_line12', text: 'رُبَّما، أُفَكِّرُ في الحُصولِ عَلى الماجِستيرِ في الخارِج' },

    // Conversation 8.6: Family Gathering Discussion (12 lines)
    { id: 'conv8_6_line1', text: 'كَم مَضى مِنَ الوَقتِ مُنذُ آخِرِ لِقاءٍ عائِلِيّ؟' },
    { id: 'conv8_6_line2', text: 'تَقريبًا سَنَةٌ كامِلَة، مُنذُ عيدِ الفِطرِ الماضي' },
    { id: 'conv8_6_line3', text: 'اشتَقتُ لِلجَميعِ كَثيرًا، خاصَّةً جَدَّتي وَأَعمامي' },
    { id: 'conv8_6_line4', text: 'أَنا أَيضًا، جَدَّتُنا دائِمًا تَسأَلُ عَنكِ وَعَن دِراسَتِكِ' },
    { id: 'conv8_6_line5', text: 'اللهُ يَحفَظُها، ما رَأيُكَ أَن نُنَظِّمَ لِقاءً قَريبًا؟' },
    { id: 'conv8_6_line6', text: 'فِكرَةٌ مُمتازَة، رُبَّما في نِهايَةِ هَذا الشَّهر' },
    { id: 'conv8_6_line7', text: 'أَينَ يُمكِنُ أَن نَجتَمِعَ؟ بَيتُ جَدَّتي أَم مَكانٌ آخَر؟' },
    { id: 'conv8_6_line8', text: 'بَيتُ جَدَّتِنا أَفضَل، هُوَ كَبيرٌ وَمُريحٌ لِلجَميع' },
    { id: 'conv8_6_line9', text: 'حَسَنًا، سَأَتَّصِلُ بِالعائِلَةِ وَأُخبِرُهُم بِالمَوعِد' },
    { id: 'conv8_6_line10', text: 'وَأَنا سَأُساعِدُ في تَحضيرِ الطَّعامِ وَالتَّرتيبات' },
    { id: 'conv8_6_line11', text: 'رائِعٌ، سَتَكونُ أَمسِيَةً جَميلَةً بِإِذنِ الله' },
    { id: 'conv8_6_line12', text: 'إِن شاءَ الله، العائِلَةُ هِيَ أَغلى ما نَملِك' },

    // Conversation 8.7: Discussing Current Events and Society (12 lines)
    { id: 'conv8_7_line1', text: 'هَل قَرَأتَ الخَبَرَ عَنِ التَّطَوُّراتِ التِّقنِيَّةِ الجَديدَة؟' },
    { id: 'conv8_7_line2', text: 'نَعَم، التَّكنولوجِيا تَتَقَدَّمُ بِسُرعَةٍ مُذهِلَةٍ هَذِهِ الأَيّام' },
    { id: 'conv8_7_line3', text: 'صَحيحٌ، لَكِن أَشعُرُ أَنَّ النّاسَ أَصبَحوا مُدمِنينَ عَلى هَواتِفِهِم' },
    { id: 'conv8_7_line4', text: 'أُوافِقُكَ تَمامًا، وَسائِلُ التَّواصُلِ الاجتِماعِيِّ لَها إِيجابِيّاتٌ وَسَلبِيّات' },
    { id: 'conv8_7_line5', text: 'ما رَأيُكَ في تَأثيرِها عَلى الشَّبابِ وَالأَطفال؟' },
    { id: 'conv8_7_line6', text: 'أَعتَقِدُ أَنَّها سِلاحٌ ذو حَدَّين، يَجِبُ استِخدامُها بِحِكمَة' },
    { id: 'conv8_7_line7', text: 'كَلامٌ سَليمٌ، المُشكِلَةُ أَنَّ الكَثيرينَ يُضَيِّعونَ وَقتَهُم فيها' },
    { id: 'conv8_7_line8', text: 'نَعَم، وَيَنسَونَ أَهَمِّيَّةَ التَّواصُلِ الحَقيقِيِّ وَجهًا لِوَجه' },
    { id: 'conv8_7_line9', text: 'بِالضَّبط، يَجِبُ أَن نَجِدَ تَوازُنًا بَينَ العالَمَين' },
    { id: 'conv8_7_line10', text: 'وَأَيضًا يَجِبُ تَعليمُ الأَجيالِ الجَديدَةِ الاستِخدامَ الصَّحيح' },
    { id: 'conv8_7_line11', text: 'أَتَّفِقُ مَعَكَ، التَّربِيَةُ الرَّقمِيَّةُ أَصبَحَت ضَروريَّة' },
    { id: 'conv8_7_line12', text: 'تَمامًا، هَذا هُوَ تَحَدّي عَصرِنا الحالِيّ' },

    // Conversation 8.8: Philosophical Discussion About Life (12 lines)
    { id: 'conv8_8_line1', text: 'ما هُوَ مَفهومُكَ لِلسَّعادَةِ الحَقيقِيَّة؟' },
    { id: 'conv8_8_line2', text: 'سُؤالٌ عَميقٌ، أَعتَقِدُ أَنَّ السَّعادَةَ تَكمُنُ في الرِّضا وَالقَناعَة' },
    { id: 'conv8_8_line3', text: 'أُوافِقُكِ، لَكِن أَلَيسَ الطُّموحُ مُهِمًّا أَيضًا؟' },
    { id: 'conv8_8_line4', text: 'بَلى، المُهِمُّ هُوَ التَّوازُنُ بَينَ الطُّموحِ وَالرِّضا' },
    { id: 'conv8_8_line5', text: 'وَما رَأيُكِ في مَعنى النَّجاحِ في الحَياة؟' },
    { id: 'conv8_8_line6', text: 'النَّجاحُ لَيسَ فَقَط في المالِ وَالشُّهرَة، بَل في التَّأثيرِ الإِيجابِيّ' },
    { id: 'conv8_8_line7', text: 'كَلامٌ جَميلٌ، إِذًا النَّجاحُ يَرتَبِطُ بِخِدمَةِ الآخَرين؟' },
    { id: 'conv8_8_line8', text: 'نَعَم بِالتَّأكيد، وَأَيضًا في تَحقيقِ السَّلامِ الدّاخِلِيّ' },
    { id: 'conv8_8_line9', text: 'هَل تَعتَقِدينَ أَنَّ المالَ يَجلِبُ السَّعادَة؟' },
    { id: 'conv8_8_line10', text: 'المالُ وَسيلَةٌ وَلَيسَ غايَةً، يُساعِدُ لَكِنَّهُ لا يَضمَنُ السَّعادَة' },
    { id: 'conv8_8_line11', text: 'حِكمَةٌ بالِغَة، الصِّحَّةُ وَالعائِلَةُ أَهَمُّ مِنَ المال' },
    { id: 'conv8_8_line12', text: 'تَمامًا، هَذِهِ هِيَ الكُنوزُ الحَقيقِيَّةُ في الحَياة' },
];

// Unit 9: Quranic Verses
const QURAN_VERSES = [
    // Surah Al-Fatihah
    { id: 'quran_1_1', text: 'بِسمِ اللَّهِ الرَّحمَٰنِ الرَّحيم' },
    { id: 'quran_1_2', text: 'الحَمدُ لِلَّهِ رَبِّ العالَمين' },

    // Surah Al-Ikhlas
    { id: 'quran_112_1', text: 'قُل هُوَ اللَّهُ أَحَد' },
    { id: 'quran_112_2', text: 'اللَّهُ الصَّمَد' },
    { id: 'quran_112_3', text: 'لَم يَلِد وَلَم يولَد' },
    { id: 'quran_112_4', text: 'وَلَم يَكُن لَّهُ كُفُوًا أَحَد' },

    // Surah Al-Falaq
    { id: 'quran_113_1', text: 'قُل أَعوذُ بِرَبِّ الفَلَق' },
    { id: 'quran_113_2', text: 'مِن شَرِّ ما خَلَق' },

    // Surah An-Nas
    { id: 'quran_114_1', text: 'قُل أَعوذُ بِرَبِّ النّاس' },
    { id: 'quran_114_2', text: 'مَلِكِ النّاس' },
    { id: 'quran_114_3', text: 'إِلَٰهِ النّاس' },

    // Surah Al-Asr
    { id: 'quran_103_1', text: 'وَالعَصر' },
    { id: 'quran_103_2', text: 'إِنَّ الإِنسانَ لَفي خُسر' },
    { id: 'quran_103_3', text: 'إِلَّا الَّذينَ آمَنوا وَعَمِلوا الصّالِحاتِ وَتَواصَوا بِالحَقِّ وَتَواصَوا بِالصَّبر' },

    // Surah Al-Kawthar
    { id: 'quran_108_1', text: 'إِنّا أَعطَيناكَ الكَوثَر' },
    { id: 'quran_108_2', text: 'فَصَلِّ لِرَبِّكَ وَانحَر' },
    { id: 'quran_108_3', text: 'إِنَّ شانِئَكَ هُوَ الأَبتَر' },
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
    ...addDir(CONVERSATIONS, 'conversations'),
    ...addDir(QURAN_VERSES, 'quran'),
];

// ─── Download from Google Translate TTS ────────────────────

function ensureDir(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

function stripHarakat(text) {
    return text.replace(/[\u064B-\u065F]/g, '');
}

function downloadAudio(item, overrideText, dialect) {
    return new Promise((resolve) => {
        // Dialects get their own folder structure e.g., /audio/dialects/egyptian/words
        // MSA gets the root folder e.g., /audio/words
        const isMsa = dialect === 'msa';
        const basePath = isMsa ? OUTPUT_BASE : path.join(OUTPUT_BASE, 'dialects', dialect);
        const outDir = path.join(basePath, item.dir);

        ensureDir(outDir);
        const outFile = path.join(outDir, `${item.id}.mp3`);

        if (fs.existsSync(outFile)) {
            resolve('skip');
            return;
        }

        const tldMap = {
            'msa': 'ar',
            'egyptian': 'ar', // Using core 'ar' for reliability across dialects
            'levantine': 'ar',
            'maghrebi': 'ar',
            'gulf': 'ar'
        };

        const googleUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${tldMap[dialect]}&client=tw-ob&q=${encodeURIComponent(overrideText)}`;

        https.get(googleUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
                'Referer': 'https://translate.google.com/',
            }
        }, (res) => {
            if (res.statusCode !== 200) {
                console.error(`  ✗ [${dialect}] ${item.id} — HTTP ${res.statusCode}`);
                resolve('error');
                return;
            }

            const file = fs.createWriteStream(outFile);
            res.pipe(file);
            file.on('finish', () => {
                file.close();
                console.log(`  ✓ [${dialect}] ${item.id}`);
                resolve('ok');
            });
        }).on('error', (err) => {
            console.error(`  ✗ [${dialect}] ${item.id} — ${err.message}`);
            resolve('error');
        });
    });
}

async function downloadAll() {
    console.log(`\n🎤 Unified Arabic Audio Generator (All Dialects)`);
    console.log(`   Total Base Items: ${ALL_ITEMS.length}`);
    ensureDir(OUTPUT_BASE);

    let totalDownloaded = 0;
    let totalSkipped = 0;
    let totalErrors = 0;

    for (const dialect of DIALECTS) {
        console.log(`\n=== Generating Audio for Dialect: ${dialect.toUpperCase()} ===`);
        const dialectOverrides = DIALECT_OVERRIDES[dialect] || {};
        const dialectVocab = {};

        let downloaded = 0;
        let skipped = 0;
        let errors = 0;

        for (const item of ALL_ITEMS) {
            // Apply override if exists
            let dialectText = item.text;

            // Check exact match first
            if (dialectOverrides[item.text] && dialectOverrides[item.text].arabic) {
                dialectText = dialectOverrides[item.text].arabic;
            } else {
                // If no exact match, try stripping harakat from both the item text and all override keys
                const cleanItemText = stripHarakat(item.text);

                // Do a quick direct lookup if the key itself was stored clean
                if (dialectOverrides[cleanItemText] && dialectOverrides[cleanItemText].arabic) {
                    dialectText = dialectOverrides[cleanItemText].arabic;
                } else {
                    // Finally, iterate through the override keys and compare stripped versions
                    for (const [key, value] of Object.entries(dialectOverrides)) {
                        if (stripHarakat(key) === cleanItemText && value.arabic) {
                            dialectText = value.arabic;
                            break;
                        }
                    }
                }
            }

            const result = await downloadAudio(item, dialectText, dialect);
            if (result === 'skip') skipped++;
            else if (result === 'ok') downloaded++;
            else errors++;

            // Path varies depending on if it's the default MSA tree or a dialect subdir
            const relativePath = dialect === 'msa'
                ? `/audio/${item.dir}/${item.id}.mp3`
                : `/audio/dialects/${dialect}/${item.dir}/${item.id}.mp3`;

            dialectVocab[item.id] = {
                text: dialectText,
                path: relativePath,
            };

            // Rate limit check
            if (result !== 'skip') {
                await new Promise(r => setTimeout(r, 400));
            }
        }

        totalDownloaded += downloaded;
        totalSkipped += skipped;
        totalErrors += errors;

        // Write vocabulary.json explicitly for this dialect
        const isMsa = dialect === 'msa';
        const basePath = isMsa ? OUTPUT_BASE : path.join(OUTPUT_BASE, 'dialects', dialect);
        const vocabPath = path.join(basePath, 'vocabulary.json');

        ensureDir(path.dirname(vocabPath));
        fs.writeFileSync(vocabPath, JSON.stringify(dialectVocab, null, 2));

        console.log(`✅ [${dialect}] Finished: ${downloaded} downloaded, ${skipped} skipped, ${errors} errors.`);
        console.log(`📖 [${dialect}] Vocab mapped to: ${vocabPath}`);
    }

    console.log(`\n✅ ALL DONE!`);
    console.log(`   Total Downloaded: ${totalDownloaded}`);
    console.log(`   Total Skipped: ${totalSkipped}`);
    console.log(`   Total Errors: ${totalErrors}\n`);
}

downloadAll().catch(console.error);
