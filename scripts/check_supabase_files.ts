import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://vvtkrxbklgassyhghmqt.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY!;

async function checkFiles() {
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    
    console.log('Checking Supabase audio bucket...\n');
    
    const { data, error } = await supabase.storage
        .from('audio')
        .list('', { limit: 1000 });
    
    if (error) {
        console.error('Error:', error);
        return;
    }
    
    console.log(`Found ${data?.length || 0} items in root`);
    
    // Check each folder
    const folders = ['letters', 'syllables', 'words', 'sentences', 'conversations', 'quran'];
    for (const folder of folders) {
        const { data: files } = await supabase.storage
            .from('audio')
            .list(folder, { limit: 10 });
        console.log(`${folder}: ${files?.length || 0} files`);
        if (files && files.length > 0) {
            console.log(`  Sample: ${files[0].name}`);
        }
    }
}

checkFiles();
