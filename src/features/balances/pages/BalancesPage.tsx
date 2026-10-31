import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { ArrowDownLeft, ArrowUpRight, Receipt } from 'lucide-react';
import { useAppSelector } from '@/app/hooks';
import { PageHeader } from '@/components/shell/PageHeader';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { buttonVariants } from '@/components/ui/button-variants';
import { currencyMoney } from '@/lib/finance/money';
import { accountId, personName } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { Group } from '@/features/groups/types';
import { useGetBalancesQuery } from '../balanceApi';
import {
  FinanceError,
  FinanceEmpty,
  FinanceLoading,
} from '../components/FinanceFeedback';
export default function BalancesPage() {
  const group = useAppSelector((state) => state.groups.selectedGroup);
  return group ? (
    <BalancesContent key={group.id} group={group} />
  ) : (
    <Navigate to="/groups" replace />
  );
}
function BalancesContent({ group }: { group: Group }) {
  const user = useAppSelector((state) => state.auth.user),
    query = useGetBalancesQuery(group.id, {
      pollingInterval: 30000,
      refetchOnFocus: true,
    });
  const [search, setSearch] = useState('');
  const data = query.currentData?.data,
    m = currencyMoney(group.currency),
    id = accountId(user);
  const mine = data?.members.find((member) => member.user?._id === id);
  const visible =
    data?.members.filter((member) =>
      `${personName(member.user)} ${member.user?.email ?? ''}`
        .toLowerCase()
        .includes(search.trim().toLowerCase()),
    ) ?? [];
  return (
    <div className="mx-auto flex w-full max-w-330 flex-col gap-6 pb-6">
      <PageHeader
        eyebrow={`${group.name} · Shared costs`}
        title="Balances"
        description="See each person’s expense share and remaining balance after repayments."
        action={
          <Link
            to="/settlements"
            className={buttonVariants({ variant: 'outline', size: 'xl' })}
          >
            View repayments
          </Link>
        }
      />
      {query.error ? (
        <FinanceError error={query.error} retry={() => query.refetch()} />
      ) : !data ? (
        <FinanceLoading />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                label: 'Group expenses',
                value: data.totalExpenses,
                detail: 'Purchases recorded for this group',
                icon: Receipt,
                tone: 'brand' as const,
              },
              {
                label: 'You owe',
                value: Math.max(-(mine?.net ?? 0), 0),
                detail: 'Your remaining balance to repay',
                icon: ArrowUpRight,
                tone: 'default' as const,
              },
              {
                label: 'You get back',
                value: Math.max(mine?.net ?? 0, 0),
                detail: 'Your remaining balance to receive',
                icon: ArrowDownLeft,
                tone: 'mint' as const,
              },
            ].map(({ label, value, detail, icon: Icon, tone }) => (
              <Card
                key={label}
                tone={tone}
                className="min-h-33 rounded-2xl py-0 shadow-sm"
              >
                <CardContent className="relative p-5">
                  <p
                    className={cn(
                      'pr-12 text-sm font-medium',
                      tone === 'brand'
                        ? 'text-white/80'
                        : 'text-muted-foreground',
                    )}
                  >
                    {label}
                  </p>
                  <span
                    className={cn(
                      'absolute right-5 top-5 flex size-10 items-center justify-center rounded-xl',
                      tone === 'brand'
                        ? 'bg-white/10 text-accent'
                        : 'bg-secondary text-primary',
                    )}
                  >
                    <Icon className="size-5" />
                  </span>
                  <p className="mt-3 break-words text-2xl font-semibold">
                    {m.format(value)}
                  </p>
                  <p
                    className={cn(
                      'mt-3 text-xs',
                      tone === 'brand'
                        ? 'text-white/80'
                        : 'text-muted-foreground',
                    )}
                  >
                    {detail}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
          <Card className="rounded-2xl py-0 shadow-sm">
            <CardHeader className="border-b bg-secondary/35 px-5 py-5">
              <CardTitle>Member balances</CardTitle>
              <CardDescription>
                Expense totals stay separate from repayments. A positive balance
                means this person gets money back.
              </CardDescription>
              <Input
                aria-label="Search balances"
                placeholder="Search names or email…"
                className="mt-3 h-11"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </CardHeader>
            <CardContent className="p-0">
              {!visible.length ? (
                <FinanceEmpty
                  title="No balances found"
                  description="Try another search, or add a shared expense to get started."
                />
              ) : (
                <ul className="divide-y divide-border">
                  {visible.map((balance) => (
                    <li
                      key={balance.user._id}
                      className="flex flex-col gap-4 p-5"
                    >
                      <div className="flex flex-wrap items-center gap-3">
                        <Avatar size="lg" aria-hidden="true">
                          <AvatarImage
                            src={balance.user.avatar ?? undefined}
                            alt=""
                          />
                          <AvatarFallback>
                            {balance.user.firstName?.charAt(0).toUpperCase() ||
                              '?'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="break-words font-medium">
                            {personName(balance.user)}
                            {balance.user._id === id ? ' (you)' : ''}
                          </p>
                          <p className="break-words text-xs text-muted-foreground">
                            {balance.user.email}
                          </p>
                        </div>
                        <div className="text-right">
                          <p
                            className={cn(
                              'text-lg font-semibold',
                              balance.net < 0
                                ? 'text-destructive'
                                : balance.net > 0
                                  ? 'text-primary'
                                  : 'text-muted-foreground',
                            )}
                          >
                            {m.format(Math.abs(balance.net))}
                          </p>
                          <Badge
                            variant={
                              balance.net === 0 ? 'outline' : 'secondary'
                            }
                          >
                            {balance.net > 0
                              ? 'Gets back'
                              : balance.net < 0
                                ? 'Owes'
                                : 'Settled'}
                          </Badge>
                        </div>
                      </div>
                      <dl className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
                        {[
                          ['Paid for expenses', balance.paid],
                          ['Expense share', balance.owed],
                          ['Repayments sent', balance.settlementPaid ?? 0],
                          [
                            'Repayments received',
                            balance.settlementReceived ?? 0,
                          ],
                        ].map(([label, value]) => (
                          <div key={String(label)}>
                            <dt className="text-muted-foreground">{label}</dt>
                            <dd className="mt-1 break-words font-medium">
                              {m.format(Number(value))}
                            </dd>
                          </div>
                        ))}
                      </dl>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
