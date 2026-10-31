import type { RecordSettlementPayload } from '../types';
const prefix = 'divvy:settlement-attempt:';
const key = (group: string, account: string) => `${prefix}${group}:${account}`;
export function loadPaymentAttempt(
  group: string,
  account: string,
): RecordSettlementPayload | null {
  try {
    const value = JSON.parse(
      sessionStorage.getItem(key(group, account)) || 'null',
    );
    if (
      value &&
      typeof value.to === 'string' &&
      typeof value.amount === 'number' &&
      Number.isFinite(value.amount) &&
      value.amount > 0 &&
      typeof value.paidAt === 'string' &&
      Number.isFinite(Date.parse(value.paidAt)) &&
      typeof value.requestId === 'string' &&
      /^[a-zA-Z0-9_-]{8,128}$/.test(value.requestId)
    )
      return {
        to: value.to,
        amount: value.amount,
        paidAt: value.paidAt,
        requestId: value.requestId,
      };
  } catch {
    /* Storage may be unavailable. Never trust invalid drafts. */
  }
  return null;
}
export function storePaymentAttempt(
  group: string,
  account: string,
  payload: RecordSettlementPayload,
) {
  sessionStorage.setItem(key(group, account), JSON.stringify(payload));
}
export function removePaymentAttempt(group: string, account: string) {
  sessionStorage.removeItem(key(group, account));
}
export function clearPaymentAttempts() {
  try {
    for (let i = sessionStorage.length - 1; i >= 0; i--) {
      const name = sessionStorage.key(i);
      if (name?.startsWith(prefix)) sessionStorage.removeItem(name);
    }
  } catch {
    /* Session cleanup must not prevent logout. */
  }
}
