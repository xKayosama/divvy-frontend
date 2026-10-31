import { currencyMoney } from '../../../lib/finance/money.ts';
import type { SuggestedSettlement } from '../types.ts';
export function paymentAmountError(
  text: string,
  currency: string,
  maximum: number,
) {
  const m = currencyMoney(currency);
  const amount = Number(text.trim());
  if (!/^\d+(\.\d+)?$/.test(text.trim()) || !m.valid(amount))
    return `Enter a positive amount with up to ${m.digits} decimal places.`;
  if (m.units(amount) > m.units(maximum))
    return 'The amount exceeds this suggested repayment. Refresh repayments.';
  return '';
}
export function localPaymentTime(now = new Date()) {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
}
export function paymentDateError(value: string, now = Date.now()) {
  const date = new Date(value);
  return !value || !Number.isFinite(date.getTime()) || date.getTime() > now
    ? 'Choose a valid payment time that is not in the future.'
    : '';
}
export function currentRepayment(
  suggestions: SuggestedSettlement[],
  sender: string,
  recipient: string,
) {
  return suggestions.find(
    (item) => item.from?._id === sender && item.to?._id === recipient,
  );
}
export function uncertainSave(error: unknown) {
  if (!error || typeof error !== 'object' || !('status' in error)) return true;
  return typeof error.status !== 'number' || error.status >= 500;
}
