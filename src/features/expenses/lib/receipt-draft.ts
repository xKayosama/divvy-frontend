import { currencyMoney } from '../../../lib/finance/money.ts';
import type { ScannedReceipt, ReceiptExpenseDraft } from '../receipt-types.ts';
export const MAX_RECEIPT_BYTES = 10 * 1024 * 1024;
export function receiptFileError(file: { size: number; type: string }) {
  if (!file.size) return 'Choose a receipt file that is not empty.';
  if (file.size > MAX_RECEIPT_BYTES)
    return 'Receipt must be no larger than 10 MB.';
  if (
    !['image/jpeg', 'image/png', 'image/webp', 'application/pdf'].includes(
      file.type,
    )
  )
    return 'Use a JPEG, PNG, WebP, or PDF receipt.';
  return '';
}
export function receiptDraft(
  receipt: ScannedReceipt,
  currency: string,
  itemized: boolean,
  reviewed: boolean,
): ReceiptExpenseDraft {
  if (!receipt.isReceipt || !reviewed)
    throw new Error('Review the receipt before continuing.');
  if (receipt.currency && receipt.currency !== currency)
    throw new Error('Receipt currency must match the group currency.');
  const money = currencyMoney(currency);
  const value = (amount: number | null, zero = false) =>
    amount !== null && money.valid(amount, zero) ? String(amount) : '';
  return {
    description: receipt.merchant?.trim() ?? '',
    amount: value(receipt.total),
    date: receipt.date ?? '',
    splitType: itemized ? 'ITEMIZED' : 'EQUAL',
    ...(itemized
      ? {
          items: receipt.items.map((item) => ({
            description: item.description?.trim() ?? '',
            quantity:
              item.quantity !== null &&
              Number.isSafeInteger(item.quantity) &&
              item.quantity > 0
                ? String(item.quantity)
                : '',
            amount: value(item.total, true),
          })),
          tax: receipt.tax === null ? undefined : value(receipt.tax, true),
          tip: receipt.tip === null ? undefined : value(receipt.tip, true),
        }
      : {}),
  };
}
