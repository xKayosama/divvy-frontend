import { currencyMoney } from './money.ts';
import type { Adjustments, ExpenseItem, SplitType } from './types.ts';
export interface SplitInput {
  amount: number;
  currency: string;
  splitType: SplitType;
  participants: {
    userId: string;
    amount?: number;
    percentage?: number | null;
    shares?: number | null;
  }[];
  items?: ExpenseItem[];
  adjustments?: Adjustments;
}
export type SplitResult =
  | { participants: { userId: string; amount: number }[]; error?: never }
  | { error: string; participants?: never };
// Allocate in native currency units, using the same remainder rules as the API.
function weighted(total: bigint, weights: bigint[]) {
  const denominator = weights.reduce((a, b) => a + b, 0n);
  if (!denominator) return weights.map(() => 0n);
  const parts = weights.map((weight, index) => ({
    index,
    units: (total * weight) / denominator,
    remainder: (total * weight) % denominator,
  }));
  const ordered = [...parts].sort((a, b) =>
    a.remainder === b.remainder
      ? a.index - b.index
      : a.remainder > b.remainder
        ? -1
        : 1,
  );
  const rest = Number(
    total - parts.reduce((sum, part) => sum + part.units, 0n),
  );
  for (let i = 0; i < rest; i++) ordered[i].units++;
  return parts.map((part) => part.units);
}
export function calculateSplit(input: SplitInput): SplitResult {
  const { amount, currency, splitType, participants, items, adjustments } =
    input;
  const m = currencyMoney(currency);
  if (!m.valid(amount))
    return {
      error: `Enter a positive ${currency} amount with ${m.digits} decimal places or fewer.`,
    };
  const total = BigInt(m.units(amount));
  if (splitType === 'ITEMIZED') {
    if (!items?.length || items.length > 100)
      return { error: 'Add between 1 and 100 items.' };
    const amounts = new Map<string, bigint>();
    let sum = 0n;
    for (const [index, item] of items.entries()) {
      if (!item.description.trim() || item.description.trim().length > 200)
        return {
          error: `Item ${index + 1}: enter a description of up to 200 characters.`,
        };
      if (!currencyMoney('KWD').valid(item.quantity) || item.quantity > 1000000)
        return {
          error: `Item ${index + 1}: quantity must be positive, at most 1,000,000, with up to 3 decimals.`,
        };
      if (!m.valid(item.amount, true))
        return { error: `Item ${index + 1}: enter a valid line total.` };
      if (
        !item.memberIds.length ||
        new Set(item.memberIds).size !== item.memberIds.length
      )
        return { error: `Item ${index + 1}: select its members.` };
      const units = BigInt(m.units(item.amount));
      sum += units;
      const base = units / BigInt(item.memberIds.length),
        remainder = units % BigInt(item.memberIds.length);
      item.memberIds.forEach((id, i) =>
        amounts.set(
          id,
          (amounts.get(id) ?? 0n) + base + (i === 0 ? remainder : 0n),
        ),
      );
    }
    const baseShares = [...amounts.values()];
    for (const key of ['tax', 'tip'] as const) {
      const charge = adjustments?.[key];
      if (!charge) continue;
      if (!m.valid(charge.amount, true))
        return { error: `Enter a valid ${key} amount.` };
      const units = BigInt(m.units(charge.amount));
      sum += units;
      const weights = baseShares.map((value) =>
        charge.allocation === 'EQUAL' ? 1n : value,
      );
      if (units > 0n && weights.every((value) => value === 0n))
        return {
          error: `Choose equal ${key} allocation when item totals are zero.`,
        };
      const parts = weighted(units, weights);
      [...amounts.keys()].forEach((id, i) =>
        amounts.set(id, amounts.get(id)! + parts[i]),
      );
    }
    if (sum !== total)
      return {
        error: 'Item totals plus tax and tip must equal the expense amount.',
      };
    return {
      participants: [...amounts].map(([userId, units]) => ({
        userId,
        amount: Number(units) / m.scale,
      })),
    };
  }
  if (!participants.length)
    return { error: 'Select at least one participant.' };
  if (new Set(participants.map((p) => p.userId)).size !== participants.length)
    return { error: 'Select each participant only once.' };
  let units: bigint[];
  if (splitType === 'EQUAL') {
    const base = total / BigInt(participants.length);
    units = participants.map(
      (_, i) => base + (i === 0 ? total % BigInt(participants.length) : 0n),
    );
  } else if (splitType === 'EXACT') {
    if (participants.some((p) => !m.valid(p.amount ?? NaN, true)))
      return {
        error: `Enter nonnegative amounts with ${m.digits} decimal places or fewer.`,
      };
    units = participants.map((p) => BigInt(m.units(p.amount!)));
    if (units.reduce((a, b) => a + b, 0n) !== total)
      return { error: 'Participant amounts must equal the expense amount.' };
  } else if (splitType === 'PERCENTAGE') {
    const percent = currencyMoney('PHP');
    if (
      participants.some(
        (p) => !percent.valid(p.percentage ?? NaN, true) || p.percentage! > 100,
      )
    )
      return {
        error: 'Enter percentages between 0 and 100 with up to 2 decimals.',
      };
    if (
      participants.reduce((sum, p) => sum + percent.units(p.percentage!), 0) !==
      10000
    )
      return { error: 'Participant percentages must total exactly 100%.' };
    units = participants.map(
      (p) => (total * BigInt(percent.units(p.percentage!)) + 5000n) / 10000n,
    );
    const last = units.length - 1;
    units[last] += total - units.reduce((a, b) => a + b, 0n);
    let excess = units[last] < 0n ? -units[last] : 0n;
    if (excess) units[last] = 0n;
    for (let i = last - 1; i >= 0 && excess; i--) {
      const reduce = units[i] < excess ? units[i] : excess;
      units[i] -= reduce;
      excess -= reduce;
    }
  } else {
    if (
      participants.some(
        (p) =>
          !Number.isInteger(p.shares) || p.shares! < 1 || p.shares! > 1000000,
      )
    )
      return { error: 'Shares must be whole numbers from 1 to 1,000,000.' };
    units = weighted(
      total,
      participants.map((p) => BigInt(p.shares!)),
    );
  }
  return {
    participants: participants.map((p, i) => ({
      userId: p.userId,
      amount: Number(units[i]) / m.scale,
    })),
  };
}
