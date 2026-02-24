import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Decode the URL from the JWT payload
const SUPABASE_URL = 'https://vvtkrxbklgassyhghmqt.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || '';

if (!SUPABASE_SERVICE_KEY) {
    console.error('Missing SUPABASE_SERVICE_KEY environment variable. Pass the "secret" key.');
    process.exit(1);
}

// We use the service_role key to bypass RLS and ensure we can create buckets/upload
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
const BUCKET_NAME = 'audio';

async function uploadDirectory(localPath: string, bucketPath: string) {
    const entries = fs.readdirSync(localPath, { withFileTypes: true });

    for (const entry of entries) {
        const fullLocalPath = path.join(localPath, entry.name);
        // Supabase storage paths use forward slashes
        const fullBucketPath = bucketPath ? `${bucketPath}/${entry.name}` : entry.name;

        if (entry.isDirectory()) {
            await uploadDirectory(fullLocalPath, fullBucketPath);
        } else if (entry.isFile() && entry.name.endsWith('.mp3')) {
            console.log(`Uploading ${fullBucketPath}...`);
            const fileBuffer = fs.readFileSync(fullLocalPath);

            const { error } = await supabase.storage
                .from(BUCKET_NAME)
                .upload(fullBucketPath, fileBuffer, {
                    upsert: true,
                    contentType: 'audio/mpeg',
                });

            if (error) {
                console.error(`❌ Error uploading ${fullBucketPath}:`, error.message);
            } else {
                console.log(`✅ Successfully uploaded ${fullBucketPath}`);
            }
        }
    }
}

async function run() {
    console.log(`Connecting to Supabase at ${SUPABASE_URL}...`);

    // Check if the bucket exists, if not, create it
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    if (bucketsError) {
        console.error('Error fetching buckets:', bucketsError.message);
        return;
    }

    const bucketExists = buckets.some(b => b.name === BUCKET_NAME);
    if (!bucketExists) {
        console.log(`Bucket "${BUCKET_NAME}" does not exist. Creating it as a public bucket...`);
        const { error: createError } = await supabase.storage.createBucket(BUCKET_NAME, {
            public: true,
            allowedMimeTypes: ['audio/mpeg', 'audio/mp3'],
        });

        if (createError) {
            console.error('❌ Error creating bucket:', createError.message);
            return;
        }
        console.log(`✅ Bucket "${BUCKET_NAME}" created successfully.`);
    } else {
        console.log(`✅ Bucket "${BUCKET_NAME}" already exists.`);
    }

    // Start recursive upload from public/audio
    const audioDir = path.join(process.cwd(), 'public', 'audio');
    if (!fs.existsSync(audioDir)) {
        console.error(`Directory ${audioDir} does not exist.`);
        return;
    }

    console.log(`Starting bulk upload from ${audioDir}...`);
    await uploadDirectory(audioDir, '');

    console.log('🎉 Supabase audio cache upload complete!');
    console.log(`Base URL for these files: ${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/...`);
}

run();
