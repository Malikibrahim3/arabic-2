# Azure Migration Troubleshooting Guide

## Common Issues and Solutions

### Installation Issues

#### "Module not found: microsoft-cognitiveservices-speech-sdk"

**Problem**: Azure SDK not installed

**Solution**:
```bash
npm install microsoft-cognitiveservices-speech-sdk
```

#### "Cannot find module '@google-cloud/text-to-speech'"

**Problem**: Old dependency still referenced

**Solution**:
```bash
npm uninstall @google-cloud/text-to-speech
npm install
```

#### "npm ERR! code ENOENT"

**Problem**: package.json or node_modules corrupted

**Solution**:
```bash
rm -rf node_modules package-lock.json
npm install
```

---

### Azure Connection Issues

#### "Authentication failed" or "Invalid subscription key"

**Problem**: Azure credentials incorrect

**Solution**:
1. Verify key in script matches: `1D252Q6kJUTbATGMyJrtEEvEUnM78nQam2u8E6ghCfwamo4d7yUEuJQQJ99CBACmepeSXJ3w3AAAYACOGord`
2. Check region is `uksouth`
3. Test connection: `npm run audio:test`

#### "Connection timeout" or "Network error"

**Problem**: Network connectivity issue

**Solution**:
1. Check internet connection
2. Try again in a few minutes
3. Check if Azure service is down: https://status.azure.com/

#### "Voice not found: ar-SA-ZariyahNeural"

**Problem**: Voice name incorrect or not available in region

**Solution**:
1. Run `npm run audio:test` to list available voices
2. Choose alternative: `ar-SA-HamedNeural` (male)
3. Update `VOICE_NAME` in generation scripts

---

### Supabase Issues

#### "SUPABASE_SERVICE_KEY not set"

**Problem**: Environment variable missing

**Solution**:
```bash
export SUPABASE_SERVICE_KEY=your_service_role_key
```

Or add to `.env` file:
```
SUPABASE_SERVICE_KEY=your_service_role_key
```

#### "Bucket 'audio' not found"

**Problem**: Supabase bucket doesn't exist

**Solution**:
The upload script creates it automatically. If it fails:
1. Go to Supabase dashboard
2. Navigate to Storage
3. Create bucket named "audio"
4. Set as public
5. Run upload again

#### "Upload failed: 413 Payload Too Large"

**Problem**: File too large for Supabase

**Solution**:
1. Check MP3 file sizes: `ls -lh public/audio/letters/`
2. Files should be < 1MB each
3. If larger, adjust Azure speaking rate or quality

#### "Upload failed: 401 Unauthorized"

**Problem**: Wrong Supabase key or expired

**Solution**:
1. Verify you're using service_role key (not anon key)
2. Check key in Supabase dashboard → Settings → API
3. Update environment variable

---

### Audio Generation Issues

#### "Failed to generate audio for [text]"

**Problem**: Azure TTS failed for specific text

**Solution**:
1. Check if text contains invalid characters
2. Verify text is valid Arabic
3. Try generating manually:
```bash
ts-node -e "
import * as sdk from 'microsoft-cognitiveservices-speech-sdk';
const config = sdk.SpeechConfig.fromSubscription('key', 'uksouth');
// ... test generation
"
```

#### "Rate limit exceeded"

**Problem**: Too many requests to Azure

**Solution**:
1. Scripts include 100ms delays
2. Increase delay in scripts:
```typescript
await new Promise(r => setTimeout(r, 200)); // 200ms instead of 100ms
```

#### "Audio files are empty (0 bytes)"

**Problem**: Generation succeeded but no audio data

**Solution**:
1. Check Azure subscription is active
2. Verify speaking rate is valid (0.5 - 2.0)
3. Test with simple text: `npm run audio:test`

#### "Some files missing after generation"

**Problem**: Generation script crashed mid-way

**Solution**:
1. Check which files exist: `ls public/audio/letters/ | wc -l`
2. Re-run generation: `npm run audio:generate`
3. Script will skip existing files

---

### App Playback Issues

#### "Audio not playing in browser"

**Problem**: Files not accessible or CORS issue

**Solution**:
1. Check browser console for errors
2. Verify Supabase URL is accessible:
```bash
curl -I https://vvtkrxbklgassyhghmqt.supabase.co/storage/v1/object/public/audio/letters/letter_alif_fatha.mp3
```
3. Check Supabase bucket is public
4. Clear browser cache

#### "Audio plays but sounds wrong"

**Problem**: Wrong voice or corrupted file

**Solution**:
1. Download file and play locally
2. Check voice name in generation script
3. Regenerate specific file:
```bash
ts-node scripts/generate_audio_azure.ts
```

#### "Audio is too fast/slow"

**Problem**: Speaking rate or playback speed incorrect

**Solution**:
1. Adjust `SPEAKING_RATE` in generation scripts (default: 0.85)
2. Or adjust playback speed in AudioEngine.ts
3. Regenerate audio

#### "Fallback TTS is being used instead of MP3"

**Problem**: MP3 files not found or failed to load

**Solution**:
1. Check browser console for 404 errors
2. Verify files uploaded to Supabase
3. Check file naming matches AudioEngine mappings
4. Test URL directly in browser

---

### Script Execution Issues

#### "ts-node: command not found"

**Problem**: TypeScript execution not available

**Solution**:
```bash
npm install -g ts-node typescript
# Or use npx
npx ts-node scripts/generate_audio_azure.ts
```

