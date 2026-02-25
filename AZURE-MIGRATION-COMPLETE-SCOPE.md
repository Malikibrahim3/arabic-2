# Azure Migration - Complete Scope

## What Gets Migrated

Your app currently has **500 audio files** that will all be regenerated with Azure TTS.

### Complete File Breakdown

#### 1. Letters (56 files)
- 28 letter sounds with fatha (أَ, بَ, تَ, ...)
- 28 letter names (ألف, باء, تاء, ...)

#### 2. Syllables (81 files)
- 27 consonants × 3 vowels (fatha, kasra, damma)
- Examples: بَ, بِ, بُ, تَ, تِ, تُ, ...

#### 3. Words (~160 files)
Including:
- Basic vocabulary (word_salam, word_marhaba, word_shukran, ...)
- Numbers (word_wahid, word_ithnan, word_thalathah, ...)
- Colors (word_ahmar, word_azraq, word_akhdar, ...)
- Family (word_ab, word_umm, word_ibn, word_bint, ...)
- Animals (anim_cat, anim_bird, anim_fish, ...)
- Food & Drinks (food_apple, drink_coffee, drink_tea, ...)
- Days of week (day_monday, day_tuesday, ...)
- Months (month_january, month_february, ...)
- Places (place_mosque, place_school, place_hospital, ...)
- Professions (prof_doctor, prof_teacher, prof_engineer, ...)
- Transportation (trans_car, trans_bus, trans_plane, ...)
- Weather (wea_rain, wea_snow, wea_cloud, ...)
- Emotions (emo_happy, emo_sad, emo_angry, ...)
- Verbs (verb_ate, verb_drank, verb_read, ...)

#### 4. Sentences (12 files)
- sent_assalamu (اَلسَّلامُ عَلَيكُم)
- sent_bismillah (بِسمِ اللّه)
- sent_kayf_halak (كَيفَ حالُك)
- sent_ana_bikhayr (أَنا بِخَير)
- sent_ismi (اِسمي)
- sent_hadha_kitab (هذا كِتاب)
- sent_hadhihi_madrasah (هذِهِ مَدرَسة)
- sent_ana_uhibb (أَنا أُحِبُّ العَرَبيّة)
- sent_ma3a_salama (مَعَ السَّلامة)
- sent_sabah_alkhayr (صَباحُ الخَير)
- sent_masaa_alkhayr (مَساءُ الخَير)
- sent_jazak_allah (جَزاكَ اللّه خَيرًا)

#### 5. Conversations (~174 files)
- **Unit 7 Conversations** (36 files)
  - conv1 (6 lines) - Greetings
  - conv2 (6 lines) - School
  - conv3 (6 lines) - Book
  - conv4 (6 lines) - Bismillah
  - conv5 (6 lines) - Names
  - conv6 (6 lines) - Evening greetings

- **Unit 8 Conversations** (138 files)
  - conv8_1 (12 lines) - Restaurant
  - conv8_2 (12 lines) - Job interview
  - conv8_3 (12 lines) - Travel planning
  - conv8_4 (12 lines) - Doctor visit
  - conv8_5 (12 lines) - University
  - conv8_6 (12 lines) - Shopping
  - conv8_7 (12 lines) - Family gathering
  - conv8_8 (12 lines) - Business meeting

#### 6. Quran Verses (17 files)
- quran_1_1 (Al-Fatiha verse 1)
- quran_1_2 (Al-Fatiha verse 2)
- quran_103_1, 103_2, 103_3 (Surah Al-Asr)
- quran_108_1, 108_2, 108_3 (Surah Al-Kawthar)
- quran_112_1, 112_2, 112_3, 112_4 (Surah Al-Ikhlas)
- quran_113_1, 113_2 (Surah Al-Falaq)
- quran_114_1, 114_2, 114_3 (Surah An-Nas)

### Total: ~500 Audio Files

## Migration Process

### Step 1: Extract Existing Vocabulary
```bash
npm run audio:extract
```
Reads `public/audio/vocabulary.json` and creates `scripts/vocabulary_extracted.json` with all 363 vocabulary items (words, sentences, conversations, Quran).

