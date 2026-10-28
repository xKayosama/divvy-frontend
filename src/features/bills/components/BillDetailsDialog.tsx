import { FileText, Pencil, Repeat2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { formatLabel as categoryLabel, personName } from '@/lib/format';
import { currencyMoney } from '@/lib/finance/money';
import { apiMessage } from '@/services/api-error';
import { formatDate } from '@/lib/date';
import { useGetBillQuery } from '../billApi';
import type { Bill } from '../types';
import { billState } from '../lib/bill-state';
import BillStatusBadge from './BillStatusBadge';
export default function BillDetailsDialog({
  billId,
  groupId,
  currency,
  onClose,
  onEdit,
  onDelete,
  onPay,
  onSource,
  onExpense,
}: {
  billId: string;
  groupId: string;
  currency: string;
  onClose: () => void;
  onEdit: (bill: Bill) => void;
  onDelete: (bill: Bill) => void;
  onPay: (id: string) => void;
  onSource: (id: string) => void;
  onExpense: (id: string) => void;
}) {
  const {
    currentData: data,
    error,
    isFetching,
    refetch,
  } = useGetBillQuery(billId, { pollingInterval: 60000 });
  const bill = data?.data.bill,
    wrongGroup = !!bill && bill.groupId !== groupId;
  const state = bill ? billState(bill) : null;
  return (
    <Dialog
      open
      onOpenChange={(value) => {
        if (!value) onClose();
      }}
    >
      <DialogContent className="flex max-h-[92svh] flex-col gap-0 overflow-hidden rounded-3xl bg-card p-0 text-card-foreground sm:max-w-xl">
        <DialogHeader className="border-b p-6">
          <DialogTitle className="text-2xl font-semibold">
            Bill details
          </DialogTitle>
          <DialogDescription>
            Due date, schedule, and payment information.
          </DialogDescription>
        </DialogHeader>
        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-6">
          {error ? (
            <div role="alert" className="space-y-3">
              <p className="text-destructive">
                {apiMessage(error, 'We couldn’t load this bill.')}
              </p>
              <Button variant="outline" onClick={() => refetch()}>
                Try again
              </Button>
            </div>
          ) : wrongGroup ? (
            <p role="alert">
              This bill belongs to another group. Open its group first.
            </p>
          ) : !bill ? (
            <p role="status">Loading bill…</p>
          ) : (
            <>
              <section className="rounded-2xl bg-brand-spending p-5 text-white">
                <div className="flex justify-between gap-3">
                  <p className="text-xs uppercase tracking-wider text-accent">
                    {categoryLabel(bill.category)}
                  </p>
                  <FileText className="size-5 shrink-0 text-accent" />
                </div>
                <h3 className="mt-2 break-words text-xl font-semibold">
                  {bill.name}
                </h3>
                <p className="mt-5 break-words text-3xl font-semibold">
                  {currencyMoney(currency).format(bill.amount)}
                </p>
              </section>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <BillStatusBadge bill={bill} />
                <p className="text-xs text-muted-foreground">
                  Due {formatDate(bill.dueDate)} (UTC)
                </p>
              </div>
              <dl className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border p-3">
                  <dt className="text-xs text-muted-foreground">Category</dt>
                  <dd className="mt-1 text-sm font-medium">
                    {categoryLabel(bill.category)}
                  </dd>
                </div>
                <div className="rounded-xl border p-3">
                  <dt className="text-xs text-muted-foreground">Repeat</dt>
                  <dd className="mt-1 text-sm font-medium">
                    {bill.isRecurring && bill.recurrence
                      ? categoryLabel(bill.recurrence)
                      : 'Does not repeat'}
                  </dd>
                </div>
                {state === 'paid' && (
                  <>
                    <div className="rounded-xl border p-3">
                      <dt className="text-xs text-muted-foreground">Paid by</dt>
                      <dd className="mt-1 break-words text-sm font-medium">
                        {bill.paidBy ? personName(bill.paidBy) : 'Not recorded'}
                      </dd>
                    </div>
                    <div className="rounded-xl border p-3">
                      <dt className="text-xs text-muted-foreground">
                        Payment recorded (UTC)
                      </dt>
                      <dd className="mt-1 text-sm font-medium">
                        {bill.paidAt
                          ? formatDate(bill.paidAt)
                          : 'Date not recorded'}
                      </dd>
                    </div>
                  </>
                )}
              </dl>
              {bill.isRecurring && (
                <div className="rounded-xl bg-secondary p-4 text-sm leading-6 text-secondary-foreground">
                  <p className="mb-2 flex items-center gap-2 font-medium">
                    <Repeat2 className="size-4" />
                    Recurring source
                  </p>
                  <p>
                    Future unpaid occurrences are generated as each bill becomes
                    due. Existing occurrences retain their saved details.
                  </p>
                  {state === 'paid' ? (
                    <p className="mt-2">
                      The schedule continues after payment. Paid bills are
                      read-only, so this schedule can no longer be changed here.
                    </p>
                  ) : (
                    <p className="mt-2">
                      Edit this bill to change future amounts or turn off
                      repeat.
                    </p>
                  )}
                </div>
              )}
              {bill.recurrenceSourceId && (
                <div className="rounded-xl bg-secondary p-4 text-sm leading-6">
                  <p>
                    This bill was generated from a recurring schedule. Editing
                    this occurrence affects only this bill.
                  </p>
                  <Button
                    variant="outline"
                    className="mt-3"
                    onClick={() => onSource(bill.recurrenceSourceId!)}
                  >
                    View original bill
                  </Button>
                </div>
              )}
              {state === 'saved-payment' && (
                <p className="rounded-xl bg-secondary p-4 text-sm leading-6 text-secondary-foreground">
                  The payer and split are saved. Finish the existing payment;
                  editing and deletion are locked while it completes.
                </p>
              )}
              {state === 'paid' &&
                (bill.expenseId ? (
                  <Button
                    variant="outline"
                    className="h-11 w-full"
                    onClick={() => onExpense(bill.expenseId!)}
                  >
                    <FileText className="size-4" />
                    View linked expense
                  </Button>
                ) : (
                  <p className="rounded-xl bg-muted p-4 text-sm leading-6 text-muted-foreground">
                    This older paid bill has no linked expense. No additional
                    expense has been created for it.
                  </p>
                ))}
              {bill.notes && (
                <section>
                  <h3 className="mb-2 text-sm font-semibold">Notes</h3>
                  <p className="whitespace-pre-wrap break-words rounded-xl bg-muted p-4 text-sm leading-6">
                    {bill.notes}
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
          {bill && !error && !wrongGroup && (
            <>
              {state === 'unpaid' && (
                <>
                  <Button
                    variant="destructive"
                    disabled={isFetching}
                    onClick={() => onDelete(bill)}
                  >
                    <Trash2 className="size-4" />
                    Delete
                  </Button>
                  <Button
                    variant="outline"
                    disabled={isFetching}
                    onClick={() => onEdit(bill)}
                  >
                    <Pencil className="size-4" />
                    Edit bill
                  </Button>
                </>
              )}
              {state !== 'paid' && (
                <Button disabled={isFetching} onClick={() => onPay(bill._id)}>
                  {state === 'saved-payment'
                    ? 'Finish saved payment'
                    : 'Record payment'}
                </Button>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
