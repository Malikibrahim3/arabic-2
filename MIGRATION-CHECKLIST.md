# Azure Migration Checklist

Use this checklist to track your migration progress.

## Pre-Migration

- [ ] Read `AZURE-MIGRATION-SUMMARY.md`
- [ ] Have Supabase service key ready
- [ ] Backup existing audio (optional)
- [ ] Note current app state

## Installation

- [ ] Run `npm install`
- [ ] Verify Azure SDK installed: `npm list microsoft-cognitiveservices-speech-sdk`

## Testing

- [ ] Test Azure connection: `npm run audio:test`
- [ ] Verify test passes with ✅ SUCCESS message
- [ ] Review available voices list

## Migration

- [ ] Set Supabase key: `export SUPABASE_SERVICE_KEY=your_key`
- [ ] Run migration: `npm run migrate:azure`
- [ ] Wait for completion (~6-10 minutes)
- [ ] Verify no errors in output

## Verification

### File Generation
- [ ] Check `public/audio/letters/` has 56 MP3 files
- [ ] Check `public/audio/syllables/` has 81 MP3 files
- [ ] Check `public/audio/words/` has MP3 files
- [ ] Check `public/audio/sentences/` has MP3 files
- [ ] Verify `scripts/vocabulary.json` exists

### Supabase Upload
- [ ] Visit: https://vvtkrxbklgassyhghmqt.supabase.co/storage/v1/object/public/audio/letters/letter_alif_fatha.mp3
- [ ] Verify audio plays in browser
- [ ] Check a syllable URL
- [ ] Check a word URL

### App Testing
- [ ] Start dev server: `npm run dev`
- [ ] Open app in browser
- [ ] Navigate to Unit 1, Lesson 1
- [ ] Click audio button on first exercise
- [ ] Verify audio plays correctly
- [ ] Test 3-5 different exercises
- [ ] Check browser console for errors

### Comprehensive Testing
- [ ] Run: `npm run test:comprehensive`
- [ ] Verify all tests pass
- [ ] Review test report

## Post-Migration

- [ ] Document any issues encountered
- [ ] Note voice quality compared to Google TTS
- [ ] Test on mobile device (optional)
- [ ] Clean up local audio files (optional)
- [ ] Update team/documentation

## Cleanup (Optional)

- [ ] Delete local audio: `rm -rf public/audio/*/*.mp3`
- [ ] Remove old Google TTS script: `rm scripts/generate_audio.ts`
- [ ] Remove test files

## Rollback (If Needed)

- [ ] Reinstall Google TTS: `npm install @google-cloud/text-to-speech`
- [ ] Run old script: `ts-node scripts/generate_audio.ts`
- [ ] Upload to Supabase: `SUPABASE_SERVICE_KEY=key npm run audio:upload`

## Success Criteria

✅ All audio files generated without errors
✅ All files uploaded to Supabase successfully
✅ Audio plays correctly in the app
✅ No console errors during playback
✅ Tests pass
✅ Voice quality is acceptable

## Notes

Use this space to document any issues or observations:

```
Date: _______________
Issues encountered:


Solutions applied:


Voice quality notes:


Performance notes:


```

## Quick Commands Reference

```bash
# Test connection
npm run audio:test

# Full migration
SUPABASE_SERVICE_KEY=key npm run migrate:azure

# Individual steps
npm run audio:generate
npm run audio:extract
npm run audio:vocabulary
SUPABASE_SERVICE_KEY=key npm run audio:upload

# Clear and restart
SUPABASE_SERVICE_KEY=key npm run audio:clear

# Test app
npm run dev
npm run test:comprehensive
```

## Support

If you encounter issues:

1. Check error messages in terminal
2. Review `AZURE-MIGRATION-GUIDE.md`
3. Run `npm run audio:test` to verify Azure connection
4. Check Supabase dashboard for uploaded files
5. Review browser console for client-side errors

## Completion

Migration completed on: _______________

Completed by: _______________

Total time taken: _______________

Issues encountered: _______________

Overall success: ⭐⭐⭐⭐⭐ (rate 1-5)
