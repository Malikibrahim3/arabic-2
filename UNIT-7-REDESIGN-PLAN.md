# 🎯 UNIT 7 REDESIGN PLAN

## Current Problems
1. Conversations use vocabulary NOT taught in Units 1-6
2. Audio files are mismatched (wrong audio for displayed text)
3. Conversations feel short and disconnected (3 words)
4. Uses complex grammar and words students haven't learned

## What Unit 6 Teaches
Students know these 10 sentences by the end of Unit 6:
1. اَلسَّلامُ عَلَيْكُم (Peace be upon you)
2. بِسْمِ اللّهِ (In the name of Allah)
3. كَيْفَ حَالُكَ (How are you?)
4. أَنَا بِخَيْرٍ (I am fine)
5. اِسمي (My name is...)
6. هَذَا كِتَابٌ (This is a book)
7. هَذِهِ مَدْرَسَةٌ (This is a school)
8. مَعَ السَّلامَةِ (Goodbye)
9. صَبَاحُ الخَيْرِ (Good morning)
10. أَنا أُحِبُّ العَرَبيّة (I love Arabic)

Plus vocabulary from Units 1-5:
- Letters and sounds
- Basic words: بَاب (door), بَيْت (house), كَلْب (dog), etc.
- Family: أَب (father), أُمّ (mother), أَخ (brother), أُخْت (sister)
- Numbers, colors, body parts

## New Unit 7 Design

### Philosophy
Unit 7 should be **conversation practice** using ONLY what students already know. It's about:
- Combining learned sentences into natural dialogues
- Understanding context and flow
- Building confidence in real-world scenarios
- NO new vocabulary or grammar

### Proposed Conversations

#### Conversation 1: "Meeting a Friend" (4 lines)
```
أَحْمَد: اَلسَّلامُ عَلَيْكُم
فَاطِمَة: وَعَلَيْكُمُ السَّلامُ
أَحْمَد: كَيْفَ حَالُكِ؟
فَاطِمَة: أَنَا بِخَيْرٍ
```
Uses: Sentences 1, 3, 4 from Unit 6

#### Conversation 2: "Good Morning" (4 lines)
```
عَلِي: صَبَاحُ الخَيْرِ
مَرْيَم: صَبَاحُ الخَيْرِ
عَلِي: كَيْفَ حَالُكِ؟
مَرْيَم: أَنَا بِخَيْرٍ
```
Uses: Sentences 9, 3, 4 from Unit 6

#### Conversation 3: "At School" (4 lines)
```
طَالِب: هَذِهِ مَدْرَسَةٌ
مُعَلِّم: نَعَمْ، هَذِهِ مَدْرَسَةٌ
طَالِب: أَنا أُحِبُّ العَرَبيّة
مُعَلِّم: جَيِّد!
```
Uses: Sentence 7, 10 from Unit 6 + simple affirmation

#### Conversation 4: "Saying Goodbye" (4 lines)
```
يُوسُف: مَعَ السَّلامَةِ
لَيْلَى: مَعَ السَّلامَةِ
يُوسُف: إِلَى اللِّقَاء
لَيْلَى: إِلَى اللِّقَاء
```
Uses: Sentence 8 from Unit 6 + simple goodbye phrase

#### Conversation 5: "Showing Something" (4 lines)
```
خَالِد: هَذَا كِتَابٌ
سَارَة: كِتَابٌ جَمِيلٌ
خَالِد: شُكْرًا
سَارَة: عَفْوًا
```
Uses: Sentence 6 from Unit 6 + simple words

#### Conversation 6: "Starting with Bismillah" (4 lines)
```
أُسْتَاذ: بِسْمِ اللّهِ
طُلَّاب: بِسْمِ اللّهِ
أُسْتَاذ: اَلسَّلامُ عَلَيْكُم
طُلَّاب: وَعَلَيْكُمُ السَّلامُ
```
Uses: Sentences 2, 1 from Unit 6

## Implementation Strategy

### Step 1: Generate Audio Files
Create audio for each unique line:
- Use Google TTS via the generation script
- Each conversation line gets its own audio file
- Name pattern: `conv1_line1.mp3`, `conv1_line2.mp3`, etc.

### Step 2: Update Course Data
- Replace current UNIT7_CONVERSATIONS with simpler ones
- Use only vocabulary from Units 1-6
- Ensure each line has correct audio reference

### Step 3: Exercise Types
For each conversation:
1. **Introduction** - Show full conversation with context
2. **Line-by-line** - Present each line with audio
3. **Comprehension** - "Who says this?"
4. **Translation** - "What does this mean?"
5. **Assembly** - Build the conversation lines
6. **Role Play** - Match speaker to line

### Step 4: Audio Generation Script
Add to `generate-audio-free.mjs`:
```javascript
const UNIT7_CONVERSATIONS = [
    { id: 'conv1_line1', text: 'اَلسَّلامُ عَلَيْكُم' },
    { id: 'conv1_line2', text: 'وَعَلَيْكُمُ السَّلامُ' },
    { id: 'conv1_line3', text: 'كَيْفَ حَالُكِ؟' },
    { id: 'conv1_line4', text: 'أَنَا بِخَيْرٍ' },
    // ... etc for all conversations
];
```

## Benefits of This Approach

1. ✅ **No new vocabulary** - Students use what they know
2. ✅ **Correct audio** - Each line has matching audio
3. ✅ **Natural progression** - Builds on Unit 6
4. ✅ **Confidence building** - Success with known material
5. ✅ **Real conversations** - Feels like actual dialogue
6. ✅ **Longer practice** - 6 conversations × 4 lines = 24 lines
7. ✅ **Contextual learning** - See how sentences work together

## Timeline

1. **Generate audio** - 30 minutes (automated script)
2. **Update course data** - 45 minutes (rewrite conversations)
3. **Test in app** - 15 minutes (verify audio plays correctly)
4. **Total:** ~90 minutes

## Next Steps

1. Approve this design approach
2. Generate all conversation audio files
3. Update UNIT7_CONVERSATIONS in course.ts
4. Test and verify
5. Push to production

---

**Status:** Awaiting approval to proceed
**Estimated completion:** 90 minutes after approval
