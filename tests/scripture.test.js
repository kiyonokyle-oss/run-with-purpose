import test from 'node:test';
import assert from 'node:assert/strict';
import { verses, categories } from '../src/scripture.js';

test('scripture fragments reconstruct each complete KJV verse exactly', () => {
  assert.equal(verses.length, 72);
  assert.equal(new Set(verses.map(v => v.id)).size, verses.length);
  for (const verse of verses) {
    assert.equal(verse.translation, 'KJV');
    assert.equal(verse.fragments.join(' '), verse.text, verse.reference);
  }
});

test('every recall prompt has one blank and one exact correct answer', () => {
  for (const verse of verses) {
    assert.equal(verse.recall.prompt.split('____').length, 2);
    assert.equal(verse.recall.prompt.replace('____', verse.recall.answer), verse.text);
    assert.equal(verse.recall.options.filter(word => word === verse.recall.answer).length, 1);
    assert.equal(new Set(verse.recall.options).size, 3);
  }
});


test('all six topics contain twelve distinct sourced passages', () => {
  assert.equal(categories.length, 6);
  for (const category of categories) {
    assert.equal(verses.filter(verse => verse.category === category).length, 12, category);
  }
  for (const verse of verses) {
    assert.ok(categories.includes(verse.category));
    assert.equal(new URL(verse.source).protocol, 'https:');
    assert.ok(verse.text.length > 10);
  }
});

test('the original six IDs remain stable for saved progress migration', () => {
  assert.deepEqual(verses.slice(0, 6).map(verse => verse.id), [
    'ephesians-6-10', 'james-4-7', '2-timothy-1-7',
    'psalm-119-11', 'romans-12-21', '1-corinthians-16-13',
  ]);
});
