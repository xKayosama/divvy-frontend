import RecurringExpenseSchedule from './RecurringExpenseSchedule';
import { Pencil, Trash2, Repeat2, Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogHeader,
} from '@/components/ui/dialog';
import { useGetExpenseQuery } from '../expenseApi';
import {
  formatLabel as categoryLabel,
  personName,
  userId as participantId,
} from '@/lib/format';
import { splitLabels } from '@/lib/finance/types';
import type { Expense } from '../types';
import { currencyMoney } from '@/lib/finance/money';
import { apiMessage } from '@/services/api-error';
import { formatDate } from '@/lib/date';

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
                  ['Date (UTC)', formatDate(expense.date)],
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
                <RecurringExpenseSchedule
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
