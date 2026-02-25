/**
 * Clear all existing audio files from Supabase storage
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://vvtkrxbklgassyhghmqt.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || '';

if (!SUPABASE_SERVICE_KEY) {
    console.error('Missing SUPABASE_SERVICE_KEY environment variable');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
const BUCKET_NAME = 'audio';

async function clearBucket() {
    console.log(`Clearing all files from bucket: ${BUCKET_NAME}...`);
    
    // List all files in the bucket
    const { data: files, error: listError } = await supabase.storage
        .from(BUCKET_NAME)
        .list('', {
            limit: 1000,
            offset: 0,
        });

    if (listError) {
        console.error('Error listing files:', listError.message);
        return;
    }

    if (!files || files.length === 0) {
        console.log('No files to delete');
        return;
    }

    console.log(`Found ${files.length} items to delete`);

    // Delete all files recursively
    async function deleteFolder(prefix: string = '') {
        const { data: items, error } = await supabase.storage
            .from(BUCKET_NAME)
            .list(prefix, { limit: 1000 });

        if (error) {
            console.error(`Error listing ${prefix}:`, error.message);
            return;
        }

        for (const item of items || []) {
            const fullPath = prefix ? `${prefix}/${item.name}` : item.name;
            
            if (item.id === null) {
                // It's a folder, recurse
                await deleteFolder(fullPath);
            } else {
                // It's a file, delete it
                const { error: deleteError } = await supabase.storage
                    .from(BUCKET_NAME)
                    .remove([fullPath]);

                if (deleteError) {
                    console.error(`❌ Error deleting ${fullPath}:`, deleteError.message);
                } else {
                    console.log(`✅ Deleted ${fullPath}`);
                }
            }
        }
    }

    await deleteFolder();
    console.log('🎉 Bucket cleared successfully!');
}

async function run() {
    console.log(`Connecting to Supabase at ${SUPABASE_URL}...`);
    
    // Verify bucket exists
    const { data: buckets, error } = await supabase.storage.listBuckets();
    if (error) {
        console.error('Error fetching buckets:', error.message);
        return;
    }

    const bucketExists = buckets.some(b => b.name === BUCKET_NAME);
    if (!bucketExists) {
        console.log(`Bucket "${BUCKET_NAME}" does not exist. Nothing to clear.`);
        return;
    }

    await clearBucket();
}

run().catch(console.error);
