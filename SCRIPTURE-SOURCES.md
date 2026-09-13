# Scripture sources — 72-passage library

The game contains 72 distinct KJV passages: the six originals below and 66 additions documented, with exact source provenance, in [SCRIPTURE-ADDITIONAL-SOURCES.md](SCRIPTURE-ADDITIONAL-SOURCES.md). The original six IDs and order are preserved for saved progress. Each of the six game topics contains twelve passages.

## Original six passages

Verified on September 12, 2026 against Bible Gateway's King James Version (KJV) passage text. Each cited passage page identifies its KJV text as **Public Domain**. The game preserves the wording, capitalization, and punctuation shown in those passages. Themes such as “Strength” are game navigation labels, not part of Scripture.

| Game order | Passage | Theme | Verified text source |
| --- | --- | --- | --- |
| 1 | Ephesians 6:10 | Strength | [Bible Gateway — KJV](https://www.biblegateway.com/passage/?search=Ephesians%206%3A10&version=KJV) |
| 2 | James 4:7 | Resistance | [Bible Gateway — KJV](https://www.biblegateway.com/passage/?search=James%204%3A7&version=KJV) |
| 3 | 2 Timothy 1:7 | Courage | [Bible Gateway — KJV](https://www.biblegateway.com/passage/?search=2%20Timothy%201%3A7&version=KJV) |
| 4 | Psalm 119:11 | Remembrance | [Bible Gateway — KJV](https://www.biblegateway.com/passage/?search=Psalm%20119%3A11&version=KJV) |
| 5 | Romans 12:21 | Goodness | [Bible Gateway — KJV](https://www.biblegateway.com/passage/?search=Romans%2012%3A21&version=KJV) |
| 6 | 1 Corinthians 16:13 | Steadfastness | [Bible Gateway — KJV](https://www.biblegateway.com/passage/?search=1%20Corinthians%2016%3A13&version=KJV) |

The combined quotation dataset is `src/scripture.js`, which imports `src/scripture-additions.js`. Every verse contains contiguous fragments sized for reading during play; joining them with one space reconstructs the exact full verse. Each recall prompt replaces exactly one word with `____`. Substituting its answer restores the full verse. Incorrect multiple-choice options are answer choices, not alternative Bible quotations.

## Learning presentation

The design intent is Scripture familiarity through play, with the learning purpose visible to the player. A suitable introduction is “Run the race. Carry the Word.” followed by “Collect light, discover Scripture, and see what stays with you.” Label every verse with its reference and “KJV.”

Recommended loop: reveal a short fragment after three collected lights, repeat the current fragment long enough to read it, and reveal the full verse when all its fragments are collected. Keep a readable full-verse view available outside active play. At game over, offer a single-word recall prompt from a verse the player has seen, show the correct full text after their answer, and keep restart available without answering. Avoid flashing or concealed text.

Exposure, collected fragments, and a correct recognition answer do not establish memorization. Label progress as “verses discovered” or “fragments collected,” and keep recall counts separate. The implementation should not claim guaranteed memorization or suggest a collision reflects the player's faith.


## Variety and review

New runs rotate passages even when no fragments were collected. Long runs advance after 20 seconds of active play or four seconds after a completed passage. Saved partial fragments resume on a future encounter. Up to one in four selections reviews a previously missed recall; other selections prioritize unseen verses. Users may browse and choose any of the 72 passages directly. These are practice mechanics, not a memorization assessment.
