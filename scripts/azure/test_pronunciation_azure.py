#!/usr/bin/env python3
"""
Arabic Pronunciation Test Harness using Azure Speech-to-Text
Uses Azure's own ASR (same speech service as TTS) for accurate short-clip recognition.
"""

import os
import sys
import json
import re
import struct
import http.client
import subprocess

AZURE_SPEECH_KEY = 'YOUR_AZURE_KEY'
AZURE_REGION = 'uksouth'
AUDIO_DIR = os.path.join(os.path.dirname(__file__), '..', 'public', 'audio')

DIACRITICS = re.compile(r'[\u064B-\u065F\u0670]')

def strip_diacritics(text):
    return DIACRITICS.sub('', text)

def normalize_arabic(text):
    text = text.strip()
    text = text.replace('إ', 'ا').replace('أ', 'ا').replace('آ', 'ا')
    text = text.replace('ة', 'ه')
    text = text.replace('ى', 'ي')
    return text

def similarity(a, b):
    a_s = strip_diacritics(normalize_arabic(a))
    b_s = strip_diacritics(normalize_arabic(b))
    if not a_s and not b_s: return 1.0
    if not a_s or not b_s: return 0.0
    m, n = len(a_s), len(b_s)
    dp = [[0]*(n+1) for _ in range(m+1)]
    for i in range(m+1): dp[i][0] = i
    for j in range(n+1): dp[0][j] = j
    for i in range(1, m+1):
        for j in range(1, n+1):
            cost = 0 if a_s[i-1] == b_s[j-1] else 1
            dp[i][j] = min(dp[i-1][j]+1, dp[i][j-1]+1, dp[i-1][j-1]+cost)
    return 1.0 - dp[m][n] / max(m, n)

def mp3_to_wav(mp3_path):
    """Convert MP3 to WAV (16kHz mono 16-bit) for Azure STT."""
    wav_path = mp3_path.replace('.mp3', '.wav')
    subprocess.run([
        'ffmpeg', '-y', '-i', mp3_path,
        '-ar', '16000', '-ac', '1', '-sample_fmt', 's16',
        wav_path
    ], capture_output=True, check=True)
    return wav_path

def azure_stt(wav_path):
    """Send WAV to Azure Speech-to-Text and return transcript."""
    with open(wav_path, 'rb') as f:
        audio_data = f.read()
    
    conn = http.client.HTTPSConnection(f'{AZURE_REGION}.stt.speech.microsoft.com')
    headers = {
        'Ocp-Apim-Subscription-Key': AZURE_SPEECH_KEY,
        'Content-Type': 'audio/wav; codecs=audio/pcm; samplerate=16000',
        'Accept': 'application/json'
    }
    
    conn.request('POST', '/speech/recognition/conversation/cognitiveservices/v1?language=ar-SA', 
                 body=audio_data, headers=headers)
    resp = conn.getresponse()
    body = resp.read().decode('utf-8')
    conn.close()
    
    if resp.status != 200:
        return f'ERROR:{resp.status}'
    
    data = json.loads(body)
    if data.get('RecognitionStatus') == 'Success':
        return data.get('DisplayText', '').strip().rstrip('.')
    elif data.get('RecognitionStatus') == 'NoMatch':
        return '[NO_MATCH]'
    else:
        return f'[{data.get("RecognitionStatus", "UNKNOWN")}]'

# Expected pronunciations
LETTER_EXPECTED = {
    'letter_alif_fatha': 'أَ', 'letter_baa_fatha': 'بَ', 'letter_taa_fatha': 'تَ',
    'letter_thaa_fatha': 'ثَ', 'letter_jeem_fatha': 'جَ', 'letter_haa_fatha': 'حَ',
    'letter_khaa_fatha': 'خَ', 'letter_daal_fatha': 'دَ', 'letter_dhaal_fatha': 'ذَ',
    'letter_raa_fatha': 'رَ', 'letter_zaay_fatha': 'زَ', 'letter_seen_fatha': 'سَ',
    'letter_sheen_fatha': 'شَ', 'letter_saad_fatha': 'صَ', 'letter_daad_fatha': 'ضَ',
    'letter_taa2_fatha': 'طَ', 'letter_dhaa2_fatha': 'ظَ', 'letter_ayn_fatha': 'عَ',
    'letter_ghayn_fatha': 'غَ', 'letter_faa_fatha': 'فَ', 'letter_qaaf_fatha': 'قَ',
    'letter_kaaf_fatha': 'كَ', 'letter_laam_fatha': 'لَ', 'letter_meem_fatha': 'مَ',
    'letter_noon_fatha': 'نَ', 'letter_haa2_fatha': 'هَ', 'letter_waaw_fatha': 'وَ',
    'letter_yaa_fatha': 'يَ',
}

