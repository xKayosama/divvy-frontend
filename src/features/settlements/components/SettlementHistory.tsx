import { PagePagination } from '@/components/ui/page-pagination';
import { useState } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { currencyMoney } from '@/lib/finance/money';
import { personName } from '@/lib/format';
import {
  FinanceError,
  FinanceEmpty,
  FinanceLoading,
} from '@/features/balances/components/FinanceFeedback';
import { useGetSettlementHistoryQuery } from '../settlementApi';
export default function SettlementHistory({
  groupId,
  currency,
}: {
  groupId: string;
  currency: string;
}) {
  const [page, setPage] = useState(1);
  const query = useGetSettlementHistoryQuery(
    { groupId, page, limit: 20 },
    {
      refetchOnFocus: true,
      refetchOnMountOrArgChange: true,
      pollingInterval: 30000,
    },
  );
  const data = query.currentData;
  const pages = Math.max(1, data?.pagination.totalPages ?? 1),
    m = currencyMoney(currency);
  return (
    <Card className="rounded-2xl py-0 shadow-sm">
      <CardHeader className="border-b bg-secondary/35 px-5 py-5">
        <CardTitle>Payment history</CardTitle>
        <CardDescription>
          Recorded repayments, newest payment time first.{' '}
          {data ? `${data.pagination.total} recorded payments.` : ''}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {query.error ? (
          <div className="p-5">
            <FinanceError error={query.error} retry={() => query.refetch()} />
          </div>
        ) : !data ? (
          <FinanceLoading />
        ) : !data.data.settlements.length ? (
          <>
            <FinanceEmpty
              title={
                page > pages
                  ? 'This page is no longer available'
                  : 'No recorded repayments'
              }
              description="Payments you record will appear here, separate from expenses."
            />
            {page > 1 && (
              <div className="px-5 pb-5">
                <Button variant="outline" onClick={() => setPage(1)}>
                  Go to first page
                </Button>
              </div>
            )}
          </>
        ) : (
          <ul className="divide-y divide-border">
            {data.data.settlements.map((payment) => (
              <li
                key={payment._id}
                className="flex flex-wrap items-center justify-between gap-3 p-5"
              >
                <div className="min-w-0 flex-1 basis-48">
                  <p className="break-words text-sm font-medium">
                    {personName(payment.from)} → {personName(payment.to)}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Paid {new Date(payment.paidAt).toLocaleString('en-PH')}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Recorded by {personName(payment.recordedBy)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-primary">
                    {m.format(payment.amount)}
                  </p>
                  <Badge variant="secondary">Recorded</Badge>
                </div>
              </li>
            ))}
          </ul>
        )}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t p-5">
          <p role="status" className="text-xs text-muted-foreground">
            {query.isFetching
              ? 'Updating history…'
              : `Page ${page} of ${pages}`}
          </p>
          <PagePagination
            aria-label="Settlement history pages"
            page={page}
            totalPages={pages}
            disabled={query.isFetching}
            hasNextPage={!query.error && page < pages}
            onPageChange={setPage}
          />
        </div>
      </CardContent>
    </Card>
  );
}
