import test from 'node:test';
import assert from 'node:assert/strict';
import {
  parseStoredGroup,
  getStoredGroup,
  storeGroup,
  removeStoredGroup,
} from '../src/features/groups/lib/group-storage.ts';
const group = {
  id: 'group-one',
  name: 'Apartment',
  currency: 'PHP',
  role: 'OWNER',
  owner: null,
  joinedAt: '2026-10-28',
};
function storage(seed = {}) {
  const values = new Map(Object.entries(seed));
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
  };
}
test('invalid or old non-JSON selections do not crash startup', () => {
  for (const value of [
    null,
    'old-id',
    '[]',
    'null',
    '{}',
    '{"id":"","name":"Apartment","currency":"PHP"}',
  ])
    assert.equal(parseStoredGroup(value), null);
  assert.deepEqual(parseStoredGroup(JSON.stringify(group)), group);
});
test('existing household selections remain readable during migration', () => {
  assert.deepEqual(
    getStoredGroup(storage({ selectedHousehold: JSON.stringify(group) })),
    group,
  );
});
test('valid canonical selection takes precedence, with fallback for malformed storage', () => {
  const next = { ...group, id: 'group-two' };
  assert.deepEqual(
    getStoredGroup(
      storage({
        selectedGroup: JSON.stringify(next),
        selectedHousehold: JSON.stringify(group),
      }),
    ),
    next,
  );
  assert.deepEqual(
    getStoredGroup(
      storage({
        selectedGroup: 'invalid',
        selectedHousehold: JSON.stringify(group),
      }),
    ),
    group,
  );
});
test('new group selection writes the canonical key and removes legacy state', () => {
  const saved = storage({ selectedHousehold: JSON.stringify(group) });
  storeGroup(group, saved);
  assert.deepEqual(JSON.parse(saved.getItem('selectedGroup')), group);
  assert.equal(saved.getItem('selectedHousehold'), null);
});
test('session cleanup removes both selection formats', () => {
  const saved = storage({
    selectedGroup: JSON.stringify(group),
    selectedHousehold: JSON.stringify(group),
  });
  removeStoredGroup(saved);
  assert.equal(saved.getItem('selectedGroup'), null);
  assert.equal(saved.getItem('selectedHousehold'), null);
});
