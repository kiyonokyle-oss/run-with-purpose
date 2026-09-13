import test from 'node:test';
import assert from 'node:assert/strict';
import { createScriptureJourney } from '../src/scripture-journey.js';

function catalog(size = 5, fragments = 3) {
  return Array.from({ length: size }, (_, index) => ({
    id: `verse-${index + 1}`,
    reference: `Book ${index + 1}:1`,
    fragments: Array.from({ length: fragments }, (__, part) => `Verse ${index + 1} fragment ${part + 1}`),
  }));
}

function fragment(journey) {
  assert.equal(journey.collectLight(), null);
  assert.equal(journey.collectLight(), null);
  return journey.collectLight();
}

test('initial preview is uncounted and the first run honors it', () => {
  const journey = createScriptureJourney(catalog());
  assert.equal(journey.current().id, 'verse-1');
  assert.equal(journey.state.rounds, 0);
  assert.equal(journey.state.seen['verse-1'], 0);
  assert.equal(journey.collectLight(), null);
  assert.equal(journey.beginRun().id, 'verse-1');
  assert.equal(journey.state.seen['verse-1'], 1);
  assert.equal(journey.state.rounds, 1);
});

test('legacy saves preserve progress and move past a verse already played', () => {
  const source = { verse: 0, runs: 8, best: 4300, fragments: { 'verse-1': 2, 'verse-3': 1 }, recalls: { 'verse-1': 4 } };
  const before = JSON.stringify(source);
  const journey = createScriptureJourney(catalog(), source);
  assert.equal(journey.current().id, 'verse-1');
  assert.equal(journey.state.runStarted, true);
  assert.equal(journey.state.rounds, 8);
  assert.equal(journey.state.seen['verse-1'], 8);
  assert.equal(journey.state.fragments['verse-1'], 2);
  assert.equal(journey.state.fragments['verse-3'], 1);
  assert.equal(journey.state.recalls['verse-1'], 4);
  assert.equal(journey.beginRun().id, 'verse-2');
  assert.equal(JSON.stringify(source), before);
  assert.equal(Object.hasOwn(journey.snapshot(), 'best'), false);
});

test('legacy indexed selection is displayed and empty history honors it on first run', () => {
  const first = createScriptureJourney(catalog(), { verse: 2, runs: 0 });
  assert.equal(first.current().id, 'verse-3');
  assert.equal(first.beginRun().id, 'verse-3');
  const returning = createScriptureJourney(catalog(), { verse: 2, runs: 1 });
  assert.equal(returning.current().id, 'verse-3');
  assert.equal(returning.beginRun().id, 'verse-4');
});

test('failed runs with zero lights still cycle every passage and survive reloads', () => {
  const verses = catalog();
  let journey = createScriptureJourney(verses);
  const selected = [];
  for (let index = 0; index < 5; index++) {
    selected.push(journey.beginRun().id);
    journey = createScriptureJourney(verses, JSON.parse(JSON.stringify(journey.snapshot())));
  }
  assert.deepEqual(selected, verses.map(verse => verse.id));
  assert.equal(journey.beginRun().id, 'verse-1');
});

test('every third light emits a fragment and completion waits for explicit advance', () => {
  const verses = catalog();
  const journey = createScriptureJourney(verses);
  journey.beginRun();
  assert.deepEqual(fragment(journey), { verse: verses[0], fragment: verses[0].fragments[0], index: 0, completed: false });
  assert.equal(fragment(journey).index, 1);
  const completed = fragment(journey);
  assert.equal(completed.index, 2);
  assert.equal(completed.completed, true);
  for (let index = 0; index < 20; index++) assert.equal(journey.collectLight(), null);
  assert.equal(journey.current().id, 'verse-1');
  assert.equal(journey.state.rounds, 1);
  assert.equal(journey.advance().id, 'verse-2');
  assert.equal(journey.state.seen['verse-2'], 1);
  assert.equal(fragment(journey).verse.id, 'verse-2');
});

test('saved partial fragments carry across different runs and a reload', () => {
  const verses = catalog(3, 4);
  let journey = createScriptureJourney(verses);
  journey.beginRun();
  assert.equal(fragment(journey).index, 0);
  journey.beginRun();
  assert.equal(journey.current().id, 'verse-2');
  journey = createScriptureJourney(verses, journey.snapshot());
  journey.select('verse-1');
  journey.beginRun();
  assert.equal(fragment(journey).index, 1);
  assert.equal(journey.state.fragments['verse-1'], 2);
});

test('completed verse practice honors explicit selection and starts its text again', () => {
  const verses = catalog(3, 2);
  const journey = createScriptureJourney(verses, {
    currentId: 'verse-2', runStarted: true, rounds: 2,
    seen: { 'verse-1': 1, 'verse-2': 1 }, fragments: { 'verse-1': 2 },
  });
  assert.equal(journey.select('verse-1').id, 'verse-1');
  assert.equal(journey.state.seen['verse-1'], 1);
  assert.equal(journey.beginRun().id, 'verse-1');
  assert.equal(journey.state.seen['verse-1'], 2);
  assert.equal(fragment(journey).index, 0);
  assert.equal(journey.state.fragments['verse-1'], 2);
  assert.equal(fragment(journey).completed, true);
  assert.notEqual(journey.beginRun().id, 'verse-1');
});

