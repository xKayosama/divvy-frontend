import { useState } from 'react';
import { Bell, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { currencyMoney } from '@/lib/finance/money';
import { formatDate } from '@/lib/date';
import { useGetBillOverviewQuery } from '../billApi';
import type { ReminderBucket } from '../types';
export default function BillReminders({
  groupId,
  currency,
  onOpen,
}: {
  groupId: string;
  currency: string;
  onOpen: (id: string) => void;
}) {
  const [showReminders, setShowReminders] = useState(false);
  const overview = useGetBillOverviewQuery(groupId, { pollingInterval: 60000 });
  const reminders = overview.currentData?.data.billReminders;
  const money = currencyMoney(currency);
  return (
    <section aria-label="Bill reminders" className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <Bell className="size-4 text-primary" />
          Across all unpaid bills · UTC
        </h2>
        <Button
          variant="ghost"
          className="text-primary"
          onClick={() => setShowReminders((current) => !current)}
          aria-expanded={showReminders}
        >
          {showReminders ? 'Hide reminders' : 'View reminders'}
        </Button>
      </div>
      {overview.error ? (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-card p-4 text-sm"
        >
          <p>Bill reminders are temporarily unavailable.</p>
          <Button variant="outline" onClick={() => overview.refetch()}>
            Retry reminders
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          {(
            [
              { key: 'overdue', label: 'Overdue' },
              { key: 'dueToday', label: 'Due today' },
              { key: 'dueSoon', label: 'Next 7 days' },
            ] as const
          ).map(({ key, label }) => (
            <div
              key={key}
              className={`rounded-2xl border p-3 sm:rounded-3xl sm:p-5 ${key === 'dueToday' ? 'bg-brand-spending text-white' : 'bg-card'}`}
            >
              <p
                className={`flex flex-wrap items-center justify-between gap-1 text-xs sm:text-sm ${key === 'dueToday' ? 'text-white/80' : 'text-muted-foreground'}`}
              >
                {label}
                <CalendarDays
                  className={`size-4 ${key === 'dueToday' ? 'text-accent' : key === 'overdue' ? 'text-destructive' : 'text-primary'}`}
                />
              </p>
              <p
                className={`mt-3 break-words text-lg sm:mt-4 sm:text-3xl font-semibold ${key === 'overdue' ? 'text-destructive' : ''}`}
              >
                {reminders ? money.format(reminders[key].amount) : '—'}
              </p>
              <p
                className={`mt-2 text-xs ${key === 'dueToday' ? 'text-white/75' : 'text-muted-foreground'}`}
              >
                {reminders
                  ? `${reminders[key].count} ${reminders[key].count === 1 ? 'bill' : 'bills'}`
                  : 'Loading reminders…'}
                <span className="hidden sm:inline">
                  {key === 'dueSoon' ? ' · from tomorrow' : ''}
                </span>
              </p>
            </div>
          ))}
        </div>
      )}
      {showReminders && reminders && (
        <div className="grid gap-4 rounded-3xl border bg-card p-5 sm:grid-cols-3">
          {(
            [
              { key: 'overdue', label: 'Overdue' },
              { key: 'dueToday', label: 'Due today' },
              { key: 'dueSoon', label: 'Next 7 days' },
            ] as const
          ).map(({ key, label }) => (
            <ReminderList
              key={key}
              title={label}
              bucket={reminders[key]}
              currency={currency}
              onOpen={onOpen}
            />
          ))}
          <p className="text-xs leading-5 text-muted-foreground sm:col-span-3">
            Up to five bills per section. Reminders follow UTC calendar dates
            and refresh every minute.
          </p>
        </div>
      )}
    </section>
  );
}

function ReminderList({
  title,
  bucket,
  currency,
  onOpen,
}: {
  title: string;
  bucket: ReminderBucket;
  currency: string;
  onOpen: (id: string) => void;
}) {
  return (
    <section className="space-y-2">
      <h3 className="text-sm font-semibold">
        {title} ({bucket.count})
      </h3>
      {!bucket.bills.length ? (
        <p className="text-xs text-muted-foreground">
          No bills in this window.
        </p>
      ) : (
        bucket.bills.map((bill) => (
          <button
            key={bill._id}
            className="block w-full rounded-xl bg-muted p-3 text-left outline-none hover:bg-secondary focus-visible:ring-2 focus-visible:ring-primary"
            onClick={() => onOpen(bill._id)}
          >
            <span className="block truncate text-sm font-medium">
              {bill.name}
            </span>
            <span className="mt-1 block text-xs text-muted-foreground">
              {currencyMoney(currency).format(bill.amount)} ·{' '}
              {formatDate(bill.dueDate)}
            </span>
          </button>
        ))
      )}
    </section>
  );
}
