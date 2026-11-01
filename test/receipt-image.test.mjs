import test from 'node:test';
import assert from 'node:assert/strict';
import {
  receiptImageSize,
  prepareReceiptImage,
  receiptScanError,
} from '../src/features/expenses/lib/receipt-image.ts';
test('camera photos are bounded by both OCR pixel budget and longest edge', () => {
  for (const [width, height] of [
    [4000, 3000],
    [8000, 6000],
    [2000, 6000],
    [10000, 10000],
  ]) {
    const size = receiptImageSize(width, height);
    assert.ok(size.width <= 2400 && size.height <= 2400);
    assert.ok(size.width * size.height <= 4_000_000);
    assert.ok(Math.abs(size.width / size.height - width / height) < 0.01);
  }
  assert.deepEqual(receiptImageSize(6000, 2000), { width: 2400, height: 800 });
});
test('small receipt images are not enlarged and invalid dimensions are rejected', () => {
  assert.deepEqual(receiptImageSize(800, 1000), { width: 800, height: 1000 });
  for (const [width, height] of [
    [0, 100],
    [-1, 100],
    [100, NaN],
    [Infinity, 100],
  ])
    assert.throws(() => receiptImageSize(width, height));
});
test('PDFs remain unchanged and cancelled preparation stops before decoding or upload', async () => {
  const file = new File(['%PDF-fixture'], 'receipt.pdf', {
    type: 'application/pdf',
  });
  assert.equal(
    await prepareReceiptImage(file, new AbortController().signal),
    file,
  );
  const controller = new AbortController();
  controller.abort();
  await assert.rejects(prepareReceiptImage(file, controller.signal), {
    name: 'AbortError',
  });
});
test('OCR timeouts are distinct from network timeouts and provider validation errors', () => {
  assert.match(receiptScanError({ status: 504 }), /scanning took too long/);
  assert.match(receiptScanError({ status: 'TIMEOUT_ERROR' }), /connection/);
  assert.equal(
    receiptScanError({ status: 429, data: { message: 'Retry in a minute.' } }),
    'Retry in a minute.',
  );
  assert.equal(
    receiptScanError(new Error('Could not prepare photo.')),
    'Could not prepare photo.',
  );
});
