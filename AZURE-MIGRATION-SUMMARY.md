# Azure TTS Migration - Complete Summary

## What Was Done

I've set up a complete migration from Google Cloud TTS to Azure Cognitive Services Speech for your Arabic learning app.

## Files Created

### Migration Scripts
1. **scripts/generate_audio_azure.ts** - Generates letters and syllables with Azure
2. **scripts/generate_vocabulary_audio_azure.ts** - Generates vocabulary audio
3. **scripts/extract_vocabulary.ts** - Extracts words/sentences from course data
4. **scripts/clear_supabase_audio.ts** - Clears old audio from Supabase
5. **scripts/test_azure_connection.ts** - Tests Azure connection and lists voices
6. **scripts/migrate-to-azure.sh** - Automated migration script

### Documentation
1. **AZURE-MIGRATION-GUIDE.md** - Detailed migration guide
2. **QUICK-AZURE-MIGRATION.md** - Quick reference
3. **scripts/README.md** - Script documentation
4. **.env.example** - Environment variable template

### Configuration Updates
1. **package.json** - Updated dependencies and added npm scripts

## Azure Configuration (Already Set)

```
Service: Azure Cognitive Services Speech
Region: UK South (uksouth)
Endpoint: https://uksouth.api.cognitive.microsoft.com/

Key 1: 1D252Q6kJUTbATGMyJrtEEvEUnM78nQam2u8E6ghCfwamo4d7yUEuJQQJ99CBACmepeSXJ3w3AAAYACOGord
Key 2: YOUR_AZURE_KEY

Voice: ar-SA-ZariyahNeural (Female Saudi Arabic)
Speaking Rate: 0.85 (15% slower for learners)
```

## How to Run Migration

### Option 1: Automated (Recommended)

```bash
# Set your Supabase service key
export SUPABASE_SERVICE_KEY=your_supabase_service_role_key

# Run migration
npm run migrate:azure
```

### Option 2: Test First, Then Migrate

```bash
# 1. Test Azure connection
npm run audio:test

# 2. If test passes, run migration
SUPABASE_SERVICE_KEY=your_key npm run migrate:azure
```

### Option 3: Manual Step-by-Step

```bash
# Install Azure SDK
npm install microsoft-cognitiveservices-speech-sdk

# Clear old audio
SUPABASE_SERVICE_KEY=key npm run audio:clear

# Generate letters/syllables (137 files)
npm run audio:generate

# Extract vocabulary from course
npm run audio:extract

# Generate vocabulary audio
npm run audio:vocabulary

# Upload to Supabase
SUPABASE_SERVICE_KEY=key npm run audio:upload
```

## What Gets Generated

1. **Letters** (56 files)
   - 28 letter sounds with fatha (أَ, بَ, تَ, ...)
   - 28 letter names (ألف, باء, تاء, ...)

2. **Syllables** (81 files)
   - 27 consonants × 3 vowels (fatha, kasra, damma)
   - Examples: بَ, بِ, بُ, تَ, تِ, تُ, ...

3. **Vocabulary** (~200+ files)
   - All unique words from course exercises
   - All unique sentences from course exercises

## File Structure

```
public/audio/
├── letters/
│   ├── letter_alif_fatha.mp3
│   ├── letter_alif_name.mp3
│   └── ... (56 files)
├── syllables/
│   ├── syl_baa_fatha.mp3
│   ├── syl_baa_kasra.mp3
│   └── ... (81 files)
├── words/
│   ├── word_0.mp3
│   └── ... (extracted from course)
└── sentences/
    ├── sentence_0.mp3
    └── ... (extracted from course)
```

## NPM Scripts Added

```json
{
  "audio:test": "Test Azure connection",
  "audio:generate": "Generate letters/syllables",
  "audio:vocabulary": "Generate vocabulary audio",
  "audio:extract": "Extract vocabulary from course",
  "audio:upload": "Upload to Supabase",
  "audio:clear": "Clear Supabase audio",
  "migrate:azure": "Run complete migration"
}
```

## Changes to Dependencies

