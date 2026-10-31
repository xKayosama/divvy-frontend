import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';
import { PageHeader } from '@/components/shell/PageHeader';
import { Button } from '@/components/ui/button';
import { buttonVariants } from '@/components/ui/button-variants';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { apiMessage } from '@/services/api-error';
import { formatDate } from '@/lib/date';
import {
  useGetIncomingInvitationsQuery,
  useLookupInvitationMutation,
} from '../memberApi';
import {
  invitationStatus,
  normalizeInvitationCode,
  validInvitationCode,
} from '../lib/invitations';
import type { Invitation } from '../types';
import RespondInvitationDialog from '../components/RespondInvitationDialog';
import {
  MemberEmpty,
  MemberLoading,
  MemberQueryError,
} from '../components/MemberFeedback';

export default function InvitationsPage() {
  const email = useAppSelector((state) => state.auth.user?.email);
  const query = useGetIncomingInvitationsQuery(undefined, {
    pollingInterval: 30000,
    refetchOnFocus: true,
    refetchOnMountOrArgChange: true,
  });
  const [lookup, { isLoading }] = useLookupInvitationMutation();
  const [code, setCode] = useState('');
  const [attempted, setAttempted] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [found, setFound] = useState<{
    invitation: Invitation;
    code: string;
  } | null>(null);
  const [respond, setRespond] = useState<{
    invitation: Invitation;
    action: 'accept' | 'decline';
    code?: string;
  } | null>(null);
  const invitations = query.currentData?.data.invitations ?? [];
  async function find(event: FormEvent) {
    event.preventDefault();
    if (isLoading) return;
    setAttempted(true);
    setError('');
    setFound(null);
    if (!validInvitationCode(code)) return;
    try {
      const normalized = normalizeInvitationCode(code);
      const result = await lookup({ code: normalized }).unwrap();
      setFound({ invitation: result.data.invitation, code: normalized });
    } catch (cause) {
      setError(
        apiMessage(cause, 'Could not check this invitation. Please try again.'),
      );
    }
  }
  function invitationRow(invitation: Invitation, knownCode?: string) {
    const pending = invitationStatus(invitation) === 'PENDING';
    return (
      <div
        key={`${invitation.id}:${invitation.createdAt}`}
        className="flex flex-wrap items-center justify-between gap-3 p-5"
      >
        <div className="min-w-0 flex-1 basis-48">
          <h3 className="break-words font-semibold">{invitation.group.name}</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {invitation.group.currency} · Expires{' '}
            {formatDate(invitation.expiresAt)}
          </p>
          <p className="mt-1 break-words text-xs text-muted-foreground">
            Invited as {invitation.email}
          </p>
        </div>
        <Badge variant={pending ? 'secondary' : 'outline'}>
          {pending ? 'Pending' : invitationStatus(invitation).toLowerCase()}
        </Badge>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            disabled={!pending || query.isFetching}
            aria-label={`Decline invitation to ${invitation.group.name}`}
            onClick={() => setRespond({ invitation, action: 'decline' })}
          >
            Decline
          </Button>
          <Button
            disabled={!pending || query.isFetching}
            aria-label={`Accept invitation to ${invitation.group.name}`}
            onClick={() =>
              setRespond({ invitation, action: 'accept', code: knownCode })
            }
          >
            Review & accept
          </Button>
        </div>
      </div>
    );
  }
  return (
    <div className="mx-auto flex w-full max-w-330 flex-col gap-6 pb-6">
      <PageHeader
        eyebrow="Your shared spaces"
        title="Invitations"
        description="Review group invitations and choose which groups to join."
        action={
          <Link
            to="/groups"
            className={buttonVariants({ variant: 'outline', size: 'xl' })}
          >
            All groups
          </Link>
        }
      />
      {notice && (
        <Alert role="status">
          <AlertDescription>{notice}</AlertDescription>
        </Alert>
      )}
      <Card className="rounded-2xl py-0 shadow-sm">
        <CardHeader className="border-b bg-secondary/35 px-5 py-5">
          <CardTitle>Have an invitation code?</CardTitle>
          <CardDescription>
            Sign in as the invited email address. Checking a code does not join
            the group.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-5">
          <form
            onSubmit={find}
            noValidate
            className="flex flex-col gap-4 sm:flex-row sm:items-end"
          >
            <FieldGroup>
              <Field data-invalid={attempted && !validInvitationCode(code)}>
                <FieldLabel htmlFor="lookup-invitation-code">
                  Invitation code
                </FieldLabel>
                <Input
                  id="lookup-invitation-code"
                  value={code}
                  maxLength={64}
                  autoComplete="off"
                  spellCheck={false}
                  disabled={isLoading}
                  aria-invalid={attempted && !validInvitationCode(code)}
                  aria-describedby={
                    attempted && !validInvitationCode(code)
                      ? 'lookup-code-error'
                      : undefined
                  }
                  onChange={(event) => {
                    setCode(event.target.value);
                    setFound(null);
                    setError('');
                  }}
                />
                {attempted && !validInvitationCode(code) && (
                  <FieldError id="lookup-code-error">
                    Enter a valid 32-character invitation code.
                  </FieldError>
                )}
              </Field>
            </FieldGroup>
            <Button type="submit" size="xl" disabled={isLoading}>
              {isLoading ? 'Checking…' : 'Check code'}
            </Button>
          </form>
          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {found && (
            <div className="mt-4 rounded-xl border">
              {invitationRow(found.invitation, found.code)}
            </div>
          )}
        </CardContent>
      </Card>
      <Card className="rounded-2xl py-0 shadow-sm">
        <CardHeader className="border-b bg-secondary/35 px-5 py-5">
          <CardTitle>Invited groups</CardTitle>
          <CardDescription>
            Pending invitations for {email}. Up to 100 recent invitations.
          </CardDescription>
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
          ) : !invitations.length ? (
            <MemberEmpty
              title="No pending invitations"
              description="Ask a group owner to invite your email and share the invitation code with you."
            />
          ) : (
            <div className="divide-y divide-border">
              {invitations.map((invitation) => invitationRow(invitation))}
            </div>
          )}
        </CardContent>
      </Card>
      {respond && (
        <RespondInvitationDialog
          key={`${respond.invitation.id}:${respond.invitation.createdAt}:${respond.action}`}
          invitation={respond.invitation}
          action={respond.action}
          initialCode={respond.code}
          onClose={() => setRespond(null)}
          onRefresh={() => {
            setRespond(null);
            setFound(null);
            void query.refetch();
          }}
          onDone={(message) => {
            setRespond(null);
            setFound(null);
            setCode('');
            setAttempted(false);
            setNotice(message);
          }}
        />
      )}
    </div>
  );
}
