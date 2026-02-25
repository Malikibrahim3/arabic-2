# Azure Migration Flow Diagram

## Current State (Google TTS)

```
┌─────────────────────────────────────────────────────────────┐
│                     CURRENT SETUP                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Course Data (course.ts)                                    │
│         │                                                    │
│         ▼                                                    │
│  Google Cloud TTS                                           │
│  (ar-XA-Wavenet-B)                                         │
│         │                                                    │
│         ▼                                                    │
│  Local Files (public/audio/)                               │
│         │                                                    │
│         ▼                                                    │
│  Supabase Storage                                          │
│         │                                                    │
│         ▼                                                    │
│  App Playback (AudioEngine.ts)                             │
│                                                              │
│  Cost: ~$0.80/month                                        │
│  Quality: High (Wavenet)                                   │
│  Voice: ar-XA-Wavenet-B (Male)                            │
└─────────────────────────────────────────────────────────────┘
```

## New State (Azure Speech)

```
┌─────────────────────────────────────────────────────────────┐
│                      NEW SETUP                               │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Course Data (course.ts)                                    │
│         │                                                    │
│         ▼                                                    │
│  Azure Cognitive Services Speech                           │
│  (ar-SA-ZariyahNeural)                                     │
│         │                                                    │
│         ▼                                                    │
│  Local Files (public/audio/)                               │
│         │                                                    │
│         ▼                                                    │
│  Supabase Storage                                          │
│         │                                                    │
│         ▼                                                    │
│  App Playback (AudioEngine.ts)                             │
│                                                              │
│  Cost: $0 (Free tier)                                      │
│  Quality: High (Neural)                                    │
│  Voice: ar-SA-ZariyahNeural (Female)                      │
└─────────────────────────────────────────────────────────────┘
```

## Migration Process Flow

```
┌─────────────────────────────────────────────────────────────┐
│                   MIGRATION STEPS                            │
└─────────────────────────────────────────────────────────────┘

Step 1: Install Dependencies
┌──────────────────────────┐
│ npm install              │
│ - Azure Speech SDK       │
│ - Remove Google TTS      │
└────────────┬─────────────┘
             │
             ▼
Step 2: Clear Old Audio
┌──────────────────────────┐
│ npm run audio:clear      │
│ - Delete from Supabase   │
│ - Clean slate            │
└────────────┬─────────────┘
             │
             ▼
Step 3: Generate Letters/Syllables
┌──────────────────────────┐
│ npm run audio:generate   │
│ - 56 letter files        │
│ - 81 syllable files      │
│ - Azure Neural voice     │
└────────────┬─────────────┘
             │
             ▼
Step 4: Extract Vocabulary
┌──────────────────────────┐
│ npm run audio:extract    │
│ - Scan course.ts         │
│ - Find unique words      │
│ - Find unique sentences  │
│ - Create vocabulary.json │
└────────────┬─────────────┘
             │
             ▼
Step 5: Generate Vocabulary Audio
┌──────────────────────────┐
│ npm run audio:vocabulary │
│ - ~200 word files        │
│ - ~50 sentence files     │
│ - Azure Neural voice     │
└────────────┬─────────────┘
             │
             ▼
Step 6: Upload to Supabase
┌──────────────────────────┐
│ npm run audio:upload     │
│ - Upload all MP3s        │
│ - Public bucket          │
│ - CDN distribution       │
└────────────┬─────────────┘
             │
             ▼
Step 7: Verify
┌──────────────────────────┐
│ npm run dev              │
│ - Test in browser        │
│ - Check audio playback   │
│ - Run tests              │
└──────────────────────────┘
```

## File Generation Breakdown

```
┌─────────────────────────────────────────────────────────────┐
│                    AUDIO FILES GENERATED                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Letters (56 files)                                         │
│  ├── Sounds (28 files)                                      │
│  │   ├── letter_alif_fatha.mp3    (أَ)                     │
│  │   ├── letter_baa_fatha.mp3     (بَ)                     │
│  │   └── ... (26 more)                                     │
│  └── Names (28 files)                                       │
│      ├── letter_alif_name.mp3     (ألف)                    │
│      ├── letter_baa_name.mp3      (باء)                    │
│      └── ... (26 more)                                     │
│                                                              │
│  Syllables (81 files)                                       │
│  ├── Fatha (27 files)                                       │
│  │   ├── syl_baa_fatha.mp3        (بَ)                     │
│  │   ├── syl_taa_fatha.mp3        (تَ)                     │
│  │   └── ... (25 more)                                     │
│  ├── Kasra (27 files)                                       │
│  │   ├── syl_baa_kasra.mp3        (بِ)                     │
│  │   └── ... (26 more)                                     │
│  └── Damma (27 files)                                       │
│      ├── syl_baa_damma.mp3        (بُ)                     │
│      └── ... (26 more)                                     │
│                                                              │
│  Vocabulary (~250 files)                                    │
│  ├── Words (~200 files)                                     │
│  │   ├── word_0.mp3                                        │
│  │   ├── word_1.mp3                                        │
│  │   └── ... (extracted from course)                       │
│  └── Sentences (~50 files)                                  │
│      ├── sentence_0.mp3                                     │
│      └── ... (extracted from course)                       │
│                                                              │
│  TOTAL: ~387 audio files                                    │
│  SIZE: ~15-20 MB                                            │
│  TIME: ~6-10 minutes to generate                           │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow in App

```
┌─────────────────────────────────────────────────────────────┐
│                   APP AUDIO PLAYBACK                         │
└─────────────────────────────────────────────────────────────┘

