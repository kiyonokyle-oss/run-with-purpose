/**
 * Scripture progression independent of the DOM, clock, game engine, and storage.
 *
 * current(), beginRun(), advance(), and select(id) return a catalog entry.
 * select() previews a passage; beginRun() then honors that explicit choice.
 * beginRun() otherwise advances after the first run, including after a reload.
 * collectLight() emits every third light and stops after a completed passage
 * until advance()/beginRun(). Fragment indices are zero-based. A completed
 * passage can be practiced again; its saved completion count stays intact.
 *
 * "rounds" counts actual selections made by beginRun()/advance(), not wins.
 * "runStarted" means at least one run has ever started. It is persisted so a
 * restart/reload cannot repeatedly select the initial passage. "pendingManual"
 * preserves an explicit preview until the next beginRun(). Live light counts
 * and the completion hold are transient; callers own timers and persistence.
 */

const MAX_COUNT = 1_000_000_000;
const isRecord = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const own = (record, key) => isRecord(record) && Object.hasOwn(record, key) ? record[key] : undefined;
const count = (value, max = MAX_COUNT) => typeof value === 'number' && Number.isFinite(value)
  ? Math.min(max, Math.max(0, Math.floor(value)))
  : 0;

export function createScriptureJourney(catalog, saved = {}) {
  if (!Array.isArray(catalog) || catalog.length === 0) {
    throw new TypeError('Scripture catalog must contain at least one passage.');
  }
  const byId = new Map();
  for (const verse of catalog) {
    if (!verse || typeof verse.id !== 'string' || !verse.id || byId.has(verse.id)
      || !Array.isArray(verse.fragments) || verse.fragments.length === 0
      || verse.fragments.some(fragment => typeof fragment !== 'string')) {
      throw new TypeError('Each passage needs a unique string id and nonempty string fragments.');
    }
    byId.set(verse.id, verse);
  }
  const ids = [...byId.keys()];
  const input = isRecord(saved) ? saved : {};
  const legacyRuns = count(own(input, 'runs'));
  const legacyIndex = Number.isInteger(own(input, 'verse')) && input.verse >= 0 && input.verse < catalog.length
    ? input.verse : 0;
  const currentId = byId.has(own(input, 'currentId')) ? input.currentId : ids[legacyIndex];
  const makeCounts = (key, maximum) => Object.fromEntries(catalog.map(verse => [
    verse.id, count(own(own(input, key), verse.id), maximum ? maximum(verse) : MAX_COUNT),
  ]));
  const state = {
    currentId,
    seen: makeCounts('seen'),
    fragments: makeCounts('fragments', verse => verse.fragments.length),
    recalls: makeCounts('recalls'),
    missed: makeCounts('missed'),
    rounds: own(input, 'rounds') === undefined ? legacyRuns : count(input.rounds),
    runStarted: typeof own(input, 'runStarted') === 'boolean' ? input.runStarted : legacyRuns > 0,
    pendingManual: own(input, 'pendingManual') === true,
  };

  // Legacy runs are evidence of prior exposure, rather than a new selection.
  // Seeding this history is the only constructor-time change to a seen count.
  if (legacyRuns > 0 && own(input, 'currentId') === undefined) {
    state.seen[currentId] = Math.max(state.seen[currentId], legacyRuns);
  }

  let active = false;
  let lights = 0;
  let fragmentIndex = 0;
  let holdingCompletion = false;

  function current() {
    return byId.get(state.currentId);
  }

  function prepareFragments() {
    const verse = current();
    lights = 0;
    holdingCompletion = false;
    const progress = state.fragments[verse.id];
    fragmentIndex = progress < verse.fragments.length ? progress : 0;
  }

  function candidatesAfterCurrent() {
    const start = ids.indexOf(state.currentId);
    return Array.from({ length: ids.length - 1 }, (_, index) => ids[(start + index + 1) % ids.length]);
  }

  function chooseNext() {
    const candidates = candidatesAfterCurrent();
    if (candidates.length === 0) return state.currentId;

    // At most one in four selections is reserved for a past missed recall.
    // The other three always prioritize unseen passages, preventing starvation.
    if ((state.rounds + 1) % 4 === 0 && ids.length > 1) {
      const reviews = candidates.filter(id => state.seen[id] > 0 && state.missed[id] > 0);
      if (reviews.length > 0) {
        return reviews.reduce((best, id) => {
          if (state.seen[id] !== state.seen[best]) return state.seen[id] < state.seen[best] ? id : best;
          if (state.recalls[id] !== state.recalls[best]) return state.recalls[id] < state.recalls[best] ? id : best;
          return state.missed[id] > state.missed[best] ? id : best;
        });
      }
    }

    const unseen = candidates.find(id => state.seen[id] === 0);
    if (unseen) return unseen;
    // Reduce preserves the cyclic catalog order for an exact tie.
    return candidates.reduce((best, id) => {
      if (state.seen[id] !== state.seen[best]) return state.seen[id] < state.seen[best] ? id : best;
      return state.recalls[id] < state.recalls[best] ? id : best;
    });
  }

  function enter(id) {
    state.currentId = id;
    state.seen[id] = count(state.seen[id] + 1);
    state.rounds = count(state.rounds + 1);
    state.runStarted = true;
    state.pendingManual = false;
    active = true;
    prepareFragments();
    return current();
  }

  function beginRun() {
    const id = !state.runStarted || state.pendingManual ? state.currentId : chooseNext();
    return enter(id);
  }

  function advance() {
    return enter(chooseNext());
  }

  function select(id) {
    if (!byId.has(id)) return null;
    state.currentId = id;
    state.pendingManual = true;
    active = false;
    prepareFragments();
    return current();
  }

  function collectLight() {
    if (!active || holdingCompletion) return null;
    lights++;
    if (lights < 3) return null;
    lights = 0;
    const verse = current();
    const index = fragmentIndex++;
    state.fragments[verse.id] = Math.max(state.fragments[verse.id], fragmentIndex);
    const completed = fragmentIndex === verse.fragments.length;
    if (completed) holdingCompletion = true;
    return { verse, fragment: verse.fragments[index], index, completed };
  }

  function recordRecall(correct, id = state.currentId) {
    if (typeof correct !== 'boolean' || !byId.has(id)) return false;
    const counter = correct ? state.recalls : state.missed;
    counter[id] = count(counter[id] + 1);
    return true;
  }

  function snapshot() {
    // Return a detached, JSON-safe value so storage/UI cannot mutate live maps.
    return {
      currentId: state.currentId,
      seen: { ...state.seen },
      fragments: { ...state.fragments },
      recalls: { ...state.recalls },
      missed: { ...state.missed },
      rounds: state.rounds,
      runStarted: state.runStarted,
      pendingManual: state.pendingManual,
    };
  }

  return { state, current, beginRun, collectLight, advance, select, recordRecall, snapshot };
}
