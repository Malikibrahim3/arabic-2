# 🚀 Azure TTS Migration - START HERE

## What This Is

Complete migration from Google Cloud TTS to Azure Cognitive Services Speech for your Arabic learning app.

**Scope**: All 500 audio files will be regenerated with Azure TTS.

## Why Azure?

- ✅ **Free tier**: 0.5M characters/month (vs Google's paid-only Wavenet)
- ✅ **High quality**: Neural voices (ar-SA-ZariyahNeural)
- ✅ **Cost savings**: $0 vs ~$0.74 per migration
- ✅ **Better for learners**: Natural Saudi Arabic pronunciation

## Quick Start (3 Steps)

### 1. Install Dependencies

```bash
npm install
```

### 2. Test Azure Connection

```bash
npm run audio:test
```

You should see:
```
✅ SUCCESS! Azure connection working.
✅ Test file created
🎉 Azure Speech Service is ready to use!
```

### 3. Run Migration

```bash
# Set your Supabase service key
export SUPABASE_SERVICE_KEY=your_supabase_service_role_key

# Run migration (takes 15-20 minutes)
npm run migrate:azure
```

## What Happens During Migration

1. ✅ Installs Azure Speech SDK
2. ✅ Clears old audio from Supabase
3. ✅ Extracts vocabulary from existing vocabulary.json (363 items)
4. ✅ Generates 56 letter files + 28 letter names
5. ✅ Generates 81 syllable files
6. ✅ Generates 160 word files
7. ✅ Generates 12 sentence files
8. ✅ Generates 174 conversation files
9. ✅ Generates 17 Quran verse files
10. ✅ Rebuilds vocabulary.json (500 entries)
11. ✅ Uploads everything to Supabase

**Total: 500 audio files regenerated**

## After Migration

Test the app:

```bash
npm run dev
```

Open browser, try any lesson, click audio buttons. Should work perfectly!

## Files You Need to Know About

### Quick Reference
- **START-HERE.md** ← You are here
- **AZURE-MIGRATION-COMPLETE-SCOPE.md** - Full file breakdown
- **QUICK-AZURE-MIGRATION.md** - Quick commands
- **MIGRATION-CHECKLIST.md** - Step-by-step checklist

### Detailed Docs
- **AZURE-MIGRATION-SUMMARY.md** - Complete overview
- **AZURE-MIGRATION-GUIDE.md** - Detailed guide
- **scripts/README.md** - Script documentation

### Scripts
- **scripts/test_azure_connection.ts** - Test Azure
- **scripts/extract_vocabulary.ts** - Extract from vocabulary.json
- **scripts/generate_audio_azure.ts** - Generate letters/syllables
- **scripts/generate_vocabulary_audio_azure.ts** - Generate vocabulary
- **scripts/rebuild_vocabulary_json.ts** - Rebuild vocabulary.json
- **scripts/migrate-to-azure.sh** - Automated migration

## Azure Configuration (Already Set)

```
Region: UK South (uksouth)
Voice: ar-SA-ZariyahNeural (Female Saudi Arabic)
Key: Already configured in scripts
Speaking Rate: 0.85 (15% slower for learners)
```

You don't need to configure anything - just run the migration!

## NPM Scripts

```bash
npm run audio:test          # Test Azure connection
npm run audio:extract       # Extract vocabulary from vocabulary.json
npm run audio:generate      # Generate letters/syllables (137 files)
npm run audio:vocabulary    # Generate vocabulary (363 files)
npm run audio:rebuild-json  # Rebuild vocabulary.json
npm run audio:upload        # Upload to Supabase
npm run audio:clear         # Clear Supabase audio
npm run migrate:azure       # Full migration (automated)
```

## Troubleshooting

### "Module not found"
```bash
npm install
```

### "SUPABASE_SERVICE_KEY not set"
```bash
export SUPABASE_SERVICE_KEY=your_key
```

### Azure connection fails
- Keys are already configured
- Check internet connection
- Verify Azure subscription is active

### Audio not playing in app
- Check browser console for errors
- Verify Supabase URLs are accessible
- Test URL: https://vvtkrxbklgassyhghmqt.supabase.co/storage/v1/object/public/audio/letters/letter_alif_fatha.mp3

## Need Help?

1. **Quick answers**: See `QUICK-AZURE-MIGRATION.md`
2. **Full scope**: See `AZURE-MIGRATION-COMPLETE-SCOPE.md`
3. **Detailed guide**: See `AZURE-MIGRATION-GUIDE.md`
4. **Checklist**: See `MIGRATION-CHECKLIST.md`
5. **Script docs**: See `scripts/README.md`

## Ready to Start?

```bash
# 1. Test
npm run audio:test

# 2. Migrate
export SUPABASE_SERVICE_KEY=your_key
npm run migrate:azure

# 3. Verify
npm run dev
```

That's it! 🎉

## What You'll Get

- 56 letter audio files (sounds + names)
- 81 syllable audio files (consonants × vowels)
- 160 word audio files (vocabulary)
- 12 sentence audio files (common phrases)
- 174 conversation audio files (dialogues)
- 17 Quran verse audio files (surahs)
- **Total: 500 files**
- All uploaded to Supabase
- All using high-quality Azure neural voice
- All for $0 (within free tier)

## Time Required

- Reading this: 2 minutes ✅
- Testing connection: 10 seconds
- Running migration: 15-20 minutes
- Verifying: 2 minutes

**Total: ~20-25 minutes**

## Questions?

Everything is documented. Start with:
1. This file (START-HERE.md)
2. AZURE-MIGRATION-COMPLETE-SCOPE.md
3. QUICK-AZURE-MIGRATION.md
4. MIGRATION-CHECKLIST.md

Then run the migration!

---

**Ready? Let's go!** 🚀

```bash
npm run audio:test && echo "✅ Ready to migrate!"
```
