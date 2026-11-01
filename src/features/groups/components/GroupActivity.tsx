import { PagePagination } from '@/components/ui/page-pagination';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { useGetGroupActivityQuery } from '../settingsApi';
const labels: Record<string, string> = {
  EXPENSE_ADDED: 'Added an expense',
  EXPENSE_EDITED: 'Edited an expense',
  EXPENSE_DELETED: 'Deleted an expense',
  BILL_PAID: 'Recorded a bill payment',
  GROUP_UPDATED: 'Updated group settings',
};
export default function GroupActivity({ id }: { id: string }) {
  const [page, setPage] = useState(1);
  const query = useGetGroupActivityQuery(
    { id, page },
    { refetchOnFocus: true },
  );
  const result = query.currentData?.data;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity history</CardTitle>
        <CardDescription>
          Expense changes, bill payments and group setting updates.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {query.isFetching ? (
          <p role="status">Loading activity…</p>
        ) : query.isError ? (
          <div role="alert">
            <p>Could not load activity.</p>
            <Button variant="outline" onClick={() => query.refetch()}>
              Try again
            </Button>
          </div>
        ) : !result?.activities.length ? (
          <p className="text-muted-foreground">
            No activity recorded on this page.
          </p>
        ) : (
          <ol className="flex flex-col divide-y">
            {result.activities.map((entry) => (
              <li
                key={entry._id}
                className="flex flex-col gap-1 py-4 first:pt-0"
              >
                <p className="font-medium">
                  {labels[entry.action] ?? 'Group activity'} · {entry.label}
                </p>
                <p className="text-sm text-muted-foreground">
                  {[entry.actor?.firstName, entry.actor?.lastName]
                    .filter(Boolean)
                    .join(' ') || 'Former member'}{' '}
                  ·{' '}
                  <time dateTime={entry.occurredAt}>
                    {new Date(entry.occurredAt).toLocaleString()}
                  </time>
                </p>
              </li>
            ))}
          </ol>
        )}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-sm" role="status">
            Page {page} of {Math.max(1, result?.pagination.totalPages ?? 1)}
          </span>
          <PagePagination
            aria-label="Group activity pages"
            page={page}
            totalPages={result?.pagination.totalPages ?? 1}
            disabled={query.isFetching}
            hasNextPage={
              !!result && !query.isError && page < result.pagination.totalPages
            }
            onPageChange={setPage}
          />
        </div>
      </CardContent>
    </Card>
  );
}
