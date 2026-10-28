import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { apiMessage } from '@/features/expenses/lib/money';
import { useDeleteBillMutation } from '../billApi';
import { billState } from '../lib/bill-state';
import type { Bill } from '../types';
export default function DeleteBillDialog({
  bill,
  onClose,
  onDeleted,
}: {
  bill: Bill;
  onClose: () => void;
  onDeleted: () => void;
}) {
  const [remove, { isLoading }] = useDeleteBillMutation();
  const [error, setError] = useState('');
  const locked = billState(bill) !== 'unpaid';
  async function submit() {
    if (isLoading || locked) return;
    setError('');
    try {
      await remove(bill._id).unwrap();
      onDeleted();
      onClose();
    } catch (caught) {
      setError(apiMessage(caught, 'Could not delete the bill. Please retry.'));
    }
  }
  return (
    <Dialog
      open
      onOpenChange={(value) => {
        if (!value && !isLoading) onClose();
      }}
    >
      <DialogContent
        className="rounded-3xl bg-card p-6 text-card-foreground sm:max-w-md"
        showCloseButton={!isLoading}
      >
        <span className="grid size-12 place-items-center rounded-2xl bg-destructive/10 text-destructive">
          <Trash2 className="size-5" />
        </span>
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Delete bill?
          </DialogTitle>
          <DialogDescription>
            “{bill.name}” will be permanently removed.
            {bill.isRecurring
              ? ' Future generation will stop. Existing generated bills will remain.'
              : ''}
          </DialogDescription>
        </DialogHeader>
        {(error || locked) && (
          <p role="alert" className="text-sm text-destructive">
            {locked
              ? 'Paid bills and saved payments cannot be deleted.'
              : error}
          </p>
        )}
        <div className="flex justify-end gap-2">
          <Button variant="outline" disabled={isLoading} onClick={onClose}>
            Keep bill
          </Button>
          <Button
            variant="destructive"
            disabled={isLoading || locked}
            onClick={submit}
          >
            {isLoading ? 'Deleting…' : 'Delete bill'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
