# Additional Scripture sources and verification

`src/scripture-additions.js` contains **66 complete, distinct KJV verses**. Together with the original six, the intended library has **72 verses**. The additional entries have a translation label, theme category, source link, contiguous reading fragments, and a one-word recall question.

## Exact edition and provenance

Text publisher: [eBible.org, King James Version](https://ebible.org/kjv/), courtesy of eBible.org and Crosswire Bible Society. The publisher identifies this edition as the **standardized text of 1769**. Its distribution includes the Apocrypha; this game's selections all come from the Old and New Testament books shared by the 66-book Protestant canon. Translation label in the interface: **KJV**.

The [publisher's rights and edition page](https://ebible.org/kjv/copyright.htm) labels the text **Public Domain**, describes the United Kingdom's printing rights qualification, and dates this source to **2026-08-19**. The source was retrieved and checked on **2026-09-12**.

Downloaded directly from the publisher:

| Source artifact | SHA-256 |
| --- | --- |
| [HTML archive](https://ebible.org/Scriptures/eng-kjv_html.zip) | `d08ea6360cb359b20fd13b0f17f71300c969c4e74a413836abbd189e005a88b7` |
| [Verse-per-line archive](https://ebible.org/Scriptures/eng-kjv_vpl.zip), containing `eng-kjv_vpl.xml` | `e47c3ae02c23d47ec8b39ccf306149065a427066ada16a60e3c2bf403b626ece` |

## Extraction and fidelity

Each verse was extracted from the HTML after its numbered verse marker and before the next verse marker or chapter navigation. HTML tags, verse numbers, footnote markers/popups, and the typographic paragraph sign were omitted. HTML character entities were decoded and whitespace collapsed to one space. Italicized KJV words and small-cap LORD text remain in the verse. No wording, spelling, or punctuation was modernized, generated, shortened, or paraphrased.

The source's Psalm superscriptions occur before the first numbered verse span, so they are not included in the numbered verse. The XML includes those headings in its first-verse record. The only three HTML/XML boundary differences in this selection were the separately identified headings for Psalm 23:1, 27:1, and 46:1. The remainder of those XML records matches the selected numbered verse text exactly. All other 63 text records match across formats after whitespace and paragraph-marker handling.

The full KJV wording of Romans 8:1 is retained. Ephesians 6:11–18 is complete; Ephesians 6:10 is in the original file. Semicolons, colons, parentheses, and verses ending with commas retain the publisher's punctuation because these verses continue a passage. Category and focus labels are interface labels, not Scripture quotations. Incorrect quiz choices are answer options, not alternate Bible text.

## Independent sample check

Fifteen added verses were also compared directly with Bible Gateway's KJV passage display. Wording matched. In Psalm 23:1, the plain-text extraction of Bible Gateway renders its small-cap LORD styling as “Lord”; the game retains eBible's “LORD.”

| Added verses checked | Independent KJV source |
| --- | --- |
| Ephesians 6:11, 12, 13, 14, 15, 16, 17, 18 | [Bible Gateway](https://www.biblegateway.com/passage/?search=Ephesians%206%3A11-18&version=KJV) |
| Psalm 23:1, 4 | [Bible Gateway](https://www.biblegateway.com/passage/?search=Psalm%2023%3A1-4&version=KJV) |
| Isaiah 41:10 | [Bible Gateway](https://www.biblegateway.com/passage/?search=Isaiah%2041%3A10&version=KJV) |
| Romans 8:1 | [Bible Gateway](https://www.biblegateway.com/passage/?search=Romans%208%3A1&version=KJV) |
| Hebrews 12:1 | [Bible Gateway](https://www.biblegateway.com/passage/?search=Hebrews%2012%3A1&version=KJV) |
| Philippians 4:8 | [Bible Gateway](https://www.biblegateway.com/passage/?search=Philippians%204%3A8&version=KJV) |
| 2 Corinthians 10:4 | [Bible Gateway](https://www.biblegateway.com/passage/?search=2%20Corinthians%2010%3A4&version=KJV) |

## Structural verification

The probe passed for all 66 additions: unique IDs/references, no duplicate of an original verse, only the six permitted categories, nonempty full verse text and source, 3–7 contiguous fragments, and an exact reconstruction from `fragments.join(' ')`. All fragments have 2–9 words except one ten-word Galatians 2:20 clause retained as a reading unit. Each recall prompt replaces exactly one whole word with `____`, has exactly three distinct choices with the answer once, and restores the full original text when the answer is inserted.

### Category balance

| Category | Added | Original allocation | Combined |
| --- | ---: | --- | ---: |
| Spiritual warfare | 11 | James 4:7 | 12 |
| Courage & strength | 9 | Ephesians 6:10; 2 Timothy 1:7; 1 Corinthians 16:13 | 12 |
| Peace & trust | 12 | — | 12 |
| Identity in Christ | 12 | — | 12 |
| Prayer & perseverance | 12 | — | 12 |
| Truth & renewal | 10 | Psalm 119:11; Romans 12:21 | 12 |

The source corpus supports intentional, visible Scripture learning through repeated play. Collection progress and recall recognition are not proof of memorization. Full verses should remain readable outside a timed run, and game controls/restart should remain available without completing a recall question.

## Per-verse evidence

Each SHA-256 below identifies the exact UTF-8 `text` string in the shipped module, with no trailing newline. Source links point to the numbered verse in the publisher's chapter.

| Reference | Category | Fragments | Exact-text SHA-256 | Source |
| --- | --- | ---: | --- | --- |
| Ephesians 6:11 | Spiritual warfare | 3 | `e80b64cc51e03019dc4400fcdd640085c36332fdcc5b451c3f364e8b398a843f` | [KJV](https://ebible.org/kjv/EPH06.htm#V11) |
| Ephesians 6:12 | Spiritual warfare | 4 | `54ed412e6bdf9682c1baf93845838ea3e00d57baea46a5709f735355fec9ff5b` | [KJV](https://ebible.org/kjv/EPH06.htm#V12) |
| Ephesians 6:13 | Spiritual warfare | 4 | `0f28fcf531b3d8b9880f4630b352200570dbccaa90e55bf97bea8752cbb9ad6e` | [KJV](https://ebible.org/kjv/EPH06.htm#V13) |
| Ephesians 6:14 | Spiritual warfare | 3 | `c88ccc4116ef9e6405973d2caf64d5cd8d83e31ebc16ab8b625ef1cee75f02f1` | [KJV](https://ebible.org/kjv/EPH06.htm#V14) |
| Ephesians 6:15 | Spiritual warfare | 3 | `2d3f46cb4a684d60a5c3a0a8abe788455c817a2badb7a1b4e216e0a43e07ed5b` | [KJV](https://ebible.org/kjv/EPH06.htm#V15) |
| Ephesians 6:16 | Spiritual warfare | 3 | `2d228dc2f3fa0054d7a28350aeba51774258f00a3cfc63cbf0c88b299831f11d` | [KJV](https://ebible.org/kjv/EPH06.htm#V16) |
| Ephesians 6:17 | Spiritual warfare | 3 | `d3d7529cacc1c588b22c804a35ff7abe6476169e00600aaab751c729c43f3fbb` | [KJV](https://ebible.org/kjv/EPH06.htm#V17) |
| 2 Corinthians 10:3 | Spiritual warfare | 3 | `4c48cfc7fd01378b4ac48b1eecbe75c3dcf88dc348ad5e3a28be1107f3e70078` | [KJV](https://ebible.org/kjv/2CO10.htm#V3) |
| 2 Corinthians 10:4 | Spiritual warfare | 4 | `661a256b4dd421ef3b21b0a9444c0f312b22a7a17cb5273a0653a13e91a7cb9f` | [KJV](https://ebible.org/kjv/2CO10.htm#V4) |
| 1 Peter 5:8 | Spiritual warfare | 4 | `4d323300c3e248844eae5ac97de11ec31f6ba2d5194f773651d6e370b5e53a08` | [KJV](https://ebible.org/kjv/1PE05.htm#V8) |
| Revelation 12:11 | Spiritual warfare | 4 | `e6878feb492af56eca51ff5fc984230c23b3615fee9d7f2935007e86dca70f36` | [KJV](https://ebible.org/kjv/REV12.htm#V11) |
| 1 Peter 5:9 | Courage & strength | 3 | `6f8e430c36b0d1f1a4a9afc2ab8a194d928a33504615a185eb0ae6e2397a3320` | [KJV](https://ebible.org/kjv/1PE05.htm#V9) |
| Philippians 4:13 | Courage & strength | 3 | `bf0f41fb5fe48805a0b7dc3fe26dd9196aca93312166f6028ab23eeac0b7a112` | [KJV](https://ebible.org/kjv/PHP04.htm#V13) |
| Isaiah 41:10 | Courage & strength | 6 | `5a64de2c47a5a969ebcd21ce8663fe7788cdce67e1a278c0c59e038e663fb296` | [KJV](https://ebible.org/kjv/ISA41.htm#V10) |
| Isaiah 54:17 | Courage & strength | 6 | `e7dd3f9bedfeb044d808ae49a1ad2994b308e1e143ea3cb1f02a6063dd7008cb` | [KJV](https://ebible.org/kjv/ISA54.htm#V17) |
| Psalm 27:1 | Courage & strength | 4 | `388d2ee69fe1d90bb62c677476bb31a7a1e3d5d160baf59ae5921f48cc4ec40c` | [KJV](https://ebible.org/kjv/PSA027.htm#V1) |
| Psalm 46:1 | Courage & strength | 3 | `c718e973dd14783c1687bc7377dab423bc7ccf94d8d19535d9c90591ff11cde0` | [KJV](https://ebible.org/kjv/PSA046.htm#V1) |
| Joshua 1:9 | Courage & strength | 5 | `4597269faca78bada9e41aa0d4d48ac45a3cf64177ab5695c23b062ba09132b3` | [KJV](https://ebible.org/kjv/JOS01.htm#V9) |
| Deuteronomy 31:6 | Courage & strength | 5 | `3caf8ca5831ddd37cd548c0e0949babdb08b1e3220f1e6dd5ba0213beec24f17` | [KJV](https://ebible.org/kjv/DEU31.htm#V6) |
| Isaiah 40:31 | Courage & strength | 5 | `7aaee4ad128132561f48dbe45338b96a2445f2a6be7ef70b1185dea41e847ea2` | [KJV](https://ebible.org/kjv/ISA40.htm#V31) |
| Psalm 23:1 | Peace & trust | 3 | `f1705f7a9f458f3af425d0e9349a63c083a427fe4a8187d5c5edf526ef7f1359` | [KJV](https://ebible.org/kjv/PSA023.htm#V1) |
| Psalm 23:4 | Peace & trust | 5 | `8391a422a3bfb7c5e06e9cd6620e6f4c3d5211493c7690c235acfc8a94d2d275` | [KJV](https://ebible.org/kjv/PSA023.htm#V4) |
| Psalm 46:10 | Peace & trust | 4 | `d3483ad76eccd5a1439d8e02baaf2f32436e42a4fea9af9de7343a3c4ef74bd7` | [KJV](https://ebible.org/kjv/PSA046.htm#V10) |
| Psalm 91:1 | Peace & trust | 3 | `f385edb2c14b985d08d88be1d0ade01744dbe0be7cf347065ce685189078213a` | [KJV](https://ebible.org/kjv/PSA091.htm#V1) |
| Psalm 91:2 | Peace & trust | 3 | `37190230d07ef35a1329ba603b813951ce2d1c415311a0f72d74a54e5faa496a` | [KJV](https://ebible.org/kjv/PSA091.htm#V2) |
| Philippians 4:6 | Peace & trust | 4 | `bc518bba254473a71e315ad60b881970519a857e60e03aac17f336f2e1c81eeb` | [KJV](https://ebible.org/kjv/PHP04.htm#V6) |
| Philippians 4:7 | Peace & trust | 3 | `83436c7e42c757567e4798d8aeb8b5ef6eb40a67cc97c96e5e386714d34053be` | [KJV](https://ebible.org/kjv/PHP04.htm#V7) |
| Proverbs 3:5 | Peace & trust | 3 | `848c7aaeb9ee74bafece4baae92593a800f7ad683d8daaae9dc3cd1ded0dfdbd` | [KJV](https://ebible.org/kjv/PRO03.htm#V5) |
| Proverbs 3:6 | Peace & trust | 3 | `ddeb25ba4651a996c0c6cdce40cd7abf157da225173a7a5a270a82b832aaa37f` | [KJV](https://ebible.org/kjv/PRO03.htm#V6) |
| Isaiah 26:3 | Peace & trust | 3 | `d750004e01d3acca592aa129b7249b8ba4d91d060d5845a97f561986afd0618d` | [KJV](https://ebible.org/kjv/ISA26.htm#V3) |
| John 14:27 | Peace & trust | 5 | `614d2b21ff8d42deaaa37109b2d820bd222844e98f36e532c2de74568ceb91c8` | [KJV](https://ebible.org/kjv/JHN14.htm#V27) |
| 1 Peter 5:7 | Peace & trust | 3 | `dffa72ecb87bb29c8687e7f013eac293a11e089fcd9e4d457211b5de38f2436e` | [KJV](https://ebible.org/kjv/1PE05.htm#V7) |
| 1 John 4:4 | Identity in Christ | 4 | `125806ff21f84215abad6f914cb393e70e163589dfbc7bb1bf433f40b402378e` | [KJV](https://ebible.org/kjv/1JN04.htm#V4) |
| Romans 8:1 | Identity in Christ | 4 | `afd41f8c577dcd91d799e711f44e2cb80ee30529739b9528315ad05556a5f4dc` | [KJV](https://ebible.org/kjv/ROM08.htm#V1) |
| Romans 8:31 | Identity in Christ | 3 | `ca72ef0fd210dd650de975c50ee5008b75668fcd9b5f857576b517c0b61b40aa` | [KJV](https://ebible.org/kjv/ROM08.htm#V31) |
| Romans 8:37 | Identity in Christ | 3 | `1def17602579e85f8f958de047d55abc1e83ce66581460a89c0f54c972c6b534` | [KJV](https://ebible.org/kjv/ROM08.htm#V37) |
| 2 Corinthians 5:17 | Identity in Christ | 4 | `b383e600d36045a459da91b5c3e422db523f92c88220a63f55314b3ab9499ed2` | [KJV](https://ebible.org/kjv/2CO05.htm#V17) |
| Ephesians 2:8 | Identity in Christ | 3 | `fff3cf3e44a42d8f7778e0e8d7e1939b1630f1737fdb883cb6fc71dcf16ef7da` | [KJV](https://ebible.org/kjv/EPH02.htm#V8) |
| Ephesians 2:9 | Identity in Christ | 3 | `3b2bd52a02219cf338779e63b5589c578f08d1a293eb74d80beb56947e0df967` | [KJV](https://ebible.org/kjv/EPH02.htm#V9) |
| Ephesians 2:10 | Identity in Christ | 4 | `7d4618bd506beee91f8bc1a83c09fe0842028fef7530b47c09057e12378a9aed` | [KJV](https://ebible.org/kjv/EPH02.htm#V10) |
| Galatians 2:20 | Identity in Christ | 7 | `c662decc9313b9f34070af0f1bcefc77233b99e135423339132c4ec55543183b` | [KJV](https://ebible.org/kjv/GAL02.htm#V20) |
| 1 John 3:1 | Identity in Christ | 5 | `0f39c64ac66130110e1f960604b2c5704ca737b6295e960669376fed71b9565a` | [KJV](https://ebible.org/kjv/1JN03.htm#V1) |
| John 1:12 | Identity in Christ | 4 | `ccd10f0d73703ca67cc2fd5e76f470df2737f8d32c825c0bf650d315fcf23f53` | [KJV](https://ebible.org/kjv/JHN01.htm#V12) |
| Romans 8:15 | Identity in Christ | 4 | `c044531918ccb11c797930bbf8bc9141d9a10fe354fb59fae13052ec0fc1d186` | [KJV](https://ebible.org/kjv/ROM08.htm#V15) |
| Ephesians 6:18 | Prayer & perseverance | 4 | `666449421b1cf28fcb5db98132a43150836762feeb077224fee90cb650f6ba14` | [KJV](https://ebible.org/kjv/EPH06.htm#V18) |
| Hebrews 12:1 | Prayer & perseverance | 6 | `76c7cef372a95817337f4ee86092017686d77dfae7c6ac4a7d62c80ab3a1bc97` | [KJV](https://ebible.org/kjv/HEB12.htm#V1) |
| Hebrews 12:2 | Prayer & perseverance | 6 | `895214955d6792a2c189434dd40f996e0af1238a21fe2727247b401e62988b05` | [KJV](https://ebible.org/kjv/HEB12.htm#V2) |
| James 1:2 | Prayer & perseverance | 3 | `e3a2defd27b691ab8333cbde3e2c39a80d423fc2334b3081b76b076ac8508ec7` | [KJV](https://ebible.org/kjv/JAS01.htm#V2) |
| James 1:3 | Prayer & perseverance | 3 | `c74dc20b2207ffefc71acae907e62c4f72c0a25638aa7e28e4fca4ab0086b5dd` | [KJV](https://ebible.org/kjv/JAS01.htm#V3) |
| James 1:4 | Prayer & perseverance | 3 | `118f6f93b6eb975679a2b6c0206f5fbb317c2824ad473f326f05eaf3db79e932` | [KJV](https://ebible.org/kjv/JAS01.htm#V4) |
| Romans 12:12 | Prayer & perseverance | 3 | `c221db1693df8c826a0a12fec58c1f75630a2fe5f135c1da9b4c408c81acb17b` | [KJV](https://ebible.org/kjv/ROM12.htm#V12) |
| Galatians 6:9 | Prayer & perseverance | 3 | `2401e0d5f76cf0a25b9e1ea526ff960ccc94433b3e5f34339f74cb39f7456c4f` | [KJV](https://ebible.org/kjv/GAL06.htm#V9) |
| 1 Thessalonians 5:11 | Prayer & perseverance | 3 | `e412d2582201f7b63e9c3d3bf8177ca2ed52ea3bd80c18b9e956ee5e8e4035a8` | [KJV](https://ebible.org/kjv/1TH05.htm#V11) |
| Matthew 7:7 | Prayer & perseverance | 3 | `dfe81ebb246f96cfda94240036d4a7eb8aee22320b0bdcc1a25a178a35b4769b` | [KJV](https://ebible.org/kjv/MAT07.htm#V7) |
| 1 Thessalonians 5:18 | Prayer & perseverance | 3 | `31b648d2a18ad640347cc61267075a5fc945334d106da53eaed29013c7eca8a3` | [KJV](https://ebible.org/kjv/1TH05.htm#V18) |
| Philippians 1:6 | Prayer & perseverance | 5 | `231b831206d889dbe716aaab35d851e4f31ae6432ffde43a6705262205d8b5b1` | [KJV](https://ebible.org/kjv/PHP01.htm#V6) |
| 2 Corinthians 10:5 | Truth & renewal | 5 | `05a1f635cf2840fb047d400e64b8f74315cd08c824f712ea0968e2e1cfa8584a` | [KJV](https://ebible.org/kjv/2CO10.htm#V5) |
| Philippians 4:8 | Truth & renewal | 7 | `05973c90fd782c712e411530d0edbd52038a734a3e17e1694fd62a87120fa14b` | [KJV](https://ebible.org/kjv/PHP04.htm#V8) |
| Romans 12:2 | Truth & renewal | 5 | `ebd93c702173c784e8ff5739cd343adb6f2c6c72695dc0155739000d43ac2da9` | [KJV](https://ebible.org/kjv/ROM12.htm#V2) |
| John 8:31 | Truth & renewal | 4 | `df488ccf9a4185eb8e6c2236d26ffb8e1335a276653588a465a261645d744863` | [KJV](https://ebible.org/kjv/JHN08.htm#V31) |
| John 8:32 | Truth & renewal | 3 | `50e1165d09e0885f1389ff24001cfca6c868d5742b76a4c4ae42ef05a795f866` | [KJV](https://ebible.org/kjv/JHN08.htm#V32) |
| John 17:17 | Truth & renewal | 3 | `7c4ba4015f23d7780b9ddd9e5b8dc4f131c0852e32d0ca8858c856d4ca93c7a2` | [KJV](https://ebible.org/kjv/JHN17.htm#V17) |
| Hebrews 4:12 | Truth & renewal | 7 | `dbc7d0767e476a295407102885f44df88518964a919ffe6d0d8c61afd313d944` | [KJV](https://ebible.org/kjv/HEB04.htm#V12) |
| Psalm 119:105 | Truth & renewal | 3 | `af51d0e0109537412dc544a6e3d27394465798a9785cefad89d5ddcf45a0b2f2` | [KJV](https://ebible.org/kjv/PSA119.htm#V105) |
| 2 Timothy 3:16 | Truth & renewal | 4 | `f57fbe39104fa254df3a498901c4424f048f2b8b1705481ea65e0b618c30fe45` | [KJV](https://ebible.org/kjv/2TI03.htm#V16) |
| 2 Timothy 3:17 | Truth & renewal | 3 | `c4b01a804a2e7e51be700f605e0ae21b3bb9d3c696d0a3edba55429167f06fa8` | [KJV](https://ebible.org/kjv/2TI03.htm#V17) |
