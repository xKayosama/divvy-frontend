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
    <AlertDialog
      open
      onOpenChange={(value) => {
        if (!value && !isLoading) onClose();
      }}
    >
      <AlertDialogContent className="rounded-3xl bg-card p-6 text-card-foreground sm:max-w-md">
        <div className="grid size-12 place-items-center rounded-2xl bg-destructive/10 text-destructive">
          <Trash2 className="size-5" />
        </div>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl font-semibold">
            Delete expense?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This permanently removes “{expense.description}” and updates group
            balances.
            {expense.recurring
              ? ' Future entries from this schedule will stop. Existing occurrences will remain.'
              : ''}
          </AlertDialogDescription>
        </AlertDialogHeader>
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
          <AlertDialogCancel
            size="xl"
            variant="outline"
            disabled={isLoading}
            onClick={onClose}
          >
            Keep expense
          </AlertDialogCancel>
          <AlertDialogAction
            size="xl"
            variant="destructive"
            disabled={isLoading || !!expense.billId}
            onClick={submit}
          >
            {isLoading && (
              <Spinner data-icon="inline-start" aria-hidden="true" />
            )}
            {isLoading ? 'Deleting…' : 'Delete expense'}
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
