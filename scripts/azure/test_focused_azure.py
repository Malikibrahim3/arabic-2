#!/usr/bin/env python3
"""
Focused Arabic Letter/Word Pronunciation Test using Azure STT.
Tests ONLY letters (56) and a sample of words (50) with proper rate limiting.
"""
import os, sys, json, re, time, http.client, subprocess

AZURE_SPEECH_KEY = 'YOUR_AZURE_KEY'
AZURE_REGION = 'uksouth'
AUDIO_DIR = os.path.join(os.path.dirname(__file__), '..', 'public', 'audio')
RATE_LIMIT_DELAY = 3  # seconds between API calls

DIACRITICS_RE = re.compile(r'[\u064B-\u065F\u0670]')

def strip_diacritics(t): return DIACRITICS_RE.sub('', t)
def normalize(t):
    t = t.strip().replace('إ','ا').replace('أ','ا').replace('آ','ا')
    return t.replace('ة','ه').replace('ى','ي')

def sim(a, b):
    a2, b2 = strip_diacritics(normalize(a)), strip_diacritics(normalize(b))
    if not a2 and not b2: return 1.0
    if not a2 or not b2: return 0.0
    m, n = len(a2), len(b2)
    dp = [[0]*(n+1) for _ in range(m+1)]
    for i in range(m+1): dp[i][0] = i
    for j in range(n+1): dp[0][j] = j
    for i in range(1,m+1):
        for j in range(1,n+1):
            c = 0 if a2[i-1]==b2[j-1] else 1
            dp[i][j] = min(dp[i-1][j]+1, dp[i][j-1]+1, dp[i-1][j-1]+c)
    return 1.0 - dp[m][n]/max(m,n)

def mp3_to_wav(p):
    w = p.replace('.mp3','.wav')
    subprocess.run(['ffmpeg','-y','-i',p,'-ar','16000','-ac','1','-sample_fmt','s16',w],
                   capture_output=True, check=True)
    return w

def azure_stt(wav_path, retries=3):
    for attempt in range(retries):
        try:
            with open(wav_path, 'rb') as f:
                data = f.read()
            conn = http.client.HTTPSConnection(f'{AZURE_REGION}.stt.speech.microsoft.com')
            headers = {
                'Ocp-Apim-Subscription-Key': AZURE_SPEECH_KEY,
                'Content-Type': 'audio/wav; codecs=audio/pcm; samplerate=16000',
                'Accept': 'application/json'
            }
            conn.request('POST','/speech/recognition/conversation/cognitiveservices/v1?language=ar-SA',
                         body=data, headers=headers)
            resp = conn.getresponse()
            body = resp.read().decode('utf-8')
            conn.close()
            
            if resp.status == 401 or resp.status == 429:
                wait = (attempt + 1) * 10
                print(f"    ⏳ Rate limited ({resp.status}), waiting {wait}s...")
                time.sleep(wait)
                continue
            if resp.status != 200:
                return f'HTTP_{resp.status}'
            
            result = json.loads(body)
            if result.get('RecognitionStatus') == 'Success':
                return result.get('DisplayText', '').strip().rstrip('.')
            elif result.get('RecognitionStatus') == 'NoMatch':
                return '[SILENCE]'
            else:
                return f'[{result.get("RecognitionStatus")}]'
        except Exception as e:
            if attempt < retries - 1:
                time.sleep(5)
            else:
                return f'ERROR:{e}'
    return 'MAX_RETRIES'

# ── Test definitions ─────────────────────────────────────────
TESTS = []

