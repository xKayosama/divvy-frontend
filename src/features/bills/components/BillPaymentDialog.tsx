import { useState } from 'react';
import BillPaymentSummary from './BillPaymentSummary';
import BillPaymentForm from './BillPaymentForm';
import { CheckCircle2, LoaderCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { apiMessage } from '@/services/api-error';
import { useGetBillQuery, usePayBillMutation } from '../billApi';
import { billState, samePaymentBill } from '../lib/bill-state';
import type { Bill, PaymentPayload } from '../types';

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
          <BillPaymentForm
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
