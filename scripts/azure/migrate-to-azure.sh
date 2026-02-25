#!/bin/bash

# Azure TTS Migration Script
# This script automates the complete migration from Google TTS to Azure Speech

set -e

echo "🚀 Starting Azure TTS Migration..."
echo ""

# Check for required environment variables
if [ -z "$SUPABASE_SERVICE_KEY" ]; then
    echo "❌ Error: SUPABASE_SERVICE_KEY environment variable is not set"
    echo "Usage: SUPABASE_SERVICE_KEY=your_key ./scripts/migrate-to-azure.sh"
    exit 1
fi

# Step 1: Install dependencies
echo "📦 Step 1: Installing dependencies..."
npm install
echo "✅ Dependencies updated"
echo ""

# Step 2: Clear existing Supabase audio
echo "🗑️  Step 2: Clearing existing audio from Supabase..."
npm run audio:clear
echo "✅ Supabase audio cleared"
echo ""

# Step 3: Generate letters and syllables
echo "🔤 Step 3: Generating letters and syllables with Azure..."
npm run audio:generate
echo "✅ Letters and syllables generated"
echo ""

# Step 4: Extract vocabulary from existing vocabulary.json
echo "📚 Step 4: Extracting vocabulary from existing vocabulary.json..."
npm run audio:extract
echo "✅ Vocabulary extracted"
echo ""

# Step 5: Generate vocabulary audio
echo "🎙️  Step 5: Generating vocabulary audio with Azure (this may take 10-15 minutes)..."
npm run audio:vocabulary
echo "✅ Vocabulary audio generated"
echo ""

# Step 6: Rebuild vocabulary.json
echo "📝 Step 6: Rebuilding vocabulary.json..."
npm run audio:rebuild-json
echo "✅ vocabulary.json rebuilt"
echo ""

# Step 7: Upload to Supabase
echo "☁️  Step 7: Uploading audio to Supabase..."
npm run audio:upload
echo "✅ Audio uploaded to Supabase"
echo ""

echo "🎉 Migration Complete!"
echo ""
echo "Summary:"
echo "  - 56 letter files"
echo "  - 81 syllable files"
echo "  - ~360 vocabulary files (words, sentences, conversations, Quran)"
echo "  - Total: ~500 audio files"
echo ""
echo "Next steps:"
echo "1. Test audio playback in the app: npm run dev"
echo "2. Run comprehensive tests: npm run test:comprehensive"
echo "3. Verify audio URLs in browser console"
echo ""
echo "Audio is now served from:"
echo "https://vvtkrxbklgassyhghmqt.supabase.co/storage/v1/object/public/audio/"
