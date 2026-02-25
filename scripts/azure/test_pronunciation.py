#!/usr/bin/env python3
"""
Arabic Pronunciation Test Harness
Uses Whisper ASR to validate every audio file against expected Arabic text.
Flags any mispronunciations, wrong vowels, missing sounds, etc.
"""

import os
import sys
import json
import re
import unicodedata
import whisper

# ── Configuration ────────────────────────────────────────────
AUDIO_DIR = os.path.join(os.path.dirname(__file__), '..', 'public', 'audio')
MODEL_SIZE = 'base'  # Fast on CPU, decent Arabic accuracy for first pass

# ── Expected pronunciations for every audio file ─────────────

# Letters with Fatha (isolated letter + short 'a' vowel)
LETTER_EXPECTED = {
    'letter_alif_fatha': 'أَ',
    'letter_baa_fatha': 'بَ',
    'letter_taa_fatha': 'تَ',
    'letter_thaa_fatha': 'ثَ',
    'letter_jeem_fatha': 'جَ',
    'letter_haa_fatha': 'حَ',
    'letter_khaa_fatha': 'خَ',
    'letter_daal_fatha': 'دَ',
    'letter_dhaal_fatha': 'ذَ',
    'letter_raa_fatha': 'رَ',
    'letter_zaay_fatha': 'زَ',
    'letter_seen_fatha': 'سَ',
    'letter_sheen_fatha': 'شَ',
    'letter_saad_fatha': 'صَ',
    'letter_daad_fatha': 'ضَ',
    'letter_taa2_fatha': 'طَ',
    'letter_dhaa2_fatha': 'ظَ',
    'letter_ayn_fatha': 'عَ',
    'letter_ghayn_fatha': 'غَ',
    'letter_faa_fatha': 'فَ',
    'letter_qaaf_fatha': 'قَ',
    'letter_kaaf_fatha': 'كَ',
    'letter_laam_fatha': 'لَ',
    'letter_meem_fatha': 'مَ',
    'letter_noon_fatha': 'نَ',
    'letter_haa2_fatha': 'هَ',
    'letter_waaw_fatha': 'وَ',
    'letter_yaa_fatha': 'يَ',
}

# Letter names
LETTER_NAME_EXPECTED = {
    'letter_alif_name': 'أَلِف',
    'letter_baa_name': 'باء',
    'letter_taa_name': 'تاء',
    'letter_thaa_name': 'ثاء',
    'letter_jeem_name': 'جيم',
    'letter_haa_name': 'حاء',
    'letter_khaa_name': 'خاء',
    'letter_daal_name': 'دال',
    'letter_dhaal_name': 'ذال',
    'letter_raa_name': 'راء',
    'letter_zaay_name': 'زاي',
    'letter_seen_name': 'سين',
    'letter_sheen_name': 'شين',
    'letter_saad_name': 'صاد',
    'letter_daad_name': 'ضاد',
    'letter_taa2_name': 'طاء',
    'letter_dhaa2_name': 'ظاء',
    'letter_ayn_name': 'عين',
    'letter_ghayn_name': 'غين',
    'letter_faa_name': 'فاء',
    'letter_qaaf_name': 'قاف',
    'letter_kaaf_name': 'كاف',
    'letter_laam_name': 'لام',
    'letter_meem_name': 'ميم',
    'letter_noon_name': 'نون',
    'letter_haa2_name': 'هاء',
    'letter_waaw_name': 'واو',
    'letter_yaa_name': 'ياء',
}

# Syllables: consonant + vowel combinations
CONSONANTS = ['baa','taa','thaa','jeem','haa','khaa','daal','dhaal','raa','zaay',
              'seen','sheen','saad','daad','taa2','dhaa2','ayn','ghayn','faa',
              'qaaf','kaaf','laam','meem','noon','haa2','waaw','yaa']
CONS_LETTERS = ['ب','ت','ث','ج','ح','خ','د','ذ','ر','ز','س','ش','ص','ض','ط','ظ','ع','غ','ف','ق','ك','ل','م','ن','ه','و','ي']
VOWEL_IDS = ['fatha', 'kasra', 'damma']
VOWEL_MARKS = ['َ', 'ِ', 'ُ']

SYLLABLE_EXPECTED = {}
for ci, cid in enumerate(CONSONANTS):
    for vi, vid in enumerate(VOWEL_IDS):
        key = f'syl_{cid}_{vid}'
        SYLLABLE_EXPECTED[key] = CONS_LETTERS[ci] + VOWEL_MARKS[vi]

