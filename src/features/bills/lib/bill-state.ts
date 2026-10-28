import type { Bill, BillSort, BillView } from '../types.ts';
export interface BillFilters {
  search: string;
  category: string;
  status: '' | 'PENDING' | 'OVERDUE';
  recurring: '' | 'true' | 'false';
  sort: BillSort;
  page: number;
}
export const defaultBillFilters = (view: BillView): BillFilters => ({
  search: '',
  category: '',
  status: '',
  recurring: '',
  sort: view === 'history' ? 'due_latest' : 'due_soonest',
  page: 1,
});
// History always stays paid-only; upcoming never sends PAID, even when filters switch.
export function billQuery(view: BillView, filters: BillFilters) {
  return {
    view,
    page: filters.page,
    limit: 20,
    sort: filters.sort,
    ...(filters.search ? { search: filters.search } : {}),
    ...(filters.category ? { category: filters.category } : {}),
    ...(view === 'upcoming' && filters.status
      ? { status: filters.status }
      : {}),
    ...(filters.recurring ? { isRecurring: filters.recurring } : {}),
  };
}
export function billState(
  bill: Pick<Bill, 'status' | 'expenseId' | 'paymentPending'>,
) {
  if (bill.status === 'PAID') return 'paid';
  return bill.paymentPending || bill.expenseId ? 'saved-payment' : 'unpaid';
}
export function samePaymentBill(before: Bill, after: Bill) {
  return (
    before._id === after._id &&
    before.amount === after.amount &&
    before.name === after.name &&
    before.category === after.category &&
    before.notes === after.notes &&
    before.dueDate === after.dueDate
  );
}
