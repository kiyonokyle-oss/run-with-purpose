import { additionalVerses } from './scripture-additions.js';
// King James Version. Exact verse text verified against Bible Gateway on 2026-09-12.
// Every fragments.join(' ') reproduces its full text, including punctuation.
// Source links and presentation guidance are in SCRIPTURE-SOURCES.md.
const originalVerses = [
  {
    id: 'ephesians-6-10',
    reference: 'Ephesians 6:10',
    translation: 'KJV',
    text: 'Finally, my brethren, be strong in the Lord, and in the power of his might.',
    fragments: [
      'Finally, my brethren,',
      'be strong in the Lord,',
      'and in the power',
      'of his might.',
    ],
    focus: 'Strength',
    recall: {
      prompt: 'Finally, my brethren, be ____ in the Lord, and in the power of his might.',
      answer: 'strong',
      options: ['swift', 'strong', 'still'],
    },
  },
  {
    id: 'james-4-7',
    reference: 'James 4:7',
    translation: 'KJV',
    text: 'Submit yourselves therefore to God. Resist the devil, and he will flee from you.',
    fragments: [
      'Submit yourselves therefore to God.',
      'Resist the devil,',
      'and he will flee from you.',
    ],
    focus: 'Resistance',
    recall: {
      prompt: 'Submit yourselves therefore to God. ____ the devil, and he will flee from you.',
      answer: 'Resist',
      options: ['Resist', 'Fear', 'Follow'],
    },
  },
  {
    id: '2-timothy-1-7',
    reference: '2 Timothy 1:7',
    translation: 'KJV',
    text: 'For God hath not given us the spirit of fear; but of power, and of love, and of a sound mind.',
    fragments: [
      'For God hath not given us',
      'the spirit of fear;',
      'but of power, and of love,',
      'and of a sound mind.',
    ],
    focus: 'Courage',
    recall: {
      prompt: 'For God hath not given us the spirit of ____; but of power, and of love, and of a sound mind.',
      answer: 'fear',
      options: ['hope', 'peace', 'fear'],
    },
  },
  {
    id: 'psalm-119-11',
    reference: 'Psalm 119:11',
    translation: 'KJV',
    text: 'Thy word have I hid in mine heart, that I might not sin against thee.',
    fragments: [
      'Thy word have I hid',
      'in mine heart,',
      'that I might not sin against thee.',
    ],
    focus: 'Remembrance',
    recall: {
      prompt: 'Thy word have I hid in mine ____, that I might not sin against thee.',
      answer: 'heart',
      options: ['hands', 'heart', 'house'],
    },
  },
  {
    id: 'romans-12-21',
    reference: 'Romans 12:21',
    translation: 'KJV',
    text: 'Be not overcome of evil, but overcome evil with good.',
    fragments: [
      'Be not overcome of evil,',
      'but overcome evil',
      'with good.',
    ],
    focus: 'Goodness',
    recall: {
      prompt: 'Be not overcome of evil, but overcome evil with ____.',
      answer: 'good',
      options: ['good', 'anger', 'pride'],
    },
  },
  {
    id: '1-corinthians-16-13',
    reference: '1 Corinthians 16:13',
    translation: 'KJV',
    text: 'Watch ye, stand fast in the faith, quit you like men, be strong.',
    fragments: [
      'Watch ye,',
      'stand fast in the faith,',
      'quit you like men,',
      'be strong.',
    ],
    focus: 'Steadfastness',
    recall: {
      prompt: 'Watch ye, stand fast in the ____, quit you like men, be strong.',
      answer: 'faith',
      options: ['crowd', 'night', 'faith'],
    },
  },
];

const originalCategories = [
  'Courage & strength', 'Spiritual warfare', 'Courage & strength',
  'Truth & renewal', 'Truth & renewal', 'Courage & strength',
];
// Keep original IDs and order so existing saved progress remains valid.
export const verses = [
  ...originalVerses.map((verse, index) => ({
    ...verse,
    category: originalCategories[index],
    source: `https://www.biblegateway.com/passage/?search=${encodeURIComponent(verse.reference)}&version=KJV`,
  })),
  ...additionalVerses,
];
export const categories = [
  'Spiritual warfare', 'Courage & strength', 'Peace & trust',
  'Identity in Christ', 'Prayer & perseverance', 'Truth & renewal',
];
export default verses;
