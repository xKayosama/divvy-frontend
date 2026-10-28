import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateSplit } from '../src/features/expenses/lib/split.ts';
import {
  currencyMoney,
  expenseDate,
} from '../src/features/expenses/lib/money.ts';
const people = ['a', 'b', 'c'];
const split = (amount, splitType, participants, currency = 'PHP', extra = {}) =>
  calculateSplit({ amount, splitType, participants, currency, ...extra });
const amounts = (result) => result.participants?.map((p) => p.amount);
test('equal allocation preserves native units and gives remainder to the first participant', () => {
  assert.deepEqual(
    amounts(
      split(
        10,
        'EQUAL',
        people.map((userId) => ({ userId })),
      ),
    ),
    [3.34, 3.33, 3.33],
  );
  assert.deepEqual(
    amounts(
      split(
        1,
        'EQUAL',
        people.map((userId) => ({ userId })),
        'JPY',
      ),
    ),
    [1, 0, 0],
  );
  assert.deepEqual(
    amounts(
      split(
        0.001,
        'EQUAL',
        people.map((userId) => ({ userId })),
        'KWD',
      ),
    ),
    [0.001, 0, 0],
  );
});
test('currency validation uses backend precision, bounds and nonnegative exact amounts', () => {
  assert.equal(currencyMoney('JPY').valid(1.5), false);
  assert.equal(currencyMoney('KWD').valid(0.001), true);
  for (const value of [0, -1, Infinity, NaN, Number.MAX_SAFE_INTEGER])
    assert.ok(split(value, 'EQUAL', [{ userId: 'a' }]).error);
  assert.ok(
    split(1, 'EXACT', [
      { userId: 'a', amount: -1 },
      { userId: 'b', amount: 2 },
    ]).error,
  );
  assert.ok(split(1, 'EXACT', [{ userId: 'a', amount: 1.001 }]).error);
  assert.deepEqual(
    amounts(
      split(0.3, 'EXACT', [
        { userId: 'a', amount: 0.1 },
        { userId: 'b', amount: 0.2 },
      ]),
    ),
    [0.1, 0.2],
  );
});
test('percentage rounding remains nonnegative and rejects invalid percentage precision', () => {
  const result = split(0.02, 'PERCENTAGE', [
    { userId: 'a', percentage: 25 },
    { userId: 'b', percentage: 25 },
    { userId: 'c', percentage: 25 },
    { userId: 'd', percentage: 25 },
    { userId: 'e', percentage: 0 },
  ]);
  assert.deepEqual(amounts(result), [0.01, 0.01, 0, 0, 0]);
  assert.ok(
    split(1, 'PERCENTAGE', [{ userId: 'a', percentage: 99.999 }]).error,
  );
  assert.ok(split(1, 'PERCENTAGE', [{ userId: 'a', percentage: 90 }]).error);
});
test('shares use largest remainder and deterministic ties, and validate weights', () => {
  assert.deepEqual(
    amounts(
      split(0.05, 'SHARES', [
        { userId: 'a', shares: 1 },
        { userId: 'b', shares: 1 },
        { userId: 'c', shares: 1 },
      ]),
    ),
    [0.02, 0.02, 0.01],
  );
  assert.deepEqual(
    amounts(
      split(100, 'SHARES', [
        { userId: 'a', shares: 1 },
        { userId: 'b', shares: 3 },
      ]),
    ),
    [25, 75],
  );
  for (const shares of [0, -1, 1.5, 1000001, NaN])
    assert.ok(split(1, 'SHARES', [{ userId: 'a', shares }]).error);
});
test('item totals are line totals; tax and tip use original item proportions', () => {
  const result = split(132, 'ITEMIZED', [], 'PHP', {
    items: [
      {
        description: 'Dinner',
        quantity: 2,
        amount: 100,
        memberIds: ['a', 'b'],
      },
      { description: 'Coffee', quantity: 1, amount: 10, memberIds: ['a'] },
    ],
    adjustments: {
      tax: { amount: 11, allocation: 'PROPORTIONAL' },
      tip: { amount: 11, allocation: 'EQUAL' },
    },
  });
  assert.deepEqual(amounts(result), [71.5, 60.5]);
  assert.ok(
    split(132, 'ITEMIZED', [], 'PHP', {
      items: [
        { description: 'Dinner', quantity: 2, amount: 100, memberIds: [] },
      ],
    }).error,
  );
  assert.ok(
    split(132, 'ITEMIZED', [], 'PHP', {
      items: [
        { description: 'Dinner', quantity: 2, amount: 100, memberIds: ['a'] },
      ],
    }).error,
  );
});
test('zero item totals require equal adjustment allocation', () => {
  const items = [
    { description: 'Included', quantity: 1, amount: 0, memberIds: ['a', 'b'] },
  ];
  assert.ok(
    split(1, 'ITEMIZED', [], 'PHP', {
      items,
      adjustments: { tax: { amount: 1, allocation: 'PROPORTIONAL' } },
    }).error,
  );
  assert.deepEqual(
    amounts(
      split(1, 'ITEMIZED', [], 'PHP', {
        items,
        adjustments: { tax: { amount: 1, allocation: 'EQUAL' } },
      }),
    ),
    [0.5, 0.5],
  );
});
test('empty and duplicate participants are rejected', () => {
  assert.ok(split(10, 'EQUAL', []).error);
  assert.ok(split(10, 'EQUAL', [{ userId: 'a' }, { userId: 'a' }]).error);
});
test('date-only values retain their UTC calendar day', () => {
  assert.match(expenseDate('2026-10-28T23:30:00.000Z'), /28/);
});
