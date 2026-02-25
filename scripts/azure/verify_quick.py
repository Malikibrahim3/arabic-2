#!/usr/bin/env python3
"""Quick spot check: test just 10 letter sounds + 5 words via Azure STT."""
import os, json, re, time, http.client, subprocess

AZURE_SPEECH_KEY = 'YOUR_AZURE_KEY'
AZURE_REGION = 'uksouth'
AUDIO_DIR = os.path.join(os.path.dirname(__file__), '..', 'public', 'audio')
DIACRITICS_RE = re.compile(r'[\u064B-\u065F\u0670]')

def strip(t): return DIACRITICS_RE.sub('', t)
def norm(t):
    t = t.strip().replace('إ','ا').replace('أ','ا').replace('آ','ا')
    return t.replace('ة','ه').replace('ى','ي')

def sim(a, b):
    a2, b2 = strip(norm(a)), strip(norm(b))
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
    subprocess.run(['ffmpeg','-y','-i',p,'-ar','16000','-ac','1','-sample_fmt','s16',w],capture_output=True,check=True)
    return w

def stt(wav):
    with open(wav,'rb') as f: data=f.read()
    conn = http.client.HTTPSConnection(f'{AZURE_REGION}.stt.speech.microsoft.com')
    conn.request('POST','/speech/recognition/conversation/cognitiveservices/v1?language=ar-SA',
        body=data, headers={
            'Ocp-Apim-Subscription-Key': AZURE_SPEECH_KEY,
            'Content-Type': 'audio/wav; codecs=audio/pcm; samplerate=16000',
            'Accept': 'application/json'})
    r = conn.getresponse()
    body = r.read().decode()
    conn.close()
    if r.status != 200: return f'HTTP_{r.status}'
    d = json.loads(body)
    if d.get('RecognitionStatus')=='Success': return d.get('DisplayText','').strip().rstrip('.')
    return f'[{d.get("RecognitionStatus","?")}]'

# Test the previously-failing letters + words
tests = [
    ('letters/letter_alif_fatha.mp3', 'أَ'),
    ('letters/letter_baa_fatha.mp3', 'بَا'),
    ('letters/letter_thaa_fatha.mp3', 'ثَا'),
    ('letters/letter_jeem_fatha.mp3', 'جَا'),
    ('letters/letter_daal_fatha.mp3', 'دَا'),
    ('letters/letter_haa2_fatha.mp3', 'هَا'),
    ('letters/letter_seen_fatha.mp3', 'سَا'),
    ('letters/letter_noon_fatha.mp3', 'نَا'),
    ('letters/letter_yaa_fatha.mp3', 'يَا'),
    ('letters/letter_qaaf_fatha.mp3', 'قَا'),
    ('words/word_walad.mp3', 'وَلَد'),
    ('words/word_ab.mp3', 'أَبٌ'),
    ('words/word_umm.mp3', 'أُمٌّ'),
    ('words/fam_father.mp3', 'أَبٌ'),
    ('words/body_mouth.mp3', 'فَمٌ'),
]

print("🔍 QUICK VERIFICATION — Azure STT\n")
passed = 0
for i, (fpath, expected) in enumerate(tests):
    full = os.path.join(AUDIO_DIR, fpath)
    if not os.path.exists(full):
        print(f"  ⚠️  Missing: {fpath}")
        continue
    wav = mp3_to_wav(full)
    got = stt(wav)
    try: os.remove(wav)
    except: pass
    s = sim(got, expected)
    icon = '✅' if s >= 0.60 else '❌'
    if s >= 0.60: passed += 1
    print(f"  {icon} {fpath}: expected=\"{expected}\" got=\"{got}\" sim={s:.2f}")
    time.sleep(3)

print(f"\n📊 Passed: {passed}/{len(tests)}")
