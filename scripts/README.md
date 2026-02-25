# Audio Generation Scripts

This directory contains scripts for generating and managing Arabic audio files using Azure Cognitive Services Speech.

## Quick Start

### Complete Migration (Automated)

```bash
SUPABASE_SERVICE_KEY=your_key npm run migrate:azure
```

This runs the complete migration process automatically.

### Manual Step-by-Step

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Generate letters and syllables**
   ```bash
   npm run audio:generate
   ```

3. **Extract vocabulary from course**
   ```bash
   npm run audio:extract
   ```

4. **Generate vocabulary audio**
   ```bash
   npm run audio:vocabulary
   ```

5. **Upload to Supabase**
   ```bash
   SUPABASE_SERVICE_KEY=your_key npm run audio:upload
   ```

## Scripts Overview

### `generate_audio_azure.ts`
Generates audio for:
- 56 letter files (sounds + names)
- 81 syllable files (consonants × vowels)

**Usage**: `npm run audio:generate`

**Output**: `public/audio/letters/` and `public/audio/syllables/`

### `extract_vocabulary.ts`
Scans `src/data/course.ts` and extracts all unique words and sentences.

**Usage**: `npm run audio:extract`

**Output**: `scripts/vocabulary.json`

### `generate_vocabulary_audio_azure.ts`
Generates audio for all vocabulary items from `vocabulary.json`.

**Usage**: `npm run audio:vocabulary`

**Output**: `public/audio/words/` and `public/audio/sentences/`

### `upload_to_supabase.ts`
Uploads all audio files from `public/audio/` to Supabase storage.

**Usage**: `SUPABASE_SERVICE_KEY=your_key npm run audio:upload`

**Requires**: `SUPABASE_SERVICE_KEY` environment variable

### `clear_supabase_audio.ts`
Deletes all existing audio files from Supabase storage.

**Usage**: `SUPABASE_SERVICE_KEY=your_key npm run audio:clear`

**Warning**: This is destructive and cannot be undone!

### `migrate-to-azure.sh`
Automated migration script that runs all steps in sequence.

**Usage**: `SUPABASE_SERVICE_KEY=your_key npm run migrate:azure`

## Configuration

### Azure Speech Service

Edit the constants in the generation scripts:

```typescript
const AZURE_SPEECH_KEY = 'your_key';
const AZURE_REGION = 'uksouth';
const VOICE_NAME = 'ar-SA-ZariyahNeural';
const SPEAKING_RATE = '0.85';
```

### Available Voices

**Saudi Arabic (ar-SA)**:
- `ar-SA-ZariyahNeural` - Female (default)
- `ar-SA-HamedNeural` - Male

**Egyptian Arabic (ar-EG)**:
- `ar-EG-SalmaNeural` - Female
- `ar-EG-ShakirNeural` - Male

### Supabase

Set environment variable:
```bash
export SUPABASE_SERVICE_KEY=your_service_role_key
```

Or create a `.env` file:
```
SUPABASE_SERVICE_KEY=your_service_role_key
```

## File Structure

```
public/audio/
├── letters/          # Letter sounds and names
│   ├── letter_alif_fatha.mp3
│   ├── letter_alif_name.mp3
│   └── ...
├── syllables/        # Consonant + vowel combinations
│   ├── syl_baa_fatha.mp3
│   ├── syl_baa_kasra.mp3
│   └── ...
├── words/           # Vocabulary words
│   ├── word_0.mp3
│   └── ...
└── sentences/       # Full sentences
    ├── sentence_0.mp3
    └── ...
```

## Troubleshooting

### "Module not found" errors
```bash
npm install
```

### "SUPABASE_SERVICE_KEY not set"
```bash
export SUPABASE_SERVICE_KEY=your_key
```

### Azure authentication errors
- Verify `AZURE_SPEECH_KEY` in the script
- Check region is `uksouth`
- Ensure Azure subscription is active

### Rate limiting
- Azure free tier: 0.5M characters/month
- Paid tier: 5M requests/month
- Scripts include 100ms delays between requests

## Cost Estimation

**Azure Speech Neural Voices**:
- Free tier: 0.5M characters/month
- Paid: $15 per 1M characters

**Estimated usage for this course**:
- Letters: ~200 characters
- Syllables: ~300 characters
- Vocabulary: ~50,000 characters
- **Total**: ~50,500 characters (well within free tier)

## Legacy Scripts

### `generate_audio.ts` (Google TTS)
Old script using Google Cloud Text-to-Speech. Kept for reference/rollback.

### `generate-audio-free.mjs`
Uses Google Translate TTS (no API key). Lower quality, kept for emergency fallback.

## Support

For issues or questions:
1. Check `AZURE-MIGRATION-GUIDE.md`
2. Review script output for error messages
3. Verify environment variables are set correctly
