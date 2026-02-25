# Quick Azure Migration Reference

## One-Command Migration

```bash
SUPABASE_SERVICE_KEY=your_key npm run migrate:azure
```

## What This Does

1. ✅ Installs Azure Speech SDK
2. ✅ Removes Google TTS dependency
3. ✅ Clears old audio from Supabase
4. ✅ Generates 137 letter/syllable files
5. ✅ Extracts vocabulary from course
6. ✅ Generates vocabulary audio
7. ✅ Uploads everything to Supabase

## Azure Credentials

**Already configured in scripts:**

```
Key: 1D252Q6kJUTbATGMyJrtEEvEUnM78nQam2u8E6ghCfwamo4d7yUEuJQQJ99CBACmepeSXJ3w3AAAYACOGord
Region: uksouth
Voice: ar-SA-ZariyahNeural (Female Saudi Arabic)
```

## You Only Need

Your Supabase service key for uploads:

```bash
export SUPABASE_SERVICE_KEY=your_supabase_service_role_key
```

## Manual Steps (if needed)

```bash
# 1. Install
npm install microsoft-cognitiveservices-speech-sdk

# 2. Clear old audio
SUPABASE_SERVICE_KEY=key npm run audio:clear

# 3. Generate letters/syllables
npm run audio:generate

# 4. Extract vocabulary
npm run audio:extract

# 5. Generate vocabulary audio
npm run audio:vocabulary

# 6. Upload to Supabase
SUPABASE_SERVICE_KEY=key npm run audio:upload
```

## Verify It Works

1. Start dev server: `npm run dev`
2. Open app in browser
3. Try any exercise with audio
4. Check browser console for audio URLs

## Expected Output

```
✅ 56 letter files generated
✅ 81 syllable files generated
✅ ~200 vocabulary files generated
✅ All files uploaded to Supabase
```

## Audio URLs

Files will be at:
```
https://vvtkrxbklgassyhghmqt.supabase.co/storage/v1/object/public/audio/letters/letter_alif_fatha.mp3
https://vvtkrxbklgassyhghmqt.supabase.co/storage/v1/object/public/audio/syllables/syl_baa_fatha.mp3
https://vvtkrxbklgassyhghmqt.supabase.co/storage/v1/object/public/audio/words/word_0.mp3
```

## Rollback (if needed)

```bash
# Use old Google TTS script
ts-node scripts/generate_audio.ts

# Upload to Supabase
SUPABASE_SERVICE_KEY=key npm run audio:upload
```

## Time Estimate

- Letter/syllable generation: ~2 minutes
- Vocabulary extraction: ~5 seconds
- Vocabulary generation: ~3-5 minutes
- Upload to Supabase: ~1 minute

**Total: ~6-8 minutes**

## Cost

Azure free tier includes 0.5M characters/month.
This course uses ~50K characters.
**Cost: $0** (within free tier)

## Support

See `AZURE-MIGRATION-GUIDE.md` for detailed documentation.
See `scripts/README.md` for script details.
