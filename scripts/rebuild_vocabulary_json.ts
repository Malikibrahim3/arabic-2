/**
 * Rebuild vocabulary.json from generated audio files
 * Scans public/audio directories and creates the vocabulary.json mapping
 */

import fs from 'fs';
import path from 'path';

interface VocabEntry {
    text: string;
    path: string;
}

// Text mappings from the original vocabulary.json
// We'll read from vocabulary_extracted.json to get the text
async function run() {
    console.log('Rebuilding vocabulary.json from generated audio files...\n');
    
    const extractedPath = path.join(process.cwd(), 'scripts', 'vocabulary_extracted.json');
    
    if (!fs.existsSync(extractedPath)) {
        console.error('❌ vocabulary_extracted.json not found');
        process.exit(1);
    }

    interface ExtractedItem {
        id: string;
        text: string;
        folder: string;
    }

    const extracted: ExtractedItem[] = JSON.parse(fs.readFileSync(extractedPath, 'utf-8'));
    
    const vocabulary: Record<string, VocabEntry> = {};
    
    // Add letters
    const letterSounds = [
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
    ];

    const letterNames = [
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

    for (const letter of [...letterSounds, ...letterNames]) {
        vocabulary[letter.id] = {
            text: letter.text,
            path: `/audio/letters/${letter.id}.mp3`
        };
    }

    // Add syllables
    const consonants = ['baa', 'taa', 'thaa', 'jeem', 'haa', 'khaa', 'daal', 'dhaal', 'raa', 'zaay', 
                       'seen', 'sheen', 'saad', 'daad', 'taa2', 'dhaa2', 'ayn', 'ghayn', 'faa', 
                       'qaaf', 'kaaf', 'laam', 'meem', 'noon', 'haa2', 'waaw', 'yaa'];
    const vowels = [
        { id: 'fatha', char: 'َ' },
        { id: 'kasra', char: 'ِ' },
        { id: 'damma', char: 'ُ' }
    ];
    const consonantChars: Record<string, string> = {
        'baa': 'ب', 'taa': 'ت', 'thaa': 'ث', 'jeem': 'ج', 'haa': 'ح', 'khaa': 'خ',
        'daal': 'د', 'dhaal': 'ذ', 'raa': 'ر', 'zaay': 'ز', 'seen': 'س', 'sheen': 'ش',
        'saad': 'ص', 'daad': 'ض', 'taa2': 'ط', 'dhaa2': 'ظ', 'ayn': 'ع', 'ghayn': 'غ',
        'faa': 'ف', 'qaaf': 'ق', 'kaaf': 'ك', 'laam': 'ل', 'meem': 'م', 'noon': 'ن',
        'haa2': 'ه', 'waaw': 'و', 'yaa': 'ي'
    };

    for (const consonant of consonants) {
        for (const vowel of vowels) {
            const id = `syl_${consonant}_${vowel.id}`;
            const text = consonantChars[consonant] + vowel.char;
            vocabulary[id] = {
                text,
                path: `/audio/syllables/${id}.mp3`
            };
        }
    }

    // Add vocabulary from extracted items
    for (const item of extracted) {
        vocabulary[item.id] = {
            text: item.text,
            path: `/audio/${item.folder}/${item.id}.mp3`
        };
    }

    // Write vocabulary.json
    const outputPath = path.join(process.cwd(), 'public', 'audio', 'vocabulary.json');
    fs.writeFileSync(outputPath, JSON.stringify(vocabulary, null, 2));

    console.log(`✅ Created vocabulary.json with ${Object.keys(vocabulary).length} entries`);
    console.log(`   Letters: 56`);
    console.log(`   Syllables: 81`);
    console.log(`   Vocabulary: ${extracted.length}`);
    console.log(`\nSaved to: ${outputPath}`);
}

run().catch(console.error);
