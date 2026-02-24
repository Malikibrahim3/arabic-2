#!/usr/bin/env python3
# Script to add new sentences to UNIT6_SENTENCES

import re

# Read the file
with open('src/data/course.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# New sentences to add
new_sentences = """    },
    {
        arabic: 'مَا اسْمُكَ',
        english: 'What is your name?',
        audio: '/audio/sentences/sent_ma_ismuka.mp3',
        words: ['مَا', 'اسْمُكَ']
    },
    {
        arabic: 'أَيْنَ تَسْكُنُ',
        english: 'Where do you live?',
        audio: '/audio/sentences/sent_ayna_taskun.mp3',
        words: ['أَيْنَ', 'تَسْكُنُ']
    },
    {
        arabic: 'كَمْ عُمْرُكَ',
        english: 'How old are you?',
        audio: '/audio/sentences/sent_kam_umruk.mp3',
        words: ['كَمْ', 'عُمْرُكَ']
    },
    {
        arabic: 'مَاذَا تَعْمَلُ',
        english: 'What do you do?',
        audio: '/audio/sentences/sent_madha_tamal.mp3',
        words: ['مَاذَا', 'تَعْمَلُ']
    },
    {
        arabic: 'هَلْ تَتَكَلَّمُ العَرَبِيَّةَ',
        english: 'Do you speak Arabic?',
        audio: '/audio/sentences/sent_hal_tatakallam.mp3',
        words: ['هَلْ', 'تَتَكَلَّمُ', 'العَرَبِيَّةَ']
    },
    {
        arabic: 'لَا أَفْهَمُ',
        english: 'I do not understand',
        audio: '/audio/sentences/sent_la_afham.mp3',
        words: ['لَا', 'أَفْهَمُ']
    },
    {
        arabic: 'لَيْسَ عِنْدِي',
        english: 'I do not have',
        audio: '/audio/sentences/sent_laysa_indi.mp3',
        words: ['لَيْسَ', 'عِنْدِي']
    },
    {
        arabic: 'لَمْ أَذْهَبْ',
        english: 'I did not go',
        audio: '/audio/sentences/sent_lam_adhhab.mp3',
        words: ['لَمْ', 'أَذْهَبْ']
    },
    {
        arabic: 'لَا أَعْرِفُ',
        english: 'I do not know',
        audio: '/audio/sentences/sent_la_arif.mp3',
        words: ['لَا', 'أَعْرِفُ']
    },
    {
        arabic: 'لَيْسَ هُنَا',
        english: 'It is not here',
        audio: '/audio/sentences/sent_laysa_huna.mp3',
        words: ['لَيْسَ', 'هُنَا']
    },
    {
        arabic: 'تَعَالَ هُنَا',
        english: 'Come here',
        audio: '/audio/sentences/sent_taal_huna.mp3',
        words: ['تَعَالَ', 'هُنَا']
    },
    {
        arabic: 'اِجْلِسْ',
        english: 'Sit down',
        audio: '/audio/sentences/sent_ijlis.mp3',
        words: ['اِجْلِسْ']
    },
    {
        arabic: 'اِنْتَظِرْ',
        english: 'Wait',
        audio: '/audio/sentences/sent_intadhir.mp3',
        words: ['اِنْتَظِرْ']
    },
    {
        arabic: 'اِذْهَبْ',
        english: 'Go',
        audio: '/audio/sentences/sent_idhhab.mp3',
        words: ['اِذْهَبْ']
    },
    {
        arabic: 'اِسْمَعْ',
        english: 'Listen',
        audio: '/audio/sentences/sent_isma.mp3',
        words: ['اِسْمَعْ']
    },
    {
        arabic: 'الطَّقْسُ جَمِيلٌ',
        english: 'The weather is beautiful',
        audio: '/audio/sentences/sent_taqs_jamil.mp3',
        words: ['الطَّقْسُ', 'جَمِيلٌ']
    },
    {
        arabic: 'الكِتَابُ كَبِيرٌ',
        english: 'The book is big',
        audio: '/audio/sentences/sent_kitab_kabir.mp3',
        words: ['الكِتَابُ', 'كَبِيرٌ']
    },
    {
        arabic: 'البَيْتُ نَظِيفٌ',
        english: 'The house is clean',
        audio: '/audio/sentences/sent_bayt_nadhif.mp3',
        words: ['البَيْتُ', 'نَظِيفٌ']
    },
    {
        arabic: 'الطَّعَامُ لَذِيذٌ',
        english: 'The food is delicious',
        audio: '/audio/sentences/sent_taam_ladhidh.mp3',
        words: ['الطَّعَامُ', 'لَذِيذٌ']
    },
    {
        arabic: 'المَدْرَسَةُ قَرِيبَةٌ',
        english: 'The school is near',
        audio: '/audio/sentences/sent_madrasa_qariba.mp3',
        words: ['المَدْرَسَةُ', 'قَرِيبَةٌ']
    }
];"""

# Find the pattern and replace
pattern = r"(        words: \['أَنا', 'أُحِبُّ', 'العَرَبيّة'\]\s*\}\s*\]\;)"
replacement = new_sentences

content = re.sub(pattern, replacement, content)

# Write back
with open('src/data/course.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Added 20 new sentences to UNIT6_SENTENCES")
