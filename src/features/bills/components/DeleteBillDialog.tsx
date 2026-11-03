import { Spinner } from '@/components/ui/spinner';
import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
} from '@/components/ui/alert-dialog';
import { apiMessage } from '@/services/api-error';
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
    <AlertDialog
      open
      onOpenChange={(value) => {
        if (!value && !isLoading) onClose();
      }}
    >
      <AlertDialogContent className="rounded-3xl bg-card p-6 text-card-foreground sm:max-w-md">
        <span className="grid size-12 place-items-center rounded-2xl bg-destructive/10 text-destructive">
          <Trash2 className="size-5" />
        </span>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl font-semibold">
            Delete bill?
          </AlertDialogTitle>
          <AlertDialogDescription>
            “{bill.name}” will be permanently removed.
            {bill.isRecurring
              ? ' Future generation will stop. Existing generated bills will remain.'
              : ''}
          </AlertDialogDescription>
        </AlertDialogHeader>
        {(error || locked) && (
          <p role="alert" className="text-sm text-destructive">
            {locked
              ? 'Paid bills and saved payments cannot be deleted.'
              : error}
          </p>
        )}
        <div className="flex justify-end gap-2">
          <AlertDialogCancel
            variant="outline"
            disabled={isLoading}
            onClick={onClose}
          >
            Keep bill
          </AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={isLoading || locked}
            onClick={submit}
          >
            {isLoading && (
              <Spinner data-icon="inline-start" aria-hidden="true" />
            )}
            {isLoading ? 'Deleting…' : 'Delete bill'}
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
