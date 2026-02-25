import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const SUPABASE_URL = 'https://vvtkrxbklgassyhghmqt.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY!;

async function uploadVocabJson() {
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    
    const fileBuffer = fs.readFileSync('./public/audio/vocabulary.json');
    
    const { data, error } = await supabase.storage
        .from('audio')
        .upload('vocabulary.json', fileBuffer, {
            contentType: 'text/plain',
            upsert: true
        });
    
    if (error) {
        console.error('Error:', error);
    } else {
        console.log('✅ vocabulary.json uploaded');
    }
}

uploadVocabJson();
