/**
 * Extract all vocabulary from existing vocabulary.json
 * This reads the current vocabulary.json and creates a list for regeneration with Azure
 */

import fs from 'fs';
import path from 'path';

interface VocabEntry {
    text: string;
    path: string;
}

interface VocabItem {
    id: string;
    text: string;
    folder: string;
}

async function run() {
    console.log('Extracting vocabulary from existing vocabulary.json...');
    
    const vocabJsonPath = path.join(process.cwd(), 'public', 'audio', 'vocabulary.json');
    
    if (!fs.existsSync(vocabJsonPath)) {
        console.error('❌ vocabulary.json not found at public/audio/vocabulary.json');
        process.exit(1);
    }

    const existingVocab: Record<string, VocabEntry> = JSON.parse(fs.readFileSync(vocabJsonPath, 'utf-8'));
    
    const items: VocabItem[] = [];
    
    for (const [id, entry] of Object.entries(existingVocab)) {
        // Skip letters and syllables (generated separately)
        if (id.startsWith('letter_') || id.startsWith('syl_')) {
            continue;
        }
        
        // Determine folder from path
        let folder = 'words';
        if (entry.path.includes('/sentences/')) folder = 'sentences';
        else if (entry.path.includes('/conversations/')) folder = 'conversations';
        else if (entry.path.includes('/quran/')) folder = 'quran';
        
        items.push({
            id,
            text: entry.text,
            folder
        });
    }
    
    // Group by folder
    const byFolder = {
        words: items.filter(i => i.folder === 'words'),
        sentences: items.filter(i => i.folder === 'sentences'),
        conversations: items.filter(i => i.folder === 'conversations'),
        quran: items.filter(i => i.folder === 'quran')
    };
    
    console.log(`\nFound:`);
    console.log(`  ${byFolder.words.length} words`);
    console.log(`  ${byFolder.sentences.length} sentences`);
    console.log(`  ${byFolder.conversations.length} conversation lines`);
    console.log(`  ${byFolder.quran.length} Quran verses`);
    console.log(`  Total: ${items.length} items`);
    
    // Save to JSON
    const outputPath = path.join(process.cwd(), 'scripts', 'vocabulary_extracted.json');
    fs.writeFileSync(outputPath, JSON.stringify(items, null, 2));
    
    console.log(`\n✅ Saved to ${outputPath}`);
}

run().catch(console.error);
