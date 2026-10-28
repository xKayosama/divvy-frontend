import { useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowUpRight,
  Bell,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  FileText,
  Plus,
  Repeat2,
  Search,
  X,
} from 'lucide-react';
import { useAppSelector } from '@/app/hooks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Household } from '@/features/household/householdApi';
import { categoryLabel, personName } from '@/features/expenses/types';
import {
  currencyMoney,
  expenseDate,
  apiMessage,
} from '@/features/expenses/lib/money';
import ExpenseDetailsDialog from '@/features/expenses/components/ExpenseDetailsDialog';
import { useGetBillsQuery, useGetBillOverviewQuery } from '../billApi';
import { billCategories } from '../types';
import type { Bill, BillView, BillSort, ReminderBucket } from '../types';
import { billState, defaultBillFilters } from '../lib/bill-state';
import type { BillFilters } from '../lib/bill-state';
import BillFormDialog from '../components/BillFormDialog';
import BillDetailsDialog from '../components/BillDetailsDialog';
import DeleteBillDialog from '../components/DeleteBillDialog';
import BillPaymentDialog from '../components/BillPaymentDialog';
import BillStatusBadge from '../components/BillStatusBadge';

export default function BillsPage() {
  const group = useAppSelector((state) => state.household.selectedHousehold);
  const [search] = useSearchParams();
  return group ? (
    <GroupBills
      key={`${group.id}:${search.toString()}`}
      group={group}
      initialView={search.get('view') === 'history' ? 'history' : 'upcoming'}
      initialStatus={search.get('status')}
      initialBillId={search.get('billId')}
    />
  ) : (
    <Navigate to="/groups" replace />
  );
}
const selectStyle =
  'h-11 w-full min-w-0 rounded-xl border bg-card px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15';
