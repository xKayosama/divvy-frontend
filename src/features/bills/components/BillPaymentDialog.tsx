import { useState } from 'react';
import { CheckCircle2, LoaderCircle, ShieldCheck } from 'lucide-react';
import { useAppSelector } from '@/app/hooks';
import { useGetHouseholdMembersQuery } from '@/features/members/memberApi';
import type { HouseholdMemberUser } from '@/features/members/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  currencyMoney,
  apiMessage,
  expenseDate,
} from '@/features/expenses/lib/money';
import { calculateSplit } from '@/features/expenses/lib/split';
import { personName, splitLabels } from '@/features/expenses/types';
import { useGetBillQuery, usePayBillMutation } from '../billApi';
import { billState, samePaymentBill } from '../lib/bill-state';
import type { Bill, PaymentPayload, PaymentSplit } from '../types';

export default function BillPaymentDialog({
  billId,
  groupId,
  currency,
  onClose,
  onPaid,
}: {
  billId: string;
  groupId: string;
  currency: string;
  onClose: () => void;
  onPaid: (bill: Bill) => void;
}) {
  const {
    currentData: data,
    error,
    refetch,
    isFetching,
  } = useGetBillQuery(billId);
  const [pay, { isLoading }] = usePayBillMutation();
  const [checking, setChecking] = useState(false),
    [message, setMessage] = useState('');
  const busy = isLoading || checking;
  const bill = data?.data.bill;
  async function confirm(body: PaymentPayload, snapshot: Bill) {
    if (busy) return;
    setMessage('');
    setChecking(true);
    try {
      const latest = await refetch().unwrap();
      const fresh = latest.data.bill;
      if (fresh.groupId !== groupId) {
        setMessage('This bill belongs to another group. Open its group first.');
        return;
      }
      if (billState(fresh) === 'paid') {
        onPaid(fresh);
        return;
      }
      if ('resume' in body) {
        if (billState(fresh) !== 'saved-payment') {
          setMessage(
            'There is no saved payment to finish. Review the latest bill.',
          );
          return;
        }
      } else if (billState(fresh) === 'saved-payment') {
        setMessage(
          'A payment was saved while you were reviewing. Finish its saved settings below.',
        );
        return;
      } else if (!samePaymentBill(snapshot, fresh)) {
        setMessage(
          'This bill changed. Review the updated amount and split before confirming.',
        );
        return;
      }
      const result = await pay({ billId, body }).unwrap();
      onPaid(result.data.bill);
    } catch (caught) {
      setMessage(
        apiMessage(
          caught,
          'Could not record the payment. Check the latest bill before retrying.',
        ),
      );
      await refetch();
    } finally {
      setChecking(false);
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
            Bill payment · {currency}
          </p>
          <DialogTitle className="text-2xl font-semibold">
            {bill && billState(bill) === 'saved-payment'
              ? 'Finish saved payment'
              : 'Record payment'}
          </DialogTitle>
          <DialogDescription>
            Record a payment you’ve already made. This adds one linked expense
            and updates group balances.
          </DialogDescription>
        </DialogHeader>
        {error ? (
          <div role="alert" className="space-y-3 p-6">
            <p className="text-destructive">
              {apiMessage(error, 'Could not refresh this bill.')}
            </p>
            <Button onClick={() => refetch()} variant="outline">
              Try again
            </Button>
          </div>
        ) : !bill ? (
          <p role="status" className="p-6">
            Loading bill…
          </p>
        ) : bill.groupId !== groupId ? (
          <p role="alert" className="p-6">
            This bill belongs to another group. Open its group first.
          </p>
        ) : billState(bill) === 'paid' ? (
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-6">
            <CheckCircle2 className="size-10 text-primary" />
            <p>
              This bill is already paid. No additional expense will be created.
            </p>
            <Button onClick={() => onPaid(bill)}>View paid bill</Button>
          </div>
        ) : billState(bill) === 'saved-payment' ? (
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-6">
            <BillPaymentSummary bill={bill} currency={currency} />
            <p className="rounded-xl bg-secondary p-4 text-sm leading-6 text-secondary-foreground">
              The payer and split are already saved. Finish that payment using
              the same settings. Retrying completes the original linked expense.
            </p>
            {message && (
              <p role="alert" className="text-sm text-destructive">
                {message}
              </p>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" disabled={busy} onClick={onClose}>
                Close
              </Button>
              <Button
                disabled={busy || isFetching}
                onClick={() => confirm({ resume: true }, bill)}
              >
                {busy && <LoaderCircle className="size-4 animate-spin" />}
                {busy ? 'Finishing…' : 'Finish saved payment'}
              </Button>
            </div>
          </div>
        ) : (
          <MemberPayment
            bill={bill}
            groupId={groupId}
            currency={currency}
            busy={busy}
            message={message}
            onMessage={setMessage}
            onClose={onClose}
            confirm={confirm}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
function BillPaymentSummary({
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
        Due {expenseDate(bill.dueDate)} (UTC)
      </p>
    </section>
  );
}
interface MemberProps {
  bill: Bill;
  groupId: string;
  currency: string;
  busy: boolean;
  message: string;
  onMessage: (value: string) => void;
  onClose: () => void;
  confirm: (body: PaymentPayload, bill: Bill) => Promise<void>;
}
function MemberPayment(props: MemberProps) {
  const {
    currentData: data,
    isError,
    refetch,
  } = useGetHouseholdMembersQuery(props.groupId);
  return isError ? (
    <div role="alert" className="space-y-3 p-6">
      <p>We couldn’t load active members.</p>
      <Button variant="outline" onClick={() => refetch()}>
        Retry members
      </Button>
    </div>
  ) : !data ? (
    <p role="status" className="p-6">
      Loading group members…
    </p>
  ) : (
    <PaymentForm
      key={`${props.bill._id}:${props.bill.amount}:${props.bill.updatedAt}`}
      {...props}
      members={data.data.members
        .filter((member) => member.userId && member.status === 'ACTIVE')
        .map((member) => member.userId)}
    />
  );
}
function PaymentForm({
  bill,
  currency,
  busy,
  message,
  onMessage,
  onClose,
  confirm,
  members,
}: MemberProps & { members: HouseholdMemberUser[] }) {
  const userId = useAppSelector((state) => state.auth.user?._id);
  const [payer, setPayer] = useState(
    members.find((member) => member._id === userId)?._id ??
      members[0]?._id ??
      '',
  );
  const [split, setSplit] = useState<PaymentSplit>('EQUAL');
  const [selected, setSelected] = useState(members.map((member) => member._id));
  const [values, setValues] = useState<Record<string, string>>({});
  const [review, setReview] = useState(false);
  const money = currencyMoney(currency);
  const participants = selected.map((userId) => ({
    userId,
    ...(split === 'EXACT'
      ? { amount: Number(values[userId] ?? 0) }
      : split === 'PERCENTAGE'
        ? { percentage: Number(values[userId] ?? 0) }
        : split === 'SHARES'
          ? { shares: Number(values[userId] ?? 1) }
          : { amount: 0 }),
  }));
  const preview = calculateSplit({
    amount: bill.amount,
    currency,
    splitType: split,
    participants,
  });
  const name = (id: string) =>
    personName(members.find((member) => member._id === id));
  const validMembers =
    members.some((member) => member._id === payer) &&
    selected.every((id) => members.some((member) => member._id === id));
  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (busy) return;
    onMessage('');
    if (!validMembers) {
      onMessage('Choose an active payer and participants.');
      return;
    }
    if (preview.error) {
      onMessage(preview.error);
      return;
    }
    if (!review) {
      setReview(true);
      return;
    }
    void confirm({ paidBy: payer, splitType: split, participants }, bill);
  }
  return (
    <form
      onSubmit={submit}
      className="flex min-h-0 flex-1 flex-col"
      aria-busy={busy}
    >
      <div className="min-h-0 flex-1 overflow-y-auto">
        <fieldset disabled={busy} className="min-w-0 space-y-5 p-6">
          <BillPaymentSummary bill={bill} currency={currency} />
          {review ? (
            <div className="space-y-4">
              <h3 className="flex items-center gap-2 font-semibold">
                <ShieldCheck className="size-5 text-primary" />
                Review payment
              </h3>
              <p className="rounded-xl bg-secondary p-4 text-sm leading-6 text-secondary-foreground">
                {name(payer)} paid {money.format(bill.amount)}. The bill will
                move to History, and one expense will be shared{' '}
                {splitLabels[split].toLowerCase()}.
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <label htmlFor="payment-payer" className="text-sm font-medium">
                  Who paid?
                </label>
                <select
                  id="payment-payer"
                  className="h-11 w-full rounded-xl border bg-card px-3 text-sm"
                  value={payer}
                  required
                  onChange={(e) => setPayer(e.target.value)}
                >
                  {!members.length && (
                    <option value="">No active members</option>
                  )}
                  {members.map((member) => (
                    <option key={member._id} value={member._id}>
                      {personName(member)}
                    </option>
                  ))}
                </select>
              </div>
              <section className="space-y-3">
                <h3 className="font-semibold">How should we split it?</h3>
                <div
                  className="grid grid-cols-2 gap-2 sm:grid-cols-4"
                  role="group"
                  aria-label="Payment split method"
                >
                  {(
                    ['EQUAL', 'EXACT', 'PERCENTAGE', 'SHARES'] as PaymentSplit[]
                  ).map((type) => (
                    <Button
                      key={type}
                      type="button"
                      variant={split === type ? 'default' : 'outline'}
                      className="h-10"
                      aria-pressed={split === type}
                      onClick={() => {
                        setSplit(type);
                        setValues({});
                        onMessage('');
                      }}
                    >
                      {splitLabels[type]}
                    </Button>
                  ))}
                </div>
                <div className="divide-y rounded-2xl border">
                  {members.map((member) => (
                    <div
                      key={member._id}
                      className="flex items-center gap-3 px-4 py-3"
                    >
                      <label className="flex min-w-0 flex-1 items-center gap-3 text-sm">
                        <input
                          type="checkbox"
                          className="size-4 accent-primary"
                          checked={selected.includes(member._id)}
                          onChange={() =>
                            setSelected((current) =>
                              current.includes(member._id)
                                ? current.filter((id) => id !== member._id)
                                : [...current, member._id],
                            )
                          }
                        />
                        <span className="truncate">{personName(member)}</span>
                      </label>
                      {selected.includes(member._id) && split !== 'EQUAL' && (
                        <Input
                          type="number"
                          className="w-28"
                          aria-label={`${splitLabels[split]} for ${personName(member)}`}
                          min={split === 'SHARES' ? 1 : 0}
                          max={
                            split === 'PERCENTAGE'
                              ? 100
                              : split === 'SHARES'
                                ? 1000000
                                : undefined
                          }
                          step={
                            split === 'SHARES'
                              ? 1
                              : split === 'PERCENTAGE'
                                ? 0.01
                                : money.step
                          }
                          placeholder={split === 'PERCENTAGE' ? '%' : undefined}
                          value={
                            values[member._id] ??
                            (split === 'SHARES' ? '1' : '')
                          }
                          onChange={(e) =>
                            setValues((current) => ({
                              ...current,
                              [member._id]: e.target.value,
                            }))
                          }
                        />
                      )}
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}
          <section
            aria-label="Payment split preview"
            aria-live="polite"
            className="rounded-2xl bg-secondary p-4"
          >
            <h3 className="mb-3 text-sm font-semibold text-secondary-foreground">
              Everyone’s share
            </h3>
            {preview.error ? (
              <p className="text-sm text-muted-foreground">{preview.error}</p>
            ) : (
              <div className="space-y-2">
                {preview.participants?.map((part) => (
                  <div
                    key={part.userId}
                    className="flex justify-between gap-3 text-sm"
                  >
                    <span className="min-w-0 break-words">
                      {name(part.userId)}
                    </span>
                    <strong className="shrink-0">
                      {money.format(part.amount)}
                    </strong>
                  </div>
                ))}
              </div>
            )}
          </section>
          <p className="text-xs leading-5 text-muted-foreground">
            This records a payment; it does not transfer money. The recording
            time is set by the server.
          </p>
        </fieldset>
      </div>
      {message && (
        <p
          role="alert"
          className="shrink-0 border-t bg-destructive/10 px-6 py-3 text-sm text-destructive"
        >
          {message}
        </p>
      )}
      <div className="relative flex shrink-0 justify-end gap-2 border-t bg-card p-4">
        <Button
          type="button"
          variant="outline"
          disabled={busy}
          onClick={() => (review ? setReview(false) : onClose())}
        >
          {review ? 'Back' : 'Cancel'}
        </Button>
        <Button
          type="submit"
          className="h-10 px-5"
          disabled={busy || !members.length}
        >
          {busy && <LoaderCircle className="size-4 animate-spin" />}
          {busy ? 'Recording…' : review ? 'Confirm payment' : 'Review payment'}
        </Button>
      </div>
    </form>
  );
}
