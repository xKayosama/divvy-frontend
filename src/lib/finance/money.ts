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
