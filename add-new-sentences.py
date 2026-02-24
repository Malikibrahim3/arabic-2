#!/usr/bin/env python3
"""Add 20 new sentences to UNIT6_SENTENCES"""

# Read the file
with open('src/data/course.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Find the position to insert (after the last sentence, before ];)
marker = "        words: ['أَنا', 'أُحِبُّ', 'العَرَبيّة']\n    }\n];"

if marker not in content:
    print("ERROR: Marker not found!")
    print("Looking for different pattern...")
    # Try alternative
    marker = "words: ['أَنا', 'أُحِبُّ', 'العَرَبيّة']\n    }\n];"
    if marker not in content:
        print("Still not found. Exiting.")
        exit(1)

new_sentences = """,
    // NEW SENTENCES - Questions (5)
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
    // NEW SENTENCES - Negations (5)
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
    // NEW SENTENCES - Commands (5)
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
    // NEW SENTENCES - Descriptions (5)
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

# Replace
new_content = content.replace(marker, new_sentences)

# Write back
with open('src/data/course.ts', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("✅ Added 20 new sentences to UNIT6_SENTENCES!")
print("Total sentences: 30")
