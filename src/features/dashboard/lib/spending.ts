import type { DashboardPeriod } from '../types.ts';
export const spendingPeriods = [
  { value: 'all_time', label: 'All time' },
  { value: 'this_month', label: 'This month' },
  { value: 'last_month', label: 'Last month' },
] as const;
export function spendingExpensesLink(
  period: DashboardPeriod,
  category?: string,
) {
  const params = new URLSearchParams();
  if (category) params.set('category', category);
  if (period.startDate) params.set('startDate', period.startDate);
  if (period.endDate) params.set('endDate', period.endDate);
  return `/expenses${params.size ? `?${params}` : ''}`;
}
