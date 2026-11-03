import { toast } from '@/components/ui/toast-manager';
import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { ArrowRight, RefreshCw } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { api } from '@/services/api';
import { PageHeader } from '@/components/shell/PageHeader';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { buttonVariants } from '@/components/ui/button-variants';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { currencyMoney } from '@/lib/finance/money';
import { accountId, personName } from '@/lib/format';
import type { Group } from '@/features/groups/types';
import {
  FinanceError,
  FinanceEmpty,
  FinanceLoading,
} from '@/features/balances/components/FinanceFeedback';
import { useGetSettlementSuggestionsQuery } from '../settlementApi';
import {
  loadPaymentAttempt,
  storePaymentAttempt,
  removePaymentAttempt,
} from '../lib/payment-storage';
import type { RecordSettlementPayload, SuggestedSettlement } from '../types';
import RecordSettlementDialog from '../components/RecordSettlementDialog';
import SettlementHistory from '../components/SettlementHistory';
export default function SettlementsPage() {
  const group = useAppSelector((state) => state.groups.selectedGroup);
  const user = useAppSelector((state) => state.auth.user);
  const sender = accountId(user);
  return group && sender ? (
    <SettlementsContent
      key={`${group.id}:${sender}`}
      group={group}
      sender={sender}
    />
  ) : (
    <Navigate to="/groups" replace />
  );
}
function SettlementsContent({
  group,
  sender,
}: {
  group: Group;
  sender: string;
}) {
  const dispatch = useAppDispatch();
  const query = useGetSettlementSuggestionsQuery(group.id, {
    pollingInterval: 30000,
    refetchOnFocus: true,
  });
  const suggestions = query.currentData?.data.settlements ?? [],
    m = currencyMoney(group.currency);
  const [suggestion, setSuggestion] = useState<SuggestedSettlement | null>(
    null,
  );
  const [pending, setPending] = useState<RecordSettlementPayload | null>(() =>
    loadPaymentAttempt(group.id, sender),
  );
  const [recoverOpen, setRecoverOpen] = useState(false);
  const [notice, setNotice] = useState('');
  const refresh = async () => (await query.refetch().unwrap()).data.settlements;
  function remember(payload: RecordSettlementPayload) {
    storePaymentAttempt(group.id, sender, payload);
    setPending(payload);
  }
  function clear() {
    try {
      removePaymentAttempt(group.id, sender);
    } catch {
      /* A retained reference can only replay the same payment. */
    }
    setPending(null);
  }
  function done() {
    clear();
    toast.add({ title: 'Repayment recorded.', type: 'success' });
    setSuggestion(null);
    setRecoverOpen(false);
    setNotice('');
  }
  return (
    <div className="flex w-full flex-col gap-6 pb-6">
      <PageHeader
        eyebrow={`${group.name} · Settle shared costs`}
        title="Settlements"
        description="Review suggested repayments and record payments you have already sent."
        action={
          <Link
            to="/balances"
            className={buttonVariants({ variant: 'outline', size: 'xl' })}
          >
            View balances
          </Link>
        }
      />
      {notice && (
        <Alert role="status">
          <AlertDescription>{notice}</AlertDescription>
        </Alert>
      )}
      {pending && (
        <Alert>
          <AlertTitle>A payment save needs checking</AlertTitle>
          <AlertDescription className="flex flex-wrap items-center justify-between gap-3">
            <span>
              Resume the original save before recording another repayment. This
              avoids adding an interrupted payment twice.
            </span>
            <Button variant="outline" onClick={() => setRecoverOpen(true)}>
              Resume save
            </Button>
          </AlertDescription>
        </Alert>
      )}
      <Card className="rounded-2xl py-0 shadow-sm">
        <CardHeader className="border-b bg-secondary/35 px-5 py-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle>Suggested repayments</CardTitle>
              <CardDescription>
                Suggestions reflect current balances and recorded payments. Only
                the sender can record a repayment.
              </CardDescription>
            </div>
            <Button
              variant="outline"
              disabled={query.isFetching}
              onClick={() =>
                dispatch(
                  api.util.invalidateTags([
                    'Settlement',
                    'Balance',
                    'Dashboard',
                  ]),
                )
              }
            >
              <RefreshCw data-icon="inline-start" />
              Refresh repayments
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {query.error ? (
            <div className="p-5">
              <FinanceError error={query.error} retry={() => query.refetch()} />
            </div>
          ) : !query.currentData ? (
            <FinanceLoading />
          ) : !suggestions.length ? (
            <FinanceEmpty
              title="No suggested repayments"
              description="There are no suggested transfers among current members. Review balances for details."
            />
          ) : (
            <ul className="divide-y divide-border">
              {suggestions.map((item) => (
                <li
                  key={`${item.from._id}:${item.to._id}`}
                  className="flex flex-wrap items-center justify-between gap-4 p-5"
                >
                  <div className="flex min-w-0 flex-1 basis-56 items-center gap-3">
                    <Avatar aria-hidden="true">
                      <AvatarImage src={item.from.avatar ?? undefined} alt="" />
                      <AvatarFallback>
                        {item.from.firstName?.charAt(0).toUpperCase() || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="break-words text-sm font-medium">
                        {personName(item.from)}
                        {item.from._id === sender ? ' (you)' : ''}
                      </p>
                      <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                        <ArrowRight className="size-3" />
                        To {personName(item.to)}
                        {item.to._id === sender ? ' (you)' : ''}
                      </p>
                    </div>
                  </div>
                  <p className="text-xl font-semibold text-primary">
                    {m.format(item.amount)}
                  </p>
                  {item.from._id === sender ? (
                    <Button
                      disabled={!!pending || query.isFetching}
                      aria-label={`Record repayment to ${personName(item.to)}`}
                      onClick={() => {
                        setNotice('');
                        setSuggestion(item);
                      }}
                    >
                      Record repayment
                    </Button>
                  ) : (
                    <Badge variant="secondary">
                      {item.to._id === sender
                        ? 'You receive'
                        : 'Group repayment'}
                    </Badge>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
      <SettlementHistory groupId={group.id} currency={group.currency} />
      {(suggestion || recoverOpen) && (
        <RecordSettlementDialog
          groupId={group.id}
          currency={group.currency}
          sender={sender}
          suggestion={
            suggestion ??
            suggestions.find(
              (item) => item.from._id === sender && item.to._id === pending?.to,
            ) ??
            null
          }
          recovery={recoverOpen ? pending : null}
          refresh={refresh}
          onAttempt={remember}
          onClose={() => {
            setSuggestion(null);
            setRecoverOpen(false);
          }}
          onDone={done}
          onReset={async () => {
            await refresh();
            clear();
            setSuggestion(null);
            setRecoverOpen(false);
            setNotice(
              'Repayments refreshed. Check payment history before creating another record.',
            );
          }}
        />
      )}
    </div>
  );
}
