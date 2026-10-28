import precisions from './currency-precision.json' with { type: 'json' };
export function currencyMoney(currency: string) {
  const digits = (precisions as Record<string, number>)[currency] ?? 2;
  const scale = 10 ** digits;
  const units = (value: number) => Math.round(value * scale);
  const valid = (value: number, zero = false) =>
    Number.isFinite(value) &&
    (zero ? value >= 0 : value > 0) &&
    Number.isSafeInteger(units(value)) &&
    Number(value.toFixed(digits)) === value;
  return {
    digits,
    scale,
    units,
    valid,
    step: 1 / scale,
    format: (value: number) =>
      new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency,
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
      }).format(value),
  };
}
export function apiMessage(
  error: unknown,
  fallback = 'Something went wrong. Please try again.',
) {
  return (error as { data?: { message?: string } })?.data?.message || fallback;
}
export function expenseDate(value: string) {
  const date = new Date(value);
  return Number.isFinite(date.getTime())
    ? date.toLocaleDateString('en-PH', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        timeZone: 'UTC',
      })
    : 'Unknown date';
}
export function todayDate() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
