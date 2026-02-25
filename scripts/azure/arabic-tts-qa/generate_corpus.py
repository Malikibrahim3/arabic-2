#!/usr/bin/env python3
"""
Corpus Generator
----------------
Generates lists of Arabic test items:
letters, isolated syllables, long vowels, 
emphatic minimal pairs, words, and sentences.
"""

import json
import os

CORPUS = {
    'letters': [
        {'letter': 'ا', 'pseudo': 'بَا'},
        {'letter': 'ب', 'pseudo': 'بَا'},
        {'letter': 'ت', 'pseudo': 'تَا'},
        {'letter': 'ث', 'pseudo': 'ثَاب'},
        {'letter': 'ج', 'pseudo': 'جَا'},
        {'letter': 'ح', 'pseudo': 'حَا'},
        {'letter': 'خ', 'pseudo': 'خَا'},
        {'letter': 'د', 'pseudo': 'دَا'},
        {'letter': 'ذ', 'pseudo': 'ذَاب'},
        {'letter': 'ر', 'pseudo': 'رَا'},
        {'letter': 'ز', 'pseudo': 'زَا'},
        {'letter': 'س', 'pseudo': 'سَا'},
        {'letter': 'ش', 'pseudo': 'شَا'},
        {'letter': 'ص', 'pseudo': 'صَا'},
        {'letter': 'ض', 'pseudo': 'ضَا'},
        {'letter': 'ط', 'pseudo': 'طَا'},
        {'letter': 'ظ', 'pseudo': 'ظَاب'},
        {'letter': 'ع', 'pseudo': 'عَا'},
        {'letter': 'غ', 'pseudo': 'غَا'},
        {'letter': 'ف', 'pseudo': 'فَا'},
        {'letter': 'ق', 'pseudo': 'قَا'},
        {'letter': 'ك', 'pseudo': 'كَا'},
        {'letter': 'ل', 'pseudo': 'لَا'},
        {'letter': 'م', 'pseudo': 'مَا'},
        {'letter': 'ن', 'pseudo': 'نَا'},
        {'letter': 'ه', 'pseudo': 'هَا'},
        {'letter': 'و', 'pseudo': 'وَا'},
        {'letter': 'ي', 'pseudo': 'يَا'}
    ],
    'vowels': ['بَ', 'بَا', 'بِ', 'بِي', 'بُ', 'بُو'],
    'emphatic_pairs': ['س/ص', 'د/ض', 'ت/ط', 'ذ/ظ'],
    'shadda_tests': ['بَتَ', 'بَتَّ', 'عَلَم', 'عَلَّم'],
    'words': ['خُبْز', 'قِطَّةٌ', 'قَمَرٌ', 'شَمْس', 'ماء'],
    'sentences': ['اَلسَّلامُ عَلَيكُم', 'أَنَا أُحِبُّ العَرَبيّة']
}

def main():
    print("Generating Master QA Corpus...")
    corpus_file = os.path.join(os.path.dirname(__file__), 'corpus.json')
    with open(corpus_file, 'w', encoding='utf-8') as f:
        json.dump(CORPUS, f, ensure_ascii=False, indent=2)
    print(f"✅ Created {len(CORPUS['letters'])} letters, {len(CORPUS['words'])} words.")
    print(f"Saved to {corpus_file}")

if __name__ == '__main__':
    main()
