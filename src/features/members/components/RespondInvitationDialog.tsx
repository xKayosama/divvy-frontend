import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
  FieldDescription,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { apiMessage } from '@/services/api-error';
import { useRespondToInvitationMutation } from '../memberApi';
import {
  invitationVersion,
  normalizeInvitationCode,
  validInvitationCode,
} from '../lib/invitations';
import type { Invitation } from '../types';

export default function RespondInvitationDialog({
  invitation,
  action,
  initialCode = '',
  onClose,
  onDone,
  onRefresh,
}: {
  invitation: Invitation;
  action: 'accept' | 'decline';
  initialCode?: string;
  onClose: () => void;
  onDone: (message: string) => void;
  onRefresh: () => void;
}) {
  const [code, setCode] = useState(initialCode);
  const [attempted, setAttempted] = useState(false);
  const [error, setError] = useState('');
  const [stale, setStale] = useState(false);
  const [respond, { isLoading }] = useRespondToInvitationMutation();
  const accepting = action === 'accept';
  const invalid = accepting && !validInvitationCode(code);
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (isLoading || stale) return;
    setAttempted(true);
    setError('');
    if (invalid) return;
    try {
      await respond({
        ...invitationVersion(invitation),
        action,
        ...(accepting ? { code: normalizeInvitationCode(code) } : {}),
      }).unwrap();
      onDone(
        accepting
          ? `You joined ${invitation.group.name}. Select it from All groups to get started.`
          : 'Invitation declined.',
      );
    } catch (cause) {
      setError(apiMessage(cause, 'Could not respond. Please try again.'));
      setStale(
        !!cause &&
          typeof cause === 'object' &&
          'status' in cause &&
          [403, 404, 409, 410].includes(Number(cause.status)),
      );
    }
  }
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !isLoading) onClose();
      }}
    >
      <DialogContent className="sm:max-w-md" showCloseButton={!isLoading}>
        <DialogHeader>
          <DialogTitle>
            {accepting ? 'Join group' : 'Decline invitation'}?
          </DialogTitle>
          <DialogDescription>
            {invitation.group.name} · {invitation.group.currency} · Invited as{' '}
            {invitation.email}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} noValidate className="flex flex-col gap-5">
          {accepting ? (
            <FieldGroup>
              <Field
                data-invalid={attempted && invalid}
                data-disabled={isLoading}
              >
                <FieldLabel htmlFor="accept-code">Invitation code</FieldLabel>
                <Input
                  id="accept-code"
                  value={code}
                  disabled={isLoading || stale}
                  maxLength={64}
                  autoComplete="off"
                  spellCheck={false}
                  aria-invalid={attempted && invalid}
                  aria-describedby={
                    attempted && invalid
                      ? 'accept-code-error'
                      : 'accept-code-help'
                  }
                  onChange={(event) => {
                    setCode(event.target.value);
                    setError('');
                  }}
                />
                <FieldDescription id="accept-code-help">
                  Enter the 32-character code shared by the owner. Joining gives
                  this account access to the group’s shared expenses.
                </FieldDescription>
                {attempted && invalid && (
                  <FieldError id="accept-code-error">
                    Enter a valid 32-character invitation code.
                  </FieldError>
                )}
              </Field>
            </FieldGroup>
          ) : (
            <p className="text-sm text-muted-foreground">
              You will not join this group. Ask the owner for another invitation
              if you change your mind.
            </p>
          )}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <DialogFooter>
            <Button
              size="xl"
              type="button"
              variant="outline"
              disabled={isLoading}
              onClick={onClose}
            >
              Cancel
            </Button>
            {stale ? (
              <Button size="xl" type="button" onClick={onRefresh}>
                Refresh invitations
              </Button>
            ) : (
              <Button
                size="xl"
                type="submit"
                variant={accepting ? 'default' : 'destructive'}
                disabled={isLoading}
              >
                {isLoading
                  ? 'Working…'
                  : accepting
                    ? 'Accept invitation'
                    : 'Decline invitation'}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
