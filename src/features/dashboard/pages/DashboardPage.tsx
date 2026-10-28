import { Navigate, Link } from 'react-router-dom';
import {
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Car,
  CheckCircle2,
  CircleDollarSign,
  FileText,
  Film,
  HeartPulse,
  Home,
  MoreHorizontal,
  Receipt,
  ShoppingBag,
  ShoppingCart,
  Utensils,
  Wifi,
  Zap,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

import { useGetDashboardQuery } from '@/features/dashboard/dashboardApi';
import { useAppSelector } from '@/app/hooks';

const DashboardPage = () => {
  const selectedGroup = useAppSelector((state) => state.groups.selectedGroup);

  const groupId = selectedGroup?.id;

  const {
    currentData: data,
    isFetching,
    isError,
  } = useGetDashboardQuery(groupId ?? '', {
    skip: !groupId,
  });

  if (!groupId) {
    return <Navigate to="/groups" replace />;
  }

  if (isFetching && !data) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading dashboard...</p>
      </div>
    );
  }

  if (isError || !data?.success) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <p className="text-sm text-red-600">Failed to load dashboard.</p>
      </div>
    );
  }

  const { summary, balances, bills, recentExpenses, upcomingBills } = data.data;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: selectedGroup?.currency ?? 'PHP',
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat('en-PH', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(date));
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'FOOD':
        return Utensils;

      case 'RENT':
        return Home;

      case 'UTILITIES':
        return Zap;

      case 'INTERNET':
        return Wifi;

      case 'TRANSPORTATION':
        return Car;

      case 'GROCERIES':
        return ShoppingCart;

      case 'HEALTHCARE':
        return HeartPulse;

      case 'ENTERTAINMENT':
        return Film;

      case 'SHOPPING':
        return ShoppingBag;

      default:
        return MoreHorizontal;
    }
  };

  return (
    <div className="mx-auto w-full max-w-330 space-y-8">
      {/* Header */}
      <div>
        <Label
          htmlFor="Overview"
          className="text-xs font-semibold tracking-[0.18em] text-primary uppercase"
        >
          Overview
        </Label>

        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-foreground">
          Dashboard
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Here's an overview of your group expenses.
        </p>
      </div>

      {/* Summary Cards */}
      <section>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {/* Total Expenses */}
          <Card className="rounded-2xl border-border bg-card py-0 text-card-foreground shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Expenses
                  </p>

                  <p className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
                    {formatCurrency(summary.totalExpenses)}
                  </p>
                </div>

                <div className="flex size-10 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
                  <Receipt className="size-5" strokeWidth={1.8} />
                </div>
              </div>

              <p className="mt-3 text-xs text-muted-foreground">
                All group expenses
              </p>
            </CardContent>
          </Card>

          {/* Total Paid */}
          <Card className="rounded-2xl border-border bg-card py-0 text-card-foreground shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Paid
                  </p>

                  <p className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
                    {formatCurrency(summary.totalPaid)}
                  </p>
                </div>

                <div className="flex size-10 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
                  <ArrowUpRight className="size-5" strokeWidth={1.8} />
                </div>
              </div>

              <p className="mt-3 text-xs text-muted-foreground">
                Amount paid by members
              </p>
            </CardContent>
          </Card>

          {/* Total Owed */}
          <Card className="rounded-2xl border-border bg-card py-0 text-card-foreground shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Owed
                  </p>

                  <p className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
                    {formatCurrency(summary.totalOwed)}
                  </p>
                </div>

                <div className="flex size-10 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
                  <ArrowDownLeft className="size-5" strokeWidth={1.8} />
                </div>
              </div>

              <p className="mt-3 text-xs text-muted-foreground">
                Total participant shares
              </p>
            </CardContent>
          </Card>

          {/* Group Status */}
          <Card className="rounded-2xl border-0 bg-primary py-0 text-primary-foreground shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-primary-foreground/70">
                    Group Status
                  </p>

                  <p className="mt-3 text-2xl font-semibold tracking-tight">
                    {summary.totalExpenses > 0 ? 'Active' : 'All settled'}
                  </p>
                </div>

                <div className="flex size-10 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                  <CircleDollarSign className="size-5" strokeWidth={1.8} />
                </div>
              </div>

              <p className="mt-3 text-xs text-primary-foreground/60">
                Current group activity
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Balances + Recent Expenses */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Balances */}
        <Card className="rounded-2xl border-border bg-card py-0 shadow-sm">
          <CardHeader className="border-b border-border px-5 py-5">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold tracking-tight">
                  Balances
                </CardTitle>

                <p className="mt-1 text-sm text-muted-foreground">
                  See who owes and who is owed.
                </p>
              </div>

              <div className="flex size-9 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                <CircleDollarSign className="size-4" strokeWidth={1.8} />
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {balances.length === 0 ? (
              <div className="flex min-h-48 flex-col items-center justify-center px-5 text-center">
                <div className="flex size-11 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
                  <CircleDollarSign className="size-5" strokeWidth={1.8} />
                </div>

                <p className="mt-3 text-sm font-semibold text-foreground">
                  No balances available
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  Add an expense to start tracking balances.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {balances.map((balance) => {
                  const isOwed = balance.net > 0;
                  const isOwing = balance.net < 0;

                  return (
                    <div
                      key={balance.user._id}
                      className="flex items-center justify-between gap-4 px-5 py-4"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                          {balance.user.firstName.charAt(0).toUpperCase()}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-foreground">
                            {balance.user.firstName} {balance.user.lastName}
                          </p>

                          <p className="mt-0.5 text-xs text-muted-foreground">
                            Paid {formatCurrency(balance.paid)}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p
                          className={[
                            'text-sm font-semibold',
                            isOwed
                              ? 'text-primary'
                              : isOwing
                                ? 'text-destructive'
                                : 'text-muted-foreground',
                          ].join(' ')}
                        >
                          {isOwed ? '+' : isOwing ? '-' : ''}
                          {formatCurrency(Math.abs(balance.net))}
                        </p>

                        <p className="mt-0.5 text-[11px] text-muted-foreground">
                          {isOwed ? 'Gets back' : isOwing ? 'Owes' : 'Settled'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Expenses */}
        <Card className="rounded-2xl border-border bg-card py-0 shadow-sm">
          <CardHeader className="border-b border-border px-5 py-5">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold tracking-tight">
                  Recent Expenses
                </CardTitle>

                <p className="mt-1 text-sm text-muted-foreground">
                  Latest group transactions.
                </p>
              </div>

              <Button
                type="button"
                variant="ghost"
                className="hidden text-xs font-semibold sm:flex"
              >
                View all
                <ArrowRight className="ml-1 size-3.5" strokeWidth={2} />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {recentExpenses.length === 0 ? (
              <div className="flex min-h-48 flex-col items-center justify-center px-5 text-center">
                <div className="flex size-11 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
                  <Receipt className="size-5" strokeWidth={1.8} />
                </div>

                <p className="mt-3 text-sm font-semibold text-foreground">
                  No recent expenses
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  Your latest shared expenses will appear here.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {recentExpenses.map((expense) => {
                  const CategoryIcon = getCategoryIcon(expense.category);

                  return (
                    <div
                      key={expense._id}
                      className="flex items-center justify-between gap-4 px-5 py-4"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
                          <CategoryIcon className="size-4" strokeWidth={1.8} />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-foreground">
                            {expense.description}
                          </p>

                          <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                            <span>
                              {expense.paidBy.firstName}{' '}
                              {expense.paidBy.lastName}
                            </span>

                            <span>•</span>

                            <span className="flex items-center gap-1">
                              <CalendarDays
                                className="size-3"
                                strokeWidth={1.8}
                              />
                              {formatDate(expense.date)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0 text-right">
                        <p className="text-sm font-semibold text-foreground">
                          {formatCurrency(expense.amount)}
                        </p>

                        <p className="mt-0.5 text-[11px] text-muted-foreground">
                          {expense.category}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bills + Upcoming Bills */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Bills */}
        <Card className="rounded-2xl border-border bg-card py-0 shadow-sm">
          <CardHeader className="border-b border-border px-5 py-5">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold tracking-tight text-card-foreground">
                  Bills
                </CardTitle>

                <p className="mt-1 text-sm text-muted-foreground">
                  Current group bill status.
                </p>
              </div>

              <div className="flex size-9 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
                <FileText className="size-4" strokeWidth={1.8} />
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-5">
            <div className="grid grid-cols-3 gap-3">
              {/* Pending */}
              <Link
                to="/bills?status=PENDING"
                className="block rounded-xl bg-muted p-4"
              >
                <p className="text-xs font-medium text-muted-foreground">
                  Pending
                </p>

                <p className="mt-2 text-2xl font-semibold text-foreground">
                  {bills.pending}
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  {formatCurrency(bills.pendingAmount)}
                </p>
              </Link>

              {/* Overdue */}
              <Link
                to="/bills?status=OVERDUE"
                className="block rounded-xl bg-destructive/10 p-4"
              >
                <p className="text-xs font-medium text-destructive/80">
                  Overdue
                </p>

                <p className="mt-2 text-2xl font-semibold text-destructive">
                  {bills.overdue}
                </p>

                <p className="mt-1 text-xs text-destructive/70">
                  {formatCurrency(bills.overdueAmount)}
                </p>
              </Link>

              {/* Paid */}
              <Link
                to="/bills?view=history"
                className="block rounded-xl bg-secondary p-4"
              >
                <p className="text-xs font-medium text-secondary-foreground/70">
                  Paid
                </p>

                <p className="mt-2 text-2xl font-semibold text-secondary-foreground">
                  {bills.paid}
                </p>

                <p className="mt-1 text-xs text-secondary-foreground/70">
                  {formatCurrency(bills.paidAmount)}
                </p>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Bills */}
        <Card className="rounded-2xl border-border bg-card py-0 shadow-sm">
          <CardHeader className="border-b border-border px-5 py-5">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold tracking-tight text-card-foreground">
                  Upcoming Bills
                </CardTitle>

                <p className="mt-1 text-sm text-muted-foreground">
                  Bills that need your attention.
                </p>
              </div>

              <div className="flex size-9 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
                <CalendarDays className="size-4" strokeWidth={1.8} />
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {upcomingBills.length === 0 ? (
              <div className="flex min-h-48 flex-col items-center justify-center px-5 text-center">
                <div className="flex size-11 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
                  <CheckCircle2 className="size-5" strokeWidth={1.8} />
                </div>

                <p className="mt-3 text-sm font-semibold text-foreground">
                  No upcoming bills
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  You're all caught up for now.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {upcomingBills.map((bill) => (
                  <Link
                    to={`/bills?billId=${encodeURIComponent(bill._id)}`}
                    key={bill._id}
                    className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-secondary/50 focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
                        <FileText className="size-4" strokeWidth={1.8} />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-foreground">
                          {bill.name}
                        </p>

                        <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                          <CalendarDays className="size-3" strokeWidth={1.8} />
                          Due {formatDate(bill.dueDate)}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="text-sm font-semibold text-foreground">
                        {formatCurrency(bill.amount)}
                      </p>

                      <span className="mt-1 inline-flex rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold text-secondary-foreground">
                        {bill.status}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