# All 28 letter sounds (with fatha)
LETTER_SOUNDS = [
    ('letter_alif_fatha','أَ'),('letter_baa_fatha','بَ'),('letter_taa_fatha','تَ'),
    ('letter_thaa_fatha','ثَ'),('letter_jeem_fatha','جَ'),('letter_haa_fatha','حَ'),
    ('letter_khaa_fatha','خَ'),('letter_daal_fatha','دَ'),('letter_dhaal_fatha','ذَ'),
    ('letter_raa_fatha','رَ'),('letter_zaay_fatha','زَ'),('letter_seen_fatha','سَ'),
    ('letter_sheen_fatha','شَ'),('letter_saad_fatha','صَ'),('letter_daad_fatha','ضَ'),
    ('letter_taa2_fatha','طَ'),('letter_dhaa2_fatha','ظَ'),('letter_ayn_fatha','عَ'),
    ('letter_ghayn_fatha','غَ'),('letter_faa_fatha','فَ'),('letter_qaaf_fatha','قَ'),
    ('letter_kaaf_fatha','كَ'),('letter_laam_fatha','لَ'),('letter_meem_fatha','مَ'),
    ('letter_noon_fatha','نَ'),('letter_haa2_fatha','هَ'),('letter_waaw_fatha','وَ'),
    ('letter_yaa_fatha','يَ'),
]

# All 28 letter names
LETTER_NAMES = [
    ('letter_alif_name','ألف'),('letter_baa_name','باء'),('letter_taa_name','تاء'),
    ('letter_thaa_name','ثاء'),('letter_jeem_name','جيم'),('letter_haa_name','حاء'),
    ('letter_khaa_name','خاء'),('letter_daal_name','دال'),('letter_dhaal_name','ذال'),
    ('letter_raa_name','راء'),('letter_zaay_name','زاي'),('letter_seen_name','سين'),
    ('letter_sheen_name','شين'),('letter_saad_name','صاد'),('letter_daad_name','ضاد'),
    ('letter_taa2_name','طاء'),('letter_dhaa2_name','ظاء'),('letter_ayn_name','عين'),
    ('letter_ghayn_name','غين'),('letter_faa_name','فاء'),('letter_qaaf_name','قاف'),
    ('letter_kaaf_name','كاف'),('letter_laam_name','لام'),('letter_meem_name','ميم'),
    ('letter_noon_name','نون'),('letter_haa2_name','هاء'),('letter_waaw_name','واو'),
    ('letter_yaa_name','ياء'),
]

# Key words to test
KEY_WORDS = [
    ('word_bab','باب'),('word_bayt','بَيت'),('word_kitab','كِتاب'),('word_qalam','قَلَم'),
    ('word_walad','وَلَد'),('word_bint','بِنت'),('word_rajul','رَجُل'),('word_shams','شَمس'),
    ('word_qamar','قَمَر'),('word_maa','ماء'),('word_khubz','خُبز'),('word_samak','سَمَك'),
    ('word_tuffah','تُفّاح'),('word_salam','سَلام'),('word_shukran','شُكرًا'),
    ('word_afwan','عَفوًا'),('word_naam','نَعَم'),('word_laa','لا'),
    ('word_ab','أَب'),('word_umm','أُمّ'),('word_akh','أَخ'),('word_ukht','أُخت'),
    ('word_ibn','اِبن'),('word_kalb','كَلب'),('word_qitt','قِطّ'),
    ('fam_father','أَبٌ'),('fam_mother','أُمٌّ'),('fam_brother','أَخٌ'),('fam_sister','أُخْتٌ'),
    ('food_apple','تُفَّاحٌ'),('drink_milk','حَلِيبٌ'),
    ('place_school','مَدْرَسَةٌ'),('place_mosque','مَسْجِدٌ'),('place_hospital','مُسْتَشْفَى'),
    ('verb_went','ذَهَبَ'),('verb_came','جَاءَ'),('verb_ate','أَكَلَ'),('verb_wrote','كَتَبَ'),
    ('adj_beautiful','جَمِيلٌ'),('adj_tall','طَوِيلٌ'),('adj_fast','سَرِيعٌ'),
    ('body_ear','أُذُنٌ'),('body_nose','أَنْفٌ'),('body_mouth','فَمٌ'),
    ('color_red','أَحْمَرُ'),('color_blue','أَزْرَقُ'),('color_green','أَخْضَرُ'),
    ('expr_yes','نَعَمْ'),('expr_no','لَا'),('expr_please','مِنْ فَضْلِكَ'),('expr_thanks','شُكْرًا'),
]

