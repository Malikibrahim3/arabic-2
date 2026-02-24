#!/bin/bash

# Tanwīn Audio Verification Script
# This script helps you systematically check each audio file for tanwīn pronunciation

echo "==================================="
echo "Tanwīn Audio Verification Checklist"
echo "==================================="
echo ""
echo "Listen to each audio file and mark if it ends with tanwīn (-un, -an, -in)"
echo ""

# UNIT 3 Words
echo "### UNIT 3 WORDS ###"
echo ""

words=(
  "word_bab.mp3:باب:Baab:Door"
  "word_bayt.mp3:بيت:Bayt:House"
  "word_bint.mp3:بنت:Bint:Girl"
  "word_tamr.mp3:تمر:Tamr:Dates"
  "word_kalb.mp3:كلب:Kalb:Dog"
  "word_shams.mp3:شمس:Shams:Sun"
  "word_qamar.mp3:قمر:Qamar:Moon"
  "word_maa.mp3:ماء:Maa:Water"
  "word_walad.mp3:ولد:Walad:Boy"
  "word_rajul.mp3:رجل:Rajul:Man [REPORTED ISSUE]"
  "word_kitab.mp3:كتاب:Kitaab:Book"
  "word_khubz.mp3:خبز:Khubz:Bread"
  "word_ayn.mp3:عين:Ayn:Eye"
  "word_wajh.mp3:وجه:Wajh:Face"
  "word_raas.mp3:رأس:Raas:Head"
  "word_fam.mp3:فم:Fam:Mouth"
  "word_yad.mp3:يد:Yad:Hand"
  "word_kabeer.mp3:كبير:Kabeer:Big"
  "word_sagheer.mp3:صغير:Sagheer:Small"
  "word_jadeed.mp3:جديد:Jadeed:New"
  "word_qadeem.mp3:قديم:Qadeem:Old"
  "word_jameel.mp3:جميل:Jameel:Beautiful"
)

for word in "${words[@]}"; do
  IFS=':' read -r file arabic translit english <<< "$word"
  echo "---"
  echo "File: public/audio/words/$file"
  echo "Current text: $arabic"
  echo "Transliteration: $translit"
  echo "Meaning: $english"
  echo ""
  echo "Does the audio pronounce tanwīn? (y/n)"
  read -p "> " answer
  
  if [ "$answer" = "y" ] || [ "$answer" = "Y" ]; then
    echo "⚠️  MISMATCH: Audio has tanwīn but text doesn't"
    echo "   ACTION: Add tanwīn to text or re-record audio"
  else
    echo "✅ MATCH: No tanwīn in audio or text"
  fi
  echo ""
done

echo ""
echo "### UNIT 4 WORDS ###"
echo ""

unit4_words=(
  "fam_father.mp3:أب:Ab:Father"
  "fam_mother.mp3:أم:Umm:Mother"
  "fam_brother.mp3:أخ:Akh:Brother"
  "fam_sister.mp3:أخت:Ukht:Sister"
  "food_apple.mp3:تفاح:Tuffah:Apple"
  "drink_milk.mp3:حليب:Haleeb:Milk"
  "place_school.mp3:مدرسة:Madrasa:School"
  "place_mosque.mp3:مسجد:Masjid:Mosque"
  "place_hospital.mp3:مستشفى:Mustashfa:Hospital"
  "place_market.mp3:سوق:Suq:Market"
)

for word in "${unit4_words[@]}"; do
  IFS=':' read -r file arabic translit english <<< "$word"
  echo "---"
  echo "File: public/audio/words/$file"
  echo "Current text: $arabic"
  echo "Transliteration: $translit"
  echo "Meaning: $english"
  echo ""
  echo "Does the audio pronounce tanwīn? (y/n)"
  read -p "> " answer
  
  if [ "$answer" = "y" ] || [ "$answer" = "Y" ]; then
    echo "⚠️  MISMATCH: Audio has tanwīn but text doesn't"
    echo "   ACTION: Add tanwīn to text or re-record audio"
  else
    echo "✅ MATCH: No tanwīn in audio or text"
  fi
  echo ""
done

echo ""
echo "==================================="
echo "Verification Complete!"
echo "==================================="
echo ""
echo "Review TANWIN-AUDIT.md for detailed findings and recommended fixes."