#### "Cannot find module 'src/data/course.ts'"

**Problem**: Path resolution issue in extract script

**Solution**:
1. Verify course.ts exists: `ls src/data/course.ts`
2. Update import path in extract_vocabulary.ts
3. Use absolute path if needed

#### "Permission denied: ./scripts/migrate-to-azure.sh"

**Problem**: Script not executable

**Solution**:
```bash
chmod +x scripts/migrate-to-azure.sh
```

#### "Bash script fails on Windows"

**Problem**: Shell script not compatible with Windows

**Solution**:
Run steps manually:
```bash
npm install microsoft-cognitiveservices-speech-sdk
npm run audio:clear
npm run audio:generate
npm run audio:extract
npm run audio:vocabulary
npm run audio:upload
```

---

### Performance Issues

#### "Generation taking too long"

**Problem**: Network latency or rate limiting

**Solution**:
1. Check internet speed
2. Reduce delay between requests (risky):
```typescript
await new Promise(r => setTimeout(r, 50)); // Faster but may hit limits
```
3. Run during off-peak hours

#### "Upload taking too long"

**Problem**: Large files or slow connection

**Solution**:
1. Check file sizes: `du -sh public/audio/`
2. Compress if needed (not recommended for audio)
3. Upload in batches:
```bash
# Upload only letters first
ts-node scripts/upload_to_supabase.ts letters
```

---

### Testing Issues

#### "npm run audio:test fails"

**Problem**: Azure connection test failing

**Solution**:
1. Check error message carefully
2. Verify credentials in script
3. Test with curl:
```bash
curl -X POST "https://uksouth.tts.speech.microsoft.com/cognitiveservices/v1" \
  -H "Ocp-Apim-Subscription-Key: your_key" \
  -H "Content-Type: application/ssml+xml"
```

#### "Comprehensive tests fail after migration"

**Problem**: App not finding audio files

**Solution**:
1. Check test expectations match new file structure
2. Update test fixtures if needed
3. Verify Supabase URLs in tests

---

### Rollback Issues

#### "Want to revert to Google TTS"

**Solution**:
```bash
# 1. Reinstall Google TTS
npm install @google-cloud/text-to-speech
npm uninstall microsoft-cognitiveservices-speech-sdk

# 2. Set Google credentials
export GOOGLE_APPLICATION_CREDENTIALS=/path/to/credentials.json

# 3. Regenerate with Google
ts-node scripts/generate_audio.ts

# 4. Upload
SUPABASE_SERVICE_KEY=key npm run audio:upload
```

---

## Diagnostic Commands

### Check Installation
```bash
npm list microsoft-cognitiveservices-speech-sdk
npm list @supabase/supabase-js
```

### Check Generated Files
```bash
# Count files
ls public/audio/letters/ | wc -l      # Should be 56
ls public/audio/syllables/ | wc -l    # Should be 81

# Check file sizes
du -sh public/audio/letters/
du -sh public/audio/syllables/

# Find empty files
find public/audio -type f -size 0
```

### Check Supabase
```bash
# Test bucket access
curl -I https://vvtkrxbklgassyhghmqt.supabase.co/storage/v1/object/public/audio/letters/letter_alif_fatha.mp3

# Should return: HTTP/2 200
```

### Check Azure Connection
```bash
npm run audio:test
```

### Check Environment
```bash
echo $SUPABASE_SERVICE_KEY
node -v
npm -v
```

---

## Getting Help

### Before Asking for Help

1. ✅ Read error message carefully
2. ✅ Check this troubleshooting guide
3. ✅ Run diagnostic commands above
4. ✅ Check browser console for errors
5. ✅ Verify environment variables

### Information to Provide

When reporting issues, include:

```
1. Error message (full text)
2. Command that failed
3. Output of: npm list microsoft-cognitiveservices-speech-sdk
4. Output of: npm run audio:test
5. Operating system
6. Node version: node -v
7. Steps to reproduce
```

### Quick Fixes to Try First

```bash
# 1. Clean install
rm -rf node_modules package-lock.json
npm install

# 2. Test Azure
npm run audio:test

# 3. Clear and regenerate
SUPABASE_SERVICE_KEY=key npm run audio:clear
npm run audio:generate

# 4. Check files
ls -la public/audio/letters/

# 5. Test in browser
npm run dev
```

---

## Prevention Tips

### Before Migration
- ✅ Backup existing audio (optional)
- ✅ Test Azure connection first
- ✅ Have Supabase key ready
- ✅ Read documentation

### During Migration
- ✅ Don't interrupt the process
- ✅ Watch for errors in output
- ✅ Keep terminal window open
- ✅ Note any warnings

### After Migration
- ✅ Test thoroughly before deploying
- ✅ Keep old scripts as backup
- ✅ Document any issues
- ✅ Monitor audio quality

---

## Still Having Issues?

1. Check `AZURE-MIGRATION-GUIDE.md` for detailed info
2. Review `scripts/README.md` for script details
3. Check Azure status: https://status.azure.com/
4. Check Supabase status: https://status.supabase.com/

## Emergency Fallback

If nothing works, use browser TTS:

1. Comment out MP3 loading in AudioEngine.ts
2. App will use window.speechSynthesis
3. Quality lower but functional
4. Fix Azure issues later

```typescript
// In AudioEngine.ts
async function tryPlayMP3Path(...) {
    return false; // Force fallback to TTS
}
```
