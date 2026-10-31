import { useState } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FormSelect } from '@/components/ui/form-select';
import { formatDate } from '@/lib/date';
import { useGetOutgoingInvitationsQuery } from '../memberApi';
import { invitationStatus } from '../lib/invitations';
import type { Invitation } from '../types';
import { MemberEmpty, MemberLoading, MemberQueryError } from './MemberFeedback';

export default function OutgoingInvitations({
  groupId,
  onRevoke,
}: {
  groupId: string;
  onRevoke: (invitation: Invitation) => void;
}) {
  const query = useGetOutgoingInvitationsQuery(groupId, {
    pollingInterval: 30000,
    refetchOnFocus: true,
  });
  const [filter, setFilter] = useState('ALL');
  const invitations = query.currentData?.data.invitations ?? [];
  const visible = invitations.filter(
    (invite) => filter === 'ALL' || invitationStatus(invite) === filter,
  );
  return (
    <Card className="rounded-2xl py-0 shadow-sm">
      <CardHeader className="border-b bg-secondary/35 px-5 py-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle>Group invitations</CardTitle>
            <CardDescription>
              Up to 100 most recent invitations. Codes cannot be retrieved
              again.
            </CardDescription>
          </div>
          <div className="w-full sm:w-44">
            <FormSelect
              aria-label="Filter invitations"
              value={filter}
              onValueChange={setFilter}
              options={[
                'ALL',
                'PENDING',
                'ACCEPTED',
                'DECLINED',
                'REVOKED',
                'EXPIRED',
              ].map((value) => ({
                value,
                label:
                  value === 'ALL'
                    ? 'All invitations'
                    : value[0] + value.slice(1).toLowerCase(),
              }))}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {query.error ? (
          <div className="p-5">
            <MemberQueryError
              error={query.error}
              retry={() => query.refetch()}
            />
          </div>
        ) : !query.currentData ? (
          <MemberLoading />
        ) : !visible.length ? (
          <MemberEmpty
            title="No invitations here"
            description={
              filter === 'ALL'
                ? 'Invite someone using their email, then share the code with them.'
                : 'No invitations match this status.'
            }
          />
        ) : (
          <ul className="divide-y divide-border">
            {visible.map((invite) => {
              const status = invitationStatus(invite);
              return (
                <li
                  key={`${invite.id}:${invite.createdAt}`}
                  className="flex flex-wrap items-center justify-between gap-3 p-5"
                >
                  <div className="min-w-0 flex-1 basis-48">
                    <p className="break-words text-sm font-medium">
                      {invite.email}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Created {formatDate(invite.createdAt)} · Expires{' '}
                      {formatDate(invite.expiresAt)}
                    </p>
                  </div>
                  <Badge
                    variant={
                      status === 'ACCEPTED'
                        ? 'default'
                        : status === 'PENDING'
                          ? 'secondary'
                          : 'outline'
                    }
                  >
                    {status[0] + status.slice(1).toLowerCase()}
                  </Badge>
                  {status === 'PENDING' && (
                    <Button
                      variant="outline"
                      disabled={query.isFetching}
                      aria-label={`Revoke invitation for ${invite.email}`}
                      onClick={() => onRevoke(invite)}
                    >
                      Revoke
                    </Button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
