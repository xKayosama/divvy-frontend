import { FormSelect } from '@/components/ui/form-select';
import { useState } from 'react';
import { LoaderCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { currencyMoney } from '@/lib/finance/money';
import { apiMessage } from '@/services/api-error';
import { todayDate } from '@/lib/date';
import { formatLabel as categoryLabel } from '@/lib/format';
import type { Frequency } from '@/lib/finance/types';
import { useCreateBillMutation, useUpdateBillMutation } from '../billApi';
import { billCategories } from '../types';
import type { Bill, BillCategory, BillPayload } from '../types';
import { billState } from '../lib/bill-state';
export default function BillFormDialog({
  bill,
  groupId,
  currency,
  onClose,
  onSaved,
}: {
  bill?: Bill;
  groupId: string;
  currency: string;
  onClose: () => void;
  onSaved: (bill: Bill) => void;
}) {
  const [name, setName] = useState(bill?.name ?? '');
  const [amount, setAmount] = useState(bill ? String(bill.amount) : '');
  const [category, setCategory] = useState<BillCategory>(
    bill?.category ?? 'RENT',
  );
  const [dueDate, setDueDate] = useState(
    bill?.dueDate.slice(0, 10) ?? todayDate(),
  );
  const [frequency, setFrequency] = useState<Frequency | ''>(
    bill?.isRecurring ? (bill.recurrence ?? '') : '',
  );
  const [notes, setNotes] = useState(bill?.notes ?? '');
  const [error, setError] = useState('');
  const [create, creating] = useCreateBillMutation();
  const [update, updating] = useUpdateBillMutation();
  const busy = creating.isLoading || updating.isLoading;
  const money = currencyMoney(currency),
    locked = !!bill && billState(bill) !== 'unpaid';
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (busy || locked) return;
    setError('');
    if (!name.trim()) {
      setError('Enter a bill name.');
      return;
    }
    if (!money.valid(Number(amount))) {
      setError(
        `Enter a positive ${currency} amount with ${money.digits} decimal places or fewer.`,
      );
      return;
    }
    const body: BillPayload = {
      name: name.trim(),
      amount: Number(amount),
      category,
      dueDate,
      isRecurring: !!frequency,
      recurrence: frequency || null,
      notes: notes.trim(),
    };
    try {
      const response = bill
        ? await update({ billId: bill._id, body }).unwrap()
        : await create({ groupId, body }).unwrap();
      onSaved(response.data.bill);
      onClose();
    } catch (caught) {
      setError(
        apiMessage(caught, 'Could not save the bill. Please try again.'),
      );
    }
  }
  return (
    <Dialog
      open
      onOpenChange={(value) => {
        if (!value && !busy) onClose();
      }}
    >
      <DialogContent
        className="flex max-h-[92svh] flex-col gap-0 overflow-hidden rounded-3xl bg-card p-0 text-card-foreground sm:max-w-xl"
        showCloseButton={!busy}
      >
        <DialogHeader className="border-b p-6">
          <p className="text-xs font-semibold uppercase tracking-[.16em] text-primary">
            Upcoming bills · {currency}
          </p>
          <DialogTitle className="text-2xl font-semibold">
            {bill ? 'Edit bill' : 'Add a bill'}
          </DialogTitle>
          <DialogDescription>
            Keep track of what’s due. Record the payer and split when it’s paid.
          </DialogDescription>
        </DialogHeader>
        <form
          className="flex min-h-0 flex-1 flex-col"
          onSubmit={submit}
          aria-busy={busy}
        >
          <div className="min-h-0 flex-1 overflow-y-auto">
            <fieldset
              disabled={busy || locked}
              className="min-w-0 space-y-5 p-6"
            >
              <div className="space-y-2">
                <label htmlFor="bill-name" className="text-sm font-medium">
                  Bill name
                </label>
                <Input
                  id="bill-name"
                  className="h-11"
                  required
                  placeholder="e.g. Monthly electricity"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="bill-amount" className="text-sm font-medium">
                    Amount ({currency})
                  </label>
                  <Input
                    id="bill-amount"
                    className="h-11"
                    type="number"
                    min={money.step}
                    step={money.step}
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder={(0).toFixed(money.digits)}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="bill-due" className="text-sm font-medium">
                    Due date (UTC)
                  </label>
                  <Input
                    id="bill-due"
                    className="h-11"
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label
                    htmlFor="bill-category"
                    className="text-sm font-medium"
                  >
                    Category
                  </label>
                  <FormSelect
                    id="bill-category"
                    value={category}
                    onValueChange={(value) =>
                      setCategory(value as BillCategory)
                    }
                    options={billCategories.map((value) => ({
                      value,
                      label: categoryLabel(value),
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="bill-repeat" className="text-sm font-medium">
                    Repeat
                  </label>
                  <FormSelect
                    id="bill-repeat"
                    disabled={!!bill?.recurrenceSourceId}
                    value={frequency}
                    onValueChange={(value) =>
                      setFrequency(value as Frequency | '')
                    }
                    options={[
                      { value: '', label: 'Does not repeat' },
                      { value: 'WEEKLY', label: 'Weekly' },
                      { value: 'MONTHLY', label: 'Monthly' },
                      { value: 'YEARLY', label: 'Yearly' },
                    ]}
                  />
                </div>
              </div>
              {bill?.recurrenceSourceId ? (
                <p className="rounded-xl bg-secondary p-3 text-xs leading-5 text-secondary-foreground">
                  This is a generated occurrence. Changes affect this bill only.
                  Its original bill controls the schedule.
                </p>
              ) : (
                <p className="rounded-xl bg-secondary p-3 text-xs leading-5 text-secondary-foreground">
                  {frequency
                    ? 'New unpaid bills are generated automatically as each occurrence becomes due. A past start date can generate missed occurrences. Changes affect future bills; existing ones remain unchanged.'
                    : 'Choose a repeat schedule for regular costs such as rent or internet.'}
                </p>
              )}
              {bill?.isRecurring && (
                <p className="text-xs leading-5 text-muted-foreground">
                  Changing the due date shifts the future schedule. Turning off
                  repeat stops future generation and retains existing bills.
                </p>
              )}
              <div className="space-y-2">
                <label htmlFor="bill-notes" className="text-sm font-medium">
                  Notes (optional)
                </label>
                <textarea
                  id="bill-notes"
                  className="min-h-24 w-full rounded-xl border bg-card p-3 text-sm outline-none focus:border-primary"
                  placeholder="Account reference or anything the group should know"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </fieldset>
          </div>
          {(error || locked) && (
            <p
              role="alert"
              className="shrink-0 border-t bg-destructive/10 px-6 py-3 text-sm text-destructive"
            >
              {locked
                ? 'Paid bills and saved payments cannot be edited.'
                : error}
            </p>
          )}
          <div className="relative flex shrink-0 justify-end gap-3 border-t bg-card p-4">
            <Button
              type="button"
              variant="outline"
              disabled={busy}
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="h-10 px-5"
              disabled={busy || locked}
            >
              {busy && <LoaderCircle className="size-4 animate-spin" />}
              {busy ? 'Saving…' : bill ? 'Save changes' : 'Add bill'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
