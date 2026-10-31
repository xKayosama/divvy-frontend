import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Mail, UserPlus } from 'lucide-react';
import { useAppSelector } from '@/app/hooks';
import { PageHeader } from '@/components/shell/PageHeader';
import { Button } from '@/components/ui/button';
import { buttonVariants } from '@/components/ui/button-variants';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { FormSelect } from '@/components/ui/form-select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { formatDate } from '@/lib/date';
import type { Group } from '@/features/groups/types';
import { useGetGroupMembersQuery } from '../memberApi';
import { canManageMembers } from '../lib/invitations';
import type { GroupMember, Invitation } from '../types';
import InviteMemberDialog from '../components/InviteMemberDialog';
import MemberActionDialog from '../components/MemberActionDialog';
import OutgoingInvitations from '../components/OutgoingInvitations';
import {
  MemberEmpty,
  MemberLoading,
  MemberQueryError,
} from '../components/MemberFeedback';

export default function MembersPage() {
  const group = useAppSelector((state) => state.groups.selectedGroup);
  return group ? (
    <MembersContent key={group.id} group={group} />
  ) : (
    <Navigate to="/groups" replace />
  );
}
function MembersContent({ group }: { group: Group }) {
  const user = useAppSelector((state) => state.auth.user);
  const query = useGetGroupMembersQuery(group.id, {
    pollingInterval: 30000,
    refetchOnFocus: true,
  });
  const members = query.currentData?.data.members ?? [];
  const canManage = !query.error && canManageMembers(members, user);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('ALL');
  const [inviteOpen, setInviteOpen] = useState(false);
  const [action, setAction] = useState<
    | { type: 'remove'; member: GroupMember }
    | { type: 'revoke'; invitation: Invitation }
    | null
  >(null);
  const [notice, setNotice] = useState('');
  const accountId = user?._id || (user as { id?: string } | null)?.id;
  const visible = members.filter(
    (member) =>
      (role === 'ALL' || member.role === role) &&
      `${member.userId?.firstName ?? ''} ${member.userId?.lastName ?? ''} ${member.userId?.email ?? ''}`
        .toLowerCase()
        .includes(search.trim().toLowerCase()),
  );
  return (
    <div className="mx-auto flex w-full max-w-330 flex-col gap-6 pb-6">
      <PageHeader
        eyebrow={`${group.name} · People sharing costs`}
        title="Members"
        description="See your group and invite people to share expenses."
        action={
          <div className="flex flex-wrap gap-2">
            <Link
              to="/invitations"
              className={buttonVariants({ variant: 'outline', size: 'xl' })}
            >
              <Mail /> Your invitations
            </Link>
            {canManage && (
              <Button
                size="xl"
                disabled={query.isFetching}
                onClick={() => setInviteOpen(true)}
              >
                <UserPlus data-icon="inline-start" /> Invite member
              </Button>
            )}
          </div>
        }
      />
      {notice && (
        <Alert role="status">
          <AlertDescription>{notice}</AlertDescription>
        </Alert>
      )}
      {!canManage && query.currentData && !query.error && (
        <Alert>
          <AlertDescription>
            Only the group owner can invite or remove members. You can review
            invitations sent to you from Your invitations.
          </AlertDescription>
        </Alert>
      )}
      <Card className="rounded-2xl py-0 shadow-sm">
        <CardHeader className="border-b bg-secondary/35 px-5 py-5">
          <CardTitle>Group members</CardTitle>
          <CardDescription>
            {query.currentData
              ? `${members.length} active ${members.length === 1 ? 'member' : 'members'}`
              : 'Loading your group…'}
          </CardDescription>
          <div className="mt-3 flex flex-wrap gap-3">
            <Input
              aria-label="Search members"
              placeholder="Search names or email…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="h-11 min-w-0 flex-1 basis-48"
            />
            <div className="w-full sm:w-40">
              <FormSelect
                aria-label="Filter member role"
                value={role}
                onValueChange={setRole}
                options={[
                  { value: 'ALL', label: 'All roles' },
                  { value: 'OWNER', label: 'Owner' },
                  { value: 'MEMBER', label: 'Member' },
                ]}
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
              title="No members found"
              description="Try a different name, email or role filter."
            />
          ) : (
            <ul className="divide-y divide-border">
              {visible.map((member) => {
                const person = member.userId;
                const name = person
                  ? `${person.firstName} ${person.lastName}`
                  : 'Former member';
                const self = person?._id === accountId;
                return (
                  <li
                    key={member._id}
                    className="flex flex-wrap items-center gap-3 p-5"
                  >
                    <Avatar size="lg" aria-hidden="true">
                      <AvatarImage src={person?.avatar ?? undefined} alt="" />
                      <AvatarFallback>
                        {person?.firstName?.charAt(0).toUpperCase() || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1 basis-40">
                      <p className="break-words text-sm font-medium">
                        {name}
                        {self && ' (you)'}
                      </p>
                      <p className="mt-1 break-words text-xs text-muted-foreground">
                        {person?.email ?? 'Account unavailable'}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Joined {formatDate(member.joinedAt)}
                      </p>
                    </div>
                    <Badge
                      variant={
                        member.role === 'OWNER' ? 'default' : 'secondary'
                      }
                    >
                      {member.role === 'OWNER' ? 'Owner' : 'Member'}
                    </Badge>
                    {canManage &&
                      member.role !== 'OWNER' &&
                      !self &&
                      person && (
                        <Button
                          variant="outline"
                          disabled={query.isFetching}
                          aria-label={`Remove ${name}`}
                          onClick={() => setAction({ type: 'remove', member })}
                        >
                          Remove
                        </Button>
                      )}
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
      {canManage && (
        <OutgoingInvitations
          groupId={group.id}
          onRevoke={(invitation) => setAction({ type: 'revoke', invitation })}
        />
      )}
      {canManage && inviteOpen && (
        <InviteMemberDialog
          groupId={group.id}
          groupName={group.name}
          onClose={() => setInviteOpen(false)}
        />
      )}
      {canManage && action && (
        <MemberActionDialog
          key={
            action.type === 'remove'
              ? action.member._id
              : `${action.invitation.id}:${action.invitation.createdAt}`
          }
          groupId={group.id}
          action={action}
          onClose={() => setAction(null)}
          onDone={(message) => {
            setAction(null);
            setNotice(message);
          }}
        />
      )}
    </div>
  );
}
