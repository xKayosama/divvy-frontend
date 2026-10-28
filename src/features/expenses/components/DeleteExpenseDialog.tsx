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
import { useDeleteExpenseMutation } from '../expenseApi';
import type { Expense } from '../types';
import { apiMessage } from '@/services/api-error';
export default function DeleteExpenseDialog({
  expense,
  onClose,
  onDeleted,
}: {
  expense: Expense;
  onClose: () => void;
  onDeleted: () => void;
}) {
  const [remove, { isLoading }] = useDeleteExpenseMutation();
  const [error, setError] = useState('');
  async function submit() {
    if (isLoading || expense.billId) return;
    setError('');
    try {
      await remove(expense._id).unwrap();
      onDeleted();
      onClose();
    } catch (caught) {
      setError(
        apiMessage(caught, 'Could not delete this expense. Please try again.'),
      );
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
        <div className="grid size-12 place-items-center rounded-2xl bg-destructive/10 text-destructive">
          <Trash2 className="size-5" />
        </div>
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Delete expense?
          </DialogTitle>
          <DialogDescription>
            This permanently removes “{expense.description}” and updates group
            balances.
            {expense.recurring
              ? ' Future entries from this schedule will stop. Existing occurrences will remain.'
              : ''}
          </DialogDescription>
        </DialogHeader>
        {expense.billId && (
          <p className="text-sm text-destructive">
            Paid bill expenses cannot be deleted independently.
          </p>
        )}
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
        <div className="flex justify-end gap-2">
          <Button variant="outline" disabled={isLoading} onClick={onClose}>
            Keep expense
          </Button>
          <Button
            variant="destructive"
            disabled={isLoading || !!expense.billId}
            onClick={submit}
          >
            {isLoading ? 'Deleting…' : 'Delete expense'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
