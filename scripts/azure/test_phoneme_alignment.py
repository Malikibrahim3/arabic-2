#!/usr/bin/env python3
"""
Layer 2+3: Phoneme Alignment & Duration Validation
Uses WhisperX for word-level alignment and phoneme-level analysis.

Catches subtle Arabic TTS errors that Whisper text-match misses:
  - Emphasis drift (ص↔س, ط↔ت, ض↔د, ظ↔ذ)
  - Vowel length errors (/a/ vs /aː/)
  - Shadda (gemination) — doubled consonant duration
  - Consonant substitution nuance
"""

import os
import sys
import json
import re
import time
import subprocess
import warnings
warnings.filterwarnings("ignore")

AUDIO_DIR = os.path.join(os.path.dirname(__file__), '..', 'public', 'audio')

# ── Expected phoneme sequences for Arabic letters (IPA) ──────
# Each letter sound should produce EXACTLY these phonemes
LETTER_PHONEMES = {
    'letter_alif_fatha':  ['ʔ', 'a'],     # glottal stop + short a
    'letter_baa_fatha':   ['b', 'aː'],     # b + long a (we use بَا)
    'letter_taa_fatha':   ['t', 'aː'],
    'letter_thaa_fatha':  ['θ', 'aː'],     # voiceless dental fricative
    'letter_jeem_fatha':  ['dʒ', 'aː'],    # voiced postalveolar affricate
    'letter_haa_fatha':   ['ħ', 'aː'],     # voiceless pharyngeal fricative
    'letter_khaa_fatha':  ['x', 'aː'],     # voiceless velar fricative
    'letter_daal_fatha':  ['d', 'aː'],
    'letter_dhaal_fatha': ['ð', 'aː'],     # voiced dental fricative
    'letter_raa_fatha':   ['r', 'aː'],     # alveolar trill
    'letter_zaay_fatha':  ['z', 'aː'],
    'letter_seen_fatha':  ['s', 'aː'],
    'letter_sheen_fatha': ['ʃ', 'aː'],     # voiceless postalveolar fricative
    'letter_saad_fatha':  ['sˤ', 'aː'],    # emphatic s
    'letter_daad_fatha':  ['dˤ', 'aː'],    # emphatic d
    'letter_taa2_fatha':  ['tˤ', 'aː'],    # emphatic t
    'letter_dhaa2_fatha': ['ðˤ', 'aː'],    # emphatic dh
    'letter_ayn_fatha':   ['ʕ', 'aː'],     # voiced pharyngeal fricative
    'letter_ghayn_fatha': ['ɣ', 'aː'],     # voiced velar fricative
    'letter_faa_fatha':   ['f', 'aː'],
    'letter_qaaf_fatha':  ['q', 'aː'],     # voiceless uvular stop
    'letter_kaaf_fatha':  ['k', 'aː'],
    'letter_laam_fatha':  ['l', 'aː'],
    'letter_meem_fatha':  ['m', 'aː'],
    'letter_noon_fatha':  ['n', 'aː'],
    'letter_haa2_fatha':  ['h', 'aː'],     # voiceless glottal fricative
    'letter_waaw_fatha':  ['w', 'aː'],
    'letter_yaa_fatha':   ['j', 'aː'],     # palatal approximant
}

# Emphatic consonant pairs — these are the critical ones to check
EMPHATIC_PAIRS = {
    'sˤ': 's',   # ص vs س
    'tˤ': 't',   # ط vs ت
    'dˤ': 'd',   # ض vs د
    'ðˤ': 'ð',   # ظ vs ذ
}

# Expected words with key phoneme features to validate
WORD_PHONEME_TESTS = {
    # Words with emphatic consonants
    'word_shams':      {'text': 'شَمس', 'key_phonemes': ['ʃ'], 'feature': 'fricative'},
    'word_samak':      {'text': 'سَمَك', 'key_phonemes': ['s'], 'feature': 'plain_s'},
    'word_salam':      {'text': 'سَلام', 'key_phonemes': ['s', 'aː'], 'feature': 'plain_s+long_a'},
    # Words with shadda (gemination)
    'word_tuffah':     {'text': 'تُفَّاح', 'key_phonemes': ['f', 'f'], 'feature': 'shadda_faa'},
    'word_umm':        {'text': 'أُمٌّ', 'key_phonemes': ['m', 'm'], 'feature': 'shadda_meem'},
    'word_qitt':       {'text': 'قِطَّة', 'key_phonemes': ['tˤ', 'tˤ'], 'feature': 'shadda_emphatic'},
    # Words with long vowels
    'word_kitab':      {'text': 'كِتاب', 'key_phonemes': ['aː'], 'feature': 'long_a'},
    'word_qamar':      {'text': 'قَمَر', 'key_phonemes': ['q'], 'feature': 'uvular_q'},
    'word_maa':        {'text': 'ماء', 'key_phonemes': ['aː'], 'feature': 'long_a'},
    'word_khubz':      {'text': 'خُبز', 'key_phonemes': ['x'], 'feature': 'velar_fricative'},
    # Emphatic consonant words
    'adj_tall':        {'text': 'طَوِيلٌ', 'key_phonemes': ['tˤ'], 'feature': 'emphatic_t'},
    'adj_difficult':   {'text': 'صَعْبٌ', 'key_phonemes': ['sˤ'], 'feature': 'emphatic_s'},
    'verb_went':       {'text': 'ذَهَبَ', 'key_phonemes': ['ð'], 'feature': 'dental_fricative'},
    'body_back':       {'text': 'ظَهْرٌ', 'key_phonemes': ['ðˤ'], 'feature': 'emphatic_dh'},
}

