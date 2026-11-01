import test from 'node:test';
import assert from 'node:assert/strict';
import {
  receiptDraft,
  receiptFileError,
  MAX_RECEIPT_BYTES,
} from '../src/features/expenses/lib/receipt-draft.ts';
const receipt = {
  isReceipt: true,
  merchant: ' Cafe ',
  date: '2026-10-05',
  currency: 'PHP',
  subtotal: 200,
  tax: 24,
  tip: null,
  total: 224,
  items: [{ description: ' Lunch ', quantity: 2, unitPrice: 100, total: 200 }],
  warnings: [],
};
test('receipt imports require review and never convert between currencies', () => {
  assert.throws(() => receiptDraft(receipt, 'PHP', false, false));
  assert.throws(() => receiptDraft(receipt, 'USD', false, true));
  assert.throws(() =>
    receiptDraft({ ...receipt, isReceipt: false }, 'PHP', false, true),
  );
});
test('total-only drafts preserve receipt values without inventing item assignments', () => {
  assert.deepEqual(receiptDraft(receipt, 'PHP', false, true), {
    description: 'Cafe',
    amount: '224',
    date: '2026-10-05',
    splitType: 'EQUAL',
  });
});
test('itemized drafts use line totals, never multiply quantity twice or guess members', () => {
  const draft = receiptDraft(receipt, 'PHP', true, true);
  assert.equal(draft.amount, '224');
  assert.equal(draft.items[0].amount, '200');
  assert.equal(draft.items[0].quantity, '2');
  assert.equal(draft.tax, '24');
  assert.equal(draft.tip, undefined);
  assert.ok(!('memberIds' in draft.items[0]));
});
test('unknown values remain blank; incompatible precision is never silently rounded', () => {
  const draft = receiptDraft(
    { ...receipt, merchant: null, date: null, currency: null, total: null },
    'PHP',
    false,
    true,
  );
  assert.equal(draft.description, '');
  assert.equal(draft.date, '');
  assert.equal(draft.amount, '');
  assert.equal(
    receiptDraft(
      { ...receipt, currency: 'KWD', total: 1.234 },
      'KWD',
      false,
      true,
    ).amount,
    '1.234',
  );
  assert.equal(
    receiptDraft(
      { ...receipt, currency: 'JPY', total: 1.23 },
      'JPY',
      false,
      true,
    ).amount,
    '',
  );
  assert.equal(
    receiptDraft({ ...receipt, total: 1.234 }, 'PHP', false, true).amount,
    '',
  );
});
test('missing quantities require review and zero line totals stay valid', () => {
  const draft = receiptDraft(
    {
      ...receipt,
      items: [{ description: null, quantity: null, unitPrice: null, total: 0 }],
    },
    'PHP',
    true,
    true,
  );
  assert.deepEqual(draft.items, [
    { description: '', quantity: '', amount: '0' },
  ]);
});
test('receipt upload validation matches backend file types and 10 MB limit', () => {
  assert.equal(
    receiptFileError({ type: 'image/png', size: MAX_RECEIPT_BYTES }),
    '',
  );
  for (const type of ['image/jpeg', 'image/webp', 'application/pdf'])
    assert.equal(receiptFileError({ type, size: 10 }), '');
  assert.ok(receiptFileError({ type: 'image/png', size: 0 }));
  assert.ok(
    receiptFileError({ type: 'image/png', size: MAX_RECEIPT_BYTES + 1 }),
  );
  assert.ok(receiptFileError({ type: 'text/plain', size: 10 }));
});
