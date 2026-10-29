import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { PageHeader } from '@/components/shell/PageHeader';
import { FormSelect } from '@/components/ui/form-select';
import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import {
  ArrowDownLeft,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Plus,
  Receipt,
  Repeat2,
  Search,
  Wallet,
  X,
} from 'lucide-react';
import { useAppSelector } from '@/app/hooks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Group } from '@/features/groups/types';
import { useGetExpensesQuery } from '../expenseApi';
import type { Expense, ExpenseSort } from '../types';
import {
  formatLabel as categoryLabel,
  personName,
  userId as participantId,
} from '@/lib/format';
import { splitLabels } from '@/lib/finance/types';
import { expenseCategories } from '../types';
import { currencyMoney } from '@/lib/finance/money';
import { apiMessage } from '@/services/api-error';
import { formatDate } from '@/lib/date';
import ExpenseFormDialog from '../components/ExpenseFormDialog';
import ExpenseDetailsDialog from '../components/ExpenseDetailsDialog';
import DeleteExpenseDialog from '../components/DeleteExpenseDialog';

export default function ExpensesPage() {
  const group = useAppSelector((state) => state.groups.selectedGroup);
  return group ? (
    <GroupExpenses key={group.id} group={group} />
  ) : (
    <Navigate to="/groups" replace />
  );
}
interface Filters {
  search: string;
  category: string;
  startDate: string;
  endDate: string;
  sort: ExpenseSort;
  page: number;
}
const initialFilters: Filters = {
  search: '',
  category: '',
  startDate: '',
  endDate: '',
  sort: 'newest',
  page: 1,
};
function GroupExpenses({ group }: { group: Group }) {
  const userId = useAppSelector((state) => state.auth.user?._id);
  const [filters, setFilters] = useState(initialFilters);
  const [searchDraft, setSearchDraft] = useState('');
  const [form, setForm] = useState<Expense | 'new' | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<Expense | null>(null);
  const [notice, setNotice] = useState('');
  const badDates = !!(
    filters.startDate &&
    filters.endDate &&
    filters.startDate > filters.endDate
  );
  const {
    currentData: data,
    isFetching,
    error,
    refetch,
  } = useGetExpensesQuery(
    {
      groupId: group.id,
      page: filters.page,
      limit: 20,
      sort: filters.sort,
      ...(filters.search ? { search: filters.search } : {}),
      ...(filters.category ? { category: filters.category } : {}),
      ...(filters.startDate ? { startDate: filters.startDate } : {}),
      ...(filters.endDate ? { endDate: filters.endDate } : {}),
    },
    { skip: badDates },
  );
  const money = currencyMoney(group.currency);
  const expenses = badDates ? [] : (data?.data.expenses ?? []);
  const total = data?.pagination.total ?? 0;
  const pages = Math.max(1, data?.pagination.totalPages ?? 1);
  const pageUnits = expenses.reduce(
    (sum, expense) => sum + BigInt(money.units(expense.amount)),
    0n,
  );
  const ownUnits = expenses.reduce(
    (sum, expense) =>
      sum +
      expense.participants.reduce(
        (subtotal, participant) =>
          subtotal +
          (participantId(participant.userId) === userId
            ? BigInt(money.units(participant.amount))
            : 0n),
        0n,
      ),
    0n,
  );
  const activeFilters = !!(
    filters.search ||
    filters.category ||
    filters.startDate ||
    filters.endDate ||
    filters.sort !== 'newest'
  );
  function filter(patch: Partial<Filters>) {
    setFilters((current) => ({ ...current, ...patch, page: 1 }));
  }
  function clear() {
    setSearchDraft('');
    setFilters(initialFilters);
  }
  function openForm(expense: Expense | 'new') {
    setDetailId(null);
    setNotice('');
    setForm(expense);
  }
  return (
    <div className="mx-auto flex w-full max-w-330 flex-col gap-6 pb-6">
      <PageHeader
        eyebrow={`${group.name} · Shared spending`}
        title="Expenses"
        description="Every shared cost. Everyone’s fair share."
        action={
          <Button className="h-11 px-5" onClick={() => openForm('new')}>
            <Plus data-icon="inline-start" />
            Add expense
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
      <div className="grid gap-4 sm:grid-cols-3">
        <Card tone="brand" className="min-h-33 rounded-2xl py-0 shadow-sm">
          <CardContent className="relative p-5">
            <div className="flex items-center justify-between pr-12">
              <p className="text-sm text-white/80">Spending on this page</p>
              <span className="absolute right-5 top-5 flex size-10 items-center justify-center rounded-xl bg-white/10 text-accent">
                <Wallet className="size-5" />
              </span>
            </div>
            <p className="mt-3 break-words text-2xl font-semibold">
              {data && !badDates
                ? money.format(Number(pageUnits) / money.scale)
                : '—'}
            </p>
            <p className="mt-3 text-xs text-white/80">
              {expenses.length} visible entries · {group.currency}
            </p>
          </CardContent>
        </Card>
        <Card tone="mint" className="min-h-33 rounded-2xl py-0 shadow-sm">
          <CardContent className="relative p-5">
            <div className="flex items-center justify-between pr-12">
              <p className="text-sm font-medium text-muted-foreground">
                Expenses in this group
              </p>
              <span className="absolute right-5 top-5 flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Receipt className="size-5" />
              </span>
            </div>
            <p className="mt-3 text-2xl font-semibold tracking-tight text-primary">
              {data && !badDates ? total : '—'}
            </p>
            <p className="mt-3 text-xs text-muted-foreground">
              {activeFilters
                ? 'Expenses matching your filters'
                : 'All recorded expenses'}
            </p>
          </CardContent>
        </Card>
        <Card className="min-h-33 rounded-2xl py-0 shadow-sm">
          <CardContent className="relative p-5">
            <div className="flex items-center justify-between pr-12">
              <p className="text-sm font-medium text-muted-foreground">
                Your share on this page
              </p>
              <span className="absolute right-5 top-5 flex size-10 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                <ArrowDownLeft className="size-5" />
              </span>
            </div>
            <p className="mt-3 break-words text-2xl font-semibold tracking-tight">
              {data && !badDates
                ? money.format(Number(ownUnits) / money.scale)
                : '—'}
            </p>
            <p className="mt-3 text-xs text-muted-foreground">
              Your portion of the visible expenses
            </p>
          </CardContent>
        </Card>
      </div>
      <Card
        role="region"
        aria-label="Expense filters"
        className="rounded-2xl py-0 shadow-sm"
      >
        <CardContent className="flex flex-col gap-4 p-5">
          <form
            className="flex gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              filter({ search: searchDraft.trim() });
            }}
          >
            <div className="relative min-w-0 flex-1">
              <Search className="absolute left-3 top-3.5 size-4 text-muted-foreground" />
              <Input
                aria-label="Search expenses"
                type="search"
                maxLength={200}
                className="h-11 pl-10"
                placeholder="Search expense descriptions…"
                value={searchDraft}
                onChange={(event) => setSearchDraft(event.target.value)}
              />
            </div>
            <Button type="submit" className="h-11 px-4">
              Search
            </Button>
          </form>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <label className="space-y-2 text-xs font-medium">
              Category
              <FormSelect
                aria-label="Filter category"
                value={filters.category}
                onValueChange={(value) => filter({ category: value })}
                options={[
                  { value: '', label: 'All categories' },
                  ...expenseCategories.map((value) => ({
                    value,
                    label: categoryLabel(value),
                  })),
                ]}
              />
            </label>
            <label className="space-y-2 text-xs font-medium">
              From (UTC)
              <Input
                aria-label="From date"
                type="date"
                className="h-11 min-w-0"
                value={filters.startDate}
                max={filters.endDate || undefined}
                onChange={(event) => filter({ startDate: event.target.value })}
              />
            </label>
            <label className="space-y-2 text-xs font-medium">
              To (UTC)
              <Input
                aria-label="To date"
                type="date"
                className="h-11 min-w-0"
                value={filters.endDate}
                min={filters.startDate || undefined}
                onChange={(event) => filter({ endDate: event.target.value })}
              />
            </label>
            <label className="space-y-2 text-xs font-medium">
              Sort by
              <FormSelect
                aria-label="Sort expenses"
                value={filters.sort}
                onValueChange={(value) =>
                  filter({ sort: value as ExpenseSort })
                }
                options={[
                  { value: 'newest', label: 'Newest first' },
                  { value: 'oldest', label: 'Oldest first' },
                  { value: 'amount_high', label: 'Highest amount' },
                  { value: 'amount_low', label: 'Lowest amount' },
                ]}
              />
            </label>
          </div>
          {activeFilters && (
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs text-muted-foreground">
                {filters.search
                  ? `Searching all expenses for “${filters.search}”`
                  : 'Filters apply to all expenses before pagination.'}
              </p>
              <Button variant="ghost" onClick={clear}>
                <X className="size-3" />
                Clear filters
              </Button>
            </div>
          )}
          {badDates && (
            <p role="alert" className="text-sm text-destructive">
              The start date must be on or before the end date.
            </p>
          )}
        </CardContent>
      </Card>
      <Card
        role="region"
        aria-label="Expense list"
        aria-busy={isFetching}
        className="rounded-2xl py-0 shadow-sm"
      >
        <CardHeader className="border-b border-border bg-secondary/35 px-5 py-5">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-lg font-semibold tracking-tight">
              Expense history
            </h2>
            <p className="text-xs text-muted-foreground">
              {isFetching
                ? 'Updating…'
                : data
                  ? `${total} ${total === 1 ? 'expense' : 'expenses'}`
                  : ''}
            </p>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {badDates ? (
            <p className="p-10 text-center text-muted-foreground">
              Update your date range to see expenses.
            </p>
          ) : error ? (
            <div className="space-y-4 p-10 text-center" role="alert">
              <p className="text-destructive">
                {apiMessage(error, 'We couldn’t load expenses.')}
              </p>
              <Button variant="outline" onClick={() => refetch()}>
                Try again
              </Button>
            </div>
          ) : !data ? (
            <p role="status" className="p-10 text-center text-muted-foreground">
              Loading expenses…
            </p>
          ) : !expenses.length ? (
            <div className="px-5 py-14 text-center">
              <Receipt className="mx-auto mb-4 size-10 text-primary" />
              <h3 className="text-xl font-semibold">
                {filters.page > pages
                  ? 'No more expenses on this page'
                  : activeFilters
                    ? 'No matching expenses'
                    : 'Start with your first shared cost'}
              </h3>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
                {filters.page > pages
                  ? 'The list has changed. Return to the first page.'
                  : activeFilters
                    ? 'Try another description or clear the filters.'
                    : 'Add an expense and we’ll work out everyone’s share.'}
              </p>
              <Button
                variant="outline"
                className="mt-5"
                onClick={() =>
                  filters.page > pages
                    ? filter({})
                    : activeFilters
                      ? clear()
                      : openForm('new')
                }
              >
                {filters.page > pages
                  ? 'First page'
                  : activeFilters
                    ? 'Clear filters'
                    : 'Add your first expense'}
              </Button>
            </div>
          ) : (
            <div className="divide-y">
              {expenses.map((expense) => (
                <Button
                  variant="ghost"
                  key={expense._id}
                  className="group h-auto w-full justify-start gap-3 rounded-none px-4 py-4 text-left whitespace-normal sm:gap-4 sm:px-5"
                  onClick={() => setDetailId(expense._id)}
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-secondary text-primary">
                    <Receipt className="size-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold sm:text-base">
                      {expense.description}
                    </span>
                    <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                      {categoryLabel(expense.category)} ·{' '}
                      {formatDate(expense.date)}
                    </span>
                    <span className="mt-1 flex flex-wrap gap-x-2 gap-y-1 text-xs text-muted-foreground">
                      <span>Paid by {personName(expense.paidBy)}</span>
                      {(expense.recurring || expense.recurrenceSourceId) && (
                        <span className="inline-flex items-center gap-1 text-primary">
                          <Repeat2 className="size-3" />
                          {expense.recurring?.paused
                            ? 'Paused schedule'
                            : 'Recurring'}
                        </span>
                      )}
                      {expense.billId && (
                        <span className="text-primary">Paid bill</span>
                      )}
                    </span>
                  </span>
                  <span className="max-w-[42%] text-right">
                    <strong className="block break-words text-sm text-primary sm:text-base">
                      {money.format(expense.amount)}
                    </strong>
                    <span className="mt-1 block text-xs text-muted-foreground">
                      {splitLabels[expense.splitType]}
                    </span>
                  </span>
                  <ArrowUpRight className="hidden size-4 shrink-0 text-muted-foreground sm:block" />
                </Button>
              ))}
            </div>
          )}
          {data && !badDates && !error && (pages > 1 || filters.page > 1) && (
            <div className="flex flex-wrap items-center justify-between gap-3 border-t px-5 py-4">
              <p className="text-xs text-muted-foreground">
                Page {filters.page} of {pages} · {total} expenses
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  disabled={isFetching || filters.page <= 1}
                  onClick={() =>
                    setFilters((current) => ({
                      ...current,
                      page: current.page - 1,
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
                      page: current.page + 1,
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
      {form && (
        <ExpenseFormDialog
          expense={form === 'new' ? undefined : form}
          groupId={group.id}
          currency={group.currency}
          onClose={() => setForm(null)}
          onSaved={(expense) => {
            setNotice(
              `“${expense.description}” ${form === 'new' ? 'added' : 'updated'}. Balances will reflect this change.`,
            );
            if (form === 'new') filter({});
          }}
        />
      )}
      {detailId && (
        <ExpenseDetailsDialog
          expenseId={detailId}
          currency={group.currency}
          onClose={() => setDetailId(null)}
          onEdit={openForm}
          onDelete={(expense) => {
            setDetailId(null);
            setDeleting(expense);
          }}
          onOpenSource={setDetailId}
        />
      )}
      {deleting && (
        <DeleteExpenseDialog
          key={deleting._id}
          expense={deleting}
          onClose={() => setDeleting(null)}
          onDeleted={() => {
            filter({});
            setNotice('Expense deleted. Balances will reflect this change.');
          }}
        />
      )}
    </div>
  );
}