# Sentences
KEY_SENTENCES = [
    ('sent_salam','اَلسَّلامُ عَلَيكُم'),('sent_ismi','اِسْمِي'),
    ('sent_ana_uhibb','أَنَا أُحِبُّ العَرَبيّة'),('sent_hadha_kitab','هذا كِتاب'),
    ('sent_hadhihi_madrasah','هذِهِ مَدرَسة'),('sent_sabah_alkhayr','صَباحُ الخَير'),
    ('sent_ma_ismuka','مَا اسْمُكَ'),('sent_ayna_taskun','أَيْنَ تَسْكُنُ'),
]

def build_tests():
    for lid, exp in LETTER_SOUNDS:
        p = os.path.join(AUDIO_DIR,'letters',f'{lid}.mp3')
        if os.path.exists(p): TESTS.append((p, lid, exp, 'letter_sound'))
    for lid, exp in LETTER_NAMES:
        p = os.path.join(AUDIO_DIR,'letters',f'{lid}.mp3')
        if os.path.exists(p): TESTS.append((p, lid, exp, 'letter_name'))
    for wid, exp in KEY_WORDS:
        p = os.path.join(AUDIO_DIR,'words',f'{wid}.mp3')
        if os.path.exists(p): TESTS.append((p, wid, exp, 'word'))
    for sid, exp in KEY_SENTENCES:
        p = os.path.join(AUDIO_DIR,'sentences',f'{sid}.mp3')
        if os.path.exists(p): TESTS.append((p, sid, exp, 'sentence'))

def main():
    print("=" * 70)
    print("  FOCUSED ARABIC PRONUNCIATION TEST — Azure STT")
    print(f"  Rate limit: {RATE_LIMIT_DELAY}s between calls")
    print("=" * 70)
    
    build_tests()
    print(f"\n📋 Total tests: {len(TESTS)}")
    
    passed, failed = 0, 0
    failures = []
    
    for i, (path, tid, expected, cat) in enumerate(TESTS):
        try:
            wav = mp3_to_wav(path)
            transcript = azure_stt(wav)
            try: os.remove(wav)
            except: pass
        except Exception as e:
            transcript = f'ERROR:{e}'
        
        s = sim(transcript, expected)
        ok = s >= 0.60
        
        if ok:
            passed += 1
        else:
            failed += 1
            failures.append({'id':tid,'category':cat,'expected':expected,'got':transcript,'similarity':round(s,2)})
        
        icon = '✅' if ok else '❌'
        print(f"  {icon} [{i+1}/{len(TESTS)}] {tid}: \"{expected}\" → \"{transcript}\" ({s:.2f})")
        
        time.sleep(RATE_LIMIT_DELAY)
    
    print(f"\n{'='*70}")
    print(f"  ✅ Passed: {passed}/{len(TESTS)}  ({passed/len(TESTS)*100:.0f}%)")
    print(f"  ❌ Failed: {failed}/{len(TESTS)}")
    
    if failures:
        print(f"\n{'─'*70}")
        print("  FAILURES:")
        by_cat = {}
        for f in failures:
            by_cat.setdefault(f['category'],[]).append(f)
        for cat in ['letter_sound','letter_name','word','sentence']:
            if cat not in by_cat: continue
            print(f"\n  ── {cat.upper()} ({len(by_cat[cat])}) ──")
            for f in by_cat[cat]:
                print(f"    {f['id']}: expected=\"{f['expected']}\" got=\"{f['got']}\" sim={f['similarity']}")
    
    out = os.path.join(os.path.dirname(__file__),'azure_focused_results.json')
    with open(out,'w',encoding='utf-8') as f:
        json.dump({'total':len(TESTS),'passed':passed,'failed':failed,
                   'pass_rate':f'{passed/len(TESTS)*100:.1f}%','failures':failures},
                  f, ensure_ascii=False, indent=2)
    print(f"\n📝 Saved: {out}")

if __name__=='__main__':
    main()