function GroupBills({
  group,
  initialView,
  initialStatus,
  initialBillId,
}: {
  group: Household;
  initialView: BillView;
  initialStatus: string | null;
  initialBillId: string | null;
}) {
  const navigate = useNavigate();
  const [view, setView] = useState<BillView>(initialView);
  const [filters, setFilters] = useState<Record<BillView, BillFilters>>(() => ({
    upcoming: {
      ...defaultBillFilters('upcoming'),
      ...(initialStatus === 'PENDING' || initialStatus === 'OVERDUE'
        ? { status: initialStatus }
        : {}),
    },
    history: defaultBillFilters('history'),
  }));
  const [draft, setDraft] = useState({ upcoming: '', history: '' });
  const [form, setForm] = useState<Bill | 'new' | null>(null),
    [detail, setDetail] = useState<string | null>(initialBillId),
    [deleting, setDeleting] = useState<Bill | null>(null),
    [payment, setPayment] = useState<string | null>(null),
    [expense, setExpense] = useState<string | null>(null);
  const [notice, setNotice] = useState('');
  const [showReminders, setShowReminders] = useState(false);
  const active = filters[view];
  const {
    currentData: data,
    error,
    isFetching,
    refetch,
  } = useGetBillsQuery(
    { groupId: group.id, view, filters: active },
    { pollingInterval: 60000 },
  );
  const overview = useGetBillOverviewQuery(group.id, {
    pollingInterval: 60000,
  });
  const bills = data?.data.bills ?? [],
    total = data?.pagination.total ?? 0,
    pages = Math.max(1, data?.pagination.totalPages ?? 1);
  const money = currencyMoney(group.currency),
    reminders = overview.currentData?.data.billReminders;
  const hasFilters = !!(
    active.search ||
    active.category ||
    active.recurring ||
    (view === 'upcoming' && active.status) ||
    active.sort !== defaultBillFilters(view).sort
  );
  const sum = bills.reduce(
    (units, bill) => units + BigInt(money.units(bill.amount)),
    0n,
  );
  function change(patch: Partial<BillFilters>) {
    setFilters((current) => ({
      ...current,
      [view]: { ...current[view], ...patch, page: 1 },
    }));
  }
  function clear() {
    setDraft((current) => ({ ...current, [view]: '' }));
    setFilters((current) => ({ ...current, [view]: defaultBillFilters(view) }));
  }
  function edit(bill: Bill | 'new') {
    setDetail(null);
    setForm(bill);
    setNotice('');
  }
  function startPayment(id: string) {
    setDetail(null);
    setPayment(id);
    setNotice('');
  }
  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 pb-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[.18em] text-primary">
            {group.name} · Stay ahead
          </p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Upcoming bills
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Know what’s due. Keep a clear record of what’s paid.
          </p>
        </div>
        <Button className="h-11 px-5" onClick={() => edit('new')}>
          <Plus className="size-4" />
          Add bill
        </Button>
      </div>
      {notice && (
        <div
          role="status"
          className="flex items-center justify-between gap-3 rounded-xl border border-primary/20 bg-secondary px-4 py-3 text-sm text-secondary-foreground"
        >
          {notice}
          <Button
            variant="ghost"
            size="icon"
            aria-label="Dismiss message"
            onClick={() => setNotice('')}
          >
            <X className="size-4" />
          </Button>
        </div>
      )}
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
                currency={group.currency}
                onOpen={setDetail}
              />
            ))}
            <p className="text-xs leading-5 text-muted-foreground sm:col-span-3">
              Up to five bills per section. Reminders follow UTC calendar dates
              and refresh every minute.
            </p>
          </div>
        )}
      </section>
      <div
        role="tablist"
        aria-label="Bill views"
        onKeyDown={(event) => {
          const next =
            event.key === 'Home'
              ? 'upcoming'
              : event.key === 'End'
                ? 'history'
                : ['ArrowLeft', 'ArrowRight'].includes(event.key)
                  ? view === 'upcoming'
                    ? 'history'
                    : 'upcoming'
                  : null;
          if (next) {
            event.preventDefault();
            setView(next);
            document.getElementById(`bills-${next}-tab`)?.focus();
          }
        }}
        className="flex w-fit gap-1 rounded-2xl border bg-card p-1"
      >
        <Button
          role="tab"
          id="bills-upcoming-tab"
          aria-controls="bills-panel"
          aria-selected={view === 'upcoming'}
          tabIndex={view === 'upcoming' ? 0 : -1}
          variant={view === 'upcoming' ? 'default' : 'ghost'}
          className="h-10 px-5"
          onClick={() => setView('upcoming')}
        >
          Unpaid
        </Button>
        <Button
          role="tab"
          id="bills-history-tab"
          aria-controls="bills-panel"
          aria-selected={view === 'history'}
          tabIndex={view === 'history' ? 0 : -1}
          variant={view === 'history' ? 'default' : 'ghost'}
          className="h-10 px-5"
          onClick={() => setView('history')}
        >
          History
        </Button>
      </div>
      <div
        id="bills-panel"
        role="tabpanel"
        aria-labelledby={`bills-${view}-tab`}
        className="space-y-5"
      >
        <section
          aria-label="Bill filters"
          className="space-y-4 rounded-3xl border bg-card p-4 sm:p-5"
        >
          <form
            className="flex gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              change({ search: draft[view].trim() });
            }}
          >
            <div className="relative min-w-0 flex-1">
              <Search className="absolute left-3 top-3.5 size-4 text-muted-foreground" />
              <Input
                aria-label="Search bills"
                type="search"
                maxLength={200}
                className="h-11 pl-10"
                placeholder="Search bill names or notes…"
                value={draft[view]}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    [view]: event.target.value,
                  }))
                }
              />
            </div>
            <Button type="submit" className="h-11 px-4">
              Search
            </Button>
          </form>
          <div
            className={`grid grid-cols-2 gap-3 ${view === 'upcoming' ? 'lg:grid-cols-4' : 'lg:grid-cols-3'}`}
          >
            <label className="space-y-2 text-xs font-medium">
              Category
              <select
                className={selectStyle}
                aria-label="Filter bill category"
                value={active.category}
                onChange={(event) => change({ category: event.target.value })}
              >
                <option value="">All categories</option>
                {billCategories.map((category) => (
                  <option key={category} value={category}>
                    {categoryLabel(category)}
                  </option>
                ))}
              </select>
            </label>
            {view === 'upcoming' && (
              <label className="space-y-2 text-xs font-medium">
                Status
                <select
                  className={selectStyle}
                  aria-label="Filter bill status"
                  value={active.status}
                  onChange={(event) =>
                    change({
                      status: event.target.value as BillFilters['status'],
                    })
                  }
                >
                  <option value="">All unpaid</option>
                  <option value="PENDING">Pending</option>
                  <option value="OVERDUE">Overdue</option>
                </select>
              </label>
            )}
            <label className="space-y-2 text-xs font-medium">
              Repeat
              <select
                className={selectStyle}
                aria-label="Filter bill recurrence"
                value={active.recurring}
                onChange={(event) =>
                  change({
                    recurring: event.target.value as BillFilters['recurring'],
                  })
                }
              >
                <option value="">All bills</option>
                <option value="true">Recurring sources</option>
                <option value="false">One-time & generated bills</option>
              </select>
            </label>
            <label className="space-y-2 text-xs font-medium">
              Sort by
              <select
                className={selectStyle}
                aria-label="Sort bills"
                value={active.sort}
                onChange={(event) =>
                  change({ sort: event.target.value as BillSort })
                }
              >
                <option value="due_soonest">Nearest due date</option>
                <option value="due_latest">Latest due date</option>
                <option value="amount_high">Highest amount</option>
                <option value="amount_low">Lowest amount</option>
              </select>
            </label>
          </div>
          {hasFilters && (
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs text-muted-foreground">
                Filters stay separate for Unpaid and History.
              </p>
              <Button variant="ghost" onClick={clear}>
                <X className="size-3" />
                Clear filters
              </Button>
            </div>
          )}
        </section>
        <section
          aria-label="Bill list"
          className="overflow-hidden rounded-3xl border bg-card"
          aria-busy={isFetching}
        >
          <div className="flex flex-wrap items-center justify-between gap-2 border-b px-5 py-4">
            <h2 className="font-semibold">
              {view === 'upcoming' ? 'Unpaid bills' : 'Payment history'}
            </h2>
            <p className="text-xs text-muted-foreground">
              {isFetching
                ? 'Updating…'
                : data
                  ? `${total} bills · ${money.format(Number(sum) / money.scale)} on this page`
                  : ''}
            </p>
          </div>
          {error ? (
            <div role="alert" className="space-y-4 p-10 text-center">
              <p className="text-destructive">
                {apiMessage(error, 'We couldn’t load bills.')}
              </p>
              <Button variant="outline" onClick={() => refetch()}>
                Try again
              </Button>
            </div>
          ) : !data ? (
            <p role="status" className="p-10 text-center text-muted-foreground">
              Loading bills…
            </p>
          ) : !bills.length ? (
            <div className="px-5 py-14 text-center">
              <FileText className="mx-auto mb-4 size-10 text-primary" />
              <h3 className="text-xl font-semibold">
                {active.page > pages
                  ? 'No more bills on this page'
                  : hasFilters
                    ? 'No matching bills'
                    : view === 'history'
                      ? 'No paid bills yet'
                      : 'You’re all caught up'}
              </h3>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
                {active.page > pages
                  ? 'The list changed. Return to its first page.'
                  : hasFilters
                    ? 'Try another search or clear the filters.'
                    : view === 'history'
                      ? 'Recorded bill payments will appear here.'
                      : 'Add your next bill and keep its due date in sight.'}
              </p>
              {(hasFilters || active.page > pages) && (
                <Button
                  variant="outline"
                  className="mt-5"
                  onClick={() => (active.page > pages ? change({}) : clear())}
                >
                  {active.page > pages ? 'First page' : 'Clear filters'}
                </Button>
              )}
            </div>
          ) : (
            <div className="divide-y">
              {bills.map((bill) => (
                <div
                  key={bill._id}
                  className="flex flex-wrap items-center gap-2 px-4 py-3 transition hover:bg-secondary/40 sm:gap-4 sm:px-5"
                >
                  <button
                    className="group flex min-w-0 flex-1 items-center gap-3 py-1 text-left outline-none focus-visible:ring-2 focus-visible:ring-primary sm:gap-4"
                    onClick={() => setDetail(bill._id)}
                  >
                    <span className="hidden size-11 shrink-0 place-items-center rounded-2xl bg-secondary text-primary sm:grid">
                      <FileText className="size-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold sm:text-base">
                        {bill.name}
                      </span>
                      <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                        {categoryLabel(bill.category)} · Due{' '}
                        {expenseDate(bill.dueDate)}
                      </span>
                      <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                        {bill.isRecurring && (
                          <span className="inline-flex items-center gap-1">
                            <Repeat2 className="size-3" />
                            {categoryLabel(bill.recurrence ?? 'Recurring')}
                          </span>
                        )}
                        {bill.recurrenceSourceId && (
                          <span>Generated occurrence</span>
                        )}
                        {bill.status === 'PAID' && (
                          <span>
                            Paid by{' '}
                            {bill.paidBy
                              ? personName(bill.paidBy)
                              : 'unrecorded payer'}
                          </span>
                        )}
                      </span>
                    </span>
                    <span className="max-w-[45%] space-y-2 text-right">
                      <strong className="block break-words text-sm text-primary sm:text-base">
                        {money.format(bill.amount)}
                      </strong>
                      <BillStatusBadge bill={bill} />
                    </span>
                    <ArrowUpRight className="hidden size-4 shrink-0 text-muted-foreground lg:block" />
                  </button>
                  {billState(bill) !== 'paid' && (
                    <Button
                      className="ml-auto h-9 px-3"
                      variant="outline"
                      aria-label={`${billState(bill) === 'saved-payment' ? 'Finish saved payment for' : 'Record payment for'} ${bill.name}`}
                      onClick={() => startPayment(bill._id)}
                    >
                      {billState(bill) === 'saved-payment'
                        ? 'Finish saved payment'
                        : 'Record payment'}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
          {data && !error && (pages > 1 || active.page > 1) && (
            <div className="flex flex-wrap items-center justify-between gap-3 border-t px-5 py-4">
              <p className="text-xs text-muted-foreground">
                Page {active.page} of {pages} · {total} bills
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  disabled={isFetching || active.page <= 1}
                  onClick={() =>
                    setFilters((current) => ({
                      ...current,
                      [view]: { ...current[view], page: active.page - 1 },
                    }))
                  }
                >
                  <ChevronLeft className="size-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  disabled={isFetching || !data.pagination.hasNextPage}
                  onClick={() =>
                    setFilters((current) => ({
                      ...current,
                      [view]: { ...current[view], page: active.page + 1 },
                    }))
                  }
                >
                  Next
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          )}
        </section>
      </div>
      {form && (
        <BillFormDialog
          key={form === 'new' ? 'new' : form._id}
          bill={form === 'new' ? undefined : form}
          groupId={group.id}
          currency={group.currency}
          onClose={() => setForm(null)}
          onSaved={(bill) => {
            setNotice(
              `“${bill.name}” ${form === 'new' ? 'added' : 'updated'}.`,
            );
            if (form === 'new') {
              setView('upcoming');
              setFilters((current) => ({
                ...current,
                upcoming: defaultBillFilters('upcoming'),
              }));
              setDraft((current) => ({ ...current, upcoming: '' }));
            }
          }}
        />
      )}
      {detail && (
        <BillDetailsDialog
          billId={detail}
          groupId={group.id}
          currency={group.currency}
          onClose={() => setDetail(null)}
          onEdit={edit}
          onDelete={(bill) => {
            setDetail(null);
            setDeleting(bill);
          }}
          onPay={startPayment}
          onSource={setDetail}
          onExpense={(id) => {
            setDetail(null);
            setExpense(id);
          }}
        />
      )}
      {deleting && (
        <DeleteBillDialog
          key={deleting._id}
          bill={deleting}
          onClose={() => setDeleting(null)}
          onDeleted={() => {
            change({});
            setNotice('Bill deleted.');
          }}
        />
      )}
      {payment && (
        <BillPaymentDialog
          billId={payment}
          groupId={group.id}
          currency={group.currency}
          onClose={() => setPayment(null)}
          onPaid={(bill) => {
            setPayment(null);
            setView('history');
            setFilters((current) => ({
              ...current,
              history: defaultBillFilters('history'),
            }));
            setDraft((current) => ({ ...current, history: '' }));
            setDetail(bill._id);
            setNotice(
              `“${bill.name}” is paid. View its linked expense for the split.`,
            );
          }}
        />
      )}
      {expense && (
        <ExpenseDetailsDialog
          expenseId={expense}
          currency={group.currency}
          onClose={() => setExpense(null)}
          onEdit={() => navigate('/expenses')}
          onDelete={() => navigate('/expenses')}
          onOpenSource={setExpense}
        />
      )}
    </div>
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
              {expenseDate(bill.dueDate)}
            </span>
          </button>
        ))
      )}
    </section>
  );
}