User clicks audio button
         │
         ▼
useAudio hook (useAudio.ts)
         │
         ▼
AudioEngine (AudioEngine.ts)
         │
         ├─── Try: Load from Supabase CDN
         │         │
         │         ▼
         │    Fetch MP3 from:
         │    https://vvtkrxbklgassyhghmqt.supabase.co/
         │    storage/v1/object/public/audio/...
         │         │
         │         ▼
         │    Decode with Web Audio API
         │         │
         │         ▼
         │    Play with speed control
         │
         └─── Fallback: Browser TTS
                   │
                   ▼
              window.speechSynthesis
                   │
                   ▼
              Play with ar-SA voice
```

## Storage Structure

```
Supabase Storage Bucket: "audio"
├── letters/
│   ├── letter_alif_fatha.mp3
│   ├── letter_alif_name.mp3
│   ├── letter_baa_fatha.mp3
│   ├── letter_baa_name.mp3
│   └── ... (52 more)
├── syllables/
│   ├── syl_baa_fatha.mp3
│   ├── syl_baa_kasra.mp3
│   ├── syl_baa_damma.mp3
│   └── ... (78 more)
├── words/
│   ├── word_0.mp3
│   ├── word_1.mp3
│   └── ... (~200 files)
└── sentences/
    ├── sentence_0.mp3
    ├── sentence_1.mp3
    └── ... (~50 files)

Public URL Pattern:
https://vvtkrxbklgassyhghmqt.supabase.co/storage/v1/object/public/audio/{folder}/{file}.mp3
```

## Cost Comparison

```
┌─────────────────────────────────────────────────────────────┐
│                    COST ANALYSIS                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Google Cloud TTS (Previous)                                │
│  ├── Wavenet voices: $16 per 1M characters                 │
│  ├── This course: ~50K characters                          │
│  ├── Monthly cost: ~$0.80                                  │
│  └── Annual cost: ~$9.60                                   │
│                                                              │
│  Azure Speech (New)                                         │
│  ├── Neural voices: Free tier 0.5M chars/month            │
│  ├── This course: ~50K characters                          │
│  ├── Monthly cost: $0.00                                   │
│  └── Annual cost: $0.00                                    │
│                                                              │
│  SAVINGS: $9.60/year                                        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Quality Comparison

```
┌─────────────────────────────────────────────────────────────┐
│                   VOICE QUALITY                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Google ar-XA-Wavenet-B                                     │
│  ├── Type: Wavenet (Neural)                                │
│  ├── Gender: Male                                          │
│  ├── Dialect: Modern Standard Arabic                       │
│  ├── Quality: ⭐⭐⭐⭐⭐                                      │
│  └── Naturalness: High                                     │
│                                                              │
│  Azure ar-SA-ZariyahNeural                                  │
│  ├── Type: Neural                                          │
│  ├── Gender: Female                                        │
│  ├── Dialect: Saudi Arabic                                 │
│  ├── Quality: ⭐⭐⭐⭐⭐                                      │
│  └── Naturalness: High                                     │
│                                                              │
│  Both are excellent quality!                                │
│  Azure offers more dialect options.                         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Timeline

```
┌─────────────────────────────────────────────────────────────┐
│                    MIGRATION TIMELINE                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  T+0:00   Start migration                                   │
│  T+0:10   Dependencies installed                            │
│  T+0:20   Old audio cleared                                 │
│  T+2:30   Letters/syllables generated (137 files)          │
│  T+2:35   Vocabulary extracted                              │
│  T+7:30   Vocabulary audio generated (~250 files)          │
│  T+8:30   All files uploaded to Supabase                   │
│  T+8:40   Verification complete                             │
│                                                              │
│  TOTAL: ~8-10 minutes                                       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Success Metrics

```
✅ 387 audio files generated
✅ 0 errors during generation
✅ 100% upload success rate
✅ Audio plays in app
✅ No console errors
✅ Tests pass
✅ Voice quality excellent
✅ Cost: $0
```

---

**Ready to migrate?** See `START-HERE.md`