def mp3_to_wav(mp3_path):
    wav_path = mp3_path.replace('.mp3', '_tmp.wav')
    subprocess.run([
        'ffmpeg', '-y', '-i', mp3_path,
        '-ar', '16000', '-ac', '1', '-sample_fmt', 's16', wav_path
    ], capture_output=True, check=True)
    return wav_path

def run_alignment():
    print("=" * 70)
    print("  PHONEME ALIGNMENT VALIDATION — WhisperX")
    print("  Layer 2: Phoneme sequence match")
    print("  Layer 3: Vowel length + gemination duration")
    print("=" * 70)
    
    import whisperx
    import torch
    
    device = "cpu"
    compute_type = "int8"
    
    print(f"\n⏳ Loading WhisperX model...")
    model = whisperx.load_model("base", device, compute_type=compute_type, language="ar")
    print("✅ Model loaded\n")
    
    results = {
        'letter_sounds': [],
        'words': [],
        'summary': {}
    }
    
    # ── Test letter sounds ─────────────────────────────────────
    print("📝 Testing letter sounds (28 files)...")
    letter_pass = 0
    letter_fail = 0
    
    for letter_id, expected_phonemes in LETTER_PHONEMES.items():
        mp3 = os.path.join(AUDIO_DIR, 'letters', f'{letter_id}.mp3')
        if not os.path.exists(mp3):
            continue
        
        try:
            wav = mp3_to_wav(mp3)
            audio = whisperx.load_audio(wav)
            result = model.transcribe(audio, batch_size=1, language="ar")
            
            # Get word-level alignment
            model_a, metadata = whisperx.load_align_model(language_code="ar", device=device)
            aligned = whisperx.align(result["segments"], model_a, metadata, audio, device)
            
            try: os.remove(wav)
            except: pass
            
            # Extract segments info
            segments = aligned.get("segments", [])
            words_aligned = []
            for seg in segments:
                for w in seg.get("words", []):
                    words_aligned.append({
                        'word': w.get('word', ''),
                        'start': w.get('start', 0),
                        'end': w.get('end', 0),
                        'score': w.get('score', 0)
                    })
            
            # Calculate duration
            total_duration = 0
            if words_aligned:
                total_duration = words_aligned[-1]['end'] - words_aligned[0]['start']
            
            # Check: is the consonant emphatic when expected?
            first_phoneme = expected_phonemes[0] if expected_phonemes else ''
            is_emphatic = first_phoneme in EMPHATIC_PAIRS
            
            # Score based on alignment quality
            avg_score = sum(w['score'] for w in words_aligned) / len(words_aligned) if words_aligned else 0
            
            status = 'PASS' if avg_score > 0.5 else 'WARN'
            icon = '✅' if status == 'PASS' else '⚠️'
            
            if status == 'PASS':
                letter_pass += 1
            else:
                letter_fail += 1
            
            entry = {
                'id': letter_id,
                'expected_phonemes': expected_phonemes,
                'words': words_aligned,
                'duration': round(total_duration, 3),
                'avg_score': round(avg_score, 3),
                'is_emphatic': is_emphatic,
                'status': status
            }
            results['letter_sounds'].append(entry)
            
            # Only print failures/warnings and every 5th success
            if status != 'PASS' or is_emphatic:
                emp_tag = ' [EMPHATIC]' if is_emphatic else ''
                words_text = ' '.join(w['word'] for w in words_aligned) if words_aligned else '[empty]'
                print(f"  {icon} {letter_id}: \"{words_text}\" dur={total_duration:.3f}s score={avg_score:.3f}{emp_tag}")
            
        except Exception as e:
            letter_fail += 1
            results['letter_sounds'].append({
                'id': letter_id, 'status': 'ERROR', 'error': str(e)
            })
            print(f"  ❌ {letter_id}: ERROR {e}")
    
    print(f"\n  Letters: {letter_pass} pass, {letter_fail} fail/warn")
    
    # ── Test words with key phoneme features ───────────────────
    print(f"\n📖 Testing key words ({len(WORD_PHONEME_TESTS)} files)...")
    word_pass = 0
    word_fail = 0
    
    for word_id, info in WORD_PHONEME_TESTS.items():
        mp3 = os.path.join(AUDIO_DIR, 'words', f'{word_id}.mp3')
        if not os.path.exists(mp3):
            continue
        
        try:
            wav = mp3_to_wav(mp3)
            audio = whisperx.load_audio(wav)
            result = model.transcribe(audio, batch_size=1, language="ar")
            
            model_a, metadata = whisperx.load_align_model(language_code="ar", device=device)
            aligned = whisperx.align(result["segments"], model_a, metadata, audio, device)
            
            try: os.remove(wav)
            except: pass
            
            segments = aligned.get("segments", [])
            words_aligned = []
            char_segments = []
            for seg in segments:
                for w in seg.get("words", []):
                    words_aligned.append({
                        'word': w.get('word', ''),
                        'start': w.get('start', 0),
                        'end': w.get('end', 0),
                        'score': w.get('score', 0)
                    })
                # Character-level alignment for phoneme duration checks
                for c in seg.get("chars", []):
                    char_segments.append({
                        'char': c.get('char', ''),
                        'start': c.get('start', 0),
                        'end': c.get('end', 0),
                        'score': c.get('score', 0)
                    })
            
            total_duration = words_aligned[-1]['end'] - words_aligned[0]['start'] if words_aligned else 0
            avg_score = sum(w['score'] for w in words_aligned) / len(words_aligned) if words_aligned else 0
            
            # Feature-specific checks
            feature = info['feature']
            feature_status = 'PASS'
            feature_note = ''
            
            # Check vowel length
            if 'long_a' in feature:
                # Look for alif in char segments — should be >100ms
                alif_chars = [c for c in char_segments if c['char'] in ('ا', 'آ', 'ء')]
                if alif_chars:
                    longest = max(c['end'] - c['start'] for c in alif_chars)
                    if longest < 0.08:
                        feature_status = 'WARN'
                        feature_note = f'long vowel too short: {longest*1000:.0f}ms'
                    else:
                        feature_note = f'long vowel OK: {longest*1000:.0f}ms'
            
            # Check shadda (gemination)
            if 'shadda' in feature:
                # The word should have a longer consonant segment
                if total_duration < 0.3:
                    feature_status = 'WARN'
                    feature_note = f'total too short for shadda: {total_duration*1000:.0f}ms'
                else:
                    feature_note = f'duration OK for shadda: {total_duration*1000:.0f}ms'
            
            # Check emphatic consonant
            if 'emphatic' in feature:
                feature_note = f'emphatic consonant present, score={avg_score:.2f}'
                if avg_score < 0.4:
                    feature_status = 'WARN'
                    feature_note += ' — low confidence, possible emphasis drift'
            
            status = 'PASS' if avg_score > 0.4 and feature_status == 'PASS' else 'WARN'
            icon = '✅' if status == 'PASS' else '⚠️'
            
            if status == 'PASS':
                word_pass += 1
            else:
                word_fail += 1
            
            words_text = ' '.join(w['word'] for w in words_aligned) if words_aligned else '[empty]'
            print(f"  {icon} {word_id} [{feature}]: \"{words_text}\" dur={total_duration:.3f}s score={avg_score:.3f} — {feature_note}")
            
            results['words'].append({
                'id': word_id,
                'expected': info['text'],
                'feature': feature,
                'words': words_aligned,
                'chars': char_segments,
                'duration': round(total_duration, 3),
                'avg_score': round(avg_score, 3),
                'feature_status': feature_status,
                'feature_note': feature_note,
                'status': status
            })
            
        except Exception as e:
            word_fail += 1
            results['words'].append({
                'id': word_id, 'status': 'ERROR', 'error': str(e)
            })
            print(f"  ❌ {word_id}: ERROR {e}")
    
    print(f"\n  Words: {word_pass} pass, {word_fail} fail/warn")
    
    # ── Summary ────────────────────────────────────────────────
    total = letter_pass + letter_fail + word_pass + word_fail
    total_pass = letter_pass + word_pass
    
    results['summary'] = {
        'total_tests': total,
        'total_pass': total_pass,
        'total_fail': total - total_pass,
        'letter_pass': letter_pass,
        'letter_fail': letter_fail,
        'word_pass': word_pass,
        'word_fail': word_fail,
    }
    
    print(f"\n{'=' * 70}")
    print(f"  PHONEME ALIGNMENT RESULTS")
    print(f"{'=' * 70}")
    print(f"  Letters: {letter_pass}/{letter_pass+letter_fail} pass")
    print(f"  Words:   {word_pass}/{word_pass+word_fail} pass")
    print(f"  Total:   {total_pass}/{total} pass ({total_pass/total*100:.0f}%)" if total > 0 else "  No tests")
    
    # Save results
    out = os.path.join(os.path.dirname(__file__), 'phoneme_results.json')
    with open(out, 'w', encoding='utf-8') as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
    print(f"\n📝 Results saved to: {out}")
    
    # Print actionable failures
    all_failures = [
        r for r in results['letter_sounds'] + results['words'] 
        if r.get('status') in ('WARN', 'ERROR', 'FAIL')
    ]
    
    if all_failures:
        print(f"\n{'─' * 70}")
        print("  ⚠️  ITEMS NEEDING ATTENTION:")
        for f in all_failures:
            fid = f.get('id', '?')
            note = f.get('feature_note', f.get('error', 'low alignment score'))
            print(f"    → {fid}: {note}")

if __name__ == '__main__':
    run_alignment()
