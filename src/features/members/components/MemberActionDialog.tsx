import { Spinner } from '@/components/ui/spinner';
import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from '@/components/ui/alert-dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { apiMessage } from '@/services/api-error';
import {
  useRemoveGroupMemberMutation,
  useRevokeInvitationMutation,
} from '../memberApi';
import { invitationVersion } from '../lib/invitations';
import type { Invitation, GroupMember } from '../types';

type Action =
  | { type: 'remove'; member: GroupMember }
  | { type: 'revoke'; invitation: Invitation };
export default function MemberActionDialog({
  groupId,
  action,
  onClose,
  onDone,
}: {
  groupId: string;
  action: Action;
  onClose: () => void;
  onDone: (message: string) => void;
}) {
  const [remove, removing] = useRemoveGroupMemberMutation();
  const [revoke, revoking] = useRevokeInvitationMutation();
  const [error, setError] = useState('');
  const busy = removing.isLoading || revoking.isLoading;
  const title =
    action.type === 'remove' ? 'Remove member' : 'Revoke invitation';
  async function confirm() {
    if (busy) return;
    setError('');
    try {
      if (action.type === 'remove')
        await remove({ groupId, userId: action.member.userId._id }).unwrap();
      else
        await revoke({
          groupId,
          ...invitationVersion(action.invitation),
        }).unwrap();
      onDone(
        action.type === 'remove' ? 'Member removed.' : 'Invitation revoked.',
      );
    } catch (cause) {
      setError(
        apiMessage(
          cause,
          'Could not complete the action. Refresh and try again.',
        ),
      );
    }
  }
  return (
    <AlertDialog
      open
      onOpenChange={(open) => {
        if (!open && !busy) onClose();
      }}
    >
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>{title}?</AlertDialogTitle>
          <AlertDialogDescription>
            {action.type === 'remove'
              ? `${action.member.userId.firstName} ${action.member.userId.lastName} will lose access to this group. Existing expenses stay recorded.`
              : `${action.invitation.email} will no longer be able to accept this invitation.`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel
            size="xl"
            variant="outline"
            disabled={busy}
            onClick={onClose}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            size="xl"
            variant="destructive"
            disabled={busy}
            onClick={confirm}
          >
            {busy && <Spinner data-icon="inline-start" aria-hidden="true" />}
            {busy ? 'Working…' : title}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
