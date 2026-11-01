import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { currencyMoney } from '@/lib/finance/money';
import { formatLabel } from '@/lib/format';
import { formatDate } from '@/lib/date';
import { spendingExpensesLink } from '../lib/spending';
import type { DashboardResponse } from '../types';
export default function SpendingCategories({
  data,
  currency,
}: {
  data: DashboardResponse['data'];
  currency: string;
}) {
  const { period, spendingByCategory, spendingComparison: comparison } = data;
  const money = currencyMoney(currency);
  return (
    <Card className="rounded-2xl py-0 shadow-sm">
      <CardHeader className="border-b bg-secondary/35 px-5 py-5">
        <CardTitle>Spending by category</CardTitle>
        <CardDescription>
          {period.startDate && period.endDate
            ? `${formatDate(period.startDate)} – ${formatDate(period.endDate)} (UTC)`
            : 'All recorded group expenses'}{' '}
          · {money.format(data.summary.totalExpenses)}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5 p-5">
        {comparison && (
          <div className="flex flex-col gap-1 rounded-xl bg-secondary p-4">
            <p className="text-sm font-medium">
              {comparison.direction === 'unchanged'
                ? 'Spending is unchanged'
                : `${money.format(Math.abs(comparison.difference))} ${comparison.direction === 'increase' ? 'more' : 'less'} spent`}
              {comparison.percentageChange !== null &&
              comparison.direction !== 'unchanged'
                ? ` (${Math.abs(comparison.percentageChange).toLocaleString('en-PH', { maximumFractionDigits: 2 })}%)`
                : ''}
            </p>
            <p className="text-xs text-muted-foreground">
              Compared with {formatDate(comparison.previous.startDate)} –{' '}
              {formatDate(comparison.previous.endDate)}:{' '}
              {money.format(comparison.previous.amount)}.
              {comparison.current.isInProgress
                ? ' This month is still in progress; the comparison uses the full previous month.'
                : ''}
              {comparison.percentageChange === null
                ? ' Percentage change is unavailable because the previous month had no spending.'
                : ''}
            </p>
          </div>
        )}
        {!spendingByCategory.length ? (
          <p className="text-sm text-muted-foreground">
            No spending in this period. Choose another period or add an expense.
          </p>
        ) : (
          <ul className="flex flex-col gap-4">
            {spendingByCategory.map((item) => (
              <li key={item.category}>
                <Link
                  to={spendingExpensesLink(period, item.category)}
                  className="flex flex-col gap-2 rounded-lg p-2 transition-colors hover:bg-secondary/50 focus-visible:outline-2 focus-visible:outline-ring"
                  aria-label={`View ${formatLabel(item.category)} expenses for this period`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-medium">
                      {formatLabel(item.category)}
                    </span>
                    <span className="text-sm font-semibold">
                      {money.format(item.amount)}
                    </span>
                  </div>
                  <div
                    className="h-2 overflow-hidden rounded-full bg-secondary"
                    aria-hidden="true"
                  >
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{
                        width: `${Math.max(0, Math.min(100, item.percentage))}%`,
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                    <span>
                      {item.count} {item.count === 1 ? 'expense' : 'expenses'} ·{' '}
                      {item.percentage.toLocaleString('en-PH', {
                        maximumFractionDigits: 2,
                      })}
                      % of spending
                    </span>
                    <ArrowRight
                      aria-hidden="true"
                      className="size-4 shrink-0"
                    />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
