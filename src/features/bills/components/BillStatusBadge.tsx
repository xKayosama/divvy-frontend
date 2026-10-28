import type { Bill } from '../types';
import { billState } from '../lib/bill-state';
export default function BillStatusBadge({ bill }: { bill: Bill }) {
  const state = billState(bill);
  const style =
    state === 'paid'
      ? 'bg-[#DCFCE7] text-[#166534] dark:bg-[#20392B] dark:text-[#8DE0B5]'
      : state === 'saved-payment'
        ? 'bg-secondary text-secondary-foreground'
        : bill.status === 'OVERDUE'
          ? 'bg-[#FEE2E2] text-[#991B1B] dark:bg-[#3C2528] dark:text-[#FFAAAA]'
          : 'bg-[#FEF3C7] text-[#92400E] dark:bg-[#3B3020] dark:text-[#F5CD7B]';
  return (
    <span
      className={`inline-flex shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${style}`}
    >
      {state === 'paid'
        ? 'Paid'
        : state === 'saved-payment'
          ? 'Payment saved'
          : bill.status === 'OVERDUE'
            ? 'Overdue'
            : 'Pending'}
    </span>
  );
}
