import { useState } from 'react';
import { Pencil, Trash2, Repeat2, Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogHeader,
} from '@/components/ui/dialog';
import {
  useGetExpenseQuery,
  useUpdateExpenseRecurrenceMutation,
} from '../expenseApi';
import {
  categoryLabel,
  splitLabels,
  personName,
  participantId,
} from '../types';
import type { Expense } from '../types';
import { apiMessage, currencyMoney, expenseDate } from '../lib/money';

interface Props {
  expenseId: string;
  currency: string;
  onClose: () => void;
  onEdit: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
  onOpenSource: (id: string) => void;
}
export default function ExpenseDetailsDialog({
  expenseId,
  currency,
  onClose,
  onEdit,
  onDelete,
  onOpenSource,
}: Props) {
  const {
    currentData: data,
    isFetching,
    error,
    refetch,
  } = useGetExpenseQuery(expenseId);
  const expense = data?.data.expense;
  const money = currencyMoney(currency);
  const name = (id: string) => {
    const user = expense?.participants.find(
      (p) => participantId(p.userId) === id,
    )?.userId;
    return typeof user === 'object' ? personName(user) : 'Group member';
  };
  return (
    <Dialog
      open
      onOpenChange={(value) => {
        if (!value) onClose();
      }}
    >
      <DialogContent className="flex max-h-[90svh] flex-col gap-0 overflow-hidden rounded-3xl bg-card p-0 text-card-foreground sm:max-w-xl">
        <DialogHeader className="border-b p-6">
          <DialogTitle className="text-xl font-semibold">
            Expense details
          </DialogTitle>
          <DialogDescription>
            Who paid, what it covered, and how it was shared.
          </DialogDescription>
        </DialogHeader>
        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-6">
          {error ? (
            <div role="alert">
              <p className="mb-3 text-destructive">
                {apiMessage(error, 'Could not load this expense.')}
              </p>
              <Button variant="outline" onClick={() => refetch()}>
                Try again
              </Button>
            </div>
          ) : !expense ? (
            <p role="status">Loading expense…</p>
          ) : (
            <>
              <section className="rounded-2xl bg-brand-spending p-5 text-white">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs uppercase tracking-wider text-accent">
                      {categoryLabel(expense.category)}
                    </p>
                    <h3 className="mt-2 break-words text-xl font-semibold">
                      {expense.description}
                    </h3>
                  </div>
                  <Receipt className="size-5 shrink-0 text-accent" />
                </div>
                <p className="mt-5 break-words text-3xl font-semibold">
                  {money.format(expense.amount)}
                </p>
              </section>
              <div className="grid grid-cols-2 gap-3">
                {[
                  ['Paid by', personName(expense.paidBy)],
                  ['Date (UTC)', expenseDate(expense.date)],
                  ['Split method', splitLabels[expense.splitType]],
                  ['Currency', currency],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-xl border p-3">
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="mt-1 break-words text-sm font-medium">
                      {value}
                    </p>
                  </div>
                ))}
              </div>
              <section>
                <h3 className="mb-3 font-semibold">Everyone’s share</h3>
                <div className="divide-y rounded-2xl border">
                  {expense.participants.map((p) => (
                    <div
                      key={participantId(p.userId)}
                      className="flex items-center justify-between gap-3 px-4 py-3 text-sm"
                    >
                      <div className="min-w-0">
                        <p className="break-words">
                          {typeof p.userId === 'object'
                            ? personName(p.userId)
                            : 'Group member'}
                        </p>
                        {expense.splitType === 'SHARES' && (
                          <p className="text-xs text-muted-foreground">
                            {p.shares} shares
                          </p>
                        )}
                        {expense.splitType === 'PERCENTAGE' && (
                          <p className="text-xs text-muted-foreground">
                            {p.percentage}%
                          </p>
                        )}
                      </div>
                      <strong className="shrink-0 text-primary">
                        {money.format(p.amount)}
                      </strong>
                    </div>
                  ))}
                </div>
              </section>
              {expense.items && (
                <section className="space-y-3">
                  <h3 className="font-semibold">Item breakdown</h3>
                  {expense.items.map((item, index) => (
                    <div key={index} className="rounded-xl bg-muted p-3">
                      <div className="flex justify-between gap-3 text-sm">
                        <strong className="break-words">
                          {item.description}
                        </strong>
                        <span className="shrink-0">
                          {money.format(item.amount)}
                        </span>
                      </div>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        Quantity {item.quantity} ·{' '}
                        {item.memberIds.map(name).join(', ')}
                      </p>
                    </div>
                  ))}
                  {(['tax', 'tip'] as const).map(
                    (key) =>
                      expense.adjustments?.[key] && (
                        <p
                          key={key}
                          className="flex justify-between gap-3 text-sm"
                        >
                          <span>
                            {categoryLabel(key)} ·{' '}
                            {expense.adjustments[key]!.allocation === 'EQUAL'
                              ? 'equally'
                              : 'proportionally'}
                          </span>
                          <strong>
                            {money.format(expense.adjustments[key]!.amount)}
                          </strong>
                        </p>
                      ),
                  )}
                </section>
              )}
              {expense.recurring && (
                <Schedule
                  key={`${expense._id}:${expense.updatedAt}`}
                  expense={expense}
                />
              )}
              {expense.recurrenceSourceId && (
                <div className="rounded-xl bg-secondary p-4 text-sm">
                  <p>
                    This is an automatically recorded occurrence. Editing it
                    changes only this entry.
                  </p>
                  <Button
                    className="mt-3"
                    variant="outline"
                    onClick={() => onOpenSource(expense.recurrenceSourceId!)}
                  >
                    <Repeat2 className="size-4" />
                    View original schedule
                  </Button>
                </div>
              )}
              {expense.billId && (
                <p className="rounded-xl bg-secondary p-4 text-sm text-secondary-foreground">
                  This expense records a paid bill. It cannot be edited or
                  deleted independently.
                </p>
              )}
              {expense.notes && (
                <section>
                  <h3 className="mb-2 font-semibold">Notes</h3>
                  <p className="whitespace-pre-wrap break-words rounded-xl bg-muted p-4 text-sm leading-6">
                    {expense.notes}
                  </p>
                </section>
              )}
            </>
          )}
        </div>
        <div className="flex shrink-0 flex-wrap justify-end gap-2 border-t p-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {expense && !expense.billId && !error && (
            <>
              <Button
                variant="destructive"
                disabled={isFetching}
                onClick={() => onDelete(expense)}
              >
                <Trash2 className="size-4" />
                Delete
              </Button>
              <Button disabled={isFetching} onClick={() => onEdit(expense)}>
                <Pencil className="size-4" />
                Edit expense
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
function Schedule({ expense }: { expense: Expense }) {
  const schedule = expense.recurring!;
  const [endDate, setEndDate] = useState(schedule.endDate?.slice(0, 10) ?? '');
  const [error, setError] = useState('');
  const [change, { isLoading }] = useUpdateExpenseRecurrenceMutation();
  async function save(body: { paused?: boolean; endDate?: string | null }) {
    setError('');
    try {
      await change({ expenseId: expense._id, ...body }).unwrap();
    } catch (caught) {
      setError(apiMessage(caught));
    }
  }
  return (
    <section className="space-y-3 rounded-2xl border p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 font-semibold">
          <Repeat2 className="size-4 text-primary" />
          {categoryLabel(schedule.frequency)} schedule
        </h3>
        <span className="rounded-full bg-secondary px-2 py-1 text-xs text-secondary-foreground">
          {schedule.paused
            ? 'Paused'
            : schedule.nextDate
              ? 'Active'
              : 'Completed'}
        </span>
      </div>
      <p className="text-sm text-muted-foreground">
        {schedule.paused
          ? 'Automatic entries are paused.'
          : schedule.nextDate
            ? `Next entry: ${expenseDate(schedule.nextDate)} (UTC)`
            : 'No future entries are scheduled.'}
      </p>
      {schedule.lastError && (
        <p className="text-sm text-destructive">{schedule.lastError}</p>
      )}
      <form
        className="flex flex-wrap items-end gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          void save({ endDate: endDate || null });
        }}
      >
        <label
          className="min-w-0 flex-1 space-y-2 text-xs font-medium"
          htmlFor="schedule-end"
        >
          Repeat until (optional)
          <input
            id="schedule-end"
            type="date"
            min={schedule.anchor.slice(0, 10)}
            className="block h-10 w-full rounded-xl border bg-card px-3 text-sm"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            disabled={isLoading}
          />
        </label>
        <Button type="submit" variant="outline" disabled={isLoading}>
          Save end date
        </Button>
      </form>
      <Button
        variant="outline"
        disabled={isLoading}
        onClick={() => save({ paused: !schedule.paused })}
      >
        {isLoading
          ? 'Updating…'
          : schedule.paused
            ? 'Resume schedule'
            : 'Pause schedule'}
      </Button>
      <p className="text-xs leading-5 text-muted-foreground">
        Resuming skips missed dates. Editing the original expense changes future
        entries; existing occurrences stay unchanged.
      </p>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </section>
  );
}