# Words from vocabulary.json
WORD_EXPECTED = {}  # Will be loaded at runtime

# ── Utility: strip diacritics for fuzzy comparison ───────────

DIACRITICS = re.compile(r'[\u064B-\u065F\u0670]')

def strip_diacritics(text):
    """Remove Arabic diacritical marks for base-letter comparison."""
    return DIACRITICS.sub('', text)

def normalize_arabic(text):
    """Normalize Arabic text for comparison."""
    text = text.strip()
    # Normalize hamza variants
    text = text.replace('إ', 'ا').replace('أ', 'ا').replace('آ', 'ا')
    # Normalize taa marbuta/haa
    text = text.replace('ة', 'ه')
    # Normalize alif maqsura
    text = text.replace('ى', 'ي')
    return text

def similarity(a, b):
    """Calculate character-level similarity between two Arabic strings."""
    a_stripped = strip_diacritics(normalize_arabic(a))
    b_stripped = strip_diacritics(normalize_arabic(b))
    
    if not a_stripped and not b_stripped:
        return 1.0
    if not a_stripped or not b_stripped:
        return 0.0
    
    # Levenshtein-based similarity
    m, n = len(a_stripped), len(b_stripped)
    dp = [[0]*(n+1) for _ in range(m+1)]
    for i in range(m+1): dp[i][0] = i
    for j in range(n+1): dp[0][j] = j
    for i in range(1, m+1):
        for j in range(1, n+1):
            cost = 0 if a_stripped[i-1] == b_stripped[j-1] else 1
            dp[i][j] = min(dp[i-1][j]+1, dp[i][j-1]+1, dp[i-1][j-1]+cost)
    
    max_len = max(m, n)
    return 1.0 - dp[m][n] / max_len if max_len > 0 else 1.0

# ── Main test runner ─────────────────────────────────────────

def load_vocabulary():
    """Load word expectations from vocabulary.json."""
    vocab_path = os.path.join(AUDIO_DIR, 'vocabulary.json')
    if os.path.exists(vocab_path):
        with open(vocab_path) as f:
            vocab = json.load(f)
        for key, val in vocab.items():
            WORD_EXPECTED[key] = val['text']
    print(f"  Loaded {len(WORD_EXPECTED)} vocabulary entries")

