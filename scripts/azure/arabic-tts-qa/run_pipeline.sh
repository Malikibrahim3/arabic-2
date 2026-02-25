#!/usr/bin/env bash
# Arabic TTS QA Pipeline Runner
# Formalizes the working 4-layer architecture.

echo "============================================="
echo "   ARABIC TTS QA HARNESS"
echo "   ---------------------"
echo "   1. Whisper Transcript Match"
echo "   2. WhisperX Phoneme Alignment"
echo "   3. Vowel & Shadda Duration"
echo "   4. Emphatic Preservation"
echo "============================================="

# 1. Corpus Generation (Letters, Syllables, Verbs, Nouns)
python3 generate_corpus.py

# 2. Audio Generation (Azure Phonetic Spelling)
# Note: Failsafe Azure phoneme alternative logic since IPA is ignored.
npx tsx generate_audio.ts

# 3. Audio Validation (Whisper + WhisperX checks)
python3 validate_audio.py

echo "Done. Detailed reports in reports/latest_run.json"
