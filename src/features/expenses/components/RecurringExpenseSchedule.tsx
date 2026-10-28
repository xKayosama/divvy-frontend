import { useState } from 'react';
import { Repeat2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatLabel as categoryLabel } from '@/lib/format';
import { formatDate } from '@/lib/date';
import { apiMessage } from '@/services/api-error';
import { useUpdateExpenseRecurrenceMutation } from '../expenseApi';
import type { Expense } from '../types';

export default function RecurringExpenseSchedule({
  expense,
}: {
  expense: Expense;
}) {
  const schedule = expense.recurring!;
  const [endDate, setEndDate] = useState(schedule.endDate?.slice(0, 10) ?? '');
  const [error, setError] = useState('');
  const [change, { isLoading }] = useUpdateExpenseRecurrenceMutation();
  async function save(body: { paused?: boolean; endDate?: string | null }) {
    setError('');
    try {
      await change({ expenseId: expense._id, ...body }).unwrap();
    } catch (caught) {
      setError(apiMessage(caught));
    }
  }
  return (
    <section className="space-y-3 rounded-2xl border p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 font-semibold">
          <Repeat2 className="size-4 text-primary" />
          {categoryLabel(schedule.frequency)} schedule
        </h3>
        <span className="rounded-full bg-secondary px-2 py-1 text-xs text-secondary-foreground">
          {schedule.paused
            ? 'Paused'
            : schedule.nextDate
              ? 'Active'
              : 'Completed'}
        </span>
      </div>
      <p className="text-sm text-muted-foreground">
        {schedule.paused
          ? 'Automatic entries are paused.'
          : schedule.nextDate
            ? `Next entry: ${formatDate(schedule.nextDate)} (UTC)`
            : 'No future entries are scheduled.'}
      </p>
      {schedule.lastError && (
        <p className="text-sm text-destructive">{schedule.lastError}</p>
      )}
      <form
        className="flex flex-wrap items-end gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          void save({ endDate: endDate || null });
        }}
      >
        <label
          className="min-w-0 flex-1 space-y-2 text-xs font-medium"
          htmlFor="schedule-end"
        >
          Repeat until (optional)
          <input
            id="schedule-end"
            type="date"
            min={schedule.anchor.slice(0, 10)}
            className="block h-10 w-full rounded-xl border bg-card px-3 text-sm"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            disabled={isLoading}
          />
        </label>
        <Button type="submit" variant="outline" disabled={isLoading}>
          Save end date
        </Button>
      </form>
      <Button
        variant="outline"
        disabled={isLoading}
        onClick={() => save({ paused: !schedule.paused })}
      >
        {isLoading
          ? 'Updating…'
          : schedule.paused
            ? 'Resume schedule'
            : 'Pause schedule'}
      </Button>
      <p className="text-xs leading-5 text-muted-foreground">
        Resuming skips missed dates. Editing the original expense changes future
        entries; existing occurrences stay unchanged.
      </p>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </section>
  );
}
