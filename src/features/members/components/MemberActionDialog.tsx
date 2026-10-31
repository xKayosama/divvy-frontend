import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
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
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !busy) onClose();
      }}
    >
      <DialogContent className="sm:max-w-md" showCloseButton={!busy}>
        <DialogHeader>
          <DialogTitle>{title}?</DialogTitle>
          <DialogDescription>
            {action.type === 'remove'
              ? `${action.member.userId.firstName} ${action.member.userId.lastName} will lose access to this group. Existing expenses stay recorded.`
              : `${action.invitation.email} will no longer be able to accept this invitation.`}
          </DialogDescription>
        </DialogHeader>
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <DialogFooter>
          <Button variant="outline" disabled={busy} onClick={onClose}>
            Cancel
          </Button>
          <Button variant="destructive" disabled={busy} onClick={confirm}>
            {busy ? 'Working…' : title}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
