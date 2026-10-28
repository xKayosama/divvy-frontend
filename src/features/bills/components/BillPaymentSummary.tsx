import { currencyMoney } from '@/lib/finance/money';
import { formatDate } from '@/lib/date';
import type { Bill } from '../types';

export default function BillPaymentSummary({
  bill,
  currency,
}: {
  bill: Bill;
  currency: string;
}) {
  return (
    <section className="rounded-2xl bg-brand-spending p-4 text-white">
      <p className="break-words font-semibold">{bill.name}</p>
      <p className="mt-2 break-words text-3xl font-semibold">
        {currencyMoney(currency).format(bill.amount)}
      </p>
      <p className="mt-2 text-xs text-white/75">
        Due {formatDate(bill.dueDate)} (UTC)
      </p>
    </section>
  );
}