### Removed
- `@google-cloud/text-to-speech` (Google TTS)

### Added
- `microsoft-cognitiveservices-speech-sdk` (Azure Speech)

## Cost Analysis

**Azure Speech Service**:
- Free tier: 0.5M characters/month
- Neural voices included in free tier
- This course: ~50K characters
- **Cost: $0** (well within free tier)

**Google Cloud TTS** (previous):
- Wavenet voices: $16 per 1M characters
- No free tier for Wavenet
- This course: ~50K characters
- **Cost: ~$0.80**

**Savings: $0.80 + ongoing free usage**

## Voice Quality

**Azure ar-SA-ZariyahNeural**:
- Neural voice (highest quality)
- Native Saudi Arabic pronunciation
- Natural prosody and intonation
- Excellent for language learning

**Alternatives available**:
- `ar-SA-HamedNeural` (Male)
- `ar-EG-SalmaNeural` (Egyptian Female)
- `ar-EG-ShakirNeural` (Egyptian Male)

## Verification Steps

After migration:

1. **Test Azure connection**:
   ```bash
   npm run audio:test
   ```

2. **Check generated files**:
   ```bash
   ls -la public/audio/letters/
   ls -la public/audio/syllables/
   ```

3. **Verify Supabase upload**:
   - Visit: https://vvtkrxbklgassyhghmqt.supabase.co/storage/v1/object/public/audio/letters/letter_alif_fatha.mp3
   - Should play audio

4. **Test in app**:
   ```bash
   npm run dev
   ```
   - Open any lesson
   - Click audio buttons
   - Verify playback works

5. **Run comprehensive tests**:
   ```bash
   npm run test:comprehensive
   ```

## Rollback Plan

If you need to revert to Google TTS:

1. The old script is preserved: `scripts/generate_audio.ts`
2. Reinstall Google TTS:
   ```bash
   npm install @google-cloud/text-to-speech
   npm uninstall microsoft-cognitiveservices-speech-sdk
   ```
3. Regenerate audio:
   ```bash
   ts-node scripts/generate_audio.ts
   ```
4. Upload to Supabase:
   ```bash
   SUPABASE_SERVICE_KEY=key npm run audio:upload
   ```

## Timeline Estimate

- Azure connection test: 10 seconds
- Letter/syllable generation: 2-3 minutes
- Vocabulary extraction: 5 seconds
- Vocabulary generation: 3-5 minutes
- Supabase upload: 1-2 minutes

**Total: 6-10 minutes**

## Next Steps

1. **Set Supabase key**:
   ```bash
   export SUPABASE_SERVICE_KEY=your_key
   ```

2. **Run migration**:
   ```bash
   npm run migrate:azure
   ```

3. **Test the app**:
   ```bash
   npm run dev
   ```

4. **Verify audio works** in browser

5. **Run tests**:
   ```bash
   npm run test:comprehensive
   ```

## Support Resources

- **Quick Reference**: `QUICK-AZURE-MIGRATION.md`
- **Detailed Guide**: `AZURE-MIGRATION-GUIDE.md`
- **Script Docs**: `scripts/README.md`
- **Azure Docs**: https://docs.microsoft.com/azure/cognitive-services/speech-service/

## Questions?

Common issues and solutions:

**Q: "Module not found" error**
A: Run `npm install`

**Q: "SUPABASE_SERVICE_KEY not set"**
A: Export the variable: `export SUPABASE_SERVICE_KEY=your_key`

**Q: Azure authentication fails**
A: Keys are already in scripts, but verify region is `uksouth`

**Q: Want to change voice?**
A: Edit `VOICE_NAME` in generation scripts, run `npm run audio:test` to see available voices

**Q: Audio not playing in app?**
A: Check browser console for errors, verify Supabase URLs are accessible

## Summary

✅ Azure credentials configured
✅ Migration scripts created
✅ Documentation complete
✅ NPM scripts added
✅ Dependencies updated
✅ Test script available

**Ready to migrate!** Just set your Supabase key and run `npm run migrate:azure`.