### Step 2: Generate Letters & Syllables
```bash
npm run audio:generate
```
Generates 137 files (56 letters + 81 syllables) using Azure TTS.

### Step 3: Generate Vocabulary
```bash
npm run audio:vocabulary
```
Generates 363 files (words, sentences, conversations, Quran) using Azure TTS.
**Time estimate: 10-15 minutes** (with 100ms delay between requests)

### Step 4: Rebuild vocabulary.json
```bash
npm run audio:rebuild-json
```
Creates new `public/audio/vocabulary.json` with all 500 entries pointing to the new Azure-generated files.

### Step 5: Upload to Supabase
```bash
SUPABASE_SERVICE_KEY=your_key npm run audio:upload
```
Uploads all 500 MP3 files to Supabase storage.

## Time Estimates

- Extract vocabulary: 5 seconds
- Generate letters/syllables: 2-3 minutes (137 files)
- Generate vocabulary: 10-15 minutes (363 files)
- Rebuild JSON: 5 seconds
- Upload to Supabase: 2-3 minutes

**Total: 15-20 minutes**

## File Size Estimates

- Letters: ~2-5 KB each = ~280 KB total
- Syllables: ~2-5 KB each = ~400 KB total
- Words: ~5-15 KB each = ~2 MB total
- Sentences: ~10-30 KB each = ~360 KB total
- Conversations: ~15-50 KB each = ~5 MB total
- Quran: ~10-30 KB each = ~340 KB total

**Total: ~8-10 MB**

## Cost Analysis

### Azure Speech Service
- Free tier: 0.5M characters/month
- Estimated usage for this migration:
  - Letters: ~200 characters
  - Syllables: ~300 characters
  - Words: ~8,000 characters
  - Sentences: ~500 characters
  - Conversations: ~35,000 characters
  - Quran: ~2,000 characters
  - **Total: ~46,000 characters**

**Cost: $0** (well within free tier)

### Comparison to Google TTS
- Google Wavenet: $16 per 1M characters
- This migration: ~46K characters
- Google cost: ~$0.74
- Azure cost: $0.00
- **Savings: $0.74 per migration + ongoing free usage**

## Voice Quality

**Azure ar-SA-ZariyahNeural**:
- Type: Neural (highest quality)
- Gender: Female
- Dialect: Saudi Arabic
- Speaking rate: 0.85 (15% slower for learners)
- Naturalness: Excellent
- Pronunciation: Native Saudi Arabic

## What's Preserved

✅ All file IDs remain the same
✅ All file paths remain the same
✅ vocabulary.json structure unchanged
✅ AudioEngine.ts requires no changes
✅ All exercises continue to work
✅ No code changes needed

## What Changes

✅ Voice changes from male (Google) to female (Azure)
✅ Dialect changes from MSA to Saudi Arabic
✅ Audio quality: Both excellent (neural voices)
✅ Cost: From paid to free

## Verification

After migration, verify:

1. **File count**:
   ```bash
   find public/audio -name "*.mp3" | wc -l
   # Should show: 500
   ```

2. **vocabulary.json entries**:
   ```bash
   cat public/audio/vocabulary.json | grep -c '"text"'
   # Should show: 500
   ```

3. **Supabase upload**:
   Visit: https://vvtkrxbklgassyhghmqt.supabase.co/storage/v1/object/public/audio/letters/letter_alif_fatha.mp3
   Should play audio

4. **App playback**:
   ```bash
   npm run dev
   ```
   Test audio in any lesson

## Rollback

If needed, the old Google TTS files are preserved. To rollback:

1. Keep backup of current `public/audio/` directory
2. Restore from backup if issues arise
3. Re-upload to Supabase

## Summary

This migration regenerates **all 500 audio files** with Azure TTS:
- Same file structure
- Same IDs and paths
- Better cost (free vs paid)
- Excellent quality (neural voice)
- No code changes needed
- 15-20 minutes total time

**Ready to migrate? See START-HERE.md**
