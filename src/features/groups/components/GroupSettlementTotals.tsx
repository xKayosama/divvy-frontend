import { Badge } from '@/components/ui/badge';
import { useGetBalancesQuery } from '@/features/balances/balanceApi';
import { useGetSettlementSuggestionsQuery } from '@/features/settlements/settlementApi';
import { currencyMoney } from '@/lib/finance/money';
import type { Group } from '../types';

export default function GroupSettlementTotals({
  group,
  userId,
}: {
  group: Group;
  userId: string;
}) {
  const { currentData, isError } = useGetSettlementSuggestionsQuery(group.id, {
    refetchOnMountOrArgChange: true,
  });

  const money = currencyMoney(group.currency);
  let outgoing = 0;
  let incoming = 0;
  for (const { from, to, amount } of currentData?.data.settlements ?? []) {
    if (from._id === userId) outgoing += money.units(amount);
    if (to._id === userId) incoming += money.units(amount);
  }

  const hasNoOutstandingPayments =
    !!currentData && !isError && outgoing === 0 && incoming === 0;
  const balances = useGetBalancesQuery(group.id, {
    skip: !hasNoOutstandingPayments,
    refetchOnMountOrArgChange: true,
  });
  const member = balances.currentData?.data.members.find(
    ({ user }) => user._id === userId,
  );

  if (isError || !currentData) {
    return (
      <p className="mt-4 text-xs text-muted-foreground">
        {isError ? 'Balances unavailable' : 'Loading balances…'}
      </p>
    );
  }

  if (
    hasNoOutstandingPayments &&
    !balances.isFetching &&
    !balances.isError &&
    member &&
    member.net === 0 &&
    (member.settlementPaid > 0 || member.settlementReceived > 0)
  ) {
    return (
      <div className="mt-4">
        <Badge variant="secondary">Settled up</Badge>
      </div>
    );
  }

  return (
    <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
      <div>
        <dt className="text-xs text-muted-foreground">You owe</dt>
        <dd className="mt-1 font-semibold break-words tabular-nums">
          {money.format(outgoing / money.scale)}
        </dd>
      </div>
      <div>
        <dt className="text-xs text-muted-foreground">Owed to you</dt>
        <dd className="mt-1 font-semibold break-words text-primary tabular-nums">
          {money.format(incoming / money.scale)}
        </dd>
      </div>
    </dl>
  );
}
