import { useState, type FormEvent } from 'react';
import { LoaderCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldDescription,
  FieldError,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { currencyMoney } from '@/lib/finance/money';
import { personName } from '@/lib/format';
import { apiMessage } from '@/services/api-error';
import { getStoredToken } from '@/services/session';
import { useRecordSettlementMutation } from '../settlementApi';
import {
  currentRepayment,
  localPaymentTime,
  paymentAmountError,
  paymentDateError,
  uncertainSave,
} from '../lib/payment';
import type { RecordSettlementPayload, SuggestedSettlement } from '../types';

export default function RecordSettlementDialog({
  groupId,
  currency,
  sender,
  suggestion,
  recovery,
  refresh,
  onAttempt,
  onClose,
  onDone,
  onReset,
}: {
  groupId: string;
  currency: string;
  sender: string;
  suggestion: SuggestedSettlement | null;
  recovery: RecordSettlementPayload | null;
  refresh: () => Promise<SuggestedSettlement[]>;
  onAttempt: (payload: RecordSettlementPayload) => void;
  onClose: () => void;
  onDone: () => void;
  onReset: () => Promise<void>;
}) {
  const m = currencyMoney(currency);
  const [amount, setAmount] = useState(
    String(suggestion?.amount ?? recovery?.amount ?? ''),
  );
  const [date, setDate] = useState(localPaymentTime());
  const [attempted, setAttempted] = useState(false);
  const [review, setReview] = useState(false);
  const [frozen, setFrozen] = useState<RecordSettlementPayload | null>(
    recovery,
  );
  const [error, setError] = useState('');
  const [uncertain, setUncertain] = useState(!!recovery);
  const [checking, setChecking] = useState(false);
  const [record, { isLoading }] = useRecordSettlementMutation();
  const busy = checking || isLoading;
  const amountError = paymentAmountError(
    amount,
    currency,
    suggestion?.amount ?? recovery?.amount ?? 0,
  );
  const dateError = paymentDateError(date);
  const recipient = suggestion?.to
    ? personName(suggestion.to)
    : 'the saved recipient';
  async function preflight() {
    if (!suggestion || suggestion.from._id !== sender)
      throw new Error('You can only record payments you sent.');
    const latest = await refresh();
    const current = currentRepayment(latest, sender, suggestion.to._id);
    if (!current || paymentAmountError(amount, currency, current.amount))
      throw new Error(
        'The outstanding balance changed. Close this dialog and review the updated repayments.',
      );
  }
  async function startReview(event: FormEvent) {
    event.preventDefault();
    if (busy || frozen) return;
    setAttempted(true);
    setError('');
    if (amountError || dateError) return;
    setChecking(true);
    try {
      await preflight();
      setReview(true);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : apiMessage(
              cause,
              'Could not refresh repayments. Please try again.',
            ),
      );
    } finally {
      setChecking(false);
    }
  }
  async function save(payload: RecordSettlementPayload) {
    const token = getStoredToken();
    setError('');
    try {
      await record({ groupId, body: payload }).unwrap();
      if (token && token === getStoredToken()) onDone();
    } catch (cause) {
      setUncertain(uncertainSave(cause));
      setError(
        apiMessage(
          cause,
          'The save could not be confirmed. Retry this same payment to check its status.',
        ),
      );
    }
  }
  async function confirm() {
    if (busy) return;
    if (frozen) {
      await save(frozen);
      return;
    }
    if (amountError || dateError) {
      setReview(false);
      setAttempted(true);
      return;
    }
    setChecking(true);
    setError('');
    try {
      await preflight();
      const payload = {
        to: suggestion!.to._id,
        amount: Number(amount),
        paidAt: new Date(date).toISOString(),
        requestId: crypto.randomUUID(),
      };
      onAttempt(payload);
      setFrozen(payload);
      setChecking(false);
      await save(payload);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : apiMessage(
              cause,
              'Could not prepare the payment. Please try again.',
            ),
      );
    } finally {
      setChecking(false);
    }
  }
  const shownAmount = frozen?.amount ?? Number(amount),
    shownDate = frozen?.paidAt ?? date;
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !busy) onClose();
      }}
    >
      <DialogContent className="sm:max-w-lg" showCloseButton={!busy}>
        <DialogHeader>
          <DialogTitle>
            {frozen
              ? 'Check payment save'
              : review
                ? 'Review repayment'
                : 'Record a repayment'}
          </DialogTitle>
          <DialogDescription>
            Record a payment you have already sent. Divvy does not transfer
            money.
          </DialogDescription>
        </DialogHeader>
        {frozen || review ? (
          <div className="flex flex-col gap-5">
            <dl className="grid gap-3 text-sm">
              <div>
                <dt className="text-muted-foreground">Recipient</dt>
                <dd className="mt-1 break-words font-medium">
                  {suggestion?.to ? recipient : `Member ${frozen?.to}`}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Amount</dt>
                <dd className="mt-1 text-xl font-semibold text-primary">
                  {m.format(shownAmount)}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Payment time</dt>
                <dd className="mt-1">
                  {new Date(shownDate).toLocaleString('en-PH')}
                </dd>
              </div>
            </dl>
            {frozen && (
              <Alert>
                <AlertTitle>
                  {uncertain
                    ? 'Save not yet confirmed'
                    : 'Payment needs review'}
                </AlertTitle>
                <AlertDescription>
                  {uncertain
                    ? 'Retry uses the same payment reference and details, so an already saved payment will not be added again. You can close and resume this check in this browser tab.'
                    : 'Retry to check this reference, or review the latest repayments and history before starting another record.'}
                </AlertDescription>
              </Alert>
            )}
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <DialogFooter>
              {!frozen && (
                <Button
                  variant="outline"
                  disabled={busy}
                  onClick={() => setReview(false)}
                >
                  Back
                </Button>
              )}
              {frozen && !uncertain && (
                <Button
                  variant="outline"
                  disabled={busy}
                  onClick={async () => {
                    setChecking(true);
                    try {
                      await onReset();
                    } catch (cause) {
                      setError(
                        apiMessage(
                          cause,
                          'Could not refresh repayments. Try again.',
                        ),
                      );
                    } finally {
                      setChecking(false);
                    }
                  }}
                >
                  Review updated repayments
                </Button>
              )}
              <Button disabled={busy} onClick={confirm}>
                {busy && (
                  <LoaderCircle
                    data-icon="inline-start"
                    className="animate-spin"
                  />
                )}
                {busy
                  ? 'Saving…'
                  : frozen
                    ? 'Retry same payment'
                    : 'Record payment'}
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <form
            noValidate
            onSubmit={startReview}
            className="flex flex-col gap-5"
          >
            <FieldGroup>
              <Field>
                <FieldLabel>Recipient</FieldLabel>
                <p className="break-words text-sm">{recipient}</p>
                <FieldDescription>
                  Current suggestion: {m.format(suggestion?.amount ?? 0)}. You
                  may record a partial repayment.
                </FieldDescription>
              </Field>
              <Field
                data-invalid={attempted && !!amountError}
                data-disabled={busy}
              >
                <FieldLabel htmlFor="settlement-amount">
                  Amount ({currency})
                </FieldLabel>
                <Input
                  id="settlement-amount"
                  value={amount}
                  inputMode="decimal"
                  disabled={busy}
                  aria-invalid={attempted && !!amountError}
                  aria-describedby={
                    attempted && amountError
                      ? 'settlement-amount-error'
                      : undefined
                  }
                  onChange={(event) => {
                    setAmount(event.target.value);
                    setError('');
                  }}
                />
                {attempted && amountError && (
                  <FieldError id="settlement-amount-error">
                    {amountError}
                  </FieldError>
                )}
              </Field>
              <Field
                data-invalid={attempted && !!dateError}
                data-disabled={busy}
              >
                <FieldLabel htmlFor="settlement-paid-at">
                  Payment time
                </FieldLabel>
                <Input
                  id="settlement-paid-at"
                  type="datetime-local"
                  value={date}
                  max={localPaymentTime()}
                  disabled={busy}
                  aria-invalid={attempted && !!dateError}
                  aria-describedby={
                    attempted && dateError
                      ? 'settlement-date-error'
                      : 'settlement-date-help'
                  }
                  onChange={(event) => {
                    setDate(event.target.value);
                    setError('');
                  }}
                />
                <FieldDescription id="settlement-date-help">
                  Use your local time. Future payments cannot be recorded.
                </FieldDescription>
                {attempted && dateError && (
                  <FieldError id="settlement-date-error">
                    {dateError}
                  </FieldError>
                )}
              </Field>
            </FieldGroup>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                disabled={busy}
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={busy}>
                {busy ? 'Checking…' : 'Review payment'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
