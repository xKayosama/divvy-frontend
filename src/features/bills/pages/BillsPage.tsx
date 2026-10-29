import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { PageHeader } from '@/components/shell/PageHeader';
import { FormSelect } from '@/components/ui/form-select';
import BillReminders from '../components/BillReminders';
import { useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowUpRight,
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
import type { Group } from '@/features/groups/types';
import { formatLabel as categoryLabel, personName } from '@/lib/format';
import { currencyMoney } from '@/lib/finance/money';
import { apiMessage } from '@/services/api-error';
import { formatDate } from '@/lib/date';
import ExpenseDetailsDialog from '@/features/expenses/components/ExpenseDetailsDialog';
import { useGetBillsQuery } from '../billApi';
import { billCategories } from '../types';
import type { Bill, BillView, BillSort } from '../types';
import { billState, defaultBillFilters } from '../lib/bill-state';
import type { BillFilters } from '../lib/bill-state';
import BillFormDialog from '../components/BillFormDialog';
import BillDetailsDialog from '../components/BillDetailsDialog';
import DeleteBillDialog from '../components/DeleteBillDialog';
import BillPaymentDialog from '../components/BillPaymentDialog';
import BillStatusBadge from '../components/BillStatusBadge';

export default function BillsPage() {
  const group = useAppSelector((state) => state.groups.selectedGroup);
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
function GroupBills({
  group,
  initialView,
  initialStatus,
  initialBillId,
}: {
  group: Group;
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
  const bills = data?.data.bills ?? [],
    total = data?.pagination.total ?? 0,
    pages = Math.max(1, data?.pagination.totalPages ?? 1);
  const money = currencyMoney(group.currency);
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
    <div className="mx-auto flex w-full max-w-330 flex-col gap-6 pb-6">
      <PageHeader
        eyebrow={`${group.name} · Stay ahead`}
        title="Upcoming bills"
        description="Know what’s due. Keep a clear record of what’s paid."
        action={
          <Button className="h-11 px-5" onClick={() => edit('new')}>
            <Plus data-icon="inline-start" />
            Add bill
          </Button>
        }
      />
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
      <BillReminders
        groupId={group.id}
        currency={group.currency}
        onOpen={setDetail}
      />
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
        <Card
          role="region"
          aria-label="Bill filters"
          className="rounded-2xl py-0 shadow-sm"
        >
          <CardContent className="flex flex-col gap-4 p-5">
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
                <FormSelect
                  aria-label="Filter bill category"
                  value={active.category}
                  onValueChange={(value) => change({ category: value })}
                  options={[
                    { value: '', label: 'All categories' },
                    ...billCategories.map((value) => ({
                      value,
                      label: categoryLabel(value),
                    })),
                  ]}
                />
              </label>
              {view === 'upcoming' && (
                <label className="space-y-2 text-xs font-medium">
                  Status
                  <FormSelect
                    aria-label="Filter bill status"
                    value={active.status}
                    onValueChange={(value) =>
                      change({ status: value as BillFilters['status'] })
                    }
                    options={[
                      { value: '', label: 'All unpaid' },
                      { value: 'PENDING', label: 'Pending' },
                      { value: 'OVERDUE', label: 'Overdue' },
                    ]}
                  />
                </label>
              )}
              <label className="space-y-2 text-xs font-medium">
                Repeat
                <FormSelect
                  aria-label="Filter bill recurrence"
                  value={active.recurring}
                  onValueChange={(value) =>
                    change({ recurring: value as BillFilters['recurring'] })
                  }
                  options={[
                    { value: '', label: 'All bills' },
                    { value: 'true', label: 'Recurring sources' },
                    { value: 'false', label: 'One-time & generated bills' },
                  ]}
                />
              </label>
              <label className="space-y-2 text-xs font-medium">
                Sort by
                <FormSelect
                  aria-label="Sort bills"
                  value={active.sort}
                  onValueChange={(value) => change({ sort: value as BillSort })}
                  options={[
                    { value: 'due_soonest', label: 'Nearest due date' },
                    { value: 'due_latest', label: 'Latest due date' },
                    { value: 'amount_high', label: 'Highest amount' },
                    { value: 'amount_low', label: 'Lowest amount' },
                  ]}
                />
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
          </CardContent>
        </Card>
        <Card
          role="region"
          aria-label="Bill list"
          aria-busy={isFetching}
          className="rounded-2xl py-0 shadow-sm"
        >
          <CardHeader className="border-b border-border bg-secondary/35 px-5 py-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-semibold tracking-tight">
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
          </CardHeader>
          <CardContent className="p-0">
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
              <p
                role="status"
                className="p-10 text-center text-muted-foreground"
              >
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
                    <Button
                      variant="ghost"
                      className="group h-auto min-w-0 flex-1 justify-start gap-3 px-0 py-1 text-left whitespace-normal sm:gap-4"
                      onClick={() => setDetail(bill._id)}
                    >
                      <span className="hidden size-11 shrink-0 place-items-center rounded-xl bg-secondary text-primary sm:grid">
                        <FileText className="size-5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold sm:text-base">
                          {bill.name}
                        </span>
                        <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                          {categoryLabel(bill.category)} · Due{' '}
                          {formatDate(bill.dueDate)}
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
                    </Button>
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
          </CardContent>
        </Card>
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
