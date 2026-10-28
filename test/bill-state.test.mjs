import test from 'node:test';
import assert from 'node:assert/strict';
import {
  billQuery,
  billState,
  defaultBillFilters,
  samePaymentBill,
} from '../src/features/bills/lib/bill-state.ts';
test('unpaid query is explicit and never exposes paid history', () => {
  const base = defaultBillFilters('upcoming');
  assert.deepEqual(billQuery('upcoming', base), {
    view: 'upcoming',
    page: 1,
    limit: 20,
    sort: 'due_soonest',
  });
  assert.equal(
    billQuery('upcoming', { ...base, status: 'OVERDUE' }).status,
    'OVERDUE',
  );
});
test('history ignores stale unpaid status and defaults to latest due date', () => {
  const filters = {
    ...defaultBillFilters('history'),
    status: 'OVERDUE',
    category: 'RENT',
    recurring: 'false',
    search: 'apartment',
    page: 2,
  };
  assert.deepEqual(billQuery('history', filters), {
    view: 'history',
    page: 2,
    limit: 20,
    sort: 'due_latest',
    category: 'RENT',
    isRecurring: 'false',
    search: 'apartment',
  });
  assert.equal(
    billQuery('history', defaultBillFilters('history')).status,
    undefined,
  );
});
test('view filter defaults are independent objects', () => {
  const unpaid = defaultBillFilters('upcoming'),
    history = defaultBillFilters('history');
  unpaid.category = 'RENT';
  assert.equal(history.category, '');
  assert.equal(unpaid.sort, 'due_soonest');
  assert.equal(history.sort, 'due_latest');
});
test('paid status remains locked even if legacy payment flags are missing', () => {
  assert.equal(
    billState({ status: 'PAID', expenseId: null, paymentPending: false }),
    'paid',
  );
  assert.equal(
    billState({ status: 'PAID', expenseId: 'expense', paymentPending: true }),
    'paid',
  );
});
test('any unpaid expense reservation locks edits and offers resume', () => {
  assert.equal(
    billState({
      status: 'PENDING',
      expenseId: 'expense',
      paymentPending: false,
    }),
    'saved-payment',
  );
  assert.equal(
    billState({ status: 'OVERDUE', expenseId: null, paymentPending: true }),
    'saved-payment',
  );
  assert.equal(
    billState({ status: 'OVERDUE', expenseId: null, paymentPending: false }),
    'unpaid',
  );
});
test('payment review detects changes to every saved expense field and due date', () => {
  const before = {
    _id: 'bill',
    amount: 100,
    name: 'Rent',
    category: 'RENT',
    notes: 'Reference',
    dueDate: '2026-10-28',
  };
  assert.equal(
    samePaymentBill(before, { ...before, generatedThrough: 1 }),
    true,
  );
  for (const [key, value] of [
    ['_id', 'other'],
    ['amount', 101],
    ['name', 'New rent'],
    ['category', 'WATER'],
    ['notes', 'Changed'],
    ['dueDate', '2026-11-28'],
  ])
    assert.equal(
      samePaymentBill(before, { ...before, [key]: value }),
      false,
      key,
    );
});