test('manual selection persists until beginning a run, and invalid ids do nothing', () => {
  const verses = catalog();
  const first = createScriptureJourney(verses);
  first.beginRun();
  first.select('verse-4');
  const journey = createScriptureJourney(verses, first.snapshot());
  const before = journey.snapshot();
  assert.equal(journey.select('missing'), null);
  assert.deepEqual(journey.snapshot(), before);
  assert.equal(journey.beginRun().id, 'verse-4');
  assert.equal(journey.state.pendingManual, false);
});

test('missed recalls return every fourth selection without starving unseen passages', () => {
  const verses = catalog(12);
  const journey = createScriptureJourney(verses);
  const selected = [journey.beginRun().id];
  journey.recordRecall(false);
  selected.push(journey.beginRun().id);
  selected.push(journey.beginRun().id);
  assert.equal(journey.beginRun().id, 'verse-1');
  selected.push(journey.current().id);
  for (let index = 0; index < 20; index++) {
    const previous = journey.current().id;
    selected.push(journey.beginRun().id);
    assert.notEqual(journey.current().id, previous);
  }
  assert.equal(new Set(selected).size, verses.length);
  assert.equal(journey.state.rounds, 24);
  assert.ok(journey.state.seen['verse-1'] > 1);
});

test('recall can target a previous verse without changing the active passage', () => {
  const journey = createScriptureJourney(catalog());
  journey.beginRun();
  journey.advance();
  assert.equal(journey.recordRecall(false, 'verse-1'), true);
  assert.equal(journey.recordRecall(true, 'verse-1'), true);
  assert.equal(journey.state.missed['verse-1'], 1);
  assert.equal(journey.state.recalls['verse-1'], 1);
  assert.equal(journey.current().id, 'verse-2');
  assert.equal(journey.recordRecall(true, 'missing'), false);
  assert.equal(journey.recordRecall('yes', 'verse-1'), false);
  assert.equal(journey.state.recalls['verse-1'], 1);
});

test('all 72 passages cycle in catalog order before normal repeats', () => {
  const verses = catalog(72);
  const journey = createScriptureJourney(verses);
  const selected = Array.from({ length: 72 }, () => journey.beginRun().id);
  assert.deepEqual(selected, verses.map(verse => verse.id));
  assert.ok(Object.values(journey.state.seen).every(value => value === 1));
  assert.equal(journey.beginRun().id, verses[0].id);
});

test('after unseen passages are exhausted, least seen then least correct wins', () => {
  const verses = catalog(4);
  const journey = createScriptureJourney(verses, {
    currentId: 'verse-1', runStarted: true, rounds: 5,
    seen: { 'verse-1': 1, 'verse-2': 2, 'verse-3': 1, 'verse-4': 1 },
    recalls: { 'verse-3': 3, 'verse-4': 1 },
  });
  assert.equal(journey.beginRun().id, 'verse-4');
  assert.equal(journey.advance().id, 'verse-1');
});

test('corrupt progress is sanitized, bounded, and limited to catalog ids', () => {
  const journey = createScriptureJourney(catalog(3), {
    currentId: 'deleted', verse: -50, rounds: Infinity, runStarted: 'true', pendingManual: 'true',
    seen: { 'verse-1': NaN, 'verse-2': -3, 'verse-3': 3.9, deleted: 100 },
    fragments: { 'verse-1': 9999, 'verse-2': -2, 'verse-3': '2' },
    recalls: { 'verse-1': 2.8, 'verse-2': 1e100, 'verse-3': null },
    missed: ['invalid'],
  });
  assert.equal(journey.current().id, 'verse-1');
  assert.deepEqual(journey.state.seen, { 'verse-1': 0, 'verse-2': 0, 'verse-3': 3 });
  assert.deepEqual(journey.state.fragments, { 'verse-1': 3, 'verse-2': 0, 'verse-3': 0 });
  assert.deepEqual(journey.state.recalls, { 'verse-1': 2, 'verse-2': 1_000_000_000, 'verse-3': 0 });
  assert.deepEqual(journey.state.missed, { 'verse-1': 0, 'verse-2': 0, 'verse-3': 0 });
  assert.equal(journey.state.rounds, 0);
  assert.equal(journey.state.runStarted, false);
  assert.equal(journey.state.pendingManual, false);
  assert.doesNotThrow(() => createScriptureJourney(catalog(), null));
  assert.doesNotThrow(() => createScriptureJourney(catalog(), []));
});

test('snapshots are detached and JSON round-trip the entire progress schema', () => {
  const verses = catalog();
  const journey = createScriptureJourney(verses);
  journey.beginRun();
  fragment(journey);
  journey.recordRecall(false);
  const snapshot = journey.snapshot();
  assert.deepEqual(JSON.parse(JSON.stringify(snapshot)), snapshot);
  const loaded = createScriptureJourney(verses, snapshot);
  assert.deepEqual(loaded.snapshot(), snapshot);
  snapshot.fragments['verse-1'] = 999;
  assert.equal(journey.state.fragments['verse-1'], 1);
});

test('single-passage catalogs permit repeat practice and invalid catalogs fail clearly', () => {
  const journey = createScriptureJourney(catalog(1));
  assert.equal(journey.beginRun().id, 'verse-1');
  assert.equal(journey.advance().id, 'verse-1');
  assert.throws(() => createScriptureJourney([]), TypeError);
  assert.throws(() => createScriptureJourney([{ id: 'a', fragments: [] }]), TypeError);
  assert.throws(() => createScriptureJourney([catalog(1)[0], catalog(1)[0]]), TypeError);
});