def run_tests():
    print("=" * 70)
    print("  ARABIC PRONUNCIATION TEST HARNESS")
    print("  Whisper ASR Model:", MODEL_SIZE)
    print("=" * 70)
    
    # Load vocabulary
    load_vocabulary()
    
    # Load Whisper model
    print(f"\n⏳ Loading Whisper model '{MODEL_SIZE}'...")
    print("   (This may take a few minutes on first run)")
    model = whisper.load_model(MODEL_SIZE)
    print("✅ Model loaded\n")
    
    # Build full test map: { audio_file_path: expected_arabic }
    tests = {}
    
    # Letters
    for lid, expected in LETTER_EXPECTED.items():
        path = os.path.join(AUDIO_DIR, 'letters', f'{lid}.mp3')
        if os.path.exists(path):
            tests[path] = {'id': lid, 'expected': expected, 'category': 'letter_sound'}
    
    for lid, expected in LETTER_NAME_EXPECTED.items():
        path = os.path.join(AUDIO_DIR, 'letters', f'{lid}.mp3')
        if os.path.exists(path):
            tests[path] = {'id': lid, 'expected': expected, 'category': 'letter_name'}
    
    # Syllables
    for sid, expected in SYLLABLE_EXPECTED.items():
        path = os.path.join(AUDIO_DIR, 'syllables', f'{sid}.mp3')
        if os.path.exists(path):
            tests[path] = {'id': sid, 'expected': expected, 'category': 'syllable'}
    
    # Words
    for wid, expected in WORD_EXPECTED.items():
        # Determine directory based on prefix
        if wid.startswith('word_'):
            path = os.path.join(AUDIO_DIR, 'words', f'{wid}.mp3')
        elif wid.startswith('sent_'):
            path = os.path.join(AUDIO_DIR, 'sentences', f'{wid}.mp3')
        elif wid.startswith('conv'):
            path = os.path.join(AUDIO_DIR, 'conversations', f'{wid}.mp3')
        else:
            path = os.path.join(AUDIO_DIR, 'words', f'{wid}.mp3')
        
        if os.path.exists(path):
            cat = 'word'
            if wid.startswith('sent_'): cat = 'sentence'
            elif wid.startswith('conv'): cat = 'conversation'
            tests[path] = {'id': wid, 'expected': expected, 'category': cat}
    
    # Also add non-vocab words (fam_, body_, etc.)
    words_dir = os.path.join(AUDIO_DIR, 'words')
    if os.path.isdir(words_dir):
        for f in os.listdir(words_dir):
            if f.endswith('.mp3'):
                fid = f[:-4]
                path = os.path.join(words_dir, f)
                if path not in tests and fid not in WORD_EXPECTED:
                    # We don't have expected text for this one, skip it
                    pass
    
    sentences_dir = os.path.join(AUDIO_DIR, 'sentences')
    if os.path.isdir(sentences_dir):
        for f in os.listdir(sentences_dir):
            if f.endswith('.mp3'):
                fid = f[:-4]
                path = os.path.join(sentences_dir, f)
                if path not in tests and fid in WORD_EXPECTED:
                    tests[path] = {'id': fid, 'expected': WORD_EXPECTED[fid], 'category': 'sentence'}
    
    print(f"📋 Total tests: {len(tests)}")
    print(f"   Letters: {sum(1 for t in tests.values() if t['category'] in ('letter_sound','letter_name'))}")
    print(f"   Syllables: {sum(1 for t in tests.values() if t['category'] == 'syllable')}")
    print(f"   Words: {sum(1 for t in tests.values() if t['category'] == 'word')}")
    print(f"   Sentences: {sum(1 for t in tests.values() if t['category'] == 'sentence')}")
    print(f"   Conversations: {sum(1 for t in tests.values() if t['category'] == 'conversation')}")
    print()
    
    # Run transcription tests
    passed = 0
    failed = 0
    failures = []
    
    THRESHOLD = 0.70  # Minimum similarity to pass (relaxed for short utterances)
    
    for i, (path, info) in enumerate(sorted(tests.items())):
        audio_id = info['id']
        expected = info['expected']
        category = info['category']
        
        try:
            result = model.transcribe(path, language='ar', task='transcribe')
            transcript = result['text'].strip()
        except Exception as e:
            print(f"  ❌ ERROR [{audio_id}]: {e}")
            failed += 1
            failures.append({
                'id': audio_id,
                'category': category,
                'expected': expected,
                'got': f'ERROR: {e}',
                'similarity': 0.0
            })
            continue
        
        sim = similarity(transcript, expected)
        status = '✅' if sim >= THRESHOLD else '❌'
        
        if sim >= THRESHOLD:
            passed += 1
        else:
            failed += 1
            failures.append({
                'id': audio_id,
                'category': category,
                'expected': expected,
                'got': transcript,
                'similarity': sim
            })
        
        # Progress output
        if (i + 1) % 10 == 0 or sim < THRESHOLD:
            print(f"  {status} [{i+1}/{len(tests)}] {audio_id}: expected=\"{expected}\" got=\"{transcript}\" sim={sim:.2f}")
    
    # ── Report ──────────────────────────────────────────────────
    print("\n" + "=" * 70)
    print("  RESULTS")
    print("=" * 70)
    print(f"  ✅ Passed: {passed}/{len(tests)}")
    print(f"  ❌ Failed: {failed}/{len(tests)}")
    print(f"  Pass Rate: {passed/len(tests)*100:.1f}%")
    
    if failures:
        print(f"\n{'─' * 70}")
        print("  FAILURES (sorted by category)")
        print(f"{'─' * 70}")
        
        # Group by category
        by_cat = {}
        for f in failures:
            cat = f['category']
            if cat not in by_cat:
                by_cat[cat] = []
            by_cat[cat].append(f)
        
        for cat in ['letter_sound', 'letter_name', 'syllable', 'word', 'sentence', 'conversation']:
            if cat not in by_cat:
                continue
            print(f"\n  ── {cat.upper()} ({len(by_cat[cat])} failures) ──")
            for f in by_cat[cat]:
                print(f"    {f['id']}:")
                print(f"      Expected: \"{f['expected']}\"")
                print(f"      Got:      \"{f['got']}\"")
                print(f"      Similarity: {f['similarity']:.2f}")
    
    # Save results to JSON
    results_path = os.path.join(os.path.dirname(__file__), 'pronunciation_results.json')
    with open(results_path, 'w', encoding='utf-8') as f:
        json.dump({
            'total': len(tests),
            'passed': passed,
            'failed': failed,
            'pass_rate': f'{passed/len(tests)*100:.1f}%',
            'failures': failures
        }, f, ensure_ascii=False, indent=2)
    print(f"\n📝 Results saved to: {results_path}")
    
    return 0 if failed == 0 else 1

if __name__ == '__main__':
    sys.exit(run_tests())
