import { FormSelect } from '@/components/ui/form-select';
import { useState } from 'react';
import { ShieldCheck, LoaderCircle } from 'lucide-react';
import { useAppSelector } from '@/app/hooks';
import { useGetGroupMembersQuery } from '@/features/members/memberApi';
import type { MemberUser } from '@/features/members/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { currencyMoney } from '@/lib/finance/money';
import { calculateSplit } from '@/lib/finance/split';
import { personName } from '@/lib/format';
import { splitLabels } from '@/lib/finance/types';
import type { Bill, PaymentPayload, PaymentSplit } from '../types';
import BillPaymentSummary from './BillPaymentSummary';

interface BillPaymentFormProps {
  bill: Bill;
  groupId: string;
  currency: string;
  busy: boolean;
  message: string;
  onMessage: (value: string) => void;
  onClose: () => void;
  confirm: (body: PaymentPayload, bill: Bill) => Promise<void>;
}
export default function BillPaymentForm(props: BillPaymentFormProps) {
  const {
    currentData: data,
    isError,
    refetch,
  } = useGetGroupMembersQuery(props.groupId);
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
}: BillPaymentFormProps & { members: MemberUser[] }) {
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
                <FormSelect
                  id="payment-payer"
                  value={payer}
                  onValueChange={setPayer}
                  required
                  disabled={!members.length}
                  placeholder="No active members"
                  options={members.map((member) => ({
                    value: member._id,
                    label: personName(member),
                  }))}
                />
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