LETTER_NAME_EXPECTED = {
    'letter_alif_name': 'ألف', 'letter_baa_name': 'باء', 'letter_taa_name': 'تاء',
    'letter_thaa_name': 'ثاء', 'letter_jeem_name': 'جيم', 'letter_haa_name': 'حاء',
    'letter_khaa_name': 'خاء', 'letter_daal_name': 'دال', 'letter_dhaal_name': 'ذال',
    'letter_raa_name': 'راء', 'letter_zaay_name': 'زاي', 'letter_seen_name': 'سين',
    'letter_sheen_name': 'شين', 'letter_saad_name': 'صاد', 'letter_daad_name': 'ضاد',
    'letter_taa2_name': 'طاء', 'letter_dhaa2_name': 'ظاء', 'letter_ayn_name': 'عين',
    'letter_ghayn_name': 'غين', 'letter_faa_name': 'فاء', 'letter_qaaf_name': 'قاف',
    'letter_kaaf_name': 'كاف', 'letter_laam_name': 'لام', 'letter_meem_name': 'ميم',
    'letter_noon_name': 'نون', 'letter_haa2_name': 'هاء', 'letter_waaw_name': 'واو',
    'letter_yaa_name': 'ياء',
}

def run_tests():
    print("=" * 70)
    print("  ARABIC PRONUNCIATION TEST — Azure STT")
    print("=" * 70)

    # Load vocabulary
    vocab_path = os.path.join(AUDIO_DIR, 'vocabulary.json')
    word_expected = {}
    if os.path.exists(vocab_path):
        with open(vocab_path) as f:
            vocab = json.load(f)
        for key, val in vocab.items():
            word_expected[key] = val['text']
    print(f"  Loaded {len(word_expected)} vocabulary entries")

    # Build test map
    tests = {}

    # Letters
    for lid, exp in LETTER_EXPECTED.items():
        p = os.path.join(AUDIO_DIR, 'letters', f'{lid}.mp3')
        if os.path.exists(p):
            tests[p] = {'id': lid, 'expected': exp, 'category': 'letter_sound'}

    for lid, exp in LETTER_NAME_EXPECTED.items():
        p = os.path.join(AUDIO_DIR, 'letters', f'{lid}.mp3')
        if os.path.exists(p):
            tests[p] = {'id': lid, 'expected': exp, 'category': 'letter_name'}

    # Words
    for wid, exp in word_expected.items():
        if wid.startswith('sent_'):
            p = os.path.join(AUDIO_DIR, 'sentences', f'{wid}.mp3')
            cat = 'sentence'
        elif wid.startswith('conv'):
            p = os.path.join(AUDIO_DIR, 'conversations', f'{wid}.mp3')
            cat = 'conversation'
        else:
            p = os.path.join(AUDIO_DIR, 'words', f'{wid}.mp3')
            cat = 'word'
        if os.path.exists(p):
            tests[p] = {'id': wid, 'expected': exp, 'category': cat}

    print(f"\n📋 Total tests: {len(tests)}")

    passed = 0
    failed = 0
    failures = []
    THRESHOLD = 0.60

    for i, (path, info) in enumerate(sorted(tests.items())):
        try:
            wav = mp3_to_wav(path)
            transcript = azure_stt(wav)
            os.remove(wav)
        except Exception as e:
            transcript = f'ERROR: {e}'

        sim = similarity(transcript, info['expected'])
        status = '✅' if sim >= THRESHOLD else '❌'

        if sim >= THRESHOLD:
            passed += 1
        else:
            failed += 1
            failures.append({
                'id': info['id'],
                'category': info['category'],
                'expected': info['expected'],
                'got': transcript,
                'similarity': round(sim, 2)
            })

        if (i + 1) % 5 == 0 or sim < THRESHOLD:
            print(f"  {status} [{i+1}/{len(tests)}] {info['id']}: expected=\"{info['expected']}\" got=\"{transcript}\" sim={sim:.2f}")

    # Report
    print(f"\n{'=' * 70}")
    print(f"  RESULTS")
    print(f"{'=' * 70}")
    print(f"  ✅ Passed: {passed}/{len(tests)}")
    print(f"  ❌ Failed: {failed}/{len(tests)}")
    print(f"  Pass Rate: {passed/len(tests)*100:.1f}%")

    if failures:
        by_cat = {}
        for f in failures:
            by_cat.setdefault(f['category'], []).append(f)

        for cat in ['letter_sound', 'letter_name', 'word', 'sentence', 'conversation']:
            if cat not in by_cat: continue
            print(f"\n  ── {cat.upper()} ({len(by_cat[cat])} failures) ──")
            for f in sorted(by_cat[cat], key=lambda x: x['similarity']):
                print(f"    {f['id']}: expected=\"{f['expected']}\" got=\"{f['got']}\" sim={f['similarity']}")

    results_path = os.path.join(os.path.dirname(__file__), 'azure_stt_results.json')
    with open(results_path, 'w', encoding='utf-8') as f:
        json.dump({'total': len(tests), 'passed': passed, 'failed': failed,
                   'pass_rate': f'{passed/len(tests)*100:.1f}%', 'failures': failures},
                  f, ensure_ascii=False, indent=2)
    print(f"\n📝 Results saved to: {results_path}")

    return 0 if failed == 0 else 1

if __name__ == '__main__':
    sys.exit(run_tests())
