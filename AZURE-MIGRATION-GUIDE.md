# Azure TTS Migration Guide

This guide walks through migrating from Google Cloud TTS to Azure Cognitive Services Speech.

## Azure Configuration

**Service**: Azure Cognitive Services Speech
**Region**: UK South
**Endpoint**: https://uksouth.api.cognitive.microsoft.com/

**Keys**:
- Key 1: `1D252Q6kJUTbATGMyJrtEEvEUnM78nQam2u8E6ghCfwamo4d7yUEuJQQJ99CBACmepeSXJ3w3AAAYACOGord`
- Key 2: `YOUR_AZURE_KEY`

**Voice**: `ar-SA-ZariyahNeural` (High-quality Saudi Arabic female voice)

## Migration Steps

### 1. Install Azure Speech SDK

```bash
npm install microsoft-cognitiveservices-speech-sdk
```

### 2. Set Environment Variables

Create a `.env` file:

```bash
AZURE_SPEECH_KEY=1D252Q6kJUTbATGMyJrtEEvEUnM78nQam2u8E6ghCfwamo4d7yUEuJQQJ99CBACmepeSXJ3w3AAAYACOGord
AZURE_SPEECH_REGION=uksouth
SUPABASE_SERVICE_KEY=your_supabase_service_key
```

### 3. Clear Existing Supabase Audio Cache

```bash
SUPABASE_SERVICE_KEY=your_key ts-node scripts/clear_supabase_audio.ts
```

This will delete all existing Google TTS audio files from Supabase storage.

### 4. Generate Audio with Azure

#### Step 4a: Generate Letters and Syllables

```bash
ts-node scripts/generate_audio_azure.ts
```

This generates:
- 56 letter files (sounds + names)
- 81 syllable files (27 consonants × 3 vowels)
- Total: 137 files

#### Step 4b: Extract Vocabulary from Course

```bash
ts-node scripts/extract_vocabulary.ts
```

This scans `src/data/course.ts` and creates `scripts/vocabulary.json` with all unique words and sentences.

#### Step 4c: Generate Vocabulary Audio

```bash
ts-node scripts/generate_vocabulary_audio_azure.ts
```

This generates audio for all words and sentences found in the course.

### 5. Upload to Supabase

```bash
SUPABASE_SERVICE_KEY=your_key ts-node scripts/upload_to_supabase.ts
```

This uploads all generated MP3 files to Supabase storage bucket.

### 6. Verify Audio Files

Check that audio files are accessible:
- Letters: `https://vvtkrxbklgassyhghmqt.supabase.co/storage/v1/object/public/audio/letters/letter_alif_fatha.mp3`
- Syllables: `https://vvtkrxbklgassyhghmqt.supabase.co/storage/v1/object/public/audio/syllables/syl_baa_fatha.mp3`
- Words: `https://vvtkrxbklgassyhghmqt.supabase.co/storage/v1/object/public/audio/words/word_0.mp3`

## Key Differences: Google vs Azure

| Feature | Google TTS | Azure Speech |
|---------|-----------|--------------|
| Voice | ar-XA-Wavenet-B | ar-SA-ZariyahNeural |
| Region | Global | UK South |
| SDK | @google-cloud/text-to-speech | microsoft-cognitiveservices-speech-sdk |
| Auth | Service Account JSON | Subscription Key |
| SSML | Standard | Standard |
| Quality | Wavenet (high) | Neural (high) |

## Voice Options

Azure offers multiple Arabic neural voices:

**Saudi Arabic (ar-SA)**:
- `ar-SA-ZariyahNeural` - Female (recommended)
- `ar-SA-HamedNeural` - Male

**Egyptian Arabic (ar-EG)**:
- `ar-EG-SalmaNeural` - Female
- `ar-EG-ShakirNeural` - Male

**UAE Arabic (ar-AE)**:
- `ar-AE-FatimaNeural` - Female
- `ar-AE-HamdanNeural` - Male

To change voice, update `VOICE_NAME` in the generation scripts.

## Troubleshooting

### Authentication Error
- Verify `AZURE_SPEECH_KEY` is correct
- Check region is set to `uksouth`

### Audio Quality Issues
- Adjust `SPEAKING_RATE` (default: 0.85)
- Try different neural voices

### Rate Limiting
- Azure has generous limits (5M characters/month free tier)
- Add delays between requests if needed (currently 100ms)

## Cost Comparison

**Google Cloud TTS**:
- Wavenet voices: $16 per 1M characters
- Standard voices: $4 per 1M characters

**Azure Speech**:
- Neural voices: Free tier 0.5M characters/month
- Paid: $15 per 1M characters

For this course (~50K characters), Azure free tier is sufficient.

## Next Steps

After migration:
1. Test audio playback in the app
2. Verify all exercises have audio
3. Remove Google TTS dependencies
4. Update documentation

## Rollback Plan

If issues arise, the old Google TTS script is preserved as `scripts/generate_audio.ts`. To rollback:

1. Regenerate with Google: `ts-node scripts/generate_audio.ts`
2. Upload to Supabase: `ts-node scripts/upload_to_supabase.ts`
